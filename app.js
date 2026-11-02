const channels = [
  { name: "G-Eye TV Live", stream: "https://unda.geyetv.com/hls/geyetv/master.m3u8", image: "images/geyetv.png" },
  { name: "G-Eye 247 News", stream: "https://unda.geyetv.com/hls/g-eye247news/index.m3u8", image: "images/G-Eye247News.png" },
  { name: "G-Eye Afro Cinema", stream: "https://unda.geyetv.com/hls/g-eyeafrocinema/index.m3u8", image: "images/AFROCINEMA.png" },
  { name: "G-Eye Kids Zone", stream: "https://unda.geyetv.com/hls/geyetvkidszone/index.m3u8", image: "images/KIDSZONE.png" },
  { name: "G-Eye Music Plus", stream: "https://unda.geyetv.com/hls/geyetvmusicplus/index.m3u8", image: "images/GeyeMusic+.png" },
  { name: "G-Eye Sports Network", stream: "https://unda.geyetv.com/hls/g-eyesportsnetwork/index.m3u8", image: "images/SPORTSNETWORK.png" },
  { name: "G-Eye Action HD", stream: "https://unda.geyetv.com/hls/g-eyeactionh/index.m3u8", image: "images/ACTIONHD.png" },
  { name: "G-Eye Mission", stream: "https://unda.geyetv.com/hls/g-eyemission/index.m3u8", image: "images/MISSION.png" },
  { name: "G-Eye Docs", stream: "https://unda.geyetv.com/hls/g-eyedocs/index.m3u8", image: "images/DOCS.png" },
  { name: "G-Eye Gospel Flow", stream: "https://unda.geyetv.com/hls/g-eyegospelflow/index.m3u8", image: "images/GOSPELFLOW.png" },
  { name: "G-Eye Prime Series", stream: "https://unda.geyetv.com/hls/g-eyeprimeseries/index.m3u8", image: "images/PRIMESERIES.png" },
  { name: "G-Eye Extra", stream: "https://unda.geyetv.com/hls/g-eyetv-extra/index.m3u8", image: "images/Extra.png" },
  { name: "G-Eye Wild", stream: "https://unda.geyetv.com/hls/g-eyewild/index.m3u8", image: "images/WILD.png" },
  { name: "G-Eye Cine Afrique", stream: "https://unda.geyetv.com/hls/g-eyecineafrique/index.m3u8", image: "images/GeyeCinemaAfrique.png" },
  { name: "G-Eye Cinema Prime", stream: "https://unda.geyetv.com/hls/g-eyecinemaprime/index.m3u8", image: "images/GeyeCinémaPrime.png" },
  { name: "Box Office", stream: "https://unda.geyetv.com/hls/boxoffice/index.m3u8", image: "images/BoxOffice.png" },
  { name: "Afro Fuse HD", stream: "https://unda.geyetv.com/hls/afrofusehd/index.m3u8", image: "images/afrofuse.png" },
  { name: "Weather 247", stream: "https://unda.geyetv.com/hls/weather247/index.m3u8", image: "images/Weather247.png" },
  { name: "FIFA Plus", stream: "https://unda.geyetv.com/hls/fifaplus/index.m3u8", image: "images/fifaplus.png" },
  { name: "Docuseries Crimes", stream: "https://unda.geyetv.com/hls/docuseriescrimes/index.m3u8", image: "images/DocuSeriesCrime.png" },
  { name: "France 24", stream: "https://unda.geyetv.com/hls/france24/index.m3u8", image: "images/GeyeFrance.png" },
  { name: "Movie 247", stream: "https://unda.geyetv.com/hls/movie247/index.m3u8", image: "images/movie247.png" },
  { name: "Euronews FR", stream: "https://unda.geyetv.com/hls/euronewsfrench/index.m3u8", image: "images/FREuroNewsHD.png" },
  { name: "Cinebox Action", stream: "https://unda.geyetv.com/hls/cinebox-action/index.m3u8", image: "images/cineboxaction.png" },
  { name: "Cinebox Animation", stream: "https://unda.geyetv.com/hls/cinebox-animation/index.m3u8", image: "images/CineBoxAnimation.png" },
  { name: "France 24 News", stream: "https://unda.geyetv.com/hls/france24french/index.m3u8", image: "images/GeyeFrance.png" }
];

const radios = [
  { name: "G-Eye Global Waves", stream: "https://radio.geyetv.com/listen/g-eye_global_waves/radio.mp3", image: "https://i.imgur.com/wkW66o4.png" },
  { name: "G-Eye Infinity Radio", stream: "https://radio.geyetv.com/listen/g-eye_infinity_radio/radio.mp3", image: "https://i.imgur.com/cihT0Ig.png" },
  { name: "G-Eye Power FM", stream: "https://radio.geyetv.com/listen/g-eye_power_fm/radio.mp3", image: "https://i.imgur.com/5Xk0p2Q.png" },
  { name: "G-Eye Radio Empire", stream: "https://radio.geyetv.com/listen/g-eye_radio_empire/radio.mp3", image: "https://i.imgur.com/CdxG7fB.png" },
  { name: "G-Eye Supreme FM", stream: "https://radio.geyetv.com/listen/g-eye_supreme_fm/radio.mp3", image: "https://i.imgur.com/emXvmFc.png" },
  { name: "GEM Radio", stream: "https://radio.geyetv.com/listen/gem_radio/radio.mp3", image: "https://i.imgur.com/wkW66o4.png" },
  { name: "G-Eye Radio", stream: "https://radio.geyetv.com/listen/geye_radio/radio.mp3", image: "https://i.imgur.com/wkW66o4.png" }
];

const lists = { tv: channels, radio: radios };
const FALLBACK_IMG = 'https://i.imgur.com/PRL4asG.jpeg';
const STORAGE_KEY = 'geye:lastChannel';

const grid = document.getElementById('vidlink');
const video = document.getElementById('mainPlayer');
const statusText = document.getElementById('statusText');
const overlay = document.getElementById('playerOverlay');
const overlayMsg = document.getElementById('overlayMessage');
const retryBtn = document.getElementById('retryBtn');
const searchInput = document.getElementById('channelSearch');
const emptyMsg = document.getElementById('noResults');
const tabs = document.querySelectorAll('[data-tab]');

let hls;
let currentTab = 'tv';
let current = null; // { type, index }
let recoveredOnce = false;

// ---------- Overlay (loading / error / tap to play) ----------
function setOverlay(state, message) {
    overlay.className = 'player-overlay' + (state ? ' is-' + state : '');
    overlayMsg.textContent = message || '';
}

function playVideo() {
    const p = video.play();
    if (p && p.catch) {
        p.catch(() => setOverlay('paused', 'Tap to play'));
    }
}

video.addEventListener('playing', () => setOverlay(null));
video.addEventListener('waiting', () => setOverlay('loading', 'Loading stream...'));
video.addEventListener('error', () => {
    if (!hls) setOverlay('error', 'Stream unavailable');
});

retryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (current) switchChannel(current.type, current.index);
});

overlay.addEventListener('click', () => {
    if (overlay.classList.contains('is-paused')) playVideo();
});

// ---------- Playback ----------
function switchChannel(type, index) {
    const ch = lists[type][index];
    if (!ch) return;
    current = { type, index };
    recoveredOnce = false;

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(current)); } catch (e) {}

    // UI Update
    statusText.textContent = (type === 'radio' ? 'Now Playing (Radio): ' : 'Now Playing: ') + ch.name;
    markActive();
    setOverlay('loading', 'Loading stream...');

    if (hls) {
        hls.destroy(); // Clean up current stream before loading new one
        hls = null;
    }
    video.removeAttribute('src');
    video.poster = type === 'radio' ? ch.image : '';

    // Radio streams are plain mp3, no HLS needed
    if (type === 'radio' || !ch.stream.includes('.m3u8')) {
        video.src = ch.stream;
        playVideo();
        return;
    }

    if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(ch.stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (!data.fatal) return;
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !recoveredOnce) {
                recoveredOnce = true;
                hls.recoverMediaError();
                return;
            }
            setOverlay('error', 'Stream unavailable');
        });
    }
    // For Safari/iOS which supports HLS natively
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = ch.stream;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
    }
}

// ---------- Channel list ----------
function markActive() {
    grid.querySelectorAll('.channel-item').forEach(li => {
        const isActive = current && current.type === currentTab && Number(li.dataset.index) === current.index;
        li.classList.toggle('active', isActive);
        if (isActive) li.scrollIntoView({ block: 'nearest' });
    });
}

function renderList(type) {
    currentTab = type;
    grid.innerHTML = '';

    lists[type].forEach((ch, index) => {
        const li = document.createElement('li');
        li.className = 'channel-item';
        li.dataset.index = index;
        li.tabIndex = 0;

        const img = document.createElement('img');
        img.src = ch.image;
        img.alt = ch.name;
        img.loading = 'lazy';
        img.onerror = () => { img.onerror = null; img.src = FALLBACK_IMG; };

        // TV logos are square images with a lot of empty space, crop it with CSS
        const logo = document.createElement('div');
        logo.className = 'channel-logo' + (type === 'tv' ? ' is-cropped' : '');
        logo.appendChild(img);

        const p = document.createElement('p');
        p.textContent = ch.name;

        li.append(logo, p);
        li.onclick = () => switchChannel(type, index);
        li.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                switchChannel(type, index);
            }
        };
        grid.appendChild(li);
    });

    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === type));
    applySearch();
    markActive();
}

function applySearch() {
    const q = searchInput.value.trim().toLowerCase();
    let shown = 0;
    grid.querySelectorAll('.channel-item').forEach(li => {
        const match = li.textContent.toLowerCase().includes(q);
        li.hidden = !match;
        if (match) shown++;
    });
    emptyMsg.hidden = shown > 0;
}

// Arrow keys move to the previous / next visible channel
function stepChannel(dir) {
    const items = [...grid.querySelectorAll('.channel-item:not([hidden])')];
    if (!items.length) return;
    let pos = items.findIndex(li => li.classList.contains('active'));
    pos = pos === -1 ? 0 : (pos + dir + items.length) % items.length;
    items[pos].focus();
    switchChannel(currentTab, Number(items[pos].dataset.index));
}

document.addEventListener('keydown', (e) => {
    if (e.target === searchInput || e.target === video) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); stepChannel(1); }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); stepChannel(-1); }
});

function init() {
    document.getElementById('year').textContent = new Date().getFullYear();

    searchInput.addEventListener('input', applySearch);
    tabs.forEach(t => t.addEventListener('click', () => renderList(t.dataset.tab)));

    // Resume the last channel watched, otherwise start with the first one
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) {}
    if (!saved || !lists[saved.type] || !lists[saved.type][saved.index]) {
        saved = { type: 'tv', index: 0 };
    }

    renderList(saved.type);
    switchChannel(saved.type, saved.index);
}

document.addEventListener('DOMContentLoaded', init);
