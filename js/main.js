import * as poseDetection from '@mediapipe/pose'
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import * as poseDetectionModel from '@tensorflow-models/pose-detection'
import * as Tone from 'tone'
import * as nn from './nn.min.js'

let detector, video, osc

async function addVideo () {
  const video = document.createElement('video')
  video.setAttribute('autoplay', '')
  video.setAttribute('muted', '')
  video.setAttribute('playsinline', '')
  document.body.appendChild(video)
  const stream = await navigator.mediaDevices.getUserMedia({ video: true })
  video.srcObject = stream
  return video
}

async function setupModel () {
  // here we pick which pre-trained model we want to use
  const model = poseDetection.SupportedModels.BlazePose
  // here we setup some "configuration" settings
  const detectorConfig = {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose'
  }
  // we combine the two to create the AI "detctor" function
  const detector = await poseDetection.createDetector(model, detectorConfig)
  return detector
}

async function setup () {
  // we create (&& begin playing) the Tone.js Oscillator
  osc = new Tone.Oscillator().toDestination().start()
  osc.volume.value = -100 // set it's volume down by default
  
  // then we create our video element
  video = await addVideo()
  // then we create our AI function
  detector = await setupModel()
  // then we log it to make sure the model loaded correctly
  console.log('detector ready', detector)
  // then we wait a second before starting our animation loop
  setTimeout(draw, 1000) // this is a hack!
  // ...to get around the "race conditions" issue
}
async function draw () {
  // we first use the detector AI function to predict our "pose" based on the video frame
  const poses = await detector.estimatePoses(video)
  if (poses.length > 0) { // if the AI detects poses...
    // we grab the 19 (left_index) and 20 (right_index) keypoints
    // we can see which keypoints refer to which part of the pose in the docs:
    // https://github.com/tensorflow/tfjs-models/tree/master/pose-detection#blazepose-keypoints-used-in-mediapipe-blazepose
    const left = poses[0].keypoints[19] // left index finger
    const right = poses[0].keypoints[20] // right index finger
    if (left.y >= 0 && left.y <= 480) {
      const vol = nn.map(left.y, 0, 480, -100, 5)
      osc.volume.value = vol
    } else {
      osc.volume.value = -100
    }
    const freq = nn.map(right.x, 0, 640, 440, 880)
    osc.frequency.value = freq
  } else {
    // if we don't see poses
    osc.volume.value = -100
  }
  window.requestAnimationFrame(draw)
}

window.addEventListener('load', setup)
