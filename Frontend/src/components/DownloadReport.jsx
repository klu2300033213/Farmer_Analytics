function DownloadReport({ disabled, pdfPayload }) {
  const downloadPDF = async () => {
    if (disabled) {
      alert("Please analyze crop before downloading PDF");
      return;
    }

    try {
      const storage = {
        pdf_result: JSON.stringify(pdfPayload?.result ?? null),
        pdf_crop: pdfPayload?.selectedCrop ?? "",
        pdf_live_rows: JSON.stringify(pdfPayload?.liveRows ?? []),
        pdf_selection: JSON.stringify(pdfPayload?.selection ?? null),
        token: localStorage.getItem("token") || "pdf",
      };

      const res = await fetch("${import.meta.env.VITE_API_URL||"http://localhost:8081"}/api/pdf/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: window.location.origin + "/results#results",
          storage,
        }),
      });

      if (!res.ok) throw new Error("PDF failed");

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Farmer_Analytics_Report.pdf";
      link.click();
    } catch (e) {
      alert("PDF download failed");
      console.error(e);
    }
  };

  return (
    <button
      className="download-pdf-btn"
      onClick={downloadPDF}
      disabled={disabled}
    >
      ⬇ Download PDF Report
    </button>
  );
}

export default DownloadReport;



