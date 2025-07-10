let materias = [];
let aprobadas = new Set();
const colores = ["#e6f7ff", "#fff0f6", "#f9f0ff", "#f6ffed", "#fffbe6", "#f0f5ff", "#f0fff0", "#fff7e6", "#e6fffb", "#fff1f0"];

function cargarAprobadas() {
  const saved = localStorage.getItem("aprobadas");
  if (saved) {
    try {
      const array = JSON.parse(saved);
      aprobadas = new Set(array);
    } catch (e) {
      aprobadas = new Set();
    }
  }
}

function guardarAprobadas() {
  localStorage.setItem("aprobadas", JSON.stringify([...aprobadas]));
}

function renderMalla() {
  const contenedor = document.getElementById("malla");
  contenedor.innerHTML = "";

  for (let anio = 1; anio <= 5; anio++) {
    const detalles = document.createElement("details");
    detalles.className = "anio";
    const resumen = document.createElement("summary");
    resumen.textContent = `Año ${anio}`;
    detalles.appendChild(resumen);

    for (let cuatr = 1; cuatr <= 2; cuatr++) {
      const fila = document.createElement("div");
      fila.className = "cuatrimestre";

      const materiasFiltradas = materias.filter(m => m.anio === anio && m.cuatrimestre === cuatr);
      materiasFiltradas.forEach(mat => {
        const bloque = document.createElement("div");
        bloque.className = "materia";
        bloque.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];

        let deshabilitado = false;
        for (let cor of mat.correlativas) {
          if (!aprobadas.has(cor)) {
            deshabilitado = true;
            break;
          }
        }

        if (deshabilitado) bloque.classList.add("locked");
        if (aprobadas.has(mat.nombre)) bloque.classList.add("tachado");

        bloque.textContent = mat.nombre;

        bloque.addEventListener("click", () => {
          if (deshabilitado) return;
          if (aprobadas.has(mat.nombre)) {
            aprobadas.delete(mat.nombre);
          } else {
            aprobadas.add(mat.nombre);
          }
          guardarAprobadas();
          renderMalla();
          calcularAvance();
        });

        fila.appendChild(bloque);
      });

      detalles.appendChild(fila);
    }

    contenedor.appendChild(detalles);
  }
}

function calcularAvance() {
  let total = materias.length;
  let done = 0;
  materias.forEach(m => {
    if (aprobadas.has(m.nombre)) done++;
  });
  const porcentaje = Math.round((done / total) * 100);
  document.getElementById("avance").innerText = `Avance: ${done} de ${total} materias (${porcentaje}%)`;
}

fetch("materias.json")
  .then(res => res.json())
  .then(data => {
    materias = data;
    cargarAprobadas();
    renderMalla();
    calcularAvance();
  });
