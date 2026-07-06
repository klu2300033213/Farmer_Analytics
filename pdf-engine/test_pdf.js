const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting puppeteer...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  const storage = {
    pdf_result: JSON.stringify({ prediction: 5000 }),
    pdf_crop: "cotton",
    pdf_live_rows: JSON.stringify([]),
    pdf_selection: JSON.stringify({ state: "Andhra Pradesh", district: "Vijayawada", crop: "cotton", date: "2026-07-06" }),
    token: "pdf",
  };
  
  await page.evaluateOnNewDocument((items) => {
    Object.entries(items).forEach(([key, value]) => {
      localStorage.setItem(key, String(value));
    });
  }, storage);

  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await page.emulateMediaType("screen");

  console.log("Navigating to results page...");
  await page.goto("http://localhost:5173/results#results", {
    waitUntil: "networkidle0",
    timeout: 30000,
  });

  console.log("Waiting for selector #report-section...");
  await page.waitForSelector("#report-section", { timeout: 15000 });

  console.log("Waiting for window.__PDF_READY__...");
  await page.waitForFunction(() => window.__PDF_READY__ === true, { timeout: 15000 });

  console.log("Generating PDF...");
  const pdf = await page.pdf({ format: "A3", printBackground: true });
  console.log("PDF generated! Size:", pdf.length);
  await browser.close();
})().catch(err => {
  console.error("Test failed:", err);
});
