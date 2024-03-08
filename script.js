// Obtener elementos del DOM
const videoElement = document.getElementById('video');
const zoomInButton = document.getElementById('zoomInButton');
const zoomOutButton = document.getElementById('zoomOutButton');
const body = document.getElementById('body');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Variables para el nivel de zoom
let zoomLevel = 1;

// Variable para rastrear si la música ya se reprodujo
let musicaReproducida = false;

// Variable para el elemento de audio
let audio;

// Función para manejar los errores
function handleError(error) {
  console.error('Error al acceder a la cámara web:', error);
}

// Función para iniciar la cámara
async function startCamera() {
  try {
    // Obtener el stream de la cámara
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Asignar el stream al elemento de video
    videoElement.srcObject = stream;
    // Esperar a que la cámara se cargue completamente
    await new Promise(resolve => videoElement.onloadedmetadata = resolve);
    // Una vez que el video se ha cargado, establecer las dimensiones del canvas
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
  } catch (err) {
    handleError(err);
  }
}

// Función para manejar el botón de zoom +
zoomInButton.addEventListener('click', function() {
  zoomLevel += 0.1; // Aumentar el nivel de zoom
  applyZoom(); // Aplicar el zoom
});

// Función para manejar el botón de zoom -
zoomOutButton.addEventListener('click', function() {
  zoomLevel -= 0.1; // Reducir el nivel de zoom
  if (zoomLevel < 0.1) {
    zoomLevel = 0.1; // No permitir zoom menor a 10%
  }
  applyZoom(); // Aplicar el zoom
});

// Función para aplicar el nivel de zoom al contenedor de video
function applyZoom() {
  videoWrapper.style.transform = `scale(${zoomLevel})`;
}

// Función para capturar los valores de color de la cámara y cambiar el color de fondo de la página
async function capturarColor() {
  // Asignar las dimensiones del canvas al tamaño del video
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  // Dibujar el fotograma actual del video en el canvas
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  // Obtener los datos de los píxeles en forma de objeto ImageData
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Obtener los valores de los píxeles
  const pixelData = imageData.data;

  // Contadores para los canales de color
  let rojoTotal = 0;
  let verdeTotal = 0;
  let azulTotal = 0;

  // Calcular la suma total de los componentes de color y el número total de píxeles
  for (let i = 0; i < pixelData.length; i += 4) {
    rojoTotal += pixelData[i];
    verdeTotal += pixelData[i + 1];
    azulTotal += pixelData[i + 2];
  }

  // Calcular los valores promedio de los canales de color
  const numPixeles = pixelData.length / 4;
  const rojoPromedio = Math.round(rojoTotal / numPixeles);
  const verdePromedio = Math.round(verdeTotal / numPixeles);
  const azulPromedio = Math.round(azulTotal / numPixeles);

  // Cambiar el color de fondo de la página con los valores promedio de los canales de color
  body.style.backgroundColor = `rgb(${rojoPromedio}, ${verdePromedio}, ${azulPromedio})`;

  // Verificar si el color es predominantemente azul en comparación con los otros componentes de color
  const umbralAzul = 150; // Ajusta este umbral según sea necesario (por ejemplo, 150 representa un porcentaje alto de azul requerido)
  if (azulPromedio > rojoPromedio && azulPromedio > verdePromedio && azulPromedio > umbralAzul) {
    // Reproducir el sonido solo si la música no se ha reproducido ya
    if (!musicaReproducida) {
      audio = new Audio('fondoVerde.wav');
      audio.play();
      musicaReproducida = true; // Marcar que la música ya se reprodujo
    }
  } else {
    // Detener la música si el color no es azul
    if (musicaReproducida) {
      audio.pause();
      audio.currentTime = 0; // Reiniciar la reproducción al inicio para la próxima vez
      musicaReproducida = false; // Restablecer el estado de reproducción de la música
    }
  }
}

// Capturar el color de la cámara cada 500 milisegundos
setInterval(capturarColor, 500);

// Iniciar la cámara cuando se carga la página
startCamera();
