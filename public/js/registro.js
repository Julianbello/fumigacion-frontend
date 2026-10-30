document.getElementById("registroForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmar = document.getElementById("confirmar").value;
  const mensaje = document.getElementById("mensaje");
  mensaje.className = "mensaje";
  mensaje.textContent = "";

  if (password !== confirmar) {
    mensaje.classList.add("error");
    mensaje.textContent = "Las contraseñas no coinciden";
    return;
  }

  try {
    await registrarUsuario(username, password);
    const { token, role } = await login(username, password);
    guardarSesion(token, role, username);
    mensaje.classList.add("exito");
    mensaje.textContent = "Cuenta creada. Entrando...";
    window.location.href = "dashboard.html";
  } catch (err) {
    mensaje.classList.add("error");
    mensaje.textContent = err.message;
  }
});