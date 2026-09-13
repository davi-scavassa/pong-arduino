const state={mode:'1P',p1:'PLAYER 1',p2:'PLAYER 2',difficulty:'MÉDIO',p1Special:'BOLA RÁPIDA',p2Special:'BOLA RÁPIDA',cpuSpecial:'DEFESA EXTRA'};
const specials=['BOLA RÁPIDA','RAQUETE MAIOR','DEFESA EXTRA'];
const icon=n=>n==='BOLA RÁPIDA'?'⚡ BOLA RÁPIDA':n==='RAQUETE MAIOR'?'↕ RAQUETE MAIOR':'🛡 DEFESA EXTRA';
const demo={
  '1P':[['1','Davi','15 vitórias'],['2','Lucas','11 vitórias'],['3','Pedro','8 vitórias'],['4','Ana','6 vitórias'],['5','João','4 vitórias']],
  '2P':[['1','Lucas','18 vitórias'],['2','Davi','16 vitórias'],['3','João','12 vitórias'],['4','Ana','9 vitórias'],['5','Pedro','7 vitórias']]
};
function screen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id)?.classList.add('active');window.scrollTo(0,0)}
function start1p(){state.mode='1P';state.p1='PLAYER 1';document.getElementById('p1name').value='';screen('name1p')}
function start2p(){state.mode='2P';state.p1='PLAYER 1';state.p2='PLAYER 2';document.getElementById('p1name2').value='';document.getElementById('p2name2').value='';screen('name2p')}
function name1p(){state.p1=document.getElementById('p1name').value.trim()||'PLAYER 1';document.getElementById('specialName').textContent=state.p1.toUpperCase();screen('difficulty')}
function names2p(){state.p1=document.getElementById('p1name2').value.trim()||'PLAYER 1';state.p2=document.getElementById('p2name2').value.trim()||'PLAYER 2';document.getElementById('p1title').textContent=state.p1.toUpperCase();document.getElementById('p2title').textContent=state.p2.toUpperCase();screen('specialP1')}
function select(button){button.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));button.classList.add('selected')}
function pickDiff(v,b){state.difficulty=v;select(b)}
function pickSpecial(p,v,b){if(p==='p1')state.p1Special=v;else state.p2Special=v;select(b)}
function roulette(){screen('roulette');const value=document.getElementById('rouletteValue'),status=document.getElementById('rouletteStatus'),go=document.getElementById('rouletteGo');go.classList.add('hidden');status.textContent='SORTEANDO...';let i=0;const t=setInterval(()=>{value.textContent=icon(specials[i%specials.length]);i++;if(i>18){clearInterval(t);state.cpuSpecial=specials[Math.floor(Math.random()*specials.length)];value.textContent=icon(state.cpuSpecial);status.textContent='ESPECIAL DEFINIDO';go.classList.remove('hidden')}},110)}
function fillReady(p2,s2){document.getElementById('r1').textContent=state.p1;document.getElementById('r2').textContent=p2;document.getElementById('rs1').textContent=icon(state.p1Special);document.getElementById('rs2').textContent=icon(s2);document.getElementById('readyMode').textContent=state.mode==='1P'?`1 PLAYER • ${state.difficulty}`:'2 PLAYERS • LOCAL';document.getElementById('r2type').textContent=state.mode==='1P'?'CPU':'PLAYER 2';screen('ready')}
function ready1p(){fillReady('CPU',state.cpuSpecial)}
function ready2p(){fillReady(state.p2,state.p2Special)}
function startGame(){document.getElementById('score1').textContent='0';document.getElementById('score2').textContent='0';const opp=state.mode==='1P'?'CPU':state.p2,s2=state.mode==='1P'?state.cpuSpecial:state.p2Special;document.getElementById('g1').textContent=state.p1;document.getElementById('g2').textContent=opp;document.getElementById('gs1').textContent=icon(state.p1Special);document.getElementById('gs2').textContent=icon(s2);document.getElementById('rightBtn').textContent=state.mode==='1P'?'AUTO':'B3';screen('game')}
function pauseGame(){screen('pause')}
function victory(){const opp=state.mode==='1P'?'CPU':state.p2;document.getElementById('winner').textContent=state.p1;document.getElementById('finalInfo').textContent=`${state.p1} venceu ${opp} • ${state.mode==='1P'?state.difficulty:'2 PLAYERS'} • ${icon(state.p1Special)}`;screen('victory')}
function records(mode,btn){document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('selected'));btn?.classList.add('selected');document.getElementById('ranking').innerHTML=demo[mode].map(r=>`<div class="rank"><b>${r[0]}</b><span>${r[1]}</span><small>${r[2]}</small></div>`).join('')}
records('1P');