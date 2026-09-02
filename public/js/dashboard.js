document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [fumigaciones, productos] = await Promise.all([
      obtenerFumigaciones(),
      obtenerInventario()
    ]);
    document.getElementById("statFumigaciones").textContent = fumigaciones.length;
    document.getElementById("statProductos").textContent = productos.length;
    document.getElementById("statStockBajo").textContent =
      productos.filter(p => p.stockLitros < 5).length;
    const tbody = document.getElementById("tablaUltimas");
    const ultimas = fumigaciones.slice(-5).reverse();
    if (ultimas.length === 0) {
      tbody.innerHTML = "<tr><td colspan=\"5\">Aún no hay fumigaciones registradas.</td></tr>";
      return;
    }
    tbody.innerHTML = ultimas.map(f => {
      const prodNombre = typeof f.productoId === 'object' ? f.productoId?.nombre : (f.productoNombre || 'N/A');
      return `
        <tr>
          <td>${new Date(f.fecha).toLocaleString("es-CO")}</td>
          <td>${prodNombre}</td>
          <td><span class="badge">${f.categoria}</span></td>
          <td>${f.litrosAplicados} L</td>
          <td>${f.responsable}</td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    document.getElementById("tablaUltimas").innerHTML =
      `<tr><td colspan="5">Error cargando datos: ${err.message}</td></tr>`;
  }
});
