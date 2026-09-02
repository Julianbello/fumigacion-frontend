const API_BASE = window.API_BASE_URL || "http://localhost:4000/api";

async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error("Credenciales inválidas");
  return res.json();
}

async function registrarFumigacion(token, payload) {
  const res = await fetch(`${API_BASE}/fumigaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}
