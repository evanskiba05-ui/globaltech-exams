const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: 'screenshots/01-login-page.png', fullPage: true });
    console.log('Screenshot saved: 01-login-page.png');

    // 2. Fill in login form
    console.log('Filling login form...');
    
    // Try different selectors for username field
    const usernameSelectors = [
      'input[name="username"]',
      'input[name="email"]',
      'input[type="text"]',
      'input[placeholder*="user" i]',
      'input[placeholder*="email" i]',
      '#username',
      '#email'
    ];
    
    let usernameFilled = false;
    for (const selector of usernameSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.fill('admin');
          console.log(`Filled username using: ${selector}`);
          usernameFilled = true;
          break;
        }
      } catch (e) {}
    }
    
    if (!usernameFilled) {
      console.log('Could not find username field, taking screenshot for debugging');
      await page.screenshot({ path: 'screenshots/debug-no-username.png', fullPage: true });
    }

    // Try different selectors for password field
    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      'input[placeholder*="password" i]',
      '#password'
    ];
    
    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.fill('Admin1234');
          console.log(`Filled password using: ${selector}`);
          passwordFilled = true;
          break;
        }
      } catch (e) {}
    }
    
    if (!passwordFilled) {
      console.log('Could not find password field, taking screenshot for debugging');
      await page.screenshot({ path: 'screenshots/debug-no-password.png', fullPage: true });
    }

    await page.screenshot({ path: 'screenshots/02-login-form-filled.png', fullPage: true });
    console.log('Screenshot saved: 02-login-form-filled.png');

    // 3. Submit the form
    console.log('Submitting login form...');
    
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign in")',
      'button:has-text("Log in")',
      'input[type="submit"]',
      'form button'
    ];
    
    let submitted = false;
    for (const selector of submitSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          console.log(`Clicked submit using: ${selector}`);
          submitted = true;
          break;
        }
      } catch (e) {}
    }
    
    if (!submitted) {
      console.log('Could not find submit button, trying form submission');
      try {
        await page.evaluate(() => {
          const form = document.querySelector('form');
          if (form) form.submit();
        });
      } catch (e) {
        console.log('Form submission failed:', e.message);
      }
    }

    // Wait for navigation
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.screenshot({ path: 'screenshots/03-after-login.png', fullPage: true });
    console.log('Screenshot saved: 03-after-login.png');

    // 4. Navigate to exams page
    console.log('Navigating to exams page...');
    await page.goto('http://localhost:5173/admin/dashboard/exams', { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: 'screenshots/04-exams-page.png', fullPage: true });
    console.log('Screenshot saved: 04-exams-page.png');

    // 5. Click "Create Subject" button
    console.log('Looking for Create Subject button...');
    
    const createButtonSelectors = [
      'button:has-text("Create Subject")',
      'button:has-text("Add Subject")',
      'button:has-text("New Subject")',
      'button:has-text("+ Create")',
      'button:has-text("+ Add")',
      'a:has-text("Create Subject")',
      'a:has-text("Add Subject")'
    ];
    
    let createButtonFound = false;
    for (const selector of createButtonSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          console.log(`Clicked Create Subject using: ${selector}`);
          createButtonFound = true;
          break;
        }
      } catch (e) {}
    }
    
    if (!createButtonFound) {
      console.log('Could not find Create Subject button, taking screenshot for debugging');
      await page.screenshot({ path: 'screenshots/debug-no-create-button.png', fullPage: true });
    }

    // Wait for modal to appear
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/05-create-subject-modal.png', fullPage: true });
    console.log('Screenshot saved: 05-create-subject-modal.png');

    console.log('\nAll screenshots saved to screenshots/ directory');
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
