/* global handPoseDetection, Tone */
let detector, video, osc

async function addVideo () {
  const video = document.createElement('video')
  video.setAttribute('autoplay', '')
  video.setAttribute('muted', '')
  video.setAttribute('playsinline', '')
  document.body.appendChild(video)
  const stream = await navigator.mediaDevices.getUserMedia({ video: true })
  video.srcObject = stream
  video.style.display = 'block'
  video.style.margin = 'auto'
  video.style.width = '1280px'
  video.style.height = '720px'
  return video
}

async function setupModel () {
  const model = handPoseDetection.SupportedModels.MediaPipeHands
  const detectorConfig = {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands'
  }
  const detector = await handPoseDetection.createDetector(model, detectorConfig)
  return detector
}

async function setup () {
  osc = new Tone.Oscillator().toDestination().start()
  osc.volume.value = -100 // set it's volume down by default
  video = await addVideo()
  detector = await setupModel()
  console.log('detector ready', detector)
  setTimeout(draw, 1000) // ...get around the "race conditions" issue
}
async function draw () {
  // we first use the detector AI function to predict our "hands" based on the video frame
  const poses = await detector.estimateHands(video)
  //console.log(poses)
  if (poses.length > 0) { // if the AI detects poses...
    const left = poses[1]
    const right = poses[0]
    console.log(left.keypoints.name)
    if (left.y >= 0 && left.y <= 480) {
      // const vol = nn.map(left.y, 0, 480, -100, 5)
      // osc.volume.value = vol
    } else {
      osc.volume.value = -100
    }
    // const freq = nn.map(right.x, 0, 640, 440, 880)
    // osc.frequency.value = freq
  } else {
    // if we don't see poses
    osc.volume.value = -100
  }
  window.requestAnimationFrame(draw)
}

window.addEventListener('load', setup)
