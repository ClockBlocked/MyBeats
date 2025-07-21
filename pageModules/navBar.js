// pageModules/navBar.js - Complete navbar functionality module

// State management for navbar
let playlists = [];
let favoriteArtists = new Set();
let isShuffleEnabled = false;
let repeatMode = 0; // 0: off, 1: repeat all, 2: repeat one
let isDraggingPopup = false;

// Navbar-specific elements (will be populated by initializeNavbarElements)
let navbarElements = {};

// Initialize navbar-specific elements
export function initializeNavbarElements() {
  const enhancedIds = [
    "menu-trigger",
    "dropdown-menu", 
    "dropdown-close",
    "now-playing-area",
    "play-indicator",
    "prev-btn-navbar",
    "next-btn-navbar", 
    "play-pause-navbar",
    "play-icon-navbar",
    "pause-icon-navbar",
    "now-playing-popup",
    "popup-close",
    "popup-album-cover",
    "popup-song-title",
    "popup-artist-name", 
    "popup-album-name",
    "popup-current-time",
    "popup-total-time",
    "popup-progress-bar",
    "popup-progress-fill",
    "popup-progress-thumb",
    "popup-play-pause-btn",
    "popup-play-icon",
    "popup-pause-icon",
    "popup-prev-btn",
    "popup-next-btn",
    "popup-shuffle-btn",
    "popup-repeat-btn",
    "popup-favorite-btn",
    "popup-queue-btn",
    "popup-share-btn",
    "popup-more-btn",
    // Dropdown menu items
    "favorite-songs",
    "favorite-artists", 
    "create-playlist",
    "recently-played",
    "queue-view",
    "search-music",
    "shuffle-all",
    "app-settings",
    "about-app",
    // Counters
    "favorite-songs-count",
    "favorite-artists-count",
    "recent-count", 
    "queue-count"
  ];

  enhancedIds.forEach((id) => {
    const camelCaseId = id.replace(/-(\w)/g, (_, c) => c.toUpperCase());
    navbarElements[camelCaseId] = document.getElementById(id);
  });

  return navbarElements;
}

// Bind all navbar events
export function bindNavbarEvents(coreElements, coreFunctions) {
  // Store references to core functions
  const {
    togglePlayPause,
    previousTrack,
    nextTrack,
    openNowPlaying,
    closeNowPlaying,
    switchTab,
    playSong,
    showNotification,
    shareSong,
    updateProgress,
    formatTime,
    getAlbumImageUrl,
    getDefaultAlbumImage,
    loadImageWithFallback
  } = coreFunctions;

  // Menu trigger and dropdown
  navbarElements.menuTrigger?.addEventListener("click", toggleDropdownMenu);
  navbarElements.dropdownClose?.addEventListener("click", closeDropdownMenu);
  
  // Now Playing triggers (album cover, song title, artist name)
  navbarElements.nowPlayingArea?.addEventListener("click", openNowPlayingPopup);
  coreElements.navbarAlbumCover?.addEventListener("click", (e) => {
    e.stopPropagation();
    openNowPlayingPopup();
  });
  
  // Navbar controls
  navbarElements.playPauseNavbar?.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePlayPause();
  });
  navbarElements.prevBtnNavbar?.addEventListener("click", (e) => {
    e.stopPropagation();
    previousTrack();
  });
  navbarElements.nextBtnNavbar?.addEventListener("click", (e) => {
    e.stopPropagation();
    nextTrack();
  });
  
  // Now Playing popup controls
  navbarElements.popupClose?.addEventListener("click", closeNowPlayingPopup);
  navbarElements.popupPlayPauseBtn?.addEventListener("click", togglePlayPause);
  navbarElements.popupPrevBtn?.addEventListener("click", previousTrack);
  navbarElements.popupNextBtn?.addEventListener("click", nextTrack);
  navbarElements.popupShuffleBtn?.addEventListener("click", () => toggleShuffle(showNotification));
  navbarElements.popupRepeatBtn?.addEventListener("click", () => toggleRepeat(showNotification));
  navbarElements.popupFavoriteBtn?.addEventListener("click", () => toggleCurrentSongFavorite(coreElements, showNotification));
  navbarElements.popupQueueBtn?.addEventListener("click", () => openQueueFromPopup(openNowPlaying, switchTab));
  navbarElements.popupShareBtn?.addEventListener("click", () => shareCurrentSong(coreElements, shareSong));
  navbarElements.popupMoreBtn?.addEventListener("click", () => showMoreOptions(showNotification));
  
  // Progress bar for popup
  navbarElements.popupProgressBar?.addEventListener("click", (e) => seekToPopup(e, coreElements, updateProgress));
  navbarElements.popupProgressThumb?.addEventListener("mousedown", (e) => startDragPopup(e, coreElements, updateProgress));
  
  // Dropdown menu items
  navbarElements.favoriteSongs?.addEventListener("click", () => openFavoriteSongs(coreElements, showNotification));
  navbarElements.favoriteArtists?.addEventListener("click", () => openFavoriteArtists(showNotification));
  navbarElements.createPlaylist?.addEventListener("click", () => createNewPlaylist(showNotification));
  navbarElements.recentlyPlayed?.addEventListener("click", () => openRecentlyPlayed(coreElements, openNowPlaying, switchTab, showNotification));
  navbarElements.queueView?.addEventListener("click", () => openQueueView(coreElements, openNowPlaying, switchTab, showNotification));
  navbarElements.searchMusic?.addEventListener("click", () => openSearch(showNotification));
  navbarElements.shuffleAll?.addEventListener("click", () => shuffleAllSongs(playSong, getAlbumImageUrl, showNotification));
  navbarElements.appSettings?.addEventListener("click", () => openSettings(showNotification));
  navbarElements.aboutApp?.addEventListener("click", () => showAbout(showNotification));
  
  // Enhanced theme toggle
  coreElements.themeToggle?.addEventListener("click", enhancedThemeToggle);
  
  // Click outside to close popups
  document.addEventListener("click", (e) => {
    if (navbarElements.dropdownMenu && 
        !navbarElements.dropdownMenu.contains(e.target) && 
        !navbarElements.menuTrigger?.contains(e.target)) {
      closeDropdownMenu();
    }
    
    if (navbarElements.nowPlayingPopup &&
        !navbarElements.nowPlayingPopup.contains(e.target) &&
        !navbarElements.nowPlayingArea?.contains(e.target)) {
      closeNowPlayingPopup();
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => handleEnhancedKeyboardShortcuts(e, {
    togglePlayPause,
    previousTrack,
    nextTrack,
    openNowPlaying,
    closeNowPlaying
  }));
}

// Dropdown Menu Functions
export function toggleDropdownMenu() {
  const isVisible = navbarElements.dropdownMenu?.classList.contains("show");
  if (isVisible) {
    closeDropdownMenu();
  } else {
    openDropdownMenu();
  }
}

export function openDropdownMenu() {
  if (!navbarElements.dropdownMenu || !navbarElements.menuTrigger) return;
  
  updateDropdownCounts();
  navbarElements.dropdownMenu.classList.add("show");
  navbarElements.menuTrigger.classList.add("active");
  
  // Close now playing popup if open
  closeNowPlayingPopup();
}

export function closeDropdownMenu() {
  if (!navbarElements.dropdownMenu || !navbarElements.menuTrigger) return;
  
  navbarElements.dropdownMenu.classList.remove("show");
  navbarElements.menuTrigger.classList.remove("active");
}

// Now Playing Popup Functions
export function openNowPlayingPopup() {
  // Access global state
  const currentSong = window.currentSong || null;
  
  if (!currentSong) {
    window.showNotification?.("No song currently playing");
    return;
  }
  
  if (!navbarElements.nowPlayingPopup) return;
  
  updateNowPlayingPopup();
  navbarElements.nowPlayingPopup.classList.add("show");
  
  // Close dropdown if open
  closeDropdownMenu();
  
  // Close original overlay if open
  const nowPlayingOverlay = document.getElementById("now-playing-overlay");
  if (nowPlayingOverlay?.classList.contains("visible")) {
    window.closeNowPlaying?.();
  }
}

export function closeNowPlayingPopup() {
  if (!navbarElements.nowPlayingPopup) return;
  navbarElements.nowPlayingPopup.classList.remove("show");
}

export function updateNowPlayingPopup() {
  const currentSong = window.currentSong || null;
  const duration = window.duration || 0;
  
  if (!currentSong) return;
  
  // Update album cover
  if (navbarElements.popupAlbumCover) {
    const albumImageUrl = window.getAlbumImageUrl?.(currentSong.album);
    const fallbackUrl = window.getDefaultAlbumImage?.();
    window.loadImageWithFallback?.(navbarElements.popupAlbumCover, albumImageUrl, fallbackUrl, 'album');
  }
  
  // Update text info
  if (navbarElements.popupSongTitle) navbarElements.popupSongTitle.textContent = currentSong.title;
  if (navbarElements.popupArtistName) navbarElements.popupArtistName.textContent = currentSong.artist;
  if (navbarElements.popupAlbumName) navbarElements.popupAlbumName.textContent = currentSong.album;
  if (navbarElements.popupTotalTime) navbarElements.popupTotalTime.textContent = window.formatTime?.(duration) || "0:00";
  
  updatePopupPlayPauseButton();
  updatePopupProgress();
  updatePopupButtons();
}

// Update navbar now playing display
export function updateNavbarNowPlaying(coreElements) {
  const currentSong = window.currentSong || null;
  const isPlaying = window.isPlaying || false;
  
  if (!currentSong) return;
  
  // Show/hide elements
  if (coreElements.navbarLogo) coreElements.navbarLogo.classList.add("hidden");
  if (coreElements.navbarAlbumCover) coreElements.navbarAlbumCover.classList.remove("hidden");
  if (navbarElements.playIndicator) navbarElements.playIndicator.classList.toggle("active", isPlaying);
  if (navbarElements.nowPlayingArea) navbarElements.nowPlayingArea.classList.add("has-song");
  
  // Update album cover
  if (coreElements.navbarAlbumCover) {
    const albumImageUrl = window.getAlbumImageUrl?.(currentSong.album);
    const fallbackUrl = window.getDefaultAlbumImage?.();
    window.loadImageWithFallback?.(coreElements.navbarAlbumCover, albumImageUrl, fallbackUrl, 'album');
  }
  
  // Update text
  if (coreElements.navbarSongTitle) {
    coreElements.navbarSongTitle.textContent = currentSong.title;
    // Add marquee effect for long titles
    const titleWidth = coreElements.navbarSongTitle.scrollWidth;
    const containerWidth = coreElements.navbarSongTitle.clientWidth;
    coreElements.navbarSongTitle.classList.toggle("marquee", titleWidth > containerWidth);
  }
  
  if (coreElements.navbarArtist) coreElements.navbarArtist.textContent = currentSong.artist;
  
  updateNavbarPlayPauseButton();
}

// Enhanced play/pause button updates
export function updateNavbarPlayPauseButton() {
  const isPlaying = window.isPlaying || false;
  
  if (!navbarElements.playIconNavbar || !navbarElements.pauseIconNavbar) return;
  navbarElements.playIconNavbar.classList.toggle("hidden", isPlaying);
  navbarElements.pauseIconNavbar.classList.toggle("hidden", !isPlaying);
  
  // Update play indicator
  if (navbarElements.playIndicator) {
    navbarElements.playIndicator.classList.toggle("active", isPlaying);
  }
  
  // Also update popup buttons
  updatePopupPlayPauseButton();
}

function updatePopupPlayPauseButton() {
  const isPlaying = window.isPlaying || false;
  
  if (!navbarElements.popupPlayIcon || !navbarElements.popupPauseIcon) return;
  navbarElements.popupPlayIcon.classList.toggle("hidden", isPlaying);
  navbarElements.popupPauseIcon.classList.toggle("hidden", !isPlaying);
}

export function updatePopupProgress() {
  const currentTime = window.currentTime || 0;
  const duration = window.duration || 0;
  
  if (duration === 0) return;
  const percent = (currentTime / duration) * 100;
  if (navbarElements.popupProgressFill) navbarElements.popupProgressFill.style.width = `${percent}%`;
  if (navbarElements.popupCurrentTime) navbarElements.popupCurrentTime.textContent = window.formatTime?.(currentTime) || "0:00";
}

function updatePopupButtons() {
  const currentSong = window.currentSong || null;
  const favorites = window.favorites || new Set();
  
  if (!currentSong) return;
  
  // Update shuffle button
  if (navbarElements.popupShuffleBtn) {
    navbarElements.popupShuffleBtn.classList.toggle("active", isShuffleEnabled);
  }
  
  // Update repeat button
  if (navbarElements.popupRepeatBtn) {
    navbarElements.popupRepeatBtn.classList.remove("active");
    if (repeatMode > 0) {
      navbarElements.popupRepeatBtn.classList.add("active");
    }
  }
  
  // Update favorite button
  if (navbarElements.popupFavoriteBtn) {
    const isFavorite = favorites.has(currentSong.id);
    navbarElements.popupFavoriteBtn.classList.toggle("active", isFavorite);
  }
}

// Update dropdown counts
export function updateDropdownCounts() {
  const favorites = window.favorites || new Set();
  const recentlyPlayed = window.recentlyPlayed || [];
  const queue = window.queue || [];
  
  if (navbarElements.favoriteSongsCount) {
    navbarElements.favoriteSongsCount.textContent = favorites.size;
  }
  if (navbarElements.favoriteArtistsCount) {
    navbarElements.favoriteArtistsCount.textContent = favoriteArtists.size;
  }
  if (navbarElements.recentCount) {
    navbarElements.recentCount.textContent = recentlyPlayed.length;
  }
  if (navbarElements.queueCount) {
    navbarElements.queueCount.textContent = queue.length;
  }
}

// Progress bar handling for popup
function seekToPopup(e, coreElements, updateProgress) {
  const currentSong = window.currentSong || null;
  
  if (isDraggingPopup || !currentSong || !navbarElements.popupProgressBar) return;
  const rect = navbarElements.popupProgressBar.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  window.currentTime = percent * (window.duration || 0);
  updateProgress();
  updatePopupProgress();
}

function startDragPopup(e, coreElements, updateProgress) {
  const currentSong = window.currentSong || null;
  
  if (!currentSong) return;
  isDraggingPopup = true;
  e.preventDefault();
  
  const onDragPopup = (e) => {
    if (!isDraggingPopup || !navbarElements.popupProgressBar) return;
    const rect = navbarElements.popupProgressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    window.currentTime = percent * (window.duration || 0);
    updateProgress();
    updatePopupProgress();
  };
  
  const endDragPopup = () => {
    isDraggingPopup = false;
    document.removeEventListener("mousemove", onDragPopup);
    document.removeEventListener("mouseup", endDragPopup);
  };
  
  document.addEventListener("mousemove", onDragPopup);
  document.addEventListener("mouseup", endDragPopup);
}

// Control functions
function toggleShuffle(showNotification) {
  isShuffleEnabled = !isShuffleEnabled;
  updatePopupButtons();
  showNotification(isShuffleEnabled ? "Shuffle enabled" : "Shuffle disabled");
}

function toggleRepeat(showNotification) {
  repeatMode = (repeatMode + 1) % 3;
  updatePopupButtons();
  
  const messages = ["Repeat off", "Repeat all", "Repeat one"];
  showNotification(messages[repeatMode]);
}

function toggleCurrentSongFavorite(coreElements, showNotification) {
  const currentSong = window.currentSong || null;
  const favorites = window.favorites || new Set();
  
  if (!currentSong) return;
  
  const songId = currentSong.id;
  if (favorites.has(songId)) {
    favorites.delete(songId);
    showNotification("Removed from favorites");
  } else {
    favorites.add(songId);
    showNotification("Added to favorites");
  }
  
  updatePopupButtons();
  updateDropdownCounts();
}

function shareCurrentSong(coreElements, shareSong) {
  const currentSong = window.currentSong || null;
  if (currentSong) {
    shareSong(currentSong);
  }
}

function showMoreOptions(showNotification) {
  showNotification("More options coming soon");
}

function openQueueFromPopup(openNowPlaying, switchTab) {
  closeNowPlayingPopup();
  openNowPlaying();
  switchTab("queue");
}

// Dropdown menu functions
function openFavoriteSongs(coreElements, showNotification) {
  const favorites = window.favorites || new Set();
  
  closeDropdownMenu();
  if (favorites.size === 0) {
    showNotification("No favorite songs yet");
    return;
  }
  showNotification(`Viewing ${favorites.size} favorite songs`);
}

function openFavoriteArtists(showNotification) {
  closeDropdownMenu();
  if (favoriteArtists.size === 0) {
    showNotification("No favorite artists yet");
    return;
  }
  showNotification(`Viewing ${favoriteArtists.size} favorite artists`);
}

function createNewPlaylist(showNotification) {
  closeDropdownMenu();
  const playlistName = prompt("Enter playlist name:");
  if (playlistName && playlistName.trim()) {
    const playlist = {
      id: Date.now().toString(),
      name: playlistName.trim(),
      songs: [],
      created: new Date().toISOString()
    };
    playlists.push(playlist);
    showNotification(`Created playlist: ${playlist.name}`);
  }
}

function openRecentlyPlayed(coreElements, openNowPlaying, switchTab, showNotification) {
  const recentlyPlayed = window.recentlyPlayed || [];
  
  closeDropdownMenu();
  if (recentlyPlayed.length === 0) {
    showNotification("No recently played songs");
    return;
  }
  openNowPlaying();
  switchTab("recent");
}

function openQueueView(coreElements, openNowPlaying, switchTab, showNotification) {
  const queue = window.queue || [];
  
  closeDropdownMenu();
  if (queue.length === 0) {
    showNotification("Queue is empty");
    return;
  }
  openNowPlaying();
  switchTab("queue");
}

function openSearch(showNotification) {
  closeDropdownMenu();
  showNotification("Search feature coming soon");
}

function shuffleAllSongs(playSong, getAlbumImageUrl, showNotification) {
  closeDropdownMenu();
  if (!window.music || window.music.length === 0) {
    showNotification("No music library found");
    return;
  }
  
  // Collect all songs from all artists
  const allSongs = [];
  window.music.forEach(artist => {
    artist.albums.forEach(album => {
      album.songs.forEach(song => {
        allSongs.push({
          ...song,
          artist: artist.artist,
          album: album.album,
          cover: getAlbumImageUrl(album.album)
        });
      });
    });
  });
  
  if (allSongs.length === 0) {
    showNotification("No songs found");
    return;
  }
  
  // Shuffle the array
  for (let i = allSongs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
  }
  
  // Set up queue and play first song
  window.queue = allSongs.slice(1);
  playSong(allSongs[0]);
  isShuffleEnabled = true;
  updateDropdownCounts();
  showNotification(`Shuffling ${allSongs.length} songs`);
}

function openSettings(showNotification) {
  closeDropdownMenu();
  showNotification("Settings panel coming soon");
}

function showAbout(showNotification) {
  closeDropdownMenu();
  showNotification("Music Player v1.0 - Built with love");
}

// Enhanced theme toggle
export function enhancedThemeToggle() {
  document.documentElement.classList.toggle("light");
  const isDark = !document.documentElement.classList.contains("light");
  
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.innerHTML = isDark
      ? '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 116.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>'
      : '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/></svg>';
  }
  
  window.showNotification?.(`Switched to ${isDark ? 'dark' : 'light'} theme`);
}

// Enhanced keyboard shortcuts
function handleEnhancedKeyboardShortcuts(e, coreFunctions) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  const { togglePlayPause, previousTrack, nextTrack, openNowPlaying, closeNowPlaying } = coreFunctions;
  
  switch (e.key) {
    case ' ':
      e.preventDefault();
      togglePlayPause();
      break;
    case 'ArrowLeft':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        previousTrack();
      }
      break;
    case 'ArrowRight':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        nextTrack();
      }
      break;
    case 'n':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        openNowPlayingPopup();
      }
      break;
    case 'm':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        toggleDropdownMenu();
      }
      break;
    case 's':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        isShuffleEnabled = !isShuffleEnabled;
        updatePopupButtons();
        window.showNotification?.(isShuffleEnabled ? "Shuffle enabled" : "Shuffle disabled");
      }
      break;
    case 'f':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        toggleCurrentSongFavorite({}, window.showNotification || (() => {}));
      }
      break;
    case 'r':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        repeatMode = (repeatMode + 1) % 3;
        updatePopupButtons();
        const messages = ["Repeat off", "Repeat all", "Repeat one"];
        window.showNotification?.(messages[repeatMode]);
      }
      break;
    case 'Escape':
      closeNowPlayingPopup();
      closeDropdownMenu();
      closeNowPlaying();
      break;
  }
}

// Getter functions for external access to internal state
export function getNavbarState() {
  return {
    isShuffleEnabled,
    repeatMode,
    playlists,
    favoriteArtists
  };
}

export function setNavbarState(state) {
  if (state.isShuffleEnabled !== undefined) isShuffleEnabled = state.isShuffleEnabled;
  if (state.repeatMode !== undefined) repeatMode = state.repeatMode;
  if (state.playlists !== undefined) playlists = state.playlists;
  if (state.favoriteArtists !== undefined) favoriteArtists = state.favoriteArtists;
}













// Enhanced Now Playing Controller with Tab System and Auto-Return
class EnhancedNowPlayingController {
  constructor() {
    this.activeTab = 'nowPlaying';
    this.inactivityTimer = null;
    this.scrollPosition = 0;
    this.isScrolling = false;
    this.tabs = {
      nowPlaying: { element: null, content: null },
      upNext: { element: null, content: null },
      recentPlays: { element: null, content: null }
    };
    
    this.init();
  }
  
  init() {
    this.createTabSystem();
    this.bindEvents();
    this.startInactivityTimer();
  }
  
  createTabSystem() {
    const popup = document.getElementById('now-playing-popup');
    if (!popup) return;
    
    // Create tab structure
    const tabsHTML = `
      <div class="popup-tabs">
        <button class="popup-tab active" data-tab="nowPlaying">Now Playing</button>
        <button class="popup-tab" data-tab="upNext">Up Next</button>
        <button class="popup-tab" data-tab="recentPlays">Recent Plays</button>
      </div>
      <div class="popup-content">
        <div class="tab-content active" id="nowPlaying-content">
          <!-- Now playing content will be here -->
        </div>
        <div class="tab-content hidden" id="upNext-content">
          <div id="queue-list-popup"></div>
        </div>
        <div class="tab-content hidden" id="recentPlays-content">
          <div id="recent-list-popup"></div>
        </div>
      </div>
      <div class="scroll-indicator">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
        Scroll for more
      </div>
    `;
    
    // Insert after song info
    const songInfo = popup.querySelector('.popup-song-info');
    if (songInfo) {
      songInfo.insertAdjacentHTML('afterend', tabsHTML);
    }
    
    // Cache tab elements
    this.tabs.nowPlaying.element = popup.querySelector('[data-tab="nowPlaying"]');
    this.tabs.upNext.element = popup.querySelector('[data-tab="upNext"]');
    this.tabs.recentPlays.element = popup.querySelector('[data-tab="recentPlays"]');
    
    this.tabs.nowPlaying.content = popup.querySelector('#nowPlaying-content');
    this.tabs.upNext.content = popup.querySelector('#upNext-content');
    this.tabs.recentPlays.content = popup.querySelector('#recentPlays-content');
  }
  
  bindEvents() {
    const popup = document.getElementById('now-playing-popup');
    if (!popup) return;
    
    // Tab click events
    Object.values(this.tabs).forEach(tab => {
      if (tab.element) {
        tab.element.addEventListener('click', (e) => {
          const tabName = e.target.dataset.tab;
          this.switchTab(tabName);
          this.resetInactivityTimer();
        });
      }
    });
    
    // Scroll detection
    popup.addEventListener('scroll', (e) => {
      this.handleScroll(e);
    });
    
    // Mouse/touch activity detection
    popup.addEventListener('mousemove', () => this.resetInactivityTimer());
    popup.addEventListener('touchstart', () => this.resetInactivityTimer());
    popup.addEventListener('click', () => this.resetInactivityTimer());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (popup.classList.contains('show')) {
        this.handleKeyboard(e);
      }
    });
  }
  
  handleScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
    
    // If scrolled down significantly and currently on nowPlaying, switch to upNext
    if (scrollPercentage > 0.3 && this.activeTab === 'nowPlaying') {
      this.switchTab('upNext');
    }
    
    this.resetInactivityTimer();
  }
  
  switchTab(tabName, skipAnimation = false) {
    if (tabName === this.activeTab || !this.tabs[tabName]) return;
    
    const currentTab = this.tabs[this.activeTab];
    const newTab = this.tabs[tabName];
    
    // Update tab buttons
    Object.values(this.tabs).forEach(tab => {
      if (tab.element) {
        tab.element.classList.remove('active');
      }
    });
    newTab.element.classList.add('active');
    
    if (skipAnimation) {
      // Instant switch
      currentTab.content.classList.add('hidden');
      newTab.content.classList.remove('hidden');
      this.activeTab = tabName;
      this.updateTabContent(tabName);
    } else {
      // Animated transition
      currentTab.content.classList.add('fade-out');
      
      setTimeout(() => {
        currentTab.content.classList.add('hidden');
        currentTab.content.classList.remove('fade-out');
        
        newTab.content.classList.remove('hidden');
        newTab.content.classList.add('fade-in');
        
        setTimeout(() => {
          newTab.content.classList.remove('fade-in');
        }, 300);
        
        this.activeTab = tabName;
        this.updateTabContent(tabName);
      }, 150);
    }
  }
  
  updateTabContent(tabName) {
    switch (tabName) {
      case 'nowPlaying':
        this.updateNowPlayingContent();
        break;
      case 'upNext':
        this.updateQueueContent();
        break;
      case 'recentPlays':
        this.updateRecentContent();
        break;
    }
  }
  
  updateNowPlayingContent() {
    // Move existing now playing elements to the tab content
    const content = this.tabs.nowPlaying.content;
    const albumCover = document.getElementById('popup-album-cover');
    const songInfo = document.querySelector('.popup-song-info');
    const progress = document.querySelector('.popup-progress');
    const controls = document.querySelector('.popup-controls');
    const actions = document.querySelector('.popup-actions');
    
    if (content && !content.querySelector('.popup-album-cover')) {
      content.innerHTML = '';
      if (albumCover) content.appendChild(albumCover.cloneNode(true));
      if (songInfo) content.appendChild(songInfo.cloneNode(true));
      if (progress) content.appendChild(progress.cloneNode(true));
      if (controls) content.appendChild(controls.cloneNode(true));
      if (actions) content.appendChild(actions.cloneNode(true));
    }
  }
  
  updateQueueContent() {
    const content = document.getElementById('queue-list-popup');
    if (!content) return;
    
    const queue = window.queue || [];
    
    if (queue.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <div class="empty-state-text">No songs in queue<br>Add some music to get started!</div>
        </div>
      `;
      return;
    }
    
    content.innerHTML = queue.map((song, index) => `
      <div class="queue-item" data-index="${index}">
        <img class="queue-item-cover" src="${window.getAlbumImageUrl?.(song.album) || ''}" alt="${song.album}">
        <div class="queue-item-info">
          <h4 class="queue-item-title">${song.title}</h4>
          <p class="queue-item-artist">${song.artist}</p>
        </div>
        <span class="queue-item-duration">${song.duration}</span>
      </div>
    `).join('');
    
    // Add click handlers
    content.querySelectorAll('.queue-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.playFromQueue(index);
      });
    });
  }
  
  updateRecentContent() {
    const content = document.getElementById('recent-list-popup');
    if (!content) return;
    
    const recent = window.recentlyPlayed || [];
    
    if (recent.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="empty-state-text">No recently played songs<br>Start listening to build your history!</div>
        </div>
      `;
      return;
    }
    
    content.innerHTML = recent.map((song, index) => `
      <div class="recent-item" data-index="${index}">
        <img class="recent-item-cover" src="${window.getAlbumImageUrl?.(song.album) || ''}" alt="${song.album}">
        <div class="recent-item-info">
          <h4 class="recent-item-title">${song.title}</h4>
          <p class="recent-item-artist">${song.artist}</p>
        </div>
        <span class="recent-item-duration">${song.duration}</span>
      </div>
    `).join('');
    
    // Add click handlers
    content.querySelectorAll('.recent-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.playFromRecent(index);
      });
    });
  }
  
  playFromQueue(index) {
    const queue = window.queue || [];
    if (index >= 0 && index < queue.length) {
      const song = queue.splice(index, 1)[0];
      if (window.playSong) {
        window.playSong(song);
      }
      this.updateQueueContent();
      this.resetInactivityTimer();
    }
  }
  
  playFromRecent(index) {
    const recent = window.recentlyPlayed || [];
    if (index >= 0 && index < recent.length) {
      const song = recent[index];
      if (window.playSong) {
        window.playSong(song);
      }
      this.resetInactivityTimer();
    }
  }
  
  startInactivityTimer() {
    this.resetInactivityTimer();
  }
  
  resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    
    // Only set timer if not on nowPlaying tab
    if (this.activeTab !== 'nowPlaying') {
      this.inactivityTimer = setTimeout(() => {
        this.returnToNowPlaying();
      }, 10000); // 10 seconds
    }
  }
  
  returnToNowPlaying() {
    if (this.activeTab !== 'nowPlaying') {
      this.switchTab('nowPlaying');
      
      // Show a subtle notification
      if (window.showNotification) {
        window.showNotification('Returned to Now Playing', 'info');
      }
    }
  }
  
  handleKeyboard(e) {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.switchToPrevTab();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.switchToNextTab();
        break;
      case '1':
        e.preventDefault();
        this.switchTab('nowPlaying');
        break;
      case '2':
        e.preventDefault();
        this.switchTab('upNext');
        break;
      case '3':
        e.preventDefault();
        this.switchTab('recentPlays');
        break;
    }
    this.resetInactivityTimer();
  }
  
  switchToPrevTab() {
    const tabs = ['nowPlaying', 'upNext', 'recentPlays'];
    const currentIndex = tabs.indexOf(this.activeTab);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    this.switchTab(tabs[prevIndex]);
  }
  
  switchToNextTab() {
    const tabs = ['nowPlaying', 'upNext', 'recentPlays'];
    const currentIndex = tabs.indexOf(this.activeTab);
    const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
    this.switchTab(tabs[nextIndex]);
  }
  
  onPopupOpen() {
    this.switchTab('nowPlaying', true);
    this.updateTabContent('nowPlaying');
    this.resetInactivityTimer();
    
    // Show scroll indicator if there's content in other tabs
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const hasQueue = (window.queue || []).length > 0;
    const hasRecent = (window.recentlyPlayed || []).length > 0;
    
    if (scrollIndicator && (hasQueue || hasRecent)) {
      scrollIndicator.classList.add('show');
      setTimeout(() => {
        scrollIndicator.classList.remove('show');
      }, 3000);
    }
  }
  
  onPopupClose() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }
  
  // Public method to refresh content
  refresh() {
    this.updateTabContent(this.activeTab);
  }
}

// Initialize the enhanced controller
window.enhancedNowPlayingController = new EnhancedNowPlayingController();
