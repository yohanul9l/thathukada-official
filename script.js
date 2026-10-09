/**
 * THATTUKADA (തട്ടുകട) • MINIMALIST JAVASCRIPT ENGINE
 * - Serene, minimal rain window simulation
 * - Procedural rain audio & sound FX (Web Audio API, self-contained)
 * - Interactive Kattan Chaya vibe generator
 * - Menu filters & accessible FAQ accordion
 * - Discord join & copy invite link handling
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Serene Rain Simulation
  initRainyWindow();

  // 2. Ambient Audio Engine
  initAudioEngine();

  // 3. Kattan Chaya Vibe Dispenser
  initChayaDispenser();

  // 4. Menu Filter Tabs
  initMenuFilters();

  // 5. FAQ Accordion
  initAccordion();

  // 6. Discord Actions & Clipboard Copy
  initDiscordActions();

  // 7. Navbar Scroll State & Mobile Navigation
  initScrollEffects();

  // 8. Live Active Count Pulse
  initLiveCounters();

  // Remove loading state
  document.body.classList.remove('loading');
});

/* ==========================================================================
   1. PHOTOREALISTIC WATER DROPLETS & RAIN SIMULATION
   ========================================================================== */
function initRainyWindow() {
  const canvas = document.getElementById('rain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Mouse interaction tracker for surface tension micro-shimmer
  let mouseX = -1000;
  let mouseY = -1000;
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  // Atmospheric background gradient & glowing orbs (Exclusive dark green palette)
  const atmosphericGlows = [];
  const glowColors = [
    'rgba(68, 147, 81, 0.10)',
    'rgba(44, 95, 52, 0.09)',
    'rgba(39, 84, 46, 0.07)'
  ];

  for (let i = 0; i < 7; i++) {
    atmosphericGlows.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 90 + Math.random() * 140,
      color: glowColors[Math.floor(Math.random() * glowColors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.005 + Math.random() * 0.006
    });
  }

  // Offscreen pre-rendered micro-condensation layer (fine mist/beads on cold glass)
  const condensationCanvas = document.createElement('canvas');
  const condensationCtx = condensationCanvas.getContext('2d');

  function renderCondensationLayer() {
    condensationCanvas.width = width;
    condensationCanvas.height = height;
    condensationCtx.clearRect(0, 0, width, height);

    // Realistic uneven condensation clusters
    const clusterCount = Math.max(6, Math.floor(width / 220));
    const clusters = [];
    for (let c = 0; c < clusterCount; c++) {
      clusters.push({
        x: Math.random() * width,
        y: Math.random() * height,
        rad: 140 + Math.random() * 260,
        density: 0.65 + Math.random() * 0.35
      });
    }

    const beadCount = Math.floor((width * height) / 1050);
    for (let i = 0; i < beadCount; i++) {
      const bx = Math.random() * width;
      const by = Math.random() * height;

      let inCluster = false;
      for (const cl of clusters) {
        const cdx = bx - cl.x;
        const cdy = by - cl.y;
        if (cdx * cdx + cdy * cdy < cl.rad * cl.rad && Math.random() < cl.density) {
          inCluster = true;
          break;
        }
      }
      if (!inCluster && Math.random() > 0.35) continue;

      const br = 0.6 + Math.random() * 1.8;
      const alpha = 0.22 + Math.random() * 0.45;

      // Contact shadow under micro-bead
      condensationCtx.fillStyle = `rgba(1, 8, 3, ${alpha * 0.6})`;
      condensationCtx.beginPath();
      condensationCtx.arc(bx + 0.3, by + br * 0.65, br * 0.85, 0, Math.PI * 2);
      condensationCtx.fill();

      // Refractive emerald core (#449351)
      condensationCtx.fillStyle = `rgba(68, 147, 81, ${alpha * 0.5})`;
      condensationCtx.beginPath();
      condensationCtx.arc(bx, by, br, 0, Math.PI * 2);
      condensationCtx.fill();

      // Pinpoint specular glint
      condensationCtx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
      condensationCtx.beginPath();
      condensationCtx.arc(bx - br * 0.35, by - br * 0.35, Math.max(0.4, br * 0.45), 0, Math.PI * 2);
      condensationCtx.fill();
    }
  }

  // Helper: Generate natural organic perimeter offsets (non-circular irregularity)
  function createDropletGeometry(irregularity = 0.09) {
    const points = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      points.push(1 + (Math.random() - 0.5) * irregularity);
    }
    return points;
  }

  // Helper: Smooth path tracing with gravity pear/teardrop tapering
  function traceOrganicDropletPath(targetCtx, x, y, rx, ry, offsets) {
    const num = offsets.length;
    const coords = [];

    for (let i = 0; i < num; i++) {
      const angle = (i / num) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const offset = offsets[i];

      // Gravity asymmetry: pear/teardrop shape
      // Top half (sinA < 0) tapers slightly; bottom advancing meniscus (sinA > 0) widens
      const widthFactor = sinA < 0 ? (1 + sinA * 0.16) : (1 + sinA * 0.08);

      coords.push({
        x: x + cosA * rx * widthFactor * offset,
        y: y + sinA * ry * offset
      });
    }

    targetCtx.beginPath();
    targetCtx.moveTo((coords[0].x + coords[num - 1].x) / 2, (coords[0].y + coords[num - 1].y) / 2);
    for (let i = 0; i < num; i++) {
      const next = coords[(i + 1) % num];
      const midX = (coords[i].x + next.x) / 2;
      const midY = (coords[i].y + next.y) / 2;
      targetCtx.quadraticCurveTo(coords[i].x, coords[i].y, midX, midY);
    }
    targetCtx.closePath();
  }

  // Photorealistic Optical Shading for a Single Water Droplet
  function drawPhotorealisticDroplet(targetCtx, d, stretch = 1.0) {
    const x = d.x;
    const y = d.y;
    const rx = d.rx;
    const ry = d.ry * stretch;
    const offsets = d.offsets;

    // 1. Exterior Contact Shadow (Cast on glass directly under bottom meniscus)
    const shadowY = y + ry * 0.84;
    const shadowGrad = targetCtx.createRadialGradient(
      x, shadowY, rx * 0.2,
      x, shadowY + ry * 0.22, rx * 1.25
    );
    shadowGrad.addColorStop(0, 'rgba(1, 8, 3, 0.58)');
    shadowGrad.addColorStop(0.5, 'rgba(1, 8, 3, 0.26)');
    shadowGrad.addColorStop(1, 'rgba(1, 8, 3, 0)');
    targetCtx.fillStyle = shadowGrad;
    targetCtx.beginPath();
    targetCtx.ellipse(x, shadowY, rx * 1.2, ry * 0.44, 0, 0, Math.PI * 2);
    targetCtx.fill();

    // 2. Trace Organic Contour
    traceOrganicDropletPath(targetCtx, x, y, rx, ry, offsets);

    // 3. Convex Lens Refraction Caustic (Concentrated in lower opposite interior)
    const focusX = x + rx * 0.06;
    const focusY = y + ry * 0.38;
    const causticGrad = targetCtx.createRadialGradient(
      focusX, focusY, Math.max(1, rx * 0.08),
      x, y, Math.max(rx, ry) * 1.15
    );
    causticGrad.addColorStop(0, 'rgba(68, 147, 81, 0.85)');    // #449351 concentrated caustic
    causticGrad.addColorStop(0.35, 'rgba(44, 95, 52, 0.65)');  // #2C5F34
    causticGrad.addColorStop(0.68, 'rgba(34, 74, 40, 0.40)');  // #224A28
    causticGrad.addColorStop(0.88, 'rgba(12, 28, 15, 0.30)');
    causticGrad.addColorStop(1.0, 'rgba(2, 10, 4, 0.88)');     // Total Internal Reflection perimeter
    targetCtx.fillStyle = causticGrad;
    targetCtx.fill();

    // 4. Total Internal Reflection Meniscus Border
    targetCtx.lineWidth = Math.max(0.75, rx * 0.07);
    targetCtx.strokeStyle = 'rgba(2, 12, 5, 0.85)';
    targetCtx.stroke();

    // 5. Internal Focused Caustic Arc (Lower Rim Refraction Crescent)
    if (rx > 3.2) {
      targetCtx.save();
      traceOrganicDropletPath(targetCtx, x, y, rx, ry, offsets);
      targetCtx.clip();

      targetCtx.beginPath();
      targetCtx.ellipse(x, y + ry * 0.74, rx * 0.72, ry * 0.28, 0, 0, Math.PI);
      targetCtx.strokeStyle = 'rgba(110, 215, 130, 0.45)';
      targetCtx.lineWidth = Math.max(1, ry * 0.16);
      targetCtx.stroke();
      targetCtx.restore();
    }

    // 6. Specular Environmental Highlight (Crisp glint at top-left ~10 o'clock)
    const glintX = x - rx * 0.36;
    const glintY = y - ry * 0.38;
    const glintRadius = Math.max(0.9, rx * 0.22);

    // Soft feathered glint aura
    const glintGrad = targetCtx.createRadialGradient(
      glintX, glintY, 0,
      glintX, glintY, glintRadius * 2.2
    );
    glintGrad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
    glintGrad.addColorStop(0.38, 'rgba(220, 255, 230, 0.72)');
    glintGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    targetCtx.fillStyle = glintGrad;
    targetCtx.beginPath();
    targetCtx.arc(glintX, glintY, glintRadius * 2.2, 0, Math.PI * 2);
    targetCtx.fill();

    // Crisp pinpoint white center
    targetCtx.fillStyle = '#ffffff';
    targetCtx.beginPath();
    targetCtx.arc(glintX, glintY, Math.max(0.6, glintRadius * 0.55), 0, Math.PI * 2);
    targetCtx.fill();

    // Top rim curvature glint for medium/large droplets
    if (rx > 5.2) {
      targetCtx.beginPath();
      targetCtx.arc(x, y, rx * 0.80, -Math.PI * 0.88, -Math.PI * 0.32);
      targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
      targetCtx.lineWidth = 0.9;
      targetCtx.stroke();
    }

    // 7. Secondary Soft Bounce Reflection (Lower right ~4 o'clock)
    const bounceX = x + rx * 0.32;
    const bounceY = y + ry * 0.36;
    targetCtx.fillStyle = 'rgba(255, 255, 255, 0.26)';
    targetCtx.beginPath();
    targetCtx.arc(bounceX, bounceY, Math.max(0.5, rx * 0.12), 0, Math.PI * 2);
    targetCtx.fill();
  }

  // Static Droplets & Dynamic Sliders Collections
  const staticDrops = [];
  const runningDrops = [];
  const dropTrails = [];

  function createStaticDrop(customY) {
    const isLarge = Math.random() < 0.14;
    const isMedium = !isLarge && Math.random() < 0.38;
    const baseR = isLarge ? (7.5 + Math.random() * 5.5) : (isMedium ? (4.2 + Math.random() * 3.2) : (2.4 + Math.random() * 1.8));

    return {
      x: Math.random() * width,
      y: customY !== undefined ? customY : Math.random() * height,
      r: baseR,
      rx: baseR,
      ry: baseR * (1.12 + Math.random() * 0.22), // Gravity sag: ry > rx
      offsets: createDropletGeometry(0.1),
      wobblePhase: Math.random() * Math.PI * 2
    };
  }

  function spawnRunningDrop(customX) {
    const baseR = 3.6 + Math.random() * 4.4;
    runningDrops.push({
      x: customX !== undefined ? customX : Math.random() * width,
      y: -25 - Math.random() * 80,
      r: baseR,
      rx: baseR,
      ry: baseR * 1.25,
      offsets: createDropletGeometry(0.08),
      state: 'stick', // 'stick' or 'slip'
      stickTimer: Math.floor(25 + Math.random() * 70),
      slipSpeed: 0,
      slipTargetDist: 0,
      slipTraveled: 0,
      wigglePhase: Math.random() * Math.PI * 2,
      wiggleDrift: 0.2 + Math.random() * 0.35,
      lastTrailY: 0,
      stretch: 1.15
    });
  }

  function initDroplets() {
    staticDrops.length = 0;
    runningDrops.length = 0;
    dropTrails.length = 0;

    // Static droplet count calibrated for aesthetic minimalism & performance
    const count = Math.min(65, Math.floor((width * height) / 19000));
    for (let i = 0; i < count; i++) {
      staticDrops.push(createStaticDrop());
    }

    // 4 to 7 running droplets with stick-slip physics
    const runningCount = Math.max(3, Math.min(6, Math.floor(width / 280)));
    for (let i = 0; i < runningCount; i++) {
      spawnRunningDrop();
    }

    renderCondensationLayer();
  }

  initDroplets();

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initDroplets();
  });

  // Main 60 FPS Render Loop
  function render() {
    ctx.clearRect(0, 0, width, height);

    // 1. Deep atmospheric backdrop (#09130c to #112415)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#09130c');
    bgGrad.addColorStop(0.5, '#0d1a10');
    bgGrad.addColorStop(1, '#112415');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Ambient green atmospheric blooms
    for (const g of atmosphericGlows) {
      g.pulse += g.pulseSpeed;
      const rad = g.radius + Math.sin(g.pulse) * 10;
      const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, rad);
      grad.addColorStop(0, g.color);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(g.x, g.y, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Blit Pre-rendered Micro-Condensation Layer (Zero per-frame cost)
    ctx.drawImage(condensationCanvas, 0, 0);

    // 4. Render and decay wake trails left by sliding droplets
    for (let t = dropTrails.length - 1; t >= 0; t--) {
      const tr = dropTrails[t];
      tr.alpha -= tr.decay;
      if (tr.alpha <= 0) {
        dropTrails.splice(t, 1);
        continue;
      }

      // Shadow
      ctx.fillStyle = `rgba(1, 8, 3, ${tr.alpha * 0.52})`;
      ctx.beginPath();
      ctx.arc(tr.x + 0.3, tr.y + tr.r * 0.65, tr.r * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // Refractive caustic body
      ctx.fillStyle = `rgba(68, 147, 81, ${tr.alpha * 0.65})`;
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, tr.r, 0, Math.PI * 2);
      ctx.fill();

      // Specular glint
      ctx.fillStyle = `rgba(255, 255, 255, ${tr.alpha * 0.88})`;
      ctx.beginPath();
      ctx.arc(tr.x - tr.r * 0.35, tr.y - tr.r * 0.35, Math.max(0.4, tr.r * 0.45), 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Render Static Droplets with Organic Shading & Cursor Proximity Shimmer
    for (const d of staticDrops) {
      let stretch = 1.0;
      const dx = mouseX - d.x;
      const dy = mouseY - d.y;
      const distSq = dx * dx + dy * dy;

      // Gentle tactile surface-tension shimmer when user hovers nearby
      if (distSq < 10000) {
        const force = 1 - Math.sqrt(distSq) / 100;
        d.wobblePhase += 0.16;
        stretch = 1.0 + Math.sin(d.wobblePhase) * 0.08 * force;
      }

      drawPhotorealisticDroplet(ctx, d, stretch);
    }

    // 6. Realistic Dynamic Sliders (Stick-Slip Physics, Trail Generation & Merging)
    for (let i = runningDrops.length - 1; i >= 0; i--) {
      const drop = runningDrops[i];

      if (drop.state === 'stick') {
        drop.stretch = 1.12 + Math.sin(Date.now() * 0.006) * 0.03;
        drop.y += 0.06; // Micro-creep under gravity
        drop.stickTimer--;

        if (drop.stickTimer <= 0) {
          // Break surface tension -> SLIP BURST!
          drop.state = 'slip';
          drop.slipSpeed = 2.4 + Math.random() * 3.6 + (drop.r * 0.32);
          drop.slipTargetDist = 40 + Math.random() * 110;
          drop.slipTraveled = 0;
        }
      } else if (drop.state === 'slip') {
        drop.slipTraveled += drop.slipSpeed;
        drop.y += drop.slipSpeed;
        drop.wigglePhase += 0.07;
        drop.x += Math.sin(drop.wigglePhase) * drop.wiggleDrift;

        // Dynamic vertical elongation during motion
        drop.stretch = Math.min(2.1, 1.25 + drop.slipSpeed * 0.16);

        // Leave tiny clinging wake beads along path
        if (Math.abs(drop.y - drop.lastTrailY) > 18 + Math.random() * 10) {
          drop.lastTrailY = drop.y;
          if (Math.random() < 0.7) {
            dropTrails.push({
              x: drop.x + (Math.random() - 0.5) * (drop.rx * 0.6),
              y: drop.y - drop.ry * 0.65,
              r: 0.9 + Math.random() * 1.5,
              alpha: 0.58,
              decay: 0.0007 + Math.random() * 0.0006
            });
          }
        }

        // Droplet Merging: Absorb static droplets in path
        for (let j = staticDrops.length - 1; j >= 0; j--) {
          const sd = staticDrops[j];
          const mdx = drop.x - sd.x;
          const mdy = drop.y - sd.y;
          const dist = Math.hypot(mdx, mdy);

          if (dist < (drop.rx + sd.rx * 0.85)) {
            // Instant surface tension fusion!
            drop.r = Math.min(14, Math.sqrt(drop.r * drop.r + sd.r * sd.r * 0.75));
            drop.rx = drop.r;
            drop.ry = drop.r * 1.28;
            drop.slipSpeed += 1.4; // Momentum surge from added mass

            // Remove static drop & respawn elsewhere after delay
            staticDrops.splice(j, 1);
            setTimeout(() => {
              staticDrops.push(createStaticDrop(Math.random() * height));
            }, 3500 + Math.random() * 4500);
          }
        }

        // Catch on glass surface again -> STICK!
        if (drop.slipTraveled >= drop.slipTargetDist) {
          drop.state = 'stick';
          drop.stickTimer = Math.floor(35 + Math.random() * 90);
        }
      }

      drawPhotorealisticDroplet(ctx, drop, drop.stretch);

      // Reached bottom of window -> Respawn at top
      if (drop.y > height + 40) {
        runningDrops.splice(i, 1);
        spawnRunningDrop();
      }
    }

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   2. PROCEDURAL AUDIO ENGINE (RAIN SOUNDSCAPE & SFX)
   ========================================================================== */
function initAudioEngine() {
  let audioCtx = null;
  let isPlaying = false;
  let rainNoiseNode = null;
  let rainFilter = null;
  let rainGain = null;

  const soundToggleBtn = document.getElementById('soundToggle');

  function initContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function startRainSound() {
    initContext();
    if (!audioCtx) return;

    const bufferSize = audioCtx.sampleRate * 4;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    rainNoiseNode = audioCtx.createBufferSource();
    rainNoiseNode.buffer = noiseBuffer;
    rainNoiseNode.loop = true;

    rainFilter = audioCtx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);

    rainGain = audioCtx.createGain();
    rainGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    rainGain.gain.exponentialRampToValueAtTime(0.20, audioCtx.currentTime + 1.0);

    rainNoiseNode.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(audioCtx.destination);

    rainNoiseNode.start();
    isPlaying = true;
  }

  function stopRainSound() {
    if (rainGain && audioCtx) {
      rainGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      setTimeout(() => {
        if (rainNoiseNode) {
          rainNoiseNode.stop();
          rainNoiseNode.disconnect();
          rainNoiseNode = null;
        }
      }, 550);
    }
    isPlaying = false;
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      if (!isPlaying) {
        startRainSound();
        soundToggleBtn.classList.add('active');
        showToast('Rain audio on');
      } else {
        stopRainSound();
        soundToggleBtn.classList.remove('active');
        showToast('Rain audio muted');
      }
    });
  }

  window.playSfx = function(type) {
    initContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    if (type === 'clink') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.3);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.31);
    } 
    else if (type === 'pour') {
      const bufferSize = audioCtx.sampleRate * 0.4;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.12;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.linearRampToValueAtTime(1300, now + 0.4);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(now);
    }
  };
}

/* ==========================================================================
   3. KATTAN CHAYA VIBE DISPENSER
   ========================================================================== */
function initChayaDispenser() {
  const brewBtn = document.getElementById('brewBtn');
  const liquid = document.getElementById('kattanLiquid');
  const topicEl = document.getElementById('vibeTopic');
  const tagEl = document.getElementById('vibeTag');

  if (!brewBtn || !liquid || !topicEl) return;

  const vibes = [
    {
      topic: "Mohanlal vs Mammootty: Greatest 90s thriller screenplay debate in Voice Channel #chayakkada",
      tag: "🍿 Cinema Charcha"
    },
    {
      topic: "Late Night Lo-fi Malayalam playlist streaming in Music Lounge #പാട്ടുകൂട്ടം",
      tag: "🎧 Midnight Vibes"
    },
    {
      topic: "5v5 Valorant & BGMI custom room showdown with zero toxic sweat",
      tag: "🎮 Gaming Peedika"
    },
    {
      topic: "Sharing nostalgic school trip memories & hostel horror stories",
      tag: "☕ Nostalgia"
    },
    {
      topic: "Pravasi Life: Best hidden Malabar restaurants in the Gulf & Europe",
      tag: "🌍 NRI Corner"
    },
    {
      topic: "Coding help & tech resume review session by senior engineers in #tech-talks",
      tag: "💻 Tech & Career"
    },
    {
      topic: "Drop your best mom-made beef roast or biriyani photos in #thattukada-food",
      tag: "🍲 Foodie Club"
    },
    {
      topic: "Acoustic open-mic karaoke: Singing evergreen Vidyasagar melodies together",
      tag: "🎤 Live Audio Jam"
    },
    {
      topic: "3 AM deep philosophy: Life after 25, career choices, and happiness",
      tag: "🌙 Night Owls"
    }
  ];

  let currentIndex = 0;

  brewBtn.addEventListener('click', () => {
    if (window.playSfx) {
      window.playSfx('pour');
      setTimeout(() => window.playSfx('clink'), 300);
    }

    liquid.style.height = '20%';
    setTimeout(() => {
      liquid.style.height = '75%';
    }, 180);

    currentIndex = (currentIndex + 1) % vibes.length;
    const selected = vibes[currentIndex];

    topicEl.style.opacity = '0';
    topicEl.style.transform = 'translateY(4px)';
    
    setTimeout(() => {
      topicEl.textContent = selected.topic;
      if (tagEl) tagEl.textContent = selected.tag;
      topicEl.style.opacity = '1';
      topicEl.style.transform = 'translateY(0)';
    }, 200);
  });
}

/* ==========================================================================
   4. MENU FILTER TABS
   ========================================================================== */
function initMenuFilters() {
  const tabs = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.menu-card');

  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   5. FAQ ACCORDION
   ========================================================================== */
function initAccordion() {
  const items = document.querySelectorAll('.accordion-item');
  const headers = document.querySelectorAll('.accordion-header');

  // Initialize pre-opened active item from markup
  items.forEach(item => {
    if (item.classList.contains('active')) {
      const body = item.querySelector('.accordion-body');
      const chevron = item.querySelector('.accordion-chevron');
      if (body) body.style.maxHeight = body.scrollHeight + 'px';
      if (chevron) chevron.textContent = '^';
    }
  });

  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.accordion-body');
      const chevron = item.querySelector('.accordion-chevron');
      const isActive = item.classList.contains('active');

      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherBody = other.querySelector('.accordion-body');
          const otherChevron = other.querySelector('.accordion-chevron');
          if (otherBody) otherBody.style.maxHeight = null;
          if (otherChevron) otherChevron.textContent = 'v';
        }
      });

      if (isActive) {
        item.classList.remove('active');
        if (body) body.style.maxHeight = null;
        if (chevron) chevron.textContent = 'v';
      } else {
        item.classList.add('active');
        if (body) body.style.maxHeight = body.scrollHeight + 'px';
        if (chevron) chevron.textContent = '^';
      }
    });
  });
}

/* ==========================================================================
   6. DISCORD ACTIONS & CLIPBOARD
   ========================================================================== */
function initDiscordActions() {
  const copyBtn = document.getElementById('copyLinkBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const inviteUrl = 'https://discord.gg/malayalam';

  function copyToClipboard(e) {
    if (e) e.preventDefault();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inviteUrl).then(() => {
        handleSuccess();
      }).catch(() => fallback());
    } else {
      fallback();
    }
  }

  function fallback() {
    const input = document.createElement('input');
    input.value = inviteUrl;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      handleSuccess();
    } catch (err) {
      showToast('discord.gg/malayalam');
    }
    document.body.removeChild(input);
  }

  function handleSuccess() {
    if (copyBtnText) {
      const orig = copyBtnText.textContent;
      copyBtnText.textContent = 'Copied! ✓';
      setTimeout(() => {
        copyBtnText.textContent = orig;
      }, 2000);
    }
    showToast('Link copied to clipboard');
  }

  if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);
}

/* ==========================================================================
   7. NAVBAR SCROLL STATE & MOBILE MENU
   ========================================================================== */
function initScrollEffects() {
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }, { passive: true });

  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }
}

/* ==========================================================================
   8. LIVE ACTIVE COUNTER PULSE
   ========================================================================== */
function initLiveCounters() {
  const onlineEl = document.getElementById('onlineCount');
  if (!onlineEl) return;

  let currentOnline = 12000;

  setInterval(() => {
    const delta = Math.floor(Math.random() * 7) - 3;
    currentOnline = Math.max(11940, Math.min(12060, currentOnline + delta));
    onlineEl.textContent = currentOnline.toLocaleString();
  }, 12000);
}

/* ==========================================================================
   TOAST HELPER
   ========================================================================== */
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2400);
}
