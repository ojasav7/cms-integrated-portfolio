"""Verify the Measured section embedded in the portfolio homepage."""
import asyncio
import json

from playwright.async_api import async_playwright

BASE = "http://localhost:3000"


async def main():
    errors, failed = [], []

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        page.on("console", lambda m: errors.append(f"console {m.type}: {m.text}") if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        page.on("requestfailed", lambda r: failed.append(r.url.split("/")[-1]) if "higgs.ai" not in r.url and "cloudfront" not in r.url and "figma.site" not in r.url and "youtube" not in r.url and "otf" not in r.url else None)

        await page.goto(f"{BASE}/", wait_until="networkidle")
        await page.wait_for_timeout(1500)

        # Navbar Measured link points at the section
        nav_link = await page.evaluate(
            """() => document.querySelector('header a[href="#measured"]')?.getAttribute('href')"""
        )
        print("NAVBAR measured link:", nav_link)

        # --- Scroll the Measured section into view ---
        await page.evaluate("document.getElementById('measured').scrollIntoView({ block: 'center' })")
        await page.wait_for_timeout(1200)

        section = await page.evaluate("""() => {
            const sec = document.getElementById('measured')
            const h1 = sec.querySelector('h1')
            const cs = getComputedStyle(h1)
            const rect = sec.getBoundingClientRect()
            return {
                h1: h1.textContent, family: cs.fontFamily, size: cs.fontSize,
                height: Math.round(rect.height), inViewport: rect.top < 900 && rect.bottom > 0,
            }
        }""")
        print("SECTION:", json.dumps(section))

        # Navbar should be hidden while the section is on screen
        navbar = await page.evaluate("""() => {
            const h = document.querySelector('header')
            const cs = getComputedStyle(h)
            return { transform: cs.transform, opacity: cs.opacity, hidden: cs.transform !== 'none' }
        }""")
        print("NAVBAR while section in view:", json.dumps(navbar))

        # Video should be playing while in view
        await page.wait_for_function(
            "() => { const v = document.querySelector('#measured video'); return v && v.readyState >= 2 }", timeout=20000)
        video_in = await page.evaluate("() => ({ paused: document.querySelector('#measured video').paused })")
        print("VIDEO while section in view:", json.dumps(video_in))

        # Spotlight mask + grid within the section
        await page.mouse.move(1000, 700)
        await page.wait_for_timeout(1400)
        fx = await page.evaluate("""() => {
            const el = document.querySelector('#measured [data-spotlight-mask]')
            const nums = (getComputedStyle(el).maskPosition.match(/-?[0-9.]+/g) || []).map(Number)
            const pat = document.querySelector('#measured [data-grid-pattern]')
            return { applied: getComputedStyle(el).maskImage !== 'none',
                     pos: getComputedStyle(el).maskPosition,
                     near: Math.abs(nums[0] - 720) < 6 && Math.abs(nums[1] - 420) < 6,
                     grid: pat.getAttribute('patternTransform') }
        }""")
        print("SPOTLIGHT+GRID:", json.dumps(fx))

        # Scroll back to the top — navbar reappears, video pauses
        await page.evaluate("window.scrollTo(0, 0)")
        await page.wait_for_timeout(1200)
        navbar_back = await page.evaluate("() => getComputedStyle(document.querySelector('header')).transform")
        video_out = await page.evaluate("() => document.querySelector('#measured video').paused")
        print("NAVBAR back at top (transform):", navbar_back)
        print("VIDEO paused when out of view:", video_out)

        # Scroll past the section — measured nav must scroll away (no fixed overlay)
        await page.evaluate("document.getElementById('contact').scrollIntoView({ block: 'start' })")
        await page.wait_for_timeout(1200)
        past = await page.evaluate("""() => {
            const sec = document.getElementById('measured')
            const rect = sec.getBoundingClientRect()
            return { sectionBottom: Math.round(rect.bottom), belowViewport: rect.bottom <= 0,
                     navVisible: !!document.querySelector('#measured header') }
        }""")
        print("PAST SECTION:", json.dumps(past))

        # --- Mobile: hamburger + menu inside the section ---
        await page.set_viewport_size({"width": 390, "height": 844})
        await page.evaluate("document.getElementById('measured').scrollIntoView({ block: 'center' })")
        await page.wait_for_timeout(800)
        await page.click('#measured button[aria-label="Open menu"]')
        await page.wait_for_timeout(1100)
        menu = await page.evaluate("""() => {
            const nav = document.querySelector('#measured nav[aria-label="Mobile"]')
            return { settled: [...nav.querySelectorAll('a')].every(i => Math.abs(parseFloat(getComputedStyle(i).opacity) - 1) < 0.05),
                     bodyOverflow: document.body.style.overflow }
        }""")
        print("MOBILE MENU:", json.dumps(menu))

        # --- Route regression ---
        await page.set_viewport_size({"width": 1440, "height": 900})
        resp = await page.goto(f"{BASE}/projects/measured", wait_until="networkidle")
        await page.wait_for_timeout(600)
        route = await page.evaluate("""() => ({
            h1: document.querySelector('h1')?.textContent,
            fixedNav: getComputedStyle(document.querySelector('header')).position,
        })""")
        print("ROUTE regression:", resp.status if resp else None, json.dumps(route))

        print("FAILED:", json.dumps(failed[:6]) if failed else "none")
        print("ERRORS:", json.dumps(errors[:6]) if errors else "none")
        await browser.close()


asyncio.run(main())
