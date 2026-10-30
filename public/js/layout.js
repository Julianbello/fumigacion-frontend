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

  // Dibuja el menú lateral y la barra superior, que son iguales en todas las páginas.
  function dibujarEstructura() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.innerHTML =
        '<div class="sidebar-brand"><span class="icon">🐛</span> Fumigación</div>' +
        "<nav>" + MENU.map(([href, texto]) => `<a href="${href}">${texto}</a>`).join("") + "</nav>";
    }

    const topbar = document.getElementById("topbar");
    if (topbar) {
      topbar.innerHTML =
        "<h1></h1>" +
        '<div class="user-box">' +
        '<span id="topbarUserName">Cargando...</span>' +
        '<div class="avatar" id="topbarUserInitial">?</div>' +
        '<button class="btn-logout" id="logoutBtn">Salir</button>' +
        "</div>";
      topbar.querySelector("h1").textContent = topbar.dataset.titulo || "";
    }
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