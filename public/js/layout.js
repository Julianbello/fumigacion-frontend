(function () {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const username = localStorage.getItem("username") || "Usuario";
  const role = localStorage.getItem("role") || "";

  document.addEventListener("DOMContentLoaded", () => {
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
