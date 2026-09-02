document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("tablaInventario");
  try {
    const productos = await obtenerInventario();
    tbody.innerHTML = productos.map(p => `
      <tr>
        <td>${p.nombre}</td>
        <td><span class="badge">${p.categoria}</span></td>
        <td>${p.dosisMlPorLitro} ml/L</td>
        <td>${p.stockLitros} L</td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Error cargando inventario: ${err.message}</td></tr>`;
  }
});
