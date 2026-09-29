const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for console messages
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  
  // Listen for network requests
  page.on('request', request => {
    if (request.url().includes('login') || request.url().includes('auth')) {
      console.log('REQUEST:', request.method(), request.url());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('login') || response.url().includes('auth')) {
      console.log('RESPONSE:', response.status(), response.url());
    }
  });
  
  try {
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle' });
    
    // Take a snapshot to see the form elements
    console.log('Taking snapshot of login form...');
    await page.screenshot({ path: 'login-page.png', fullPage: true });
    
    // Find and fill username
    console.log('Filling username...');
    const usernameInput = await page.locator('input[placeholder*="username" i], input[placeholder*="email" i]').first();
    if (await usernameInput.isVisible()) {
      await usernameInput.fill('admin');
      console.log('Username filled');
    } else {
      console.log('Username input not found');
    }
    
    // Find and fill password
    console.log('Filling password...');
    const passwordInput = await page.locator('input[type="password"]').first();
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('Admin1234');
      console.log('Password filled');
    } else {
      console.log('Password input not found');
    }
    
    // Take screenshot after filling
    await page.screenshot({ path: 'login-filled.png', fullPage: true });
    
    // Scroll down to see the submit button
    console.log('Scrolling to see submit button...');
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'login-scrolled.png', fullPage: true });
    
    // Find and click submit button
    console.log('Submitting login form...');
    const submitButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), button:has-text("Submit")').first();
    if (await submitButton.isVisible()) {
      console.log('Found submit button, clicking...');
      await submitButton.click();
      console.log('Login form submitted');
    } else {
      console.log('Submit button not found, trying to find any button...');
      const anyButton = await page.locator('button').first();
      if (await anyButton.isVisible()) {
        const buttonText = await anyButton.textContent();
        console.log('Found button with text:', buttonText);
        await anyButton.click();
        console.log('Clicked first available button');
      }
    }
    
    // Wait for navigation or response
    console.log('Waiting for response...');
    await page.waitForTimeout(3000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL after submit:', currentUrl);
    
    // Take screenshot to see what happened
    await page.screenshot({ path: 'after-submit.png', fullPage: true });
    
    // Check for any error messages
    const errorText = await page.locator('.error, .alert, .message, [role="alert"], .text-red, .text-danger').allTextContents();
    if (errorText.length > 0) {
      console.log('Error messages found:', errorText);
    }
    
    // Get page content to see if there are any error messages
    const pageContent = await page.textContent('body');
    if (pageContent.includes('Invalid') || pageContent.includes('error') || pageContent.includes('failed')) {
      console.log('Possible error message in page content');
      // Extract relevant part
      const errorMatch = pageContent.match(/(Invalid|error|failed)[^.]*\./i);
      if (errorMatch) {
        console.log('Error:', errorMatch[0]);
      }
    }
    
    console.log('Visual QA completed');
    
  } catch (error) {
    console.error('Error during visual QA:', error.message);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
