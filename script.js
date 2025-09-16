/* Simple but feature-rich music player (vanilla JS)
   Features:
   - Playlist rendering
   - Play/Pause, Prev/Next
   - Progress bar + click-to-seek
   - Volume control (saved in localStorage)
   - Shuffle and Repeat
   - Keyboard shortcuts
   - Remember last track (localStorage)
*/

const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progressContainer = document.getElementById('progress-container');
const progress = document.getElementById('progress');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const coverEl = document.getElementById('cover');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const playlistEl = document.getElementById('playlist');
const volumeEl = document.getElementById('volume');
const shuffleBtn = document.getElementById('shuffle');
const repeatBtn = document.getElementById('repeat');

let songs = [
  { title: " Rab Ne Bana Di Jodi", artist: "Artist A", src: "songs/song1.mp3", cover: "images/cover1.jpg" },
  { title: " YE TUNE KYA KIYA", artist: "Artist B", src: "songs/song2.mp3", cover: "images/cover2.jpg" },
  { title: " Wafa Ne Bewafai", artist: "Artist C", src: "songs/song3.mp3", cover: "images/cover3.jpg" },
  { title: " Kande kande Parasivana", artist: "Artist D", src: "songs/song4.mp3", cover: "images/cover4.jpg" },
  { title: " Hare Ram Hare Ram Ram Ram Hare Hare", artist: "Artist E", src: "songs/song5.mp3", cover: "images/cover5.jpg" },
  { title: " College Getalli Lyrics", artist: "Artist F", src: "songs/song6.mp3", cover: "images/cover6.jpg" },
  { title: " Teri Deewani", artist: "Artist G", src: "songs/song7.mp3", cover: "images/cover7.jpg" }
];

let currentIndex = Number(localStorage.getItem('mp-currentIndex')) || 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

// restore volume from storage
const savedVolume = localStorage.getItem('mp-volume');
if (savedVolume !== null) {
  volumeEl.value = savedVolume;
  audio.volume = savedVolume / 100;
} else {
  audio.volume = volumeEl.value / 100;
}

// Render playlist
function renderPlaylist() {
  playlistEl.innerHTML = '';
  songs.forEach((s, i) => {
    const li = document.createElement('li');
    li.dataset.index = i;
    li.tabIndex = 0;
    li.innerHTML = `
      <span class="meta">${s.title} <span class="meta"> — ${s.artist}</span></span>
    `;
    li.addEventListener('click', () => { loadTrack(i); playSong(); });
    li.addEventListener('keydown', (e) => { if (e.key === 'Enter') { loadTrack(i); playSong(); }});
    playlistEl.appendChild(li);
  });
  updateActiveList();
}

function updateActiveList() {
  [...playlistEl.children].forEach(li => {
    li.classList.toggle('active', Number(li.dataset.index) === currentIndex);
  });
}

// Load track metadata into UI & audio
function loadTrack(index) {
  if (index < 0) index = songs.length - 1;
  if (index >= songs.length) index = 0;
  currentIndex = index;
  const s = songs[currentIndex];
  audio.src = s.src;
  titleEl.textContent = s.title;
  artistEl.textContent = s.artist;
  coverEl.src = s.cover || 'images/cover1.jpg';
  audio.load();

  localStorage.setItem('mp-currentIndex', currentIndex);
  updateActiveList();
}

// Play / Pause
function playSong() {
  audio.play().then(() => {
    isPlaying = true;
    playBtn.textContent = '⏸️';
  }).catch(err => {
    // playback might be blocked by browser autoplay policies
    console.warn("Playback failed:", err);
  });
}
function pauseSong() {
  audio.pause();
  isPlaying = false;
  playBtn.textContent = '▶️';
}
playBtn.addEventListener('click', () => {
  if (isPlaying) pauseSong();
  else playSong();
});

// Prev / Next
prevBtn.addEventListener('click', () => {
  if (audio.currentTime > 3) {
    audio.currentTime = 0; // restart track if >3s
  } else {
    changeTrack(-1);
  }
});
nextBtn.addEventListener('click', () => changeTrack(1));

function changeTrack(direction = 1) {
  if (isShuffle && direction === 1) {
    // choose random next
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * songs.length);
    } while (nextIndex === currentIndex && songs.length > 1);
    currentIndex = nextIndex;
  } else {
    currentIndex = (currentIndex + direction + songs.length) % songs.length;
  }
  loadTrack(currentIndex);
  playSong();
}

// Update progress bar and time
audio.addEventListener('timeupdate', (e) => {
  const { currentTime, duration } = e.target;
  if (duration && isFinite(duration)) {
    const percent = (currentTime / duration) * 100;
    progress.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(currentTime);
  }
});

audio.addEventListener('loadedmetadata', () => {
  if (audio.duration && isFinite(audio.duration)) {
    durationEl.textContent = formatTime(audio.duration);
  } else {
    durationEl.textContent = '0:00';
  }
});

// Seek on progress click
progressContainer.addEventListener('click', (e) => {
  const rect = progressContainer.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;
  const ratio = clickX / width;
  if (audio.duration && isFinite(audio.duration)) {
    audio.currentTime = ratio * audio.duration;
  }
});

// Format time mm:ss
function formatTime(time) {
  if (!time || !isFinite(time)) return '0:00';
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// When a song ends
audio.addEventListener('ended', () => {
  if (isRepeat) {
    audio.currentTime = 0;
    playSong();
  } else {
    changeTrack(1);
  }
});

// Volume control
volumeEl.addEventListener('input', (e) => {
  audio.volume = e.target.value / 100;
  localStorage.setItem('mp-volume', e.target.value);
});

// Shuffle & Repeat toggles
shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.style.opacity = isShuffle ? '1' : '0.65';
  shuffleBtn.classList.toggle('active', isShuffle);
});
repeatBtn.addEventListener('click', () => {
  isRepeat = !isRepeat;
  // visually reflect repeat as a toggled button
  repeatBtn.style.opacity = isRepeat ? '1' : '0.65';
  repeatBtn.classList.toggle('active', isRepeat);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // ignore if focused on input/range
  const tag = document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (isPlaying) pauseSong(); else playSong();
  } else if (e.code === 'ArrowRight') {
    changeTrack(1);
  } else if (e.code === 'ArrowLeft') {
    changeTrack(-1);
  } else if (e.code === 'ArrowUp') {
    e.preventDefault();
    let v = Math.min(100, Number(volumeEl.value) + 5);
    volumeEl.value = v;
    volumeEl.dispatchEvent(new Event('input'));
  } else if (e.code === 'ArrowDown') {
    e.preventDefault();
    let v = Math.max(0, Number(volumeEl.value) - 5);
    volumeEl.value = v;
    volumeEl.dispatchEvent(new Event('input'));
  }
});

// Initial setup
renderPlaylist();
loadTrack(currentIndex);

// If you want autoplay the last track (uncomment), but browsers may block autoplay:
// playSong();
