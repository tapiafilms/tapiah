/* ==========================================================================
   TAPIA STUDIO — INTERACTIVE CLIENT LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initSpotlightCanvas();
  initComparisonSlider();
  initAudioPlayer();
  init3DTiltCards();
});

/* --------------------------------------------------------------------------
   0. MOBILE MENU
   -------------------------------------------------------------------------- */
window.toggleMobileMenu = function() {
  const burger = document.getElementById('burger-btn');
  const menu = document.getElementById('mobile-menu');
  burger.classList.toggle('active');
  menu.classList.toggle('active');
};

window.closeMobileMenu = function() {
  const burger = document.getElementById('burger-btn');
  const menu = document.getElementById('mobile-menu');
  burger.classList.remove('active');
  menu.classList.remove('active');
};

/* --------------------------------------------------------------------------
   1. AMBIENT SPOTLIGHT CANVAS TRACKER
   -------------------------------------------------------------------------- */
function initSpotlightCanvas() {
  const canvas = document.getElementById('spotlight-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  let mouseX = width / 2;
  let mouseY = height / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function render() {
    // Smooth lerp follow
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;

    ctx.clearRect(0, 0, width, height);

    // Glowing Radial Spotlight
    const gradient = ctx.createRadialGradient(
      currentX, currentY, 0,
      currentX, currentY, 400
    );
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    gradient.addColorStop(0.5, 'rgba(96, 165, 250, 0.04)');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    requestAnimationFrame(render);
  }

  render();
}

/* --------------------------------------------------------------------------
   3. BEFORE / AFTER COLOR GRADE SLIDER
   -------------------------------------------------------------------------- */
function initComparisonSlider() {
  const slider = document.getElementById('comp-range-slider');
  const afterImg = document.getElementById('comparison-after');
  const handleLine = document.getElementById('comp-handle-line');

  if (!slider || !afterImg || !handleLine) return;

  slider.addEventListener('input', (e) => {
    const val = e.target.value;
    afterImg.style.width = `${val}%`;
    handleLine.style.left = `${val}%`;
  });
}

/* --------------------------------------------------------------------------
   4. INTERACTIVE MUSIC PLAYER & CANVAS EQUALIZER
   -------------------------------------------------------------------------- */
const audioTracks = [
  {
    title: 'La Espera',
    genre: 'Banda Sonora Original',
    tempo: 80,
    cover: '/cover1.png',
    src: '/music/La%20Espera.mp3'
  },
  {
    title: 'Mi Juego',
    genre: 'Composición Cinematográfica',
    tempo: 95,
    cover: '/cover1.png',
    src: '/music/Mi%20Juego.mp3'
  },
  {
    title: 'Primera Revelación',
    genre: 'Ambient Orchestral',
    tempo: 70,
    cover: '/cover1.png',
    src: '/music/Primera%20Revelacion.mp3'
  },
  {
    title: 'Pulsaciones',
    genre: 'Electronic Score',
    tempo: 110,
    cover: '/cover1.png',
    src: '/music/Pulsaciones.mp3'
  },
  {
    title: 'Visita Nocturna',
    genre: 'Dark Ambient',
    tempo: 65,
    cover: '/cover1.png',
    src: '/music/Visita%20Nocturna.mp3'
  }
];

let isPlaying = false;
let currentTrackIdx = 0;
let animFrameId = null;

function initAudioPlayer() {
  const playBtn = document.getElementById('play-pause-btn');
  const canvas = document.getElementById('waveform-canvas');
  const audio = document.getElementById('audio-player');
  if (!playBtn || !canvas) return;

  playBtn.addEventListener('click', toggleAudioPlay);

  if (audio) {
    audio.addEventListener('ended', function() {
      isPlaying = false;
      const playSymbol = playBtn.querySelector('.play-symbol');
      playSymbol.textContent = '▶';
      playBtn.style.boxShadow = '0 6px 20px rgba(56, 189, 248, 0.4)';
    });
  }

  renderWaveformCanvas();
}

function toggleAudioPlay() {
  const audio = document.getElementById('audio-player');
  const playBtn = document.getElementById('play-pause-btn');
  const playSymbol = playBtn.querySelector('.play-symbol');
  const track = audioTracks[currentTrackIdx];

  if (!audio.src || audio.src === window.location.href) {
    if (track.src) {
      audio.src = track.src;
      audio.load();
    } else {
      isPlaying = false;
      playSymbol.textContent = '▶';
      return;
    }
  }

  if (isPlaying) {
    audio.pause();
    playSymbol.textContent = '▶';
    playBtn.style.boxShadow = '0 6px 20px rgba(56, 189, 248, 0.4)';
    isPlaying = false;
  } else {
    audio.play();
    playSymbol.textContent = '⏸';
    playBtn.style.boxShadow = '0 0 25px #38bdf8';
    isPlaying = true;
  }
}

window.switchTrack = function(idx) {
  currentTrackIdx = idx;
  const track = audioTracks[idx];
  const audio = document.getElementById('audio-player');

  document.getElementById('audio-title').textContent = track.title;
  document.getElementById('audio-genre').textContent = track.genre;
  document.getElementById('audio-cover-img').src = track.cover;

  const pills = document.querySelectorAll('.track-pill');
  pills.forEach((p, i) => {
    p.classList.toggle('active', i === idx);
  });

  if (track.src) {
    audio.src = track.src;
    audio.load();
    if (!isPlaying) {
      toggleAudioPlay();
    } else {
      audio.play();
    }
  }
};

function renderWaveformCanvas() {
  const canvas = document.getElementById('waveform-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.parentElement.clientWidth || 500;
  const height = canvas.height = 40;

  const barCount = 45;
  const barWidth = width / barCount - 3;
  let phase = 0;

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < barCount; i++) {
      let barHeight;
      if (isPlaying) {
        barHeight = Math.sin(phase + i * 0.2) * 14 + Math.cos(phase * 1.5 + i * 0.1) * 8 + 18;
      } else {
        barHeight = Math.sin(i * 0.3) * 4 + 8;
      }

      const x = i * (barWidth + 3);
      const y = (height - barHeight) / 2;

      const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(1, '#818cf8');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 3);
      ctx.fill();
    }

    if (isPlaying) {
      phase += 0.1;
    }

    animFrameId = requestAnimationFrame(draw);
  }

  draw();
}

/* --------------------------------------------------------------------------
   5. LIGHTBOX & MODAL MANAGERS
   -------------------------------------------------------------------------- */
window.openLightbox = function(imgSrc, caption) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');

  img.src = imgSrc;
  cap.textContent = caption;
  modal.classList.add('active');
};

window.closeLightbox = function() {
  document.getElementById('lightbox-modal').classList.remove('active');
};

window.openModuleModal = function(type) {
  if (type === 'ai-designer') {
    openAIGallery();
    return;
  } else if (type === 'filmmaker') {
    openVideoModal();
    return;
  } else if (type === 'video-editor') {
    openEditorModal();
    return;
  } else if (type === 'charcoal-artist') {
    openCharcoalGallery();
    return;
  }
  
  const modal = document.getElementById('module-detail-modal');
  const body = document.getElementById('module-modal-body');
  modal.classList.add('active');
};

window.closeModuleModal = function() {
  document.getElementById('module-detail-modal').classList.remove('active');
};

/* --------------------------------------------------------------------------
   6. 3D TILT PHYSICS FOR GLASS CARDS
   -------------------------------------------------------------------------- */
function init3DTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0deg)';
    });
  });
}

/* --------------------------------------------------------------------------
   7. FORM SUBMISSION SIMULATION
   -------------------------------------------------------------------------- */
window.handleFormSubmit = function(event) {
  event.preventDefault();
  const status = document.getElementById('form-status');
  status.textContent = '⚡ ¡Mensaje enviado con éxito! Te contactaremos en las próximas 24 horas.';
  status.style.color = '#34d399';
  document.getElementById('contact-form').reset();
};

/* --------------------------------------------------------------------------
   8. VIDEO SHOWREEL MODAL & PLAYER
   -------------------------------------------------------------------------- */
const videoTracks = [
  {
    title: 'Atmósfera Urbana',
    sub: 'Cortometraje • 2024',
    thumb: '/imagen3.png',
    src: 'dQw4w9WgXcQ'
  },
  {
    title: 'Luz y Sombra',
    sub: 'Ensayo Visual • 2024',
    thumb: '/imagen2.png',
    src: '9bZkp7q19f0'
  },
  {
    title: 'Raíces',
    sub: 'Documental • 2023',
    thumb: '/imagen1.png',
    src: 'kJQP7kiw5Fk'
  },
  {
    title: 'Construcción Digital',
    sub: 'Brand Film • 2023',
    thumb: '/imagen4.png',
    src: 'fJ9rUzIMcZQ'
  },
  {
    title: 'Ensayo Lumínico',
    sub: 'Cortometraje • 2023',
    thumb: '/imagen3.png',
    src: 'RgKAFK5djSk'
  }
];

let currentVideoIdx = 0;
let isVideoPlaying = false;
let filmmakerYTPlayer = null;

window.openVideoModal = function() {
  document.getElementById('video-showreel-modal').classList.add('active');
  updateVideoPlayer(0);
};

window.closeVideoModal = function() {
  const modal = document.getElementById('video-showreel-modal');
  if (filmmakerYTPlayer && filmmakerYTPlayer.destroy) {
    filmmakerYTPlayer.destroy();
    filmmakerYTPlayer = null;
  }
  isVideoPlaying = false;
  updatePlayPauseIcon();
  modal.classList.remove('active');
};

window.selectVideo = function(idx) {
  updateVideoPlayer(idx);
};

function createFilmmakerYTPlayer(videoId) {
  const container = document.getElementById('filmmaker-video-container');
  container.innerHTML = '';
  const playerDiv = document.createElement('div');
  playerDiv.id = 'filmmaker-yt-player';
  container.appendChild(playerDiv);

  filmmakerYTPlayer = new YT.Player('filmmaker-yt-player', {
    height: '100%',
    width: '100%',
    videoId: videoId,
    playerVars: { playsinline: 1, controls: 0, modestbranding: 1, rel: 0 },
    events: {
      onStateChange: function(event) {
        if (event.data === YT.PlayerState.PLAYING) {
          isVideoPlaying = true;
          updatePlayPauseIcon();
          updateFilmmakerProgressLoop();
        } else if (event.data === YT.PlayerState.PAUSED) {
          isVideoPlaying = false;
          updatePlayPauseIcon();
        } else if (event.data === YT.PlayerState.ENDED) {
          isVideoPlaying = false;
          updatePlayPauseIcon();
          nextVideo();
        }
      }
    }
  });
}

function updateFilmmakerProgressLoop() {
  if (!filmmakerYTPlayer || !isVideoPlaying) return;
  const currentTime = document.getElementById('player-current-time');
  const duration = document.getElementById('player-duration');
  const bar = document.getElementById('video-progress-bar');
  if (filmmakerYTPlayer.getDuration) {
    const current = filmmakerYTPlayer.getCurrentTime();
    const total = filmmakerYTPlayer.getDuration();
    const percent = (current / total) * 100;
    if (bar) bar.style.width = percent + '%';
    if (currentTime) currentTime.textContent = formatTime(current);
    if (duration) duration.textContent = formatTime(total);
  }
  requestAnimationFrame(updateFilmmakerProgressLoop);
}

window.playFromPoster = function() {
  const poster = document.getElementById('filmmaker-poster');
  if (poster) poster.classList.add('hidden');
  if (!filmmakerYTPlayer) return;
  filmmakerYTPlayer.playVideo();
};

window.toggleVideoPlay = function() {
  const poster = document.getElementById('filmmaker-poster');
  if (poster && !poster.classList.contains('hidden')) {
    poster.classList.add('hidden');
  }
  if (!filmmakerYTPlayer) return;
  if (isVideoPlaying) {
    filmmakerYTPlayer.pauseVideo();
  } else {
    filmmakerYTPlayer.playVideo();
  }
};

window.prevVideo = function() {
  const newIdx = currentVideoIdx > 0 ? currentVideoIdx - 1 : videoTracks.length - 1;
  updateVideoPlayer(newIdx);
};

window.nextVideo = function() {
  const newIdx = currentVideoIdx < videoTracks.length - 1 ? currentVideoIdx + 1 : 0;
  updateVideoPlayer(newIdx);
};

window.seekVideo = function(e) {
  if (!filmmakerYTPlayer) return;
  const bar = e.currentTarget;
  const rect = bar.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const duration = filmmakerYTPlayer.getDuration();
  filmmakerYTPlayer.seekTo(percent * duration, true);
};

function updateVideoPlayer(idx) {
  currentVideoIdx = idx;
  const track = videoTracks[idx];
  document.getElementById('player-track-name').textContent = track.title;
  document.getElementById('player-track-sub').textContent = track.sub;
  document.getElementById('player-thumb').src = track.thumb;
  
  const poster = document.getElementById('filmmaker-poster');
  if (poster) {
    poster.classList.remove('hidden');
    poster.querySelector('.video-poster-img').src = track.thumb;
  }
  
  document.querySelectorAll('#video-showreel-modal .video-card').forEach(function(card, i) {
    card.classList.toggle('active', i === idx);
  });
  if (track.src) {
    loadYtApi(function() { createFilmmakerYTPlayer(track.src); });
  }
  isVideoPlaying = false;
  updatePlayPauseIcon();
}

function updatePlayPauseIcon() {
  const icon = document.getElementById('video-play-icon');
  if (icon) icon.textContent = isVideoPlaying ? '⏸' : '▶';
}

/* --------------------------------------------------------------------------
   9. VIDEO EDITOR MODAL & PLAYER
   -------------------------------------------------------------------------- */
const editorTracks = [
  {
    title: 'Showreel Edición 2024',
    sub: 'Reel Personal • 2024',
    thumb: '/imagen4.png',
    src: 'mXe8y4M8lwg'
  },
  {
    title: 'Gradación Cinematográfica',
    sub: 'DaVinci Resolve • 2024',
    thumb: '/imagen4.png',
    src: 'w5WELv8kB5g'
  },
  {
    title: 'Cortometraje "Raíces"',
    sub: 'Edición & Color • 2024',
    thumb: '/imagen3.png',
    src: 'kfD8eHHFyN8'
  },
  {
    title: 'Ensayo Visual "Luz"',
    sub: 'Post-Producción • 2023',
    thumb: '/imagen2.png',
    src: 'Iv8PrM5VpBM'
  },
  {
    title: 'Spot Publicitario',
    sub: 'VFX & Color • 2023',
    thumb: '/imagen1.png',
    src: 'x4l3Sayg5SU'
  }
];

let currentEditorIdx = 0;
let isEditorPlaying = false;
let editorCarouselOffset = 0;
let editorYTPlayer = null;
let ytApiLoaded = false;
let ytApiLoading = false;

function loadYtApi(callback) {
  if (ytApiLoaded) { callback(); return; }
  if (ytApiLoading) { window._ytApiCallback = callback; return; }
  ytApiLoading = true;
  window._ytApiCallback = callback;
  window.onYouTubeIframeAPIReady = function() {
    ytApiLoaded = true;
    if (window._ytApiCallback) window._ytApiCallback();
  };
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

function createEditorYTPlayer(videoId) {
  const container = document.getElementById('editor-video-container');
  container.innerHTML = '';
  const playerDiv = document.createElement('div');
  playerDiv.id = 'editor-yt-player';
  container.appendChild(playerDiv);

  editorYTPlayer = new YT.Player('editor-yt-player', {
    height: '100%',
    width: '100%',
    videoId: videoId,
    playerVars: { playsinline: 1, controls: 0, modestbranding: 1, rel: 0 },
    events: {
      onStateChange: function(event) {
        if (event.data === YT.PlayerState.PLAYING) {
          isEditorPlaying = true;
          updateEditorPlayPauseIcon();
          updateEditorProgressLoop();
        } else if (event.data === YT.PlayerState.PAUSED) {
          isEditorPlaying = false;
          updateEditorPlayPauseIcon();
        } else if (event.data === YT.PlayerState.ENDED) {
          isEditorPlaying = false;
          updateEditorPlayPauseIcon();
          nextEditorVideo();
        }
      }
    }
  });
}

function updateEditorProgressLoop() {
  if (!editorYTPlayer || !isEditorPlaying) return;
  const currentTime = document.getElementById('editor-current-time');
  const duration = document.getElementById('editor-duration');
  const bar = document.getElementById('editor-progress-bar');
  if (editorYTPlayer.getDuration) {
    const current = editorYTPlayer.getCurrentTime();
    const total = editorYTPlayer.getDuration();
    const percent = (current / total) * 100;
    if (bar) bar.style.width = percent + '%';
    if (currentTime) currentTime.textContent = formatTime(current);
    if (duration) duration.textContent = formatTime(total);
  }
  requestAnimationFrame(updateEditorProgressLoop);
}

window.openEditorModal = function() {
  document.getElementById('editor-showreel-modal').classList.add('active');
  updateEditorPlayer(0);
};

window.closeEditorModal = function() {
  const modal = document.getElementById('editor-showreel-modal');
  if (editorYTPlayer && editorYTPlayer.destroy) {
    editorYTPlayer.destroy();
    editorYTPlayer = null;
  }
  isEditorPlaying = false;
  updateEditorPlayPauseIcon();
  modal.classList.remove('active');
};

window.selectEditorVideo = function(idx) {
  updateEditorPlayer(idx);
  editorCarouselOffset = 0;
  updateEditorCarouselPosition();
};

window.moveEditorCarousel = function(dir) {
  const carousel = document.getElementById('editor-carousel');
  const cardWidth = 157;
  const maxOffset = Math.max(0, (editorTracks.length - 4) * cardWidth);
  editorCarouselOffset -= dir * cardWidth;
  editorCarouselOffset = Math.max(-maxOffset, Math.min(0, editorCarouselOffset));
  carousel.style.transform = 'translateX(' + editorCarouselOffset + 'px)';
  carousel.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
};

window.playFromEditorPoster = function() {
  const poster = document.getElementById('editor-poster');
  if (poster) poster.classList.add('hidden');
  if (!editorYTPlayer) return;
  editorYTPlayer.playVideo();
};

window.toggleEditorPlay = function() {
  const poster = document.getElementById('editor-poster');
  if (poster && !poster.classList.contains('hidden')) {
    poster.classList.add('hidden');
  }
  if (!editorYTPlayer) return;
  if (isEditorPlaying) {
    editorYTPlayer.pauseVideo();
  } else {
    editorYTPlayer.playVideo();
  }
};

window.prevEditorVideo = function() {
  const newIdx = currentEditorIdx > 0 ? currentEditorIdx - 1 : editorTracks.length - 1;
  updateEditorPlayer(newIdx);
};

window.nextEditorVideo = function() {
  const newIdx = currentEditorIdx < editorTracks.length - 1 ? currentEditorIdx + 1 : 0;
  updateEditorPlayer(newIdx);
};

window.seekEditorVideo = function(e) {
  if (!editorYTPlayer) return;
  const bar = e.currentTarget;
  const rect = bar.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const duration = editorYTPlayer.getDuration();
  editorYTPlayer.seekTo(percent * duration, true);
};

function updateEditorPlayer(idx) {
  currentEditorIdx = idx;
  const track = editorTracks[idx];
  document.getElementById('editor-track-name').textContent = track.title;
  document.getElementById('editor-track-sub').textContent = track.sub;
  document.getElementById('editor-thumb').src = track.thumb;
  
  const poster = document.getElementById('editor-poster');
  if (poster) {
    poster.classList.remove('hidden');
    poster.querySelector('.video-poster-img').src = track.thumb;
  }
  
  document.querySelectorAll('#editor-carousel .video-card').forEach(function(card, i) {
    card.classList.toggle('active', i === idx);
  });
  if (track.src) {
    loadYtApi(function() { createEditorYTPlayer(track.src); });
  }
  isEditorPlaying = false;
  updateEditorPlayPauseIcon();
}

function updateEditorPlayPauseIcon() {
  const icon = document.getElementById('editor-play-icon');
  icon.textContent = isEditorPlaying ? '⏸' : '▶';
}

function updateEditorProgress() {
  // YouTube iframe handles its own progress
  const bar = document.getElementById('editor-progress-bar');
  const currentTime = document.getElementById('editor-current-time');
  const duration = document.getElementById('editor-duration');
  
  if (bar) {
    bar.style.width = '0%';
  }
  if (currentTime) {
    currentTime.textContent = '0:00';
  }
  if (duration) {
    duration.textContent = '0:00';
  }
}

function updateEditorCarouselPosition() {
  const carousel = document.getElementById('editor-carousel');
  carousel.style.transform = `translateX(${editorCarouselOffset}px)`;
  carousel.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
}

/* --------------------------------------------------------------------------
   10. IMAGE GALLERY MODALS
   -------------------------------------------------------------------------- */
window.openAIGallery = function() {
  document.getElementById('ai-gallery-modal').classList.add('active');
};

window.closeAIGallery = function() {
  document.getElementById('ai-gallery-modal').classList.remove('active');
};

window.openCharcoalGallery = function() {
  document.getElementById('charcoal-gallery-modal').classList.add('active');
};

window.closeCharcoalGallery = function() {
  document.getElementById('charcoal-gallery-modal').classList.remove('active');
};

window.openGalleryLightbox = function(imgSrc, caption) {
  const modal = document.getElementById('gallery-lightbox-modal');
  const img = document.getElementById('gallery-lightbox-img');
  const cap = document.getElementById('gallery-lightbox-caption');
  
  img.src = imgSrc;
  cap.textContent = caption;
  modal.classList.add('active');
};

window.closeGalleryLightbox = function() {
  document.getElementById('gallery-lightbox-modal').classList.remove('active');
};
