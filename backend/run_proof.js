const { chromium } = require('playwright');
const fs = require('fs');

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to login...");
    await page.goto('http://localhost:3000/login');
    
    // 1. Admin Login
    await page.click('text=Admin Login');
    await page.fill('input[type="email"]', 'finaltest@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In as Admin")');
    
    console.log("Waiting for dashboard...");
    await page.waitForURL('**/admin-dashboard**', { timeout: 10000 });
    
    // 2. Go to Client Progress
    await page.goto('http://localhost:3000/client-progress');
    console.log("Arrived at Client Progress.");
    
    // 3. Find AHUSG BAKERY
    await page.waitForSelector('text=AHUSG BAKERY');
    const projectCard = page.locator('.client-project-card', { hasText: 'AHUSG BAKERY' });
    
    // 4. Record Deduction
    await projectCard.locator('button:has-text("Deduct Cards Used Today")').click();
    await page.fill('input[placeholder="Enter numbers"]', '1');
    await page.fill('input[placeholder="Enter note..."]', 'PLAYWRIGHT AUTO TEST');
    await page.click('button:has-text("Update Cards")');
    
    console.log("Deduction submitted. Waiting for toast...");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/USER/Desktop/company-app/backend/proof_toast.png' });

    // 5. Check History
    await page.click('button:has-text("Refresh Data")');
    await page.waitForTimeout(2000);
    
    const countText = await projectCard.locator('h4:has-text("DEDUCTION HISTORY")').innerText();
    console.log("History header:", countText);
    
    await projectCard.locator('button:has-text("View")').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/USER/Desktop/company-app/backend/proof_history.png' });
    
    console.log("Verification complete. Screenshots saved.");

  } catch (err) {
    console.error("TEST FAILED:", err);
    await page.screenshot({ path: 'C:/Users/USER/Desktop/company-app/backend/error_proof.png' });
  } finally {
    await browser.close();
  }
}

run();
