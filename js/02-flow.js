/* ============================================================
   2. TELAS / FLUXO
   ============================================================ */

let currentScreen = 'menu';

function showScreen(id) {
  if (game.running && id !== 'game' && id !== 'pause' && id !== 'victory') {
    game.running = false;
  }

  qsa('.screen').forEach(s => s.classList.remove('active'));
  const target = $(id);
  if (target) target.classList.add('active');
  currentScreen = id;

  navIndex = initialNavIndex(id);
  buildWheelIfNeeded(id);
  updateNavFocus();
  updateStaticControlLabels();
  setSerialCollapsed(id === 'game');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function start1PFlow() {
  $('player1Name').value = '';
  state.mode = '1P';
  state.p1 = 'PLAYER 1';
  showScreen('name1p');
}

function start2PFlow() {
  $('p1Name2').value = '';
  $('p2Name2').value = '';
  state.mode = '2P';
  state.p1 = 'PLAYER 1';
  state.p2 = 'PLAYER 2';
  showScreen('name2p');
}

function go1PName() {
  const value = $('player1Name').value.trim();
  state.mode = '1P';
  state.p1 = value || 'PLAYER 1';
  $('special1pName').textContent = state.p1.toUpperCase();
  showScreen('difficulty');
}

function go2PNames() {
  const p1 = $('p1Name2').value.trim();
  const p2 = $('p2Name2').value.trim();
  state.mode = '2P';
  state.p1 = p1 || 'PLAYER 1';
  state.p2 = p2 || 'PLAYER 2';
  $('p1SpecialTitle').textContent = state.p1.toUpperCase();
  $('p2SpecialTitle').textContent = state.p2.toUpperCase();
  showScreen('special2pP1');
}

function markSelected(button) {
  button.parentElement.querySelectorAll('.choice').forEach(b => b.classList.remove('selected'));
  button.classList.add('selected');
}

function selectDifficulty(value, button) {
  state.difficulty = value;
  markSelected(button);
}

function selectSpecial(player, value, button) {
  if (player === 'p1') state.p1Special = value;
  if (player === 'p2') state.p2Special = value;
  markSelected(button);
}

function startCpuRoulette() {
  state.mode = '1P';
  showScreen('cpuRoulette');

  const specials = ['BOLA RÁPIDA', 'RAQUETE MAIOR', 'DEFESA EXTRA'];
  const rouletteValue = $('rouletteValue');
  const rouletteLabel = $('rouletteLabel');
  const resultBox = $('rouletteResult');
  const resultText = $('rouletteResultText');
  const continueBtn = $('cpuContinue');

  resultBox.classList.add('hidden');
  continueBtn.classList.add('hidden');
  rouletteLabel.textContent = 'SORTEANDO...';

  let count = 0;
  const max = 22;
  const timer = setInterval(() => {
    const current = specials[count % specials.length];
    rouletteValue.textContent = specialIcon(current);
    rouletteValue.animate(
      [{ transform: 'translateY(10px)', opacity: .2 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: 90, easing: 'ease-out' }
    );
    count++;

    if (count >= max) {
      clearInterval(timer);
      const pick = specials[Math.floor(Math.random() * specials.length)];
      state.cpuSpecial = pick;
      rouletteValue.textContent = specialIcon(pick);
      rouletteLabel.textContent = 'SORTEIO FINALIZADO';
      resultText.textContent = specialIcon(pick);
      resultBox.classList.remove('hidden');
      continueBtn.classList.remove('hidden');
      updateNavFocus();
    }
  }, 105);
}

function showReady1P() {
  $('readyMode').textContent = `1 PLAYER • ${state.difficulty}`;
  $('readyP1').textContent = state.p1;
  $('readyP1Special').textContent = specialIcon(state.p1Special);
  $('readyP2Label').textContent = 'CPU';
  $('readyP2').textContent = 'CPU';
  $('readyP2Special').textContent = specialIcon(state.cpuSpecial);
  $('readyDifficulty').textContent = `● dificuldade: ${state.difficulty.toLowerCase()}`;
  updateGamePreview(state.p1, 'CPU', state.p1Special, state.cpuSpecial);
  showScreen('ready');
}

function showReady2P() {
  $('readyMode').textContent = '2 PLAYERS';
  $('readyP1').textContent = state.p1;
  $('readyP1Special').textContent = specialIcon(state.p1Special);
  $('readyP2Label').textContent = 'PLAYER 2';
  $('readyP2').textContent = state.p2;
  $('readyP2Special').textContent = specialIcon(state.p2Special);
  $('readyDifficulty').textContent = '● duelo local';
  updateGamePreview(state.p1, state.p2, state.p1Special, state.p2Special);
  showScreen('ready');
}

function updateStaticControlLabels() {
  const menuHint = document.querySelector('#menu .control-hint');
  if (menuHint) {
    menuHint.innerHTML = `
      <span><kbd>🕹</kbd> Joystick 1 • navegar</span>
      <span><kbd>J1</kbd> clique • confirmar</span>
      <span><kbd>J2</kbd> clique • voltar</span>
    `;
  }

  const readyRules = document.querySelectorAll('#ready .match-rules span');
  if (readyRules[1]) {
    readyRules[1].textContent = state.mode === '1P'
      ? '● 1 especial + 1 bônus após 45s se usado'
      : '● 1 especial + 1 bônus após 45s por jogador';
  }

  const p1Key = document.querySelector('.left-special .special-heading b');
  if (p1Key) p1Key.textContent = 'J1';

  const footer = document.querySelector('.game-footer.controls-strip');
  if (footer) {
    const first = footer.children[0];
    const main = footer.querySelector('.main-control');
    const restart = footer.querySelector('.restart-control');

    if (first) first.innerHTML = '<b>J1</b><span>Especial P1</span>';
    if (main) {
      main.innerHTML = state.mode === '1P'
        ? '<b>J2</b><span>Pause / Continuar</span>'
        : '<b>Ⅱ</b><span>Pause na tela</span>';
    }
    if (restart) restart.style.display = 'none';
  }

  const pauseSmall = document.querySelector('.pause-btn small');
  if (pauseSmall) pauseSmall.textContent = state.mode === '1P' ? 'J2' : 'PAUSE';

  const pauseContinue = document.querySelector('#pause .primary.full span');
  if (pauseContinue) pauseContinue.textContent = '• J1';
}

function updateGamePreview(p1, p2, s1, s2) {
  $('gameP1Name').textContent = p1;
  $('gameP2Name').textContent = p2;
  $('gameP1Special').textContent = specialIcon(s1);
  $('gameP2Special').textContent = specialIcon(s2);
  $('gameP1SpecialTop').textContent = specialIcon(s1);
  $('gameP2SpecialTop').textContent = specialIcon(s2);

  const isCpu = state.mode === '1P';
  $('gameModeLabel').textContent = isCpu ? `1 PLAYER • ${state.difficulty}` : '2 PLAYERS • LOCAL';
  $('p2SpecialButtonLabel').textContent = isCpu ? 'AUTO' : 'J2';
  $('gameP2Type').textContent = isCpu ? 'CPU' : 'PLAYER 2';
  $('arenaP2Label').textContent = isCpu ? 'CPU' : 'P2';
  $('rightSpecialOwner').textContent = isCpu ? 'ESPECIAL CPU' : 'ESPECIAL P2';
  $('footerP2Control').innerHTML = isCpu
    ? '<b>AUTO</b><span>Especial da CPU</span>'
    : '<b>J2</b><span>Especial P2</span>';

  updateStaticControlLabels();
}

function setRecordTab(mode, button) {
  qsa('.record-tabs .tab').forEach(tab => tab.classList.remove('active-tab'));
  button.classList.add('active-tab');
  renderRecords(mode);
}

function renderRecords(mode = '1P') {
  const data = demoRecords[mode];
  const list = $('recordList');
  list.innerHTML = data.rows.map((row, index) => `
    <div class="record-row ${index < 3 ? 'podium' : ''}">
      <b>${row[0]}</b>
      <span>${row[1]}</span>
      <small>${row[2]}</small>
    </div>
  `).join('');
  $('statStreak').textContent = data.streak;
  $('statSpecial').textContent = data.special;
  $('statMatches').textContent = data.matches;
}
