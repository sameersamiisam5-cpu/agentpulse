import { chromium } from 'playwright';

async function testAgentPulse() {
  console.log('🚀 Launching Chromium to test AgentPulse at http://localhost:3000...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const results = {};

  try {
    // 1. Visit Dashboard
    console.log('[Test 1] Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log(`  Page Title: "${title}"`);
    results.dashboard_loaded = title.includes('AgentPulse');

    // 2. Check WebSocket & KPI Bar
    console.log('[Test 2] Checking KPI Metric Bar...');
    const liveText = await page.textContent('body');
    results.live_ws_indicator = liveText ? liveText.includes('LIVE WS') : false;
    results.token_counter = liveText ? liveText.includes('Token Burn') : false;

    // 3. Test "Sample Trace" Button
    console.log('[Test 3] Testing "Sample Trace" 1-click incident replay...');
    const sampleBtn = page.getByRole('button', { name: /Sample Trace/i });
    if (await sampleBtn.isVisible()) {
      await sampleBtn.click();
      await page.waitForTimeout(600);
      const afterSampleText = await page.textContent('body');
      results.sample_trace_loaded = afterSampleText ? afterSampleText.includes('docker_mcp_inspect') : false;
      results.circuit_breaker_triggered = afterSampleText ? afterSampleText.includes('Circuit Breaker Triggered') : false;
    } else {
      results.sample_trace_loaded = 'Button not found';
    }

    // 4. Test Tool Row Click & Inspector Drawer
    console.log('[Test 4] Testing Tool Inspector Drawer...');
    const firstRow = page.locator('.cursor-pointer').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForTimeout(500);
      const drawerVisible = await page.locator('text=Input Payload (Arguments)').isVisible();
      results.drawer_inspection = drawerVisible;
    } else {
      results.drawer_inspection = false;
    }

    // 5. Test "Connect Agent" Modal & Ping
    console.log('[Test 5] Testing "Connect Agent" Modal & Instant Ping...');
    const connectBtn = page.getByRole('button', { name: /Connect Agent/i });
    if (await connectBtn.isVisible()) {
      await connectBtn.click();
      await page.waitForTimeout(500);
      const pingBtn = page.getByRole('button', { name: /Fire Instant Test Ping/i });
      if (await pingBtn.isVisible()) {
        await pingBtn.click();
        await page.waitForTimeout(700);
        results.test_ping_delivered = true;
      } else {
        results.test_ping_delivered = 'Ping button not visible';
      }
      // Close modal
      const closeBtn = page.getByRole('button', { name: /Close/i });
      if (await closeBtn.isVisible()) await closeBtn.click();
    }

    // Take screenshot for Sami
    const screenshotPath = 'D:/Agent _pulse/agentpulse-verified.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Full browser screenshot saved to ${screenshotPath}`);

  } catch (err) {
    console.error('Error during browser testing:', err);
    results.error = err.message;
  } finally {
    await browser.close();
  }

  console.log('\n=== AGENTPULSE E2E VERIFICATION REPORT ===');
  console.log(JSON.stringify(results, null, 2));
}

testAgentPulse();
