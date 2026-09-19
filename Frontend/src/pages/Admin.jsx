import { useEffect, useState } from "react";
import axios from "axios";
import { getCurrentRole } from "../utils/auth";

const API_BASE = `${import.meta.env.VITE_API_URL|| 'http://localhost:8081'}/api/admin`;
const APPROVED_GUIDES_STORAGE_KEY = "pesticide_approved_guides";
const GUIDE_LANGUAGE_OPTIONS = ["en", "hi", "te"];

function normalizeTagList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function extractYoutubeId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "").trim() || null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const byQuery = parsed.searchParams.get("v");
      if (byQuery) return byQuery;
      const byPath = parsed.pathname.match(/\/embed\/([^/?]+)/);
      if (byPath?.[1]) return byPath[1];
    }

    return null;
  } catch {
    return null;
  }
}

function isYoutubeUrl(url) {
  try {
    const parsed = new URL(String(url || "").trim());
    return parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtu.be");
  } catch {
    return false;
  }
}

function Admin() {
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionBusy, setActionBusy] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [messageFilter, setMessageFilter] = useState("ALL");
  const [notice, setNotice] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [pesticideFile, setPesticideFile] = useState(null);
  const [pesticideSourceSection, setPesticideSourceSection] = useState("Registered Products");
  const [pesticideSourceYear, setPesticideSourceYear] = useState(new Date().getFullYear());
  const [pesticideSourceDate, setPesticideSourceDate] = useState("");
  const [pesticideImportLogs, setPesticideImportLogs] = useState([]);
  const [pesticideStats, setPesticideStats] = useState(null);
  const [isPesticideDragOver, setIsPesticideDragOver] = useState(false);
  const [pesticidePreview, setPesticidePreview] = useState(null);
  const [approvedGuides, setApprovedGuides] = useState([]);
  const [editingGuideId, setEditingGuideId] = useState("");
  const [guideForm, setGuideForm] = useState({
    title: "",
    youtubeUrl: "",
    description: "",
    channel: "",
    duration: "",
    crops: "",
    pests: "",
    languages: ["en", "hi", "te"],
    safetyVerified: true,
  });

  const token = localStorage.getItem("token");
  const role = getCurrentRole();

  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const loadInsights = async () => {
    try {
      setInsightsLoading(true);
      const insightsRes = await axios.get(`${API_BASE}/insights`, { headers });
      setInsights(insightsRes.data || null);
    } catch {
      setInsights(null);
    } finally {
      setInsightsLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, usersRes, messagesRes] = await Promise.all([
        axios.get(`${API_BASE}/stats`, { headers }),
        axios.get(`${API_BASE}/users`, { headers }),
        axios.get(`${API_BASE}/messages`, { headers }),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setMessages(messagesRes.data || []);
      loadInsights();
      loadPesticideMeta();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role !== "ADMIN") {
      setError("Admin access required");
      setLoading(false);
      return;
    }

    loadAdminData();
  }, [role]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(APPROVED_GUIDES_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setApprovedGuides(parsed);
      }
    } catch {
      setApprovedGuides([]);
    }
  }, []);

  const persistApprovedGuides = (nextGuides) => {
    setApprovedGuides(nextGuides);
    localStorage.setItem(APPROVED_GUIDES_STORAGE_KEY, JSON.stringify(nextGuides));
  };

  const loadPesticideMeta = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL|| 'http://localhost:8081'}/api/pesticides/stats`, { headers }),
        axios.get(`${API_BASE}/pesticides/import-logs`, { headers }),
      ]);

      setPesticideStats(statsRes.data || null);
      setPesticideImportLogs(logsRes.data || []);
    } catch {
      setPesticideStats(null);
      setPesticideImportLogs([]);
    }
  };

  const updateRole = async (userId, nextRole) => {
    try {
      await axios.post(
        `${API_BASE}/users/${userId}/role`,
        { role: nextRole },
        { headers }
      );

      setNotice(`Role updated to ${nextRole}`);
      await loadAdminData();
    } catch (err) {
      alert(err.response?.data || "Failed to update role");
    }
  };

  const runAdminAction = async (endpoint, successMessage) => {
    try {
      setActionBusy(endpoint);
      await axios.post(`${API_BASE}${endpoint}`, {}, { headers });
      setNotice(successMessage);
      await loadAdminData();
    } catch (err) {
      alert(err.response?.data || "Admin action failed");
    } finally {
      setActionBusy("");
    }
  };

  const deleteUser = async (userId, email) => {
    const ok = window.confirm(`Delete user ${email}? This cannot be undone.`);
    if (!ok) return;

    try {
      await axios.delete(`${API_BASE}/users/${userId}`, { headers });
      setNotice(`Deleted user ${email}`);
      await loadAdminData();
    } catch (err) {
      alert(err.response?.data || "Failed to delete user");
    }
  };

  const setReplyDraft = (messageId, value) => {
    setReplyDrafts((prev) => ({ ...prev, [messageId]: value }));
  };

  const sendReply = async (messageId) => {
    const reply = (replyDrafts[messageId] || "").trim();
    if (!reply) {
      alert("Please type a reply");
      return;
    }

    try {
      setActionBusy(`reply-${messageId}`);
      await axios.post(`${API_BASE}/messages/${messageId}/reply`, { reply }, { headers });
      setNotice("Reply sent successfully");
      setReplyDraft(messageId, "");
      await loadAdminData();
    } catch (err) {
      alert(err.response?.data || "Failed to send reply");
    } finally {
      setActionBusy("");
    }
  };

  const exportUsersCsv = () => {
    const header = ["id", "name", "email", "role"];
    const lines = users.map((u) => [u.id, u.name || "", u.email || "", u.role || "USER"]);
    const csv = [header, ...lines]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin-users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importPesticideCsv = async () => {
    if (!pesticideFile) {
      alert("Please choose a CSV, PDF, DOC, or DOCX file first");
      return;
    }

    try {
      setActionBusy("pesticide-import");
      const form = new FormData();
      form.append("file", pesticideFile);
      form.append("sourceSection", pesticideSourceSection);
      if (String(pesticideSourceYear || "").trim()) {
        form.append("sourceYear", String(pesticideSourceYear));
      }
      if (String(pesticideSourceDate || "").trim()) {
        form.append("sourceDate", pesticideSourceDate);
      }

      const res = await axios.post(`${API_BASE}/pesticides/import`, form, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });

      setNotice(`Pesticide dataset imported: ${res.data?.insertedRows ?? 0} inserted, ${res.data?.updatedRows ?? 0} updated`);
      setPesticideFile(null);
      setPesticidePreview(null);
      await loadPesticideMeta();
    } catch (err) {
      const serverData = err?.response?.data;
      const serverMessage =
        typeof serverData === "string"
          ? serverData
          : serverData?.message || serverData?.error;
      alert(serverMessage || err?.message || "Pesticide dataset import failed");
    } finally {
      setActionBusy("");
    }
  };

  const previewPesticideDataset = async () => {
    if (!pesticideFile) {
      alert("Please choose a CSV, PDF, DOC, or DOCX file first");
      return;
    }

    try {
      setActionBusy("pesticide-preview");
      const form = new FormData();
      form.append("file", pesticideFile);
      form.append("sourceSection", pesticideSourceSection);
      if (String(pesticideSourceYear || "").trim()) {
        form.append("sourceYear", String(pesticideSourceYear));
      }
      if (String(pesticideSourceDate || "").trim()) {
        form.append("sourceDate", pesticideSourceDate);
      }

      const res = await axios.post(`${API_BASE}/pesticides/preview`, form, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });

      setPesticidePreview(res.data || null);
      setNotice(`Preview ready: ${res.data?.recommendedRows ?? 0} recommended rows out of ${res.data?.totalParsedRows ?? 0}`);
    } catch (err) {
      const serverData = err?.response?.data;
      const serverMessage =
        typeof serverData === "string"
          ? serverData
          : serverData?.message || serverData?.error;
      alert(serverMessage || err?.message || "Preview failed");
    } finally {
      setActionBusy("");
    }
  };

  const downloadPesticideTemplate = () => {
    const rows = [
      [
        "registrationNumber",
        "productName",
        "activeIngredient",
        "formulation",
        "concentration",
        "approvedCrops",
        "targetPests",
        "registrantCompany",
        "legalStatus",
      ],
      [
        "CIB-EXAMPLE-001",
        "EcoShield 45 SC",
        "Spinosad",
        "SC",
        "45%",
        "tomato,chilli",
        "fruit borer,thrips",
        "Demo Agro Pvt Ltd",
        "REGISTERED",
      ],
    ];

    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pesticide_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onPesticideDrop = (e) => {
    e.preventDefault();
    setIsPesticideDragOver(false);
    const file = e.dataTransfer?.files?.[0] || null;
    if (!file) return;
    const name = file.name.toLowerCase();
    const ok = [".csv", ".pdf", ".doc", ".docx"].some((ext) => name.endsWith(ext));
    if (!ok) {
      alert("Please drop CSV, PDF, DOC, or DOCX files only");
      return;
    }
    setPesticideFile(file);
    setPesticidePreview(null);
  };

  const updateGuideForm = (field, value) => {
    setGuideForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleGuideLanguage = (lang) => {
    setGuideForm((prev) => {
      const exists = prev.languages.includes(lang);
      return {
        ...prev,
        languages: exists
          ? prev.languages.filter((item) => item !== lang)
          : [...prev.languages, lang],
      };
    });
  };

  const addApprovedGuide = () => {
    const title = guideForm.title.trim();
    const youtubeUrl = guideForm.youtubeUrl.trim();

    if (!title) {
      alert("Guide title is required");
      return;
    }

    if (!youtubeUrl || !isYoutubeUrl(youtubeUrl)) {
      alert("Please provide a valid YouTube URL");
      return;
    }

    if (guideForm.languages.length === 0) {
      alert("Select at least one language");
      return;
    }

    const videoId = extractYoutubeId(youtubeUrl);
    const nextGuide = {
      id: editingGuideId || `approved-${Date.now()}`,
      title,
      description: guideForm.description.trim() || "Admin approved spray guide",
      youtubeUrl,
      searchQuery: `${title} pesticide spray guide`,
      channel: guideForm.channel.trim() || "Approved by Admin",
      duration: guideForm.duration.trim() || "Guide",
      thumb: videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
      crops: normalizeTagList(guideForm.crops).length > 0 ? normalizeTagList(guideForm.crops) : ["all"],
      pests: normalizeTagList(guideForm.pests).length > 0 ? normalizeTagList(guideForm.pests) : ["all"],
      topics: ["approved", "spray", "training"],
      languages: guideForm.languages,
      safetyVerified: !!guideForm.safetyVerified,
      approvedByAdmin: true,
      addedAt: new Date().toISOString(),
    };

    const next = editingGuideId
      ? approvedGuides.map((item) => (item.id === editingGuideId ? { ...item, ...nextGuide } : item))
      : [nextGuide, ...approvedGuides];
    persistApprovedGuides(next);
    setNotice(editingGuideId ? "Approved spray guide updated" : "Approved spray guide added");
    setGuideForm({
      title: "",
      youtubeUrl: "",
      description: "",
      channel: "",
      duration: "",
      crops: "",
      pests: "",
      languages: ["en", "hi", "te"],
      safetyVerified: true,
    });
    setEditingGuideId("");
  };

  const removeApprovedGuide = (id) => {
    const next = approvedGuides.filter((item) => item.id !== id);
    persistApprovedGuides(next);
    setNotice("Approved spray guide removed");
  };

  const editApprovedGuide = (video) => {
    setEditingGuideId(video.id);
    setGuideForm({
      title: video.title || "",
      youtubeUrl: video.youtubeUrl || "",
      description: video.description || "",
      channel: video.channel || "",
      duration: video.duration || "",
      crops: (video.crops || []).join(", "),
      pests: (video.pests || []).join(", "),
      languages: Array.isArray(video.languages) && video.languages.length > 0 ? video.languages : ["en"],
      safetyVerified: !!video.safetyVerified,
    });
  };

  const filteredUsers = users.filter((u) => {
    const term = search.trim().toLowerCase();
    const roleOk = roleFilter === "ALL" || (u.role || "USER") === roleFilter;
    if (!roleOk) return false;
    if (!term) return true;

    return (
      String(u.name || "").toLowerCase().includes(term) ||
      String(u.email || "").toLowerCase().includes(term)
    );
  });

  const topCrops = Array.isArray(insights?.topCrops) ? insights.topCrops : [];
  const filteredMessages = messages.filter((m) => {
    if (messageFilter === "ALL") return true;
    return (m.status || "OPEN") === messageFilter;
  });

  return (
    <div className="analytics-page app-container admin-page admin-cinematic">
      <div className="admin-shell admin-shell-pro">
        <div className="admin-vfx-layer" aria-hidden="true" />

        <div className="admin-panel admin-header-card admin-hero reveal-up">
          <h2>Admin Command Console</h2>
          <p>Control pipelines, govern users, and manage support from one clean dashboard.</p>
        </div>

        {!!notice && (
          <div className="admin-panel admin-notice-card reveal-up">
            <p>{notice}</p>
          </div>
        )}

        {loading && (
          <div className="admin-panel admin-state-card reveal-up">
            <p>Loading admin dashboard...</p>
          </div>
        )}

        {!loading && error && (
          <div className="admin-panel admin-state-card reveal-up">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && stats && (
          <>
            <div className="admin-panel admin-actions-card reveal-up">
              <h3>Operations Center</h3>
              <div className="admin-actions-row">
                <button
                  type="button"
                  onClick={() => runAdminAction("/sync/live-now", "Live sync completed")}
                  disabled={actionBusy === "/sync/live-now"}
                >
                  {actionBusy === "/sync/live-now" ? "Running Live Sync..." : "Run Live Data Sync"}
                </button>
                <button
                  type="button"
                  onClick={() => runAdminAction("/sync/history-now", "History generation completed")}
                  disabled={actionBusy === "/sync/history-now"}
                >
                  {actionBusy === "/sync/history-now" ? "Generating History..." : "Generate History Now"}
                </button>
                <button type="button" onClick={loadAdminData}>
                  Refresh Dashboard
                </button>
                <button type="button" onClick={exportUsersCsv}>
                  Export Users CSV
                </button>
              </div>
            </div>

            <div className="admin-panel admin-actions-card reveal-up" style={{ animationDelay: "0.18s" }}>
              <h3>Pesticide Dataset Import</h3>
              <div className="admin-pesticide-import-grid">
                <div className="admin-user-filters">
                  <select
                    value={pesticideSourceSection}
                    onChange={(e) => setPesticideSourceSection(e.target.value)}
                  >
                    <option value="Registered Products">Registered Products</option>
                    <option value="Insecticide in Schedule">Insecticide in Schedule</option>
                    <option value="Bio-pesticide Registrant">Bio-pesticide Registrant</option>
                    <option value="News & Update">News & Update</option>
                  </select>

                  <input
                    type="number"
                    value={pesticideSourceYear}
                    onChange={(e) => setPesticideSourceYear(e.target.value)}
                    placeholder="Source year"
                  />

                  <input
                    type="text"
                    value={pesticideSourceDate}
                    onChange={(e) => setPesticideSourceDate(e.target.value)}
                    placeholder="Source date (optional)"
                  />
                </div>

                <div className="admin-actions-row">
                  <div
                    className={`admin-dropzone ${isPesticideDragOver ? "drag-over" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsPesticideDragOver(true);
                    }}
                    onDragLeave={() => setIsPesticideDragOver(false)}
                    onDrop={onPesticideDrop}
                  >
                    <p>Drag and drop CSV/PDF/Word here</p>
                    <p>or</p>
                    <input
                      type="file"
                      accept=".csv,.pdf,.doc,.docx"
                      onChange={(e) => {
                        setPesticideFile(e.target.files?.[0] || null);
                        setPesticidePreview(null);
                      }}
                    />
                    {!!pesticideFile && (
                      <p>Selected: {pesticideFile.name}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={previewPesticideDataset}
                    disabled={actionBusy === "pesticide-preview" || actionBusy === "pesticide-import"}
                  >
                    {actionBusy === "pesticide-preview" ? "Previewing..." : "Preview Dataset"}
                  </button>
                  <button
                    type="button"
                    onClick={importPesticideCsv}
                    disabled={actionBusy === "pesticide-import" || actionBusy === "pesticide-preview"}
                  >
                    {actionBusy === "pesticide-import" ? "Importing..." : "Upload Pesticide Dataset"}
                  </button>
                  <button type="button" onClick={downloadPesticideTemplate}>
                    Download CSV Template
                  </button>
                </div>

                {pesticideStats && (
                  <div className="admin-pesticide-stats">
                    <span>Total: {pesticideStats.totalProducts ?? 0}</span>
                    <span>Registered: {pesticideStats.registeredProducts ?? 0}</span>
                    <span>Restricted: {pesticideStats.restrictedProducts ?? 0}</span>
                    <span>Banned: {pesticideStats.bannedProducts ?? 0}</span>
                  </div>
                )}

                {pesticideImportLogs.length > 0 && (
                  <div className="admin-pesticide-logs">
                    <h4>Recent Imports</h4>
                    {pesticideImportLogs.slice(0, 5).map((log) => (
                      <p key={log.id || `${log.fileName}-${log.createdAt}`}>
                        {log.fileName} | {log.sourceSection} | +{log.insertedRows} / ~{log.updatedRows}
                      </p>
                    ))}
                  </div>
                )}

                {pesticidePreview && (
                  <div className="admin-pesticide-preview">
                    <h4>Preview (No Save Yet)</h4>
                    <p>
                      Parsed: {pesticidePreview.totalParsedRows ?? 0} | Recommended: {pesticidePreview.recommendedRows ?? 0}
                    </p>
                    <div className="table-wrap">
                      <table className="live-table">
                        <thead>
                          <tr>
                            <th>Quality</th>
                            <th>Product</th>
                            <th>Registration</th>
                            <th>Active Ingredient</th>
                            <th>Formulation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(pesticidePreview.previewRows || []).map((row, idx) => (
                            <tr key={`${row.registrationNumber || "NA"}-${idx}`}>
                              <td>
                                <span className={`admin-preview-badge ${(row.quality || "LOW").toLowerCase()}`}>
                                  {row.quality || "LOW"}
                                </span>
                              </td>
                              <td>{row.productName || "-"}</td>
                              <td>{row.registrationNumber || "-"}</td>
                              <td>{row.activeIngredient || "-"}</td>
                              <td>{row.formulation || "-"}</td>
                            </tr>
                          ))}
                          {(pesticidePreview.previewRows || []).length === 0 && (
                            <tr>
                              <td colSpan="5">No preview rows found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-panel admin-actions-card reveal-up" style={{ animationDelay: "0.22s" }}>
              <h3>Approved Spray Videos</h3>
              <p className="admin-video-note">
                Add only trusted spray training links. Pesticide page will prioritize these exact videos before fallback search.
              </p>

              <div className="admin-video-form-grid">
                <input
                  type="text"
                  value={guideForm.title}
                  onChange={(e) => updateGuideForm("title", e.target.value)}
                  placeholder="Guide title"
                />
                <input
                  type="text"
                  value={guideForm.youtubeUrl}
                  onChange={(e) => updateGuideForm("youtubeUrl", e.target.value)}
                  placeholder="YouTube URL"
                />
                <input
                  type="text"
                  value={guideForm.channel}
                  onChange={(e) => updateGuideForm("channel", e.target.value)}
                  placeholder="Channel (optional)"
                />
                <input
                  type="text"
                  value={guideForm.duration}
                  onChange={(e) => updateGuideForm("duration", e.target.value)}
                  placeholder="Duration (e.g. 5:20)"
                />
                <input
                  type="text"
                  value={guideForm.crops}
                  onChange={(e) => updateGuideForm("crops", e.target.value)}
                  placeholder="Crops (comma separated, or leave blank for all)"
                />
                <input
                  type="text"
                  value={guideForm.pests}
                  onChange={(e) => updateGuideForm("pests", e.target.value)}
                  placeholder="Pests (comma separated, or leave blank for all)"
                />
                <textarea
                  value={guideForm.description}
                  onChange={(e) => updateGuideForm("description", e.target.value)}
                  rows={2}
                  placeholder="Short guide summary"
                />
              </div>

              <div className="admin-video-lang-row">
                {GUIDE_LANGUAGE_OPTIONS.map((lang) => (
                  <label key={lang}>
                    <input
                      type="checkbox"
                      checked={guideForm.languages.includes(lang)}
                      onChange={() => toggleGuideLanguage(lang)}
                    />
                    {lang.toUpperCase()}
                  </label>
                ))}
                <label>
                  <input
                    type="checkbox"
                    checked={guideForm.safetyVerified}
                    onChange={(e) => updateGuideForm("safetyVerified", e.target.checked)}
                  />
                  Safety verified
                </label>
              </div>

              <div className="admin-actions-row">
                <button type="button" onClick={addApprovedGuide}>
                  {editingGuideId ? "Update Approved Video" : "Add Approved Video"}
                </button>
                {!!editingGuideId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGuideId("");
                      setGuideForm({
                        title: "",
                        youtubeUrl: "",
                        description: "",
                        channel: "",
                        duration: "",
                        crops: "",
                        pests: "",
                        languages: ["en", "hi", "te"],
                        safetyVerified: true,
                      });
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="admin-video-list">
                {approvedGuides.length === 0 && (
                  <p>No approved spray videos yet.</p>
                )}

                {approvedGuides.map((video) => (
                  <article key={video.id} className="admin-video-card">
                    <div>
                      <strong>{video.title}</strong>
                      <p>{video.description}</p>
                      <p>
                        {video.channel || "Approved by Admin"} | {(video.languages || []).join("/")} | {video.duration || "Guide"}
                      </p>
                      <p>
                        Crops: {(video.crops || ["all"]).join(", ")} | Pests: {(video.pests || ["all"]).join(", ")}
                      </p>
                    </div>
                    <div className="admin-video-actions">
                      <a href={video.youtubeUrl} target="_blank" rel="noreferrer">Open</a>
                      <button type="button" onClick={() => editApprovedGuide(video)}>Edit</button>
                      <button type="button" className="admin-danger-btn" onClick={() => removeApprovedGuide(video.id)}>
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="admin-stats-grid">
              <div className="admin-panel admin-stat-card reveal-up" style={{ animationDelay: "0.02s" }}>
                <h4>Total Users</h4>
                <p>{stats.totalUsers}</p>
              </div>
              <div className="admin-panel admin-stat-card reveal-up" style={{ animationDelay: "0.04s" }}>
                <h4>Admin Users</h4>
                <p>{stats.adminUsers}</p>
              </div>
              <div className="admin-panel admin-stat-card reveal-up" style={{ animationDelay: "0.06s" }}>
                <h4>Normal Users</h4>
                <p>{stats.normalUsers}</p>
              </div>
              <div className="admin-panel admin-stat-card reveal-up" style={{ animationDelay: "0.08s" }}>
                <h4>Live Market Rows</h4>
                <p>{stats.liveMarketRows}</p>
              </div>
              <div className="admin-panel admin-stat-card reveal-up" style={{ animationDelay: "0.1s" }}>
                <h4>Open Messages</h4>
                <p>{stats.openMessages ?? "-"}</p>
              </div>
              <div className="admin-panel admin-stat-card reveal-up" style={{ animationDelay: "0.12s" }}>
                <h4>Replied Messages</h4>
                <p>{stats.repliedMessages ?? "-"}</p>
              </div>
              <div className="admin-panel admin-stat-card reveal-up" style={{ animationDelay: "0.14s" }}>
                <h4>States Covered</h4>
                <p>{insights?.statesCovered ?? (insightsLoading ? "Loading..." : "-")}</p>
              </div>
              <div className="admin-panel admin-stat-card reveal-up" style={{ animationDelay: "0.16s" }}>
                <h4>Districts Covered</h4>
                <p>{insights?.districtsCovered ?? (insightsLoading ? "Loading..." : "-")}</p>
              </div>
              <div className="admin-panel admin-stat-card reveal-up" style={{ animationDelay: "0.18s" }}>
                <h4>Crops Covered</h4>
                <p>{insights?.cropsCovered ?? (insightsLoading ? "Loading..." : "-")}</p>
              </div>
              <div className="admin-panel admin-stat-card reveal-up" style={{ animationDelay: "0.2s" }}>
                <h4>Latest Price Date</h4>
                <p>{insights?.latestPriceDate ?? (insightsLoading ? "Loading..." : "-")}</p>
              </div>
            </div>

            <div className="admin-panel admin-top-crops-card reveal-up" style={{ animationDelay: "0.24s" }}>
              <h3>Top Commodity Load</h3>
              <div className="admin-top-crops-list">
                {topCrops.length === 0 && (
                  <p>{insightsLoading ? "Loading crop insights..." : "No crop insights yet."}</p>
                )}
                {topCrops.map((item, idx) => (
                  <div key={`${item.crop}-${idx}`} className="admin-top-crop-row">
                    <span>{item.crop}</span>
                    <strong>{item.records}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-panel admin-table-card reveal-up" style={{ animationDelay: "0.28s" }}>
            <div className="admin-user-head">
              <h3>User & Role Governance</h3>
              <div className="admin-user-filters">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email"
                />
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                </select>
              </div>
            </div>
            <div className="table-wrap">
              <table className="live-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Role Action</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name || "-"}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <div className="admin-role-actions">
                          <button type="button" onClick={() => updateRole(user.id, "USER")}>Set USER</button>
                          <button type="button" onClick={() => updateRole(user.id, "ADMIN")}>Set ADMIN</button>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-danger-btn"
                          onClick={() => deleteUser(user.id, user.email)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="6">No users match current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

            <div className="admin-panel admin-inbox-card reveal-up" style={{ animationDelay: "0.32s" }}>
            <div className="admin-user-head">
              <h3>Support Inbox</h3>
              <div className="admin-user-filters">
                <select value={messageFilter} onChange={(e) => setMessageFilter(e.target.value)}>
                  <option value="ALL">All Messages</option>
                  <option value="OPEN">OPEN</option>
                  <option value="REPLIED">REPLIED</option>
                </select>
              </div>
            </div>

            <div className="admin-inbox-grid">
              {filteredMessages.map((m) => (
                <div key={m.id} className="admin-message-card">
                  <div className="admin-message-meta">
                    <strong>{m.subject || "General Support"}</strong>
                    <span className={`admin-status ${String(m.status || "OPEN").toLowerCase()}`}>
                      {m.status || "OPEN"}
                    </span>
                  </div>

                  <p className="admin-message-from">
                    {m.name} • {m.email} {m.phone ? `• ${m.phone}` : ""}
                  </p>
                  <p className="admin-message-body">{m.message}</p>

                  {m.adminReply && (
                    <div className="admin-reply-preview">
                      <strong>Last Reply</strong>
                      <p>{m.adminReply}</p>
                    </div>
                  )}

                  <textarea
                    value={replyDrafts[m.id] || ""}
                    onChange={(e) => setReplyDraft(m.id, e.target.value)}
                    placeholder="Type your reply to this user"
                    rows={3}
                  />

                  <button
                    type="button"
                    onClick={() => sendReply(m.id)}
                    disabled={actionBusy === `reply-${m.id}`}
                  >
                    {actionBusy === `reply-${m.id}` ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              ))}

              {filteredMessages.length === 0 && (
                <p>No messages in this filter.</p>
              )}
            </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;



