"""Production verification: measured section + testimonials tilt crash repro."""
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
            errors.append(str(e))

        page.on("pageerror", on_err)

        # --- Measured section (production build) ---
        await page.goto(f"{BASE}/", wait_until="networkidle")
        await page.wait_for_timeout(1500)
        await page.evaluate("document.getElementById('measured').scrollIntoView({ block: 'center' })")
        await page.wait_for_timeout(1200)
        sec = await page.evaluate("""() => {
            const sec = document.getElementById('measured')
            const h1 = sec.querySelector('h1')
            return { h1: h1.textContent,
                     size: getComputedStyle(h1).fontSize,
                     maskApplied: getComputedStyle(sec.querySelector('[data-spotlight-mask]')).maskImage !== 'none',
                     navHidden: getComputedStyle(document.querySelector('header')).opacity === '0' }
        }""")
        await page.mouse.move(1000, 700)
        await page.wait_for_timeout(1400)
        sec["maskTracked"] = await page.evaluate("""() => {
            const el = document.querySelector('#measured [data-spotlight-mask]')
            const nums = (getComputedStyle(el).maskPosition.match(/-?[0-9.]+/g) || []).map(Number)
            return Math.abs(nums[0] - 720) < 6 && Math.abs(nums[1] - 420) < 6
        }""")
        print("SECTION (production):", json.dumps(sec))

        # --- Testimonials tilt crash repro ---
        await page.evaluate("document.getElementById('testimonials').scrollIntoView({ block: 'center' })")
        await page.wait_for_timeout(1000)
        box = await page.evaluate("""() => {
            const card = document.querySelector('#testimonials [style*="preserve-3d"], #testimonials .rounded-3xl')
            if (!card) return null
            const r = card.getBoundingClientRect()
            return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), w: Math.round(r.width) }
        }""")
        crash = False
        if box:
            for i in range(6):
                await page.mouse.move(box["x"], box["y"])
                await page.wait_for_timeout(180)
                await page.mouse.move(box["x"] - 40, box["y"] - 40)
                await page.wait_for_timeout(150)
                if errors:
                    crash = True
                    break
            tilt = await page.evaluate("""() => {
                const card = document.querySelector('#testimonials .rounded-3xl')
                return card ? getComputedStyle(card).transform : null
            }""")
            print("TILT transform on card:", tilt)
        print("TESTIMONIALS CRASH:", crash)
        print("PAGEERRORS:", json.dumps(errors[:3]) if errors else "none")
        await browser.close()


asyncio.run(main())
