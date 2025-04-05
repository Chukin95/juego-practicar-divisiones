// Variables globales
let puntaje = 0;
let puntajeRequerido = 200;
let historial = [];
let intentosRestantes = 3;
let tablas = [2, 3];
let respuestaCorrecta;
let nivel = 3;
let tipoDivision;
const tiempoInicial =
  prompt("¿Cuánto tiempo deseas por pregunta (en segundos)?") || 30;
let tiempoRestante = tiempoInicial;
let temporizador;
let tiempoAgotado = false;
let procesandoRespuesta = false;

function verificarRespuesta(tiempoAgotado = false) {
  if (procesandoRespuesta) return;
  procesandoRespuesta = true;

  const resultadoElement = document.querySelector(".texto__parrafo");
  const respuestaUsuario = obtenerRespuestaUsuario();

  if (tiempoAgotado) {
    clearInterval(temporizador);
    manejarTiempoAgotado(resultadoElement);
    procesandoRespuesta = false;
    return;
  }

  const validationResult = validarEntrada(respuestaUsuario, resultadoElement);

  if (validationResult === "invalid") {
    procesandoRespuesta = false;
    return;
  }

  // Detener el temporizador solo si la entrada es válida
  clearInterval(temporizador);

  const [dividendo, divisor] = document
    .querySelector("h1")
    .textContent.split(" ÷ ");
  const esCorrecta =
    respuestaUsuario.cociente === respuestaCorrecta.cociente &&
    respuestaUsuario.resto === respuestaCorrecta.resto;

  if (esCorrecta) {
    manejarRespuestaCorrecta(resultadoElement);
  } else {
    manejarRespuestaIncorrecta(resultadoElement, respuestaUsuario);
  }

  actualizarHistorialRespuesta(false, respuestaUsuario, esCorrecta);
  verificarSubirNivel();
  actualizarInterfaz();
  procesandoRespuesta = false;
}

function reiniciarTemporizador() {
  clearInterval(temporizador);
  tiempoRestante = tiempoInicial;
  tiempoAgotado = false;
  temporizador = setInterval(() => {
    actualizarTemporizador();
    if (tiempoRestante <= 0) {
      clearInterval(temporizador);
      verificarRespuesta(true);
    }
  }, 1000);
}

function actualizarTemporizador() {
  const temporizadorElement = document.getElementById("temporizador");

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

function obtenerRespuestaUsuario() {
  const cociente = parseInt(document.getElementById("valorUsuario").value, 10);
  const restoInput = document.getElementById("restoUsuario").value;
  const resto = restoInput === "" ? 0 : parseInt(restoInput, 10);
  return {
    cociente: isNaN(cociente) ? NaN : cociente,
    resto: isNaN(resto) ? 0 : resto, // Cambiado de NaN a 0
  };
}

function validarEntrada(respuestaUsuario, resultadoElement) {
  if (isNaN(respuestaUsuario.cociente)) {
    resultadoElement.textContent =
      "⛔ Debes ingresar un número válido para el cociente y resto ⛔";
    resultadoElement.style.color = "red";
    agitarContenedor();
    // Clear only the cociente input field
    document.getElementById("valorUsuario").value = "";
    // Focus on the cociente input field
    enfocarInputUsuario();
    return "invalid";
  }
  // El resto puede ser 0 o un número válido
  if (
    respuestaUsuario.resto < 0 ||
    respuestaUsuario.resto >= respuestaCorrecta.divisor
  ) {
    resultadoElement.textContent = `⛔ El resto debe ser un número entre 0 y ${
      respuestaCorrecta.divisor - 1
    } ⛔`;
    resultadoElement.style.color = "red";
    agitarContenedor();
    // Clear only the resto input field
    document.getElementById("restoUsuario").value = "";
    // Focus on the resto input field
    enfocarInputUsuario();
    return "invalid";
  }
  return "valid";
}

function manejarTiempoAgotado(resultadoElement) {
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
  actualizarHistorialRespuesta(true, null, false);
  mostrarHistorial();
  habilitarBotonSiguiente();
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
  resultadoElement.textContent = "✅ ¡Correcto! ✅";
  resultadoElement.style.color = "green";
  deshabilitarControles();
  ajustarPuntaje(10);
  mostrarHistorial();
  habilitarBotonSiguiente();
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
  // Clear the input fields after an incorrect answer
  document.getElementById("valorUsuario").value = "";
  document.getElementById("restoUsuario").value = "";
}

function manejarIntentosRestantes(resultadoElement, respuestaUsuario) {
  resultadoElement.textContent = `❌ ¡Incorrecto! ❌
  Intentos restantes: ${intentosRestantes}`;
  resultadoElement.style.color = "red";
  ajustarPuntaje(-5);
  agitarContenedor();
  mensajeConsola(
    "orange",
    `❌ Respuesta incorrecta. Tu respuesta: ${respuestaUsuario.cociente} con resto ${respuestaUsuario.resto}. Intentos restantes: ${intentosRestantes}. 📉 Puntaje -5`
  );
  reiniciarTemporizador(); // Reiniciar el temporizador solo si quedan intentos
  enfocarInputUsuario();
}

function manejarSinIntentosRestantes(resultadoElement, respuestaUsuario) {
  clearInterval(temporizador);
  const respuestaCorrectaTexto = formatearRespuestaCorrecta();
  resultadoElement.textContent = `❌ ¡Incorrecto! ❌
  La respuesta correcta era ${respuestaCorrectaTexto}.`;
  deshabilitarControles();
  ajustarPuntaje(-25);
  mostrarHistorial();
  habilitarBotonSiguiente();
  agitarContenedor();
  mensajeConsola(
    "red",
    `🚫 Sin intentos restantes. Tu respuesta: ${respuestaUsuario}. Respuesta correcta: ${respuestaCorrectaTexto}. 📉 Puntaje -25`
  );
}

function habilitarBotonSiguiente() {
  const botonSiguiente = document.getElementById("reiniciar");
  botonSiguiente.disabled = false;
  botonSiguiente.style.display = "inline-block";
}

function deshabilitarControles() {
  document.getElementById("intentoBoton").style.display = "none";
  document.getElementById("valorUsuario").style.display = "none";
  document.getElementById("restoUsuario").style.display = "none";
}

function habilitarControles() {
  document.getElementById("reiniciar").style.display = "none";
  document.getElementById("intentoBoton").style.display = "inline-block";
  document.getElementById("valorUsuario").style.display = "inline-block";
  document.getElementById("restoUsuario").style.display = "inline-block";
}

function actualizarEstadoBotones() {
  document.getElementById("reiniciar").disabled = true;
  document.getElementById("intentoBoton").disabled = false;
  document.getElementById("valorUsuario").disabled = false;
  document.getElementById("restoUsuario").disabled = false;
}

function ajustarPuntaje(puntos) {
  puntaje = Math.max(0, puntaje + puntos);
}

function actualizarHistorialRespuesta(
  tiempoAgotado,
  respuestaUsuario,
  esCorrecta
) {
  let respuestaFormateada = tiempoAgotado
    ? "Tiempo agotado"
    : `${respuestaUsuario.cociente} con resto ${respuestaUsuario.resto}`;

  historial.push({
    pregunta: document.querySelector("h1").textContent,
    respuestaUsuario: respuestaFormateada,
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
  // Remover el event listener global
  document.removeEventListener("keydown", manejarTeclaEnterGlobal);

  reiniciarVariables();
  actualizarInterfazUsuario();
  reiniciarElementosJuego();
  ocultarHistorial();
  actualizarPuntajeEnPantalla();
  habilitarControles();
  enfocarInputUsuario();
  document.getElementById("valorUsuario").value = "";
  document.getElementById("restoUsuario").value = "";
  document.getElementById("restoUsuario").style.display = "inline-block";
  mostrarPregunta(); // Esto llamará a reiniciarTemporizador()
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
  parrafo.textContent = "Intenta resolver la división con resto.";
  parrafo.style.color = "white";
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

function actualizarTemporizador() {
  const temporizadorElement = document.getElementById("temporizador");

  if (tiempoRestante <= 0) {
    clearInterval(temporizador);
    temporizadorElement.textContent = `Tiempo: 0s`;
    temporizadorElement.className = "tiempo-rojo";
    verificarRespuesta(true);
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
function generarDivision() {
  const divisor = tablas[Math.floor(Math.random() * tablas.length)];
  const cociente = Math.floor(Math.random() * 9) + 1; // Genera cocientes del 1 al 9
  const restoMaximo = divisor - 1; // El resto máximo posible
  const resto = Math.floor(Math.random() * (restoMaximo + 1)); // Genera un resto entre 0 y (divisor - 1)
  const dividendo = divisor * cociente + resto;
  return { dividendo, divisor, cociente, resto };
}

function mostrarPregunta() {
  const { dividendo, divisor, cociente, resto } = generarDivision();
  const pregunta = `${dividendo} ÷ ${divisor} = ?`;
  respuestaCorrecta = { cociente, resto };
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
    .addEventListener("click", () => verificarRespuesta());
  document
    .getElementById("reiniciar")
    .addEventListener("click", reiniciarJuego);
  document
    .getElementById("valorUsuario")
    .addEventListener("keypress", manejarTeclaEnter);
  document
    .getElementById("restoUsuario")
    .addEventListener("keypress", manejarTeclaEnter);
}

function habilitarBotonSiguiente() {
  const botonSiguiente = document.getElementById("reiniciar");
  botonSiguiente.disabled = false;
  botonSiguiente.style.display = "inline-block";
  botonSiguiente.focus(); // Añadir foco al botón

  // Añadir un event listener global para la tecla Enter
  document.addEventListener("keydown", manejarTeclaEnterGlobal);
}

function estaBotonSiguienteVisible() {
  const botonReiniciar = document.getElementById("reiniciar");
  return (
    botonReiniciar &&
    botonReiniciar.style.display === "inline-block" &&
    !botonReiniciar.disabled
  );
}

function manejarTeclaEnterGlobal(e) {
  if (e.key === "Enter" && estaBotonSiguienteVisible()) {
    e.preventDefault();
    reiniciarJuego();
    // Remover el event listener después de usarlo
    document.removeEventListener("keydown", manejarTeclaEnterGlobal);
  }
}

function manejarTeclaEnter(e) {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevenir el comportamiento por defecto
    if (estaBotonSiguienteVisible()) {
      reiniciarJuego();
    } else if (e.target.id === "valorUsuario") {
      document.getElementById("restoUsuario").focus();
    } else if (e.target.id === "restoUsuario") {
      verificarRespuesta();
    }
  }
}

function preguntarNivelInicial() {
  const nivelInicial =
    parseInt(prompt("¿En qué nivel deseas empezar? (3-9)")) || 3;
  if (isNaN(nivelInicial) || nivelInicial < 3 || nivelInicial > 9) {
    alert("Por favor, introduce un número entre 3 y 9.");
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
  preguntarNivelInicial();
  document.getElementById("valorUsuario").focus();
  document.getElementById("restoUsuario").style.display = "inline-block";
  mostrarPregunta();
  actualizarPuntajeEnPantalla();
  reiniciarTemporizador();
  configurarEventListeners();
  document.querySelector(".texto__parrafo").textContent =
    "Intenta resolver la división con resto.";
}

document.addEventListener("DOMContentLoaded", inicializarJuego);
