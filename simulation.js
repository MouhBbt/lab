/* =========================================================
   Virtual Physics & Chemistry Lab — Simulation Engine
   ========================================================= */

'use strict';

/* ── Utility helpers ───────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round = (v, d = 2) => +v.toFixed(d);
const now = () => performance.now() / 1000;   // seconds

/* ── Navigation ────────────────────────────────────────── */
function initNav() {
  // Sidebar items drive page visibility
  $$('.sidebar-item[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.page;
      $$('.sidebar-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      $$('.page').forEach(p => p.classList.remove('active'));
      const pg = $(`#page-${target}`);
      if (pg) pg.classList.add('active');
      // start simulation when entering that page
      if (target === 'pendulum')   startPendulum();
      if (target === 'projectile') startProjectile();
      if (target === 'waves')      startWave();
      if (target === 'circuit')    renderCircuit();
      if (target === 'chemistry')  initChemistry();
    });
  });
}

/* ─────────────────────────────────────────────────────────
   1. PENDULUM SIMULATION
   ───────────────────────────────────────────────────────── */
let pendulumRAF = null;
let pendulumState = null;

function startPendulum() {
  const canvas = $('#pendulumCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Controls
  const lengthSlider = $('#pend-length');
  const massSlider   = $('#pend-mass');
  const dampSlider   = $('#pend-damp');
  const gravSlider   = $('#pend-gravity');

  // Readings
  const rdAngle  = $('#pend-angle');
  const rdOmega  = $('#pend-omega');
  const rdPeriod = $('#pend-period');
  const rdEnergy = $('#pend-energy');

  // Data log
  const logBody = $('#pend-log');

  // State
  let L = parseFloat(lengthSlider.value);
  let m = parseFloat(massSlider.value);
  let b = parseFloat(dampSlider.value);
  let g = parseFloat(gravSlider.value);

  if (!pendulumState) {
    pendulumState = { theta: Math.PI / 4, omega: 0, t: 0, logRows: [] };
  }

  let state = pendulumState;
  let running = false;
  let lastTime = null;
  let logCounter = 0;

  // Slider listeners
  [lengthSlider, massSlider, dampSlider, gravSlider].forEach(sl => {
    sl.addEventListener('input', () => {
      L = parseFloat(lengthSlider.value);
      m = parseFloat(massSlider.value);
      b = parseFloat(dampSlider.value);
      g = parseFloat(gravSlider.value);
      updateSliderLabels();
      const T = 2 * Math.PI * Math.sqrt(L / g);
      if (rdPeriod) rdPeriod.textContent = round(T) + ' s';
    });
  });

  function updateSliderLabels() {
    $('#pend-length-val').textContent = round(L, 1) + ' m';
    $('#pend-mass-val').textContent   = round(m, 1) + ' kg';
    $('#pend-damp-val').textContent   = round(b, 2);
    $('#pend-grav-val').textContent   = round(g, 1) + ' m/s²';
  }

  updateSliderLabels();

  // Buttons
  $('#pend-play').addEventListener('click', () => { running = true;  lastTime = null; loop(); });
  $('#pend-pause').addEventListener('click', () => { running = false; cancelAnimationFrame(pendulumRAF); });
  $('#pend-reset').addEventListener('click', () => {
    running = false;
    cancelAnimationFrame(pendulumRAF);
    state.theta = Math.PI / 4;
    state.omega = 0;
    state.t = 0;
    state.logRows = [];
    if (logBody) logBody.innerHTML = '';
    draw();
  });

  function physics(dt) {
    // RK4 for theta'' = -(g/L)*sin(theta) - (b/m)*theta'
    const deriv = (th, om) => ({ dth: om, dom: -(g / L) * Math.sin(th) - (b / m) * om });
    const k1 = deriv(state.theta, state.omega);
    const k2 = deriv(state.theta + .5*dt*k1.dth, state.omega + .5*dt*k1.dom);
    const k3 = deriv(state.theta + .5*dt*k2.dth, state.omega + .5*dt*k2.dom);
    const k4 = deriv(state.theta +    dt*k3.dth, state.omega +    dt*k3.dom);
    state.theta += dt/6 * (k1.dth + 2*k2.dth + 2*k3.dth + k4.dth);
    state.omega += dt/6 * (k1.dom + 2*k2.dom + 2*k3.dom + k4.dom);
    state.t += dt;
  }

  function draw() {
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight || 420;
    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.strokeStyle = 'rgba(255,255,255,.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    const px = W / 2;
    const py = H * .15;
    const scale = Math.min(W, H) * .38;
    const bx = px + Math.sin(state.theta) * L * scale;
    const by = py + Math.cos(state.theta) * L * scale;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(bx, H - 14, 18, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,.4)';
    ctx.fill();

    // String
    const grad = ctx.createLinearGradient(px, py, bx, by);
    grad.addColorStop(0, '#555');
    grad.addColorStop(1, '#aaa');
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pivot
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#8b949e';
    ctx.fill();
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bob gradient
    const bobGrad = ctx.createRadialGradient(bx - 6, by - 6, 2, bx, by, m * 12 + 10);
    bobGrad.addColorStop(0, '#79baff');
    bobGrad.addColorStop(1, '#1f5fa5');
    ctx.beginPath();
    ctx.arc(bx, by, m * 12 + 10, 0, Math.PI * 2);
    ctx.fillStyle = bobGrad;
    ctx.fill();
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Angle arc
    ctx.beginPath();
    ctx.arc(px, py, 55, Math.PI/2 - state.theta, Math.PI/2, state.theta < 0);
    ctx.strokeStyle = 'rgba(88,166,255,.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels
    ctx.font = '13px Segoe UI';
    ctx.fillStyle = '#8b949e';
    ctx.fillText(`θ = ${round(state.theta * 180 / Math.PI, 1)}°`, px + 14, py + 65);
    ctx.fillText(`t = ${round(state.t, 1)} s`, 14, H - 14);
  }

  function updateReadings() {
    const KE = .5 * m * Math.pow(state.omega * L, 2);
    const PE = m * g * L * (1 - Math.cos(state.theta));
    const E  = KE + PE;
    const T  = 2 * Math.PI * Math.sqrt(L / g);
    if (rdAngle)  rdAngle.textContent  = round(state.theta * 180 / Math.PI) + '°';
    if (rdOmega)  rdOmega.textContent  = round(state.omega) + ' rad/s';
    if (rdPeriod) rdPeriod.textContent = round(T) + ' s';
    if (rdEnergy) rdEnergy.textContent = round(E) + ' J';
  }

  function logRow() {
    logCounter++;
    if (logCounter % 30 !== 0) return;   // every ~0.5 s
    if (!logBody) return;
    const tr = document.createElement('tr');
    const KE = .5 * m * Math.pow(state.omega * L, 2);
    const PE = m * g * L * (1 - Math.cos(state.theta));
    tr.innerHTML = `
      <td>${round(state.t,2)}</td>
      <td>${round(state.theta * 180 / Math.PI,2)}</td>
      <td>${round(state.omega,3)}</td>
      <td>${round(KE,3)}</td>
      <td>${round(PE,3)}</td>`;
    logBody.prepend(tr);
    if (logBody.children.length > 40) logBody.removeChild(logBody.lastChild);
  }

  function loop(ts) {
    if (!running) return;
    if (lastTime === null) lastTime = ts;
    const dt = Math.min((ts - lastTime) / 1000, .05);
    lastTime = ts;

    const steps = 8;
    for (let i = 0; i < steps; i++) physics(dt / steps);

    draw();
    updateReadings();
    logRow();
    pendulumRAF = requestAnimationFrame(loop);
  }

  draw();
  running = true;
  lastTime = null;
  pendulumRAF = requestAnimationFrame(loop);
}

/* ─────────────────────────────────────────────────────────
   2. PROJECTILE MOTION SIMULATION
   ───────────────────────────────────────────────────────── */
let projRAF = null;

function startProjectile() {
  const canvas = $('#projCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const angleSlider = $('#proj-angle');
  const speedSlider = $('#proj-speed');
  const gravSlider  = $('#proj-grav');
  const massSlider  = $('#proj-mass');

  let angle = parseFloat(angleSlider.value);
  let v0    = parseFloat(speedSlider.value);
  let g     = parseFloat(gravSlider.value);
  let mass  = parseFloat(massSlider.value);

  let running = false;
  let lastTime = null;
  let trail = [];
  let px, py, vx, vy, launched = false;

  function reset() {
    launched = false;
    trail = [];
    px = 60; py = 0;
    vx = v0 * Math.cos(angle * Math.PI / 180);
    vy = v0 * Math.sin(angle * Math.PI / 180);
    draw();
  }

  function updateLabels() {
    $('#proj-angle-val').textContent = round(angle, 0) + '°';
    $('#proj-speed-val').textContent = round(v0, 1) + ' m/s';
    $('#proj-grav-val').textContent  = round(g, 1)  + ' m/s²';
    $('#proj-mass-val').textContent  = round(mass, 1) + ' kg';

    const rad = angle * Math.PI / 180;
    const T = 2 * v0 * Math.sin(rad) / g;
    const R = v0 * v0 * Math.sin(2 * rad) / g;
    const H = (v0 * Math.sin(rad)) ** 2 / (2 * g);
    $('#proj-range').textContent  = round(R) + ' m';
    $('#proj-height').textContent = round(H) + ' m';
    $('#proj-time').textContent   = round(T) + ' s';
  }

  [angleSlider, speedSlider, gravSlider, massSlider].forEach(sl => {
    sl.addEventListener('input', () => {
      angle = parseFloat(angleSlider.value);
      v0    = parseFloat(speedSlider.value);
      g     = parseFloat(gravSlider.value);
      mass  = parseFloat(massSlider.value);
      updateLabels();
      if (!launched) reset();
    });
  });

  $('#proj-launch').addEventListener('click', () => {
    reset();
    launched = true;
    running = true;
    lastTime = null;
    cancelAnimationFrame(projRAF);
    loop2(performance.now());
  });

  $('#proj-reset').addEventListener('click', () => {
    running = false;
    cancelAnimationFrame(projRAF);
    reset();
  });

  updateLabels();
  reset();

  function draw() {
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight || 380;
    ctx.clearRect(0, 0, W, H);

    const groundY = H - 40;
    const scaleX  = (W - 80) / Math.max(1, (v0 * v0 * Math.sin(2 * angle * Math.PI / 180) / g) * 1.1);
    const scaleY  = (groundY - 20) / Math.max(1, ((v0 * Math.sin(angle * Math.PI / 180)) ** 2 / (2 * g)) * 1.3);

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#0d1a2a');
    sky.addColorStop(1, '#1a2a3a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, groundY);

    // Ground
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = '#3fb950';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, groundY); ctx.stroke(); }
    for (let y = 0; y < groundY; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Theoretical trajectory (dashed)
    const rad = angle * Math.PI / 180;
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(88,166,255,.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let first = true;
    for (let t = 0; t <= 4; t += 0.05) {
      const tx = 60 + v0 * Math.cos(rad) * t * scaleX;
      const ty = groundY - v0 * Math.sin(rad) * t * scaleY + .5 * g * t * t * scaleY;
      if (ty > groundY) break;
      if (first) { ctx.moveTo(tx, ty); first = false; } else ctx.lineTo(tx, ty);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Trail
    if (trail.length > 1) {
      ctx.beginPath();
      trail.forEach((p, i) => {
        const x = 60 + p.x * scaleX;
        const y = groundY - p.y * scaleY;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#f0883e';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Ball — always draw (at launch origin before launch, in-flight while launched)
    {
      const bx = 60 + px * scaleX;
      const by = groundY - py * scaleY;
      const r = 4 + mass * 2;
      const bg = ctx.createRadialGradient(bx - 2, by - 2, 1, bx, by, r);
      bg.addColorStop(0, '#ffc87a');
      bg.addColorStop(1, '#d29922');
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fillStyle = bg;
      ctx.fill();
    }

    // Angle indicator at origin
    ctx.beginPath();
    ctx.arc(60, groundY, 30, -Math.PI/2 - rad, -Math.PI/2, false);
    ctx.strokeStyle = 'rgba(248,81,73,.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = '12px Segoe UI';
    ctx.fillStyle = '#f85149';
    ctx.fillText(angle + '°', 68, groundY - 18);

    // Reading overlay
    if (launched) {
      const speed = Math.sqrt(vx * vx + vy * vy);
      ctx.fillStyle = 'rgba(13,17,23,.8)';
      ctx.fillRect(W - 170, 10, 160, 70);
      ctx.fillStyle = '#8b949e'; ctx.font = '11px Courier New';
      ctx.fillText(`v  = ${round(speed, 1)} m/s`, W - 158, 30);
      ctx.fillText(`vx = ${round(vx,    1)} m/s`, W - 158, 46);
      ctx.fillText(`vy = ${round(vy,    1)} m/s`, W - 158, 62);
      ctx.fillText(`x  = ${round(px,    1)} m`,   W - 158, 78);
    }
  }

  function loop2(ts) {
    if (!running) return;
    if (lastTime === null) lastTime = ts;
    const dt = Math.min((ts - lastTime) / 1000, .05);
    lastTime = ts;

    if (launched) {
      const steps = 8;
      for (let i = 0; i < steps; i++) {
        vx += 0;                 // no air resistance (simple model)
        vy -= g * (dt / steps);  // gravity
        px += vx * (dt / steps);
        py += vy * (dt / steps);
      }
      trail.push({ x: px, y: py });
      if (trail.length > 500) trail.shift();

      if (py <= 0 && trail.length > 2) {
        running = false;
        py = 0;
      }
    }

    draw();
    if (running) projRAF = requestAnimationFrame(loop2);
    else draw();
  }
}

/* ─────────────────────────────────────────────────────────
   3. WAVE / OSCILLOSCOPE SIMULATION
   ───────────────────────────────────────────────────────── */
let waveRAF = null;

function startWave() {
  const canvas = $('#waveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const freq1Sl  = $('#wave-freq1');
  const amp1Sl   = $('#wave-amp1');
  const freq2Sl  = $('#wave-freq2');
  const amp2Sl   = $('#wave-amp2');
  const phaseSl  = $('#wave-phase');
  const modeSelect = $('#wave-mode');

  let t = 0;
  let running = true;
  let lastTime = null;

  function vals() {
    return {
      f1: parseFloat(freq1Sl.value),
      a1: parseFloat(amp1Sl.value),
      f2: parseFloat(freq2Sl.value),
      a2: parseFloat(amp2Sl.value),
      ph: parseFloat(phaseSl.value),
      mode: modeSelect.value
    };
  }

  [freq1Sl, amp1Sl, freq2Sl, amp2Sl, phaseSl].forEach(sl => {
    sl.addEventListener('input', () => {
      const v = vals();
      $('#wave-f1-val').textContent  = round(v.f1, 1) + ' Hz';
      $('#wave-a1-val').textContent  = round(v.a1, 1);
      $('#wave-f2-val').textContent  = round(v.f2, 1) + ' Hz';
      $('#wave-a2-val').textContent  = round(v.a2, 1);
      $('#wave-ph-val').textContent  = round(v.ph, 0) + '°';
    });
  });

  $('#wave-play').addEventListener('click',  () => { running = true;  lastTime = null; loopW(); });
  $('#wave-pause').addEventListener('click', () => { running = false; cancelAnimationFrame(waveRAF); });
  $('#wave-reset').addEventListener('click', () => { t = 0; running = true; lastTime = null; loopW(); });

  function loopW(ts = 0) {
    if (!running) return;
    if (lastTime === null) lastTime = ts;
    const dt = Math.min((ts - lastTime) / 1000, .05);
    lastTime = ts;
    t += dt;

    const W = canvas.width  = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight || 300;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#001a00';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(0,200,0,.12)';
    ctx.lineWidth = 1;
    const cols = 10, rows = 8;
    for (let i = 0; i <= cols; i++) {
      const x = i * W / cols;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
      const y = i * H / rows;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Centre line
    ctx.strokeStyle = 'rgba(0,200,0,.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();

    const v = vals();
    const phRad = v.ph * Math.PI / 180;
    const maxA = H * .42;

    function wave1(x) { return v.a1 * Math.sin(2*Math.PI*v.f1*(x/W - t)); }
    function wave2(x) { return v.a2 * Math.sin(2*Math.PI*v.f2*(x/W - t) + phRad); }

    // Draw wave(s)
    const drawWave = (fn, color) => {
      ctx.beginPath();
      for (let i = 0; i <= W; i++) {
        const y = H/2 - fn(i) * maxA;
        i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    if (v.mode === 'superposition') {
      drawWave(x => wave1(x) + wave2(x), '#00ff88');
    } else if (v.mode === 'both') {
      drawWave(wave1, '#58a6ff');
      drawWave(wave2, '#f0883e');
      drawWave(x => wave1(x) + wave2(x), '#00ff88');
    } else if (v.mode === 'lissajous') {
      ctx.beginPath();
      for (let i = 0; i <= 1000; i++) {
        const tt = (i / 1000) * 2 * Math.PI + t;
        const x = W/2 + v.a1 * Math.cos(v.f1 * tt + phRad) * W * .4;
        const y = H/2 + v.a2 * Math.sin(v.f2 * tt)         * H * .4;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      drawWave(wave1, '#00ff88');
    }

    // Labels
    ctx.fillStyle = 'rgba(0,255,136,.7)';
    ctx.font = '11px Courier New';
    ctx.fillText(`f₁=${v.f1}Hz  A₁=${v.a1}`, 8, 16);
    ctx.fillText(`f₂=${v.f2}Hz  A₂=${v.a2}  φ=${v.ph}°`, 8, 30);
    ctx.fillText(`t = ${round(t, 2)} s`, 8, H - 8);

    waveRAF = requestAnimationFrame(loopW);
  }

  loopW();
}

/* ─────────────────────────────────────────────────────────
   4. CIRCUIT SIMULATION (RC / RL)
   ───────────────────────────────────────────────────────── */
function renderCircuit() {
  const canvas = $('#circuitCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const typeSelect = $('#circuit-type');
  const voltSlider = $('#circuit-volt');
  const r1Slider   = $('#circuit-r');
  const c1Slider   = $('#circuit-c');
  const l1Slider   = $('#circuit-l');
  const chartCanvas = $('#circuitChart');
  const chartCtx   = chartCanvas ? chartCanvas.getContext('2d') : null;

  function drawAll() {
    const type = typeSelect.value;
    const V  = parseFloat(voltSlider.value);
    const R  = parseFloat(r1Slider.value);
    const C  = parseFloat(c1Slider.value) * 1e-6;  // µF → F
    const L  = parseFloat(l1Slider.value) * 1e-3;  // mH → H

    // Labels
    $('#circ-volt-val').textContent = round(V) + ' V';
    $('#circ-r-val').textContent    = round(R) + ' Ω';
    $('#circ-c-val').textContent    = round(parseFloat(c1Slider.value)) + ' µF';
    $('#circ-l-val').textContent    = round(parseFloat(l1Slider.value)) + ' mH';

    // Derived
    const tau = type === 'RC' ? R * C : L / R;
    const f0  = type === 'LC' ? 1 / (2 * Math.PI * Math.sqrt(L * C))
              : type === 'RLC' ? 1 / (2 * Math.PI * Math.sqrt(L * C)) : 0;

    $('#circ-tau').textContent  = (tau * 1000).toFixed(2) + ' ms';
    $('#circ-freq').textContent = f0 > 0 ? round(f0, 1) + ' Hz' : '—';
    $('#circ-curr').textContent = round(V / R, 3) + ' A';
    $('#circ-power').textContent = round(V * V / R, 2) + ' W';

    // Draw circuit schematic
    const W = canvas.width  = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight || 260;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    drawSchematic(ctx, W, H, type, V, R, C, L);

    // Draw response chart
    if (chartCtx && chartCanvas) {
      const CW = chartCanvas.width  = chartCanvas.offsetWidth;
      const CH = chartCanvas.height = chartCanvas.offsetHeight || 180;
      chartCtx.clearRect(0, 0, CW, CH);
      chartCtx.fillStyle = '#0d1117';
      chartCtx.fillRect(0, 0, CW, CH);
      drawResponseCurve(chartCtx, CW, CH, type, V, R, C, L, tau, f0);
    }
  }

  function drawSchematic(ctx, W, H, type, V, R, C, L) {
    const cx = W / 2, cy = H / 2;
    const hl = 120, hh = 80;  // half lengths

    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 2.5;

    // Outer rectangle wires
    ctx.beginPath();
    ctx.moveTo(cx - hl, cy - hh);
    ctx.lineTo(cx + hl, cy - hh);
    ctx.lineTo(cx + hl, cy + hh);
    ctx.lineTo(cx - hl, cy + hh);
    ctx.lineTo(cx - hl, cy - hh);
    ctx.stroke();

    // Voltage source (left side)
    drawVoltageSource(ctx, cx - hl, cy, V);

    // Resistor (top)
    drawResistor(ctx, cx, cy - hh, R);

    // Bottom component
    if (type === 'RC' || type === 'RLC') drawCapacitor(ctx, cx + hl, cy, C * 1e6);
    if (type === 'RL' || type === 'RLC') drawInductor(ctx, cx, cy + hh, L * 1e3);

    // Labels
    ctx.fillStyle = '#e6edf3';
    ctx.font = 'bold 13px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(type + ' Circuit', cx, 22);
    ctx.textAlign = 'left';
  }

  function drawVoltageSource(ctx, x, y, V) {
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#1c2230';
    ctx.fill();
    ctx.strokeStyle = '#3fb950';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#3fb950';
    ctx.font = 'bold 12px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(V + 'V', x, y + 4);
    ctx.textAlign = 'left';
  }

  function drawResistor(ctx, x, y, R) {
    ctx.fillStyle = '#1c2230';
    ctx.strokeStyle = '#f0883e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x - 28, y - 10, 56, 20);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f0883e';
    ctx.font = '11px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(R + 'Ω', x, y + 4);
    ctx.textAlign = 'left';
  }

  function drawCapacitor(ctx, x, y, C) {
    ctx.strokeStyle = '#bc8cff';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x, y - 22); ctx.lineTo(x, y - 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 18, y - 6); ctx.lineTo(x + 18, y - 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 18, y + 6); ctx.lineTo(x + 18, y + 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x, y + 22); ctx.stroke();
    ctx.fillStyle = '#bc8cff';
    ctx.font = '11px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(round(C) + 'µF', x + 28, y + 4);
    ctx.textAlign = 'left';
  }

  function drawInductor(ctx, x, y, L) {
    ctx.strokeStyle = '#f85149';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x - 40, y);
    for (let i = 0; i < 5; i++) {
      ctx.arc(x - 24 + i * 16, y, 8, Math.PI, 0, false);
    }
    ctx.lineTo(x + 40, y);
    ctx.stroke();
    ctx.fillStyle = '#f85149';
    ctx.font = '11px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(round(L) + 'mH', x, y + 20);
    ctx.textAlign = 'left';
  }

  function drawResponseCurve(ctx, W, H, type, V, R, C, L, tau, f0) {
    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += W/8) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += H/4) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    const tMax = tau * 6;
    ctx.beginPath();
    for (let i = 0; i <= W; i++) {
      const t = (i / W) * tMax;
      let v;
      if (type === 'RC') v = V * (1 - Math.exp(-t / tau));
      else if (type === 'RL') v = V / R * (1 - Math.exp(-t / tau)) * R;
      else {
        const alpha = R / (2 * L);
        const w0 = 1 / Math.sqrt(L * C);
        const wd = Math.sqrt(Math.max(0, w0*w0 - alpha*alpha));
        v = wd > 0 ? V * (1 - Math.exp(-alpha*t) * (Math.cos(wd*t) + alpha/wd*Math.sin(wd*t))) : V * (1 - Math.exp(-t/tau));
      }
      const px = i;
      const py = H - clamp(v / (V * 1.05), 0, 1) * (H - 16) - 8;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#58a6ff';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Axis labels
    ctx.fillStyle = '#8b949e'; ctx.font = '10px Courier New';
    ctx.fillText('0', 4, H - 4);
    ctx.fillText(round(tMax * 1000) + 'ms', W - 50, H - 4);
    ctx.fillText(V + 'V', 4, 14);
  }

  [typeSelect, voltSlider, r1Slider, c1Slider, l1Slider].forEach(el => {
    el.addEventListener('change', drawAll);
    el.addEventListener('input', drawAll);
  });

  drawAll();
}

/* ─────────────────────────────────────────────────────────
   5. CHEMISTRY — TITRATION SIMULATION
   ───────────────────────────────────────────────────────── */
function initChemistry() {
  const canvas = $('#chemCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const concSlider  = $('#chem-conc');
  const volSlider   = $('#chem-vol');
  const titSlider   = $('#chem-tit-conc');
  const addedSlider = $('#chem-added');

  const rdPH     = $('#chem-ph');
  const rdAdded  = $('#chem-added-val');
  const rdVolEq  = $('#chem-vol-eq');
  const chartCanvas = $('#chemChart');
  const chartCtx    = chartCanvas ? chartCanvas.getContext('2d') : null;

  function compute() {
    const Ca  = parseFloat(concSlider.value);   // mol/L acid
    const Va  = parseFloat(volSlider.value);     // mL acid
    const Cb  = parseFloat(titSlider.value);     // mol/L base
    const Vb  = parseFloat(addedSlider.value);   // mL base added

    const na = Ca * Va / 1000;   // mol acid
    const nb = Cb * Vb / 1000;   // mol base

    const Vtot = (Va + Vb) / 1000;  // total volume L
    let pH;

    if (Vb === 0) {
      pH = -Math.log10(Ca);
    } else if (nb < na) {
      const remAcid = (na - nb) / Vtot;
      pH = -Math.log10(remAcid);
    } else if (Math.abs(nb - na) < 1e-9) {
      pH = 7;
    } else {
      const excessBase = (nb - na) / Vtot;
      const pOH = -Math.log10(excessBase);
      pH = 14 - pOH;
    }

    pH = clamp(pH, 0, 14);

    const Veq = (Ca * Va) / Cb;  // mL of base at equivalence

    if (rdPH)    rdPH.textContent    = round(pH, 2);
    if (rdAdded) rdAdded.textContent = round(Vb, 1) + ' mL';
    if (rdVolEq) rdVolEq.textContent = round(Veq, 1) + ' mL';

    $('#chem-conc-val').textContent     = round(Ca, 2) + ' mol/L';
    $('#chem-vol-val').textContent      = round(Va, 1) + ' mL';
    $('#chem-tit-val').textContent      = round(Cb, 2) + ' mol/L';
    $('#chem-added-disp').textContent   = round(Vb, 1) + ' mL';

    // pH colour
    const phColor = phToColor(pH);
    if (rdPH) rdPH.style.color = phColor;

    return { pH, Ca, Va, Cb, Veq };
  }

  function phToColor(pH) {
    if (pH < 3)  return '#f85149';
    if (pH < 6)  return '#f0883e';
    if (pH < 7.5) return '#d29922';
    if (pH < 9)  return '#3fb950';
    return '#bc8cff';
  }

  function drawBurette(ctx, W, H, addedVol, maxVol) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    // Flask
    const fx = W / 2, fy = H - 60, fr = 55;
    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(88,166,255,.08)';
    ctx.fill();
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Flask neck
    ctx.beginPath();
    ctx.rect(fx - 10, fy - fr - 30, 20, 30);
    ctx.fillStyle = 'rgba(88,166,255,.08)';
    ctx.fill();
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Solution in flask
    const solFill = 0.6;
    ctx.save();
    ctx.beginPath();
    ctx.arc(fx, fy, fr - 2, 0, Math.PI * 2);
    ctx.clip();
    const { pH } = compute();
    ctx.fillStyle = phToColor(pH) + '66';
    ctx.fillRect(fx - fr, fy - fr + (fr * 2) * (1 - solFill), fr * 2, fr * 2);
    ctx.restore();

    // Burette tube
    const bx = W / 2, btop = 20, bbot = fy - fr - 30;
    ctx.beginPath();
    ctx.rect(bx - 6, btop, 12, bbot - btop);
    ctx.fillStyle = 'rgba(63,185,80,.08)';
    ctx.fill();
    ctx.strokeStyle = '#3fb950';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Liquid in burette
    const remaining = maxVol - addedVol;
    const fraction = clamp(remaining / maxVol, 0, 1);
    ctx.fillStyle = 'rgba(63,185,80,.5)';
    ctx.fillRect(bx - 5, btop + 1, 10, (bbot - btop - 2) * fraction);

    // Burette scale
    ctx.fillStyle = '#8b949e'; ctx.font = '9px Courier New';
    for (let i = 0; i <= 5; i++) {
      const y = btop + (bbot - btop) * i / 5;
      ctx.fillText(round(maxVol * i / 5, 0), bx + 10, y + 3);
      ctx.beginPath(); ctx.moveTo(bx - 8, y); ctx.lineTo(bx - 4, y); ctx.stroke();
    }

    // Drop animation
    if (addedVol > 0) {
      ctx.beginPath();
      ctx.ellipse(bx, bbot + 6, 4, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#3fb950aa';
      ctx.fill();
    }

    // pH label
    ctx.font = 'bold 14px Segoe UI';
    ctx.fillStyle = phToColor(pH);
    ctx.textAlign = 'center';
    ctx.fillText(`pH = ${round(pH, 2)}`, fx, fy + 8);
    ctx.textAlign = 'left';
  }

  function drawTitrationCurve(ctx, W, H, Ca, Va, Cb, Veq) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += W/8) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += H/7) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    const maxVb = Veq * 2.2;
    ctx.beginPath();
    for (let i = 0; i <= W; i++) {
      const Vb = (i / W) * maxVb;
      const na = Ca * Va / 1000;
      const nb = Cb * Vb / 1000;
      const Vtot = (Va + Vb) / 1000;
      let pH;
      if (Vb === 0) pH = -Math.log10(Ca);
      else if (nb < na) pH = -Math.log10((na - nb) / Vtot);
      else if (Math.abs(nb - na) < 1e-9) pH = 7;
      else { const pOH = -Math.log10((nb - na) / Vtot); pH = 14 - pOH; }
      pH = clamp(pH, 0, 14);
      const py = H - (pH / 14) * (H - 16) - 8;
      i === 0 ? ctx.moveTo(i, py) : ctx.lineTo(i, py);
    }
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#58a6ff'; ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0;

    // Equivalence point marker
    const eqX = (Veq / maxVb) * W;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#f85149'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(eqX, 0); ctx.lineTo(eqX, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f85149'; ctx.font = '10px Segoe UI';
    ctx.fillText('Veq=' + round(Veq, 1) + 'mL', eqX + 4, 14);

    // pH=7 line
    const pH7y = H - (7 / 14) * (H - 16) - 8;
    ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1;
    ctx.setLineDash([3, 6]);
    ctx.beginPath(); ctx.moveTo(0, pH7y); ctx.lineTo(W, pH7y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#8b949e'; ctx.font = '10px Courier New';
    ctx.fillText('pH 7', 4, pH7y - 4);

    // Axes labels
    ctx.fillStyle = '#8b949e'; ctx.font = '10px Courier New';
    ctx.fillText('V(mL)', W - 50, H - 4);
    ctx.fillText('0', 4, H - 4);
    ctx.fillText('14', 4, 14);
    ctx.fillText('pH', 4, 28);
  }

  function refresh() {
    const { Ca, Va, Cb, Veq } = compute();
    const W = canvas.width  = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight || 320;
    drawBurette(ctx, W, H, parseFloat(addedSlider.value), 60);

    if (chartCtx && chartCanvas) {
      const CW = chartCanvas.width  = chartCanvas.offsetWidth;
      const CH = chartCanvas.height = chartCanvas.offsetHeight || 180;
      drawTitrationCurve(chartCtx, CW, CH, Ca, Va, Cb, Veq);
    }
  }

  [concSlider, volSlider, titSlider, addedSlider].forEach(sl => {
    sl.addEventListener('input', refresh);
  });

  refresh();
}

/* ── Boot ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  // Activate first sidebar item (dashboard) by default — no simulation needed
  const first = $('.sidebar-item[data-page="dashboard"]');
  if (first) first.click();
  // Auto-start pendulum when clicking the experiment card
  $$('.exp-card[data-sim]').forEach(card => {
    card.addEventListener('click', () => {
      const target = card.dataset.sim;
      const btn = $(`.sidebar-item[data-page="${target}"]`);
      if (btn) btn.click();
    });
  });
});
