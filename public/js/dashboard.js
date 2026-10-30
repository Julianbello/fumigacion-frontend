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
    tbody.innerHTML = ultimas.map(f => filaFumigacion(f, false)).join("");
  } catch (err) {
    document.getElementById("tablaUltimas").innerHTML =
      `<tr><td colspan="5">Error cargando datos: ${escapeHtml(err.message)}</td></tr>`;
  }
});