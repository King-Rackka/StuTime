const quotes = [
    { emoji: '💪', quote: '"The secret of getting ahead is getting started."', author: '— Mark Twain' },
    { emoji: '🔥', quote: '"Focus on being productive instead of busy."', author: '— Tim Ferriss' },
    { emoji: '🎯', quote: '"Do the hard jobs first. The easy jobs will take care of themselves."', author: '— Dale Carnegie' },
    { emoji: '⚡', quote: '"You don\'t have to be great to start, but you have to start to be great."', author: '— Zig Ziglar' },
    { emoji: '🌟', quote: '"The way to get started is to quit talking and begin doing."', author: '— Walt Disney' },
    { emoji: '🧠', quote: '"It always seems impossible until it is done."', author: '— Nelson Mandela' },
];

function openMotivate() {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('modal-emoji').textContent = q.emoji;
    document.getElementById('modal-quote').textContent = q.quote;
    document.getElementById('modal-author').textContent = q.author;
    const m = document.getElementById('modal');
    m.classList.remove('opacity-0', 'pointer-events-none'); m.classList.add('opacity-100');
    document.getElementById('modal-box').classList.remove('scale-95'); document.getElementById('modal-box').classList.add('scale-100');
}
function closeMotivate(e) {
    if (!e || e.target === document.getElementById('modal')) {
        const m = document.getElementById('modal');
        m.classList.add('opacity-0', 'pointer-events-none'); m.classList.remove('opacity-100');
        document.getElementById('modal-box').classList.add('scale-95'); document.getElementById('modal-box').classList.remove('scale-100');
    }
}