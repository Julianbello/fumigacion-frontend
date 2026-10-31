(function () {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const username = localStorage.getItem("username") || "Usuario";
  const role = localStorage.getItem("role") || "";

  const MENU = [
    ["dashboard.html", "📊 Dashboard"],
    ["fumigacion.html", "🧪 Registrar Fumigación"],
    ["inventario.html", "📦 Inventario"],
    ["historial.html", "🗒️ Historial"]
  ];

  // Arma la estructura común de todas las páginas (menú lateral y barra superior)
  // alrededor del <main class="content"> que trae cada una.
  function dibujarEstructura() {
    const contenido = document.querySelector("main.content");
    if (!contenido) return;

    const estructura = document.createElement("div");
    estructura.className = "app-shell";
    estructura.innerHTML =
      '<aside class="sidebar">' +
      '<div class="sidebar-brand"><span class="icon">🐛</span> Fumigación</div>' +
      "<nav>" + MENU.map(([href, texto]) => `<a href="${href}">${texto}</a>`).join("") + "</nav>" +
      "</aside>" +
      '<div class="main-area">' +
      '<header class="topbar"><h1></h1>' +
      '<div class="user-box">' +
      '<span id="topbarUserName">Cargando...</span>' +
      '<div class="avatar" id="topbarUserInitial">?</div>' +
      '<button class="btn-logout" id="logoutBtn">Salir</button>' +
      "</div></header>" +
      "</div>";

    estructura.querySelector("h1").textContent = document.body.dataset.titulo || "";
    estructura.querySelector(".main-area").appendChild(contenido);
    document.body.prepend(estructura);
  }

  document.addEventListener("DOMContentLoaded", () => {
    dibujarEstructura();

    const userNameEl = document.getElementById("topbarUserName");
    const userInitialEl = document.getElementById("topbarUserInitial");
    if (userNameEl) userNameEl.textContent = `${username} (${role})`;
    if (userInitialEl) userInitialEl.textContent = username.charAt(0).toUpperCase();

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        window.location.href = "login.html";
      });
    }

    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".sidebar nav a").forEach(link => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      }
    });
  });
})();