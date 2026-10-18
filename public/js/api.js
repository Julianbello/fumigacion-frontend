const API_BASE = window.API_BASE_URL || "https://fumigacion-backend-julianbello.azurewebsites.net/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error("Credenciales inválidas");
  return res.json();
}

async function registrarFumigacion(payload) {
  const res = await fetch(`${API_BASE}/fumigaciones`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

async function obtenerFumigaciones() {
  const res = await fetch(`${API_BASE}/fumigaciones`, { headers: authHeaders() });
  if (!res.ok) throw new Error("No se pudo cargar el historial");
  return res.json();
}

async function obtenerInventario() {
  const res = await fetch(`${API_BASE}/fumigaciones/inventario`, { headers: authHeaders() });
  if (!res.ok) throw new Error("No se pudo cargar el inventario");
  return res.json();
}
