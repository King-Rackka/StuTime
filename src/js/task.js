function getTodayStr() {
  return formatDate(new Date());
}
function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDate(d);
}
function getDateStr(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return formatDate(d);
}
function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d - today) / 86400000);
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const label = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : diff === -1 ? 'Yesterday' : days[d.getDay()];
  return `${label}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── STATE ───
let tasks = [];
let selectedId = null;
let editingId = null;

// ─── LOCALSTORAGE ───
function loadTasks() {
  const saved = localStorage.getItem('stutime_tasks');
  if (saved) {
    tasks = JSON.parse(saved);
  } else {
    tasks = initDummyTasks();
    saveTasks();
  }
}
function saveTasks() {
  localStorage.setItem('stutime_tasks', JSON.stringify(tasks));
}

// ─── HELPER: time format conversion ───
// "13.00" → "13:00" (for input type="time")
function timeToInput(t) {
  if (!t) return '';
  return t.replace('.', ':');
}
// "13:00" → "13.00" (for storage)
function timeToStore(t) {
  if (!t) return '';
  return t.replace(':', '.');
}

// ─── RENDER ───
function render() {
  renderPinned();
  renderTaskList();
  renderDetail();
}

function renderPinned() {
  const pinned = tasks.filter(t => t.pinned);
  const bar = document.getElementById('pinned-bar');
  const list = document.getElementById('pinned-list');

  if (pinned.length === 0) {
    bar.classList.add('hidden');
    return;
  }
  bar.classList.remove('hidden');

  list.innerHTML = pinned.map(t => `
    <div onclick="selectTask(${t.id})" class="flex items-center gap-2 px-3 py-1.5 bg-[#222222] border border-[#FFD04E]/30 rounded-lg cursor-pointer hover:border-[#FFD04E] transition-all flex-shrink-0">
      <div class="w-1.5 h-1.5 rounded-full bg-[#FFD04E] flex-shrink-0"></div>
      <span class="text-xs font-semibold text-[#FFD04E] whitespace-nowrap">${t.time}</span>
      <span class="text-xs text-white whitespace-nowrap max-w-[160px] truncate">${t.title}</span>
    </div>
  `).join('');
}

function renderTaskList() {
  const container = document.getElementById('task-list-container');
  const today = getTodayStr();

  const grouped = {};
  tasks.forEach(t => {
    if (!grouped[t.date]) grouped[t.date] = [];
    grouped[t.date].push(t);
  });

  const sortedDates = Object.keys(grouped).sort();
  const reordered = [
    ...sortedDates.filter(d => d === today),
    ...sortedDates.filter(d => d > today).sort(),
    ...sortedDates.filter(d => d < today).sort().reverse(),
  ];

  const countEl = document.getElementById('task-count');
  if (countEl) countEl.textContent = tasks.length + (tasks.length === 1 ? ' schedule' : ' schedules');

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-48 text-center">
        <div class="text-3xl mb-3">📋</div>
        <div class="text-[#555] text-sm">No schedules yet.<br>Add your first one!</div>
      </div>`;
    return;
  }

  container.innerHTML = reordered.map(date => `
    <div class="mb-6 slide-in">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-2.5 h-2.5 rounded-full bg-[#FFD04E] flex-shrink-0"></div>
        <span class="text-sm font-bold text-white">${formatDateLabel(date)}</span>
      </div>
      <div class="ml-[5px] border-l-2 border-[#FFD04E] pl-4 flex flex-col gap-2">
        ${grouped[date].sort((a,b) => a.time.localeCompare(b.time)).map(t => `
          <div onclick="selectTask(${t.id})"
            class="task-card flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
              ${selectedId === t.id ? 'bg-[#FFD04E]/10 border-[#FFD04E]/50' : 'bg-[#222222] border-white/[0.07] hover:border-white/20'}
              ${t.done ? 'opacity-50' : ''}">
            <div class="flex flex-col items-center gap-1 flex-shrink-0 w-10">
              <span class="text-[11px] font-bold text-[#FFD04E]">${t.time}</span>
              ${t.pinned ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="#FFD04E"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>' : ''}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-white truncate ${t.done ? 'line-through' : ''}">${t.title}</div>
              <div class="text-xs text-[#666] truncate mt-0.5">${t.desc}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderDetail() {
  const panel = document.getElementById('detail-content');
  if (!selectedId) {
    panel.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-center py-20">
        <div class="text-5xl mb-4">👈</div>
        <div class="text-[#444] text-sm font-medium">Select a schedule to view details</div>
      </div>`;
    return;
  }

  const t = tasks.find(t => t.id === selectedId);
  if (!t) return;

  panel.innerHTML = `
    <div class="fade-in flex flex-col h-full">
      <div class="flex items-start justify-between gap-4 mb-6">
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-white leading-tight">${t.title}</h2>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button onclick="toggleDone(${t.id})"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${t.done ? 'bg-[#B8942A] border border-[#B8942A] text-[#111111]' : 'bg-[#FFD04E] border border-[#FFD04E] text-[#111111] hover:bg-[#B8942A] hover:border-[#B8942A]'}">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20,6 9,17 4,12"/></svg>
            ${t.done ? 'Restore' : 'Done'}
          </button>
          <button onclick="togglePin(${t.id})" title="${t.pinned ? 'Unpin' : 'Pin task'}"
            class="w-9 h-9 rounded-xl border flex items-center justify-center transition-all
              ${t.pinned ? 'bg-[#FFD04E]/15 border-[#FFD04E]/50 text-[#FFD04E]' : 'bg-[#1a1a1a] border-white/[0.07] text-[#555] hover:border-[#FFD04E] hover:text-[#FFD04E]'}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="${t.pinned ? '#FFD04E' : 'none'}" stroke="${t.pinned ? '#FFD04E' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-4 mb-6 p-4 bg-[#1a1a1a] border border-white/[0.07] rounded-xl">
        <div class="flex items-center gap-2 text-sm text-[#aaa]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD04E" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>${formatDateLabel(t.date)}</span>
        </div>
        <div class="w-px h-4 bg-white/10"></div>
        <div class="flex items-center gap-2 text-sm text-[#aaa]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD04E" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
          <span>${t.time}</span>
        </div>
      </div>

      <div class="mb-6 flex-1">
        <div class="text-xs font-bold text-[#555] uppercase tracking-widest mb-2">Description</div>
        <p class="text-sm text-[#bbb] leading-relaxed">${t.desc || '<span class="text-[#444] italic">No description</span>'}</p>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-4">
        <button onclick="openYoutube('${encodeURIComponent(t.title)}')"
          class="flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] border border-white/[0.07] rounded-xl hover:border-red-500/50 hover:bg-red-500/5 transition-all group">
          <svg width="20" height="20" viewBox="0 0 24 24" class="flex-shrink-0" fill="#ff0000"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white"/></svg>
          <div class="text-left">
            <div class="text-xs text-[#555] group-hover:text-[#888]">Tutorial</div>
            <div class="text-sm font-semibold text-white truncate max-w-[120px]">${t.title}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" class="ml-auto"><polyline points="9,18 15,12 9,6"/></svg>
        </button>
        <button onclick="openGoogle('${encodeURIComponent(t.title)}')"
          class="flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] border border-white/[0.07] rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
          <svg width="20" height="20" viewBox="0 0 24 24" class="flex-shrink-0"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          <div class="text-left">
            <div class="text-xs text-[#555] group-hover:text-[#888]">Tutorial</div>
            <div class="text-sm font-semibold text-white truncate max-w-[120px]">${t.title}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" class="ml-auto"><polyline points="9,18 15,12 9,6"/></svg>
        </button>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-3">
        <button onclick="openEditModal(${t.id})"
          class="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#FFD04E]/40 text-[#FFD04E] text-sm font-bold hover:bg-[#FFD04E]/10 hover:border-[#FFD04E] transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button onclick="startFocus(${t.id})"
          class="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FFD04E] text-[#111111] text-sm font-bold hover:bg-[#ffe066] transition-all">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="10,8 18,12 10,16"/></svg>
          Start Focus
        </button>
      </div>
      <div class="grid grid-cols-1 gap-3">
        <button onclick="deleteTask(${t.id})"
          class="flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/10 hover:border-red-500 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1V6"/></svg>
          Delete
        </button>
      </div>
    </div>
  `;
}

// ─── ACTIONS ───
function selectTask(id) {
  selectedId = id;
  render();
  if (typeof showDetail === 'function') showDetail();
}

function togglePin(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  t.pinned = !t.pinned;
  saveTasks();
  render();
}

function toggleDone(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  t.done = !t.done;
  saveTasks();
  render();
}

function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this schedule?')) return;
  tasks = tasks.filter(t => t.id !== id);
  selectedId = null;
  saveTasks();
  render();
}

function startFocus(id) {
  window.location.href = 'foctime.html';
}

function openYoutube(query) {
  window.open('https://www.youtube.com/results?search_query=' + query + '+tutorial', '_blank');
}

function openGoogle(query) {
  window.open('https://www.google.com/search?q=' + query + '+tutorial', '_blank');
}

// ─── ADD / EDIT MODAL ───
function openAddModal() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Add Schedule';
  document.getElementById('form-title').value = '';
  document.getElementById('form-desc').value = '';
  document.getElementById('form-date').value = getTodayStr();
  document.getElementById('form-time').value = '';
  document.getElementById('task-modal').classList.add('open');
}

function openEditModal(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'Edit Schedule';
  document.getElementById('form-title').value = t.title;
  document.getElementById('form-desc').value = t.desc;
  document.getElementById('form-date').value = t.date;
  document.getElementById('form-time').value = timeToInput(t.time);
  document.getElementById('task-modal').classList.add('open');
}

function closeModal() {
  document.getElementById('task-modal').classList.remove('open');
  editingId = null;
}

function submitTask() {
  const title = document.getElementById('form-title').value.trim();
  const desc = document.getElementById('form-desc').value.trim();
  const date = document.getElementById('form-date').value;
  const time = document.getElementById('form-time').value;

  if (!title || !date || !time) {
    alert('Title, date, and time are required!');
    return;
  }

  // Store with dot format "13.00"
  const formattedTime = timeToStore(time);

  if (editingId) {
    const t = tasks.find(t => t.id === editingId);
    t.title = title; t.desc = desc; t.date = date; t.time = formattedTime;
  } else {
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    tasks.push({ id: newId, title, desc, date, time: formattedTime, pinned: false, done: false });
    selectedId = newId;
  }

  saveTasks();
  closeModal();
  render();
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id');
  if (idParam) {
    selectedId = parseInt(idParam);
  }
  render();
  if (idParam) {
    setTimeout(() => {
      if (typeof showDetail === 'function') showDetail();
    }, 50);
  }
});