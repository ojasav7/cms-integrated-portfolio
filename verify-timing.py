"""Measure scramble timing: when it starts, how long it runs, vs when heading is visible."""
from playwright.sync_api import sync_playwright

FINAL = "What\u00a0clients\u00a0say"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://localhost:3000/", wait_until="networkidle")
    page.wait_for_timeout(1000)

    offset = page.evaluate(
        "document.querySelector('#testimonials h2').getBoundingClientRect().top + window.scrollY"
    )
    # Park 140px below the fold, then scroll into the margin band slowly (like a user)
    page.evaluate(f"window.scrollTo(0, {offset - 1040})")
    page.wait_for_timeout(300)

    timeline = []
    start = None
    done = None
    for i in range(40):
        state = page.evaluate(
            """() => {
              const h = document.querySelector('#testimonials h2');
              return { top: Math.round(h.getBoundingClientRect().top), text: h.textContent };
            }"""
        )
        t_ms = i * 80  # ~80ms per sample
        is_final = state["text"] == FINAL
        if state["text"] != FINAL and start is None:
            start = t_ms
        if is_final and start is not None and done is None:
            done = t_ms
        timeline.append((t_ms, state["top"], "scrambled" if not is_final else "final"))
        if done is not None and state["top"] < 800:
            break
        page.evaluate("window.scrollBy(0, 20)")
        page.wait_for_timeout(60)

    print(f"scramble started at ~{start}ms after entering band, settled at ~{done}ms (duration ~{done - start if start is not None and done is not None else '?'}ms)")
    # Show the moment the heading became visible
    vis = next(((t, s) for t, s, st in timeline if s < 900), None)
    print("first visible at sample:", vis, "-> state:", dict((t, st) for t, s, st in timeline).get(vis[0]) if vis else None)
    for t, top, st in timeline:
        print(f"  {t:>4}ms top={top:>4} {st}")
    browser.close()
