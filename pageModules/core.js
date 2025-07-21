import { renderTemplate } from "./templates.js";
import {
  initializeNavbarElements,
  bindNavbarEvents,
  updateNavbarNowPlaying,
  updateNavbarPlayPauseButton,
  updatePopupProgress,
  updateDropdownCounts,
  openNowPlayingPopup,
  closeNowPlayingPopup,
  updateNowPlayingPopup,
  toggleDropdownMenu,
  openDropdownMenu,
  closeDropdownMenu,
  enhancedThemeToggle,
  getNavbarState,
  setNavbarState
} from './navBar.js';




let currentSong = null;
let currentArtist = null;
let currentAlbum = null;
let isPlaying = false;
let currentTime = 0;
let duration = 0;
let queue = [];
let recentlyPlayed = [];
let favorites = new Set();
let isDragging = false;
let currentPage = "home";
let loadingProgress = 0;
let loadingTimer = null;
let similarArtistsCarousel = null;
let albumSelector = null;

const elements = {};




function initializeElements() {
  const ids = [
    "home-page",
    "artist-page",
    "featured-artists",
    "navbar",
    "navbar-logo",
    "navbar-album-cover",
    "navbar-now-playing",
    "navbar-song-title",
    "navbar-artist",
    "breadcrumb",
    "breadcrumb-home",
    "breadcrumb-artist",
    "breadcrumb-album",
    "now-playing-overlay",
    "now-playing-card",
    "now-playing-cover",
    "now-playing-title",
    "now-playing-artist",
    "now-playing-album",
    "close-now-playing",
    "play-pause-btn",
    "play-icon",
    "pause-icon",
    "prev-btn",
    "next-btn",
    "shuffle-btn",
    "repeat-btn",
    "progress-bar",
    "progress-fill",
    "progress-thumb",
    "current-time",
    "total-time",
    "queue-tab",
    "recent-tab",
    "queue-list",
    "recent-list",
    "theme-toggle",
  ];

  ids.forEach((id) => {
    const camelCaseId = id.replace(/-(\w)/g, (_, c) => c.toUpperCase());
    elements[camelCaseId] = document.getElementById(id);
  });

  if (!elements.homePage || !elements.artistPage || !elements.featuredArtists) {
    throw new Error("Essential page elements are missing from the DOM.");
  }
}

function createPopoverPortal() {
  let portal = document.getElementById('popover-portal');
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'popover-portal';
    portal.className = 'popover-portal';
    document.body.appendChild(portal);
  }
  return portal;
}




function getArtistImageUrl(artistName) {
  if (!artistName) return getDefaultArtistImage();
  const normalizedName = normalizeNameForUrl(artistName);
  return `https://koders.cloud/global/content/images/artistPortraits/${normalizedName}.png`;
}

function getAlbumImageUrl(albumName) {
  if (!albumName) return getDefaultAlbumImage();
  const normalizedName = normalizeNameForUrl(albumName);
  return `https://koders.cloud/global/content/images/albumCovers/${normalizedName}.png`;
}

function normalizeNameForUrl(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function getDefaultArtistImage() {
  return 'https://koders.cloud/global/content/images/artistPortraits/default-artist.png';
}

function getDefaultAlbumImage() {
  return 'https://koders.cloud/global/content/images/albumCovers/default-album.png';
}

function loadImageWithFallback(imgElement, primaryUrl, fallbackUrl, type = 'image') {
  if (!imgElement) return;

  const testImage = new Image();
  
  testImage.onload = () => {
    imgElement.src = primaryUrl;
    imgElement.classList.remove('image-loading', 'image-error');
    imgElement.classList.add('image-loaded');
  };
  
  testImage.onerror = () => {
    const fallbackImage = new Image();
    
    fallbackImage.onload = () => {
      imgElement.src = fallbackUrl;
      imgElement.classList.remove('image-loading');
      imgElement.classList.add('image-loaded', 'image-fallback');
    };
    
    fallbackImage.onerror = () => {
      imgElement.classList.remove('image-loading');
      imgElement.classList.add('image-error');
      imgElement.src = generatePlaceholderImage(type);
    };
    
    fallbackImage.src = fallbackUrl;
  };
  
  imgElement.classList.add('image-loading');
  imgElement.classList.remove('image-loaded', 'image-error', 'image-fallback');
  testImage.src = primaryUrl;
}

function generatePlaceholderImage(type) {
  const isArtist = type === 'artist';
  const bgColor = isArtist ? '#4F46E5' : '#059669';
  const icon = isArtist ? 
    '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>' :
    '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>';
  
  const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="${bgColor}"/>
    <svg x="75" y="75" width="50" height="50" viewBox="0 0 24 24" fill="white">
      ${icon}
    </svg>
  </svg>`;
  
  return 'data:image/svg+xml;base64,' + btoa(svg);
}




async function playSong(songData) {
  if (!songData) return;
  
  if (elements.navbarNowPlaying) elements.navbarNowPlaying.style.opacity = "0.5";
  const navbarSongTitle = document.getElementById("navbar-song-title");
  if (navbarSongTitle) navbarSongTitle.textContent = "Loading...";
  
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  if (currentSong) addToRecentlyPlayed(currentSong);
  
  currentSong = songData;
  duration = parseDuration(songData.duration);
  currentTime = 0;
  isPlaying = true;
  
  updateNowPlayingInfo();
  updateNavbarInfo();
  updatePlayPauseButton();
  updateNavbarNowPlaying(elements);
  updateDropdownCounts();
  
  const nowPlayingPopup = document.getElementById("now-playing-popup");
  if (nowPlayingPopup?.classList.contains("show")) {
    updateNowPlayingPopup();
  }
  
  if (elements.navbarLogo) elements.navbarLogo.classList.add("hidden");
  if (elements.navbarAlbumCover) elements.navbarAlbumCover.classList.remove("hidden");
  if (elements.navbarNowPlaying) elements.navbarNowPlaying.style.opacity = "1";
  
  syncGlobalState();
}

function togglePlayPause() {
  if (!currentSong) return;
  isPlaying = !isPlaying;
  updatePlayPauseButton();
  updateNavbarPlayPauseButton();
  syncGlobalState();
}

function nextTrack() {
  if (queue.length > 0) {
    const nextSong = queue.shift();
    playSong(nextSong);
    updateQueueDisplay();
    updateDropdownCounts();
  } else {
    isPlaying = false;
    updatePlayPauseButton();
    updateNavbarPlayPauseButton();
    showNotification("End of queue");
  }
  syncGlobalState();
}

function previousTrack() {
  updateNavbarNowPlaying(elements);
  showNotification("Previous track not implemented");
}

function addToQueue(song, position = null) {
  if (position !== null) queue.splice(position, 0, song);
  else queue.push(song);
  updateQueueDisplay();
  updateDropdownCounts();
  syncGlobalState();
}

function addToRecentlyPlayed(song) {
  if (!song) return;
  recentlyPlayed = recentlyPlayed.filter((s) => s.id !== song.id);
  recentlyPlayed.unshift(song);
  if (recentlyPlayed.length > 20) recentlyPlayed.pop();
  updateRecentlyPlayedDisplay();
  updateDropdownCounts();
  syncGlobalState();
}




function updateNowPlayingInfo() {
  if (!currentSong) return;
  
  if (elements.nowPlayingCover) {
    const albumImageUrl = getAlbumImageUrl(currentSong.album);
    const fallbackUrl = getDefaultAlbumImage();
    loadImageWithFallback(elements.nowPlayingCover, albumImageUrl, fallbackUrl, 'album');
  }
  
  if (elements.nowPlayingTitle) elements.nowPlayingTitle.textContent = currentSong.title;
  if (elements.nowPlayingArtist) elements.nowPlayingArtist.textContent = currentSong.artist;
  if (elements.nowPlayingAlbum) elements.nowPlayingAlbum.textContent = currentSong.album;
  if (elements.totalTime) elements.totalTime.textContent = formatTime(duration);
}

function updateNavbarInfo() {
  if (!currentSong || !elements.navbarAlbumCover || !elements.navbarArtist || !elements.navbarSongTitle) return;
  
  const albumImageUrl = getAlbumImageUrl(currentSong.album);
  const fallbackUrl = getDefaultAlbumImage();
  loadImageWithFallback(elements.navbarAlbumCover, albumImageUrl, fallbackUrl, 'album');
  
  elements.navbarArtist.textContent = currentSong.artist;
  const title = currentSong.title;
  elements.navbarSongTitle.classList.toggle("marquee", title.length > 25);
  elements.navbarSongTitle.textContent = title;
}

function updatePlayPauseButton() {
  if (!elements.playIcon || !elements.pauseIcon) return;
  elements.playIcon.classList.toggle("hidden", isPlaying);
  elements.pauseIcon.classList.toggle("hidden", !isPlaying);
  updateNavbarPlayPauseButton();
}

function updateProgress() {
  if (duration === 0) return;
  const percent = (currentTime / duration) * 100;
  if (elements.progressFill) elements.progressFill.style.width = `${percent}%`;
  if (elements.currentTime) elements.currentTime.textContent = formatTime(currentTime);
}

function updateQueueDisplay() {
  if (!elements.queueList) return;
  
  if (queue.length > 0) {
    elements.queueList.innerHTML = queue.map((song) => 
      renderTemplate("queueItem", {
        ...song,
        cover: getAlbumImageUrl(song.album)
      })
    ).join("");
    
    elements.queueList.querySelectorAll('.queue-item-cover').forEach((img) => {
      const albumName = img.closest('.queue-item')?.querySelector('.queue-item-title')?.textContent;
      if (albumName) {
        const albumImageUrl = getAlbumImageUrl(albumName);
        const fallbackUrl = getDefaultAlbumImage();
        loadImageWithFallback(img, albumImageUrl, fallbackUrl, 'album');
      }
    });
  } else {
    elements.queueList.innerHTML = `<li class="p-4 text-center text-sm opacity-50">Queue is empty</li>`;
  }
}

function updateRecentlyPlayedDisplay() {
  if (!elements.recentList) return;
  
  if (recentlyPlayed.length > 0) {
    elements.recentList.innerHTML = recentlyPlayed.map((song) => 
      renderTemplate("queueItem", {
        ...song,
        cover: getAlbumImageUrl(song.album)
      })
    ).join("");
    
    elements.recentList.querySelectorAll('.queue-item-cover').forEach((img) => {
      const songData = recentlyPlayed.find(song => 
        img.closest('.queue-item')?.querySelector('.queue-item-title')?.textContent === song.title
      );
      if (songData) {
        const albumImageUrl = getAlbumImageUrl(songData.album);
        const fallbackUrl = getDefaultAlbumImage();
        loadImageWithFallback(img, albumImageUrl, fallbackUrl, 'album');
      }
    });
  } else {
    elements.recentList.innerHTML = `<li class="p-4 text-center text-sm opacity-50">No recently played songs</li>`;
  }
}

function updateBreadcrumb() {
  if (!elements.breadcrumb || !elements.breadcrumbArtist) return;
  const sep1 = document.getElementById("breadcrumb-sep1");
  if (currentPage === "home") {
    elements.breadcrumb.classList.add("hidden");
  } else {
    elements.breadcrumb.classList.remove("hidden");
    if (currentArtist) {
      elements.breadcrumbArtist.textContent = currentArtist.artist;
      elements.breadcrumbArtist.classList.remove("hidden");
      if (sep1) sep1.classList.remove("hidden");
    }
  }
}




function loadHomePage() {
  currentPage = "home";
  elements.homePage.classList.remove("hidden");
  elements.artistPage.classList.add("hidden");
  currentArtist = null;
  currentAlbum = null;
  
  cleanupCarousels();
  updateBreadcrumb();
  showLoadingBar();
  showSkeletonLoader(elements.featuredArtists, "220px", 4);
  
  setTimeout(() => {
    loadingProgress = 60;
    updateLoadingProgress();
    
    setTimeout(() => {
      renderRandomArtists();
      completeLoadingBar();
    }, 200);
  }, 500);
}

async function loadArtistPage(artist) {
  currentPage = "artist";
  currentArtist = artist;
  elements.homePage.classList.add("hidden");
  elements.artistPage.classList.remove("hidden");
  updateBreadcrumb();
  showLoadingBar();
  elements.artistPage.innerHTML = "";
  showSkeletonLoader(elements.artistPage, "400px", 1);
  
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  elements.artistPage.innerHTML = renderTemplate("enhancedArtist", {
    artist: artist.artist,
    genre: artist.genre,
    cover: getArtistImageUrl(artist.artist),
    albumCount: artist.albums.length,
    songCount: getTotalSongs(artist),
  });
  
  const artistHeaderImage = elements.artistPage.querySelector('.artist-avatar img');
  if (artistHeaderImage) {
    const artistImageUrl = getArtistImageUrl(artist.artist);
    const fallbackUrl = getDefaultArtistImage();
    loadImageWithFallback(artistHeaderImage, artistImageUrl, fallbackUrl, 'artist');
  }
  
  const similarContainer = document.getElementById("similar-artists-container");
  if (similarContainer && artist.similar) {
    similarArtistsCarousel = new SimilarArtistsCarousel(similarContainer);
    
    for (let i = 0; i < artist.similar.length; i++) {
      const similarArtistName = artist.similar[i];
      
      let similarArtistData = window.music?.find(a => a.artist === similarArtistName);
      
      if (!similarArtistData) {
        similarArtistData = {
          artist: similarArtistName,
          id: `similar-${i}`,
          albums: [],
          genre: "Unknown"
        };
      }
      
      setTimeout(() => {
        similarArtistsCarousel.addArtist(similarArtistData);
      }, i * 50);
    }
  }
  
  const albumsContainer = document.getElementById("albums-container");
  if (albumsContainer && artist.albums?.length > 0) {
    albumSelector = new AlbumSelector(albumsContainer, artist);
  }
  
  loadingProgress = 75;
  updateLoadingProgress();
  
  setTimeout(() => {
    completeLoadingBar();
    fadeInContent(elements.artistPage);
    bindDynamicPageEvents();
  }, 300);
}

function renderRandomArtists() {
  if (!window.music || window.music.length === 0) {
    elements.featuredArtists.innerHTML = "<p>No music library found.</p>";
    return;
  }
  
  const shuffled = [...window.music].sort(() => 0.5 - Math.random());
  const randomArtists = shuffled.slice(0, 4);
  elements.featuredArtists.innerHTML = "";
  
  randomArtists.forEach((artist) => {
    const artistElement = createElementFromHTML(
      renderTemplate("artistCard", {
        id: artist.id,
        artist: artist.artist,
        genre: artist.genre,
        cover: getArtistImageUrl(artist.artist),
        albumCount: artist.albums.length,
      })
    );
    
    const artistImage = artistElement?.querySelector('.artist-avatar');
    if (artistImage) {
      const artistImageUrl = getArtistImageUrl(artist.artist);
      const fallbackUrl = getDefaultArtistImage();
      loadImageWithFallback(artistImage, artistImageUrl, fallbackUrl, 'artist');
    }
    
    artistElement?.addEventListener("click", () => loadArtistPage(artist));
    if (artistElement) elements.featuredArtists.appendChild(artistElement);
  });
  
  fadeInContent(elements.featuredArtists);
}




function showLoadingBar() {
  if (document.getElementById("global-loading-bar")) return;
  
  loadingProgress = 0;
  const loadingBar = createElementFromHTML('<div id="global-loading-bar" class="loading-bar"></div>');
  if (loadingBar) {
    document.body.appendChild(loadingBar);
    
    setTimeout(() => {
      loadingBar.classList.add('active');
      startLoadingProgress();
    }, 10);
  }
}

function startLoadingProgress() {
  const loadingBar = document.getElementById("global-loading-bar");
  if (!loadingBar) return;
  
  loadingProgress = 0;
  updateLoadingProgress();
  
  loadingTimer = setInterval(() => {
    if (loadingProgress < 90) {
      const increment = loadingProgress < 30 ? 15 : loadingProgress < 60 ? 8 : 3;
      loadingProgress = Math.min(90, loadingProgress + increment);
      updateLoadingProgress();
    }
  }, 150);
}

function updateLoadingProgress() {
  const loadingBar = document.getElementById("global-loading-bar");
  if (loadingBar) {
    loadingBar.style.transform = `scaleX(${loadingProgress / 100})`;
  }
}

function completeLoadingBar() {
  if (loadingTimer) {
    clearInterval(loadingTimer);
    loadingTimer = null;
  }
  
  const loadingBar = document.getElementById("global-loading-bar");
  if (loadingBar) {
    loadingProgress = 100;
    loadingBar.style.transform = 'scaleX(1)';
    
    setTimeout(() => {
      loadingBar.classList.add('complete');
      setTimeout(() => loadingBar.remove(), 400);
    }, 100);
  }
}

function hideLoadingBar() {
  completeLoadingBar();
}

function showSkeletonLoader(element, height, count) {
  if (!element) return;
  element.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton";
    skeleton.style.height = height;
    element.appendChild(skeleton);
  }
}

function fadeInContent(element) {
  if (!element) return;
  element.classList.add("content-fade-in");
  setTimeout(() => element.classList.remove("content-fade-in"), 600);
}




function bindEvents() {
  window.addEventListener("scroll", () => {
    elements.navbar?.classList.toggle("floating", window.scrollY > 50);
  });

  elements.breadcrumbHome?.addEventListener("click", loadHomePage);
  elements.navbarAlbumCover?.addEventListener("click", openNowPlayingPopup);
  
  const navbarSongTitle = document.getElementById("navbar-song-title");
  navbarSongTitle?.addEventListener("click", openNowPlayingPopup);
  
  elements.closeNowPlaying?.addEventListener("click", closeNowPlaying);
  elements.nowPlayingOverlay?.addEventListener("click", (e) => {
    if (e.target === elements.nowPlayingOverlay) closeNowPlaying();
  });
  
  elements.playPauseBtn?.addEventListener("click", togglePlayPause);
  elements.prevBtn?.addEventListener("click", previousTrack);
  elements.nextBtn?.addEventListener("click", nextTrack);
  elements.progressBar?.addEventListener("click", seekTo);
  elements.progressThumb?.addEventListener("mousedown", startDrag);
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", endDrag);
  elements.queueTab?.addEventListener("click", () => switchTab("queue"));
  elements.recentTab?.addEventListener("click", () => switchTab("recent"));
}

function bindDynamicPageEvents() {
  document.querySelectorAll(".song-item").forEach((item) => {
    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);
    
    newItem.addEventListener("click", (e) => {
      if (!e.target.closest(".song-toolbar")) {
        try {
          const songData = JSON.parse(newItem.dataset.song);
          playSong(songData);
        } catch (err) {
          console.error("Failed to parse song data:", err);
        }
      }
    });
  });
  
  document.querySelectorAll(".song-toolbar button").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = button.dataset.action;
      if (action) handleToolbarAction(action, button);
    });
  });
  
  document.querySelector(".play-artist")?.addEventListener("click", (e) => {
    e.stopPropagation();
    playAllArtistSongs();
  });
  
  if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
}

function handleToolbarAction(action, button) {
  const songItem = button.closest(".song-item");
  if (!songItem) return;
  
  try {
    const songData = JSON.parse(songItem.dataset.song);
    const songId = songData.id;
    
    switch (action) {
      case "favorite":
        if (favorites.has(songId)) {
          favorites.delete(songId);
          button.classList.remove("active");
        } else {
          favorites.add(songId);
          button.classList.add("active");
        }
        break;
      case "play-next":
        addToQueue(songData, 0);
        showNotification("Added to play next");
        break;
      case "add-queue":
        addToQueue(songData);
        showNotification("Added to queue");
        break;
      case "share":
        shareSong(songData);
        break;
    }
  } catch (err) {
    console.error("Toolbar action failed:", err);
  }
}

function playAllArtistSongs() {
  if (!currentArtist) return;
  queue = [];
  currentArtist.albums.forEach((album) => {
    album.songs.forEach((song) => addToQueue({ 
      ...song, 
      artist: currentArtist.artist, 
      album: album.album, 
      cover: getAlbumImageUrl(album.album) 
    }));
  });
  if (queue.length > 0) playSong(queue.shift());
}

function seekTo(e) {
  if (isDragging || !currentSong || !elements.progressBar) return;
  const rect = elements.progressBar.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  currentTime = percent * duration;
  updateProgress();
}

function startDrag(e) {
  if (!currentSong) return;
  isDragging = true;
  e.preventDefault();
}

function onDrag(e) {
  if (!isDragging || !elements.progressBar) return;
  const rect = elements.progressBar.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  currentTime = percent * duration;
  updateProgress();
}

function endDrag() {
  isDragging = false;
}

function openNowPlaying() {
  if (!currentSong || !elements.nowPlayingOverlay || !elements.nowPlayingCard) return;
  elements.nowPlayingOverlay.classList.remove("hidden");
  setTimeout(() => {
    elements.nowPlayingOverlay.classList.add("visible");
    elements.nowPlayingCard.classList.add("visible");
  }, 10);
}

function closeNowPlaying() {
  if (!elements.nowPlayingOverlay || !elements.nowPlayingCard) return;
  elements.nowPlayingOverlay.classList.remove("visible");
  elements.nowPlayingCard.classList.remove("visible");
  setTimeout(() => elements.nowPlayingOverlay.classList.add("hidden"), 300);
}

function switchTab(tab) {
  if (!elements.queueTab || !elements.recentTab || !elements.queueList || !elements.recentList) return;
  const isQueue = tab === "queue";
  elements.queueTab.classList.toggle("active", isQueue);
  elements.recentTab.classList.toggle("active", !isQueue);
  elements.queueList.classList.toggle("hidden", !isQueue);
  elements.recentList.classList.toggle("hidden", isQueue);
}




function startProgressUpdate() {
  setInterval(() => {
    if (isPlaying && !isDragging && currentSong) {
      currentTime += 1;
      if (currentTime >= duration) {
        currentTime = duration;
        
        const navbarState = getNavbarState();
        
        if (navbarState.repeatMode === 2) {
          currentTime = 0;
          return;
        } else if (navbarState.repeatMode === 1 && queue.length === 0) {
          currentTime = 0;
          return;
        }
        
        nextTrack();
      }
      updateProgress();
      updatePopupProgress();
      
      window.currentTime = currentTime;
    }
  }, 1000);
}

function parseDuration(durationStr) {
  if (typeof durationStr !== "string") return 0;
  const parts = durationStr.split(":").map(Number);
  return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) ? parts[0] * 60 + parts[1] : 0;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getTotalSongs(artist) {
  return artist.albums.reduce((total, album) => total + album.songs.length, 0);
}

async function shareSong(song) {
  const shareData = {
    title: `${song.title} by ${song.artist}`,
    text: `Check out "${song.title}" by ${song.artist}`,
    url: window.location.href,
  };
  
  try {
    if (navigator.share && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      showNotification("Song shared!");
    } else {
      await navigator.clipboard.writeText(shareData.text);
      showNotification("Copied to clipboard");
    }
  } catch (err) {
    console.error("Share/Copy failed:", err);
    showNotification("Could not share or copy");
  }
}

function createElementFromHTML(htmlString) {
  const div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

function showNotification(message, type = 'info') {
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const typeClasses = {
    info: 'bg-blue-600 border-blue-500',
    success: 'bg-green-600 border-green-500',
    warning: 'bg-yellow-600 border-yellow-500',
    error: 'bg-red-600 border-red-500'
  };
  
  const notification = createElementFromHTML(`
    <div class="notification ${typeClasses[type] || typeClasses.info}">
      ${message}
    </div>
  `);
  
  if (!notification) return;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

function findArtistInLibrary(artistName) {
  if (!window.music || !artistName) return null;
  
  return window.music.find(artist => 
    artist.artist.toLowerCase().trim() === artistName.toLowerCase().trim()
  );
}

function cleanupCarousels() {
  if (similarArtistsCarousel) {
    similarArtistsCarousel.clear();
    similarArtistsCarousel = null;
  }
  
  if (albumSelector) {
    albumSelector = null;
  }
}




class SimilarArtistsCarousel {
  constructor(container) {
    this.container = container;
    this.scrollContainer = null;
    this.leftArrow = null;
    this.rightArrow = null;
    this.scrollPosition = 0;
    this.maxScroll = 0;
    this.itemWidth = 136;
    this.visibleItems = 0;
    
    this.init();
  }
  
  init() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="similar-artists-carousel">
        <button class="carousel-arrow left disabled" aria-label="Scroll left">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
        <div class="similar-artists-container" id="similar-artists-scroll-container"></div>
        <button class="carousel-arrow right" aria-label="Scroll right">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;
    
    this.scrollContainer = this.container.querySelector('#similar-artists-scroll-container');
    this.leftArrow = this.container.querySelector('.carousel-arrow.left');
    this.rightArrow = this.container.querySelector('.carousel-arrow.right');
    
    this.bindEvents();
    this.calculateDimensions();
  }
  
  bindEvents() {
    if (this.leftArrow) {
      this.leftArrow.addEventListener('click', () => this.scrollLeft());
    }
    
    if (this.rightArrow) {
      this.rightArrow.addEventListener('click', () => this.scrollRight());
    }
    
    if (this.scrollContainer) {
      this.scrollContainer.addEventListener('scroll', () => {
        this.updateArrowStates();
      });
    }
    
    window.addEventListener('resize', () => {
      this.calculateDimensions();
    });
  }

  calculateDimensions() {
    if (!this.scrollContainer) return;
    
    const containerWidth = this.scrollContainer.parentElement.clientWidth - 100;
    this.visibleItems = Math.floor(containerWidth / this.itemWidth);
    
    const totalItems = this.scrollContainer.children.length;
    this.maxScroll = Math.max(0, (totalItems - this.visibleItems) * this.itemWidth);
    
    this.updateArrowStates();
  }
  
  scrollLeft() {
    if (this.scrollPosition <= 0) return;
    
    this.scrollPosition = Math.max(0, this.scrollPosition - (this.visibleItems * this.itemWidth));
    this.updateScroll();
  }
  
  scrollRight() {
    if (this.scrollPosition >= this.maxScroll) return;
    
    this.scrollPosition = Math.min(this.maxScroll, this.scrollPosition + (this.visibleItems * this.itemWidth));
    this.updateScroll();
  }
  
  updateScroll() {
    if (!this.scrollContainer) return;
    
    this.scrollContainer.style.transform = `translateX(-${this.scrollPosition}px)`;
    this.updateArrowStates();
  }
  
  updateArrowStates() {
    if (!this.leftArrow || !this.rightArrow) return;
    
    if (this.scrollPosition <= 0) {
      this.leftArrow.classList.add('disabled');
    } else {
      this.leftArrow.classList.remove('disabled');
    }
    
    if (this.scrollPosition >= this.maxScroll) {
      this.rightArrow.classList.add('disabled');
    } else {
      this.rightArrow.classList.remove('disabled');
    }
  }
  
  addArtist(artistData) {
    if (!this.scrollContainer) return;
    
    const artistElement = this.createArtistCard(artistData);
    this.scrollContainer.appendChild(artistElement);
    this.calculateDimensions();
    
    this.bindArtistEvents(artistElement, artistData);
  }
  
  createArtistCard(artistData) {
    const artistElement = createElementFromHTML(`
      <div class="similar-artist-card" data-artist-name="${artistData.artist}">
        <div class="similar-artist-image">
          <img src="${getArtistImageUrl(artistData.artist)}" alt="${artistData.artist}" class="w-full h-full object-cover">
        </div>
        <div class="similar-artist-name">${artistData.artist}</div>
        <div class="artist-popover">
          <div class="popover-artist-name">${artistData.artist}</div>
          <div class="popover-stats">
            ${artistData.albums ? artistData.albums.length : 0} Albums<br>
            ${artistData.albums ? getTotalSongs(artistData) : 0} Songs
          </div>
          <button class="popover-button" data-artist-id="${artistData.id}">See Artist</button>
        </div>
      </div>
    `);
    
    return artistElement;
  }
   
  bindArtistEvents(artistElement, artistData) {
    let hoverTimeout;
    const originalPopover = artistElement.querySelector('.artist-popover');
    const portal = document.querySelector('.popover-portal');

    if (!portal || !originalPopover) return;

    let activePopover = null;

    const showPopover = () => {
      const rect = artistElement.getBoundingClientRect();

      activePopover = originalPopover.cloneNode(true);
      activePopover.classList.add('visible');

      activePopover.style.position = 'absolute';
      activePopover.style.top = `${window.scrollY + rect.top - 12}px`;
      activePopover.style.left = `${window.scrollX + rect.left + rect.width / 2}px`;
      activePopover.style.transform = 'translate(-50%, -100%)';
      activePopover.style.zIndex = '100000000';

      portal.appendChild(activePopover);

      const seeArtistBtn = activePopover.querySelector('.popover-button');
      if (seeArtistBtn) {
        seeArtistBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (activePopover) activePopover.remove();

          const artist = window.music?.find(a => a.artist === artistData.artist);
          if (artist) {
            loadArtistPage(artist);
          } else {
            showNotification(`Artist "${artistData.artist}" not found in library`);
          }
        });
      }
    };

    const hidePopover = () => {
      clearTimeout(hoverTimeout);
      if (activePopover) {
        activePopover.remove();
        activePopover = null;
      }
    };

    artistElement.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(showPopover, 300);
    });

    artistElement.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      setTimeout(hidePopover, 150);
    });
  }  
  
  clear() {
    if (this.scrollContainer) {
      this.scrollContainer.innerHTML = '';
      this.scrollPosition = 0;
      this.maxScroll = 0;
      this.updateArrowStates();
    }
  }
}

class AlbumSelector {
  constructor(container, artist) {
    this.container = container;
    this.artist = artist;
    this.currentAlbumIndex = 0;
    this.albumContent = null;
    
    this.init();
  }
  
  init() {
    if (!this.container || !this.artist?.albums?.length) return;
    
    this.currentAlbumIndex = this.findLatestAlbumIndex();
    
    this.render();
    this.bindEvents();
  }
  
  findLatestAlbumIndex() {
    if (this.artist.albums.some(album => album.year)) {
      return this.artist.albums.reduce((latestIndex, album, index) => {
        const currentYear = parseInt(album.year) || 0;
        const latestYear = parseInt(this.artist.albums[latestIndex].year) || 0;
        return currentYear > latestYear ? index : latestIndex;
      }, 0);
    }
    
    return this.artist.albums.length - 1;
  }
  
  render() {
    this.container.innerHTML = `
      <div class="album-selector-container">
        <div class="album-selector-tabs" id="album-tabs"></div>
        <div class="single-album-display">
          <div class="album-content" id="album-content"></div>
        </div>
      </div>
    `;
    
    this.renderTabs();
    this.renderCurrentAlbum();
  }
  
  renderTabs() {
    const tabsContainer = this.container.querySelector('#album-tabs');
    if (!tabsContainer) return;
    
    this.artist.albums.forEach((album, index) => {
      const isActive = index === this.currentAlbumIndex;
      const tabElement = createElementFromHTML(`
        <button class="album-tab ${isActive ? 'active' : ''}" data-album-index="${index}">
          ${album.album}
          ${album.year ? `<span class="text-xs opacity-70 ml-1">(${album.year})</span>` : ''}
        </button>
      `);
      
      tabsContainer.appendChild(tabElement);
    });
  }
  
  bindEvents() {
    const tabsContainer = this.container.querySelector('#album-tabs');
    if (!tabsContainer) return;
    
    tabsContainer.addEventListener('click', (e) => {
      const tabButton = e.target.closest('.album-tab');
      if (!tabButton) return;
      
      const albumIndex = parseInt(tabButton.dataset.albumIndex);
      if (albumIndex !== this.currentAlbumIndex) {
        this.switchToAlbum(albumIndex);
      }
    });
  }
  
  switchToAlbum(albumIndex) {
    if (albumIndex < 0 || albumIndex >= this.artist.albums.length) return;
    
    const albumContent = this.container.querySelector('#album-content');
    if (!albumContent) return;
    
    albumContent.classList.add('fade-out');
    
    setTimeout(() => {
      this.updateActiveTabs(albumIndex);
      
      this.currentAlbumIndex = albumIndex;
      
      this.renderCurrentAlbum();
      
      albumContent.classList.remove('fade-out');
      albumContent.classList.add('fade-in');
      
      setTimeout(() => {
        albumContent.classList.remove('fade-in');
      }, 300);
      
    }, 150);
  }
  
  updateActiveTabs(activeIndex) {
    const tabs = this.container.querySelectorAll('.album-tab');
    tabs.forEach((tab, index) => {
      tab.classList.toggle('active', index === activeIndex);
    });
  }
  
  renderCurrentAlbum() {
    const albumContent = this.container.querySelector('#album-content');
    if (!albumContent) return;
    
    const album = this.artist.albums[this.currentAlbumIndex];
    if (!album) return;
    
    const albumId = album.album.replace(/\s+/g, "-").toLowerCase();
    
    albumContent.innerHTML = renderTemplate("singleAlbumCard", {
      album: album.album,
      cover: getAlbumImageUrl(album.album),
      year: album.year,
      songCount: album.songs.length,
      albumId: albumId,
    });
    
    const albumCoverImage = albumContent.querySelector('.album-cover');
    if (albumCoverImage) {
      const albumImageUrl = getAlbumImageUrl(album.album);
      const fallbackUrl = getDefaultAlbumImage();
      loadImageWithFallback(albumCoverImage, albumImageUrl, fallbackUrl, 'album');
    }
    
    const songsContainer = albumContent.querySelector(`#songs-container-${albumId}`);
    if (songsContainer) {
      album.songs.forEach((song, index) => {
        const songData = { 
          ...song, 
          artist: this.artist.artist, 
          album: album.album, 
          cover: getAlbumImageUrl(album.album) 
        };
        const songHtml = renderTemplate("songItem", {
          trackNumber: index + 1,
          title: song.title,
          duration: song.duration,
          id: song.id,
          songData: JSON.stringify(songData).replace(/"/g, "&quot;"),
        });
        songsContainer.insertAdjacentHTML("beforeend", songHtml);
      });
    }
    
    this.bindSongEvents(albumContent);
  }
  
  bindSongEvents(container) {
    container.querySelectorAll(".song-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (!e.target.closest(".song-toolbar")) {
          try {
            const songData = JSON.parse(item.dataset.song);
            playSong(songData);
          } catch (err) {
            console.error("Failed to parse song data:", err);
          }
        }
      });
    });
    
    container.querySelectorAll(".song-toolbar button").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = button.dataset.action;
        if (action) handleToolbarAction(action, button);
      });
    });
    
    const playAlbumBtn = container.querySelector(".play-album");
    if (playAlbumBtn) {
      playAlbumBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.playCurrentAlbum();
      });
    }
  }
  
  playCurrentAlbum() {
    const album = this.artist.albums[this.currentAlbumIndex];
    if (!album) return;
    
    queue = [];
    album.songs.forEach((song) => addToQueue({ 
      ...song, 
      artist: this.artist.artist, 
      album: album.album, 
      cover: getAlbumImageUrl(album.album) 
    }));
    
    if (queue.length > 0) {
      playSong(queue.shift());
      showNotification(`Playing "${album.album}"`);
    }
  }
}




function initializeApp() {
  try {
    initializeElements();
    
    const navbarElements = initializeNavbarElements();
    
    bindEvents();
    
    const coreFunctions = {
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
    };
    
    bindNavbarEvents(elements, coreFunctions);
    
    loadHomePage();
    startProgressUpdate();
    initializeTheme();
    createPopoverPortal();
    
    const nowPlayingArea = document.getElementById("now-playing-area");
    if (nowPlayingArea) {
      nowPlayingArea.classList.remove("has-song");
    }
    
    updateDropdownCounts();
    syncGlobalState();
    
    console.log("Enhanced Music Player with Navbar Module initialized successfully");
  } catch (error) {
    console.error("Enhanced initialization failed:", error);
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme-preference');
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light');
  }
  
  if (elements.themeToggle) {
    elements.themeToggle.removeEventListener("click", () => {});
    elements.themeToggle.addEventListener("click", enhancedThemeToggle);
  }
}

function syncGlobalState() {
  window.currentSong = currentSong;
  window.isPlaying = isPlaying;
  window.currentTime = currentTime;
  window.duration = duration;
  window.queue = queue;
  window.recentlyPlayed = recentlyPlayed;
  window.favorites = favorites;
  window.getAlbumImageUrl = getAlbumImageUrl;
  window.getDefaultAlbumImage = getDefaultAlbumImage;
  window.loadImageWithFallback = loadImageWithFallback;
  window.formatTime = formatTime;
  window.showNotification = showNotification;
  
  window.navbarModule = {
    openNowPlayingPopup,
    closeNowPlayingPopup,
    toggleDropdownMenu,
    openDropdownMenu,
    closeDropdownMenu,
    updateNavbarNowPlaying: () => updateNavbarNowPlaying(elements),
    updateDropdownCounts,
    getNavbarState,
    setNavbarState
  };
}

initializeApp();
