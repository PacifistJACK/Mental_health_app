/* ═══════════════════════════════════════════
   ZEN SAND GARDEN — Game Engine
   Calm, meditative 2D sand raking simulation
   ═══════════════════════════════════════════ */

(function () {
    'use strict';

    // ─── DOM refs ───
    const $ = (s) => document.querySelector(s);
    const gardenCanvas = $('#garden-canvas');
    const gCtx = gardenCanvas.getContext('2d');
    const particleCanvas = $('#particles-canvas');
    const pCtx = particleCanvas.getContext('2d');
    const pointsValue = $('#points-value');
    const mindfulMsg = $('#mindful-message');
    const toastContainer = $('#toast-container');
    const skyBg = $('#sky-bg');

    // ─── Constants ───
    const SAND_RESOLUTION = 2; // each heightmap cell = 2x2 pixels
    const BASE_HEIGHT = 128;   // flat sand = mid-gray in heightmap
    let GROOVE_DEPTH = 85;     // how deep grooves go (let so trace mode can alter it)
    const RAKE_WIDTH = 4;      // fine rake tine count
    const RAKE_SPACING = 12;   // pixels between tines
    const WAVE_AMPLITUDE = 16; // wider waves
    const WAVE_FREQUENCY = 0.08;

    const ZEN_QUOTES = [
        "Each stroke in the sand is a moment of peace. ☯",
        "In the garden of the mind, stillness blooms. 🌸",
        "The rake follows the hand; the hand follows the heart. 💫",
        "Simplicity is the ultimate sophistication. 🍃",
        "Be like water — flow around obstacles. 🌊",
        "Every grain of sand holds a universe. ✨",
        "Peace is not found, it is created. 🧘",
        "The garden reflects the gardener. 🪨",
        "Silence speaks louder than words. 🤫",
        "Let go of perfection; embrace the pattern. ☯",
        "The path is made by raking. 〰️",
        "Still the mind, and the sand follows. 🌀",
        "A single stone changes the whole garden. 🪨",
        "Breathe in calm, rake out worry. 🍃",
        "Nature does not hurry, yet everything is accomplished. 🌿",
    ];

    // ─── State ───
    let sandWidth = 0;
    let sandHeight = 0;
    let heightmap = null;      // Float32Array — sand height per cell
    let canvasW = 0;
    let canvasH = 0;

    let currentTool = 'fine-rake';
    let isDrawing = false;
    let lastX = -1;
    let lastY = -1;
    let totalStrokeLength = 0; // for serenity points

    // Stones & moss
    let stones = [];
    let mosses = [];
    let draggingStone = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // Points & time
    let serenityPoints = 0;
    let lastPointsTick = Date.now();
    let rakeTime = 0; // ms spent raking

    // Day/night
    let dayTimer = 0;
    let dayPhase = 'day';

    // Particles
    let particles = [];

    // ─── Canvas sizing ───
    function resizeCanvases() {
        const area = $('#garden-area');
        const rect = area.getBoundingClientRect();
        canvasW = Math.floor(rect.width);
        canvasH = Math.floor(rect.height);

        gardenCanvas.width = canvasW;
        gardenCanvas.height = canvasH;

        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;

        const newSW = Math.floor(canvasW / SAND_RESOLUTION);
        const newSH = Math.floor(canvasH / SAND_RESOLUTION);

        if (newSW !== sandWidth || newSH !== sandHeight) {
            const oldMap = heightmap;
            const oldW = sandWidth;
            const oldH = sandHeight;

            sandWidth = newSW;
            sandHeight = newSH;
            heightmap = new Float32Array(sandWidth * sandHeight);
            heightmap.fill(BASE_HEIGHT);

            // Copy old data if resizing
            if (oldMap) {
                const copyW = Math.min(oldW, sandWidth);
                const copyH = Math.min(oldH, sandHeight);
                for (let y = 0; y < copyH; y++) {
                    for (let x = 0; x < copyW; x++) {
                        heightmap[y * sandWidth + x] = oldMap[y * oldW + x];
                    }
                }
            }
        }
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

    // Gentle wind
    function createWindNode() {
        if (!audioCtx) return;
        const bufferSize = audioCtx.sampleRate * 4;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        // Brownian noise for wind-like sound
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
        filter.frequency.value = 300;

        const gain = audioCtx.createGain();
        gain.gain.value = 0.06;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        source.start();
    }

    // Warm drone pad
    function createDronePad() {
        if (!audioCtx) return;
        const notes = [110, 164.81, 220]; // A2, E3, A3

        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;

            const osc2 = audioCtx.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.value = freq * 1.003; // slight detune

            const gain = audioCtx.createGain();
            gain.gain.value = 0.012;

            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc2.start();
        });
    }

    // Pentatonic melody
    function createMelody() {
        if (!audioCtx) return;
        const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];

        function playNote() {
            if (!audioCtx) return;
            const freq = scale[Math.floor(Math.random() * scale.length)];
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;

            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 3);

            const nextDelay = 3000 + Math.random() * 8000;
            setTimeout(playNote, nextDelay);
        }

        setTimeout(playNote, 2000);
    }

    // Sand raking sound effect
    function playSandSound() {
        if (!audioCtx) return;
        const bufferSize = audioCtx.sampleRate * 0.2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.4; // louder base noise
        }

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600 + Math.random() * 400; // slightly higher so it's audible
        filter.Q.value = 0.5;

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.02); // quick louder attack
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2); // smooth release

        source.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        source.start(audioCtx.currentTime);
        source.stop(audioCtx.currentTime + 0.2);
    }

    // Chime for stone placement
    function playChime(freq = 520, duration = 0.8) {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    function startAmbience() {
        if (ambienceStarted) return;
        ambienceStarted = true;
        initAudio();
        createWindNode();
        createDronePad();
        createMelody();
    }

    document.addEventListener('click', startAmbience, { once: true });
    document.addEventListener('touchstart', startAmbience, { once: true });


    // ═══════════════════════════════════════
    //  SAND HEIGHTMAP RENDERING
    // ═══════════════════════════════════════

    // Pre-create ImageData for performance
    let sandImageData = null;

    function renderSand() {
        if (!heightmap || sandWidth === 0 || sandHeight === 0) return;

        // Create or recreate ImageData if canvas size changed
        if (!sandImageData || sandImageData.width !== canvasW || sandImageData.height !== canvasH) {
            sandImageData = gCtx.createImageData(canvasW, canvasH);
        }

        const pixels = sandImageData.data;

        // Sand base colors (warm beige tones)
        const baseR = 220, baseG = 208, baseB = 188;
        const grooveR = 145, grooveG = 125, grooveB = 95; // Deeper, darker grooves
        const peakR = 242, peakG = 232, peakB = 215; // Slightly brighter peaks

        // Night mode adjustments
        const isNight = dayPhase === 'night';
        const isSunset = dayPhase === 'sunset';
        let tintR = 0, tintG = 0, tintB = 0;
        if (isNight) { tintR = -60; tintG = -50; tintB = -30; }
        else if (isSunset) { tintR = 15; tintG = -5; tintB = -20; }

        for (let sy = 0; sy < sandHeight; sy++) {
            for (let sx = 0; sx < sandWidth; sx++) {
                const h = heightmap[sy * sandWidth + sx];
                const t = (h - (BASE_HEIGHT - GROOVE_DEPTH)) / (GROOVE_DEPTH * 2);
                const clamped = Math.max(0, Math.min(1, t));

                // Interpolate color based on height
                let r, g, b;
                if (clamped < 0.5) {
                    const f = clamped * 2;
                    r = grooveR + (baseR - grooveR) * f;
                    g = grooveG + (baseG - grooveG) * f;
                    b = grooveB + (baseB - grooveB) * f;
                } else {
                    const f = (clamped - 0.5) * 2;
                    r = baseR + (peakR - baseR) * f;
                    g = baseG + (peakG - baseG) * f;
                    b = baseB + (peakB - baseB) * f;
                }

                // Add subtle grain noise
                const grain = (Math.random() - 0.5) * 6;
                r += grain + tintR;
                g += grain + tintG;
                b += grain + tintB;

                // Simple directional shadow — based on height difference with neighbor
                if (sx > 0) {
                    const hLeft = heightmap[sy * sandWidth + (sx - 1)];
                    const diff = (h - hLeft) * 0.8; // Increased shadow contrast
                    r += diff;
                    g += diff;
                    b += diff;
                }

                // Fill the SAND_RESOLUTION x SAND_RESOLUTION pixel block
                const startPx = sy * SAND_RESOLUTION;
                const startPy = sx * SAND_RESOLUTION;
                for (let py = 0; py < SAND_RESOLUTION && (startPx + py) < canvasH; py++) {
                    for (let px = 0; px < SAND_RESOLUTION && (startPy + px) < canvasW; px++) {
                        const idx = ((startPx + py) * canvasW + (startPy + px)) * 4;
                        pixels[idx] = Math.max(0, Math.min(255, r));
                        pixels[idx + 1] = Math.max(0, Math.min(255, g));
                        pixels[idx + 2] = Math.max(0, Math.min(255, b));
                        pixels[idx + 3] = 255;
                    }
                }
            }
        }

        gCtx.putImageData(sandImageData, 0, 0);

        // Draw rounded corner mask
        drawRoundedMask();

        // Draw stones on top
        drawStones();

        // Draw moss on top
        drawMosses();
    }

    function drawRoundedMask() {
        gCtx.save();
        gCtx.globalCompositeOperation = 'destination-in';
        const r = 16;
        gCtx.beginPath();
        gCtx.moveTo(r, 0);
        gCtx.lineTo(canvasW - r, 0);
        gCtx.quadraticCurveTo(canvasW, 0, canvasW, r);
        gCtx.lineTo(canvasW, canvasH - r);
        gCtx.quadraticCurveTo(canvasW, canvasH, canvasW - r, canvasH);
        gCtx.lineTo(r, canvasH);
        gCtx.quadraticCurveTo(0, canvasH, 0, canvasH - r);
        gCtx.lineTo(0, r);
        gCtx.quadraticCurveTo(0, 0, r, 0);
        gCtx.closePath();
        gCtx.fillStyle = '#fff';
        gCtx.fill();
        gCtx.restore();

        // Subtle border
        gCtx.save();
        gCtx.strokeStyle = 'rgba(139, 115, 85, 0.25)';
        gCtx.lineWidth = 1.5;
        gCtx.beginPath();
        gCtx.moveTo(r, 0);
        gCtx.lineTo(canvasW - r, 0);
        gCtx.quadraticCurveTo(canvasW, 0, canvasW, r);
        gCtx.lineTo(canvasW, canvasH - r);
        gCtx.quadraticCurveTo(canvasW, canvasH, canvasW - r, canvasH);
        gCtx.lineTo(r, canvasH);
        gCtx.quadraticCurveTo(0, canvasH, 0, canvasH - r);
        gCtx.lineTo(0, r);
        gCtx.quadraticCurveTo(0, 0, r, 0);
        gCtx.closePath();
        gCtx.stroke();
        gCtx.restore();
    }


    // ═══════════════════════════════════════
    //  STONES & MOSS
    // ═══════════════════════════════════════

    function drawStones() {
        stones.forEach(stone => {
            gCtx.save();
            gCtx.translate(stone.x, stone.y);
            gCtx.rotate(stone.rotation);

            // Stone shadow
            gCtx.beginPath();
            gCtx.ellipse(3, 4, stone.rx + 2, stone.ry + 1, 0, 0, Math.PI * 2);
            gCtx.fillStyle = 'rgba(0, 0, 0, 0.12)';
            gCtx.fill();

            // Stone body
            const grad = gCtx.createRadialGradient(
                -stone.rx * 0.25, -stone.ry * 0.3, stone.rx * 0.1,
                0, 0, Math.max(stone.rx, stone.ry)
            );
            grad.addColorStop(0, stone.colorLight);
            grad.addColorStop(0.6, stone.colorMid);
            grad.addColorStop(1, stone.colorDark);

            gCtx.beginPath();
            gCtx.ellipse(0, 0, stone.rx, stone.ry, 0, 0, Math.PI * 2);
            gCtx.fillStyle = grad;
            gCtx.fill();

            // Surface texture — small speckles
            for (let i = 0; i < 6; i++) {
                const sx = (Math.random() - 0.5) * stone.rx * 1.4;
                const sy = (Math.random() - 0.5) * stone.ry * 1.4;
                gCtx.beginPath();
                gCtx.arc(sx, sy, 1, 0, Math.PI * 2);
                gCtx.fillStyle = 'rgba(0,0,0,0.08)';
                gCtx.fill();
            }

            // Highlight
            gCtx.beginPath();
            gCtx.ellipse(-stone.rx * 0.2, -stone.ry * 0.25, stone.rx * 0.35, stone.ry * 0.25, -0.3, 0, Math.PI * 2);
            gCtx.fillStyle = 'rgba(255,255,255,0.12)';
            gCtx.fill();

            gCtx.restore();
        });
    }

    function drawMosses() {
        mosses.forEach(moss => {
            gCtx.save();
            gCtx.translate(moss.x, moss.y);

            // Draw small clump of circles
            moss.dots.forEach(dot => {
                const grad = gCtx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dot.r);
                grad.addColorStop(0, 'rgba(107, 139, 90, 0.85)');
                grad.addColorStop(0.6, 'rgba(85, 120, 65, 0.7)');
                grad.addColorStop(1, 'rgba(70, 100, 50, 0)');
                gCtx.beginPath();
                gCtx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
                gCtx.fillStyle = grad;
                gCtx.fill();
            });

            gCtx.restore();
        });
    }

    function createStone(x, y) {
        const types = [
            { colorLight: '#a0a09e', colorMid: '#7a7a78', colorDark: '#5a5a58' },
            { colorLight: '#b0a898', colorMid: '#8a7e6e', colorDark: '#6a5e4e' },
            { colorLight: '#909898', colorMid: '#708080', colorDark: '#506060' },
            { colorLight: '#988888', colorMid: '#786868', colorDark: '#584848' },
        ];
        const t = types[Math.floor(Math.random() * types.length)];
        const rx = 15 + Math.random() * 22;
        const ry = 12 + Math.random() * 16;

        return {
            x, y,
            rx, ry,
            rotation: Math.random() * Math.PI,
            ...t,
            id: Date.now() + Math.random(),
        };
    }

    function createMoss(x, y) {
        const dots = [];
        const count = 5 + Math.floor(Math.random() * 6);
        for (let i = 0; i < count; i++) {
            dots.push({
                x: (Math.random() - 0.5) * 20,
                y: (Math.random() - 0.5) * 16,
                r: 3 + Math.random() * 5,
            });
        }
        return { x, y, dots, id: Date.now() + Math.random() };
    }

    // Check if position collides with a stone
    function isInsideStone(px, py) {
        for (const stone of stones) {
            const dx = px - stone.x;
            const dy = py - stone.y;
            // Rotate point by negative stone rotation
            const cos = Math.cos(-stone.rotation);
            const sin = Math.sin(-stone.rotation);
            const lx = dx * cos - dy * sin;
            const ly = dx * sin + dy * cos;
            if ((lx * lx) / (stone.rx * stone.rx) + (ly * ly) / (stone.ry * stone.ry) <= 1.3) {
                return true;
            }
        }
        return false;
    }

    function getStoneAt(px, py) {
        for (let i = stones.length - 1; i >= 0; i--) {
            const stone = stones[i];
            const dx = px - stone.x;
            const dy = py - stone.y;
            const cos = Math.cos(-stone.rotation);
            const sin = Math.sin(-stone.rotation);
            const lx = dx * cos - dy * sin;
            const ly = dx * sin + dy * cos;
            if ((lx * lx) / (stone.rx * stone.rx) + (ly * ly) / (stone.ry * stone.ry) <= 1.0) {
                return stone;
            }
        }
        return null;
    }

    // Stamp a stone's presence into the heightmap (push sand around it)
    function stampStoneIntoSand(stone) {
        const cx = Math.floor(stone.x / SAND_RESOLUTION);
        const cy = Math.floor(stone.y / SAND_RESOLUTION);
        const radiusCells = Math.ceil(Math.max(stone.rx, stone.ry) / SAND_RESOLUTION) + 3;

        for (let dy = -radiusCells; dy <= radiusCells; dy++) {
            for (let dx = -radiusCells; dx <= radiusCells; dx++) {
                const sx = cx + dx;
                const sy = cy + dy;
                if (sx < 0 || sx >= sandWidth || sy < 0 || sy >= sandHeight) continue;

                const px = sx * SAND_RESOLUTION;
                const py = sy * SAND_RESOLUTION;
                const ddx = px - stone.x;
                const ddy = py - stone.y;
                const cos = Math.cos(-stone.rotation);
                const sin = Math.sin(-stone.rotation);
                const lx = ddx * cos - ddy * sin;
                const ly = ddx * sin + ddy * cos;
                const dist = Math.sqrt((lx * lx) / (stone.rx * stone.rx) + (ly * ly) / (stone.ry * stone.ry));

                if (dist < 1.2) {
                    // Inside stone — raise sand slightly
                    heightmap[sy * sandWidth + sx] = BASE_HEIGHT + 8;
                } else if (dist < 1.8) {
                    // Near stone — create a small mound
                    const f = 1 - (dist - 1.2) / 0.6;
                    heightmap[sy * sandWidth + sx] = BASE_HEIGHT + f * 12;
                }
            }
        }
    }


    // ═══════════════════════════════════════
    //  RAKING TOOLS
    // ═══════════════════════════════════════

    function rakeAt(x, y, prevX, prevY) {
        const sx = Math.floor(x / SAND_RESOLUTION);
        const sy = Math.floor(y / SAND_RESOLUTION);

        if (sx < 0 || sx >= sandWidth || sy < 0 || sy >= sandHeight) return;
        if (isInsideStone(x, y)) return;

        const dx = x - prevX;
        const dy = y - prevY;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1) return;

        // Direction perpendicular to stroke
        const perpX = -dy / len;
        const perpY = dx / len;

        switch (currentTool) {
            case 'fine-rake':
                drawFineRake(sx, sy, perpX, perpY, x, y);
                break;
            case 'wave-rake':
                drawWaveRake(sx, sy, perpX, perpY, dx, dy, x, y);
                break;
            case 'spiral':
                drawSpiral(x, y);
                break;
        }

        totalStrokeLength += len;
    }

    function drawFineRake(sx, sy, perpX, perpY, worldX, worldY) {
        const halfCount = Math.floor(RAKE_WIDTH / 2);
        for (let i = -halfCount; i <= halfCount; i++) {
            const ox = Math.round(i * RAKE_SPACING / SAND_RESOLUTION * perpX);
            const oy = Math.round(i * RAKE_SPACING / SAND_RESOLUTION * perpY);
            const tx = sx + ox;
            const ty = sy + oy;
            if (tx >= 0 && tx < sandWidth && ty >= 0 && ty < sandHeight) {
                if (!isInsideStone(tx * SAND_RESOLUTION, ty * SAND_RESOLUTION)) {
                    // Groove: Widen the line by lowering the center and immediate neighbors
                    for (let gw = -1; gw <= 1; gw++) {
                        const wx = tx + Math.round(gw * perpX);
                        const wy = ty + Math.round(gw * perpY);
                        if (wx >= 0 && wx < sandWidth && wy >= 0 && wy < sandHeight) {
                            heightmap[wy * sandWidth + wx] = Math.max(
                                BASE_HEIGHT - GROOVE_DEPTH,
                                heightmap[wy * sandWidth + wx] - 18
                            );
                        }
                    }
                    // Ridge: raise outer edges slightly further out
                    for (let r = -2; r <= 2; r += 4) {
                        const rx = tx + Math.round(r * perpX);
                        const ry = ty + Math.round(r * perpY);
                        if (rx >= 0 && rx < sandWidth && ry >= 0 && ry < sandHeight) {
                            heightmap[ry * sandWidth + rx] = Math.min(
                                BASE_HEIGHT + GROOVE_DEPTH * 0.4,
                                heightmap[ry * sandWidth + rx] + 5
                            );
                        }
                    }
                }
            }
        }
    }

    function drawWaveRake(sx, sy, perpX, perpY, dx, dy, worldX, worldY) {
        const halfCount = Math.floor(RAKE_WIDTH / 2);
        const t = totalStrokeLength * WAVE_FREQUENCY;

        for (let i = -halfCount; i <= halfCount; i++) {
            const waveOffset = Math.sin(t + i * 0.8) * WAVE_AMPLITUDE / SAND_RESOLUTION;
            const ox = Math.round((i * RAKE_SPACING / SAND_RESOLUTION + waveOffset) * perpX);
            const oy = Math.round((i * RAKE_SPACING / SAND_RESOLUTION + waveOffset) * perpY);
            const tx = sx + ox;
            const ty = sy + oy;

            if (tx >= 0 && tx < sandWidth && ty >= 0 && ty < sandHeight) {
                if (!isInsideStone(tx * SAND_RESOLUTION, ty * SAND_RESOLUTION)) {
                    for (let gw = -1; gw <= 1; gw++) {
                        const wx = tx + Math.round(gw * perpX);
                        const wy = ty + Math.round(gw * perpY);
                        if (wx >= 0 && wx < sandWidth && wy >= 0 && wy < sandHeight) {
                            heightmap[wy * sandWidth + wx] = Math.max(
                                BASE_HEIGHT - GROOVE_DEPTH,
                                heightmap[wy * sandWidth + wx] - 16
                            );
                        }
                    }
                    for (let r = -2; r <= 2; r += 4) {
                        const rx = tx + Math.round(r * perpX);
                        const ry = ty + Math.round(r * perpY);
                        if (rx >= 0 && rx < sandWidth && ry >= 0 && ry < sandHeight) {
                            heightmap[ry * sandWidth + rx] = Math.min(
                                BASE_HEIGHT + GROOVE_DEPTH * 0.3,
                                heightmap[ry * sandWidth + rx] + 4
                            );
                        }
                    }
                }
            }
        }
    }

    function drawSpiral(cx, cy) {
        const cellCx = Math.floor(cx / SAND_RESOLUTION);
        const cellCy = Math.floor(cy / SAND_RESOLUTION);
        const maxRadius = 45; // broader max radius

        for (let angle = 0; angle < Math.PI * 6; angle += 0.1) {
            const r = angle * 2.5; // broader spiral gap
            if (r > maxRadius) break;
            const sx = cellCx + Math.round(Math.cos(angle) * r / SAND_RESOLUTION);
            const sy = cellCy + Math.round(Math.sin(angle) * r / SAND_RESOLUTION);

            if (sx >= 0 && sx < sandWidth && sy >= 0 && sy < sandHeight) {
                if (!isInsideStone(sx * SAND_RESOLUTION, sy * SAND_RESOLUTION)) {
                    // Widen the spiral trace
                    for (let bw = -1; bw <= 1; bw++) {
                        for (let bh = -1; bh <= 1; bh++) {
                            const wx = sx + bw;
                            const wy = sy + bh;
                            if (wx >= 0 && wx < sandWidth && wy >= 0 && wy < sandHeight) {
                                heightmap[wy * sandWidth + wx] = Math.max(
                                    BASE_HEIGHT - GROOVE_DEPTH,
                                    heightmap[wy * sandWidth + wx] - 18
                                );
                            }
                        }
                    }
                }
            }
        }
        totalStrokeLength += 50;
    }


    // ═══════════════════════════════════════
    //  PATTERN TEMPLATES
    // ═══════════════════════════════════════

    function applyPattern(name) {
        const btn = document.querySelector(`.pattern-btn[data-pattern="${name}"]`);
        if (btn) {
            btn.classList.add('applying');
            setTimeout(() => btn.classList.remove('applying'), 1200);
        }

        showToast(`Applying ${name} pattern ✨`);

        // Animate pattern drawing progressively
        let step = 0;
        const totalSteps = 30;

        function animateStep() {
            if (step >= totalSteps) {
                awardPoints(15, `${name} pattern`);
                return;
            }

            const progress = step / totalSteps;

            switch (name) {
                case 'horizontal':
                    drawHorizontalPattern(progress);
                    break;
                case 'diagonal':
                    drawDiagonalPattern(progress);
                    break;
                case 'waves':
                    drawWavesPattern(progress);
                    break;
                case 'circles':
                    drawCirclesPattern(progress);
                    break;
                case 'concentric':
                    drawConcentricPattern(progress);
                    break;
            }

            step++;
            requestAnimationFrame(animateStep);
        }

        animateStep();
    }

    function drawHorizontalPattern(progress) {
        const endY = Math.floor(sandHeight * progress);
        const spacing = 6;
        for (let y = Math.max(0, endY - 2); y <= Math.min(sandHeight - 1, endY + 1); y++) {
            if (y % spacing < 2) {
                for (let x = 0; x < sandWidth; x++) {
                    if (!isInsideStone(x * SAND_RESOLUTION, y * SAND_RESOLUTION)) {
                        const isGroove = (y % spacing === 0);
                        if (isGroove) {
                            heightmap[y * sandWidth + x] = BASE_HEIGHT - GROOVE_DEPTH * 0.7;
                        } else {
                            heightmap[y * sandWidth + x] = BASE_HEIGHT + GROOVE_DEPTH * 0.2;
                        }
                    }
                }
            }
        }
    }

    function drawDiagonalPattern(progress) {
        const endY = Math.floor(sandHeight * progress);
        const spacing = 6;
        for (let y = Math.max(0, endY - 2); y <= Math.min(sandHeight - 1, endY + 1); y++) {
            for (let x = 0; x < sandWidth; x++) {
                if (!isInsideStone(x * SAND_RESOLUTION, y * SAND_RESOLUTION)) {
                    const diag = (x + y) % spacing;
                    if (diag === 0) {
                        heightmap[y * sandWidth + x] = BASE_HEIGHT - GROOVE_DEPTH * 0.6;
                    } else if (diag === 1) {
                        heightmap[y * sandWidth + x] = BASE_HEIGHT + GROOVE_DEPTH * 0.15;
                    }
                }
            }
        }
    }

    function drawWavesPattern(progress) {
        const endY = Math.floor(sandHeight * progress);
        const spacing = 7;
        for (let y = Math.max(0, endY - 2); y <= Math.min(sandHeight - 1, endY + 1); y++) {
            for (let x = 0; x < sandWidth; x++) {
                if (!isInsideStone(x * SAND_RESOLUTION, y * SAND_RESOLUTION)) {
                    const wave = Math.sin(x * 0.12 + y * 0.02) * 3;
                    const row = (y + Math.round(wave)) % spacing;
                    if (row === 0) {
                        heightmap[y * sandWidth + x] = BASE_HEIGHT - GROOVE_DEPTH * 0.65;
                    } else if (row === 1) {
                        heightmap[y * sandWidth + x] = BASE_HEIGHT + GROOVE_DEPTH * 0.15;
                    }
                }
            }
        }
    }

    function drawCirclesPattern(progress) {
        const cx = sandWidth / 2;
        const cy = sandHeight / 2;
        const maxR = Math.min(sandWidth, sandHeight) / 2;
        const endR = maxR * progress;
        const spacing = 5;

        for (let y = 0; y < sandHeight; y++) {
            for (let x = 0; x < sandWidth; x++) {
                const dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
                if (dist > endR - 3 && dist <= endR + 1) {
                    if (!isInsideStone(x * SAND_RESOLUTION, y * SAND_RESOLUTION)) {
                        const ring = Math.floor(dist) % spacing;
                        if (ring === 0) {
                            heightmap[y * sandWidth + x] = BASE_HEIGHT - GROOVE_DEPTH * 0.65;
                        } else if (ring === 1) {
                            heightmap[y * sandWidth + x] = BASE_HEIGHT + GROOVE_DEPTH * 0.15;
                        }
                    }
                }
            }
        }
    }

    function drawConcentricPattern(progress) {
        // Draw ripples around each stone
        if (stones.length === 0) {
            // If no stones, draw from center
            drawCirclesPattern(progress);
            return;
        }

        stones.forEach(stone => {
            const cx = Math.floor(stone.x / SAND_RESOLUTION);
            const cy = Math.floor(stone.y / SAND_RESOLUTION);
            const maxR = 50;
            const endR = maxR * progress;
            const spacing = 4;

            for (let dy = -Math.ceil(endR) - 2; dy <= Math.ceil(endR) + 2; dy++) {
                for (let dx = -Math.ceil(endR) - 2; dx <= Math.ceil(endR) + 2; dx++) {
                    const x = cx + dx;
                    const y = cy + dy;
                    if (x < 0 || x >= sandWidth || y < 0 || y >= sandHeight) continue;

                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > endR - 2 && dist <= endR + 1) {
                        if (!isInsideStone(x * SAND_RESOLUTION, y * SAND_RESOLUTION)) {
                            const ring = Math.floor(dist) % spacing;
                            if (ring === 0) {
                                heightmap[y * sandWidth + x] = BASE_HEIGHT - GROOVE_DEPTH * 0.6;
                            } else if (ring === 1) {
                                heightmap[y * sandWidth + x] = BASE_HEIGHT + GROOVE_DEPTH * 0.15;
                            }
                        }
                    }
                }
            }
        });
    }


    // ═══════════════════════════════════════
    //  RESET (Smooth Sand)
    // ═══════════════════════════════════════

    function resetSand() {
        showToast('Smoothing the sand... 🧘');

        // Clear stones and moss
        stones = [];
        mosses = [];

        // Animated smoothing
        let step = 0;
        const totalSteps = 40;

        function smoothStep() {
            if (step >= totalSteps) return;

            const blend = 0.12;
            for (let y = 0; y < sandHeight; y++) {
                for (let x = 0; x < sandWidth; x++) {
                    if (!isInsideStone(x * SAND_RESOLUTION, y * SAND_RESOLUTION)) {
                        heightmap[y * sandWidth + x] += (BASE_HEIGHT - heightmap[y * sandWidth + x]) * blend;
                    }
                }
            }

            step++;
            if (step < totalSteps) {
                requestAnimationFrame(smoothStep);
            }
        }

        smoothStep();
        playChime(440, 1.2);
    }


    // ═══════════════════════════════════════
    //  INPUT HANDLING
    // ═══════════════════════════════════════

    function getCanvasPos(e) {
        const rect = gardenCanvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        return {
            x: (touch.clientX - rect.left) * (canvasW / rect.width),
            y: (touch.clientY - rect.top) * (canvasH / rect.height),
        };
    }

    function onPointerDown(e) {
        e.preventDefault();
        startAmbience();
        const pos = getCanvasPos(e);

        if (currentTool === 'stone') {
            // Check if clicking existing stone to drag it
            const hitStone = getStoneAt(pos.x, pos.y);
            if (hitStone) {
                draggingStone = hitStone;
                dragOffsetX = pos.x - hitStone.x;
                dragOffsetY = pos.y - hitStone.y;
            } else {
                // Place new stone
                const stone = createStone(pos.x, pos.y);
                stones.push(stone);
                stampStoneIntoSand(stone);
                playChime(392 + Math.random() * 200, 0.6);
                awardPoints(5, 'stone placed');
            }
            return;
        }

        if (currentTool === 'moss') {
            const moss = createMoss(pos.x, pos.y);
            mosses.push(moss);
            playChime(523, 0.4);
            awardPoints(3, 'moss placed');
            return;
        }

        if (currentTool === 'reset') {
            resetSand();
            return;
        }

        // Raking tools
        isDrawing = true;
        lastX = pos.x;
        lastY = pos.y;

        if (currentTool === 'spiral') {
            drawSpiral(pos.x, pos.y);
            playSandSound();
        }
    }

    function onPointerMove(e) {
        e.preventDefault();
        const pos = getCanvasPos(e);

        if (draggingStone) {
            draggingStone.x = pos.x - dragOffsetX;
            draggingStone.y = pos.y - dragOffsetY;
            stampStoneIntoSand(draggingStone);
            return;
        }

        if (!isDrawing) return;
        if (currentTool === 'spiral') return; // spiral is single-click

        // Interpolate between last and current position
        const dx = pos.x - lastX;
        const dy = pos.y - lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.floor(dist / 2));

        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const ix = lastX + dx * t;
            const iy = lastY + dy * t;
            rakeAt(ix, iy, lastX + dx * ((i - 1) / steps), lastY + dy * ((i - 1) / steps));
        }

        rakeTime += 16;

        // Sand sound effect (throttled)
        if (Math.random() < 0.1) playSandSound();

        lastX = pos.x;
        lastY = pos.y;
    }

    function onPointerUp(e) {
        if (draggingStone) {
            draggingStone = null;
            return;
        }

        if (isDrawing && totalStrokeLength > 50) {
            const pts = Math.floor(totalStrokeLength / 80);
            if (pts > 0) awardPoints(pts, 'raking');
        }

        isDrawing = false;
        totalStrokeLength = 0;
        lastX = -1;
        lastY = -1;
    }

    // Mouse events
    gardenCanvas.addEventListener('mousedown', onPointerDown);
    gardenCanvas.addEventListener('mousemove', onPointerMove);
    gardenCanvas.addEventListener('mouseup', onPointerUp);
    gardenCanvas.addEventListener('mouseleave', onPointerUp);

    // Touch events
    gardenCanvas.addEventListener('touchstart', onPointerDown, { passive: false });
    gardenCanvas.addEventListener('touchmove', onPointerMove, { passive: false });
    gardenCanvas.addEventListener('touchend', onPointerUp);
    gardenCanvas.addEventListener('touchcancel', onPointerUp);


    // ═══════════════════════════════════════
    //  TOOL & PATTERN SELECTION
    // ═══════════════════════════════════════

    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.dataset.tool;

            if (tool === 'reset') {
                resetSand();
                return;
            }

            currentTool = tool;

            // Update active state
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update cursor
            gardenCanvas.className = '';
            gardenCanvas.classList.add(`tool-${tool}`);
        });
    });

    document.querySelectorAll('.pattern-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyPattern(btn.dataset.pattern);
        });
    });


    // ═══════════════════════════════════════
    //  POINTS & TOASTS
    // ═══════════════════════════════════════

    function awardPoints(amount, reason) {
        serenityPoints += amount;
        pointsValue.textContent = serenityPoints;
        showToast(`+${amount} serenity ✨`);
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }


    // ═══════════════════════════════════════
    //  PARTICLES (Dust motes)
    // ═══════════════════════════════════════

    function spawnParticle() {
        const isNight = dayPhase === 'night';
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: 1 + Math.random() * 2.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: -0.1 - Math.random() * 0.2,
            opacity: 0.15 + Math.random() * 0.3,
            life: 400 + Math.random() * 600,
            age: 0,
            color: isNight
                ? `rgba(200, 220, 255, ${0.3 + Math.random() * 0.4})`
                : `rgba(200, 185, 160, ${0.2 + Math.random() * 0.3})`,
        });
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.speedX + Math.sin(p.age * 0.01) * 0.2;
            p.y += p.speedY;
            p.age++;

            if (p.age > p.life || p.y < -10 || p.x < -10 || p.x > window.innerWidth + 10) {
                particles.splice(i, 1);
            }
        }

        // Spawn new
        if (particles.length < 25 && Math.random() < 0.04) {
            spawnParticle();
        }
    }

    function renderParticles() {
        pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

        particles.forEach(p => {
            const fadeIn = Math.min(1, p.age / 60);
            const fadeOut = Math.max(0, 1 - (p.age - p.life + 60) / 60);
            const alpha = Math.min(fadeIn, fadeOut) * p.opacity;

            pCtx.beginPath();
            pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            pCtx.fillStyle = p.color;
            pCtx.globalAlpha = alpha;
            pCtx.fill();
        });

        pCtx.globalAlpha = 1;
    }


    // ═══════════════════════════════════════
    //  DAY/NIGHT CYCLE
    // ═══════════════════════════════════════

    function updateDayNight(dt) {
        dayTimer += dt;

        // Cycle through Day -> Afternoon/Sunset variants only
        const cycleLength = 120000;
        const phase = (dayTimer % cycleLength) / cycleLength;

        if (phase < 0.6) {
            // 60% of the time it is bright day
            if (dayPhase !== 'day') {
                dayPhase = 'day';
                skyBg.className = '';
                document.body.classList.remove('night-mode');
            }
        } else {
            // 40% of the time it is sunset/evening
            if (dayPhase !== 'sunset') {
                dayPhase = 'sunset';
                skyBg.className = 'sunset';
                document.body.classList.remove('night-mode');
            }
        }
    }


    // ═══════════════════════════════════════
    //  ZEN QUOTES ROTATION
    // ═══════════════════════════════════════

    let quoteTimer = 0;
    function updateQuote(dt) {
        quoteTimer += dt;
        if (quoteTimer > 12000) {
            quoteTimer = 0;
            const quote = ZEN_QUOTES[Math.floor(Math.random() * ZEN_QUOTES.length)];
            mindfulMsg.style.opacity = '0';
            setTimeout(() => {
                mindfulMsg.textContent = quote;
                mindfulMsg.style.opacity = '1';
            }, 500);
        }
    }

    // Passive serenity points over time
    let passiveTimer = 0;
    function passivePoints(dt) {
        passiveTimer += dt;
        if (passiveTimer > 15000) {
            passiveTimer = 0;
            awardPoints(1, 'mindfulness');
        }
    }


    // ═══════════════════════════════════════
    //  MAIN GAME LOOP
    // ═══════════════════════════════════════

    let lastFrameTime = performance.now();

    function gameLoop(now) {
        const dt = now - lastFrameTime;
        lastFrameTime = now;

        // Update systems
        updateDayNight(dt);
        updateQuote(dt);
        passivePoints(dt);
        updateParticles();

        // Render
        renderSand();
        renderParticles();

        requestAnimationFrame(gameLoop);
    }

    // ─── Initialize ───
    resizeCanvases();
    heightmap.fill(BASE_HEIGHT);
    requestAnimationFrame(gameLoop);

    // Initial particles
    for (let i = 0; i < 10; i++) spawnParticle();

})();
