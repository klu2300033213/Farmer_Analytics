const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json({ limit: "5mb" }));

/* ===============================
   PDF GENERATION ENDPOINT
================================ */
app.post("/pdf", async (req, res) => {
  const { url, storage } = req.body;

  if (!url) {
    return res.status(400).send("URL is required");
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

    const page = await browser.newPage();

    if (storage && typeof storage === "object") {
      await page.evaluateOnNewDocument((items) => {
        Object.entries(items).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            localStorage.setItem(key, String(value));
          }
        });
      }, storage);
    }

     /* ===============================
       VIEWPORT (HIGH QUALITY)
     ================================ */
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2,
    });

     await page.emulateMediaType("screen");

    /* ===============================
       LOAD PAGE
    ================================ */
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 45000,
    });

    /* ===============================
       🔥 WAIT FOR DASHBOARD CONTENT
    ================================ */
    await page.waitForSelector("#report-section", {
      timeout: 20000,
    });

    await page.waitForFunction(
      () => window.__PDF_READY__ === true,
      { timeout: 20000 }
    );

    /* ===============================
       GENERATE PDF
    ================================ */
    const pdfBuffer = await page.pdf({
      format: "A3",
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    /* ===============================
       RESPONSE HEADERS
    ================================ */
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition":
        "attachment; filename=Farmer_Analytics_Report.pdf",
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error("❌ PDF Generation Error:", error);
    res.status(500).send("PDF generation failed");
  }
});

/* ===============================
   SERVER START
================================ */
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`✅ PDF Engine running on port ${PORT}`);
});
