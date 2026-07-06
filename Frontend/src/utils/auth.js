export function parseJwt(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getCurrentRole() {
  const storedRole = localStorage.getItem("role");
  if (storedRole) return storedRole.toUpperCase();

  const token = localStorage.getItem("token");
  const payload = parseJwt(token);
  const role = (payload?.role || "USER").toUpperCase();
  localStorage.setItem("role", role);
  return role;
}
