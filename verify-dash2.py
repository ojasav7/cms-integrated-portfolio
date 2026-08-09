"""Verify the refactored dashboard: counts, sidebar active state, no errors."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    errors = []
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))

    page.goto("http://localhost:3000/admin", wait_until="networkidle")
    page.fill('input[type="password"]', "testpass")
    page.click('button[type="submit"]')
    page.wait_for_url("**/admin**", timeout=10000)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(400)

    mid = page.evaluate(
        """() => Array.from(document.querySelectorAll('main .rounded-2xl .font-display'))
              .filter(el => /^\\d+$/.test(el.textContent.trim()))
              .map(el => el.textContent)"""
    )
    page.wait_for_timeout(2500)
    final = page.evaluate(
        """() => Array.from(document.querySelectorAll('main .rounded-2xl .font-display'))
              .filter(el => /^\\d+$/.test(el.textContent.trim()))
              .map(el => el.textContent)"""
    )
    print("mid:", mid, "| final:", final, "| count-up:", any(a != b for a, b in zip(mid, final)))

    # Sidebar: Dashboard link should carry the active classes on /admin
    active = page.evaluate(
        """() => {
          const link = Array.from(document.querySelectorAll('a[href="/admin"]'))
            .find(a => a.textContent.includes('Dashboard'));
          return link ? link.className : null;
        }"""
    )
    print("dashboard link classes:", active)
    print("active-state OK:", bool(active and "bg-muted" in active and "font-medium" in active))
    print("errors:", errors if errors else "NONE")
    browser.close()
