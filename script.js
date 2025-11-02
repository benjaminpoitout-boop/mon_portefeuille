// Simulation dashboard - local only (not a real bank)
const SOLDE_DE_DEPART = 10000000; // 10 000 000 €
const LS_KEY = 'demo_portefeuille_v1';

let transactions = JSON.parse(localStorage.getItem(LS_KEY) || '[]');

// elements
const balanceEl = document.getElementById('balance');
const txListEl = document.getElementById('txList');
const txForm = document.getElementById('txForm');
const filterCategory = document.getElementById('filterCategory');
const categorySelect = document.getElementById('category');
const btnDeposit = document.getElementById('btnDeposit');
const btnWithdraw = document.getElementById('btnWithdraw');

function save(){ localStorage.setItem(LS_KEY, JSON.stringify(transactions)); }

function formatAmount(a){ return Number(a).toLocaleString('fr-FR', {style:'currency', currency:'EUR'}); }

function updateBalance(){
  const sum = transactions.reduce((s,t)=> s + Number(t.amount), SOLDE_DE_DEPART);
  balanceEl.textContent = formatAmount(sum);
}

// render
function renderList(){
  txListEl.innerHTML = '';
  const sel = filterCategory.value === 'all' ? null : filterCategory.value;
  const list = transactions.slice().sort((a,b)=> new Date(b.date) - new Date(a.date));
  list.forEach((t, idx)=>{
    if(sel && t.category !== sel) return;
    const li = document.createElement('li');
    li.className = 'tx-item';
    li.innerHTML = `
      <div class="tx-left">
        <div class="tx-desc">${t.desc}</div>
        <div class="tx-meta">${t.category} — ${t.date || ''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <div class="tx-amt ${Number(t.amount)<0?'negative':'positive'}">${formatAmount(t.amount)}</div>
        <button data-idx="${idx}" class="del">Supprimer</button>
      </div>
    `;
    txListEl.appendChild(li);
  });
  // attach delete handlers
  Array.from(document.querySelectorAll('.del')).forEach(btn=>{
    btn.onclick = (e)=>{
      const i = Number(e.target.dataset.idx);
      if(confirm('Supprimer cette transaction ?')){
        transactions.splice(i,1);
        save(); refresh();
      }
    }
  });
}

function populateFilter(){
  filterCategory.innerHTML = '';
  const set = new Set(['all']);
  transactions.forEach(t=> set.add(t.category || 'Autre'));
  Array.from(set).forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    filterCategory.appendChild(opt);
  });
}

function refresh(){ populateFilter(); updateBalance(); renderList(); }

// form submit
txForm.addEventListener('submit', e=>{
  e.preventDefault();
  const desc = document.getElementById('desc').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value || new Date().toISOString().slice(0,10);
  if(!desc || isNaN(amount)){ alert('Vérifie la description et le montant.'); return; }
  transactions.push({desc, amount, category, date});
  save(); txForm.reset(); refresh();
});

filterCategory.addEventListener('change', renderList);

// quick deposit / withdraw buttons
btnDeposit.addEventListener('click', ()=>{
  const a = parseFloat(prompt('Montant à déposer','1000'));
  if(isNaN(a)) return; transactions.push({desc:'Dépôt rapide', amount: Math.abs(a), category:'Dépôt', date: new Date().toISOString().slice(0,10)});
  save(); refresh();
});
btnWithdraw.addEventListener('click', ()=>{
  const a = parseFloat(prompt('Montant à retirer','1000'));
  if(isNaN(a)) return; transactions.push({desc:'Retrait rapide', amount: -Math.abs(a), category:'Retrait', date: new Date().toISOString().slice(0,10)});
  save(); refresh();
});

// bootstrap
(function boot(){
  // ensure transactions is an array
  if(!Array.isArray(transactions)) transactions = [];
  refresh();
})();