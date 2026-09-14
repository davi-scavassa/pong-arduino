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

// ============================================================
// ARDUINO / WEB SERIAL — ETAPA DE TESTE
// Nesta etapa o site APENAS lê e mostra os dados recebidos.
// Ainda não movimenta as raquetes nem controla os menus.
// ============================================================

let serialPort = null;
let serialReader = null;
let serialKeepReading = false;
let serialBuffer = '';

const arduinoState = {
  p1: 'PARADO',
  p2: 'PARADO',
  b1: 0,
  b2: 0,
  b3: 0
};

function initSerialPanel() {
  const style = document.createElement('style');
  style.textContent = `
    .serial-panel{position:fixed;right:18px;bottom:18px;width:min(360px,calc(100vw - 36px));z-index:9999;border:1px solid rgba(118,148,220,.22);border-radius:18px;background:rgba(5,11,26,.94);box-shadow:0 20px 55px rgba(0,0,0,.45);backdrop-filter:blur(18px);padding:14px;color:#f4f7ff;font-family:inherit}
    .serial-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}.serial-title{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:900;letter-spacing:.08em}.serial-dot{width:9px;height:9px;border-radius:50%;background:#6d7890;box-shadow:0 0 0 4px rgba(109,120,144,.08)}.serial-panel.connected .serial-dot{background:#57f287;box-shadow:0 0 14px rgba(87,242,135,.55)}
    .serial-connect{border:1px solid rgba(53,231,255,.25);border-radius:10px;background:rgba(53,231,255,.08);color:#35e7ff;padding:8px 10px;font-size:9px;font-weight:900;letter-spacing:.05em;cursor:pointer}.serial-connect:hover{border-color:#35e7ff}.serial-connect:disabled{opacity:.55;cursor:not-allowed}
    .serial-status{font-size:9px;color:#7e8dab;margin-bottom:10px;line-height:1.4}.serial-status.error{color:#ff8f9f}.serial-values{display:grid;grid-template-columns:1fr 1fr;gap:7px}.serial-value{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 9px;border-radius:10px;background:rgba(18,28,55,.64);border:1px solid rgba(118,148,220,.1);font-size:9px}.serial-value span{color:#6f7f9d}.serial-value b{font-size:10px;color:#dfe9ff}.serial-value.active b{color:#35e7ff}.serial-value.button-active{border-color:rgba(87,242,135,.34);background:rgba(87,242,135,.06)}.serial-value.button-active b{color:#57f287}.serial-raw{margin-top:9px;padding:8px 9px;min-height:31px;border-radius:9px;background:#030711;border:1px solid rgba(118,148,220,.09);color:#71809d;font:8px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.serial-note{margin-top:8px;color:#596986;font-size:8px;line-height:1.4}.serial-toggle{display:none}@media(max-width:680px){.serial-panel{right:10px;bottom:10px;width:calc(100vw - 20px)}}
  `;
  document.head.appendChild(style);

  const panel = document.createElement('aside');
  panel.id = 'serialPanel';
  panel.className = 'serial-panel';
  panel.innerHTML = `
    <div class="serial-top">
      <div class="serial-title"><span class="serial-dot"></span><span>ARDUINO • SERIAL</span></div>
      <button id="serialConnectBtn" class="serial-connect" type="button">CONECTAR ARDUINO</button>
    </div>
    <div id="serialStatus" class="serial-status">Ainda não conectado. Feche o Monitor Serial antes de conectar.</div>
    <div class="serial-values">
      <div class="serial-value" id="serialP1"><span>P1</span><b>PARADO</b></div>
      <div class="serial-value" id="serialP2"><span>P2</span><b>PARADO</b></div>
      <div class="serial-value" id="serialB1"><span>B1</span><b>0</b></div>
      <div class="serial-value" id="serialB2"><span>B2</span><b>0</b></div>
      <div class="serial-value" id="serialB3"><span>B3</span><b>0</b></div>
    </div>
    <div class="serial-raw" id="serialRaw">Aguardando dados...</div>
    <div class="serial-note">Teste atual: apenas leitura. Nenhum comando do Arduino controla o jogo ainda.</div>
  `;
  document.body.appendChild(panel);

  const button = document.getElementById('serialConnectBtn');
  button.addEventListener('click', connectArduino);

  if (!('serial' in navigator)) {
    button.disabled = true;
    setSerialStatus('Este navegador não oferece Web Serial. Use Chrome ou Edge.', true);
  }

  navigator.serial?.addEventListener('disconnect', event => {
    if (serialPort && event.target === serialPort) {
      handleSerialDisconnected('Arduino desconectado da USB.');
    }
  });
}

async function connectArduino() {
  const button = document.getElementById('serialConnectBtn');

  if (!('serial' in navigator)) {
    setSerialStatus('Web Serial indisponível neste navegador. Use Chrome ou Edge.', true);
    return;
  }

  if (serialPort?.readable) {
    await disconnectArduino();
    return;
  }

  try {
    button.disabled = true;
    button.textContent = 'CONECTANDO...';
    setSerialStatus('Escolha a porta do Arduino na janela do navegador.');

    serialPort = await navigator.serial.requestPort();
    await serialPort.open({ baudRate: 9600 });

    serialKeepReading = true;
    serialBuffer = '';
    document.getElementById('serialPanel').classList.add('connected');
    button.disabled = false;
    button.textContent = 'DESCONECTAR';
    setSerialStatus('Arduino conectado em 9600 baud. Recebendo dados...');

    readArduinoSerial();
  } catch (error) {
    button.disabled = false;
    button.textContent = 'CONECTAR ARDUINO';

    if (error?.name === 'NotFoundError') {
      setSerialStatus('Conexão cancelada. Nenhuma porta foi selecionada.');
    } else if (error?.name === 'NetworkError') {
      setSerialStatus('Não foi possível abrir a porta. Feche o Monitor Serial e tente novamente.', true);
    } else {
      console.error('Erro ao conectar Arduino:', error);
      setSerialStatus(`Erro ao conectar: ${error?.message || 'erro desconhecido'}`, true);
    }
  }
}

async function readArduinoSerial() {
  if (!serialPort?.readable) return;

  const decoder = new TextDecoderStream();
  const readableClosed = serialPort.readable.pipeTo(decoder.writable).catch(error => {
    if (serialKeepReading) console.error('Erro na leitura serial:', error);
  });

  serialReader = decoder.readable.getReader();

  try {
    while (serialKeepReading) {
      const { value, done } = await serialReader.read();
      if (done) break;
      if (!value) continue;

      serialBuffer += value;
      const lines = serialBuffer.split(/\r?\n/);
      serialBuffer = lines.pop() || '';

      lines.forEach(line => {
        const clean = line.trim();
        if (clean) processArduinoLine(clean);
      });
    }
  } catch (error) {
    if (serialKeepReading) {
      console.error('Erro durante a leitura serial:', error);
      setSerialStatus('A leitura serial foi interrompida.', true);
    }
  } finally {
    try { serialReader?.releaseLock(); } catch (_) {}
    serialReader = null;
    await readableClosed;
  }
}

function processArduinoLine(line) {
  document.getElementById('serialRaw').textContent = line;

  const parts = line.split('|');
  const data = {};

  for (const part of parts) {
    const separator = part.indexOf(':');
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    data[key] = value;
  }

  const validP1 = ['CIMA', 'BAIXO', 'PARADO'].includes(data.P1);
  const validP2 = ['CIMA', 'BAIXO', 'PARADO'].includes(data.P2);

  if (!validP1 || !validP2 || !['0', '1'].includes(data.B1) || !['0', '1'].includes(data.B2) || !['0', '1'].includes(data.B3)) {
    setSerialStatus('Dados recebidos, mas o formato não bate com o esperado.', true);
    return;
  }

  arduinoState.p1 = data.P1;
  arduinoState.p2 = data.P2;
  arduinoState.b1 = Number(data.B1);
  arduinoState.b2 = Number(data.B2);
  arduinoState.b3 = Number(data.B3);

  updateSerialValue('serialP1', arduinoState.p1, arduinoState.p1 !== 'PARADO');
  updateSerialValue('serialP2', arduinoState.p2, arduinoState.p2 !== 'PARADO');
  updateSerialValue('serialB1', arduinoState.b1, arduinoState.b1 === 1, true);
  updateSerialValue('serialB2', arduinoState.b2, arduinoState.b2 === 1, true);
  updateSerialValue('serialB3', arduinoState.b3, arduinoState.b3 === 1, true);

  setSerialStatus('Arduino conectado • dados chegando normalmente.');
}

function updateSerialValue(id, value, active = false, isButton = false) {
  const element = document.getElementById(id);
  if (!element) return;
  element.querySelector('b').textContent = value;
  element.classList.toggle('active', active && !isButton);
  element.classList.toggle('button-active', active && isButton);
}

function setSerialStatus(message, isError = false) {
  const status = document.getElementById('serialStatus');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('error', isError);
}

async function disconnectArduino() {
  serialKeepReading = false;

  try {
    if (serialReader) await serialReader.cancel();
  } catch (_) {}

  try {
    if (serialPort) await serialPort.close();
  } catch (error) {
    console.warn('Não foi possível fechar a porta imediatamente:', error);
  }

  handleSerialDisconnected('Arduino desconectado.');
}

function handleSerialDisconnected(message) {
  serialKeepReading = false;
  serialReader = null;
  serialPort = null;
  serialBuffer = '';

  const panel = document.getElementById('serialPanel');
  const button = document.getElementById('serialConnectBtn');
  panel?.classList.remove('connected');

  if (button) {
    button.disabled = false;
    button.textContent = 'CONECTAR ARDUINO';
  }

  setSerialStatus(message);
}

renderRecords('1P');
initSerialPanel();
