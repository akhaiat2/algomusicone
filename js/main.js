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
  osc = new Tone.Synth().toDestination()
  osc.oscillator.type = 'sine'
  osc.triggerAttackRelease('550', '4n')
  video = await addVideo()
  detector = await setupModel()
  console.log('detector ready', detector)
  setTimeout(draw, 1000) // ...get around the "race conditions" issue
}

async function draw () {
  // we first use the detector AI function to predict our "hands" based on the video frame
  const poses = await detector.estimateHands(video)
  if (poses.length > 0) { // if the AI detects poses...
    const left = poses[1]
    const right = poses[0]
    if (left && right) {
      // if left and right hand detected (Ganesha Mudra doesn't really work well)
      if (right.keypoints[0] && left.keypoints[0]) {
        if (right.keypoints[5] && right.keypoints[9] && right.keypoints[13] && right.keypoints[17]) {
          if (!right.keypoints[8] && !right.keypoints[12] && !right.keypoints[16] && !right.keypoints[20]) {
            if (Math.abs(right.keypoints[0].x - left.keypoints[0].x) < 350) {
              if (Math.abs(right.keypoints[0].y - left.keypoints[0].y) < 30) {
                console.log('Ganesha Mudra')
              }
            }
          }
        } else if (left.keypoints[5] && left.keypoints[9] && left.keypoints[13] && left.keypoints[17]) {
          if (!left.keypoints[8] && !left.keypoints[12] && !left.keypoints[16] && !left.keypoints[20]) {
            if (Math.abs(right.keypoints[0].x - left.keypoints[0].x) < 350) {
              if (Math.abs(right.keypoints[0].y - left.keypoints[0].y) < 30) {
                console.log('Ganesha Mudra')
              }
            }
          }
        }
        if ((Math.abs(right.keypoints[4].x - left.keypoints[1].x) < 120) && (Math.abs(right.keypoints[1].x - left.keypoints[4].x) < 120)) {
          if (Math.abs(right.keypoints[4].y - left.keypoints[4].y) < 40) {
            if ((Math.abs(right.keypoints[8].x - left.keypoints[1].x < 60)) || (Math.abs(left.keypoints[8].x - right.keypoints[1].x < 60))) {
              if ((Math.abs(right.keypoints[8].y - left.keypoints[1].y < 60)) || (Math.abs(left.keypoints[8].y - right.keypoints[1].y < 60))) {
                console.log('Dhyan Mudra')
                osc.triggerAttackRelease('963', '4n')
              }
            }
          }
        }
      }
    } else if (right) {
      // if right hand detected
      // check Shuni, Gyan Mudra, or Karana Mudra
      let middleFingerCounter = 0
      let thumb = 0
      let pinky = 0
      let index = 0
      let ringFinger = 0
      for (let i = 1; i < 5; i++) {
        // parse through entire middle finger to check if it's clearly visible
        if (right.keypoints[i + 8]) {
          middleFingerCounter++
        }
        if (right.keypoints[i]) {
          thumb++
        }
        if (right.keypoints[i + 4]) {
          index++
        }
        if (right.keypoints[i + 12]) {
          ringFinger++
        }
        if (right.keypoints[i + 16]) {
          pinky++
        }
      }
      if (middleFingerCounter === 4 && thumb === 4 && pinky === 4 && ringFinger === 4 && index === 4) {
        // Check if hand is upside down
        if (right.keypoints[12] && right.keypoints[9]) {
          if (right.keypoints[0].y - right.keypoints[12].y < -20) {
            if (right.keypoints[7] && right.keypoints[15] && right.keypoints[3] && right.keypoints[19]) {
              // check if y position is okay
              if (right.keypoints[11].y - right.keypoints[12].y < -20) {
                console.log('Varada Mudra')
                osc.triggerAttackRelease('432', '4n')
              }
            }
          }
        }
      }
      if (middleFingerCounter === 4 && index === 4 && pinky === 4) {
        // now check if the index finger and thumb are touching
        if (right.keypoints[4] && right.keypoints[8]) {
          if (Math.abs(right.keypoints[4].y - right.keypoints[8].y) < 25) {
            if (Math.abs(right.keypoints[4].x - right.keypoints[8].x) < 25) {
              if (Math.abs(right.keypoints3D[4].z - right.keypoints3D[8].z) < 0.7) {
                if (Math.abs(right.keypoints[12].y - right.keypoints[4].y) > 20 && Math.abs(right.keypoints[16].y - right.keypoints[4].y) > 20 && Math.abs(right.keypoints[20].y - right.keypoints[4].y) > 20) {
                  if (right.keypoints[12].y < right.keypoints[11].y && right.keypoints[16].y < right.keypoints[15].y && right.keypoints[20].y < right.keypoints[19].y) {
                    console.log('Gyan Mudra')
                    osc.triggerAttackRelease('639', '4n')
                  }
                }
              }
            }
          }
        }
      }
      if (pinky && index && thumb) {
        if (right.keypoints[20].y < right.keypoints[19].y && right.keypoints[8].y < right.keypoints[7].y && right.keypoints[4].y < right.keypoints[3].y) {
          if (right.keypoints[16].y > right.keypoints[15].y && right.keypoints[12].y > right.keypoints[11].y) {
            if (Math.abs(right.keypoints[16].y - right.keypoints[4].y) < 25 && Math.abs(right.keypoints[12].y - right.keypoints[4].y) < 25) {
              if (Math.abs(right.keypoints[16].x - right.keypoints[4].x) < 25 && Math.abs(right.keypoints[12].x - right.keypoints[4].x) < 25) {
                console.log('Apana Mudra')
                osc.triggerAttackRelease('528', '4n')
              }
            }
          } else if (right.keypoints[16].y < right.keypoints[15].y) {
            if (Math.abs(right.keypoints[12].y - right.keypoints[4].y) < 25) {
              if (Math.abs(right.keypoints[12].x - right.keypoints[4].x) < 25) {
                console.log('Shuni Mudra')
                osc.triggerAttackRelease('852', '4n')
              }
            }
          }
        }
      }
    } else if (left) {
      // if left hand detected
      // check Shuni, Gyan Mudra, or Karana Mudra
      let middleFingerCounter = 0
      let thumb = 0
      let pinky = 0
      let index = 0
      let ringFinger = 0
      for (let i = 1; i < 5; i++) {
        // parse through entire middle finger to check if it's clearly visible
        if (left.keypoints[i + 8]) {
          middleFingerCounter++
        }
        if (left.keypoints[i]) {
          thumb++
        }
        if (left.keypoints[i + 4]) {
          index++
        }
        if (left.keypoints[i + 12]) {
          ringFinger++
        }
        if (left.keypoints[i + 16]) {
          pinky++
        }
      }
      if (middleFingerCounter === 4 && thumb === 4 && pinky === 4 && ringFinger === 4 && index === 4) {
        // Check if hand is upside down
        if (left.keypoints[12] && left.keypoints[9]) {
          if (left.keypoints[0].y - left.keypoints[12].y < -20) {
            if (left.keypoints[7] && left.keypoints[15] && left.keypoints[3] && left.keypoints[19]) {
              // check if y position is okay
              if (left.keypoints[11].y - left.keypoints[12].y < -20) {
                console.log('Varada Mudra')
                osc.triggerAttackRelease('432', '4n')
              }
            }
          }
        }
      }
      if (middleFingerCounter === 4 && index === 4 && pinky === 4) {
        // now check if the index finger and thumb are touching
        if (left.keypoints[4] && left.keypoints[8]) {
          if (Math.abs(left.keypoints[4].y - left.keypoints[8].y) < 25) {
            if (Math.abs(left.keypoints[4].x - left.keypoints[8].x) < 25) {
              if (Math.abs(left.keypoints3D[4].z - left.keypoints3D[8].z) < 0.7) {
                if (Math.abs(left.keypoints[12].y - left.keypoints[4].y) > 20 && Math.abs(left.keypoints[16].y - left.keypoints[4].y) > 20 && Math.abs(left.keypoints[20].y - left.keypoints[4].y) > 20) {
                  if (left.keypoints[12].y < left.keypoints[11].y && left.keypoints[16].y < left.keypoints[15].y && left.keypoints[20].y < left.keypoints[19].y) {
                    console.log('Gyan Mudra')
                    osc.triggerAttackRelease('639', '4n')
                  }
                }
              }
            }
          }
        }
      }
      if (pinky && index && thumb) {
        if (left.keypoints[20].y < left.keypoints[19].y && left.keypoints[8].y < left.keypoints[7].y && left.keypoints[4].y < left.keypoints[3].y) {
          if (left.keypoints[16].y > left.keypoints[15].y && left.keypoints[12].y > left.keypoints[11].y) {
            if (Math.abs(left.keypoints[16].y - left.keypoints[4].y) < 25 && Math.abs(left.keypoints[12].y - left.keypoints[4].y) < 25) {
              if (Math.abs(left.keypoints[16].x - left.keypoints[4].x) < 25 && Math.abs(left.keypoints[12].x - left.keypoints[4].x) < 25) {
                console.log('Apana Mudra')
                osc.triggerAttackRelease('528', '4n')
              }
            }
          } else if (left.keypoints[16].y < left.keypoints[15].y) {
            if (Math.abs(left.keypoints[12].y - left.keypoints[4].y) < 25) {
              if (Math.abs(left.keypoints[12].x - left.keypoints[4].x) < 25) {
                console.log('Shuni Mudra')
                osc.triggerAttackRelease('852', '4n')
              }
            }
          }
        }
      }
    } else {
      // // if we don't see poses
      osc.volume.value = -100
    }
  }
  window.requestAnimationFrame(draw)
}
const curtain = document.querySelector('.curtain')
const button = document.querySelector('.enter')
button.addEventListener('click', () => {
  curtain.style.display = 'none'
  setup()
})
// window.addEventListener('load', setup)
