/* ============================================================
   3. MOTOR DO JOGO
   ============================================================ */

const CPU_PRESETS = {
  'FÁCIL':   { speed: 0.45, reaction: 0.60, error: 0.350, specialAt: 0.10 },
  'MÉDIO':   { speed: 0.95, reaction: 0.24, error: 0.100, specialAt: 0.16 },
  'DIFÍCIL': { speed: 1.30, reaction: 0.13, error: 0.068, specialAt: 0.22 }
};

const BALL_START_SPEED = 0.46;   // larguras de arena por segundo
const BALL_MAX_SPEED   = 3.00;
const BALL_SPEEDUP     = 1.07;   // ganho a cada rebatida (a bola acelera no rali)
const PADDLE_SPEED     = 1.25;   // alturas de arena por segundo
const PADDLE_BASE_H    = 0.19;   // fração da altura da arena
const BALL_R           = 0.012;

const game = {
  running: false,
  paused: false,
  phase: 'idle',        // idle | play | goal | over
  ball: { x: .5, y: .27, vx: 0, vy: 0, speed: BALL_START_SPEED, visible: true },
  p1: null,
  p2: null,
  score: [0, 0],
  speedMul: 1,
  speedUntil: 0,
  lastTime: 0,
  goalUntil: 0,
  nextServeDir: 1,
  cpu: { target: .27, nextThink: 0, usedSpecial: false }
};

const dims = { w: 900, h: 500, H: 0.55, pw: 0.015 };

function newPlayer(specialName, isCpu = false) {
  return {
    y: 0.27,
    special: specialName,
    usesLeft: SPECIAL_USES,
    active: false,
    activeUntil: 0,
    hMul: 1,
    shield: false,
    isCpu
  };
}

function measureArena() {
  const arena = document.querySelector('#game .arena');
  if (!arena) return;
  const rect = arena.getBoundingClientRect();
  if (rect.width < 50) return;
  dims.w = rect.width;
  dims.h = rect.height;
  dims.H = rect.height / rect.width;
  dims.pw = 14 / rect.width;
}

function startMatch() {
  showScreen('game');
  measureArena();

  game.score = [0, 0];
  game.speedMul = 1;
  game.speedUntil = 0;
  game.paused = false;
  game.phase = 'goal';                       // trava a bola durante a contagem
  game.goalUntil = Number.MAX_SAFE_INTEGER;
  game.nextServeDir = Math.random() < .5 ? -1 : 1;

  const p2Special = state.mode === '1P' ? state.cpuSpecial : state.p2Special;
  game.p1 = newPlayer(state.p1Special, false);
  game.p2 = newPlayer(p2Special, state.mode === '1P');
  game.p1.y = dims.H / 2;
  game.p2.y = dims.H / 2;

  game.cpu.usedSpecial = false;
  game.cpu.target = dims.H / 2;
  game.cpu.nextThink = 0;

  $('scoreP1').textContent = '0';
  $('scoreP2').textContent = '0';
  resetBall(game.nextServeDir, false);
  updateSpecialHud();
  renderGame();

  game.running = true;
  game.lastTime = performance.now();

  runCountdown(() => {
    if (!game.running) return;
    game.phase = 'play';
    serveBall(game.nextServeDir);
  });
}

// nomes usados nos onclick do HTML
function startGamePreview() { startMatch(); }
function replayMatch() { startMatch(); }
function restartGame() { startMatch(); }

function resetBall(dir, moving) {
  game.ball.x = .5;
  game.ball.y = dims.H / 2;
  game.ball.speed = BALL_START_SPEED;
  game.ball.vx = 0;
  game.ball.vy = 0;
  game.ball.visible = moving;
  game.nextServeDir = dir;
}

function serveBall(dir) {
  const angle = (Math.random() * 0.5 - 0.25);   // até ±14°
  game.ball.speed = BALL_START_SPEED;
  game.ball.vx = Math.cos(angle) * game.ball.speed * dir;
  game.ball.vy = Math.sin(angle) * game.ball.speed;
  game.ball.visible = true;
}

function runCountdown(callback) {
  const overlay = $('countdownOverlay');
  const value = $('countdownValue');
  if (!overlay || !value) { callback && callback(); return; }

  overlay.classList.remove('hidden');
  const steps = ['3', '2', '1', 'JÁ!'];
  let index = 0;
  value.textContent = steps[index];

  const timer = setInterval(() => {
    index++;
    if (index >= steps.length) {
      clearInterval(timer);
      overlay.classList.add('hidden');
      callback && callback();
      return;
    }
    value.textContent = steps[index];
    value.animate(
      [{ transform: 'scale(.72)', opacity: .25 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: 260, easing: 'ease-out' }
    );
  }, 620);
}

function openPause() {
  if (!game.running || game.phase === 'over') return;
  game.paused = true;
  $('pauseP1Name').textContent = state.p1;
  $('pauseP2Name').textContent = state.mode === '1P' ? 'CPU' : state.p2;
  $('pauseP1Score').textContent = game.score[0];
  $('pauseP2Score').textContent = game.score[1];
  showScreen('pause');
}

function resumeGame() {
  if (!game.running) { showScreen('menu'); return; }
  game.paused = false;
  game.lastTime = performance.now();
  showScreen('game');
  measureArena();
}

/* ---------- Especiais ---------- */

function activateSpecial(who) {
  const player = who === 'p1' ? game.p1 : game.p2;
  if (!game.running || game.paused || game.phase === 'over') return;
  if (!player || player.usesLeft <= 0 || player.active) return;

  player.usesLeft--;
  player.active = true;

  const now = performance.now();

  if (player.special === 'BOLA RÁPIDA') {
    game.speedMul = 1.55;
    game.speedUntil = now + 4000;
    player.activeUntil = now + 4000;
  } else if (player.special === 'RAQUETE MAIOR') {
    player.hMul = 1.75;
    player.activeUntil = now + 6500;
  } else if (player.special === 'DEFESA EXTRA') {
    player.shield = true;
    player.activeUntil = now + 7000;
  }

  updateSpecialHud();
}

function updateSpecials(now) {
  [game.p1, game.p2].forEach(p => {
    if (p && p.active && now >= p.activeUntil) {
      p.active = false;
      p.hMul = 1;
      p.shield = false;
      updateSpecialHud();
    }
  });

  if (game.speedUntil && now >= game.speedUntil) {
    game.speedMul = 1;
    game.speedUntil = 0;
  }
}

function updateSpecialHud() {
  const sides = [
    { p: game.p1, hud: document.querySelector('.left-special'),  status: $('p1SpecialStatus'), uses: $('p1SpecialUses'), charge: $('p1Charge') },
    { p: game.p2, hud: document.querySelector('.right-special'), status: $('p2SpecialStatus'), uses: $('p2SpecialUses'), charge: $('p2Charge') }
  ];

  sides.forEach(({ p, hud, status, uses, charge }) => {
    if (!p || !hud) return;
    const label = p.active ? '● EM USO' : (p.usesLeft > 0 ? '● PRONTO' : '● USADO');
    if (status) status.textContent = label;
    if (uses) uses.textContent = `${p.usesLeft} USO${p.usesLeft === 1 ? '' : 'S'}`;
    if (charge) charge.style.width = `${(p.usesLeft / SPECIAL_USES) * 100}%`;
    hud.classList.toggle('used', p.usesLeft === 0 && !p.active);
    hud.classList.toggle('active-special', p.active);
  });
}

/* ---------- Física ---------- */

function paddleH(p) {
  return PADDLE_BASE_H * dims.H * p.hMul;
}

function movePaddle(p, axis, dt, H) {
  const half = paddleH(p) / 2;
  p.y += axis * PADDLE_SPEED * H * dt;
  p.y = clamp(p.y, half, H - half);
}

function bounceOnPaddle(p, newX, dirSign) {
  const ball = game.ball;
  const half = paddleH(p) / 2;
  const offset = clamp((ball.y - p.y) / half, -1, 1);
  const angle = offset * 0.95;                       // até ~54°
  ball.speed = Math.min(ball.speed * BALL_SPEEDUP, BALL_MAX_SPEED);
  ball.vx = Math.cos(angle) * ball.speed * dirSign;
  ball.vy = Math.sin(angle) * ball.speed;
  ball.x = newX;
}

function updatePhysics(dt, now) {
  const H = dims.H;

  movePaddle(game.p1, input.axis1, dt, H);

  if (state.mode === '2P') movePaddle(game.p2, input.axis2, dt, H);
  else updateCpu(dt, now, H);

  if (game.phase !== 'play') return;

  // divide o passo para a bola nunca "atravessar" a raquete quando estiver rápida
  const travel = Math.abs(game.ball.vx * game.speedMul) * dt;
  const steps = Math.max(1, Math.min(12, Math.ceil(travel / 0.012)));
  const sub = dt / steps;
  for (let i = 0; i < steps && game.phase === 'play'; i++) stepBall(sub, H);
}

function stepBall(dt, H) {
  const ball = game.ball;
  const mul = game.speedMul;
  ball.x += ball.vx * mul * dt;
  ball.y += ball.vy * mul * dt;

  if (ball.y - BALL_R < 0) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy); }
  if (ball.y + BALL_R > H) { ball.y = H - BALL_R; ball.vy = -Math.abs(ball.vy); }

  const pw = dims.pw;
  const leftFace = 0.05 + pw;
  const rightFace = 0.95 - pw;

  if (ball.vx < 0 && ball.x - BALL_R <= leftFace && ball.x >= 0.02) {
    if (Math.abs(ball.y - game.p1.y) <= paddleH(game.p1) / 2 + BALL_R) {
      bounceOnPaddle(game.p1, leftFace + BALL_R, 1);
    }
  }

  if (ball.vx > 0 && ball.x + BALL_R >= rightFace && ball.x <= 0.98) {
    if (Math.abs(ball.y - game.p2.y) <= paddleH(game.p2) / 2 + BALL_R) {
      bounceOnPaddle(game.p2, rightFace - BALL_R, -1);
    }
  }

  // escudos (DEFESA EXTRA) — seguram a bola uma vez
  if (game.p1.shield && ball.vx < 0 && ball.x - BALL_R <= 0.030) {
    ball.x = 0.030 + BALL_R;
    ball.vx = Math.abs(ball.vx);
    game.p1.shield = false;
    game.p1.active = false;
    updateSpecialHud();
  }
  if (game.p2.shield && ball.vx > 0 && ball.x + BALL_R >= 0.970) {
    ball.x = 0.970 - BALL_R;
    ball.vx = -Math.abs(ball.vx);
    game.p2.shield = false;
    game.p2.active = false;
    updateSpecialHud();
  }

  if (ball.x < -0.03) scorePoint(1);
  else if (ball.x > 1.03) scorePoint(0);
}

function updateCpu(dt, now, H) {
  const preset = CPU_PRESETS[state.difficulty] || CPU_PRESETS['MÉDIO'];
  const ball = game.ball;

  if (now >= game.cpu.nextThink) {
    game.cpu.nextThink = now + preset.reaction * 1000;

    if (ball.vx > 0) {
      const timeToReach = (0.95 - ball.x) / Math.max(Math.abs(ball.vx) * game.speedMul, 0.001);
      let predicted = ball.y + ball.vy * game.speedMul * timeToReach;
      // "dobra" a previsão nas paredes
      const span = 2 * H;
      predicted = ((predicted % span) + span) % span;
      if (predicted > H) predicted = span - predicted;
      game.cpu.target = predicted + (Math.random() * 2 - 1) * preset.error * H;
    } else {
      game.cpu.target = H / 2 + (Math.random() * 2 - 1) * 0.06 * H;
    }
  }

  const half = paddleH(game.p2) / 2;
  const target = clamp(game.cpu.target, half, H - half);
  const diff = target - game.p2.y;
  const step = preset.speed * H * dt;
  if (Math.abs(diff) <= step) game.p2.y = target;
  else game.p2.y += Math.sign(diff) * step;
  game.p2.y = clamp(game.p2.y, half, H - half);

  if (!game.cpu.usedSpecial && game.p2.usesLeft > 0 && game.phase === 'play') {
    const losing = game.score[1] < game.score[0];
    const chancePerSecond = preset.specialAt * (losing ? 2 : 1);
    if (Math.random() < chancePerSecond * dt) {
      game.cpu.usedSpecial = true;
      activateSpecial('p2');
    }
  }
}

function scorePoint(who) {
  game.score[who]++;
  const el = who === 0 ? $('scoreP1') : $('scoreP2');
  el.textContent = game.score[who];
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');

  const flash = $('goalFlash');
  if (flash) {
    flash.classList.add('on');
    setTimeout(() => flash.classList.remove('on'), 220);
  }

  game.speedMul = 1;
  game.speedUntil = 0;

  if (game.score[who] >= POINTS_TO_WIN) { endMatch(who); return; }

  game.phase = 'goal';
  game.goalUntil = performance.now() + 900;
  resetBall(who === 0 ? 1 : -1, false);
}

function endMatch(winnerIndex) {
  game.phase = 'over';
  game.running = false;
  game.ball.visible = false;

  const opponent = state.mode === '1P' ? 'CPU' : state.p2;
  const winnerName = winnerIndex === 0 ? state.p1 : opponent;
  const winnerSpecial = winnerIndex === 0
    ? state.p1Special
    : (state.mode === '1P' ? state.cpuSpecial : state.p2Special);
  const mode = state.mode === '1P' ? `1 PLAYER • ${state.difficulty}` : '2 PLAYERS • LOCAL';

  $('victoryName').textContent = winnerName;
  $('finalP1').textContent = state.p1;
  $('finalP2').textContent = opponent;
  $('finalScore1').textContent = game.score[0];
  $('finalScore2').textContent = game.score[1];
  $('finalSpecial').textContent = specialIcon(winnerSpecial);
  $('finalMode').textContent = mode;

  setTimeout(() => showScreen('victory'), 650);
}

function showVictoryPreview() { endMatch(0); }

/* ---------- Render ---------- */

function renderGame() {
  const H = dims.H || 0.55;
  const ballEl = $('ball');
  const leftEl = $('paddleLeft');
  const rightEl = $('paddleRight');
  if (!ballEl || !leftEl || !rightEl || !game.p1 || !game.p2) return;

  ballEl.style.left = `${game.ball.x * 100}%`;
  ballEl.style.top = `${(game.ball.y / H) * 100}%`;
  ballEl.classList.toggle('hidden-ball', !game.ball.visible);
  ballEl.classList.toggle('fast', game.speedMul > 1.01);

  leftEl.style.height = `${paddleH(game.p1) * dims.w}px`;
  leftEl.style.top = `${(game.p1.y / H) * 100}%`;
  leftEl.classList.toggle('boosted', game.p1.hMul > 1);

  rightEl.style.height = `${paddleH(game.p2) * dims.w}px`;
  rightEl.style.top = `${(game.p2.y / H) * 100}%`;
  rightEl.classList.toggle('boosted', game.p2.hMul > 1);

  const sl = $('shieldLeft');
  const sr = $('shieldRight');
  if (sl) sl.classList.toggle('on', !!game.p1.shield);
  if (sr) sr.classList.toggle('on', !!game.p2.shield);
}

