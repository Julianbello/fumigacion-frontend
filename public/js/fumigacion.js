document.getElementById("fumigacionForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const payload = {
    productoId: Number(document.getElementById("productoId").value),
    litrosAplicados: Number(document.getElementById("litros").value),
    categoria: document.getElementById("categoria").value
  };
  try {
    const registro = await registrarFumigacion(token, payload);
    document.getElementById("resultado").textContent =
      `Registrada. Stock restante de ${registro.productoNombre}: ${registro.stockRestante} L`;
  } catch (err) {
    document.getElementById("resultado").textContent = `Error: ${err.message}`;
  }
});
