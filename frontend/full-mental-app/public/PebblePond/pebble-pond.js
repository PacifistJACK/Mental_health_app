/**
 * Pebble Pond - A Zen Interactive Experience
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('pond-canvas');
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let ripples = [];
  let fallingStones = [];
  
  // Game State
  let points = 0;
  const pointsValueEl = document.getElementById('points-value');
  let currentStoneParams = { size: 'small', dropMaxRadius: 100, fallDuration: 60 }; // Fall duration in frames
  
  // Stone Tool Selection
  const stoneBtns = document.querySelectorAll('.action-btn');
  stoneBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Prevent canvas click
      e.stopPropagation();
      stoneBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const size = btn.getAttribute('data-size');
      if (size === 'small') {
        currentStoneParams = { size: 'small', dropMaxRadius: 100, fallDuration: 60 };
      } else if (size === 'medium') {
        currentStoneParams = { size: 'medium', dropMaxRadius: 250, fallDuration: 75 };
      } else if (size === 'large') {
        currentStoneParams = { size: 'large', dropMaxRadius: 500, fallDuration: 90 };
      }
    });
  });

  function addPoints(pts) {
    points += pts;
    pointsValueEl.textContent = points;
    // Simple animation
    pointsValueEl.style.transform = 'scale(1.2)';
    pointsValueEl.style.color = '#fff';
    setTimeout(() => {
      pointsValueEl.style.transform = 'scale(1)';
      pointsValueEl.style.color = 'var(--accent-color)';
    }, 200);
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  
  window.addEventListener('resize', resize);
  
  // --- Audio Synthesis ---
  let audioCtx = null;
  const A_MINOR_PENTATONIC = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99]; 

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      startAmbientMusic();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Create white noise buffer for splashes
  function createNoiseBuffer() {
      const bufferSize = audioCtx.sampleRate * 2; // 2 seconds
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
      }
      return buffer;
  }
  let noiseBuffer = null;

  function playSplashSound(stoneSize) {
    if (!audioCtx) return;
    if (!noiseBuffer) noiseBuffer = createNoiseBuffer();
    
    // 1. Synthesize the musical "plonk" (softer and calmer)
    const isLarge = stoneSize === 'large';
    const isMedium = stoneSize === 'medium';
    
    // Lower note for larger stones, drop octave for all
    let notePool = isLarge ? A_MINOR_PENTATONIC.slice(0, 3) : 
                   (isMedium ? A_MINOR_PENTATONIC.slice(2, 6) : A_MINOR_PENTATONIC.slice(5, 8));
    
    const note = notePool[Math.floor(Math.random() * notePool.length)] * 0.5; // lower octave
    const freq = note;

    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    oscGain.gain.setValueAtTime(0, audioCtx.currentTime);
    // Softer attack (0.05) and much lower max volume (0.2 / 0.1) for calm sound
    oscGain.gain.linearRampToValueAtTime(isLarge ? 0.2 : 0.1, audioCtx.currentTime + 0.05);
    oscGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (isLarge ? 4.0 : 3.0));
    
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 5.0);

    // 2. Synthesize a very gentle, subtle "splash" noise
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = isLarge ? 200 : (isMedium ? 300 : 500); 
    noiseFilter.Q.value = 0.5;
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0, audioCtx.currentTime);
    noiseGain.gain.linearRampToValueAtTime(isLarge ? 0.08 : 0.04, audioCtx.currentTime + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (isLarge ? 0.8 : 0.5));
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noiseSource.start();
  }

  function startAmbientMusic() {
    // A static, soft ambient pad (multiple oscillators) without fluctuation
    createDrone(55, 0.02); // Low A
    createDrone(110, 0.015); // Mid A
    createDrone(164.81, 0.01); // E
    
    // Gentle wind/water noise (static)
    if (!noiseBuffer) noiseBuffer = createNoiseBuffer();
    const windSource = audioCtx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;
    
    const windFilter = audioCtx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 250;
    
    const windGain = audioCtx.createGain();
    windGain.gain.value = 0.005; // Even quieter for pure calm
    
    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(audioCtx.destination);
    windSource.start();
  }
  
  function createDrone(freq, gainVal) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    
    gain.gain.value = gainVal; // Static gain, no LFO
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
  }

  // --- Visual Classes ---

  class FallingStone {
      constructor(targetX, targetY, sizeParams) {
          this.targetX = targetX;
          this.targetY = targetY;
          this.sizeParams = sizeParams;
          
          this.active = true;
          this.framesLeft = sizeParams.fallDuration;
          this.totalFrames = sizeParams.fallDuration;
          
          // Determine rock visual size based on kind
          this.rockSize = sizeParams.size === 'large' ? 15 : (sizeParams.size === 'medium' ? 8 : 4);
      }
      
      update() {
          this.framesLeft--;
          if (this.framesLeft <= 0) {
              this.active = false;
              // Spawn ripple
              const actualMaxRad = this.sizeParams.dropMaxRadius * (0.8 + Math.random() * 0.4);
              ripples.push(new Ripple(this.targetX, this.targetY, actualMaxRad));
              playSplashSound(this.sizeParams.size);
              addPoints(this.sizeParams.size === 'large' ? 15 : (this.sizeParams.size === 'medium' ? 10 : 5));
          }
      }
      
      draw(ctx) {
          if (!this.active) return;
          
          const progress = 1 - (this.framesLeft / this.totalFrames);
          // Ease in cubic for falling simulation
          const easeProgress = progress * progress * progress;
          
          // Shadow that shrinks and gets darker as stone approaches water
          ctx.save();
          const shadowScale = 1 + (1 - easeProgress) * 2;
          ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + easeProgress * 0.3})`;
          ctx.beginPath();
          ctx.ellipse(this.targetX, this.targetY, this.rockSize * shadowScale, this.rockSize * shadowScale * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // The dropping rock 
          // Starts high up (y target - 300) and scales down slightly
          const rockY = this.targetY - 300 * (1 - easeProgress);
          const rockScale = 1 + (1 - easeProgress); // Looks bigger when closer to camera (higher up)
          
          ctx.fillStyle = this.sizeParams.size === 'large' ? '#556' : '#778';
          ctx.beginPath();
          ctx.ellipse(this.targetX, rockY, this.rockSize * rockScale, this.rockSize * rockScale * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Specular highlight on rock
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath();
          ctx.arc(this.targetX - this.rockSize* rockScale * 0.2, rockY - this.rockSize* rockScale * 0.2, this.rockSize * rockScale * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
      }
  }

  class Ripple {
    constructor(x, y, maxRadius) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.maxRadius = maxRadius;
      this.speed = 1 + Math.random() * 1.5; // Expansion speed
      this.alpha = 0.8;
      this.active = true;
      
      // Multiple concentric rings per drop
      this.rings = [
        { offset: 0, speedMult: 1, alphaMult: 1 },
        { offset: 15, speedMult: 0.9, alphaMult: 0.6 },
        { offset: 35, speedMult: 0.8, alphaMult: 0.3 },
        { offset: 50, speedMult: 0.7, alphaMult: 0.1 }
      ];
    }

    update() {
      this.radius += this.speed;
      
      const progress = this.radius / this.maxRadius;
      this.alpha = 0.8 * (1 - progress);
      
      if (this.radius >= this.maxRadius) {
        this.active = false;
      }
    }

    draw(ctx) {
      if (!this.active) return;
      
      ctx.save();
      
      this.rings.forEach(ring => {
        let r = this.radius - ring.offset;
        if (r > 0) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
          
          let currentAlpha = this.alpha * ring.alphaMult;
          if (currentAlpha < 0) currentAlpha = 0;
          
          ctx.strokeStyle = `rgba(100, 255, 218, ${currentAlpha})`;
          ctx.lineWidth = 3 * (1 - (this.radius/this.maxRadius)); // Thinner as it expands
          ctx.stroke();
        }
      });
      
      ctx.restore();
    }
  }

  // --- Input Handling ---

  function handleInteraction(e) {
    initAudio(); // Ensure audio context is ready
    
    // Ignore clicks on UI elements
    if (e.target.closest('#game-header') || e.target.closest('#action-panel')) {
        return;
    }

    let x, y;
    if (e.type === 'touchstart') {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }
    
    // Create falling stone instead of instant ripple
    fallingStones.push(new FallingStone(x, y, currentStoneParams));
  }

  // Bind to pond-area
  const pondArea = document.getElementById('pond-area');
  pondArea.addEventListener('mousedown', handleInteraction);
  pondArea.addEventListener('touchstart', handleInteraction, {passive: true});

  // --- Main Loop ---

  function animate() {
    // Clear fully for clean ripples
    ctx.clearRect(0, 0, width, height);

    // Update and draw ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      let r = ripples[i];
      r.update();
      r.draw(ctx);
      if (!r.active) {
        ripples.splice(i, 1);
      }
    }
    
    // Draw falling stones ON TOP of ripples
    for (let i = fallingStones.length - 1; i >= 0; i--) {
      let s = fallingStones[i];
      s.update();
      s.draw(ctx);
      if (!s.active) {
        fallingStones.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  // --- Initialization ---

  const messages = [
      "Let go of your heavy stones. ⛰️",
      "Listen to the stillness between the drops. 💧",
      "Everything returns to calm. 🍃",
      "Breathe in... Breathe out... 🌬️"
  ];
  const msgEl = document.getElementById('mindful-message');
  
  setInterval(() => {
      msgEl.style.opacity = 0;
      setTimeout(() => {
          msgEl.textContent = messages[Math.floor(Math.random() * messages.length)];
          msgEl.style.opacity = 0.7;
      }, 2000); 
  }, 12000);

  resize();
  animate();
});
