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
  // console.log(poses)
  if (poses.length > 0) { // if the AI detects poses...
    const left = poses[1]
    const right = poses[0]
    // Check if left and right hand present
    if (left && right) {
      // Check if index finger, wrist, and thumb are detected
      if (right.keypoints[0] && right.keypoints[4] && right.keypoints[7] && left.keypoints[0] && left.keypoints[4] && left.keypoints[7]) {
        // Check the x distance between right and left index fingers is less than 10
        if (Math.abs(right.keypoints[7].x - left.keypoints[7].x) <= 10) {
          // console.log('x clear')
          // Check the y distance between right and left index fingers is less than 10
          if (Math.abs(right.keypoints[7].y - left.keypoints[7].y) <= 10) {
            // console.log('y clear')
            if (Math.abs(right.keypoints3D[7].z - left.keypoints3D[7].z) <= 0.8) {
              osc.frequency.value = 440
              osc.volume.value = 90
              console.log('Dhyana Mudra')
            }
          }
        }
        osc.frequency.value = 30
      } else {
        osc.volume.value = -100
      }
    }
    // osc.frequency.value = freq
  } else {
    // if we don't see poses
    osc.volume.value = -100
  }
  window.requestAnimationFrame(draw)
}

window.addEventListener('load', setup)
