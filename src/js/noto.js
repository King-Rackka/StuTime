// ─── LOCALSTORAGE ───
const STORAGE_KEY = 'stutime_notes';

function loadNotes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  // Dummy data pertama kali
  const dummy = [
    { id:1, title:'Pergi ke pasar membeli ikan', body:'Pergi ke pasar membeli ikan, cakep...', isFavorite:false },
    { id:2, title:'Belajar UI/UX Design Gestalt', body:'Hari ini aku belajar tentang prinsip Gestalt dalam desain UI/UX...', isFavorite:true },
    { id:3, title:'Belajar UI/UX Design Gestalt', body:'Hari ini aku belajar tentang prinsip Gestalt dalam desain UI/UX...', isFavorite:true },
    { id:4, title:'Belajar UI/UX Design Gestalt', body:'Hari ini aku belajar tentang prinsip Gestalt dalam desain UI/UX...', isFavorite:true },
  ];
  saveNotes(dummy);
  return dummy;
}

function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// ─── STATE ───
let dummyNotes = loadNotes();
let activeNoteId = dummyNotes.length > 0 ? dummyNotes[0].id : null;

// ─── RENDER NOTES LIST ───
function renderNotesList() {
  const listContainer = document.getElementById('notes-list');
  listContainer.innerHTML = '';
  dummyNotes.forEach(note => {
    const isActive = note.id === activeNoteId;
    const cardClasses = isActive
      ? 'border-l-4 border-[#FFD15C] bg-[#3A3A3F]'
      : 'border-l-4 border-transparent bg-[#2A2A2D] hover:bg-[#3A3A3F]';
    const favoriteIcon = note.isFavorite
      ? '<i class="fa-solid fa-star text-[#FFD15C] text-sm shrink-0 mt-1"></i>'
      : '';
    listContainer.innerHTML += `
      <div onclick="selectNote(${note.id})" class="cursor-pointer p-4 rounded-lg transition duration-200 flex-shrink-0 ${cardClasses}">
        <div class="flex justify-between items-start mb-2 gap-2">
          <h3 class="text-white font-bold text-lg truncate">${note.title}</h3>
          ${favoriteIcon}
        </div>
        <p class="text-[#B0B0B0] text-sm leading-relaxed line-clamp-3">${(note.body||'').replace(/<[^>]*>/g,'')}</p>
      </div>`;
  });
}

function selectNote(id) {
  activeNoteId = id;
  renderNotesList();
  const note = dummyNotes.find(n => n.id === id);
  if (note) {
    document.querySelector('.note-title').value = note.title;
    document.querySelector('.note-body').innerHTML = note.body;
    updateFavoriteIcon(note.isFavorite);
  }
}

function saveNote() {
  if (!activeNoteId) return;
  const title = document.querySelector('.note-title').value;
  const body = document.querySelector('.note-body').innerHTML;
  const idx = dummyNotes.findIndex(n => n.id === activeNoteId);
  if (idx !== -1) {
    dummyNotes[idx].title = title;
    dummyNotes[idx].body = body;
    saveNotes(dummyNotes); // ← simpan ke localStorage
    renderNotesList();
    const btn = document.querySelector('button[onclick="saveNote()"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersimpan!';
    setTimeout(() => btn.innerHTML = orig, 1500);
  }
}

function deleteNote() {
  if (!activeNoteId) return;
  if (!confirm('Ingin menghapus catatan ini?')) return;
  dummyNotes = dummyNotes.filter(n => n.id !== activeNoteId);
  saveNotes(dummyNotes); // ← simpan ke localStorage
  if (dummyNotes.length > 0) {
    selectNote(dummyNotes[0].id);
  } else {
    activeNoteId = null;
    document.querySelector('.note-title').value = '';
    document.querySelector('.note-body').innerHTML = '';
    renderNotesList();
  }
}

function createNewNote() {
  const newId = Date.now();
  const newNote = { id:newId, title:'Catatan Baru', body:'', isFavorite:false };
  dummyNotes.unshift(newNote);
  saveNotes(dummyNotes); // ← simpan ke localStorage
  activeNoteId = newId;
  renderNotesList();
  const titleInput = document.querySelector('.note-title');
  const bodyInput = document.querySelector('.note-body');
  titleInput.value = newNote.title;
  bodyInput.innerHTML = '';
  updateFavoriteIcon(false);
  titleInput.focus();
  titleInput.select();
}

function toggleFavorite() {
  if (!activeNoteId) return;
  const idx = dummyNotes.findIndex(n => n.id === activeNoteId);
  if (idx !== -1) {
    dummyNotes[idx].isFavorite = !dummyNotes[idx].isFavorite;
    saveNotes(dummyNotes); // ← simpan ke localStorage
    renderNotesList();
    updateFavoriteIcon(dummyNotes[idx].isFavorite);
  }
}

function updateFavoriteIcon(isFav) {
  const icon = document.getElementById('fav-icon');
  if (!icon) return;
  icon.className = isFav ? 'fa-solid fa-star' : 'fa-regular fa-star';
  icon.style.color = isFav ? '#FFD15C' : '';
}

// ─── FORMAT TEXT ───
function formatText(command) {
  document.querySelector('.note-body').focus();
  document.execCommand(command, false, null);
  checkActiveButtons();
}

function toggleDropdown(menuId) {
  document.getElementById(menuId).classList.toggle('hidden');
}

window.addEventListener('click', function(e) {
  const alignBtn = document.getElementById('align-dropdown-btn');
  const alignMenu = document.getElementById('align-menu');
  if (alignBtn && alignMenu) {
    if (!alignBtn.contains(e.target) && !alignMenu.contains(e.target)) {
      alignMenu.classList.add('hidden');
    }
  }
});

function checkActiveButtons() {
  document.querySelectorAll('button[data-command]').forEach(btn => {
    const cmd = btn.getAttribute('data-command');
    btn.classList.toggle('active-btn', document.queryCommandState(cmd));
  });
  const alignIcon = document.getElementById('current-align-icon');
  if (alignIcon) {
    if (document.queryCommandState('justifyCenter')) alignIcon.className = 'fa-solid fa-align-center';
    else if (document.queryCommandState('justifyRight')) alignIcon.className = 'fa-solid fa-align-right';
    else if (document.queryCommandState('justifyFull')) alignIcon.className = 'fa-solid fa-align-justify';
    else alignIcon.className = 'fa-solid fa-align-left';
  }
}

document.addEventListener('mousedown', function(e) {
  const btn = e.target.closest('button');
  if (btn && (btn.hasAttribute('data-command') || btn.id === 'align-dropdown-btn')) {
    e.preventDefault();
  }
});

function customAction(action) {
  if (action === 'columns') alert('Fitur kolom belum diaktifkan.');
}

// ─── INIT ───
window.addEventListener('DOMContentLoaded', function() {
  const editor = document.querySelector('.note-body');
  renderNotesList();
  if (activeNoteId) selectNote(activeNoteId);
  editor.focus();
  checkActiveButtons();

  editor.addEventListener('keyup', checkActiveButtons);
  editor.addEventListener('mouseup', checkActiveButtons);

  // Init tab
  switchMainTab('notes');
  if (savedDafpus && savedDafpus.length > 0) renderSavedEntries();
  renderInputFields();
});