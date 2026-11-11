#!/usr/bin/env python3
import os
import time
from playwright.sync_api import sync_playwright

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    screenshots_dir = os.path.join(root_dir, 'screenshots')
    os.makedirs(screenshots_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("1. Loading Hotstar App...")
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(1.5)

        # 1. Homepage & Hero
        print("Capturing 01-hotstar-homepage.png...")
        page.screenshot(path=os.path.join(screenshots_dir, "01-hotstar-homepage.png"))

        # 2. Open Media Detail Modal via Info button on Hero banner
        print("Capturing 02-media-detail-modal.png...")
        page.locator('button[title="More Information"]').click()
        time.sleep(1.0)
        page.screenshot(path=os.path.join(screenshots_dir, "02-media-detail-modal.png"))

        # 3. Vidly Player Modal (click Play Now inside the open modal)
        print("Capturing 03-vidly-pro-player.png...")
        play_inside_modal = page.locator('div.fixed.inset-0.z-50 button:has-text("Play")').first
        if play_inside_modal.is_visible():
            play_inside_modal.click()
        time.sleep(1.5)
        page.screenshot(path=os.path.join(screenshots_dir, "03-vidly-pro-player.png"))

        # Close player modal via explicit Back to Browse / Close button
        back_btn = page.locator('button[title="Back to Browse"]').first
        if back_btn.is_visible():
            back_btn.click()
        time.sleep(0.5)

        # Close detail modal via explicit close button
        close_modal_btn = page.locator('button[title="Close"]').first
        if close_modal_btn.is_visible():
            close_modal_btn.click()
        time.sleep(0.5)

        # 4. Search Overlay - click search button
        print("Capturing 04-search-overlay.png...")
        page.locator('aside nav button').first.click()
        time.sleep(0.8)
        search_input = page.locator('input[placeholder*="Search"]')
        if search_input.is_visible():
            search_input.fill("Stranger")
            time.sleep(0.8)
        page.screenshot(path=os.path.join(screenshots_dir, "04-search-overlay.png"))

        # Close search modal via search modal's close button
        close_search = page.locator('button[title="Close search"]')
        if close_search.is_visible():
            close_search.click()
        else:
            page.locator('div.fixed.inset-0.z-50 button').first.click()
        time.sleep(0.5)

        # 5. My Space
        print("Capturing 05-my-space-watchlist.png...")
        page.locator('aside nav button').nth(5).click()
        time.sleep(0.8)
        page.screenshot(path=os.path.join(screenshots_dir, "05-my-space-watchlist.png"))

        browser.close()
        print("All screenshots successfully captured!")

if __name__ == '__main__':
    main()
