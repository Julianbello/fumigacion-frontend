/**
 * @jest-environment jsdom
 */

// Carga las páginas reales de public/ y comprueba que layout.js arme bien cada una.
const fs = require("fs");
const path = require("path");

const PAGINAS = [
  ["dashboard.html", "Dashboard"],
  ["fumigacion.html", "Registrar Fumigación"],
  ["inventario.html", "Inventario"],
  ["historial.html", "Historial de Fumigaciones"],
];

let manejadores;

beforeEach(() => {
  manejadores = [];
  jest.spyOn(document, "addEventListener").mockImplementation((tipo, fn) => manejadores.push([tipo, fn]));
  localStorage.clear();
  localStorage.setItem("token", "t");
  localStorage.setItem("username", "julian");
  localStorage.setItem("role", "OPERARIO");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe.each(PAGINAS)("página %s", (archivo, titulo) => {
  test("queda con menú, barra superior y su contenido", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "public", archivo), "utf8");
    const pagina = new DOMParser().parseFromString(html, "text/html");

    document.body.innerHTML = pagina.body.innerHTML;
    document.body.dataset.titulo = pagina.body.dataset.titulo;
    window.history.pushState({}, "", `/${archivo}`);
    jest.isolateModules(() => {
      require("../public/js/layout.js");
    });
    manejadores.filter(([tipo]) => tipo === "DOMContentLoaded").forEach(([, fn]) => fn());

    expect(pagina.body.dataset.titulo).toBe(titulo);
    expect(document.querySelector(".app-shell > aside.sidebar nav a.active").getAttribute("href")).toBe(archivo);
    expect(document.querySelector(".app-shell > .main-area > header.topbar h1").textContent).toBe(titulo);
    expect(document.querySelector(".app-shell > .main-area > main.content")).not.toBeNull();
    expect(document.getElementById("topbarUserName").textContent).toBe("julian (OPERARIO)");
  });
});