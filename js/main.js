const ctx = new window.AudioContext()
function play (e) {
  const osc = ctx.createOscillator()

  osc.type = 'square'

  if (e.key === '1') {
    osc.frequency.value = 261.63 // C
  } else if (e.key === '2') {
    osc.frequency.value = 293.66 // D
  } else if (e.key === '3') {
    osc.frequency.value = 329.63 // E
  } else if (e.key === '4') {
    osc.frequency.value = 349.23 // F
  } else if (e.key === '5') {
    osc.frequency.value = 392.00 // G
  } else if (e.key === '6') {
    osc.frequency.value = 440.00 // A
  } else if (e.key === '7') {
    osc.frequency.value = 493.88 // B
  } else {
    osc.frequency.value = Math.random() * 800
  }

  osc.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.25)
}

window.addEventListener('keypress', play)
