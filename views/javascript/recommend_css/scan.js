const coco_names = ['-blazer', 'Half-shortpants', 'blouse', 'cardigan', 'coat', 'denim', 'hoodie',
  'jumper', 'leggings', 'mustang', 'onepiece', 'pkshirts', 'riders', 'shirts', 'skirt', 'slacks', 'sweater', 'sweatpants', 'sweatshirts', 't-shirts']

const detect_top = ['-blazer', 'blouse', 'cardigan', 'coat', 'hoodie', 'jumper',
  'mustang', 'onepiece', 'pkshirts', 'riders', 'shirts', 'sweater', 'sweatshirts', 't-shirts']

const detect_bottom = ['Half-shortpants', 'denim', 'leggings', 'skirt', 'slacks', 'sweatpants']

const colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
  '#80B300', '#809900', '#E6E6E6', '#6680B3', '#66991A',
  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC'];

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

async function captureImage() {
  const canvas = document.getElementById('output');
  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = image;
  link.download = 'outfit.png';

  link.click();
}

async function runObjectDetection() {
  let detect_res = null;
  let [modelWidth, modelHeight] = detector.inputs[0].shape.slice(1, 3);
  const input = tf.tidy(() => {
    return tf.image.resizeBilinear(tf.browser.fromPixels(camera.video), [modelWidth, modelHeight])
      .div(255.0).expandDims(0);
  });

  // Detector can be null if initialization failed (for example when loading
  // from a URL that does not exist).
  if (detector != null) {
    // Detectors can throw errors, for example when using custom URLs that
    // contain a model that doesn't provide the expected output.
    try {
      detect_res = await detector.executeAsync(input);
    } catch (error) {
      detector.dispose();
      detector = null;
      alert(error);
    }
  }

  camera.drawCtx();
  camera.drawResult(detect_res);

  tf.dispose(input);
}

class Camera {
  constructor() {
    this.video = document.getElementById('video');
    this.canvas = document.getElementById('output');
    this.ctx = this.canvas.getContext('2d');

    this.tex = document.getElementById('text');
    this.tx = this.tex.getContext('2d');

  }

  /**
   * Initiate a Camera instance and wait for the camera stream to be ready.
   */
  static async setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const $size = { width: 600, height: 1000 };
    const $m_size = { width: 360, height: 270 };
    const videoConfig = {
      'audio': false,
      'video': {
        facingMode: 'user',
        // Only setting the video to a specified size for large screen, on
        // // mobile devices accept the default size.
        width: isMobile() ? $m_size.width : $size.width,
        height: isMobile() ? $m_size.height : $size.height,
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);

    const camera = new Camera();
    camera.video.srcObject = stream;

    await new Promise((resolve) => {
      camera.video.onloadedmetadata = () => {
        resolve(video);
      };
    });

    camera.video.play();

    const videoWidth = camera.video.videoWidth;
    const videoHeight = camera.video.videoHeight;
    // Must set below two lines, otherwise video element doesn't show.
    camera.video.width = videoWidth;
    camera.video.height = videoHeight;

    camera.canvas.width = videoWidth;
    camera.canvas.height = videoHeight;
    camera.tex.width = videoWidth;
    camera.tex.height = videoHeight;
    const canvasContainer = document.querySelector('.canvas-wrapper');
    canvasContainer.style = 'width: 100vw; height: 75vh;';

    // Because the image from camera is mirrored, need to flip horizontally.
    // camera.ctx.translate(camera.video.videoWidth, 0);
    // camera.ctx.scale(-1, 1);
    return camera;
  }

  drawCtx() {
    this.ctx.drawImage(
      this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);

    this.tx.clearRect(0, 0, this.video.videoWidth, this.video.videoHeight);
  }




  clearCtx() {
    this.ctx.clearRect(0, 0, this.video.videoWidth, this.video.videoHeight);
  }


  drawResult(res) {
    const font = "24px sans-serif";
    this.ctx.font = font;
    this.ctx.textBaseline = "top";
    this.tx.font = font;
    this.tx.textBaseline = "top";

    const [boxes, scores, classes, valid_detections] = res;
    const boxes_data = boxes.dataSync();
    const scores_data = scores.dataSync();
    const classes_data = classes.dataSync();
    const valid_detections_data = valid_detections.dataSync()[0];

    tf.dispose(res);

    var i;
    for (i = 0; i < valid_detections_data; ++i) {
      let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
      x1 *= this.canvas.width;
      x2 *= this.canvas.width;
      y1 *= this.canvas.height;
      y2 *= this.canvas.height;
      const width = x2 - x1;
      const height = y2 - y1;
      const klass = coco_names[classes_data[i]];
      const score = scores_data[i].toFixed(2);

      // Get the color for the current class.
      const color = colors[classes_data[i]];

      // Draw the bounding box.
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(x1, y1, width, height);

      // Draw the label background.
      this.ctx.fillStyle = color;

      // Draw the label background.
      this.tx.fillStyle = '#000000';
      const textWidth = this.tx.measureText(klass + ":" + score).width;
      const textHeight = parseInt(font, 10); // base 10
      this.tx.fillRect(this.video.width - x2, y1, textWidth + 5, textHeight + 5);


    }
    for (i = 0; i < valid_detections_data; ++i) {
      let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
      x1 *= this.canvas.width;
      y1 *= this.canvas.height;
      x2 *= this.canvas.width;
      y2 *= this.canvas.height;
      const klass = coco_names[classes_data[i]];
      const score = scores_data[i].toFixed(2);
      const textWidth = this.tx.measureText(klass).width;
      // Draw the text last to ensure it's on top.
      this.tx.fillStyle = "#ffffff";
      this.tx.fillText(klass + ":" + score, this.video.width - x2, y1);

      const color = colors[classes_data[i]];

      //text 띄우기
      if (detect_top.includes(klass)) {
        document.getElementById('text2').style.color = color;
        document.getElementById('text2').innerText = klass + ":" + score;
      }
      if (detect_bottom.includes(klass)) {
        document.getElementById('text3').style.color = color;
        document.getElementById('text3').innerText = klass + ":" + score;
      }
    }

  }
}

let detector, camera, stats;
let startInferenceTime, numInferences = 0;
let inferenceTimeSum = 0, lastPanelUpdate = 0;
let rafId;

const yolov5n_weight = "https://raw.githubusercontent.com/jiangbow5808/yolov5/jiangbow5808-patch-1/best_web_model/model.json"

async function createDetector() {
  return tf.loadGraphModel(yolov5n_weight);
}



async function renderResult() {
  if (camera.video.readyState < 2) {
    await new Promise((resolve) => {
      camera.video.onloadeddata = () => {
        resolve(video);
      };
    });
  }

  let detect_res = null;
  //const webcam = await tf.data.webcam(camera.video, { resizeWidth: 640, resizeHeight: 640 });
  //const img = await webcam.capture();
  let [modelWidth, modelHeight] = detector.inputs[0].shape.slice(1, 3);
  const input = tf.tidy(() => {
    return tf.image.resizeBilinear(tf.browser.fromPixels(camera.video), [modelWidth, modelHeight])
      .div(255.0).expandDims(0);
  });
  // Detector can be null if initialization failed (for example when loading
  // from a URL that does not exist).
  if (detector != null) {

    // Detectors can throw errors, for example when using custom URLs that
    // contain a model that doesn't provide the expected output.
    try {
      detect_res = await detector.executeAsync(
        input,
      );
    } catch (error) {
      detector.dispose();
      detector = null;
      alert(error);
    }
  }
  camera.drawCtx();
  camera.drawResult(detect_res);
  tf.dispose(input);

}

async function renderPrediction() {
  await renderResult();

  rafId = requestAnimationFrame(renderPrediction);
};

// async function app() {
//   camera = await Camera.setupCamera();
//   detector = await createDetector();

//   // Capture image after 5 seconds
//   setTimeout(captureImage, 5000);

//   renderPrediction();
// }


async function captureImage() {
  const canvas = document.getElementById('output');
  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = image;
  link.download = 'outfit.png';
  link.click();
}

async function app() {
  camera = await Camera.setupCamera();
  detector = await createDetector();

  // Capture image after 5 seconds
  setTimeout(captureImage, 8000);

  renderPrediction();

  // Run object detection
  await runObjectDetection();
}

app();
