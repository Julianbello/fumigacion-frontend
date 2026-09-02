document.getElementById("fumigacionForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const resultado = document.getElementById("resultado");
  resultado.className = "mensaje";

  const payload = {
    productoId: Number(document.getElementById("productoId").value),
    litrosAplicados: Number(document.getElementById("litros").value),
    categoria: document.getElementById("categoria").value
  };

  try {
    const registro = await registrarFumigacion(payload);
    resultado.classList.add("exito");
    resultado.textContent =
      `Registrada correctamente. Stock restante de ${registro.productoNombre}: ${registro.stockRestante} L`;
    document.getElementById("fumigacionForm").reset();
  } catch (err) {
    resultado.classList.add("error");
    resultado.textContent = `Error: ${err.message}`;
  }
});
