const state = {
  mode: '1P',
  p1: 'PLAYER 1',
  p2: 'PLAYER 2',
  difficulty: 'MÉDIO',
  p1Special: 'BOLA RÁPIDA',
  p2Special: 'BOLA RÁPIDA',
  cpuSpecial: 'DEFESA EXTRA'
};

const specialData = {
  'BOLA RÁPIDA': { icon: '⚡', label: 'BOLA RÁPIDA' },
  'RAQUETE MAIOR': { icon: '↕', label: 'RAQUETE MAIOR' },
  'DEFESA EXTRA': { icon: '🛡', label: 'DEFESA EXTRA' }
};

const demoRecords = {
  '1P': {
    rows: [
      ['1', 'Davi', '15 vitórias'],
      ['2', 'Lucas', '11 vitórias'],
      ['3', 'Pedro', '8 vitórias'],
      ['4', 'Ana', '6 vitórias'],
      ['5', 'João', '4 vitórias']
    ],
    streak: '8 vitórias', special: 'Bola Rápida', matches: '42'
  },
  '2P': {
    rows: [
      ['1', 'Lucas', '18 vitórias'],
      ['2', 'Davi', '16 vitórias'],
      ['3', 'João', '12 vitórias'],
      ['4', 'Ana', '9 vitórias'],
      ['5', 'Pedro', '7 vitórias']
    ],
    streak: '6 vitórias', special: 'Raquete Maior', matches: '57'
  }
};

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function start1PFlow() {
  const input = document.getElementById('player1Name');
  input.value = '';
  state.mode = '1P';
  state.p1 = 'PLAYER 1';
  showScreen('name1p');
  setTimeout(() => input.focus(), 0);
}

function start2PFlow() {
  const p1Input = document.getElementById('p1Name2');
  const p2Input = document.getElementById('p2Name2');

  p1Input.value = '';
  p2Input.value = '';

  state.mode = '2P';
  state.p1 = 'PLAYER 1';
  state.p2 = 'PLAYER 2';

  showScreen('name2p');
  setTimeout(() => p1Input.focus(), 0);
}

function go1PName() {
  const value = document.getElementById('player1Name').value.trim();
  state.mode = '1P';
  state.p1 = value || 'PLAYER 1';
  document.getElementById('special1pName').textContent = state.p1.toUpperCase();
  showScreen('difficulty');
}

function go2PNames() {
  const p1 = document.getElementById('p1Name2').value.trim();
  const p2 = document.getElementById('p2Name2').value.trim();
  state.mode = '2P';
  state.p1 = p1 || 'PLAYER 1';
  state.p2 = p2 || 'PLAYER 2';
  document.getElementById('p1SpecialTitle').textContent = state.p1.toUpperCase();
  document.getElementById('p2SpecialTitle').textContent = state.p2.toUpperCase();
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
  const rouletteValue = document.getElementById('rouletteValue');
  const rouletteLabel = document.getElementById('rouletteLabel');
  const resultBox = document.getElementById('rouletteResult');
  const resultText = document.getElementById('rouletteResultText');
  const continueBtn = document.getElementById('cpuContinue');

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
    }
  }, 105);
}

function specialIcon(name) {
  const data = specialData[name] || { icon: '✦', label: name };
  return `${data.icon} ${data.label}`;
}

function showReady1P() {
  document.getElementById('readyMode').textContent = `1 PLAYER • ${state.difficulty}`;
  document.getElementById('readyP1').textContent = state.p1;
  document.getElementById('readyP1Special').textContent = specialIcon(state.p1Special);
  document.getElementById('readyP2Label').textContent = 'CPU';
  document.getElementById('readyP2').textContent = 'CPU';
  document.getElementById('readyP2Special').textContent = specialIcon(state.cpuSpecial);
  document.getElementById('readyDifficulty').textContent = `● dificuldade: ${state.difficulty.toLowerCase()}`;
  updateGamePreview(state.p1, 'CPU', state.p1Special, state.cpuSpecial);
  showScreen('ready');
}

function showReady2P() {
  document.getElementById('readyMode').textContent = '2 PLAYERS';
  document.getElementById('readyP1').textContent = state.p1;
  document.getElementById('readyP1Special').textContent = specialIcon(state.p1Special);
  document.getElementById('readyP2Label').textContent = 'PLAYER 2';
  document.getElementById('readyP2').textContent = state.p2;
  document.getElementById('readyP2Special').textContent = specialIcon(state.p2Special);
  document.getElementById('readyDifficulty').textContent = '● duelo local';
  updateGamePreview(state.p1, state.p2, state.p1Special, state.p2Special);
  showScreen('ready');
}

function updateGamePreview(p1, p2, s1, s2) {
  document.getElementById('gameP1Name').textContent = p1;
  document.getElementById('gameP2Name').textContent = p2;
  document.getElementById('gameP1Special').textContent = specialIcon(s1);
  document.getElementById('gameP2Special').textContent = specialIcon(s2);
  document.getElementById('gameP1SpecialTop').textContent = specialIcon(s1);
  document.getElementById('gameP2SpecialTop').textContent = specialIcon(s2);

  const isCpu = state.mode === '1P';
  const modeLabel = isCpu ? `1 PLAYER • ${state.difficulty}` : '2 PLAYERS • LOCAL';
  document.getElementById('gameModeLabel').textContent = modeLabel;
  document.getElementById('p2SpecialButtonLabel').textContent = isCpu ? 'AUTO' : 'B3';
  document.getElementById('gameP2Type').textContent = isCpu ? 'CPU' : 'PLAYER 2';
  document.getElementById('arenaP2Label').textContent = isCpu ? 'CPU' : 'P2';
  document.getElementById('rightSpecialOwner').textContent = isCpu ? 'ESPECIAL CPU' : 'ESPECIAL P2';
  document.getElementById('footerP2Control').innerHTML = isCpu
    ? '<b>AUTO</b><span>Especial da CPU</span>'
    : '<b>B3</b><span>Especial P2</span>';
}

function runCountdown() {
  const overlay = document.getElementById('countdownOverlay');
  const value = document.getElementById('countdownValue');
  if (!overlay || !value) return;

  overlay.classList.remove('hidden');
  const steps = ['3', '2', '1', 'JÁ!'];
  let index = 0;
  value.textContent = steps[index];

  const timer = setInterval(() => {
    index++;
    if (index >= steps.length) {
      clearInterval(timer);
      setTimeout(() => overlay.classList.add('hidden'), 280);
      return;
    }
    value.textContent = steps[index];
    value.animate(
      [{ transform: 'scale(.72)', opacity: .25 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: 260, easing: 'ease-out' }
    );
  }, 620);
}

function startGamePreview() {
  document.getElementById('scoreP1').textContent = '0';
  document.getElementById('scoreP2').textContent = '0';
  showScreen('game');
  setTimeout(runCountdown, 180);
}

function openPause() {
  document.getElementById('pauseP1Name').textContent = state.p1;
  document.getElementById('pauseP2Name').textContent = state.mode === '1P' ? 'CPU' : state.p2;
  document.getElementById('pauseP1Score').textContent = document.getElementById('scoreP1').textContent;
  document.getElementById('pauseP2Score').textContent = document.getElementById('scoreP2').textContent;
  showScreen('pause');
}

function resumeGame() {
  showScreen('game');
}

function restartGame() {
  document.getElementById('scoreP1').textContent = '0';
  document.getElementById('scoreP2').textContent = '0';
  showScreen('game');
  setTimeout(runCountdown, 180);
}

function replayMatch() {
  startGamePreview();
}

function showVictoryPreview() {
  const opponent = state.mode === '1P' ? 'CPU' : state.p2;
  const mode = state.mode === '1P' ? `1 PLAYER • ${state.difficulty}` : '2 PLAYERS • LOCAL';
  document.getElementById('victoryName').textContent = state.p1;
  document.getElementById('finalP1').textContent = state.p1;
  document.getElementById('finalP2').textContent = opponent;
  document.getElementById('finalSpecial').textContent = specialIcon(state.p1Special);
  document.getElementById('finalMode').textContent = mode;
  showScreen('victory');
}

function setRecordTab(mode, button) {
  document.querySelectorAll('.record-tabs .tab').forEach(tab => tab.classList.remove('active-tab'));
  button.classList.add('active-tab');
  renderRecords(mode);
}

function renderRecords(mode = '1P') {
  const data = demoRecords[mode];
  const list = document.getElementById('recordList');
  list.innerHTML = data.rows.map((row, index) => `
    <div class="record-row ${index < 3 ? 'podium' : ''}">
      <b>${row[0]}</b>
      <span>${row[1]}</span>
      <small>${row[2]}</small>
    </div>
  `).join('');
  document.getElementById('statStreak').textContent = data.streak;
  document.getElementById('statSpecial').textContent = data.special;
  document.getElementById('statMatches').textContent = data.matches;
}

renderRecords('1P');
