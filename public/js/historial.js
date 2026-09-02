document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("tablaHistorial");
  try {
    const fumigaciones = await obtenerFumigaciones();
    if (fumigaciones.length === 0) {
      tbody.innerHTML = "<tr><td colspan=\"6\">Aún no hay fumigaciones registradas.</td></tr>";
      return;
    }
    tbody.innerHTML = fumigaciones.slice().reverse().map(f => `
      <tr>
        <td>${new Date(f.fecha).toLocaleString("es-CO")}</td>
        <td>${f.productoNombre}</td>
        <td><span class="badge">${f.categoria}</span></td>
        <td>${f.litrosAplicados} L</td>
        <td>${f.responsable}</td>
        <td>${f.stockRestante} L</td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">Error cargando historial: ${err.message}</td></tr>`;
  }
});
