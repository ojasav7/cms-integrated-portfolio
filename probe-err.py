"""Hunt the transient 'str.includes is not a function' pageerror."""
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
            errors.append({"msg": str(e), "stack": (getattr(e, "stack", "") or "")[:800]})

        page.on("pageerror", on_err)

        # Replay the previous run's sequence
        await page.goto(f"{BASE}/", wait_until="networkidle")
        await page.wait_for_timeout(1500)
        await page.evaluate("document.getElementById('measured').scrollIntoView({ block: 'center' })")
        await page.wait_for_timeout(1200)
        await page.mouse.move(1000, 700)
        await page.wait_for_timeout(1400)
        await page.evaluate("window.scrollTo(0, 0)")
        await page.wait_for_timeout(1200)
        await page.evaluate("document.getElementById('contact').scrollIntoView({ block: 'start' })")
        await page.wait_for_timeout(1200)
        await page.set_viewport_size({"width": 390, "height": 844})
        await page.evaluate("document.getElementById('measured').scrollIntoView({ block: 'center' })")
        await page.wait_for_timeout(800)
        await page.click('#measured button[aria-label="Open menu"]')
        await page.wait_for_timeout(1100)
        await page.click('#measured button[aria-label="Close menu"]')
        await page.wait_for_timeout(600)
        await page.set_viewport_size({"width": 1440, "height": 900})
        await page.goto(f"{BASE}/projects/measured", wait_until="networkidle")
        await page.wait_for_timeout(800)
        await page.goto(f"{BASE}/", wait_until="networkidle")
        await page.wait_for_timeout(1200)

        print("ERRORS:", json.dumps(errors, indent=1)[:2200] if errors else "none")
        await browser.close()


asyncio.run(main())
