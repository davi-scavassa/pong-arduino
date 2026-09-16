/* ============================================================
   4. ENTRADA (Arduino + teclado unificados)
   ============================================================ */

const serialInput = {
  dir1: 'PARADO', dir2: 'PARADO', x1: 'PARADO', x2: 'PARADO',
  axis1: 0, axis2: 0, axisX1: 0, axisX2: 0,
  b1: 0, b2: 0, b3: 0
};

const keyInput = {
  dir1: 'PARADO', dir2: 'PARADO', x1: 'PARADO', x2: 'PARADO',
  b1: 0, b2: 0, b3: 0
};

const input = {
  dir1: 'PARADO', dir2: 'PARADO', x1: 'PARADO', x2: 'PARADO',
  axis1: 0, axis2: 0, axisX1: 0, axisX2: 0,
  b1: 0, b2: 0, b3: 0
};

const prevInput = {
  dir1: 'PARADO', dir2: 'PARADO', x1: 'PARADO', x2: 'PARADO',
  b1: 0, b2: 0, b3: 0
};

function mergeInput() {
  input.dir1 = keyInput.dir1 !== 'PARADO' ? keyInput.dir1 : serialInput.dir1;
  input.dir2 = keyInput.dir2 !== 'PARADO' ? keyInput.dir2 : serialInput.dir2;
  input.x1 = keyInput.x1 !== 'PARADO' ? keyInput.x1 : serialInput.x1;
  input.x2 = keyInput.x2 !== 'PARADO' ? keyInput.x2 : serialInput.x2;

  input.axis1 = keyInput.dir1 !== 'PARADO'
    ? (keyInput.dir1 === 'CIMA' ? -1 : 1)
    : serialInput.axis1;

  input.axis2 = keyInput.dir2 !== 'PARADO'
    ? (keyInput.dir2 === 'CIMA' ? -1 : 1)
    : serialInput.axis2;

  input.axisX1 = keyInput.x1 !== 'PARADO'
    ? (keyInput.x1 === 'ESQUERDA' ? -1 : 1)
    : serialInput.axisX1;

  input.axisX2 = keyInput.x2 !== 'PARADO'
    ? (keyInput.x2 === 'ESQUERDA' ? -1 : 1)
    : serialInput.axisX2;

  input.b1 = keyInput.b1 || serialInput.b1;
  input.b2 = keyInput.b2 || serialInput.b2;
  input.b3 = keyInput.b3 || serialInput.b3;
}

document.addEventListener('keydown', e => {
  const typing = document.activeElement && document.activeElement.tagName === 'INPUT';

  if (typing) {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.activeElement.blur();
      document.querySelector('.screen.active .primary.full')?.click();
    }
    if (e.key === 'Escape') document.activeElement.blur();
    return;
  }

  switch (e.key) {
    // Player 1 no teclado: W/S + A/D
    case 'w': case 'W': keyInput.dir1 = 'CIMA'; break;
    case 's': case 'S': keyInput.dir1 = 'BAIXO'; break;
    case 'a': case 'A': keyInput.x1 = 'ESQUERDA'; break;
    case 'd': case 'D': keyInput.x1 = 'DIREITA'; break;

    // Player 2 no teclado: setas
    case 'ArrowUp':
      e.preventDefault();
      keyInput.dir2 = 'CIMA';
      break;
    case 'ArrowDown':
      e.preventDefault();
      keyInput.dir2 = 'BAIXO';
      break;
    case 'ArrowLeft':
      e.preventDefault();
      keyInput.x2 = 'ESQUERDA';
      break;
    case 'ArrowRight':
      e.preventDefault();
      keyInput.x2 = 'DIREITA';
      break;

    case 'Enter': case ' ':
      e.preventDefault();
      keyInput.b2 = 1;
      break;
    case 'Escape': case 'Backspace':
      e.preventDefault();
      keyInput.b1 = 1;
      break;
    case 'm': case 'M': keyInput.b3 = 1; break;
  }
});

document.addEventListener('keyup', e => {
  switch (e.key) {
    case 'w': case 'W': case 's': case 'S':
      keyInput.dir1 = 'PARADO';
      break;
    case 'a': case 'A': case 'd': case 'D':
      keyInput.x1 = 'PARADO';
      break;
    case 'ArrowUp': case 'ArrowDown':
      keyInput.dir2 = 'PARADO';
      break;
    case 'ArrowLeft': case 'ArrowRight':
      keyInput.x2 = 'PARADO';
      break;
    case 'Enter': case ' ': keyInput.b2 = 0; break;
    case 'Escape': case 'Backspace': keyInput.b1 = 0; break;
    case 'm': case 'M': keyInput.b3 = 0; break;
  }
});
