const SOLDE_DE_DEPART = 10000000; // 10 millions
const LS_KEY = 'mon_portefeuille_v2';

// récupération des transactions existantes
let transactions = JSON.parse(localStorage.getItem(LS_KEY) || '[]');

const balanceEl = document.getElementById('balance');
const txListEl = document.getElementById('txList');
const txForm = document.getElementById('txForm');
const categorySelect = document.getElementById('category');
const filterCategory = document.getElementById('filterCategory');

function save(){
  localStorage.setItem(LS_KEY, JSON.stringify(transactions));
}

function formatAmount(a){
  return Number(a).toLocaleString('fr-FR', {style:'currency', currency:'EUR'});
}

// mise à jour du solde en tenant compte du solde de départ
function updateBalance(){
  const sum = transactions.reduce((s,t)=> s + Number(t.amount), SOLDE_DE_DEPART);
  balanceEl.textContent = formatAmount(sum);
}

// affichage des transactions
function renderList(){
  txListEl.innerHTML = '';
  const selected = filterCategory.value === 'all' ? null : filterCategory.value;
  const list = transactions.slice().sort((a,b)=> new Date(b.date) - new Date(a.date));
  list.forEach(t=>{
    if(selected && t.category !== selected) return;
    const li = document.createElement('li');

    const left = document.createElement('div');
    left.className='tx-left';
    left.innerHTML = `<div>${t.desc}</div><div>${t.category} — ${t.date || ''}</div>`;

    const amt = document.createElement('div');
    amt.className='tx-amount ' + (t.amount<0?'negative':'positive');
    amt.textContent = formatAmount(t.amount);

    const del = document.createElement('button');
    del.textContent='Supprimer';
    del.onclick=()=>{
      if(confirm('Supprimer cette transaction ?')){
        transactions.splice(transactions.indexOf(t),1);
        save();
        refresh();
      }
    }

    const rightWrap=document.createElement('div');
    rightWrap.style.display='flex';
    rightWrap.style.alignItems='center';
    rightWrap.appendChild(amt);
    rightWrap.appendChild(del);

    li.appendChild(left);
    li.appendChild(rightWrap);

    txListEl.appendChild(li);
  });
}

// filtre de catégorie
function populateFilter(){
  filterCategory.innerHTML='';
  const cats = new Set(['all']);
  transactions.forEach(t=>cats.add(t.category || 'Autre'));
  cats.forEach(c=>{
    const opt=document.createElement('option');
    opt.value=c;
    opt.textContent=c;
    filterCategory.appendChild(opt);
  });
}

function initCategoryOptions(){
  const existing=new Set();
  Array.from(categorySelect.options).forEach(o=>existing.add(o.value));
  transactions.forEach(t=>{
    if(!existing.has(t.category)){
      const opt=document.createElement('option');
      opt.value=t.category;
      opt.textContent=t.category;
      categorySelect.appendChild(opt);
    }
  });
}

function refresh(){
  populateFilter();
  updateBalance();
  renderList();
}

txForm.addEventListener('submit', e=>{
  e.preventDefault();
  const desc=document.getElementById('desc').value.trim();
  const amount=parseFloat(document.getElementById('amount').value);
  const category=document.getElementById('category').value;
  const date=document.getElementById('date').value || new Date().toISOString().slice(0,10);

  if(!desc || isNaN(amount)){
    alert('Vérifie la description et le montant.');
    return;
  }

  transactions.push({desc, amount, category, date});
  save();
  txForm.reset();
  refresh();
});

filterCategory.addEventListener('change', renderList);

// initialisation
(function boot(){
  initCategoryOptions();
  refresh();
})();
