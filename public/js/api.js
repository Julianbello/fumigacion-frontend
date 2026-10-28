const API_BASE = window.API_BASE_URL || "https://fumigacion-backend-julianbello.azurewebsites.net/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// Evita que texto escrito por usuarios se interprete como HTML (XSS).
function escapeHtml(valor) {
  const reemplazos = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(valor ?? "").replace(/[&<>"']/g, (c) => reemplazos[c]);
}

async function mensajeDeError(res, porDefecto) {
  try {
    const data = await res.json();
    return data.error || porDefecto;
  } catch {
    return porDefecto;
  }
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

async function registrarUsuario(username, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error(await mensajeDeError(res, "No se pudo crear la cuenta"));
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

async function obtenerTipos() {
  const res = await fetch(`${API_BASE}/productos/tipos`, { headers: authHeaders() });
  if (!res.ok) throw new Error("No se pudieron cargar los tipos de producto");
  return res.json();
}

async function crearTipoProducto(nombre) {
  const res = await fetch(`${API_BASE}/productos/tipos`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ nombre })
  });
  if (!res.ok) throw new Error(await mensajeDeError(res, "No se pudo crear el tipo"));
  return res.json();
}

async function crearProducto(payload) {
  const res = await fetch(`${API_BASE}/productos`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await mensajeDeError(res, "No se pudo crear el producto"));
  return res.json();
}