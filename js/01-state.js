/* ============================================================
   NEON PONG • V3.0
   Jogo completo + controle total pelo Arduino (Web Serial)

   Controles físicos:
     Joystick 1 -> Player 1 / seleções do Player 1
       A0 = eixo X | A1 = eixo Y | D2 = clique SW

     Joystick 2 -> Player 2 / seleções do Player 2
       A2 = eixo X | A3 = eixo Y | D3 = clique SW

   Nos menus, o joystick do jogador responsável pela seleção atual
   navega e confirma. O clique do joystick oposto funciona como voltar
   quando a tela permite retorno. Durante a partida, os dois ficam ativos.

   Teclado (para testar sem Arduino):
     W / S + A / D        -> Player 1
     Setas ↑ ↓ ← →        -> Player 2
     Enter / Espaço       -> confirmar
     Esc / Backspace      -> voltar
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
