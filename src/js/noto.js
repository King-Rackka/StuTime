// ─── LOCALSTORAGE ───
const STORAGE_KEY = 'stutime_notes';

function loadNotes() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    // Dummy data pertama kali
    const dummy = [
        { id: 1, title: 'Belajar UI/UX Design Gestalt', body: 'Hari ini aku belajar tentang prinsip Gestalt dalam desain UI/UX...', isFavorite: true },
    ];
    saveNotes(dummy);
    return dummy;
}

function saveNotes(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

let dummyNotes = loadNotes();
let activeNoteId = dummyNotes.length > 0 ? dummyNotes[0].id : null;

function renderNotesList() {
    const listContainer = document.getElementById('notes-list');
    listContainer.innerHTML = '';
    
    const sortedNotes = [...dummyNotes].sort((a, b) => b.isFavorite - a.isFavorite);
    
    sortedNotes.forEach(note => {
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
        <p class="text-[#B0B0B0] text-sm leading-relaxed line-clamp-3">${(note.body || '').replace(/<[^>]*>/g, '')}</p>
      </div>`;
    });
}

function selectNote(id) {
    activeNoteId = id;
    renderNotesList();
    
    const selectedNote = dummyNotes.find(n => n.id === id);
    if(selectedNote) {
        document.querySelector('.note-title').value = selectedNote.title;
        document.querySelector('.note-body').innerHTML = selectedNote.body;
        updateFavoriteIcon(selectedNote.isFavorite);
    }
    
    // 🔥 UX Magic: Kalau layarnya kecil (HP), tutup sidebar otomatis!
    if (window.innerWidth < 768) {
        closeNotesSidebar();
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
    const newId = dummyNotes.length > 0 ? Math.max(...dummyNotes.map(n => n.id)) + 1 : 1;
    const newNote = { id: newId, title: "Catatan Baru", body: "", isFavorite: false };
    dummyNotes.unshift(newNote);
    saveNotes(dummyNotes);  // <-- ganti ini
    
    selectNote(newId);
    document.querySelector('.note-title').focus();
    document.querySelector('.note-title').select();
    
    if (window.innerWidth < 768) {
        closeNotesSidebar();
    }
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

window.addEventListener('click', function (e) {
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

document.addEventListener('mousedown', function (e) {
    const btn = e.target.closest('button');
    if (btn && (btn.hasAttribute('data-command') || btn.id === 'align-dropdown-btn')) {
        e.preventDefault();
    }
});

function customAction(action) {
    if (action === 'columns') alert('Fitur kolom belum diaktifkan.');
}

// ─── INIT ───
window.addEventListener('DOMContentLoaded', function () {
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

// --- FUNGSI PINDAH TAB (Notes <-> Journal) ---
// --- FUNGSI PINDAH TAB (Versi Aman untuk Ukuran) ---
function switchMainTab(tabName) {
    const tabNotes = document.getElementById('tab-notes');
    const tabDafpus = document.getElementById('tab-dafpus');
    const btnNotes = document.getElementById('btn-tab-notes');
    const btnDafpus = document.getElementById('btn-tab-dafpus');

    // HANYA GANTI WARNA, JANGAN SENTUH UKURAN (w-[500px])
    const activeStyle = ['bg-[#FFD04E]', 'text-[#1E1E20]', 'font-semibold'];
    const inactiveStyle = ['bg-transparent', 'text-[#FFD04E]', 'font-normal', 'hover:bg-[#FFD15C]/10'];

    if (tabName === 'notes') {
        tabNotes.classList.remove('hidden'); tabNotes.classList.add('flex');
        tabDafpus.classList.add('hidden'); tabDafpus.classList.remove('flex');

        btnNotes.classList.remove(...inactiveStyle); btnNotes.classList.add(...activeStyle);
        btnDafpus.classList.remove(...activeStyle); btnDafpus.classList.add(...inactiveStyle);
    } else if (tabName === 'dafpus') {
        tabNotes.classList.add('hidden'); tabNotes.classList.remove('flex');
        tabDafpus.classList.remove('hidden'); tabDafpus.classList.add('flex');

        btnDafpus.classList.remove(...inactiveStyle); btnDafpus.classList.add(...activeStyle);
        btnNotes.classList.remove(...activeStyle); btnNotes.classList.add(...inactiveStyle);
    }
}
// --- STATE MANAGEMENT DAFPUS ---
let currentSourceType = 'book';
let currentFormat = 'APA';
let savedDafpus = JSON.parse(localStorage.getItem('dataDafpusReza')) || [];
// --- KONFIGURASI FORM INPUT DAFPUS ---
const FIELDS = {
    book: [
        { id: 'author', label: 'Author(s)', placeholder: 'e.g. John Doe' },
        { id: 'title', label: 'Book Title', placeholder: 'e.g. Introduction to Algorithms' },
        { id: 'year', label: 'Year', placeholder: 'e.g. 2023' },
        { id: 'city', label: 'City', placeholder: 'e.g. Jakarta' },
        { id: 'publisher', label: 'Publisher', placeholder: 'e.g. Gramedia' },
        { id: 'edition', label: 'Edition (optional)', placeholder: 'e.g. 3rd' },
    ],
    journal: [
        { id: 'author', label: 'Author(s)', placeholder: 'e.g. Jane Smith' },
        { id: 'title', label: 'Article Title', placeholder: 'e.g. Study on Productivity' },
        { id: 'journal', label: 'Journal Name', placeholder: 'e.g. Jurnal Pendidikan' },
        { id: 'year', label: 'Year', placeholder: 'e.g. 2023' },
        { id: 'volume', label: 'Volume', placeholder: 'e.g. 5' },
        { id: 'issue', label: 'Issue/Number', placeholder: 'e.g. 2' },
        { id: 'pages', label: 'Pages', placeholder: 'e.g. 100-115' },
    ],
    website: [
        { id: 'author', label: 'Author(s)', placeholder: 'e.g. Admin Kompas' },
        { id: 'title', label: 'Page Title', placeholder: 'e.g. Cara Belajar Efektif' },
        { id: 'site', label: 'Website Name', placeholder: 'e.g. Kompas.com' },
        { id: 'year', label: 'Year Published', placeholder: 'e.g. 2023' },
        { id: 'url', label: 'URL', placeholder: 'https://...' },
        { id: 'accessed', label: 'Date Accessed', placeholder: 'e.g. 13 March 2026' }, // Aku update dikit ke hari ini ya!
    ]
};

// --- 1. FUNGSI GANTI SUMBER (Book/Journal/Website) ---
function setSourceType(type, btn) {
    currentSourceType = type;

    // Siapkan daftar warna untuk status Aktif dan Tidak Aktif
    const activeStyles = ['border-[#FFD15C]', 'bg-[#FFD15C]', 'text-[#1E1E20]'];
    const inactiveStyles = ['border-gray-600', 'bg-transparent', 'text-gray-400', 'hover:text-white'];

    // Reset semua tombol source-type jadi abu-abu (Tidak Aktif)
    document.querySelectorAll('.source-type-btn').forEach(b => {
        b.classList.remove(...activeStyles);
        b.classList.add(...inactiveStyles);
    });

    // Ubah tombol yang sedang diklik jadi kuning (Aktif)
    btn.classList.remove(...inactiveStyles);
    btn.classList.add(...activeStyles);

    // Tampilkan kolom input yang sesuai
    renderInputFields();
}

// --- 2. FUNGSI GANTI FORMAT (APA/IEEE/Chicago) ---
function setFormat(format, btn) {
    currentFormat = format;

    // Format punya style aktif yang sedikit beda (bg gelap, teks kuning)
    const activeStyles = ['border-[#FFD15C]', 'bg-[#2A2A2D]', 'text-[#FFD15C]'];
    const inactiveStyles = ['border-gray-600', 'bg-transparent', 'text-gray-400', 'hover:text-white'];

    // Reset semua tombol format jadi abu-abu (Tidak Aktif)
    document.querySelectorAll('.fmt-btn').forEach(b => {
        b.classList.remove(...activeStyles);
        b.classList.add(...inactiveStyles);
    });

    // Ubah tombol yang sedang diklik jadi kuning (Aktif)
    btn.classList.remove(...inactiveStyles);
    btn.classList.add(...activeStyles);
}

// --- 3. FUNGSI MENGGAMBAR KOLOM INPUT (Pakai Data FIELDS) ---
// --- 3. FUNGSI MENGGAMBAR KOLOM INPUT (UPDATE MULTI-AUTHOR) ---
function renderInputFields() {
    const container = document.getElementById('inputFields');
    let html = '';

    const createInput = (id, label, placeholder) => {
        // KHUSUS UNTUK AUTHOR: Kita bikin dinamis ada tombol '+' nya
        if (id === 'author') {
            return `
            <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                    <label class="block text-[#888888] text-[11px] font-bold tracking-widest uppercase">${label}</label>
                    <button type="button" onclick="addAuthorField()" class="text-[#FFD15C] text-[10px] font-bold tracking-wider hover:text-[#1E1E20] hover:bg-[#FFD15C] transition bg-[#FFD15C]/10 px-3 py-1 rounded-md border border-[#FFD15C]/30 cursor-pointer">
                        <i class="fa-solid fa-plus"></i> ADD AUTHOR
                    </button>
                </div>
                <div id="author-container" class="flex flex-col gap-2">
                    <div class="flex gap-2 author-row">
                        <input type="text" class="daf-author-input w-full bg-[#222222] border border-white/[0.07] rounded-lg px-4 py-3 text-[#F0F0F0] text-sm outline-none focus:border-[#FFD15C] transition-all" placeholder="${placeholder}">
                    </div>
                </div>
            </div>
            `;
        }

        // UNTUK KOLOM BIASA (Title, Year, dll)
        return `
        <div class="mb-4">
            <label class="block text-[#888888] text-[11px] font-bold tracking-widest mb-2 uppercase">${label}</label>
            <input type="text" id="daf-${id}" placeholder="${placeholder}" class="w-full bg-[#222222] border border-white/[0.07] rounded-lg px-4 py-3 text-[#F0F0F0] text-sm outline-none focus:border-[#FFD15C] transition-all">
        </div>
        `;
    };

    FIELDS[currentSourceType].forEach(field => {
        html += createInput(field.id, field.label, field.placeholder);
    });

    container.innerHTML = html;
}
// --- FUNGSI KLIK TAMBAH AUTHOR ---
function addAuthorField() {
    const container = document.getElementById('author-container');
    const rows = container.querySelectorAll('.author-row');

    // Cegah kalau udah 5 author
    if (rows.length >= 5) {
        alert('Maksimal 5 author ya!');
        return;
    }

    // Buat kotak baru + tombol hapus
    const div = document.createElement('div');
    div.className = 'flex gap-2 author-row';
    div.innerHTML = `
        <input type="text" class="daf-author-input w-full bg-[#222222] border border-white/[0.07] rounded-lg px-4 py-3 text-[#F0F0F0] text-sm outline-none focus:border-[#FFD15C] transition-all" placeholder="Author ${rows.length + 1} (e.g. Mary Brown)">
        <button type="button" onclick="removeAuthorField(this)" class="bg-red-500/10 text-red-500 border border-red-500/20 px-4 rounded-lg hover:bg-red-500 hover:text-white transition cursor-pointer flex-shrink-0">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;
    container.appendChild(div);
}

// --- FUNGSI HAPUS AUTHOR ---
function removeAuthorField(btn) {
    // Hapus baris kotak tempat tombol ini berada
    btn.closest('.author-row').remove();
}
// --- HELPER FUNGSI APA (Karena di kodemu dipanggil formatAuthorAPA) ---

//fungsi bat nama 
// Fungsi dasar untuk memecah nama (First, Middle, Last)
function parseAuthorName(fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return { last: parts[0], first: '', middle: '' }; // Kalau namanya cuma 1 kata

    const last = parts.pop(); // Ambil kata paling belakang
    const first = parts.shift(); // Ambil kata paling depan
    const middle = parts.join(' '); // Sisa kata di tengah (kalau ada)

    return { last, first, middle };
}

// Format APA: Fachri, R. N.
function formatAuthorAPA(authorStr) {
    const { last, first, middle } = parseAuthorName(authorStr);
    if (!first) return last;

    // Singkat nama depan
    let initials = first.charAt(0).toUpperCase() + '.';

    // Singkat nama tengah (kalau namanya panjang banget kayak John Fitzgerald Kennedy)
    if (middle) {
        const middleInitials = middle.split(' ').map(n => n.charAt(0).toUpperCase() + '.').join(' ');
        initials += ' ' + middleInitials;
    }
    return `${last}, ${initials}`;
}

// Format IEEE & Chicago: Fachri, Reza N.
function formatAuthorChicago(authorStr) {
    const { last, first, middle } = parseAuthorName(authorStr);
    if (!first) return last;

    let result = `${last}, ${first}`;
    if (middle) {
        const middleInitials = middle.split(' ').map(n => n.charAt(0).toUpperCase() + '.').join(' ');
        result += ' ' + middleInitials;
    }
    return result;
}

// --- Format IEEE: A. S. Tanenbaum ---
function formatAuthorIEEE(authorStr) {
    const { last, first, middle } = parseAuthorName(authorStr);
    if (!first) return last; // Kalau cuma 1 kata

    let initials = first.charAt(0).toUpperCase() + '.';
    if (middle) {
        const middleInitials = middle.split(' ').map(n => n.charAt(0).toUpperCase() + '.').join(' ');
        initials += ' ' + middleInitials;
    }

    // Gabungkan inisial di depan, lalu spasi, lalu nama belakang
    return `${initials} ${last}`;
}
// --- Format Harvard: Fachri, R. N. ---
// (Mirip APA, tapi nanti cara gabungin banyak authornya beda)
function formatAuthorHarvard(authorStr) {
    const { last, first, middle } = parseAuthorName(authorStr);
    if (!first) return last;
    
    let initials = first.charAt(0).toUpperCase() + '.';
    if (middle) {
        const middleInitials = middle.split(' ').map(n => n.charAt(0).toUpperCase() + '.').join(' ');
        initials += ' ' + middleInitials;
    }
    return `${last}, ${initials}`;
}
// ==========================================
// FUNGSI PENGGABUNG BANYAK AUTHOR (MAX 5)
// ==========================================
function processMultipleAuthors(rawAuthors, formatType) {
    const delimiter = rawAuthors.includes(';') ? ';' : ',';
    let authorsArray = rawAuthors.split(delimiter).map(a => a.trim()).filter(a => a);
    
    if (authorsArray.length > 5) authorsArray = authorsArray.slice(0, 5);
    if (authorsArray.length === 0) return '';
    
    let formattedAuthors = authorsArray.map(author => {
        if (formatType === 'APA') return formatAuthorAPA(author);
        if (formatType === 'IEEE') return formatAuthorIEEE(author);
        if (formatType === 'Harvard') return formatAuthorHarvard(author); // 🔥 TAMBAHAN HARVARD
        return formatAuthorChicago(author);
    });

    if (formattedAuthors.length === 1) return formattedAuthors[0];

    if (formattedAuthors.length === 2) {
        if (formatType === 'APA') return `${formattedAuthors[0]}, & ${formattedAuthors[1]}`;
        // Harvard dan yang lain pakai 'and' tanpa koma di antara 2 orang
        return `${formattedAuthors[0]} and ${formattedAuthors[1]}`;
    }

    const lastAuthor = formattedAuthors.pop(); 
    const joinedFirst = formattedAuthors.join(', '); 
    
    if (formatType === 'APA') {
        return `${joinedFirst}, & ${lastAuthor}`;
    } else if (formatType === 'Harvard') {
        // 🔥 Harvard: A, B and C (Tanpa koma sebelum and)
        return `${joinedFirst} and ${lastAuthor}`;
    } else {
        // Chicago/IEEE: A, B, and C (Pakai koma Oxford)
        return `${joinedFirst}, and ${lastAuthor}`;
    }
}

// 2. FUNGSI GENERATE SITASI (UPDATE WEBSITE)
// ==========================================
function generate() {
    const getVal = (id) => document.getElementById('daf-' + id)?.value.trim() || '';

    // --- KHUSUS AUTHOR: Kumpulkan isi semua kotak jadi satu ---
    const getAuthorsValue = () => {
        const inputs = document.querySelectorAll('.daf-author-input');
        let vals = [];
        inputs.forEach(inp => {
            if (inp.value.trim() !== '') vals.push(inp.value.trim());
        });
        // Gabungkan dengan titik koma, biar gampang dipecah sama mesin kita
        return vals.join('; ');
    };

    const v = {};
    FIELDS[currentSourceType].forEach(f => {
        if (f.id === 'author') {
            v[f.id] = getAuthorsValue(); // Pakai fungsi khusus author
        } else {
            v[f.id] = getVal(f.id); // Pakai value biasa
        }
    });

    if (!v.author || !v.title) {
        alert('⚠️ Author and Title are required');
        return;
    }

    let result = '';
    const format = currentFormat;
    const sourceType = currentSourceType;

    // ... (kode bagian atas generate() tetap sama) ...

    if (format === 'APA') {
        const auth = processMultipleAuthors(v.author, 'APA');
        if (sourceType === 'book') result = `${auth} (${v.year||'n.d.'}). *${v.title}*${v.edition ? ` (${v.edition} ed.)` : ''}. ${v.city ? v.city + ': ' : ''}${v.publisher || ''}.`;
        else if (sourceType === 'journal') result = `${auth} (${v.year||'n.d.'}). ${v.title}. *${v.journal}*, *${v.volume}*(${v.issue}), ${v.pages}.`;
        else result = `${auth} (${v.year||'n.d.'}). ${v.title}. ${v.site}. Retrieved from ${v.url}`;
        
    } else if (format === 'IEEE') {
        const auth = processMultipleAuthors(v.author, 'IEEE');
        if (sourceType === 'book') result = `[1] ${auth}, *${v.title}*${v.edition ? `, ${v.edition} ed.` : ''}. ${v.city ? v.city + ': ' : ''}${v.publisher || ''}, ${v.year||'n.d.'}.`;
        else if (sourceType === 'journal') result = `[1] ${auth}, "${v.title}," *${v.journal}*, vol. ${v.volume}, no. ${v.issue}, pp. ${v.pages}, ${v.year||'n.d.'}.`;
        else result = `[1] ${auth}, "${v.title}," ${v.site}, ${v.year||'n.d.'}. [Online]. Available: ${v.url}`;
        
    // 🔥 INI DIA BLOK HARVARD YANG BARU
    } else if (format === 'Harvard') {
        const auth = processMultipleAuthors(v.author, 'Harvard');
        
        if (sourceType === 'book') {
            // Format: Smith, J., 2020. *Artificial Intelligence Basics*. 2nd ed. New York: Springer.
            result = `${auth}, ${v.year||'n.d.'}. *${v.title}*.${v.edition ? ` ${v.edition} ed.` : ''} ${v.city ? v.city + ': ' : ''}${v.publisher || ''}.`;
            
        } else if (sourceType === 'journal') {
            // Format: Smith, J., 2020. 'Judul Artikel', *Nama Jurnal*, 5(2), pp. 10-20.
            result = `${auth}, ${v.year||'n.d.'}. ${v.title}, *${v.journal}*, ${v.volume}(${v.issue}), pp. ${v.pages}.`;
            
        } else {
            // Format Website: Admin, 2023. *Judul Web*. Available at: https... (Accessed: 17 March 2026).
           result = `${auth}, ${v.year||'n.d.'}. *${v.title}*. ${v.site}. Available at: ${v.url} (Accessed: ${v.accessed}).`;
        }
        
    } else { // Chicago
        const auth = processMultipleAuthors(v.author, 'Chicago');
        if (sourceType === 'book') result = `${auth}. *${v.title}*${v.edition ? `, ${v.edition} ed.` : ''}. ${v.city ? v.city + ': ' : ''}${v.publisher || ''}, ${v.year||'n.d.'}.`;
        else if (sourceType === 'journal') result = `${auth}. "${v.title}." *${v.journal}* ${v.volume}, no. ${v.issue} (${v.year||'n.d.'}): ${v.pages}.`;
        else result = `${auth}. "${v.title}." ${v.site}. Accessed ${v.accessed}. ${v.url}`;
    }

    // ... (kode replace bintang ke italic tetap di bawah) ...

    // Mengubah tanda bintang menjadi cetak miring
    const finalHTML = result.replace(/\*(.*?)\*/g, '<i>$1</i>');
    document.getElementById('dafpusResult').innerHTML = finalHTML;
}



// --- 5. FUNGSI COPY, SAVE, & CLEAR ---
function copyResult() {
    const text = document.getElementById('dafpusResult').innerText;
    if (text.includes('Fill in the form')) return;

    navigator.clipboard.writeText(text);
    alert('Sitasi disalin ke clipboard!');
}

function clearResult() {
    document.getElementById('dafpusResult').innerHTML = 'Fill in the form and click Generate to see your bibliography entry here.';
    renderInputFields(); // Kosongkan form juga
}

function saveResult() {
    const resultBox = document.getElementById('dafpusResult');
    const text = resultBox.innerHTML;

    // Cegah nyimpen teks kosong atau teks default
    if (text.includes('Fill in the form') || text.trim() === '') {
        alert('Belum ada sitasi yang digenerate untuk disimpan!');
        return;
    }

    // Masukkan ke array dan simpan ke Local Storage
    savedDafpus.push(text);
    localStorage.setItem('dataDafpusReza', JSON.stringify(savedDafpus));

    // Langsung render ulang biar muncul di bawah
    renderSavedEntries();
}

function renderSavedEntries() {
    const container = document.getElementById('savedEntries');

    // Kalau kosong, tampilkan teks default
    if (!savedDafpus || savedDafpus.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 py-5"><p>No saved entries yet</p></div>';
        return;
    }

    // Gunakan full Tailwind CSS (Hapus class saved-entry dan del-btn yang lama)
    container.innerHTML = savedDafpus.map((entry, index) => `
                        <div class="bg-[#2A2A2D] border border-gray-600 rounded-xl p-4 mb-3 flex gap-4 items-start">
                            <div class="flex-1 text-sm text-white leading-relaxed">${entry}</div>
                            <button type="button" onclick="deleteSavedEntry(${index})" class="text-gray-400 hover:text-red-500 transition shrink-0 mt-1 cursor-pointer">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    `).join('');
}

function deleteSavedEntry(index) {
    // Hapus 1 item pada posisi index tersebut
    savedDafpus.splice(index, 1);

    // Update Local Storage dengan data terbaru
    localStorage.setItem('dataDafpusReza', JSON.stringify(savedDafpus));

    // Render ulang layarnya
    renderSavedEntries();
}

function exportAll() {
    if (savedDafpus.length === 0) {
        alert("Belum ada daftar pustaka yang disimpan!"); return;
    }

    // Ubah format HTML (<i>) ke teks biasa untuk file .txt
    const plainTextContent = savedDafpus.map(entry => entry.replace(/<\/?i>/g, '')).join('\n\n');

    const blob = new Blob([plainTextContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Daftar_Pustaka.txt";
    link.click();
}

// Panggil fungsi render pertama kali saat website dibuka
window.addEventListener('DOMContentLoaded', () => {
    renderInputFields();

    switchMainTab('notes');
    if (savedDafpus.length > 0) {
        renderSavedEntries();
    }
});
const quotes = [
      { emoji:'💪', quote:'"The secret of getting ahead is getting started."', author:'— Mark Twain' },
      { emoji:'🔥', quote:'"Focus on being productive instead of busy."', author:'— Tim Ferriss' },
      { emoji:'🎯', quote:'"Do the hard jobs first. The easy jobs will take care of themselves."', author:'— Dale Carnegie' },
      { emoji:'⚡', quote:'"You don\'t have to be great to start, but you have to start to be great."', author:'— Zig Ziglar' },
      { emoji:'🌟', quote:'"The way to get started is to quit talking and begin doing."', author:'— Walt Disney' },
      { emoji:'🧠', quote:'"It always seems impossible until it is done."', author:'— Nelson Mandela' },
    ];
 function openMotivate() {
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      document.getElementById('motivate-emoji').textContent = q.emoji;
      document.getElementById('motivate-quote').textContent = q.quote;
      document.getElementById('motivate-author').textContent = q.author;
      const m = document.getElementById('motivate-modal');
      m.classList.remove('opacity-0','pointer-events-none');
      m.classList.add('opacity-100');
      document.getElementById('motivate-box').classList.remove('scale-95');
      document.getElementById('motivate-box').classList.add('scale-100');
    }
    function closeMotivate(e) {
      if (!e || e.target === document.getElementById('motivate-modal')) {
        const m = document.getElementById('motivate-modal');
        m.classList.add('opacity-0','pointer-events-none');
        m.classList.remove('opacity-100');
        document.getElementById('motivate-box').classList.add('scale-95');
        document.getElementById('motivate-box').classList.remove('scale-100');
      }
    }

//mobile
function openHamburger() {
      const d = document.getElementById('hamburger-drawer');
      const b = document.getElementById('hamburger-box');
      d.classList.remove('opacity-0','pointer-events-none');
      d.classList.add('opacity-100');
      b.classList.remove('-translate-x-full');
      b.classList.add('translate-x-0');
    }
    function closeHamburger() {
      const d = document.getElementById('hamburger-drawer');
      const b = document.getElementById('hamburger-box');
      d.classList.add('opacity-0','pointer-events-none');
      d.classList.remove('opacity-100');
      b.classList.add('-translate-x-full');
      b.classList.remove('translate-x-0');
    }
    function openNotesSidebar() {
    document.getElementById('notes-sidebar').classList.remove('-translate-x-full');
    document.getElementById('notes-overlay').classList.remove('hidden');
}

function closeNotesSidebar() {
    document.getElementById('notes-sidebar').classList.add('-translate-x-full');
    document.getElementById('notes-overlay').classList.add('hidden');
}