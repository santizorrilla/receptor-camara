// Obtener elementos del DOM
const videoElement = document.getElementById('video');
const body = document.getElementById('body');

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
    // Capturar el color de la cámara cada 500 milisegundos
    setInterval(capturarColor, 500);
  } catch (err) {
    handleError(err);
  }
}

// Función para capturar los valores de color de la cámara y cambiar el color de fondo de la página
async function capturarColor() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  // Asignar las dimensiones del canvas al tamaño del video
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  // Dibujar el fotograma actual del video en el canvas
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  // Obtener los datos de los píxeles en forma de objeto ImageData
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // Obtener los valores de los píxeles
  const pixelData = imageData.data;
  // Variables para los canales de color promedio
  let rojoTotal = 0;
  let verdeTotal = 0;
  let azulTotal = 0;
  // Calcular la suma total de los componentes de color
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
  // Verificar si el porcentaje de píxeles azules es mayor que un umbral
  const umbralAzul = 50; // ajusta el umbral según sea necesario
  if (azulPromedio > rojoPromedio && azulPromedio > verdePromedio && azulPromedio > umbralAzul) {
    // Reproducir el sonido solo si la música no se ha reproducido ya
    if (!musicaReproducida) {
      console.log("Reproduciendo audio");
      audio = new Audio('fondoVerde.wav');
      try {
        await audio.play();
        console.log("Audio reproduciéndose");
        musicaReproducida = true; // Marcar que la música ya se reprodujo
      } catch (error) {
        console.error("Error al reproducir el audio:", error);
      }
    }
  } else {
    // Detener la música si el porcentaje de píxeles azules no es suficiente
    if (musicaReproducida) {
      console.log("Deteniendo audio");
      audio.pause();
      audio.currentTime = 0; // Reiniciar la reproducción al inicio para la próxima vez
      musicaReproducida = false; // Restablecer el estado de reproducción de la música
    }
  }
}

// Iniciar la cámara cuando se carga la página
startCamera();
