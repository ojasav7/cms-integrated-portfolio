"""Probe: navbar translate property + pageerror stack."""
import asyncio
import json

from playwright.async_api import async_playwright

BASE = "http://localhost:3000"


async def main():
    errors = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1440, "height": 900})

        def on_err(e):
            msg = str(e)
            stack = getattr(e, "stack", "")
            errors.append({"msg": msg, "stack": (stack or "")[:600]})

        page.on("pageerror", on_err)

        await page.goto(f"{BASE}/", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.evaluate("document.getElementById('measured').scrollIntoView({ block: 'center' })")
        await page.wait_for_timeout(1500)
        nav1 = await page.evaluate("""() => {
            const h = document.querySelector('header')
            const cs = getComputedStyle(h)
            return { translate: cs.translate, opacity: cs.opacity }
        }""")
        await page.evaluate("window.scrollTo(0, 0)")
        await page.wait_for_timeout(1200)
        nav2 = await page.evaluate("""() => {
            const h = document.querySelector('header')
            const cs = getComputedStyle(h)
            return { translate: cs.translate, opacity: cs.opacity }
        }""")
        # slow scroll through the whole page to trigger any interaction errors
        for i in range(0, 6000, 400):
            await page.evaluate(f"window.scrollTo(0, {i})")
            await page.wait_for_timeout(120)
        print("NAVBAR in section:", json.dumps(nav1))
        print("NAVBAR at top:    ", json.dumps(nav2))
        print("ERRORS:", json.dumps(errors, indent=1)[:2000] if errors else "none")
        await browser.close()


asyncio.run(main())
