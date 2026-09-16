/* ============================================================
   NEON PONG • V3.0
   Jogo completo + controle total pelo Arduino (Web Serial)

   Controles (iguais ao infográfico):
     Joystick 1  -> navega nos menus / move o Player 1
     Joystick 2  -> move o Player 2 (modo 2 players)
     Botão 1 (D2)-> voltar / cancelar  |  especial do P1 na partida
     Botão 2 (D3)-> confirmar / start / pause
     Botão 3 (D4)-> menu / reiniciar   |  especial do P2 (modo 2 players)

   Teclado (para testar sem Arduino):
     W / S           -> Player 1 e navegação
     Seta ↑ / ↓      -> Player 2 e navegação
     Enter / Espaço  -> Botão 2
     Esc / Backspace -> Botão 1
     M               -> Botão 3
   ============================================================ */

const $ = id => document.getElementById(id);
const qsa = sel => [...document.querySelectorAll(sel)];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/* ============================================================
   1. ESTADO GERAL
   ============================================================ */

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
  'BOLA RÁPIDA':   { icon: '⚡', label: 'BOLA RÁPIDA' },
  'RAQUETE MAIOR': { icon: '↕',  label: 'RAQUETE MAIOR' },
  'DEFESA EXTRA':  { icon: '🛡', label: 'DEFESA EXTRA' }
};

const SPECIAL_USES = 1;     // usos do especial por jogador em cada partida
const POINTS_TO_WIN = 5;

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

function specialIcon(name) {
  const data = specialData[name] || { icon: '✦', label: name };
  return `${data.icon} ${data.label}`;
}

