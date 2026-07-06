function UploadDataset({ refreshPrices }) {

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    await fetch("http://localhost:8080/api/upload", {
      method: "POST",
      body: formData,
    });

    alert("CSV uploaded successfully");

    // ✅ refresh chart data after upload
    refreshPrices();
  };

  return (
    <div className="card">
      <h3>Upload Dataset (CSV)</h3>
      <input type="file" accept=".csv" onChange={handleUpload} />
    </div>
  );
}

export default UploadDataset;
