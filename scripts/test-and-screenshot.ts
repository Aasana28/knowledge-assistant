import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { spawn, ChildProcess } from 'child_process';

const SCREENSHOTS_DIR = path.resolve(process.cwd(), 'docs/screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function waitForServer(url: string, timeoutMs = 45000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200 || res.status === 304) {
        return true;
      }
    } catch (e) {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  return false;
}

async function main() {
  console.log('--- Starting Playwright End-to-End Suite & Screenshot Capture ---');

  const PORT = 3099;
  const BASE_URL = `http://localhost:${PORT}`;

  console.log(`Starting Next.js server on port ${PORT}...`);
  const serverProcess: ChildProcess = spawn(
    'npx',
    ['next', 'start', '-p', String(PORT)],
    {
      cwd: process.cwd(),
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, PORT: String(PORT) },
    }
  );

  serverProcess.stdout?.on('data', (d) => console.log(`[Next.js stdout] ${d.toString().trim()}`));
  serverProcess.stderr?.on('data', (d) => console.warn(`[Next.js stderr] ${d.toString().trim()}`));

  const serverReady = await waitForServer(BASE_URL);
  if (!serverReady) {
    console.error('Server failed to start in time.');
    serverProcess.kill();
    process.exit(1);
  }
  console.log('Next.js server is ready!');

  const browser = await chromium.launch({ headless: true });

  try {
    // ----------------------------------------------------
    // TEST 1: Desktop Viewport - Assistant Tab (Answered Flow)
    // ----------------------------------------------------
    console.log('\n[1/5] Testing Desktop Assistant Tab (Role: Intern, Silver Retainer)...');
    const page = await browser.newPage({
      viewport: { width: 1280, height: 860 },
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify initial elements
    const heading = await page.textContent('h1');
    console.log(`  Header title: "${heading}"`);

    // Click example question chip for Silver Retainer
    const silverChip = page.locator('button:has-text("Silver Retainer Pricing")');
    await silverChip.click();

    console.log('  Waiting for /api/ask response...');
    // Wait for the answer card to appear
    await page.waitForSelector('text=Answered from Approved Docs', { timeout: 30000 });
    console.log('  Answer card received!');

    // Expand the technical trace
    const traceButton = page.locator('button:has-text("How this answer was produced")');
    await traceButton.click();
    await page.waitForTimeout(600);

    // Open citation drawer by clicking the first citation chip
    const citationChip = page.locator('button:has-text("pricing-packages")').first();
    if (await citationChip.isVisible()) {
      await citationChip.click();
      await page.waitForTimeout(600);
      console.log('  Source drawer opened successfully.');
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '01-assistant-citation-drawer.png'),
      });
      // Close source drawer
      const closeDrawerBtn = page.locator('button[aria-label="Close drawer"]');
      await closeDrawerBtn.click();
      await page.waitForTimeout(400);
    }

    // Take screenshot of Assistant with trace expanded
    const screenshot1 = path.join(SCREENSHOTS_DIR, '02-assistant-desktop-answered.png');
    await page.screenshot({ path: screenshot1 });
    console.log(`  Saved: ${screenshot1}`);

    // ----------------------------------------------------
    // TEST 2: Role Boundary Test - Intern vs Finance Question
    // ----------------------------------------------------
    console.log('\n[2/5] Testing Access Boundary (Role: Intern asking for Max Discount)...');
    const discountChip = page.locator('button:has-text("Max Discount Policy")');
    await discountChip.click();

    // Wait for response indicating restricted match or not found
    await page.waitForSelector('text=Higher Access Requirement Detected', { timeout: 30000 });
    console.log('  Restricted topic alert rendered correctly.');

    const screenshot2 = path.join(SCREENSHOTS_DIR, '03-assistant-restricted-boundary.png');
    await page.screenshot({ path: screenshot2 });
    console.log(`  Saved: ${screenshot2}`);

    // ----------------------------------------------------
    // TEST 3: Role Switch to Finance Lead -> Authorized Answer
    // ----------------------------------------------------
    console.log('\n[3/5] Testing Role Switch to Finance Lead (Authorized)...');
    const roleSelect = page.locator('select[aria-label="Select Active Role"]');
    await roleSelect.selectOption('Finance Lead');
    await page.waitForTimeout(500);

    // Submit discount question again
    await discountChip.click();
    await page.waitForSelector('text=Answered from Approved Docs', { timeout: 30000 });
    console.log('  Finance Lead successfully retrieved discount answer!');

    const screenshot3 = path.join(SCREENSHOTS_DIR, '04-assistant-finance-authorized.png');
    await page.screenshot({ path: screenshot3 });
    console.log(`  Saved: ${screenshot3}`);

    // ----------------------------------------------------
    // TEST 4: Documents Library Tab
    // ----------------------------------------------------
    console.log('\n[4/5] Testing Documents Library Tab...');
    const docsTabBtn = page.locator('button:has-text("Documents")');
    await docsTabBtn.click();
    await page.waitForTimeout(800);

    // Verify documents table rows
    const rows = await page.locator('tbody tr').count();
    console.log(`  Found ${rows} document rows in library table.`);

    const screenshot4 = path.join(SCREENSHOTS_DIR, '05-documents-library.png');
    await page.screenshot({ path: screenshot4 });
    console.log(`  Saved: ${screenshot4}`);

    // ----------------------------------------------------
    // TEST 5: Quality Checks Tab
    // ----------------------------------------------------
    console.log('\n[5/5] Testing Quality Checks Tab (Running Live Tests)...');
    const testsTabBtn = page.locator('button:has-text("Quality Checks")');
    await testsTabBtn.click();
    await page.waitForTimeout(600);

    // Run first 6 key tests individually for fast verification
    console.log('  Executing key quality check test cases...');
    const runButtons = page.locator('button:has-text("Run Test")');
    const buttonCount = await runButtons.count();

    // Run the critical boundary and role tests (first 6)
    for (let i = 0; i < Math.min(6, buttonCount); i++) {
      await runButtons.nth(i).click();
      await page.waitForTimeout(2500);
    }

    const screenshot5 = path.join(SCREENSHOTS_DIR, '06-quality-checks.png');
    await page.screenshot({ path: screenshot5 });
    console.log(`  Saved: ${screenshot5}`);

    // ----------------------------------------------------
    // TEST 6: Mobile Viewport 390px (iPhone 13 / 14 standard)
    // ----------------------------------------------------
    console.log('\n[Bonus] Testing Mobile Viewport (390px)...');
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });

    await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(800);

    const screenshot6 = path.join(SCREENSHOTS_DIR, '07-mobile-viewport-390px.png');
    await mobilePage.screenshot({ path: screenshot6 });
    console.log(`  Saved: ${screenshot6}`);

    await mobilePage.close();
    await page.close();
    console.log('\nAll end-to-end tests completed and screenshots captured successfully!');
  } finally {
    await browser.close();
    serverProcess.kill();
  }
}

main().catch((err) => {
  console.error('Fatal error in Playwright test suite:', err);
  process.exit(1);
});

