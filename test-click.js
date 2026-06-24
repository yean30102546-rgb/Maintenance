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
    
    // Click the first select trigger
    const selectTrigger = page.locator('button[data-slot="select-trigger"]').first();
    await selectTrigger.click();
    console.log('Clicked select trigger');
    
    // Wait for a bit
    await page.waitForTimeout(1000);
    
    // Check if select content is visible
    const content = page.locator('[data-slot="select-content"]');
    console.log('Select content visible:', await content.isVisible().catch(() => false));
    
  } catch (err) {
    console.error('Navigation error:', err.message);
  }
  
  await browser.close();
})();
