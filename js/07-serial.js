/* ============================================================
   7. WEB SERIAL (Arduino)
   ============================================================ */

let serialPort = null;
let serialReader = null;
let serialKeepReading = false;
let serialBuffer = '';

const DEADZONE = 0.18;

function initSerialPanel() {
  const style = document.createElement('style');
  style.textContent = `
    .serial-panel{position:fixed;right:18px;bottom:18px;width:min(340px,calc(100vw - 36px));z-index:9999;border:1px solid rgba(118,148,220,.22);border-radius:18px;background:rgba(5,11,26,.94);box-shadow:0 20px 55px rgba(0,0,0,.45);backdrop-filter:blur(18px);padding:14px;color:#f4f7ff;font-family:inherit}
    .serial-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.serial-title{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:900;letter-spacing:.08em}.serial-dot{width:9px;height:9px;border-radius:50%;background:#6d7890;box-shadow:0 0 0 4px rgba(109,120,144,.08)}.serial-panel.connected .serial-dot{background:#57f287;box-shadow:0 0 14px rgba(87,242,135,.55)}
    .serial-actions{display:flex;gap:6px;align-items:center}
    .serial-connect{border:1px solid rgba(53,231,255,.25);border-radius:10px;background:rgba(53,231,255,.08);color:#35e7ff;padding:8px 10px;font-size:9px;font-weight:900;letter-spacing:.05em;cursor:pointer}.serial-connect:hover{border-color:#35e7ff}.serial-connect:disabled{opacity:.55;cursor:not-allowed}
    .serial-status{font-size:9px;color:#7e8dab;margin-bottom:10px;line-height:1.4}.serial-status.error{color:#ff8f9f}.serial-values{display:grid;grid-template-columns:1fr 1fr;gap:7px}.serial-value{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 9px;border-radius:10px;background:rgba(18,28,55,.64);border:1px solid rgba(118,148,220,.1);font-size:9px}.serial-value span{color:#6f7f9d}.serial-value b{font-size:10px;color:#dfe9ff}.serial-value.active b{color:#35e7ff}.serial-value.button-active{border-color:rgba(87,242,135,.34);background:rgba(87,242,135,.06)}.serial-value.button-active b{color:#57f287}.serial-raw{margin-top:9px;padding:8px 9px;min-height:31px;border-radius:9px;background:#030711;border:1px solid rgba(118,148,220,.09);color:#71809d;font:8px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.serial-note{margin-top:8px;color:#596986;font-size:8px;line-height:1.4}
    @media(max-width:680px){.serial-panel{right:10px;bottom:10px;width:calc(100vw - 20px)}}
  `;
  document.head.appendChild(style);

  const panel = document.createElement('aside');
  panel.id = 'serialPanel';
  panel.className = 'serial-panel';
  panel.innerHTML = `
    <div class="serial-top">
      <div class="serial-title"><span class="serial-dot"></span><span>ARDUINO • SERIAL</span></div>
      <div class="serial-actions">
        <button id="serialConnectBtn" class="serial-connect" type="button">CONECTAR ARDUINO</button>
        <button id="serialMinBtn" class="serial-min" type="button" title="Minimizar">–</button>
      </div>
    </div>
    <div id="serialStatus" class="serial-status">Ainda não conectado. Feche o Monitor Serial da IDE antes de conectar.</div>
    <div class="serial-values">
      <div class="serial-value" id="serialP1"><span>J1 Y</span><b>PARADO</b></div>
      <div class="serial-value" id="serialX1"><span>J1 X</span><b>PARADO</b></div>
      <div class="serial-value" id="serialP2"><span>J2 Y</span><b>PARADO</b></div>
      <div class="serial-value" id="serialJ1Click"><span>J1 CLICK</span><b>0</b></div>
      <div class="serial-value" id="serialJ2Click"><span>J2 CLICK</span><b>0</b></div>
    </div>
    <div class="serial-raw" id="serialRaw">Aguardando dados...</div>
    <div class="serial-note">Menus empilhados usam J1 ↑↓ • menus lado a lado usam J1 ←→ • clique J1 confirma • clique J2 volta.</div>
  `;
  document.body.appendChild(panel);

  $('serialConnectBtn').addEventListener('click', connectArduino);
  $('serialMinBtn').addEventListener('click', () => panel.classList.toggle('collapsed'));

  if (!('serial' in navigator)) {
    $('serialConnectBtn').disabled = true;
    if (location.protocol === 'file:') {
      setSerialStatus('Abrindo pelo arquivo o navegador bloqueou a porta serial. Rode o "abrir-jogo" da pasta e acesse http://localhost:8000 — o jogo em si funciona normalmente aqui.', true);
    } else {
      setSerialStatus('Este navegador não tem Web Serial. Use Google Chrome ou Microsoft Edge no computador.', true);
    }
  }

  navigator.serial?.addEventListener('disconnect', event => {
    if (serialPort && event.target === serialPort) {
      handleSerialDisconnected('Arduino desconectado da USB.');
    }
  });
}

function setSerialCollapsed(collapsed) {
  $('serialPanel')?.classList.toggle('collapsed', collapsed);
}

async function connectArduino() {
  const button = $('serialConnectBtn');

  if (!('serial' in navigator)) {
    setSerialStatus('Web Serial indisponível neste navegador.', true);
    return;
  }

  if (serialPort?.readable) { await disconnectArduino(); return; }

  try {
    button.disabled = true;
    button.textContent = 'CONECTANDO...';
    setSerialStatus('Escolha a porta do Arduino na janela do navegador.');

    serialPort = await navigator.serial.requestPort();
    await serialPort.open({ baudRate: 9600 });

    serialKeepReading = true;
    serialBuffer = '';
    $('serialPanel').classList.add('connected');
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
      setSerialStatus('Não foi possível abrir a porta. Feche o Monitor Serial e tente de novo.', true);
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

/**
 * Formato atual, sem botões externos e com eixo X do Joystick 1:
 *   P1:CIMA|X1:ESQUERDA|P2:PARADO|J1:0|J2:0
 *
 * X1 é opcional para manter compatibilidade com sketches anteriores.
 * Também continua aceitando o formato antigo com B1/B2/B3.
 */
function processArduinoLine(line) {
  $('serialRaw').textContent = line;

  const data = {};
  for (const part of line.split('|')) {
    const sep = part.indexOf(':');
    if (sep === -1) continue;
    data[part.slice(0, sep).trim()] = part.slice(sep + 1).trim();
  }

  const a1 = parseAxis(data.P1);
  const a2 = parseAxis(data.P2);
  const x1 = data.X1 === undefined
    ? { axis: 0, dir: 'PARADO' }
    : parseHorizontalAxis(data.X1);

  if (!a1 || !a2 || !x1) {
    setSerialStatus('Dados recebidos, mas o formato não bate com o esperado.', true);
    return;
  }

  serialInput.axis1 = a1.axis;
  serialInput.axis2 = a2.axis;
  serialInput.axisX1 = x1.axis;
  serialInput.dir1 = a1.dir;
  serialInput.dir2 = a2.dir;
  serialInput.x1 = x1.dir;

  const hasJoystickClicks = ['0', '1'].includes(data.J1) && ['0', '1'].includes(data.J2);

  if (hasJoystickClicks) {
    const j1 = data.J1 === '1' ? 1 : 0;
    const j2 = data.J2 === '1' ? 1 : 0;

    // Fora da partida: J1 confirma e J2 volta.
    // 1P na partida: J1 = especial P1 e J2 = pausa.
    // 2P na partida: J1 = especial P1 e J2 = especial P2.
    if (currentScreen === 'game') {
      serialInput.b1 = j1;
      serialInput.b2 = state.mode === '1P' ? j2 : 0;
      serialInput.b3 = state.mode === '2P' ? j2 : 0;
    } else {
      serialInput.b1 = j2;
      serialInput.b2 = j1;
      serialInput.b3 = 0;
    }

    updateSerialValue('serialJ1Click', j1, j1 === 1, true);
    updateSerialValue('serialJ2Click', j2, j2 === 1, true);
  } else {
    // Compatibilidade com o esquema antigo de 3 botões.
    serialInput.b1 = data.B1 === '1' ? 1 : 0;
    serialInput.b2 = data.B2 === '1' ? 1 : 0;
    serialInput.b3 = data.B3 === '1' ? 1 : 0;

    updateSerialValue('serialJ1Click', serialInput.b2, serialInput.b2 === 1, true);
    updateSerialValue(
      'serialJ2Click',
      serialInput.b1 || serialInput.b3,
      (serialInput.b1 || serialInput.b3) === 1,
      true
    );
  }

  updateSerialValue('serialP1', a1.dir, a1.dir !== 'PARADO');
  updateSerialValue('serialX1', x1.dir, x1.dir !== 'PARADO');
  updateSerialValue('serialP2', a2.dir, a2.dir !== 'PARADO');

  setSerialStatus('Arduino conectado • dados chegando normalmente.');
}

function parseAxis(value) {
  if (value === undefined) return null;
  if (value === 'CIMA')   return { axis: -1, dir: 'CIMA' };
  if (value === 'BAIXO')  return { axis: 1,  dir: 'BAIXO' };
  if (value === 'PARADO') return { axis: 0,  dir: 'PARADO' };

  const n = Number(value);
  if (!Number.isFinite(n)) return null;

  let axis = (n - 512) / 512;
  if (Math.abs(axis) < DEADZONE) axis = 0;
  else axis = Math.sign(axis) * ((Math.abs(axis) - DEADZONE) / (1 - DEADZONE));
  axis = clamp(axis, -1, 1);

  const dir = axis < -0.35 ? 'CIMA' : axis > 0.35 ? 'BAIXO' : 'PARADO';
  return { axis, dir };
}

function parseHorizontalAxis(value) {
  if (value === undefined) return null;
  if (value === 'ESQUERDA') return { axis: -1, dir: 'ESQUERDA' };
  if (value === 'DIREITA')  return { axis: 1,  dir: 'DIREITA' };
  if (value === 'PARADO')   return { axis: 0,  dir: 'PARADO' };

  const n = Number(value);
  if (!Number.isFinite(n)) return null;

  let axis = (n - 512) / 512;
  if (Math.abs(axis) < DEADZONE) axis = 0;
  else axis = Math.sign(axis) * ((Math.abs(axis) - DEADZONE) / (1 - DEADZONE));
  axis = clamp(axis, -1, 1);

  const dir = axis < -0.35 ? 'ESQUERDA' : axis > 0.35 ? 'DIREITA' : 'PARADO';
  return { axis, dir };
}

function updateSerialValue(id, value, active = false, isButton = false) {
  const element = $(id);
  if (!element) return;
  element.querySelector('b').textContent = value;
  element.classList.toggle('active', active && !isButton);
  element.classList.toggle('button-active', active && isButton);
}

function setSerialStatus(message, isError = false) {
  const status = $('serialStatus');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('error', isError);
}

async function disconnectArduino() {
  serialKeepReading = false;
  try { if (serialReader) await serialReader.cancel(); } catch (_) {}
  try { if (serialPort) await serialPort.close(); } catch (e) { console.warn(e); }
  handleSerialDisconnected('Arduino desconectado.');
}

function handleSerialDisconnected(message) {
  serialKeepReading = false;
  serialReader = null;
  serialPort = null;
  serialBuffer = '';
  serialInput.dir1 = serialInput.dir2 = 'PARADO';
  serialInput.x1 = 'PARADO';
  serialInput.axis1 = serialInput.axis2 = serialInput.axisX1 = 0;
  serialInput.b1 = serialInput.b2 = serialInput.b3 = 0;

  $('serialPanel')?.classList.remove('connected');
  const button = $('serialConnectBtn');
  if (button) { button.disabled = false; button.textContent = 'CONECTAR ARDUINO'; }
  setSerialStatus(message);
}
