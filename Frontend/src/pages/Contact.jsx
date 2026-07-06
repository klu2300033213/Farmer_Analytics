import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { parseJwt } from "../utils/auth";

const CONTACT_API = "http://localhost:8080/api/contact";

function Contact() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const payload = parseJwt(token);

  const defaultEmail = useMemo(() => payload?.sub || "", [payload]);

  const [form, setForm] = useState({
    name: "",
    email: defaultEmail,
    phone: "",
    role: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [myMessages, setMyMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const update = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  useEffect(() => {
    setForm((prev) => ({ ...prev, email: defaultEmail || prev.email }));
  }, [defaultEmail]);

  const loadMyMessages = async () => {
    try {
      setLoadingMessages(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = !token && form.email ? { email: form.email } : {};

      const res = await axios.get(`${CONTACT_API}/my-messages`, { headers, params });
      setMyMessages(res.data || []);
    } catch {
      setMyMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (token || form.email) {
      loadMyMessages();
    }
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setStatus("");
      await axios.post(`${CONTACT_API}/messages`, form);
      setStatus("Message submitted. Admin will reply here.");
      setForm((prev) => ({ ...prev, name: "", phone: "", role: "", subject: "", message: "" }));
      await loadMyMessages();
    } catch (err) {
      setStatus(err.response?.data || "Failed to submit message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-content">
          <p className="contact-eyebrow">Farmer Analytics • Support Desk</p>
          <h1>
            Let’s build smarter farming decisions <br />
            <span>together.</span>
          </h1>
          <p className="contact-subtitle">
            Reach our team for product support, research collaboration, or
            partnership inquiries. We typically respond within 24 hours.
          </p>

          <div className="contact-cta-row">
            <button
              className="hero-btn primary"
              onClick={() => navigate("/select")}
            >
              Go to Analytics →
            </button>
            <button
              className="hero-btn secondary"
              onClick={() => navigate("/about")}
            >
              Learn About the Project
            </button>
          </div>
        </div>
        <div className="contact-hero-panel">
          <div className="contact-mini-card">
            <h3>Response SLA</h3>
            <p>First response in &lt; 24 hours on business days.</p>
          </div>
          <div className="contact-mini-card">
            <h3>Primary Region</h3>
            <p>AP, Telangana & surrounding mandis</p>
          </div>
          <div className="contact-mini-card">
            <h3>Data Update Window</h3>
            <p>Live data refreshes every 60 minutes.</p>
          </div>
        </div>
      </section>

      <section className="contact-grid">
        <div className="contact-card">
          <h2>📞 Contact Channels</h2>
          <div className="contact-list">
            <div>
              <span>Email</span>
              <strong>support@farmeranalytics.in</strong>
            </div>
            <div>
              <span>Phone</span>
              <strong>+91 90000 12345</strong>
            </div>
            <div>
              <span>Office</span>
              <strong>Vijayawada, Andhra Pradesh</strong>
            </div>
            <div>
              <span>Working Hours</span>
              <strong>Mon–Sat · 9:30 AM – 6:30 PM</strong>
            </div>
          </div>
        </div>

        <div className="contact-card">
          <h2>🧠 What to Include</h2>
          <ul>
            <li>Crop, mandi, district, and date of issue</li>
            <li>Screenshot of the dashboard (if possible)</li>
            <li>What result you expected vs. what you saw</li>
            <li>Your contact details for follow‑up</li>
          </ul>
        </div>

        <div className="contact-card">
          <h2>🤝 Partnerships & Research</h2>
          <p>
            We collaborate with agri‑research labs, universities, and policy
            teams to validate forecasting signals and improve farmer outcomes.
            If you’re interested in data partnerships or pilots, reach out.
          </p>
        </div>

        <div className="contact-card">
          <h2>✅ Frequently Asked</h2>
          <ul>
            <li>Live mandi data is based on govt. API records.</li>
            <li>Historical trends are normalized per crop & season.</li>
            <li>PDF reports can be used for cooperative reviews.</li>
            <li>We prioritize issues that affect selling decisions.</li>
          </ul>
        </div>
      </section>

      <section className="contact-form-wrap">
        <div className="contact-form-card">
          <h2>Send a Message</h2>
          <form onSubmit={submit} className="contact-form">
            <div className="contact-field">
              <label>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={update("name")}
                placeholder="Your name"
                required
              />
            </div>
            <div className="contact-field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="name@email.com"
                required
              />
            </div>
            <div className="contact-field">
              <label>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={update("phone")}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div className="contact-field">
              <label>I am a...</label>
              <select value={form.role} onChange={update("role")}
                required
              >
                <option value="">Select</option>
                <option>Farmer</option>
                <option>Researcher</option>
                <option>Student</option>
                <option>Policy Maker</option>
                <option>Business / Partner</option>
              </select>
            </div>
            <div className="contact-field full">
              <label>Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={update("subject")}
                placeholder="Issue type / request title"
                required
              />
            </div>
            <div className="contact-field full">
              <label>Message</label>
              <textarea
                rows="5"
                value={form.message}
                onChange={update("message")}
                placeholder="Tell us what you need help with..."
                required
              />
            </div>

            <div className="contact-actions">
              <button className="hero-btn primary" type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Submit Request"}
              </button>
              <p>{status || "We’ll reply within 24 hours."}</p>
            </div>
          </form>
        </div>
      </section>

      <section className="contact-form-wrap">
        <div className="contact-form-card contact-inbox-card">
          <div className="contact-inbox-head">
            <h2>Inbox & Admin Replies</h2>
            <button className="hero-btn secondary" onClick={loadMyMessages} type="button">
              Refresh Replies
            </button>
          </div>

          {loadingMessages && <p>Loading your messages...</p>}
          {!loadingMessages && myMessages.length === 0 && (
            <p>No messages yet. Submit a request above to start conversation.</p>
          )}

          <div className="contact-thread-list">
            {myMessages.map((m) => (
              <div className="contact-thread-item" key={m.id}>
                <div className="contact-thread-meta">
                  <strong>{m.subject}</strong>
                  <span className={`contact-status ${String(m.status || "OPEN").toLowerCase()}`}>
                    {m.status}
                  </span>
                </div>
                <p className="contact-thread-body">{m.message}</p>
                {m.adminReply ? (
                  <div className="contact-admin-reply">
                    <strong>Admin Reply</strong>
                    <p>{m.adminReply}</p>
                  </div>
                ) : (
                  <p className="contact-awaiting">Awaiting admin response...</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
