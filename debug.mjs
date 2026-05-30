import puppeteer from 'puppeteer';

(async () => {
    console.log("Launching puppeteer...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    
    console.log("Navigating to http://localhost:8888...");
    await page.goto('http://localhost:8888', { waitUntil: 'networkidle2' });
    
    // Evaluate in browser to click the ministries tab and then the image
    await page.evaluate(() => {
        // Find Ministries tab
        const links = Array.from(document.querySelectorAll('a'));
        const ministriesLink = links.find(a => a.textContent.includes('MINISTRIES'));
        if (ministriesLink) {
            console.log("Found MINISTRIES tab, clicking...");
            ministriesLink.click();
        }
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    await page.evaluate(() => {
        // Find image
        const img = document.querySelector('.cursor-pointer');
        if (img) {
            console.log("Found .cursor-pointer, clicking...");
            img.click();
        } else {
            console.log("No .cursor-pointer found.");
        }
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    await browser.close();
})();
