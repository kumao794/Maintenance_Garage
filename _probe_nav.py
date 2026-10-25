from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 430, "height": 900})
    page.goto("http://localhost:8000", wait_until="load")
    print("active-before", page.locator(".screen.active").get_attribute("id"))
    for name in ["fuel", "maintenance", "history", "home"]:
        page.locator(f'[data-screen="{name}"]').click()
        print(name, page.locator(".screen.active").get_attribute("id"))
    browser.close()
