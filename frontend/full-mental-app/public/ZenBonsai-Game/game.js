/* ═══════════════════════════════════════════
   ZEN BONSAI — Game Engine
   Calm, organic, meditative gameplay
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Constants ───
  const STAGES = [
    { name: 'Seed', icon: '🌰', minGrowth: 0 },
    { name: 'Sprout', icon: '🌱', minGrowth: 20 },
    { name: 'Young', icon: '🌿', minGrowth: 40 },
    { name: 'Mature', icon: '🌳', minGrowth: 70 },
    { name: 'Ancient', icon: '🎋', minGrowth: 100 },
  ];

  const MESSAGES = [
    "Take a deep breath. Your bonsai is waiting for you. 🍃",
    "Stillness is where growth begins. 🌿",
    "Every little drop of care matters. 💧",
    "Patience — the tree knows no hurry. 🌸",
    "You are doing something beautiful today. 🌱",
    "Listen to the silence between the leaves. 🍂",
    "This moment is yours. Breathe. 🌾",
    "Nature doesn't rush, yet everything is accomplished. 🌻",
    "Be like water — soft, yet powerful. 💧",
    "Your calm is contagious — even trees feel it. 🌳",
    "Growth happens in quiet moments. 🌙",
    "You're cultivating peace, one action at a time. ☯️",
  ];

  const SAVE_KEY = 'zen_bonsai_save';

  // ─── State ───
  let state = {
    hydration: 70,
    health: 80,
    growth: 0,
    leafDensity: 1.0,
    fertilizeBoost: 0,
    points: 0,
    stage: 0,
    alive: true,
    lastTick: Date.now(),
    dayPhase: 'day',
    dayTimer: 0,
    branches: [],
    leaves: [],
    treeSeed: Math.random() * 10000,
  };

  const cooldowns = { water: 0, trim: 0, fertilize: 0, sunlight: 0, meditate: 0 };
  const COOLDOWN_DURATION = { water: 3000, trim: 6000, fertilize: 8000, sunlight: 4000, meditate: 5000 };

  // ─── DOM refs ───
  const $ = (s) => document.querySelector(s);
  const bonsaiCanvas = $('#bonsai-canvas');
  const bCtx = bonsaiCanvas.getContext('2d');
  const particleCanvas = $('#particles-canvas');
  const pCtx = particleCanvas.getContext('2d');

  const hydrationFill = $('#hydration-fill');
  const healthFill = $('#health-fill');
  const growthFill = $('#growth-fill');
  const hydrationText = $('#hydration-text');
  const healthText = $('#health-text');
  const growthText = $('#growth-text');
  const pointsValue = $('#points-value');
  const stageLabel = $('#stage-label');
  const stageIcon = $('#stage-icon');
  const mindfulMsg = $('#mindful-message');
  const deathOverlay = $('#death-overlay');

  // ─── Canvas sizing ───
  function resizeCanvases() {
    const area = $('#bonsai-area');
    bonsaiCanvas.width = area.clientWidth;
    bonsaiCanvas.height = area.clientHeight;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();


  // ═══════════════════════════════════════
  //  AMBIENT AUDIO (Web Audio API)
  // ═══════════════════════════════════════

  let audioCtx = null;
  let ambienceStarted = false;

  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  function createNoiseNode() {
    const bufferSize = audioCtx.sampleRate * 4;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (last + (0.02 * white)) / 1.02;
      last = data[i];
      data[i] *= 3.5;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    const gain = audioCtx.createGain();
    gain.gain.value = 0.06;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    source.start();
    return { source, gain, filter };
  }

  function createWindNode() {
    const bufferSize = audioCtx.sampleRate * 6;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (last + (0.01 * white)) / 1.01;
      last = data[i];
      data[i] *= 2;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 250;
    filter.Q.value = 0.5;
    const gain = audioCtx.createGain();
    gain.gain.value = 0.03;
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 0.15;
    lfoGain.gain.value = 0.015;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    source.start();
    return { source, gain };
  }

  function playChime(freq = 520, duration = 0.6) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + duration * 0.3);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.8, audioCtx.currentTime + duration);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function playActionSound(action) {
    const freqs = {
      water: [392, 523],
      trim: [659, 784],
      fertilize: [349, 440],
      sunlight: [523, 659],
      meditate: [262, 392],
    };
    const [f1, f2] = freqs[action] || [440, 550];
    playChime(f1, 0.4);
    setTimeout(() => playChime(f2, 0.8), 150);
  }

  // ─── Ambient Music (Procedural) ───

  // Warm drone pad — two detuned oscillators for richness
  function createDronePad() {
    const masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);
    // Slow fade in
    masterGain.gain.linearRampToValueAtTime(0.045, audioCtx.currentTime + 4);

    const notes = [130.81, 196.00]; // C3 and G3 — perfect fifth drone
    notes.forEach((freq, i) => {
      // Layer 1: sine
      const osc1 = audioCtx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = freq;
      const g1 = audioCtx.createGain();
      g1.gain.value = 0.5;
      osc1.connect(g1);
      g1.connect(masterGain);
      osc1.start();

      // Layer 2: triangle, slightly detuned for warmth
      const osc2 = audioCtx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = freq * 1.002; // subtle detune
      const g2 = audioCtx.createGain();
      g2.gain.value = 0.25;
      osc2.connect(g2);
      g2.connect(masterGain);
      osc2.start();

      // Layer 3: very quiet octave above
      const osc3 = audioCtx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.value = freq * 2.001;
      const g3 = audioCtx.createGain();
      g3.gain.value = 0.08;
      osc3.connect(g3);
      g3.connect(masterGain);
      osc3.start();
    });
  }

  // Gentle pentatonic melody — random calming notes
  function createMelody() {
    // C pentatonic scale across octaves — universally calming
    const scale = [
      261.63, 293.66, 329.63, 392.00, 440.00,   // C4 D4 E4 G4 A4
      523.25, 587.33, 659.25, 783.99,             // C5 D5 E5 G5
    ];

    function playNote() {
      if (!audioCtx || audioCtx.state === 'closed') return;

      const freq = scale[Math.floor(Math.random() * scale.length)];
      const now = audioCtx.currentTime;
      const duration = 2.5 + Math.random() * 2; // 2.5–4.5 seconds per note

      // Main tone — soft sine
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      // Gentle envelope: slow attack, long sustain, slow release
      const env = audioCtx.createGain();
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.035, now + 0.8);      // slow attack
      env.gain.linearRampToValueAtTime(0.025, now + duration * 0.6); // gentle sustain
      env.gain.exponentialRampToValueAtTime(0.001, now + duration);   // fade out

      osc.connect(env);
      env.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration);

      // Subtle harmonic — triangle one octave up, very quiet
      if (Math.random() > 0.5) {
        const osc2 = audioCtx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = freq * 2;
        const env2 = audioCtx.createGain();
        env2.gain.setValueAtTime(0, now);
        env2.gain.linearRampToValueAtTime(0.01, now + 1);
        env2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.8);
        osc2.connect(env2);
        env2.connect(audioCtx.destination);
        osc2.start(now + 0.3);
        osc2.stop(now + duration);
      }

      // Schedule next note — gentle pauses between notes
      const nextDelay = (2 + Math.random() * 3) * 1000; // 2–5 seconds
      setTimeout(playNote, nextDelay);
    }

    // Start after a brief warm-up
    setTimeout(playNote, 2000);
  }

  function startAmbience() {
    if (ambienceStarted) return;
    initAudio();
    createNoiseNode();
    createWindNode();
    createDronePad();
    createMelody();
    ambienceStarted = true;
  }

  document.addEventListener('click', startAmbience, { once: true });
  document.addEventListener('touchstart', startAmbience, { once: true });


  // ═══════════════════════════════════════
  //  BONSAI RENDERER (Procedural L-System)
  // ═══════════════════════════════════════

  function seededRandom(seed) {
    let s = seed;
    return function () {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function renderBonsai() {
    const W = bonsaiCanvas.width;
    const H = bonsaiCanvas.height;
    bCtx.clearRect(0, 0, W, H);

    const progress = state.growth / 100;
    const stageIdx = state.stage;
    const isAlive = state.alive;
    const rng = seededRandom(state.treeSeed);

    drawPot(W, H);
    drawSoil(W, H, progress);

    if (progress < 0.02 && stageIdx === 0) {
      drawSeed(W, H);
      return;
    }

    const trunkBaseX = W / 2;
    const trunkBaseY = H * 0.72;
    const trunkHeight = 40 + progress * (H * 0.35);

    drawTree(trunkBaseX, trunkBaseY, trunkHeight, progress, stageIdx, isAlive, rng);
  }

  function drawPot(W, H) {
    const cx = W / 2;
    const potTop = H * 0.72;
    const potBottom = H * 0.88;
    const potTopWidth = W * 0.28;
    const potBotWidth = W * 0.22;
    const rimHeight = 8;

    bCtx.save();
    bCtx.beginPath();
    bCtx.moveTo(cx - potTopWidth, potTop + rimHeight);
    bCtx.lineTo(cx - potBotWidth, potBottom);
    bCtx.quadraticCurveTo(cx, potBottom + 12, cx + potBotWidth, potBottom);
    bCtx.lineTo(cx + potTopWidth, potTop + rimHeight);
    bCtx.closePath();

    const potGrad = bCtx.createLinearGradient(cx - potTopWidth, potTop, cx + potTopWidth, potTop);
    potGrad.addColorStop(0, '#8b6f52');
    potGrad.addColorStop(0.3, '#a68968');
    potGrad.addColorStop(0.7, '#9a7d5e');
    potGrad.addColorStop(1, '#7a6048');
    bCtx.fillStyle = potGrad;
    bCtx.fill();

    bCtx.beginPath();
    bCtx.ellipse(cx, potTop + rimHeight / 2, potTopWidth + 6, rimHeight, 0, 0, Math.PI * 2);
    const rimGrad = bCtx.createLinearGradient(cx, potTop - 4, cx, potTop + rimHeight + 4);
    rimGrad.addColorStop(0, '#a68968');
    rimGrad.addColorStop(1, '#8b6f52');
    bCtx.fillStyle = rimGrad;
    bCtx.fill();

    bCtx.beginPath();
    bCtx.ellipse(cx, potBottom + 4, potBotWidth + 10, 6, 0, 0, Math.PI * 2);
    bCtx.fillStyle = 'rgba(0,0,0,0.08)';
    bCtx.fill();

    bCtx.restore();
  }

  function drawSoil(W, H, progress) {
    const cx = W / 2;
    const soilY = H * 0.72 + 4;
    const soilWidth = W * 0.27;

    bCtx.save();
    bCtx.beginPath();
    bCtx.ellipse(cx, soilY, soilWidth, 10, 0, 0, Math.PI * 2);

    const dryness = 1 - state.hydration / 100;
    const r = Math.round(90 + dryness * 30);
    const g = Math.round(70 + (1 - dryness) * 20);
    const b = Math.round(45 + (1 - dryness) * 10);
    bCtx.fillStyle = `rgb(${r},${g},${b})`;
    bCtx.fill();

    if (state.hydration > 50) {
      bCtx.beginPath();
      bCtx.ellipse(cx - 10, soilY - 2, soilWidth * 0.4, 4, -0.2, 0, Math.PI * 2);
      bCtx.fillStyle = `rgba(126,184,212,${(state.hydration - 50) / 300})`;
      bCtx.fill();
    }

    bCtx.restore();
  }

  function drawSeed(W, H) {
    const cx = W / 2;
    const cy = H * 0.71;
    bCtx.save();
    bCtx.beginPath();
    bCtx.ellipse(cx, cy, 6, 8, 0.2, 0, Math.PI * 2);
    bCtx.fillStyle = '#6b5535';
    bCtx.fill();
    bCtx.strokeStyle = '#5a4a2e';
    bCtx.lineWidth = 1;
    bCtx.stroke();
    bCtx.restore();
  }

  function drawTree(x, y, height, progress, stageIdx, alive, rng) {
    const time = Date.now() / 1000;
    const density = state.leafDensity;

    const trunkColor = alive ? '#6b5035' : '#8a7560';
    const leafGreen = alive
      ? `hsl(${110 + Math.sin(time * 0.5) * 10}, ${45 + progress * 15}%, ${35 + progress * 10}%)`
      : '#9a8a60';
    const leafGreen2 = alive
      ? `hsl(${125 + Math.sin(time * 0.3) * 8}, ${40 + progress * 12}%, ${40 + progress * 8}%)`
      : '#8a7a55';

    const trunkWidth = 3 + progress * 8;

    bCtx.save();

    const curveAmt = rng() * 12 - 6;
    const midX = x + curveAmt;
    const topY = y - height;

    bCtx.beginPath();
    bCtx.moveTo(x - trunkWidth / 2, y);
    bCtx.quadraticCurveTo(midX - trunkWidth / 3, y - height * 0.5, midX - trunkWidth / 4, topY);
    bCtx.lineTo(midX + trunkWidth / 4, topY);
    bCtx.quadraticCurveTo(midX + trunkWidth / 3, y - height * 0.5, x + trunkWidth / 2, y);
    bCtx.closePath();
    bCtx.fillStyle = trunkColor;
    bCtx.fill();

    bCtx.strokeStyle = alive ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.05)';
    bCtx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
      const ly = y - height * (0.15 + rng() * 0.7);
      bCtx.beginPath();
      bCtx.moveTo(x - trunkWidth / 3, ly);
      bCtx.quadraticCurveTo(midX, ly - 3 + rng() * 6, x + trunkWidth / 3, ly + 2);
      bCtx.stroke();
    }

    if (stageIdx >= 1) {
      const numBranches = Math.floor(2 + progress * 6);
      const visibleBranches = Math.max(1, Math.floor(numBranches * (0.4 + density * 0.6)));
      for (let i = 0; i < numBranches; i++) {
        const t = 0.25 + (i / numBranches) * 0.65;
        const bx = x + curveAmt * t;
        const by = y - height * t;
        const side = (i % 2 === 0) ? -1 : 1;
        const len = 15 + progress * 35 * (0.5 + rng() * 0.5);
        const angle = side * (0.4 + rng() * 0.8);
        const bEndX = bx + Math.cos(angle - Math.PI / 2) * len * side;
        const bEndY = by + Math.sin(angle - Math.PI / 2) * len * 0.6;
        const bWidth = 1.5 + progress * 2.5 * (1 - t * 0.5);

        bCtx.beginPath();
        bCtx.moveTo(bx, by);
        bCtx.lineWidth = bWidth;
        bCtx.strokeStyle = trunkColor;
        bCtx.lineCap = 'round';
        const ctrlX = bx + (bEndX - bx) * 0.5 + rng() * 10 - 5;
        const ctrlY = by + (bEndY - by) * 0.3 - 10;
        bCtx.quadraticCurveTo(ctrlX, ctrlY, bEndX, bEndY);
        bCtx.stroke();

        if (stageIdx >= 3) {
          const subLen = len * 0.4;
          const subAngle = angle + (rng() - 0.5) * 1.2;
          const sbEndX = bEndX + Math.cos(subAngle) * subLen * side;
          const sbEndY = bEndY - subLen * 0.5;
          bCtx.beginPath();
          bCtx.moveTo(bEndX, bEndY);
          bCtx.lineWidth = bWidth * 0.5;
          bCtx.quadraticCurveTo(bEndX + (sbEndX - bEndX) * 0.5, bEndY - 8, sbEndX, sbEndY);
          bCtx.stroke();

          if (density > 0.2) {
            const subClusterR = (8 + progress * 6) * (0.3 + density * 0.7);
            drawLeafCluster(sbEndX, sbEndY, subClusterR, leafGreen2, alive, time, rng);
          }
        }

        if (stageIdx >= 2 && (i < visibleBranches || density > 0.5)) {
          const clusterSize = (10 + progress * 14) * (0.3 + density * 0.7);
          drawLeafCluster(bEndX, bEndY, clusterSize, leafGreen, alive, time, rng);
        }
      }

      if (stageIdx >= 2) {
        const crownR = (14 + progress * 18) * (0.4 + density * 0.6);
        drawLeafCluster(midX, topY, crownR, leafGreen2, alive, time, rng);
      }
    }

    if (stageIdx === 1) {
      const leafSize = (6 + progress * 8) * (0.5 + density * 0.5);
      drawSproutLeaf(midX, topY, leafSize, -0.6 + Math.sin(time * 1.5) * 0.05, leafGreen, alive);
      if (density > 0.3) {
        drawSproutLeaf(midX, topY, leafSize * 0.8, 0.5 + Math.sin(time * 1.5 + 1) * 0.05, leafGreen2, alive);
      }
    }

    bCtx.restore();

    if (stageIdx >= 4 && alive) {
      drawFlowers(x, y, height, curveAmt, progress, rng, time);
    }
  }

  function drawLeafCluster(cx, cy, radius, color, alive, time, rng) {
    const sway = Math.sin(time * 0.8 + cx * 0.01) * 2;
    const numBlobs = 5 + Math.floor(rng() * 4);

    for (let i = 0; i < numBlobs; i++) {
      const angle = (i / numBlobs) * Math.PI * 2 + rng() * 0.5;
      const dist = radius * (0.3 + rng() * 0.7);
      const bx = cx + Math.cos(angle) * dist + sway;
      const by = cy + Math.sin(angle) * dist * 0.7;
      const br = radius * (0.35 + rng() * 0.3);

      bCtx.beginPath();
      bCtx.ellipse(bx, by, br, br * 0.8, rng() * 0.5, 0, Math.PI * 2);
      bCtx.fillStyle = color;
      bCtx.globalAlpha = alive ? 0.7 + rng() * 0.3 : 0.4;
      bCtx.fill();
      bCtx.globalAlpha = 1;
    }

    if (alive) {
      bCtx.beginPath();
      bCtx.ellipse(cx + sway - 2, cy - radius * 0.2, radius * 0.3, radius * 0.25, 0, 0, Math.PI * 2);
      bCtx.fillStyle = 'rgba(255,255,255,0.1)';
      bCtx.fill();
    }
  }

  function drawSproutLeaf(x, y, size, angle, color, alive) {
    bCtx.save();
    bCtx.translate(x, y);
    bCtx.rotate(angle);
    bCtx.beginPath();
    bCtx.moveTo(0, 0);
    bCtx.quadraticCurveTo(size * 0.6, -size, size * 1.2, 0);
    bCtx.quadraticCurveTo(size * 0.6, size * 0.5, 0, 0);
    bCtx.fillStyle = color;
    bCtx.globalAlpha = alive ? 0.85 : 0.4;
    bCtx.fill();
    bCtx.globalAlpha = 1;

    bCtx.beginPath();
    bCtx.moveTo(2, 0);
    bCtx.lineTo(size * 1, 0);
    bCtx.strokeStyle = 'rgba(255,255,255,0.15)';
    bCtx.lineWidth = 0.5;
    bCtx.stroke();

    bCtx.restore();
  }

  function drawFlowers(x, y, height, curveAmt, progress, rng, time) {
    const colors = ['#f0b8c8', '#f0c8d8', '#e8a8b8', '#f8d0e0'];
    const numFlowers = 4 + Math.floor(rng() * 5);

    for (let i = 0; i < numFlowers; i++) {
      const t = 0.3 + rng() * 0.6;
      const side = rng() > 0.5 ? 1 : -1;
      const fx = x + curveAmt * t + side * (15 + rng() * 30);
      const fy = y - height * t - rng() * 15;
      const petalSize = 3 + rng() * 3;
      const sway = Math.sin(time + i) * 1.5;
      const color = colors[Math.floor(rng() * colors.length)];

      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2;
        const px = fx + sway + Math.cos(pa) * petalSize;
        const py = fy + Math.sin(pa) * petalSize;
        bCtx.beginPath();
        bCtx.ellipse(px, py, petalSize * 0.6, petalSize * 0.4, pa, 0, Math.PI * 2);
        bCtx.fillStyle = color;
        bCtx.globalAlpha = 0.7;
        bCtx.fill();
      }
      bCtx.beginPath();
      bCtx.arc(fx + sway, fy, petalSize * 0.3, 0, Math.PI * 2);
      bCtx.fillStyle = '#f0d87e';
      bCtx.globalAlpha = 0.9;
      bCtx.fill();
      bCtx.globalAlpha = 1;
    }
  }


  // ═══════════════════════════════════════
  //  PARTICLES (Leaves, Fireflies, Water)
  // ═══════════════════════════════════════

  let particles = [];

  function spawnParticle(type) {
    const W = particleCanvas.width;
    const H = particleCanvas.height;

    if (type === 'leaf') {
      particles.push({
        type: 'leaf', x: Math.random() * W, y: -10,
        vx: (Math.random() - 0.5) * 0.5, vy: 0.3 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        size: 4 + Math.random() * 5,
        opacity: 0.3 + Math.random() * 0.4,
        color: ['#8fae8b', '#a4c49e', '#c4a882', '#d4b892'][Math.floor(Math.random() * 4)],
        life: 600 + Math.random() * 400,
      });
    } else if (type === 'firefly') {
      particles.push({
        type: 'firefly', x: Math.random() * W,
        y: H * 0.3 + Math.random() * H * 0.5,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        size: 2 + Math.random() * 2, opacity: 0,
        maxOpacity: 0.4 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        life: 300 + Math.random() * 500,
      });
    } else if (type === 'droplet') {
      const cx = particleCanvas.width / 2;
      const cy = particleCanvas.height * 0.45;
      particles.push({
        type: 'droplet',
        x: cx + (Math.random() - 0.5) * 80,
        y: cy - 30 + Math.random() * 20,
        vy: 1 + Math.random() * 2,
        size: 2 + Math.random() * 2,
        opacity: 0.5 + Math.random() * 0.3,
        life: 60 + Math.random() * 40,
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life--;
      if (p.life <= 0) { particles.splice(i, 1); continue; }

      if (p.type === 'leaf') {
        p.x += p.vx + Math.sin(Date.now() / 2000 + p.rotation) * 0.3;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        if (p.life < 50) p.opacity *= 0.96;
      } else if (p.type === 'firefly') {
        p.x += p.vx + Math.sin(Date.now() / 3000 + p.phase) * 0.2;
        p.y += p.vy + Math.cos(Date.now() / 2500 + p.phase) * 0.15;
        p.opacity = p.maxOpacity * Math.abs(Math.sin(Date.now() / 800 + p.phase));
      } else if (p.type === 'droplet') {
        p.y += p.vy;
        p.vy += 0.1;
        if (p.life < 20) p.opacity *= 0.9;
      }
    }
  }

  function renderParticles() {
    pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    for (const p of particles) {
      pCtx.save();
      if (p.type === 'leaf') {
        pCtx.translate(p.x, p.y);
        pCtx.rotate(p.rotation);
        pCtx.globalAlpha = p.opacity;
        pCtx.fillStyle = p.color;
        pCtx.beginPath();
        pCtx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        pCtx.fill();
      } else if (p.type === 'firefly') {
        pCtx.globalAlpha = p.opacity;
        const grad = pCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        grad.addColorStop(0, '#f0e878');
        grad.addColorStop(0.4, 'rgba(240, 232, 120, 0.3)');
        grad.addColorStop(1, 'rgba(240, 232, 120, 0)');
        pCtx.fillStyle = grad;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        pCtx.fill();
      } else if (p.type === 'droplet') {
        pCtx.globalAlpha = p.opacity;
        pCtx.fillStyle = '#7eb8d4';
        pCtx.beginPath();
        pCtx.ellipse(p.x, p.y, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
        pCtx.fill();
      }
      pCtx.restore();
    }
  }


  // ═══════════════════════════════════════
  //  GAME LOGIC
  // ═══════════════════════════════════════

  function doAction(action) {
    if (!state.alive) return;
    if (Date.now() < cooldowns[action]) return;

    startAmbience();
    playActionSound(action);

    switch (action) {
      case 'water':
        state.hydration = Math.min(100, state.hydration + 20);
        state.points += 5;
        showToast('💧 +5 pts — Refreshing!');
        for (let i = 0; i < 12; i++) spawnParticle('droplet');
        break;
      case 'trim':
        if (state.stage < 2) return;
        const trimAmt = 0.15 + Math.random() * 0.15;
        state.leafDensity = Math.max(0.1, state.leafDensity - trimAmt);
        state.points += 10;
        state.treeSeed += 0.3;
        for (let i = 0; i < 8; i++) spawnParticle('leaf');
        {
          const pct = Math.round(state.leafDensity * 100);
          showToast(`✂️ +10 pts — Trimmed! Density: ${pct}%`);
        }
        break;
      case 'fertilize':
        state.growth = Math.min(100, state.growth + 8);
        state.health = Math.min(100, state.health + 5);
        state.fertilizeBoost = 30;
        state.points += 8;
        showToast('🌱 +8 pts — Nutrients! 💧 Water 2x needed!');
        break;
      case 'sunlight':
        state.health = Math.min(100, state.health + 10);
        state.points += 3;
        showToast('☀️ +3 pts — Warm sunlight!');
        break;
      case 'meditate':
        state.health = Math.min(100, state.health + 3);
        state.hydration = Math.min(100, state.hydration + 2);
        state.points += 2;
        showToast('🧘 +2 pts — Inner peace…');
        if (audioCtx) {
          setTimeout(() => playChime(262, 1.2), 300);
          setTimeout(() => playChime(330, 1.0), 600);
          setTimeout(() => playChime(392, 1.5), 900);
        }
        break;
    }

    cooldowns[action] = Date.now() + COOLDOWN_DURATION[action];
    const btn = $(`#btn-${action}`);
    btn.classList.add('cooldown');
    setTimeout(() => btn.classList.remove('cooldown'), COOLDOWN_DURATION[action]);
    btn.style.animation = 'pulse 0.3s ease';
    setTimeout(() => btn.style.animation = '', 300);

    updateStage();
    updateUI();
    saveGame();
  }

  function updateStage() {
    let newStage = 0;
    for (let i = STAGES.length - 1; i >= 0; i--) {
      if (state.growth >= STAGES[i].minGrowth) {
        newStage = i;
        break;
      }
    }
    if (newStage !== state.stage) {
      state.stage = newStage;
      showToast(`🌟 Stage: ${STAGES[newStage].name}!`);
      state.points += newStage * 15;
    }

    const trimBtn = $('#btn-trim');
    trimBtn.disabled = state.stage < 2;
  }

  function tick() {
    if (!state.alive) return;

    const now = Date.now();
    const dt = (now - state.lastTick) / 1000;
    state.lastTick = now;

    // Fertilize boost countdown
    if (state.fertilizeBoost > 0) {
      state.fertilizeBoost = Math.max(0, state.fertilizeBoost - dt);
    }

    // Water drain: 2x when fertilized (plant uses more water with nutrients)
    const waterDrainRate = state.fertilizeBoost > 0 ? 0.70 : 0.35;
    state.hydration = Math.max(0, state.hydration - dt * waterDrainRate);
    state.health = Math.max(0, state.health - dt * 0.12);

    // Growth decays — needs fertilizing to maintain
    state.growth = Math.max(0, state.growth - dt * 0.12);

    // Growth: only when needs are met
    if (state.hydration > 25 && state.health > 20) {
      const growthRate = 0.08 * (state.hydration / 100) * (state.health / 100);
      state.growth = Math.min(100, state.growth + dt * growthRate);
    }

    // Leaf density naturally regrows
    if (state.health > 30 && state.hydration > 20) {
      state.leafDensity = Math.min(1.0, state.leafDensity + dt * 0.008);
    }
    if (state.health < 15) {
      state.leafDensity = Math.max(0.05, state.leafDensity - dt * 0.02);
    }

    // Health drops faster when dehydrated
    if (state.hydration < 10) {
      state.health = Math.max(0, state.health - dt * 0.5);
    }

    // Death check
    if (state.health <= 0 && state.hydration <= 0) {
      state.alive = false;
      deathOverlay.classList.remove('hidden');
      showToast('🍂 Your bonsai has wilted…');
    }

    updateStage();
  }

  // Day/night cycle
  function updateDayCycle() {
    state.dayTimer++;
    const phase = state.dayTimer % 270;

    const skyBg = $('#sky-bg');
    if (phase < 90) {
      state.dayPhase = 'day';
      skyBg.className = '';
      document.body.classList.remove('night-mode');
    } else if (phase < 150) {
      state.dayPhase = 'sunset';
      skyBg.className = 'sunset';
      document.body.classList.remove('night-mode');
    } else {
      state.dayPhase = 'night';
      skyBg.className = 'night';
      document.body.classList.add('night-mode');
    }
  }


  // ─── UI Updates ───
  function updateUI() {
    const h = Math.round(state.hydration);
    const hp = Math.round(state.health);
    const g = Math.round(state.growth);

    hydrationFill.style.width = h + '%';
    healthFill.style.width = hp + '%';
    growthFill.style.width = g + '%';
    hydrationText.textContent = h + '%';
    healthText.textContent = hp + '%';
    growthText.textContent = g + '%';

    hydrationFill.style.background = h < 20
      ? 'linear-gradient(90deg, #d4887e, #e8a898)'
      : 'linear-gradient(90deg, #7eb8d4, #a8d4e8)';
    healthFill.style.background = hp < 20
      ? 'linear-gradient(90deg, #d4887e, #e8a898)'
      : 'linear-gradient(90deg, #7ec87e, #a8e8a8)';

    pointsValue.textContent = state.points;
    stageLabel.textContent = STAGES[state.stage].name;
    stageIcon.textContent = STAGES[state.stage].icon;
  }

  function showToast(msg) {
    const container = $('#toast-container');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  let msgIndex = 0;
  function cycleMindfulMessage() {
    mindfulMsg.style.opacity = 0;
    setTimeout(() => {
      msgIndex = (msgIndex + 1) % MESSAGES.length;
      mindfulMsg.textContent = MESSAGES[msgIndex];
      mindfulMsg.style.opacity = 1;
    }, 500);
  }


  // ─── Save/Load ───
  function saveGame() {
    const data = {
      hydration: state.hydration,
      health: state.health,
      growth: state.growth,
      leafDensity: state.leafDensity,
      fertilizeBoost: state.fertilizeBoost,
      points: state.points,
      stage: state.stage,
      alive: state.alive,
      treeSeed: state.treeSeed,
      savedAt: Date.now(),
    };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);

      state.hydration = data.hydration ?? 70;
      state.health = data.health ?? 80;
      state.growth = data.growth ?? 0;
      state.leafDensity = data.leafDensity ?? 1.0;
      state.fertilizeBoost = data.fertilizeBoost ?? 0;
      state.points = data.points ?? 0;
      state.stage = data.stage ?? 0;
      state.alive = data.alive ?? true;
      state.treeSeed = data.treeSeed ?? state.treeSeed;

      if (data.savedAt) {
        const awaySeconds = (Date.now() - data.savedAt) / 1000;
        const cappedAway = Math.min(awaySeconds, 6 * 3600);
        state.hydration = Math.max(0, state.hydration - cappedAway * 0.15);
        state.health = Math.max(0, state.health - cappedAway * 0.05);
        state.growth = Math.max(0, state.growth - cappedAway * 0.05);
      }

      if (!state.alive) {
        deathOverlay.classList.remove('hidden');
      }
    } catch (e) { }
  }

  function resetGame() {
    state = {
      hydration: 70,
      health: 80,
      growth: 0,
      leafDensity: 1.0,
      fertilizeBoost: 0,
      points: 0,
      stage: 0,
      alive: true,
      lastTick: Date.now(),
      dayPhase: 'day',
      dayTimer: 0,
      branches: [],
      leaves: [],
      treeSeed: Math.random() * 10000,
    };
    deathOverlay.classList.add('hidden');
    updateUI();
    saveGame();
  }


  // ─── Event Listeners ───
  document.querySelectorAll('.action-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      doAction(action);
    });
  });

  $('#btn-rebirth').addEventListener('click', resetGame);


  // ─── Main Loop ───
  let frameCount = 0;

  function gameLoop() {
    frameCount++;

    if (frameCount % 60 === 0) {
      tick();
      updateUI();
    }

    if (frameCount % 60 === 0) {
      updateDayCycle();
    }

    if (frameCount % 600 === 0) {
      saveGame();
    }

    if (frameCount % 120 === 0) {
      if (state.dayPhase === 'night') {
        spawnParticle('firefly');
      } else {
        spawnParticle('leaf');
      }
    }

    if (frameCount % 1200 === 0) {
      cycleMindfulMessage();
    }

    renderBonsai();
    updateParticles();
    renderParticles();

    requestAnimationFrame(gameLoop);
  }


  // ─── Init ───
  loadGame();
  state.lastTick = Date.now();
  updateStage();
  updateUI();
  gameLoop();

})();
