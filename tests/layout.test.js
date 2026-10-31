/**
 * @jest-environment jsdom
 */

let manejadores;

function cargar(html) {
  document.body.innerHTML = html;
  jest.isolateModules(() => {
    require("../public/js/layout.js");
  });
}

const disparar = () => manejadores.filter(([tipo]) => tipo === "DOMContentLoaded").forEach(([, fn]) => fn());

beforeEach(() => {
  manejadores = [];
  jest.spyOn(document, "addEventListener").mockImplementation((tipo, fn) => manejadores.push([tipo, fn]));
  jest.spyOn(console, "error").mockImplementation(() => {});
  localStorage.clear();
  delete document.body.dataset.titulo;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("layout.js", () => {
  // Cada página trae solo su <main>; layout.js arma el menú y la barra superior a su alrededor.
  const html = `<main class="content"><p id="contenido">Hola</p></main>`;

  test("sin token redirige al login y deja la página como está", () => {
    document.body.dataset.titulo = "Inventario";
    cargar(html);
    disparar();
    expect(document.querySelector(".app-shell")).toBeNull();
    expect(document.getElementById("contenido")).not.toBeNull();
  });

  test("con sesión arma el menú, la barra con el título y deja el contenido dentro", () => {
    localStorage.setItem("token", "t");
    localStorage.setItem("username", "julian");
    localStorage.setItem("role", "OPERARIO");
    document.body.dataset.titulo = "Inventario";

    cargar(html);
    disparar();

    const enlaces = [...document.querySelectorAll(".sidebar nav a")].map((a) => a.getAttribute("href"));
    expect(enlaces).toEqual(["dashboard.html", "fumigacion.html", "inventario.html", "historial.html"]);
    expect(document.querySelector(".topbar h1").textContent).toBe("Inventario");
    expect(document.querySelector(".main-area > main.content #contenido")).not.toBeNull();
  });

  test("con sesión muestra el usuario, marca la página activa y permite salir", () => {
    localStorage.setItem("token", "t");
    localStorage.setItem("username", "julian");
    localStorage.setItem("role", "OPERARIO");
    document.body.dataset.titulo = "Inventario";
    window.history.pushState({}, "", "/inventario.html");

    cargar(html);
    disparar();

    expect(document.getElementById("topbarUserName").textContent).toBe("julian (OPERARIO)");
    expect(document.getElementById("topbarUserInitial").textContent).toBe("J");
    expect(document.querySelector('a[href="inventario.html"]').classList.contains("active")).toBe(true);
    expect(document.querySelector('a[href="dashboard.html"]').classList.contains("active")).toBe(false);

    document.getElementById("logoutBtn").click();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("username")).toBeNull();
  });

  test("el título nunca se interpreta como HTML", () => {
    localStorage.setItem("token", "t");
    document.body.dataset.titulo = "<img src=x onerror=alert(1)>";
    cargar(html);
    disparar();
    expect(document.querySelector(".topbar img")).toBeNull();
    expect(document.querySelector(".topbar h1").textContent).toContain("<img");
  });

  test("si la página no tiene <main class='content'> no rompe nada", () => {
    localStorage.setItem("token", "t");
    cargar("<p>sin contenido</p>");
    expect(() => disparar()).not.toThrow();
    expect(document.querySelector(".app-shell")).toBeNull();
  });
});