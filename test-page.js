const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  try {
    await page.goto('http://localhost:3000/repair/create', { waitUntil: 'networkidle' });
    console.log('Page loaded successfully');
    
    // Check if there is an overlay
    const overlay = await page.evaluate(() => {
      const el = document.elementFromPoint(200, 200);
      return el ? el.outerHTML.substring(0, 200) : 'none';
    });
    console.log('Element at 200,200:', overlay);
  } catch (err) {
    console.error('Navigation error:', err.message);
  }
  
  await browser.close();
})();
