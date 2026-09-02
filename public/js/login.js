document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  try {
    const { token, role } = await login(username, password);
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    window.location.href = "fumigacion.html";
  } catch (err) {
    document.getElementById("mensaje").textContent = err.message;
  }
});
