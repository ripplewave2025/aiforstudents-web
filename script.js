/* Core data: edit this list to add your real tools.
   url: can be internal page, external app, or a notion/doc link. */
const TOOLS = [
  {
    id: 'notes-to-quiz',
    name: 'Notes → Quiz',
    desc: 'Paste notes, get spaced-repetition questions.',
    tags: ['study','quiz','notes'],
    url: 'https://chat.openai.com/', // swap with your preferred flow
  },
  {
    id: 'youtube-summarizer',
    name: 'YouTube Summarizer',
    desc: 'Drop a link. Get key ideas + timestamps.',
    tags: ['video','summarize'],
    url: 'https://youtubesummarizer.net/', // example
  },
  {
    id: 'speak-with-pdf',
    name: 'Speak with PDF',
    desc: 'Upload syllabus/PDF. Ask questions, get answers.',
    tags: ['pdf','research'],
    url: 'https://www.chatpdf.com/',
  },
  {
    id: 'study-planner',
    name: 'Sprint Study Planner',
    desc: 'Plan 7-day sprints with daily goals.',
    tags: ['planning','productivity'],
    url: 'https://todoist.com/', // placeholder
  },
  {
    id: 'flashcards',
    name: 'Auto Flashcards',
    desc: 'Generate Anki-style cards from any text.',
    tags: ['quiz','notes','study'],
    url: '#', // add yours
  },
  {
    id: 'code-explainer',
    name: 'Code Explainer',
    desc: 'Drop code, get explanation & tests.',
    tags: ['code','dev'],
    url: 'https://github.com/ripplewave2025', // placeholder
  },
];

// --- tiny state layer ---
const $ = s => document.querySelector(s);
const grid = $('#cardGrid');
const pinnedGrid = $('#pinnedGrid');
const pinnedSection = $('#pinnedSection');
const countEl = $('#count');
const tagBar = $('#tagBar');
const searchInput = $('#searchInput');
const resetBtn = $('#resetBtn');
const themeToggle = $('#themeToggle');
const modal = $('#toolModal');
const mTitle = $('#modalTitle');
const mDesc = $('#modalDesc');
const mLaunch = $('#modalLaunch');
const mPin = $('#modalPin');
const mMeta = $('#modalMeta');

const ALL_TAGS = [...new Set(TOOLS.flatMap(t => t.tags))].sort();
let activeTags = new Set();
let query = '';
let pins = new Set(JSON.parse(localStorage.getItem('afs:pins')||'[]'));

function savePins(){ localStorage.setItem('afs:pins', JSON.stringify([...pins])); }
function setTheme(mode){
  localStorage.setItem('afs:theme', mode);
  document.documentElement.dataset.theme = mode;
}
(function initTheme(){
  const saved = localStorage.getItem('afs:theme');
  if(saved) setTheme(saved);
})();
$('#year').textContent = new Date().getFullYear();

// --- UI builders ---
function badge(tag){ return `<span class="badge">${tag}</span>`; }

function card(t){
  const starred = pins.has(t.id) ? '★' : '☆';
  return `
    <article class="card" data-id="${t.id}" data-tags="${t.tags.join(',')}">
      <button class="star" title="Pin">${starred}</button>
      <h3>${t.name}</h3>
      <p>${t.desc}</p>
      <div class="badges">${t.tags.map(badge).join(' ')}</div>
      <div class="actions">
        <a class="btn primary" href="${t.url}" target="_blank" rel="noopener">Open</a>
        <button class="btn" data-open="${t.id}">Details</button>
      </div>
    </article>`;
}

function render(){
  const filtered = TOOLS.filter(t=>{
    const q = query.trim().toLowerCase();
    const matchQ = !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.tags.some(x=>x.includes(q));
    const matchTag = !activeTags.size || t.tags.some(x=>activeTags.has(x));
    return matchQ && matchTag;
  });
  grid.innerHTML = filtered.map(card).join('');
  countEl.textContent = `${filtered.length} tools`;

  // Pinned
  const pinned = TOOLS.filter(t=>pins.has(t.id));
  pinnedSection.classList.toggle('hidden', pinned.length===0);
  pinnedGrid.innerHTML = pinned.map(card).join('');
}
function renderTags(){
  tagBar.innerHTML = ['all', ...ALL_TAGS].map(tag=>{
    const active = tag!=='all' && activeTags.has(tag);
    return `<button class="tag ${active?'active':''}" data-tag="${tag}">${tag}</button>`;
  }).join('');
}

// --- interactions ---
document.addEventListener('click', (e)=>{
  // open details
  const openId = e.target.closest('button')?.dataset?.open;
  if(openId){
    const tool = TOOLS.find(t=>t.id===openId);
    if(tool){
      mTitle.textContent = tool.name;
      mDesc.textContent = tool.desc;
      mLaunch.href = tool.url;
      mLaunch.textContent = `Open ${tool.name}`;
      mMeta.textContent = `Tags: ${tool.tags.join(', ')}`;
      mPin.textContent = pins.has(tool.id) ? 'Unpin' : 'Pin';
      mPin.dataset.id = tool.id;
      modal.showModal();
    }
  }
  // pin from card
  const starBtn = e.target.closest('.star');
  if(starBtn){
    const id = e.target.closest('.card').dataset.id;
    togglePin(id);
  }
  // modal controls
  if(e.target.id==='modalClose') modal.close();
  if(e.target.id==='modalPin'){
    togglePin(e.target.dataset.id);
    modal.close();
  }
  // tag filter
  const tagBtn = e.target.closest('.tag');
  if(tagBtn){
    const tag = tagBtn.dataset.tag;
    if(tag==='all'){ activeTags.clear(); }
    else{
      if(activeTags.has(tag)) activeTags.delete(tag);
      else activeTags.add(tag);
    }
    renderTags(); render();
  }
  if(e.target.id==='clearPins'){ pins.clear(); savePins(); render(); }
  if(e.target.id==='resetBtn'){ activeTags.clear(); searchInput.value=''; query=''; renderTags(); render(); }
  if(e.target.id==='themeToggle'){
    const cur = document.documentElement.dataset.theme || 'dark';
    setTheme(cur==='dark' ? 'light' : 'dark');
  }
});

function togglePin(id){
  if(pins.has(id)) pins.delete(id); else pins.add(id);
  savePins(); render();
}

searchInput.addEventListener('input', e=>{ query = e.target.value; render(); });

// shortcuts
window.addEventListener('keydown', (e)=>{
  if(e.key==='/' && document.activeElement!==searchInput){ e.preventDefault(); searchInput.focus(); }
  if(e.key==='Escape'){ if(modal.open) modal.close(); }
});

// init
renderTags(); render();
console.log('script.js loaded OK');
