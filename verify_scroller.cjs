const { chromium } = require('@playwright/test');

(async () => {
  try {
    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    console.log('Navigating to localhost:8888...');
    await page.goto('http://localhost:8888/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Dismiss any intro modal if present
    try {
      const skipBtn = await page.$('text=Skip');
      if (skipBtn) {
        await skipBtn.click();
        await page.waitForTimeout(500);
      }
    } catch(e) {}

    // Locate scroller section
    const scroller = await page.$('section[aria-label="City of Truth Sacred Emblems and Publications"]');
    if (scroller) {
      await scroller.scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'd:/City-Of-Truth-Ministries/test_scroller_screenshot.png' });
      console.log('Screenshot saved to test_scroller_screenshot.png');

      // Click the book wrapper or first emblem to test modal
      const bookCard = await page.$('text=ஆத்தும நன்றி பலிகள்');
      if (bookCard) {
        await bookCard.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'd:/City-Of-Truth-Ministries/test_modal_screenshot.png' });
        console.log('Modal screenshot saved to test_modal_screenshot.png');
      }
    } else {
      console.log('Scroller section not found');
    }
    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  }
})();
