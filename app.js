const supabaseClient = window.supabase.createClient(
  'https://isrveflvlckfxufmvduq.supabase.co',
  'sb_publishable_t3LMP0CH8I15aFI_CFgE2w_LodWb0jp',
);

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

const ADJECTIVES = [
  'bold', 'calm', 'dark', 'easy', 'fair', 'glad', 'hazy', 'icy',
  'keen', 'lazy', 'mild', 'neat', 'odd', 'pale', 'quick', 'rare',
  'soft', 'tall', 'vast', 'warm', 'young', 'zany', 'blue', 'red'
];

const NOUNS = [
  'fox', 'owl', 'elk', 'bee', 'cat', 'dog', 'jay', 'ram',
  'yak', 'emu', 'cod', 'ant', 'bat', 'cow', 'hen', 'fly',
  'ape', 'hog', 'koi', 'pug', 'ray', 'wren', 'lynx', 'newt'
];

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRoomName() {
  return `${randomPick(ADJECTIVES)}-${randomPick(NOUNS)}-${Math.floor(Math.random() * 100)}`;
}

function generateDisplayName() {
  return `${randomPick(ADJECTIVES)} ${randomPick(NOUNS)}`;
}

const LS = {
  displayName: 'dix-cordes-display-name',
  muted: 'dix-cordes-muted',
  theme: 'dix-cordes-theme',
  starred: 'dix-cordes-starred',
  recent: 'dix-cordes-recent',
};

function sanitizeDisplayName(name) {
  return name.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
}

function getSavedDisplayName() {
  const saved = localStorage.getItem(LS.displayName);
  if (!saved) return null;
  return sanitizeDisplayName(saved) || null;
}

function saveDisplayName(name) {
  localStorage.setItem(LS.displayName, name);
}

function getSavedMuted() {
  return localStorage.getItem(LS.muted) === 'true';
}

function saveMuted(muted) {
  localStorage.setItem(LS.muted, muted);
}

function sanitizeRoomName(name) {
  const sanitized = name.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
  return /[a-z0-9]/.test(sanitized) ? sanitized : '';
}

const $ = (sel) => document.querySelector(sel);

const landingView = $('#landing-view');
const roomView = $('#room-view');
const errorView = $('#error-view');

const createRoomBtn = $('#create-room-btn');
const joinRoomBtn = $('#join-room-btn');
const roomInput = $('#room-input');
const roomNameEl = $('#room-name');
const leaveBtn = $('#leave-btn');

const peerList = $('#peer-list');
const statusBanner = $('#status-banner');
const backBtn = $('#back-btn');
const chatMessages = $('#chat-messages');
const chatInput = $('#chat-input');
const chatSendBtn = $('#chat-send-btn');
const themeToggle = $('#theme-toggle');
const starBtn = $('#star-btn');
const starredRoomsEl = $('#starred-rooms');
const starredList = $('#starred-list');
const recentRoomsEl = $('#recent-rooms');
const recentList = $('#recent-list');
const shareBtn = $('#share-btn');
const screenShareEl = $('#screen-share');
const screenVideo = $('#screen-video');
const fullscreenBtn = $('#fullscreen-btn');

const svg = (d) =>
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

const ICON = {
  plus:       svg('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>'),
  arrowRight: svg('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),
  arrowLeft:  svg('<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>'),
  star:       svg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
  starFill:   svg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>'),
  monitor:    svg('<rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/>'),
  monitorOff: svg('<rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="4" y1="4" x2="20" y2="16"/>'),
  leave:      svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'),
  mic:        svg('<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>'),
  micOff:     svg('<line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>'),
  send:       svg('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>'),
  expand:     svg('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>'),
  collapse:   svg('<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>'),
  sun:        svg('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'),
  moon:       svg('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),
  trash:      svg('<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
  extLink:    svg('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>'),
};

const VAD_INTERVAL_MS = 50;
const VAD_THRESHOLD = 135;
const VAD_SILENCE_DELAY = 500;
const SCREEN_MAX_BITRATE = 1_500_000;
const ICE_GATHERING_TIMEOUT_MS = 2000;
const CONNECT_TIMEOUT_MS = 10_000;
const URL_REGEX = /(https?:\/\/|www\.)[^\s<>"']+/gi;

let vadInterval = null;
let audioCtx = null;

const vadTrackers = new Map();
const vadElements = new Map();

function createVadTracker(key, stream) {
  if (!audioCtx) audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
  const data = new Uint8Array(analyser.frequencyBinCount);
  vadTrackers.set(key, { source, analyser, data, lastSpeaking: 0, speaking: false });
}

function removeVadTracker(key) {
  const tracker = vadTrackers.get(key);
  if (tracker) {
    tracker.source.disconnect();
    vadTrackers.delete(key);
  }
}

function playChime(frequencies) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const g = audioCtx.createGain();
  g.connect(audioCtx.destination);
  g.gain.setValueAtTime(0.15, now);
  g.gain.linearRampToValueAtTime(0, now + 0.2);
  for (const [freq, start] of frequencies) {
    const o = audioCtx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    o.connect(g);
    o.start(now + start);
    o.stop(now + 0.2);
  }
}

function clearAllVadTrackers() {
  for (const key of [...vadTrackers.keys()]) removeVadTracker(key);
  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }
}

function startVadPolling() {
  if (vadInterval) return;
  vadInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, tracker] of vadTrackers) {
      tracker.analyser.getByteTimeDomainData(tracker.data);
      let peak = 0;
      for (let i = 0; i < tracker.data.length; i++) {
        const v = Math.abs(tracker.data[i] - 128);
        if (v > peak) peak = v;
      }
      if (peak + 128 > VAD_THRESHOLD) tracker.lastSpeaking = now;
      tracker.speaking = (now - tracker.lastSpeaking) < VAD_SILENCE_DELAY;

      const el = vadElements.get(key);
      if (el) el.classList.toggle('speaking', tracker.speaking);
    }
  }, VAD_INTERVAL_MS);
}

function stopVadPolling() {
  if (vadInterval) {
    clearInterval(vadInterval);
    vadInterval = null;
  }
}

const peekChannels = new Map();

function getJsonList(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

function saveJsonList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function getStarredRooms() { return getJsonList(LS.starred); }
function saveStarredRooms(rooms) { saveJsonList(LS.starred, rooms); }

function isRoomStarred(roomName) {
  return getStarredRooms().includes(roomName);
}

function toggleStarRoom(roomName) {
  const rooms = getStarredRooms();
  const idx = rooms.indexOf(roomName);
  if (idx >= 0) {
    rooms.splice(idx, 1);
  } else {
    rooms.push(roomName);
  }
  saveStarredRooms(rooms);
  updateStarBtn(state.roomName ? rooms.includes(state.roomName) : undefined);
}

function updateStarBtn(starred) {
  if (!state.roomName) return;
  starBtn.innerHTML = (starred ?? isRoomStarred(state.roomName)) ? ICON.starFill : ICON.star;
}

function renderStarredRooms() {
  const rooms = getStarredRooms();
  starredRoomsEl.hidden = rooms.length === 0;
  starredList.replaceChildren();

  let dragSrcIndex = null;

  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];
    const li = document.createElement('li');
    li.className = 'starred-room';
    li.draggable = true;

    li.addEventListener('dragstart', (e) => {
      dragSrcIndex = i;
      li.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      li.classList.add('drag-over');
    });

    li.addEventListener('dragleave', () => {
      li.classList.remove('drag-over');
    });

    li.addEventListener('drop', (e) => {
      e.preventDefault();
      li.classList.remove('drag-over');
      if (dragSrcIndex !== null && dragSrcIndex !== i) {
        const updated = getStarredRooms();
        const [moved] = updated.splice(dragSrcIndex, 1);
        updated.splice(i, 0, moved);
        saveStarredRooms(updated);
        renderStarredRooms();
        subscribePeekAll();
      }
    });

    li.addEventListener('dragend', () => {
      dragSrcIndex = null;
      for (const el of starredList.children) {
        el.classList.remove('dragging', 'drag-over');
      }
    });

    const link = document.createElement('a');
    link.href = `#${room}`;
    link.className = 'starred-room-name';
    link.textContent = `#${room}`;
    li.appendChild(link);

    const count = document.createElement('span');
    count.className = 'starred-room-count';
    count.dataset.room = room;
    count.textContent = '● 0';
    li.appendChild(count);

    const unstar = document.createElement('button');
    unstar.className = 'starred-room-action starred-room-star';
    unstar.innerHTML = ICON.starFill;
    unstar.setAttribute('aria-label', 'Unstar room');
    unstar.addEventListener('click', (e) => {
      e.preventDefault();
      toggleStarRoom(room);
      unsubscribePeek(room);
      renderStarredRooms();
      renderRecentRooms();
      subscribePeekAll();
    });
    li.appendChild(unstar);

    starredList.appendChild(li);
  }
}

function subscribePeekAll() {
  const rooms = getStarredRooms();
  for (const room of rooms) {
    if (peekChannels.has(room)) continue;
    const channel = supabaseClient.channel(`room:${room}`);
    peekChannels.set(room, channel);

    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      let count = 0;
      for (const presences of Object.values(presenceState)) {
        count += presences.length;
      }
      const el = starredList.querySelector(`.starred-room-count[data-room="${room}"]`);
      if (el) {
        el.textContent = `● ${count}`;
        el.classList.toggle('has-peers', count > 0);
      }
    });

    channel.subscribe();
  }
}

async function unsubscribePeek(room) {
  const channel = peekChannels.get(room);
  if (channel) {
    peekChannels.delete(room);
    await supabaseClient.removeChannel(channel).catch(() => {});
  }
}

async function unsubscribePeekAll() {
  await Promise.all([...peekChannels.keys()].map(room => unsubscribePeek(room)));
}

function getRecentRooms() { return getJsonList(LS.recent); }
function saveRecentRooms(rooms) { saveJsonList(LS.recent, rooms); }

function addRecentRoom(roomName) {
  const rooms = getRecentRooms();
  const idx = rooms.indexOf(roomName);
  if (idx >= 0) rooms.splice(idx, 1);
  rooms.unshift(roomName);
  if (rooms.length > 5) rooms.pop();
  saveRecentRooms(rooms);
}

function removeRecentRoom(roomName) {
  const rooms = getRecentRooms().filter(r => r !== roomName);
  saveRecentRooms(rooms);
  renderRecentRooms();
}

function renderRecentRooms() {
  const visible = getRecentRooms();
  recentRoomsEl.hidden = visible.length === 0;
  recentList.replaceChildren();

  for (const room of visible) {
    const li = document.createElement('li');
    li.className = 'starred-room';

    const link = document.createElement('a');
    link.href = `#${room}`;
    link.className = 'starred-room-name';
    link.textContent = `#${room}`;
    li.appendChild(link);

    if (!isRoomStarred(room)) {
      const starButton = document.createElement('button');
      starButton.className = 'starred-room-action starred-room-star';
      starButton.innerHTML = ICON.star;
      starButton.setAttribute('aria-label', 'Star room');
      starButton.addEventListener('click', (e) => {
        e.preventDefault();
        toggleStarRoom(room);
        renderStarredRooms();
        renderRecentRooms();
        subscribePeekAll();
      });
      li.appendChild(starButton);
    }

    const remove = document.createElement('button');
    remove.className = 'starred-room-action';
    remove.innerHTML = ICON.trash;
    remove.setAttribute('aria-label', 'Remove room');
    remove.addEventListener('click', (e) => {
      e.preventDefault();
      removeRecentRoom(room);
    });
    li.appendChild(remove);

    recentList.appendChild(li);
  }
}

const state = {
  peerId: crypto.randomUUID(),
  displayName: getSavedDisplayName() || generateDisplayName(),
  muted: getSavedMuted(),
  screenStream: null,
  session: 0,
  roomName: null,
  channel: null,
  localStream: null,
  presenceReady: false,
  peers: new Map(),
};

function showView(view) {
  landingView.hidden = true;
  roomView.hidden = true;
  errorView.hidden = true;
  view.hidden = false;
}

function showBanner(message) {
  statusBanner.textContent = message;
  statusBanner.hidden = false;
}

function hideBanner() {
  statusBanner.hidden = true;
}

function channelSend(eventName, payload) {
  if (!state.channel) return;
  try {
    state.channel.send({ type: 'broadcast', event: eventName, payload });
  } catch (err) {
    console.warn(`Failed to send "${eventName}":`, err);
  }
}

function presencePayload() {
  return { peerId: state.peerId, name: state.displayName, muted: state.muted, sharing: !!state.screenStream };
}

function channelTrack() {
  if (!state.channel || !state.presenceReady) return;
  try {
    state.channel.track(presencePayload());
  } catch (err) {
    console.warn('Failed to track presence:', err);
  }
}

function currentRoom() {
  return sanitizeRoomName(decodeURIComponent(location.hash.slice(1)));
}

async function navigate() {
  const room = currentRoom();

  if (room && location.hash !== `#${room}`) {
    location.hash = room;
    return;
  }

  if (room && room === state.roomName) return;

  await leaveRoom();

  if (room) {
    await unsubscribePeekAll();
    addRecentRoom(room);
    await joinRoom(room);
  } else {
    showView(landingView);
    renderStarredRooms();
    renderRecentRooms();
    subscribePeekAll();
  }
}

async function joinRoom(roomName) {
  state.roomName = roomName;
  roomNameEl.textContent = `#${roomName}`;

  document.title = `#${roomName} - Dix-Cordes`;
  showView(roomView);
  updateStarBtn();
  shareBtn.hidden = !navigator.mediaDevices.getDisplayMedia;
  showBanner('Connecting...');

  const session = state.session;
  try {
    await openMicrophone();
  } catch (err) {
    if (state.session !== session) return;
    console.error('Microphone access denied:', err);
    state.roomName = null;
    showView(errorView);
    return;
  }
  if (state.session !== session) return;

  startVadPolling();
  renderPeers();
  connectToRoom(roomName);
}

async function openMicrophone() {
  const session = state.session;
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  if (state.session !== session) {
    stream.getTracks().forEach(t => t.stop());
    return;
  }

  const [track] = stream.getAudioTracks();
  track.enabled = !state.muted;
  track.addEventListener('ended', () => {
    if (state.localStream === stream) openMicrophone().catch(err => console.error('Microphone lost:', err));
  });

  state.localStream = stream;
  for (const peer of state.peers.values()) peer.pc?.getSenders()[0]?.replaceTrack(track);
  removeVadTracker('local');
  createVadTracker('local', stream);
}

function cleanupMedia() {
  state.session++;
  stopVadPolling();
  clearAllVadTrackers();

  if (state.screenStream) {
    state.screenStream.getTracks().forEach(t => t.stop());
    state.screenStream = null;
  }
  screenVideo.srcObject = null;
  screenShareEl.hidden = true;

  if (state.localStream) {
    state.localStream.getTracks().forEach(t => t.stop());
    state.localStream = null;
  }
}

function cleanupPeers() {
  for (const [id, peer] of state.peers) closeConnection(id, peer);
  state.peers.clear();
}

async function leaveRoom() {
  cleanupMedia();
  cleanupPeers();

  if (state.channel) {
    const channelToRemove = state.channel;
    state.channel = null;

    try { channelToRemove.untrack(); } catch (err) {
      console.warn('Failed to untrack presence:', err);
    }

    try {
      await supabaseClient.removeChannel(channelToRemove);
    } catch (err) {
      console.warn('Failed to remove channel:', err);
    }
  }

  state.roomName = null;
  state.presenceReady = false;
  document.title = 'Dix-Cordes';
  peerList.replaceChildren();
  chatMessages.replaceChildren();
}

function leaveRoomSync() {
  cleanupMedia();
  unsubscribePeekAll();

  if (state.channel) {
    try { state.channel.untrack(); } catch (_) {}
    try { supabaseClient.removeChannel(state.channel); } catch (_) {}
    state.channel = null;
  }

  cleanupPeers();

  state.roomName = null;
  state.presenceReady = false;
}

async function startSharing() {
  try {
    state.screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: 15, max: 20 }, height: { ideal: 1080 } },
      audio: false,
    });
  } catch {
    return;
  }

  const [track] = state.screenStream.getVideoTracks();
  track.addEventListener('ended', stopSharing, { once: true });
  for (const peer of state.peers.values()) peer.pc?.getSenders()[1]?.replaceTrack(track);

  renderScreen();
  channelTrack();
}

function stopSharing() {
  if (!state.screenStream) return;

  for (const peer of state.peers.values()) peer.pc?.getSenders()[1]?.replaceTrack(null);
  state.screenStream.getTracks().forEach(t => t.stop());
  state.screenStream = null;

  renderScreen();
  channelTrack();
}

function renderScreen() {
  const remoteSharer = [...state.peers.values()].find(p => p.sharing);
  const stream = state.screenStream ?? remoteSharer?.screen ?? null;

  if (screenVideo.srcObject !== stream) screenVideo.srcObject = stream;
  screenShareEl.hidden = !stream;

  shareBtn.innerHTML = state.screenStream ? ICON.monitorOff : ICON.monitor;
  shareBtn.classList.toggle('sharing', !!state.screenStream);
  shareBtn.disabled = !!remoteSharer && !state.screenStream;
}

function toggleMute() {
  state.muted = !state.muted;
  saveMuted(state.muted);

  if (state.localStream) {
    state.localStream.getAudioTracks().forEach(t => {
      t.enabled = !state.muted;
    });
  }

  channelTrack();
  renderPeers();
}

function renderPeers() {
  vadElements.clear();
  peerList.replaceChildren();

  peerList.appendChild(createPeerElement(`${state.displayName} (you)`, state.muted, true));

  for (const [id, peer] of state.peers) {
    peerList.appendChild(createPeerElement(peer.name, peer.muted, false, id));
  }
}

function createPeerElement(name, muted, isSelf, peerId) {
  const li = document.createElement('li');
  li.className = isSelf ? 'peer self' : 'peer';
  if (peerId) li.dataset.peerId = peerId;

  const vadKey = isSelf ? 'local' : peerId;
  vadElements.set(vadKey, li);
  const tracker = vadTrackers.get(vadKey);
  if (tracker?.speaking) li.classList.add('speaking');

  const nameSpan = document.createElement('span');
  nameSpan.className = 'peer-name';
  nameSpan.textContent = name;
  li.appendChild(nameSpan);

  if (muted) li.classList.add('muted');

  const controls = document.createElement('span');
  controls.className = 'peer-controls';

  if (isSelf) {
    nameSpan.style.cursor = 'pointer';
    nameSpan.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'peer-rename-input';
      input.value = state.displayName;
      input.maxLength = 20;

      nameSpan.replaceWith(input);
      input.focus();
      input.select();

      function confirm() {
        const clean = sanitizeDisplayName(input.value);
        if (clean && clean !== state.displayName) {
          state.displayName = clean;
          saveDisplayName(clean);
          channelTrack();
        }
        renderPeers();
      }

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); confirm(); }
        if (e.key === 'Escape') { e.preventDefault(); renderPeers(); }
      });
      input.addEventListener('blur', confirm);
    });

    const muteBtn = document.createElement('button');
    muteBtn.className = state.muted ? 'self-mute-btn muted' : 'self-mute-btn';
    muteBtn.innerHTML = state.muted ? ICON.micOff : ICON.mic;
    muteBtn.setAttribute('aria-label', state.muted ? 'Unmute' : 'Mute');
    muteBtn.addEventListener('click', toggleMute);
    controls.appendChild(muteBtn);
  } else {
    const peer = state.peers.get(peerId);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'peer-vol-slider';
    slider.min = 0;
    slider.max = 200;
    slider.step = 25;
    slider.value = Math.round(peer.volume * 100);
    slider.addEventListener('input', () => {
      peer.volume = slider.value / 100;
      if (peer.gainNode) peer.gainNode.gain.value = peer.volume;
    });
    controls.appendChild(slider);
  }

  li.appendChild(controls);
  return li;
}

function sendChatMessage() {
  const text = chatInput.value.trim().slice(0, 500);
  if (!text || !state.channel) return;

  channelSend('chat', { name: state.displayName, text });

  appendChat(state.displayName, text, true);
  chatInput.value = '';
  chatSendBtn.disabled = true;
}

function linkify(el, text) {
  let last = 0;
  for (const match of text.matchAll(URL_REGEX)) {
    if (match.index > last) el.appendChild(document.createTextNode(text.slice(last, match.index)));
    const a = document.createElement('a');
    a.href = match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'chat-link';
    a.textContent = match[0];
    a.insertAdjacentHTML('beforeend', ICON.extLink);
    el.appendChild(a);
    last = match.index + match[0].length;
  }
  if (last < text.length) el.appendChild(document.createTextNode(text.slice(last)));
}

function appendChat(author, text, isSelf) {
  const div = document.createElement('div');
  div.className = author
    ? (isSelf ? 'chat-msg chat-msg-self' : 'chat-msg')
    : 'chat-msg chat-msg-system';

  const time = document.createElement('span');
  time.className = 'chat-time';
  time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  div.appendChild(time);

  if (author) {
    const authorSpan = document.createElement('span');
    authorSpan.className = 'chat-author';
    authorSpan.textContent = author;
    div.appendChild(authorSpan);
  }

  const msg = document.createElement('span');
  linkify(msg, text);
  div.appendChild(msg);

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  if (author && !isSelf) playChime([[1046, 0]]);
}

function connectToRoom(roomName) {
  const channel = supabaseClient.channel(`room:${roomName}`);
  state.channel = channel;

  channel.on('presence', { event: 'sync' }, () => {
    if (state.channel !== channel) return;
    updatePeersFromPresence(channel.presenceState());
  });

  channel.on('broadcast', { event: 'signal' }, ({ payload }) => {
    if (state.channel !== channel) return;
    if (payload.to === state.peerId) handleSignal(payload);
  });

  channel.on('broadcast', { event: 'chat' }, ({ payload }) => {
    if (state.channel !== channel) return;
    appendChat(payload.name, payload.text, false);
  });

  channel.subscribe(async (status) => {
    if (state.channel !== channel) return;

    if (status === 'SUBSCRIBED') {
      hideBanner();

      try {
        await channel.track(presencePayload());
        state.presenceReady = true;
        updatePeersFromPresence(channel.presenceState());
      } catch (err) {
        console.error('Failed to track presence:', err);
      }
    } else if (status === 'CHANNEL_ERROR') {
      state.presenceReady = false;
      showBanner('Connection error. Reconnecting...');
    } else if (status === 'TIMED_OUT') {
      state.presenceReady = false;
      showBanner('Connection timed out. Reconnecting...');
    }
  });
}

function updatePeersFromPresence(presenceState) {
  const presentPeerIds = new Set();

  for (const presence of Object.values(presenceState).flat()) {
    if (presence.peerId === state.peerId) continue;
    presentPeerIds.add(presence.peerId);

    let peer = state.peers.get(presence.peerId);
    if (!peer) {
      peer = { volume: 1 };
      state.peers.set(presence.peerId, peer);
    }
    if (!peer.name) {
      appendChat(null, `${presence.name} joined`);
      playChime([[660, 0], [880, 0.08]]);
    }
    peer.name = presence.name;
    peer.muted = presence.muted;
    peer.sharing = presence.sharing;

    if (state.presenceReady && !peer.pc && state.peerId < presence.peerId) call(presence.peerId, peer);
  }

  for (const [id, peer] of state.peers) {
    if (presentPeerIds.has(id)) continue;
    if (peer.name) {
      appendChat(null, `${peer.name} left`);
      playChime([[880, 0], [660, 0.08]]);
    }
    closeConnection(id, peer);
    state.peers.delete(id);
  }

  renderPeers();
  renderScreen();
}

async function gatheredLocalDescription(pc) {
  await pc.setLocalDescription();
  await new Promise((resolve) => {
    setTimeout(resolve, ICE_GATHERING_TIMEOUT_MS);
    pc.addEventListener('icegatheringstatechange', () => {
      if (pc.iceGatheringState === 'complete') resolve();
    });
  });
  return pc.localDescription;
}

function openConnection(peerId, peer) {
  closeConnection(peerId, peer);
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  peer.pc = pc;

  pc.ontrack = ({ track }) => {
    const stream = new MediaStream([track]);

    if (track.kind === 'video') {
      peer.screen = stream;
      renderScreen();
      return;
    }

    peer.audio = new Audio();
    peer.audio.srcObject = stream;
    peer.audio.muted = true;
    peer.audio.play().catch(() => {});

    peer.gainNode = audioCtx.createGain();
    peer.gainNode.gain.value = peer.volume;
    audioCtx.createMediaStreamSource(stream).connect(peer.gainNode).connect(audioCtx.destination);

    createVadTracker(peerId, stream);
  };

  pc.onconnectionstatechange = () => {
    if (state.peerId < peerId && ['disconnected', 'failed'].includes(pc.connectionState)) {
      retryIfNotConnected(peerId, peer, pc);
    }
  };

  return pc;
}

function closeConnection(peerId, peer) {
  peer.pc?.close();
  peer.gainNode?.disconnect();
  peer.audio?.pause();
  removeVadTracker(peerId);
  peer.pc = null;
  peer.gainNode = null;
  peer.audio = null;
  peer.screen = null;
}

function retryIfNotConnected(peerId, peer, pc) {
  setTimeout(() => {
    if (peer.pc === pc && pc.connectionState !== 'connected') call(peerId, peer);
  }, CONNECT_TIMEOUT_MS);
}

async function call(peerId, peer) {
  const pc = openConnection(peerId, peer);
  retryIfNotConnected(peerId, peer, pc);
  pc.addTransceiver(state.localStream.getAudioTracks()[0], { direction: 'sendrecv' });
  pc.addTransceiver(state.screenStream?.getVideoTracks()[0] ?? 'video', {
    direction: 'sendrecv',
    sendEncodings: [{ maxBitrate: SCREEN_MAX_BITRATE }],
  });

  const sdp = await gatheredLocalDescription(pc);
  if (peer.pc === pc) channelSend('signal', { type: 'offer', sdp, from: state.peerId, to: peerId });
}

async function handleSignal({ from, type, sdp }) {
  try {
    if (type === 'offer') {
      let peer = state.peers.get(from);
      if (!peer) {
        peer = { volume: 1 };
        state.peers.set(from, peer);
      }

      const pc = openConnection(from, peer);
      await pc.setRemoteDescription(sdp);

      const [audio, video] = pc.getTransceivers();
      audio.direction = 'sendrecv';
      video.direction = 'sendrecv';
      await audio.sender.replaceTrack(state.localStream.getAudioTracks()[0]);
      await video.sender.replaceTrack(state.screenStream?.getVideoTracks()[0] ?? null);

      const answer = await gatheredLocalDescription(pc);
      if (peer.pc !== pc) return;
      channelSend('signal', { type: 'answer', sdp: answer, from: state.peerId, to: from });

      const params = video.sender.getParameters();
      params.encodings[0].maxBitrate = SCREEN_MAX_BITRATE;
      await video.sender.setParameters(params);
    }

    if (type === 'answer') {
      const pc = state.peers.get(from)?.pc;
      if (pc?.signalingState === 'have-local-offer') await pc.setRemoteDescription(sdp);
    }
  } catch (err) {
    console.error(`Signaling error (${type} from ${from}):`, err);
  }
}

createRoomBtn.addEventListener('click', () => {
  location.hash = generateRoomName();
});

joinRoomBtn.addEventListener('click', () => {
  const name = sanitizeRoomName(roomInput.value.trim());
  if (name) location.hash = name;
});

roomInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') joinRoomBtn.click();
});

roomInput.addEventListener('input', () => {
  roomInput.value = sanitizeRoomName(roomInput.value);
  joinRoomBtn.disabled = !roomInput.value;
});

roomNameEl.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    roomNameEl.textContent = '\u2713 Copied!';
    setTimeout(() => {
      if (state.roomName) roomNameEl.textContent = `#${state.roomName}`;
    }, 1000);
  } catch {}
});

leaveBtn.addEventListener('click', () => {
  location.hash = '';
});

backBtn.addEventListener('click', () => {
  location.hash = '';
});

shareBtn.addEventListener('click', () => {
  if (state.screenStream) stopSharing();
  else startSharing();
});

fullscreenBtn.addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    screenShareEl.requestFullscreen?.();
  }
});

document.addEventListener('fullscreenchange', () => {
  fullscreenBtn.innerHTML = document.fullscreenElement ? ICON.collapse : ICON.expand;
});

starBtn.addEventListener('click', () => {
  if (state.roomName) toggleStarRoom(state.roomName);
});

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.style.colorScheme === 'dark'
    || (!document.documentElement.style.colorScheme && matchMedia('(prefers-color-scheme: dark)').matches);
  const next = isDark ? 'light' : 'dark';
  document.documentElement.style.colorScheme = next;
  localStorage.setItem(LS.theme, next);
  themeToggle.innerHTML = next === 'dark' ? ICON.sun : ICON.moon;
});

chatSendBtn.addEventListener('click', sendChatMessage);

chatInput.addEventListener('input', () => {
  chatSendBtn.disabled = !chatInput.value.trim();
});

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendChatMessage();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'm' && state.roomName && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    toggleMute();
  }
});

window.addEventListener('hashchange', navigate);
window.addEventListener('beforeunload', leaveRoomSync);
window.addEventListener('pagehide', leaveRoomSync);

const savedTheme = localStorage.getItem(LS.theme);
if (savedTheme) document.documentElement.style.colorScheme = savedTheme;
const isDarkNow = savedTheme === 'dark' || (!savedTheme && matchMedia('(prefers-color-scheme: dark)').matches);
themeToggle.innerHTML = isDarkNow ? ICON.sun : ICON.moon;
createRoomBtn.innerHTML = `${ICON.plus} Create Room`;
joinRoomBtn.innerHTML = ICON.arrowRight;
leaveBtn.innerHTML = ICON.leave;
shareBtn.innerHTML = ICON.monitor;
fullscreenBtn.innerHTML = ICON.expand;
chatSendBtn.innerHTML = ICON.send;
backBtn.innerHTML = ICON.arrowLeft;

renderStarredRooms();
navigate();
