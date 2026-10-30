document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("tablaHistorial");
  try {
    const fumigaciones = await obtenerFumigaciones();
    if (fumigaciones.length === 0) {
      tbody.innerHTML = "<tr><td colspan=\"6\">Aún no hay fumigaciones registradas.</td></tr>";
      return;
    }
    tbody.innerHTML = fumigaciones.slice().reverse().map(f => filaFumigacion(f, true)).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">Error cargando historial: ${escapeHtml(err.message)}</td></tr>`;
  }
});