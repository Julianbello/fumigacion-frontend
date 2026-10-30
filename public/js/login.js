document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const mensaje = document.getElementById("mensaje");
  mensaje.className = "mensaje";
  mensaje.textContent = "";

  try {
    const { token, role } = await login(username, password);
    guardarSesion(token, role, username);
    window.location.href = "dashboard.html";
  } catch (err) {
    mensaje.classList.add("error");
    mensaje.textContent = err.message;
  }
});