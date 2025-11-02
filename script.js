// 💰 Solde de départ
const SOLDE_DE_DEPART = 10000000; // 10 millions d'euros

// Fonction pour afficher le solde initial (si tu veux l'afficher quelque part)
function afficherSolde() {
  const soldeElement = document.getElementById("solde");
  if (soldeElement) {
    soldeElement.textContent = SOLDE_DE_DEPART.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    });
  }
}

// Appeler cette fonction si tu as un <span id="solde"></span> dans ton HTML
afficherSolde();

// ----- Application de gestion de portefeuille -----

const LS_KEY = 'mon_portefeuille_v1';
let transactions = JSON.parse(localStorage.getItem(LS_KEY) || '[]');

const txListEl = document.getElementById('txList');
const balanceEl = document.getElementById('balance');
const txForm = document.getElementById('txForm');
const filterCategory = document.getElementById('filterCategory');
const categorySelect = document.getElementById('category');

function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(transactions));
}

function formatAmount(a) {
  return Number(a).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function getCategories() {
  const set = new Set(['all']);
  transactions.forEach(t => set.add(t.category || 'Autre'));
  return Array.from(set);
}

function populateFilter() {
  filterCategory.innerHTML = '';
  getCategories().forEach(c => {
    const opt = document.createElement('option');
    opt.value = c === 'all' ? 'all' : c;
    opt.textContent = c;
    filterCategory.appendChild(opt);
  });
}

// ⚙️ Fonction mise à jour pour inclure le solde de départ
function updateBalance() {
  const sum = transactions.reduce((s, t) => s + Number(t.amount), SOLDE_DE_DEPART);
  balanceEl.textContent = formatAmount(sum);
}

function renderList() {
  txListEl.innerHTML = '';
  const selected = filterCategory.value === 'all' ? null : filterCategory.value;
  const list = transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  list.forEach((t, idx) => {
    if (selected && t.category !== selected) return;
    const li = document.createElement('li');

    const left = document.createElement('div');
    left.className = 'tx-left';
    left.innerHTML = `<div class="tx-desc">${t.desc}</div>
                      <div class="tx-cat">${t.category} — ${t.date || ''}</div>`;

    const amt = document.createElement('div');
    amt.className = 'tx-amount ' + (Number(t.amount) < 0 ? 'negative' : 'positive');
    amt.textContent = formatAmount(t.amount);

    const del = document.createElement('button');
    del.textContent = 'Supprimer';
    del.style.marginLeft = '10px';
    del.onclick = () => {
      if (confirm('Supprimer cette transaction ?')) {
        transactions.splice(transactions.indexOf(t), 1);
        save();
        refresh();
      }
    };

    li.appendChild(left);
    const rightWrap = document.createElement('div');
    rightWrap.style.display = 'flex';
    rightWrap.style.alignItems = 'center';
    rightWrap.appendChild(amt);
    rightWrap.appendChild(del);
    li.appendChild(rightWrap);

    txListEl.appendChild(li);
  });
}

function refresh() {
  populateFilter();
  updateBalance();
  renderList();
}

txForm.addEventListener('submit', e => {
  e.preventDefault();
  const desc = document.getElementById('desc').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value || new Date().toISOString().slice(0, 10);

  if (!desc || isNaN(amount)) {
    alert('Vérifie la description et le montant.');
    return;
  }

  transactions.push({ desc, amount, category, date });
  save();
  txForm.reset();
  refresh();
});

// Changement de filtre
filterCategory.addEventListener('change', renderList);

// Initialisation des catégories de base
function initCategoryOptions() {
  const existing = new Set();
  Array.from(categorySelect.options).forEach(o => existing.add(o.value));
  getCategories().forEach(c => {
    if (c === 'all') return;
    if (!existing.has(c)) {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      categorySelect.appendChild(opt);
    }
  });
}

(function boot() {
  initCategoryOptions();
  refresh();
})();
