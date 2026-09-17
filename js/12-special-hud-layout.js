/* ============================================================
   12. HUD DE ESPECIAIS FORA DA ARENA
   - move os dois indicadores de especial para fora do campo
   - mantém toda a lógica existente de recarga e uso
   ============================================================ */

function moveSpecialHudOutsideArena() {
  const gameWrap = document.querySelector('#game .game-wrap');
  const arena = document.querySelector('#game .arena');
  const leftHud = document.querySelector('#game .left-special');
  const rightHud = document.querySelector('#game .right-special');

  if (!gameWrap || !arena || !leftHud || !rightHud) return;

  let row = document.getElementById('specialHudRow');
  if (!row) {
    row = document.createElement('div');
    row.id = 'specialHudRow';
    row.className = 'special-hud-row';
    gameWrap.insertBefore(row, arena);
  }

  if (leftHud.parentElement !== row) row.appendChild(leftHud);
  if (rightHud.parentElement !== row) row.appendChild(rightHud);

  if (!document.getElementById('specialHudLayoutStyles')) {
    const style = document.createElement('style');
    style.id = 'specialHudLayoutStyles';
    style.textContent = `
      .special-hud-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 12px;
        margin: 0 0 12px;
      }

      .special-hud-row .special-hud {
        position: relative;
        inset: auto;
        bottom: auto;
        left: auto;
        right: auto;
        width: 100%;
        min-width: 0;
        padding: 11px 13px;
        background: rgba(6,13,29,.72);
        backdrop-filter: blur(10px);
      }

      .special-hud-row .left-special {
        border-color: rgba(53,231,255,.18);
      }

      .special-hud-row .right-special {
        border-color: rgba(155,99,255,.20);
      }

      .special-hud-row .special-hud > strong {
        font-size: 10px;
      }

      @media (max-width: 680px) {
        .special-hud-row {
          gap: 8px;
          margin-bottom: 9px;
        }

        .special-hud-row .special-hud {
          width: 100%;
          padding: 9px 10px;
        }

        .special-hud-row .special-heading {
          gap: 5px;
        }

        .special-hud-row .hud-owner,
        .special-hud-row .special-status span,
        .special-hud-row .special-status small {
          font-size: 7px;
        }

        .special-hud-row .special-hud > strong {
          font-size: 8px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

moveSpecialHudOutsideArena();

// Garante a posição correta caso a tela da partida seja reconstruída ou reaberta.
const baseStartMatchForHudLayout = startMatch;
startMatch = function () {
  moveSpecialHudOutsideArena();
  baseStartMatchForHudLayout();
};
