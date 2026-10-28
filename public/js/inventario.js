function mostrarMensaje(elemento, clase, texto) {
  elemento.className = "mensaje";
  elemento.classList.add(clase);
  elemento.textContent = texto;
}

async function cargarInventario() {
  const tbody = document.getElementById("tablaInventario");
  try {
    const productos = await obtenerInventario();
    if (productos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">Todavía no hay productos. Agrega el primero.</td></tr>';
      return;
    }
    tbody.innerHTML = productos.map(p => `
      <tr>
        <td>${escapeHtml(p.nombre)}</td>
        <td><span class="badge">${escapeHtml(p.categoria)}</span></td>
        <td>${escapeHtml(p.dosisMlPorLitro)} ml/L</td>
        <td>${escapeHtml(p.stockLitros)} L</td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Error cargando inventario: ${escapeHtml(err.message)}</td></tr>`;
  }
}

async function cargarTipos(seleccionar) {
  const select = document.getElementById("productoTipo");
  try {
    const tipos = await obtenerTipos();
    select.innerHTML = '<option value="">-- Selecciona un tipo --</option>' +
      tipos.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join("");
    if (seleccionar) select.value = seleccionar;
  } catch (err) {
    select.innerHTML = '<option value="">Error al cargar los tipos</option>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarInventario();
  cargarTipos();

  document.getElementById("tipoForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const mensaje = document.getElementById("mensajeTipo");
    try {
      const tipo = await crearTipoProducto(document.getElementById("tipoNombre").value);
      mostrarMensaje(mensaje, "exito", `Tipo "${tipo.nombre}" agregado`);
      document.getElementById("tipoForm").reset();
      await cargarTipos(tipo.nombre);
    } catch (err) {
      mostrarMensaje(mensaje, "error", err.message);
    }
  });

  document.getElementById("productoForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const mensaje = document.getElementById("mensajeProducto");
    const payload = {
      nombre: document.getElementById("productoNombre").value,
      categoria: document.getElementById("productoTipo").value,
      dosisMlPorLitro: Number(document.getElementById("productoDosis").value),
      stockLitros: Number(document.getElementById("productoStock").value)
    };
    try {
      const producto = await crearProducto(payload);
      mostrarMensaje(mensaje, "exito", `Producto "${producto.nombre}" agregado`);
      document.getElementById("productoForm").reset();
      await cargarInventario();
    } catch (err) {
      mostrarMensaje(mensaje, "error", err.message);
    }
  });
});