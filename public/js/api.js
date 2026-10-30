const API_BASE =
  (typeof window !== "undefined" && window.API_BASE_URL) ||
  "https://fumigacion-backend-julianbello.azurewebsites.net/api";

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

// Envía un POST con JSON; por defecto sin token (login y registro).
function enviar(ruta, cuerpo, headers = { "Content-Type": "application/json" }) {
  return fetch(`${API_BASE}${ruta}`, { method: "POST", headers, body: JSON.stringify(cuerpo) });
}

// Pide datos con token y lanza el mensaje indicado si el servidor responde con error.
async function obtener(ruta, mensajeError) {
  const res = await fetch(`${API_BASE}${ruta}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(mensajeError);
  return res.json();
}

async function login(username, password) {
  const res = await enviar("/auth/login", { username, password });
  if (!res.ok) throw new Error("Credenciales inválidas");
  return res.json();
}

async function registrarUsuario(username, password) {
  const res = await enviar("/auth/register", { username, password });
  if (!res.ok) throw new Error(await mensajeDeError(res, "No se pudo crear la cuenta"));
  return res.json();
}

async function registrarFumigacion(payload) {
  const res = await enviar("/fumigaciones", payload, authHeaders());
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

function obtenerFumigaciones() {
  return obtener("/fumigaciones", "No se pudo cargar el historial");
}

function obtenerInventario() {
  return obtener("/fumigaciones/inventario", "No se pudo cargar el inventario");
}

function obtenerTipos() {
  return obtener("/productos/tipos", "No se pudieron cargar los tipos de producto");
}

async function crearTipoProducto(nombre) {
  const res = await enviar("/productos/tipos", { nombre }, authHeaders());
  if (!res.ok) throw new Error(await mensajeDeError(res, "No se pudo crear el tipo"));
  return res.json();
}

async function crearProducto(payload) {
  const res = await enviar("/productos", payload, authHeaders());
  if (!res.ok) throw new Error(await mensajeDeError(res, "No se pudo crear el producto"));
  return res.json();
}

// Guarda en el navegador los datos de la sesión iniciada.
function guardarSesion(token, role, username) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("username", username);
}

// Arma la fila de la tabla de fumigaciones (con o sin la columna de stock restante).
function filaFumigacion(f, conStock) {
  const producto = typeof f.productoId === "object" ? f.productoId?.nombre : f.productoNombre || "N/A";
  return `
    <tr>
      <td>${new Date(f.fecha).toLocaleString("es-CO")}</td>
      <td>${escapeHtml(producto)}</td>
      <td><span class="badge">${escapeHtml(f.categoria)}</span></td>
      <td>${escapeHtml(f.litrosAplicados)} L</td>
      <td>${escapeHtml(f.responsable)}</td>
      ${conStock ? `<td>${escapeHtml(f.stockRestante)} L</td>` : ""}
    </tr>
  `;
}

// Permite probar este archivo con Jest; en el navegador "module" no existe y no hace nada.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    authHeaders, escapeHtml, mensajeDeError, login, registrarUsuario, registrarFumigacion,
    obtenerFumigaciones, obtenerInventario, obtenerTipos, crearTipoProducto, crearProducto,
    guardarSesion, filaFumigacion
  };
}