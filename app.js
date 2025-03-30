// Variables globales
let puntaje = 0;
let puntajeRequerido = 200;
let historial = [];
let intentosRestantes = 3;
let tablas = [1, 2];
let respuestaCorrecta;
let nivel = 1;
let tipoDivision;
const tiempoInicial = prompt(
  "¿Cuánto tiempo deseas por pregunta (en segundos)?"
);
let tiempoRestante = tiempoInicial;
let temporizador;

function verificarRespuesta(tiempoAgotado = false) {
  const respuestaUsuario = obtenerRespuestaUsuario(tiempoAgotado);
  const resultadoElement = document.querySelector(".texto__parrafo");

  if (validarEntrada(tiempoAgotado, respuestaUsuario, resultadoElement)) {
    actualizarInterfaz();
    return;
  }

  clearInterval(temporizador);
  tiempoAgotado = false;

  let esCorrecta;
  if (tipoDivision === "restos") {
    const [dividendo] = document
      .querySelector("h1")
      .textContent.split(" x ? =")[1]
      .trim()
      .split(" o menos");
    const divisor = parseInt(
      document.querySelector("h1").textContent.split(" x ")[0]
    );
    esCorrecta =
      respuestaUsuario.cociente === respuestaCorrecta.cociente &&
      respuestaUsuario.resto === respuestaCorrecta.resto &&
      divisor * respuestaUsuario.cociente + respuestaUsuario.resto ===
        parseInt(dividendo);
  } else {
    esCorrecta = respuestaUsuario === respuestaCorrecta;
  }

  if (esCorrecta) {
    manejarRespuestaCorrecta(resultadoElement);
  } else if (tiempoAgotado) {
    manejarTiempoAgotado(resultadoElement);
  } else {
    manejarRespuestaIncorrecta(resultadoElement, respuestaUsuario);
  }

  actualizarHistorialRespuesta(tiempoAgotado, respuestaUsuario, esCorrecta);
  verificarSubirNivel();
  actualizarInterfaz();
}

function obtenerRespuestaUsuario(tiempoAgotado) {
  if (tiempoAgotado) return null;
  const cociente = parseInt(document.getElementById("valorUsuario").value, 10);
  if (tipoDivision === "restos") {
    const restoInput = document.getElementById("restoUsuario").value;
    const resto = restoInput === "" ? 0 : parseInt(restoInput, 10);
    return { cociente, resto };
  }
  return cociente;
}

function validarEntrada(tiempoAgotado, respuestaUsuario, resultadoElement) {
  if (!tiempoAgotado) {
    if (tipoDivision === "restos") {
      if (
        isNaN(respuestaUsuario.cociente) ||
        (respuestaUsuario.resto !== 0 && isNaN(respuestaUsuario.resto))
      ) {
        resultadoElement.textContent =
          "⛔ Debes ingresar números válidos para el cociente y el resto ⛔";
        resultadoElement.style.color = "red";
        agitarContenedor();
        return true;
      }
    } else if (isNaN(respuestaUsuario)) {
      resultadoElement.textContent = "⛔ Debes ingresar un número ⛔";
      resultadoElement.style.color = "red";
      agitarContenedor();
      return true;
    }
  }
  return false;
}

function manejarTiempoAgotado(resultadoElement) {
  clearInterval(temporizador);
  const respuestaCorrectaTexto = formatearRespuestaCorrecta();
  resultadoElement.textContent = `⏰ Tiempo agotado ⏰
  La respuesta correcta era ${respuestaCorrectaTexto}.`;
  resultadoElement.style.color = "red";
  mensajeConsola(
    "red",
    `⏰ Tiempo agotado. La respuesta correcta era ${respuestaCorrectaTexto}.`
  );
  deshabilitarControles();
  ajustarPuntaje(-10);
  mostrarHistorial();
}

function actualizarInterfazDivision() {
  const restoInput = document.getElementById("restoUsuario");
  if (tipoDivision === "restos") {
    restoInput.style.display = "inline-block";
  } else {
    restoInput.style.display = "none";
  }
}

function mensajeConsola(tipo = "log", mensaje) {
  if (tipo != "log") {
    console.log(
      `[${new Date().toLocaleTimeString()}] %c${mensaje}`,
      `color: ${tipo}`
    );
  } else {
    console.log(`[${new Date().toLocaleTimeString()}] ${mensaje}`);
  }
}

function manejarRespuestaCorrecta(resultadoElement) {
  clearInterval(temporizador);
  resultadoElement.textContent = "✅ ¡Correcto! ✅";
  resultadoElement.style.color = "green";
  deshabilitarControles();
  ajustarPuntaje(10);
  mostrarHistorial(); // Asegúrate de que esta línea esté presente
  mensajeConsola(
    "green",
    `✅ Respuesta correcta. La respuesta era ${formatearRespuestaCorrecta()}. 📈 Puntaje +10`
  );
}

function manejarRespuestaIncorrecta(resultadoElement, respuestaUsuario) {
  intentosRestantes--;
  if (intentosRestantes > 0) {
    manejarIntentosRestantes(resultadoElement, respuestaUsuario);
  } else {
    manejarSinIntentosRestantes(resultadoElement, respuestaUsuario);
  }
}

function manejarIntentosRestantes(resultadoElement, respuestaUsuario) {
  resultadoElement.textContent = `❌ ¡Incorrecto! ❌
  Intentos restantes: ${intentosRestantes}`;
  resultadoElement.style.color = "red";
  ajustarPuntaje(-5);
  reiniciarTemporizador();
  agitarContenedor();
  mensajeConsola(
    "orange",
    `❌ Respuesta incorrecta. Tu respuesta: ${respuestaUsuario}. Intentos restantes: ${intentosRestantes}. 📉 Puntaje -5`
  );
}

function manejarSinIntentosRestantes(resultadoElement, respuestaUsuario) {
  clearInterval(temporizador);
  const respuestaCorrectaTexto = formatearRespuestaCorrecta();
  resultadoElement.textContent = `❌ ¡Incorrecto! ❌
  La respuesta correcta era ${respuestaCorrectaTexto}.`;
  deshabilitarControles();
  ajustarPuntaje(-25);
  mostrarHistorial();
  agitarContenedor();
  mensajeConsola(
    "red",
    `🚫 Sin intentos restantes. Tu respuesta: ${respuestaUsuario}. Respuesta correcta: ${respuestaCorrectaTexto}. 📉 Puntaje -25`
  );
}

function deshabilitarControles() {
  document.getElementById("reiniciar").disabled = false;
  document.getElementById("intentoBoton").disabled = true;
  document.getElementById("valorUsuario").disabled = true;
}

function ajustarPuntaje(puntos) {
  puntaje = Math.max(0, puntaje + puntos);
}

function actualizarHistorialRespuesta(
  tiempoAgotado,
  respuestaUsuario,
  esCorrecta
) {
  let respuestaFormateada;
  if (tipoDivision === "restos") {
    respuestaFormateada = `${respuestaUsuario.cociente} con resto ${respuestaUsuario.resto}`;
  } else {
    respuestaFormateada = respuestaUsuario.toString();
  }

  historial.push({
    pregunta: document.querySelector("h1").textContent,
    respuestaUsuario: tiempoAgotado ? "Tiempo agotado" : respuestaFormateada,
    correcta: esCorrecta,
  });
}

function actualizarInterfaz() {
  actualizarHistorial();
  actualizarPuntajeEnPantalla();
  document.getElementById("valorUsuario").value = "";
  document.getElementById("restoUsuario").value = "";
}

function reiniciarJuego() {
  reiniciarVariables();
  actualizarInterfazUsuario();
  reiniciarElementosJuego();
  ocultarHistorial();
  reiniciarTemporizador();
  actualizarPuntajeEnPantalla();
  enfocarInputUsuario();
  document.getElementById("valorUsuario").value = "";
  document.getElementById("restoUsuario").value = "";
}

function reiniciarVariables() {
  intentosRestantes = 3;
}

function actualizarInterfazUsuario() {
  actualizarTextoParrafo();
  actualizarEstadoBotones();
}

function actualizarTextoParrafo() {
  const parrafo = document.querySelector(".texto__parrafo");
  parrafo.textContent = `Intenta resolver la división ${
    tipoDivision === "exactas" ? "exacta" : "con restos"
  }.`;
  parrafo.style.color = "white";
}

function actualizarEstadoBotones() {
  document.getElementById("reiniciar").disabled = true;
  document.getElementById("intentoBoton").disabled = false;
  document.getElementById("valorUsuario").disabled = false;
}

function reiniciarElementosJuego() {
  mostrarPregunta();
}

function ocultarHistorial() {
  document.querySelector(".container__historial").style.display = "none";
}

function enfocarInputUsuario() {
  document.getElementById("valorUsuario").focus();
}

function finalizarJuego() {
  ocultarContenedorPrincipal();
  mostrarHistorialFinal();
  mostrarMensajeFinal();
  actualizarHistorial();
  mostrarFiesta(500);
  mensajeConsola(
    "lightblue",
    "🏁 Juego finalizado, historial debería ser visible ahora"
  );
}

function ocultarContenedorPrincipal() {
  const contenedor = document.querySelector(".container");
  if (contenedor) {
    contenedor.style.display = "none";
  } else {
    mensajeConsola("red", "🔎 El contenedor principal no se encontró");
  }
}

function mostrarHistorialFinal() {
  const historialContainer = document.querySelector(".container__historial");
  if (historialContainer) {
    historialContainer.style.display = "block";
  } else {
    mensajeConsola("red", "🔎 El contenedor del historial no se encontró");
  }
}

function mostrarMensajeFinal() {
  const mensajeFinal = crearElementoMensajeFinal();
  document.body.appendChild(mensajeFinal);
  mensajeConsola(
    "green",
    "🎉 ¡Felicidades! Has completado todas las divisiones!"
  );
}

function crearElementoMensajeFinal() {
  const mensajeFinal = document.createElement("div");
  mensajeFinal.className = "mensaje-final";
  mensajeFinal.innerHTML = `
    <h1>¡Felicidades! Has completado todas las divisiones!</h1>
    <p>Has practicado todas las divisiones del juego.</p>
    <h2>Tu recorrido:</h2>
    ${generarHistorialHTML()}
    <button onclick="location.reload()">Volver a jugar</button>
  `;
  return mensajeFinal;
}

function generarHistorialHTML() {
  return `
    <div class="historial-final">
      <ul>
        ${historial
          .map(
            (item) => `
          <li>
            ${item.pregunta} =
            ${
              item.respuestaUsuario === "Tiempo agotado"
                ? "⏳"
                : `${item.respuestaUsuario} ${item.correcta ? "✅" : "❌"}`
            }
          </li>
        `
          )
          .join("")}
      </ul>
    </div>
  `;
}

function actualizarHistorial() {
  const historialLista = obtenerListaHistorial();
  if (!historialLista) return;
  limpiarListaHistorial(historialLista);
  agregarElementosHistorial(historialLista);
  scrollHistorialAlFinal(historialLista);
}

function scrollHistorialAlFinal(lista) {
  lista.scrollTop = lista.scrollHeight;
}

function obtenerListaHistorial() {
  const historialLista = document.getElementById("historial-lista");
  if (!historialLista) {
    mensajeConsola("red", "La lista del historial no se encontró");
    return null;
  }
  return historialLista;
}

function limpiarListaHistorial(lista) {
  lista.innerHTML = "";
}

function agregarElementosHistorial(lista) {
  historial.forEach((item) => {
    const li = crearElementoHistorial(item);
    lista.appendChild(li);
  });
}

function crearElementoHistorial(item) {
  const li = document.createElement("li");
  li.textContent = formatearTextoHistorial(item);
  return li;
}

function formatearTextoHistorial(item) {
  let estadoRespuesta;
  if (item.respuestaUsuario === "Tiempo agotado") {
    estadoRespuesta = "⏳"; // Emoji de reloj de arena
  } else {
    estadoRespuesta = item.correcta ? "✅" : "❌";
  }
  return `${item.pregunta} = ${item.respuestaUsuario} [${estadoRespuesta}]`;
}

function formatearRespuestaCorrecta() {
  if (typeof respuestaCorrecta === "object") {
    // Para divisiones con resto
    return `${respuestaCorrecta.cociente} con resto ${respuestaCorrecta.resto}`;
  } else {
    // Para divisiones exactas
    return respuestaCorrecta.toString();
  }
}

function verificarSubirNivel() {
  if (puntaje >= puntajeRequerido) {
    if (esNivelMaximo()) {
      finalizarJuego();
      return;
    }
    subirNivel();
    actualizarTablas();
    actualizarInterfazNuevoNivel();
  }
}

function esNivelMaximo() {
  return tablas.includes(10);
}

function subirNivel() {
  puntaje = 0;
  nivel++;
  mostrarFiesta();
  mensajeConsola("green", `🎉 Has pasado al nivel ${nivel}!`);
}

function actualizarTablas() {
  tablas.push(tablas.at(-1) + 1);
  if (tablas.length > 2) {
    tablas = tablas.slice(-2);
  }
  mensajeConsola("purple", `🔢 Tablas actuales: ${tablas.join(" y ")}`);
}

function actualizarInterfazNuevoNivel() {
  document.querySelector(".texto__parrafo").textContent =
    "¡Has superado el nivel!";
  reiniciarJuego();
  actualizarPuntajeEnPantalla();
}
let tiempoAgotado = false;
function actualizarTemporizador() {
  const temporizadorElement = document.getElementById("temporizador");
  const resultadoElement = document.querySelector(".texto__parrafo");

  if (tiempoRestante <= 0) {
    clearInterval(temporizador);
    temporizadorElement.textContent = `Tiempo: 0s`;
    temporizadorElement.className = "tiempo-rojo";

    // Verificar si no hay un mensaje de error antes de considerar el tiempo agotado
    if (resultadoElement.textContent !== "⛔ Debes ingresar un número ⛔") {
      agitarContenedor();
      verificarRespuesta(true); // Llamar a verificarRespuesta con tiempoAgotado = true
    }
    return;
  }

  temporizadorElement.textContent = `Tiempo: ${tiempoRestante}s`;

  // Actualizar el color basado en el tiempo restante
  if (tiempoRestante > (tiempoInicial / 4) * 3) {
    temporizadorElement.className = "tiempo-verde";
  } else if (tiempoRestante > tiempoInicial / 2) {
    temporizadorElement.className = "tiempo-amarillo";
  } else if (tiempoRestante > tiempoInicial / 4) {
    temporizadorElement.className = "tiempo-naranja";
  } else {
    temporizadorElement.className = "tiempo-rojo";
  }

  tiempoRestante--;
}

function reiniciarTemporizador() {
  clearInterval(temporizador);
  tiempoRestante = tiempoInicial;
  tiempoAgotado = false;
  temporizador = setInterval(actualizarTemporizador, 1000);
}

function actualizarPuntajeEnPantalla() {
  document.getElementById(
    "puntaje"
  ).textContent = `Experiencia: ${puntaje}/${puntajeRequerido} | Nivel: ${nivel} | Tablas actuales: ${tablas.join(
    " y "
  )}`;
}

// Generar una multiplicación aleatoria
function generarDivision(tipoDivision) {
  const divisor = tablas[Math.floor(Math.random() * tablas.length)];
  const cociente = Math.floor(Math.random() * 9) + 1; // Genera cocientes del 1 al 9
  const dividendo = divisor * cociente;

  if (tipoDivision === "exactas") {
    return { dividendo, divisor, cociente };
  } else {
    const restoMaximo = divisor - 1; // El resto máximo posible
    const resto = Math.floor(Math.random() * restoMaximo) + 1; // Genera un resto entre 1 y (divisor - 1)
    return { dividendo: dividendo + resto, divisor, cociente, resto };
  }
}

function preguntarTipoDivision() {
  tipoDivision = prompt(
    "¿Quieres practicar divisiones exactas o con restos? (exactas/restos)"
  );
  if (tipoDivision !== "exactas" && tipoDivision !== "restos") {
    alert("Por favor, introduce 'exactas' o 'restos'.");
    return preguntarTipoDivision();
  }
  actualizarInterfazDivision();
  return tipoDivision;
}

function mostrarPregunta() {
  const { dividendo, divisor, cociente, resto } = generarDivision(tipoDivision);
  let pregunta;
  if (tipoDivision === "exactas") {
    pregunta = `${divisor} x ? = ${dividendo}`;
    respuestaCorrecta = cociente;
  } else {
    pregunta = `${divisor} x ? = ${dividendo} o menos`;
    respuestaCorrecta = { cociente, resto };
  }
  document.querySelector("h1").textContent = pregunta;
  reiniciarTemporizador();
}

function mostrarHistorial() {
  const historialContainer = document.querySelector(".container__historial");
  if (historialContainer) {
    historialContainer.style.display = "block";
  } else {
    mensajeConsola("red", "El contenedor del historial no se encontró");
  }
  const historialLista = obtenerListaHistorial();
  scrollHistorialAlFinal(historialLista);
}

function configurarEventListeners() {
  document
    .querySelector(".container__boton")
    .addEventListener("click", verificarRespuesta);
  document
    .getElementById("reiniciar")
    .addEventListener("click", reiniciarJuego);
  document.addEventListener("keypress", manejarTeclaEnter);
}

function manejarTeclaEnter(e) {
  if (e.key === "Enter") {
    if (document.getElementById("reiniciar").disabled === false) {
      reiniciarJuego();
    } else if (tipoDivision === "restos" && e.target.id === "valorUsuario") {
      document.getElementById("restoUsuario").focus();
    } else {
      verificarRespuesta();
    }
  }
}

function preguntarNivelInicial() {
  const nivelInicial = parseInt(prompt("¿En qué nivel deseas empezar? (1-10)"));
  if (isNaN(nivelInicial) || nivelInicial < 1 || nivelInicial > 10) {
    alert("Por favor, introduce un número entre 1 y 10.");
    preguntarNivelInicial();
    return;
  }
  tablas = Array.from({ length: nivelInicial }, (_, i) => i);
  actualizarTablas();
  nivel = nivelInicial;
  return;
}

function agitarContenedor() {
  const container = document.querySelector(".container");
  container.classList.add("shake");
  setTimeout(() => {
    container.classList.remove("shake");
  }, 500);
}

function mostrarFiesta(cantidad = 50) {
  const partyOverlay = document.querySelector("#partyOverlay");
  partyOverlay.style.display = "block";
  const confettiCount = cantidad;
  for (let i = 0; i < confettiCount; i++) {
    let confetti = document.createElement("div");
    confetti.classList.add("confetti"); // Posición horizontal aleatoria
    confetti.style.left = Math.random() * 100 + "vw"; // Tamaño aleatorio
    const size = Math.random() * 11 + 6; // entre 5px y 13px
    confetti.style.width = size + "px";
    confetti.style.height = size + "px";
    const colores = [
      "#FFC107",
      "#FF5722",
      "#8BC34A",
      "#03A9F4",
      "#E91E63",
      "#00ffff",
      "#ffff00",
      "#ff00ff",
      "#ffffff",
      "#ff0000",
      "#00ff00",
      "#0000ff",
    ];
    confetti.style.backgroundColor =
      colores[Math.floor(Math.random() * colores.length)]; // Color aleatorio de un conjunto
    const duracion = 3 + Math.random() * 2; // Duración aleatoria de la animación: entre 3 y 5 segundos
    confetti.style.animation = `confettiFall ${duracion}s linear forwards`;
    partyOverlay.appendChild(confetti);
  }
  // Limpiar el overlay después de la animación (5 segundos)
  setTimeout(() => {
    partyOverlay.innerHTML = "";
    partyOverlay.style.display = "none";
  }, 5000);
}

function actualizarPuntajeEnPantalla() {
  document.getElementById(
    "puntaje"
  ).textContent = `Experiencia: ${puntaje}/${puntajeRequerido} | Nivel: ${nivel} | Divisores actuales: ${tablas.join(
    " y "
  )}`;
}

function inicializarJuego() {
  document.title = "Juego: Aprender a dividir";
  tipoDivision = preguntarTipoDivision();
  preguntarNivelInicial();
  document.getElementById("valorUsuario").focus();
  mostrarPregunta();
  actualizarPuntajeEnPantalla();
  reiniciarTemporizador();
  configurarEventListeners();
  document.querySelector(".texto__parrafo").textContent =
    tipoDivision === "exactas"
      ? `Intenta resolver la división ${
          tipoDivision === "exactas" ? "exacta" : "con restos"
        }.`
      : "Intenta resolver la división con resto.";
}

document.addEventListener("DOMContentLoaded", inicializarJuego);
