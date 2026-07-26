import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.setViewportSize({ width: 1280, height: 1600 });
    await page.goto('http://localhost:8888');
    await page.waitForTimeout(2000);

    // Evaluate navigation to hebrew gematria directly
    await page.evaluate(() => {
        window.history.pushState({}, '', '/hebrew-gematria');
        window.dispatchEvent(new PopStateEvent('popstate'));
    });

    await page.waitForTimeout(1500);

    try {
        const input = page.locator('input[placeholder="e.g. שלום"]').first();
        if (await input.count() > 0) {
            console.log("Found input!");
            await input.fill('שלום');
        } else {
            console.log("Input not found");
        }
    } catch(e) {
        console.error("Could not find input e.g. שלום");
    }
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'test_screenshot_verify.png', fullPage: true });
    await browser.close();
})();
