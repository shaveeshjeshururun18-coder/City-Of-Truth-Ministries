const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Go to home page
  await page.goto('http://localhost:8888/');
  // Wait for the modal and click "Skip"
  try {
    await page.waitForSelector('text=Skip', { timeout: 3000 });
    await page.click('text=Skip');
  } catch (e) {}

  // Scroll down a bit to see the Psalm section
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/jules/verification/home_psalm_scrolled.png' });

  // Go to Hebrew Calendar page
  await page.goto('http://localhost:8888/?view=HEBREW_CALENDAR');
  await page.waitForTimeout(1000);
  // Scroll down to see the calendar table
  await page.evaluate(() => window.scrollBy(0, 1500));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/jules/verification/calendar_headers_scrolled.png' });

  await browser.close();
})();
