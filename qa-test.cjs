const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  // Log console messages
  page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  try {
    // 1. Navigate to login page
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: 'screenshots/01-login-page.png', fullPage: true });
    console.log('   URL:', page.url());

    // 2. Fill in login form
    console.log('2. Filling login form...');
    await page.fill('input[placeholder*="user" i]', 'admin');
    await page.fill('input[name="password"]', 'Admin1234');
    await page.screenshot({ path: 'screenshots/02-login-form-filled.png', fullPage: true });

    // 3. Submit the form and wait for navigation
    console.log('3. Submitting login form...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
      page.click('button[type="submit"]')
    ]);
    
    // Wait a bit more for any async operations
    await page.waitForTimeout(2000);
    
    console.log('   After login URL:', page.url());
    await page.screenshot({ path: 'screenshots/03-after-login.png', fullPage: true });

    // 4. Navigate to exams page
    console.log('4. Navigating to exams page...');
    await page.goto('http://localhost:5173/admin/dashboard/exams', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    console.log('   Exams page URL:', page.url());
    await page.screenshot({ path: 'screenshots/04-exams-page.png', fullPage: true });

    // Get page content for debugging
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('   Page text:', bodyText);

    // 5. Look for Create Subject button
    console.log('5. Looking for Create Subject button...');
    
    // Get all buttons on the page
    const buttons = await page.$$eval('button, a[role="button"], [role="button"]', els => 
      els.map(el => ({ text: el.textContent?.trim(), tag: el.tagName, visible: el.offsetParent !== null }))
    );
    console.log('   Found buttons:', JSON.stringify(buttons, null, 2));

    // Try clicking Create Subject
    const createButton = await page.$('button:has-text("Create Subject"), button:has-text("Add Subject"), button:has-text("+ Create")');
    if (createButton) {
      console.log('   Clicking Create Subject button...');
      await createButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/05-create-subject-modal.png', fullPage: true });
      console.log('   Screenshot saved: 05-create-subject-modal.png');
    } else {
      console.log('   Create Subject button not found');
      await page.screenshot({ path: 'screenshots/05-no-create-button.png', fullPage: true });
    }

    console.log('\nDone! Screenshots saved to screenshots/ directory');
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
