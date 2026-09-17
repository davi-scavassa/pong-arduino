/* ============================================================
   10. RECORDES LOCAIS
   - salva partidas reais no localStorage
   - ranking separado para 1P e 2P
   - maior sequência, especial mais usado e total de partidas
   ============================================================ */

const RECORDS_STORAGE_KEY = 'neonPongRecordsV1';
let recordsMemoryFallback = [];
let currentRecordMode = '1P';
let currentMatchSpecialUses = { p1: 0, p2: 0 };

function loadSavedMatches() {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!raw) return recordsMemoryFallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return recordsMemoryFallback;
  }
}

function saveMatches(matches) {
  recordsMemoryFallback = matches;
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(matches));
  } catch (_) {
    // Se o navegador bloquear armazenamento, os dados continuam nesta sessão.
  }
}

function escapeRecordText(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function recordNameKey(name) {
  return String(name || 'PLAYER').trim().toUpperCase();
}

function humanPlayersForMatch(match) {
  if (match.mode === '1P') return [match.p1];
  return [match.p1, match.p2];
}

function saveFinishedMatch(winnerIndex) {
  if (game.__recordSaved) return;
  if (Math.max(game.score[0], game.score[1]) < POINTS_TO_WIN) return;

  const opponent = state.mode === '1P' ? 'CPU' : state.p2;
  const match = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    mode: state.mode,
    difficulty: state.mode === '1P' ? state.difficulty : null,
    p1: state.p1,
    p2: opponent,
    winnerIndex,
    winner: winnerIndex === 0 ? state.p1 : opponent,
    score: [game.score[0], game.score[1]],
    durationMs: Math.round(game.elapsedMs),
    specials: {
      p1: state.p1Special,
      p2: state.mode === '1P' ? state.cpuSpecial : state.p2Special
    },
    specialUses: {
      p1: currentMatchSpecialUses.p1,
      p2: currentMatchSpecialUses.p2
    }
  };

  const matches = loadSavedMatches();
  matches.push(match);
  saveMatches(matches.slice(-500));
  game.__recordSaved = true;
}

function buildRanking(matches, mode) {
  const players = new Map();

  matches.forEach(match => {
    if (mode === '1P') {
      const key = recordNameKey(match.p1);
      if (!players.has(key)) players.set(key, { name: match.p1, wins: 0, matches: 0 });
      const row = players.get(key);
      row.name = match.p1;
      row.matches++;
      if (match.winnerIndex === 0) row.wins++;
      return;
    }

    [match.p1, match.p2].forEach(name => {
      const key = recordNameKey(name);
      if (!players.has(key)) players.set(key, { name, wins: 0, matches: 0 });
      const row = players.get(key);
      row.name = name;
      row.matches++;
    });

    const winnerName = match.winnerIndex === 0 ? match.p1 : match.p2;
    const winner = players.get(recordNameKey(winnerName));
    if (winner) winner.wins++;
  });

  return [...players.values()]
    .sort((a, b) => b.wins - a.wins || b.matches - a.matches || a.name.localeCompare(b.name))
    .slice(0, 5);
}

function longestWinStreak(matches, mode) {
  const streaks = new Map();
  let best = 0;

  matches.forEach(match => {
    const participants = humanPlayersForMatch(match);
    const winnerName = mode === '1P'
      ? (match.winnerIndex === 0 ? match.p1 : null)
      : (match.winnerIndex === 0 ? match.p1 : match.p2);
    const winnerKey = winnerName ? recordNameKey(winnerName) : null;

    participants.forEach(name => {
      const key = recordNameKey(name);
      const next = key === winnerKey ? (streaks.get(key) || 0) + 1 : 0;
      streaks.set(key, next);
      if (next > best) best = next;
    });
  });

  return best;
}

function mostUsedSpecial(matches, mode) {
  const counts = new Map();

  matches.forEach(match => {
    const candidates = mode === '1P'
      ? [{ name: match.specials?.p1, uses: match.specialUses?.p1 || 0 }]
      : [
          { name: match.specials?.p1, uses: match.specialUses?.p1 || 0 },
          { name: match.specials?.p2, uses: match.specialUses?.p2 || 0 }
        ];

    candidates.forEach(({ name, uses }) => {
      if (!name || uses <= 0) return;
      counts.set(name, (counts.get(name) || 0) + uses);
    });
  });

  if (!counts.size) return 'Nenhum ainda';
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function ensureRealRecordsUI() {
  const panel = document.querySelector('#records .records-panel');
  if (!panel) return;

  const badge = panel.querySelector('.demo-badge');
  if (badge) badge.textContent = 'DADOS LOCAIS';

  const intro = panel.querySelector('.records-title-row + .muted');
  if (intro) intro.textContent = 'Os resultados são salvos neste navegador e atualizados ao fim de cada partida.';

  if (!$('clearRecordsBtn')) {
    const button = document.createElement('button');
    button.id = 'clearRecordsBtn';
    button.type = 'button';
    button.className = 'records-clear-button';
    button.textContent = 'LIMPAR RECORDES';
    button.title = 'Apaga somente os recordes salvos neste navegador';
    panel.appendChild(button);

    button.addEventListener('click', () => {
      const ok = window.confirm('Apagar todos os recordes salvos neste navegador?');
      if (!ok) return;
      saveMatches([]);
      try { localStorage.removeItem(RECORDS_STORAGE_KEY); } catch (_) {}
      renderRecords(currentRecordMode);
    });
  }

  if (!$('realRecordsStyles')) {
    const style = document.createElement('style');
    style.id = 'realRecordsStyles';
    style.textContent = `
      .records-clear-button {
        display: block;
        margin: 18px 0 0 auto;
        padding: 9px 12px;
        border: 1px solid rgba(255,112,155,.22);
        border-radius: 10px;
        background: rgba(255,112,155,.06);
        color: #a98796;
        font-size: 9px;
        font-weight: 900;
        letter-spacing: .08em;
      }
      .records-clear-button:hover {
        color: #ffc5d6;
        border-color: rgba(255,112,155,.5);
      }
      .record-row.empty-record {
        grid-template-columns: 1fr;
        justify-items: center;
        color: #71809d;
        padding: 24px 12px;
      }
    `;
    document.head.appendChild(style);
  }
}

renderRecords = function (mode = '1P') {
  currentRecordMode = mode;
  ensureRealRecordsUI();

  const matches = loadSavedMatches().filter(match => match.mode === mode);
  const ranking = buildRanking(matches, mode);
  const list = $('recordList');
  if (!list) return;

  if (!ranking.length) {
    list.innerHTML = '<div class="record-row empty-record"><span>NENHUMA PARTIDA REGISTRADA AINDA</span></div>';
  } else {
    list.innerHTML = ranking.map((row, index) => `
      <div class="record-row ${index < 3 ? 'podium' : ''}">
        <b>${index + 1}</b>
        <span>${escapeRecordText(row.name)}</span>
        <small>${row.wins} vitória${row.wins === 1 ? '' : 's'}</small>
      </div>
    `).join('');
  }

  const streak = longestWinStreak(matches, mode);
  $('statStreak').textContent = `${streak} vitória${streak === 1 ? '' : 's'}`;
  $('statSpecial').textContent = mostUsedSpecial(matches, mode);
  $('statMatches').textContent = String(matches.length);
};

setRecordTab = function (mode, button) {
  qsa('.record-tabs .tab').forEach(tab => tab.classList.remove('active-tab'));
  button?.classList.add('active-tab');
  renderRecords(mode);
};

const baseActivateSpecialForRecords = activateSpecial;
activateSpecial = function (who) {
  const player = who === 'p1' ? game.p1 : game.p2;
  const before = player?.usesLeft ?? 0;
  baseActivateSpecialForRecords(who);
  const after = player?.usesLeft ?? before;
  if (after < before) currentMatchSpecialUses[who]++;
};

const baseStartMatchForRecords = startMatch;
startMatch = function () {
  currentMatchSpecialUses = { p1: 0, p2: 0 };
  game.__recordSaved = false;
  baseStartMatchForRecords();
};

const baseEndMatchForRecords = endMatch;
endMatch = function (winnerIndex) {
  saveFinishedMatch(winnerIndex);
  baseEndMatchForRecords(winnerIndex);
};

ensureRealRecordsUI();
renderRecords('1P');
