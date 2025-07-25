import { music } from '../library.js';

// Initialize music library
function initializeMusicLibrary() {
  window.music = music;
  console.log(`Music library loaded: ${window.music.length} artists`);
}

const player = {
  audioElement: null,
  currentSong: null,
  currentArtist: null,
  currentAlbum: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  queue: [],
  recentlyPlayed: [],
  favorites: new Set(),
  isDragging: false,
  loadingProgress: 0,
  loadingTimer: null,
  currentPage: "home",
  shuffleMode: false,
  repeatMode: "off", // "off", "one", "all"
  rewindInterval: 10,
  fastForwardInterval: 30,
  
  initializeAudio: function() {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      
      this.audioElement.addEventListener('timeupdate', () => {
        this.currentTime = this.audioElement.currentTime;
        this.updateProgress();
        navbar.updatePopupProgress();
      });
      
      this.audioElement.addEventListener('ended', () => {
        this.songEnd();
      });
      
      this.audioElement.addEventListener('loadedmetadata', () => {
        this.duration = this.audioElement.duration;
        if (navbar.elements.popupTotalTime) navbar.elements.popupTotalTime.textContent = helpers.formatTime(this.duration);
      });
      
      this.audioElement.addEventListener('play', () => {
        this.isPlaying = true;
        ui.updatePlayPauseButton();
        navbar.updateNavbarPlayPauseButton();
        this.updateMediaSessionPlaybackState();
      });
      
      this.audioElement.addEventListener('pause', () => {
        this.isPlaying = false;
        ui.updatePlayPauseButton();
        navbar.updateNavbarPlayPauseButton();
        this.updateMediaSessionPlaybackState();
      });
      
      this.audioElement.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        
        let errorMessage = 'Error playing audio file';
        if (e.target.error) {
          switch (e.target.error.code) {
            case 1:
              errorMessage = 'Playback aborted by user';
              break;
            case 2:
              errorMessage = 'Network error occurred';
              break;
            case 3:
              errorMessage = 'Audio file is corrupted or unsupported format';
              break;
            case 4:
              errorMessage = 'Audio format not supported by your browser';
              break;
          }
        }
        
        ui.showNotification(errorMessage, 'error');
      });
    }
  },
  
  playSong: async function(songData) {
    if (!songData) return;
    
    if (ui.elements.navbarNowPlaying) ui.elements.navbarNowPlaying.style.opacity = "0.5";
    const navbarSongTitle = document.getElementById("navbar-song-title");
    if (navbarSongTitle) navbarSongTitle.textContent = "Loading...";
    
    this.initializeAudio();
    
    if (this.currentSong) this.addToRecentlyPlayed(this.currentSong);
    
    this.currentSong = songData;
    this.currentArtist = songData.artist;
    this.currentAlbum = songData.album;
    
    const formats = ['mp3', 'ogg', 'm4a'];
    let loaded = false;
    let lastError = null;
    
    for (const format of formats) {
      if (loaded) break;
      
      try {
        const songFileName = songData.title.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '');
        const audioUrl = `https://test.koders.cloud/global/content/audio/${songFileName}.${format}`;
        
        console.log(`Attempting to play: ${audioUrl}`);
        
        if (this.isPlaying) {
          this.audioElement.pause();
        }
        
        this.audioElement.src = audioUrl;
        this.audioElement.load();
        
        await new Promise((resolve, reject) => {
          const loadErrorHandler = (e) => {
            this.audioElement.removeEventListener('error', loadErrorHandler);
            
            let errorMsg = 'Unknown error';
            if (e.target.error) {
              switch (e.target.error.code) {
                case 1: errorMsg = 'MEDIA_ERR_ABORTED'; break;
                case 2: errorMsg = 'MEDIA_ERR_NETWORK'; break; 
                case 3: errorMsg = 'MEDIA_ERR_DECODE - The file is corrupted or unsupported format'; break;
                case 4: errorMsg = 'MEDIA_ERR_SRC_NOT_SUPPORTED - Format not supported'; break;
              }
            }
            
            reject(new Error(`Format ${format}: ${errorMsg}`));
          };
          
          const loadedHandler = () => {
            this.audioElement.removeEventListener('error', loadErrorHandler);
            resolve();
          };
          
          this.audioElement.addEventListener('error', loadErrorHandler, {once: true});
          this.audioElement.addEventListener('canplaythrough', loadedHandler, {once: true});
          
          setTimeout(() => {
            reject(new Error(`Format ${format}: Loading timed out`));
          }, 5000);
        });
        
        loaded = true;
        this.currentTime = 0;
        this.isPlaying = true;
        
        await this.audioElement.play();
        
        ui.updateNowPlayingInfo();
        ui.updateNavbarInfo();
        ui.updatePlayPauseButton();
        navbar.updateNavbarNowPlaying();
        navbar.updateDropdownCounts();
        this.updateMediaSession();
        
        const nowPlayingPopup = document.getElementById("now-playing-popup");
        if (nowPlayingPopup?.classList.contains("show")) {
          navbar.updateNowPlayingPopup();
        }
        
        if (ui.elements.navbarLogo) ui.elements.navbarLogo.classList.add("hidden");
        if (ui.elements.navbarAlbumCover) ui.elements.navbarAlbumCover.classList.remove("hidden");
        if (ui.elements.navbarNowPlaying) ui.elements.navbarNowPlaying.style.opacity = "1";
        
        helpers.syncGlobalState();
        
      } catch (error) {
        console.warn(`Failed with format ${format}:`, error);
        lastError = error;
      }
    }
    
    if (!loaded) {
      console.error('All formats failed:', lastError);
      ui.showNotification(`Could not play "${songData.title}": Format not supported`, 'error');
      
      console.info('TROUBLESHOOTING TIPS:');
      console.info('1. Check that your MP3 files are valid and not corrupted');
      console.info('2. Add this to your .htaccess file:');
      console.info(`
# Proper MIME types for audio files
AddType audio/mpeg mp3
AddType audio/ogg ogg
AddType audio/mp4 m4a

# Add CORS headers to allow audio playback
<IfModule mod_headers.c>
  <FilesMatch "\\.(mp3|ogg|m4a)$">
    Header set Access-Control-Allow-Origin "*"
    Header set Content-Type "audio/mpeg"
  </FilesMatch>
</IfModule>
      `);
      
      if (ui.elements.navbarNowPlaying) ui.elements.navbarNowPlaying.style.opacity = "1";
      if (navbarSongTitle) navbarSongTitle.textContent = this.currentSong?.title || "";
    }
  },
  
  togglePlayPause: function() {
    if (!this.currentSong || !this.audioElement) return;
    
    if (this.isPlaying) {
      this.audioElement.pause();
    } else {
      this.audioElement.play();
    }
  },
  
  songEnd: function() {
    if (this.repeatMode === 'one') {
      this.audioElement.currentTime = 0;
      this.audioElement.play();
    } else if (this.queue.length > 0) {
      this.nextTrack();
    } else if (this.shuffleMode) {
      const albumIndex = window.music.findIndex(artist => artist.artist === this.currentArtist);
      if (albumIndex >= 0) {
        const artist = window.music[albumIndex];
        const albumObj = artist.albums.find(album => album.album === this.currentAlbum);
        if (albumObj && albumObj.songs.length > 0) {
          const randomIndex = Math.floor(Math.random() * albumObj.songs.length);
          const nextSong = {
            ...albumObj.songs[randomIndex],
            artist: artist.artist,
            album: albumObj.album,
            cover: helpers.getAlbumImageUrl(albumObj.album)
          };
          this.playSong(nextSong);
        } else {
          this.isPlaying = false;
          ui.updatePlayPauseButton();
          navbar.updateNavbarPlayPauseButton();
        }
      }
    } else if (this.repeatMode === 'all') {
      const albumIndex = window.music.findIndex(artist => artist.artist === this.currentArtist);
      if (albumIndex >= 0) {
        const artist = window.music[albumIndex];
        const albumObj = artist.albums.find(album => album.album === this.currentAlbum);
        if (albumObj && albumObj.songs.length > 0) {
          const songIndex = albumObj.songs.findIndex(song => song.title === this.currentSong.title);
          const nextSongIndex = (songIndex + 1) % albumObj.songs.length;
          const nextSong = {
            ...albumObj.songs[nextSongIndex],
            artist: artist.artist,
            album: albumObj.album,
            cover: helpers.getAlbumImageUrl(albumObj.album)
          };
          this.playSong(nextSong);
        }
      }
    } else {
      this.isPlaying = false;
      ui.updatePlayPauseButton();
      navbar.updateNavbarPlayPauseButton();
    }
    
    helpers.syncGlobalState();
  },
  
  nextTrack: function() {
    if (this.queue.length > 0) {
      const nextSong = this.queue.shift();
      this.playSong(nextSong);
      ui.updateQueueDisplay();
      navbar.updateDropdownCounts();
    } else {
      const albumIndex = window.music.findIndex(artist => artist.artist === this.currentArtist);
      if (albumIndex >= 0) {
        const artist = window.music[albumIndex];
        const albumObj = artist.albums.find(album => album.album === this.currentAlbum);
        if (albumObj && albumObj.songs.length > 0) {
          const songIndex = albumObj.songs.findIndex(song => song.title === this.currentSong.title);
          const nextSongIndex = (songIndex + 1) % albumObj.songs.length;
          const nextSong = {
            ...albumObj.songs[nextSongIndex],
            artist: artist.artist,
            album: albumObj.album,
            cover: helpers.getAlbumImageUrl(albumObj.album)
          };
          this.playSong(nextSong);
        } else {
          ui.showNotification("End of album");
        }
      } else {
        ui.showNotification("End of queue");
      }
    }
    helpers.syncGlobalState();
  },
  
  previousTrack: function() {
    if (this.audioElement && this.audioElement.currentTime > 3) {
      this.audioElement.currentTime = 0;
      return;
    }
    
    if (this.recentlyPlayed.length > 0) {
      const prevSong = this.recentlyPlayed.shift();
      this.playSong(prevSong);
      ui.updateQueueDisplay();
      navbar.updateDropdownCounts();
    } else {
      const albumIndex = window.music.findIndex(artist => artist.artist === this.currentArtist);
      if (albumIndex >= 0) {
        const artist = window.music[albumIndex];
        const albumObj = artist.albums.find(album => album.album === this.currentAlbum);
        if (albumObj && albumObj.songs.length > 0) {
          const songIndex = albumObj.songs.findIndex(song => song.title === this.currentSong.title);
          const prevSongIndex = (songIndex - 1 + albumObj.songs.length) % albumObj.songs.length;
          const prevSong = {
            ...albumObj.songs[prevSongIndex],
            artist: artist.artist,
            album: albumObj.album,
            cover: helpers.getAlbumImageUrl(albumObj.album)
          };
          this.playSong(prevSong);
        } else {
          ui.showNotification("No previous tracks");
        }
      } else {
        ui.showNotification("No previous tracks");
      }
    }
  },
  
  addToQueue: function(song, position = null) {
    if (position !== null) this.queue.splice(position, 0, song);
    else this.queue.push(song);
    ui.updateQueueDisplay();
    navbar.updateDropdownCounts();
    helpers.syncGlobalState();
  },
  
  addToRecentlyPlayed: function(song) {
    if (!song) return;
    this.recentlyPlayed = this.recentlyPlayed.filter((s) => s.id !== song.id);
    this.recentlyPlayed.unshift(song);
    if (this.recentlyPlayed.length > 20) this.recentlyPlayed.pop();
    ui.updateRecentlyPlayedDisplay();
    navbar.updateDropdownCounts();
    helpers.syncGlobalState();
  },
  
  toggleShuffle: function() {
    this.shuffleMode = !this.shuffleMode;
    ui.showNotification(this.shuffleMode ? "Shuffle enabled" : "Shuffle disabled");
    
    const shuffleBtn = document.querySelector('.shuffle-btn');
    if (shuffleBtn) {
      shuffleBtn.classList.toggle('active', this.shuffleMode);
    }
    
    this.updateMediaSessionPlaybackState();
  },
  
  toggleRepeat: function() {
    switch (this.repeatMode) {
      case 'off':
        this.repeatMode = 'one';
        ui.showNotification("Repeat one");
        break;
      case 'one':
        this.repeatMode = 'all';
        ui.showNotification("Repeat all");
        break;
      case 'all':
        this.repeatMode = 'off';
        ui.showNotification("Repeat off");
        break;
    }
    
    const repeatBtn = document.querySelector('.repeat-btn');
    if (repeatBtn) {
      repeatBtn.classList.toggle('active', this.repeatMode !== 'off');
    }
    
    this.updateMediaSessionPlaybackState();
  },
  
  seekTo: function(e) {
    if (this.isDragging || !this.currentSong || !navbar.elements.popupProgressBar || !this.audioElement) return;
    const rect = navbar.elements.popupProgressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    this.audioElement.currentTime = percent * this.duration;
    this.currentTime = this.audioElement.currentTime;
    this.updateProgress();
  },
  
  startDrag: function(e) {
    if (!this.currentSong) return;
    this.isDragging = true;
    e.preventDefault();
    
    this.audioElement.removeEventListener("timeupdate", () => this.updateProgress());
  },
  
  onDrag: function(e) {
    if (!this.isDragging || !navbar.elements.popupProgressBar) return;
    const rect = navbar.elements.popupProgressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this.currentTime = percent * this.duration;
    this.updateProgress();
  },
  
  endDrag: function() {
    if (this.isDragging && this.audioElement) {
      this.audioElement.currentTime = this.currentTime;
      this.audioElement.addEventListener("timeupdate", () => this.updateProgress());
    }
    this.isDragging = false;
  },
  
  updateProgress: function() {
    if (!this.audioElement || !this.audioElement.duration) return;
    
    const percent = (this.audioElement.currentTime / this.audioElement.duration) * 100;
    
    if (navbar.elements.popupProgressFill) {
      navbar.elements.popupProgressFill.style.width = `${percent}%`;
    }
    
    if (navbar.elements.popupProgressThumb) {
      navbar.elements.popupProgressThumb.style.left = `${percent}%`;
    }
    
    if (navbar.elements.popupCurrentTime) {
      navbar.elements.popupCurrentTime.textContent = helpers.formatTime(this.audioElement.currentTime);
    }
    
    navbar.updatePopupProgress();
    
    if ("mediaSession" in navigator) {
      navigator.mediaSession.setPositionState({
        duration: this.audioElement.duration,
        playbackRate: this.audioElement.playbackRate,
        position: this.audioElement.currentTime,
      });
    }
  },
  
  updateMediaSession: function() {
    if (!("mediaSession" in navigator) || !this.currentSong) return;
    
    const albumName = this.currentAlbum.toLowerCase().replace(/\s+/g, '');
    const artistName = this.currentArtist.toLowerCase().replace(/\s+/g, '');
    
    const artworkUrl = `https://koders.cloud/global/content/images/albumCovers/${albumName}.png`;
    const artistArtworkUrl = `https://koders.cloud/global/content/images/artistPortraits/${artistName}.png`;
    
    navigator.mediaSession.metadata = new MediaMetadata({
      title: this.currentSong.title || "Unknown Title",
      artist: this.currentArtist || "Unknown Artist",
      album: this.currentAlbum || "Unknown Album",
      artwork: [
        { src: artworkUrl, sizes: "512x512", type: "image/png" },
        { src: artistArtworkUrl, sizes: "512x512", type: "image/png" }
      ]
    });
    
    navigator.mediaSession.setActionHandler("play", () => this.togglePlayPause());
    navigator.mediaSession.setActionHandler("pause", () => this.togglePlayPause());
    navigator.mediaSession.setActionHandler("previoustrack", () => this.previousTrack());
    navigator.mediaSession.setActionHandler("nexttrack", () => this.nextTrack());
    navigator.mediaSession.setActionHandler("stop", () => {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.isPlaying = false;
      ui.updatePlayPauseButton();
      navbar.updateNavbarPlayPauseButton();
    });
    
    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      const skipTime = details.seekOffset || this.rewindInterval;
      this.audioElement.currentTime = Math.max(0, this.audioElement.currentTime - skipTime);
      this.updateProgress();
    });
    
    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      const skipTime = details.seekOffset || this.fastForwardInterval;
      this.audioElement.currentTime = Math.min(this.audioElement.duration, this.audioElement.currentTime + skipTime);
      this.updateProgress();
    });
    
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.fastSeek && "fastSeek" in this.audioElement) {
        this.audioElement.fastSeek(details.seekTime);
      } else {
        this.audioElement.currentTime = details.seekTime;
      }
      this.updateProgress();
    });
    
    try {
      navigator.mediaSession.setActionHandler("shufflemode", () => this.toggleShuffle());
    } catch (error) {
      console.log('Media Session Action "shufflemode" is not supported');
    }
    
    try {
      navigator.mediaSession.setActionHandler("repeatmode", () => this.toggleRepeat());
    } catch (error) {
      console.log('Media Session Action "repeatmode" is not supported');
    }
  },
  
  updateMediaSessionPlaybackState: function() {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = this.isPlaying ? "playing" : "paused";
    }
  },
  
  playFromQueue: function(index) {
    if (index >= 0 && index < this.queue.length) {
      const song = this.queue.splice(index, 1)[0];
      this.playSong(song);
      ui.updateQueueDisplay();
    }
  },
  
  playFromRecent: function(index) {
    const recent = this.recentlyPlayed;
    if (index >= 0 && index < recent.length) {
      const song = recent[index];
      this.playSong(song);
    }
  },
  
  playAllArtistSongs: function() {
    if (!this.currentArtist) return;
    
    const artist = window.music.find(a => a.artist === this.currentArtist);
    if (!artist) return;
    
    this.queue = [];
    artist.albums.forEach((album) => {
      album.songs.forEach((song) => this.addToQueue({ 
        ...song, 
        artist: artist.artist, 
        album: album.album, 
        cover: helpers.getAlbumImageUrl(album.album) 
      }));
    });
    
    if (this.queue.length > 0) {
      this.playSong(this.queue.shift());
      ui.showNotification(`Playing all songs by ${artist.artist}`);
    }
  },
  
  toggleCurrentSongFavorite: function() {
    if (!this.currentSong) return;
    
    const songId = this.currentSong.id;
    if (this.favorites.has(songId)) {
      this.favorites.delete(songId);
      ui.showNotification("Removed from favorites");
    } else {
      this.favorites.add(songId);
      ui.showNotification("Added to favorites");
    }
    
    navbar.updatePopupButtons();
    navbar.updateDropdownCounts();
  },
  
  tryPlayWithRetries: async function(songData, maxRetries = 3) {
    let retries = 0;
    let success = false;
    
    while (retries < maxRetries && !success) {
      try {
        await this.playSong(songData);
        success = true;
      } catch (error) {
        retries++;
        console.warn(`Playback attempt ${retries} failed: ${error.message}`);
        
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retries * 500));
          
          if (retries === 1) {
            const songFileName = songData.title.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '');
            this.audioElement.src = `https://koders.cloud/global/content/audio/${songFileName}.mp3`;
          } else if (retries === 2) {
            const songFileName = songData.title.toLowerCase().replace(/[^\w]/g, '-');
            this.audioElement.src = `https://koders.cloud/global/content/audio/${songFileName}.mp3`;
          }
        }
      }
    }
    
    if (!success) {
      ui.showNotification(`Failed to play "${songData.title}" after ${maxRetries} attempts`, 'error');
    }
    
    return success;
  }
};

const navbar = {
  elements: {},
  playlists: [],
  favoriteArtists: new Set(),
  isShuffleEnabled: false,
  repeatMode: 0,
  isDraggingPopup: false,
  popupScrollTimeout: null,
  currentPopupTab: 'now-playing',
  
  initializeElements: function() {
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
      "favorite-songs",
      "favorite-artists", 
      "create-playlist",
      "recently-played",
      "queue-view",
      "search-music",
      "shuffle-all",
      "app-settings",
      "about-app",
      "favorite-songs-count",
      "favorite-artists-count",
      "recent-count", 
      "queue-count"
    ];

    enhancedIds.forEach((id) => {
      const camelCaseId = id.replace(/-(\w)/g, (_, c) => c.toUpperCase());
      this.elements[camelCaseId] = document.getElementById(id);
    });

    return this.elements;
  },
  
  bindEvents: function() {
    this.elements.menuTrigger?.addEventListener("click", this.toggleDropdownMenu);
    this.elements.dropdownClose?.addEventListener("click", this.closeDropdownMenu);
    
    this.elements.nowPlayingArea?.addEventListener("click", this.openNowPlayingPopup);
    ui.elements.navbarAlbumCover?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.openNowPlayingPopup();
    });
    
    this.elements.playPauseNavbar?.addEventListener("click", (e) => {
      e.stopPropagation();
      player.togglePlayPause();
    });
    
    navbar.elements.prevBtnNavbar?.addEventListener("click", (e) => {
      e.stopPropagation();
      player.previousTrack();
    });
    
    navbar.elements.nextBtnNavbar?.addEventListener("click", (e) => {
      e.stopPropagation();
      player.nextTrack();
    });
    
    this.elements.popupClose?.addEventListener("click", this.closeNowPlayingPopup);
    this.elements.popupPlayPauseBtn?.addEventListener("click", player.togglePlayPause.bind(player));
    this.elements.popupPrevBtn?.addEventListener("click", player.previousTrack.bind(player));
    this.elements.popupNextBtn?.addEventListener("click", player.nextTrack.bind(player));
    this.elements.popupShuffleBtn?.addEventListener("click", () => this.toggleShuffle());
    this.elements.popupRepeatBtn?.addEventListener("click", () => this.toggleRepeat());
    this.elements.popupFavoriteBtn?.addEventListener("click", () => player.toggleCurrentSongFavorite());
    this.elements.popupQueueBtn?.addEventListener("click", () => this.openQueueFromPopup());
    this.elements.popupShareBtn?.addEventListener("click", () => this.shareCurrentSong());
    this.elements.popupMoreBtn?.addEventListener("click", () => this.showMoreOptions());
    
    this.elements.popupProgressBar?.addEventListener("click", (e) => this.seekToPopup(e));
    this.elements.popupProgressThumb?.addEventListener("mousedown", (e) => this.startDragPopup(e));
    
    this.elements.favoriteSongs?.addEventListener("click", () => this.openFavoriteSongs());
    this.elements.favoriteArtists?.addEventListener("click", () => this.openFavoriteArtists());
    this.elements.createPlaylist?.addEventListener("click", () => this.createNewPlaylist());
    this.elements.recentlyPlayed?.addEventListener("click", () => this.openRecentlyPlayed());
    this.elements.queueView?.addEventListener("click", () => this.openQueueView());
    this.elements.searchMusic?.addEventListener("click", () => this.openSearch());
    this.elements.shuffleAll?.addEventListener("click", () => this.shuffleAllSongs());
    this.elements.appSettings?.addEventListener("click", () => this.openSettings());
    this.elements.aboutApp?.addEventListener("click", () => this.showAbout());
    
    ui.elements.themeToggle?.addEventListener("click", this.enhancedThemeToggle);
    
    document.addEventListener("click", (e) => {
      if (this.elements.dropdownMenu && 
          !this.elements.dropdownMenu.contains(e.target) && 
          !this.elements.menuTrigger?.contains(e.target)) {
        this.closeDropdownMenu();
      }
      
      if (this.elements.nowPlayingPopup &&
          !this.elements.nowPlayingPopup.contains(e.target) &&
          !this.elements.nowPlayingArea?.contains(e.target)) {
        this.closeNowPlayingPopup();
      }
    });
    
    document.addEventListener("keydown", (e) => this.handleEnhancedKeyboardShortcuts(e));
    
    document.querySelectorAll('.popup-song-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const songId = item.dataset.songId;
        const song = [...player.queue, ...player.recentlyPlayed].find(s => s.id === songId);
        if (song) {
          player.playSong(song);
        }
      });
    });
    
    this.setupNowPlayingPopup();
  },
  
  toggleDropdownMenu: function() {
    const isVisible = navbar.elements.dropdownMenu?.classList.contains("show");
    if (isVisible) {
      navbar.closeDropdownMenu();
    } else {
      navbar.openDropdownMenu();
    }
  },
  
  openDropdownMenu: function() {
    if (!navbar.elements.dropdownMenu || !navbar.elements.menuTrigger) return;
    
    navbar.updateDropdownCounts();
    navbar.elements.dropdownMenu.classList.add("show");
    navbar.elements.menuTrigger.classList.add("active");
    
    navbar.closeNowPlayingPopup();
  },
  
  closeDropdownMenu: function() {
    if (!navbar.elements.dropdownMenu || !navbar.elements.menuTrigger) return;
    
    navbar.elements.dropdownMenu.classList.remove("show");
    navbar.elements.menuTrigger.classList.remove("active");
  },
  
  openNowPlayingPopup: function() {
    const currentSong = player.currentSong || null;
    
    if (!currentSong) {
      ui.showNotification("No song currently playing");
      return;
    }
    
    if (!navbar.elements.nowPlayingPopup) return;
    
    navbar.updateNowPlayingPopup();
    navbar.elements.nowPlayingPopup.classList.add("show");
    
    if (window.enhancedNowPlayingController) {
      window.enhancedNowPlayingController.onPopupOpen();
    }
    
    navbar.closeDropdownMenu();
  },
  
  closeNowPlayingPopup: function() {
    if (!navbar.elements.nowPlayingPopup) return;
    navbar.elements.nowPlayingPopup.classList.remove("show");
    
    if (window.enhancedNowPlayingController) {
      window.enhancedNowPlayingController.onPopupClose();
    }
  },
  
  updateNowPlayingPopup: function() {
    const currentSong = player.currentSong || null;
    const duration = player.duration || 0;
    
    if (!currentSong) return;
    
    if (navbar.elements.popupAlbumCover) {
      const albumImageUrl = helpers.getAlbumImageUrl(currentSong.album);
      const fallbackUrl = helpers.getDefaultAlbumImage();
      helpers.loadImageWithFallback(navbar.elements.popupAlbumCover, albumImageUrl, fallbackUrl, 'album');
    }
    
    if (navbar.elements.popupSongTitle) navbar.elements.popupSongTitle.textContent = currentSong.title;
    if (navbar.elements.popupArtistName) navbar.elements.popupArtistName.textContent = currentSong.artist;
    if (navbar.elements.popupAlbumName) navbar.elements.popupAlbumName.textContent = currentSong.album;
    if (navbar.elements.popupTotalTime) navbar.elements.popupTotalTime.textContent = helpers.formatTime(duration);
    
    navbar.updatePopupPlayPauseButton();
    navbar.updatePopupProgress();
    navbar.updatePopupButtons();
  },
  
  updateNavbarNowPlaying: function() {
    const currentSong = player.currentSong || null;
    const isPlaying = player.isPlaying || false;
    
    if (!currentSong) return;
    
    if (ui.elements.navbarLogo) ui.elements.navbarLogo.classList.add("hidden");
    if (ui.elements.navbarAlbumCover) ui.elements.navbarAlbumCover.classList.remove("hidden");
    if (navbar.elements.playIndicator) navbar.elements.playIndicator.classList.toggle("active", isPlaying);
    if (navbar.elements.nowPlayingArea) navbar.elements.nowPlayingArea.classList.add("has-song");
    
    if (ui.elements.navbarAlbumCover) {
      const albumImageUrl = helpers.getAlbumImageUrl(currentSong.album);
      const fallbackUrl = helpers.getDefaultAlbumImage();
      helpers.loadImageWithFallback(ui.elements.navbarAlbumCover, albumImageUrl, fallbackUrl, 'album');
    }
    
    if (ui.elements.navbarSongTitle) {
      ui.elements.navbarSongTitle.textContent = currentSong.title;
      const titleWidth = ui.elements.navbarSongTitle.scrollWidth;
      const containerWidth = ui.elements.navbarSongTitle.clientWidth;
      ui.elements.navbarSongTitle.classList.toggle("marquee", titleWidth > containerWidth);
    }
    
    if (ui.elements.navbarArtist) ui.elements.navbarArtist.textContent = currentSong.artist;
    
    navbar.updateNavbarPlayPauseButton();
  },
  
  updateNavbarPlayPauseButton: function() {
    const isPlaying = player.isPlaying || false;
    
    if (!navbar.elements.playIconNavbar || !navbar.elements.pauseIconNavbar) return;
    navbar.elements.playIconNavbar.classList.toggle("hidden", isPlaying);
    navbar.elements.pauseIconNavbar.classList.toggle("hidden", !isPlaying);
    
    if (navbar.elements.playIndicator) {
      navbar.elements.playIndicator.classList.toggle("active", isPlaying);
    }
    
    navbar.updatePopupPlayPauseButton();
  },
  
  updatePopupPlayPauseButton: function() {
    const isPlaying = player.isPlaying || false;
    
    if (!navbar.elements.popupPlayIcon || !navbar.elements.popupPauseIcon) return;
    navbar.elements.popupPlayIcon.classList.toggle("hidden", isPlaying);
    navbar.elements.popupPauseIcon.classList.toggle("hidden", !isPlaying);
  },
  
  updatePopupProgress: function() {
    const currentTime = player.currentTime || 0;
    const duration = player.duration || 0;
    
    if (duration === 0) return;
    const percent = (currentTime / duration) * 100;
    
    document.querySelectorAll('#popup-progress-fill, .popup-progress-fill').forEach(el => {
      if (el) el.style.width = `${percent}%`;
    });
    
    document.querySelectorAll('#popup-current-time, .popup-current-time').forEach(el => {
      if (el) el.textContent = helpers.formatTime(currentTime);
    });
  },
  
  updatePopupButtons: function() {
    const currentSong = player.currentSong || null;
    
    if (!currentSong) return;
    
    if (navbar.elements.popupShuffleBtn) {
      navbar.elements.popupShuffleBtn.classList.toggle("active", navbar.isShuffleEnabled);
    }
    
    if (navbar.elements.popupRepeatBtn) {
      navbar.elements.popupRepeatBtn.classList.remove("active");
      if (navbar.repeatMode > 0) {
        navbar.elements.popupRepeatBtn.classList.add("active");
      }
    }
    
    if (navbar.elements.popupFavoriteBtn) {
      const isFavorite = player.favorites.has(currentSong.id);
      navbar.elements.popupFavoriteBtn.classList.toggle("active", isFavorite);
    }
  },
  
  updateDropdownCounts: function() {
    if (navbar.elements.favoriteSongsCount) {
      navbar.elements.favoriteSongsCount.textContent = player.favorites.size;
    }
    if (navbar.elements.favoriteArtistsCount) {
      navbar.elements.favoriteArtistsCount.textContent = navbar.favoriteArtists.size;
    }
    if (navbar.elements.recentCount) {
      navbar.elements.recentCount.textContent = player.recentlyPlayed.length;
    }
    if (navbar.elements.queueCount) {
      navbar.elements.queueCount.textContent = player.queue.length;
    }
  },
  
  seekToPopup: function(e) {
    const currentSong = player.currentSong || null;
    
    if (navbar.isDraggingPopup || !currentSong || !navbar.elements.popupProgressBar || !player.audioElement) return;
    const rect = navbar.elements.popupProgressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    player.audioElement.currentTime = percent * (player.duration || 0);
    player.currentTime = player.audioElement.currentTime;
    player.updateProgress();
    navbar.updatePopupProgress();
  },
  
  startDragPopup: function(e) {
    const currentSong = player.currentSong || null;
    
    if (!currentSong) return;
    navbar.isDraggingPopup = true;
    e.preventDefault();
    
    const onDragPopup = (e) => {
      if (!navbar.isDraggingPopup || !navbar.elements.popupProgressBar) return;
      const rect = navbar.elements.popupProgressBar.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      player.currentTime = percent * (player.duration || 0);
      player.updateProgress();
      navbar.updatePopupProgress();
    };
    
    const endDragPopup = () => {
      navbar.isDraggingPopup = false;
      document.removeEventListener("mousemove", onDragPopup);
      document.removeEventListener("mouseup", endDragPopup);
    };
    
    document.addEventListener("mousemove", onDragPopup);
    document.addEventListener("mouseup", endDragPopup);
  },
  
  toggleShuffle: function() {
    navbar.isShuffleEnabled = !navbar.isShuffleEnabled;
    navbar.updatePopupButtons();
    ui.showNotification(navbar.isShuffleEnabled ? "Shuffle enabled" : "Shuffle disabled");
  },
  
  toggleRepeat: function() {
    navbar.repeatMode = (navbar.repeatMode + 1) % 3;
    navbar.updatePopupButtons();
    
    const messages = ["Repeat off", "Repeat all", "Repeat one"];
    ui.showNotification(messages[navbar.repeatMode]);
  },
  
  shareCurrentSong: function() {
    const currentSong = player.currentSong || null;
    if (currentSong) {
      helpers.shareSong(currentSong);
    }
  },
  
  showMoreOptions: function() {
    ui.showNotification("More options coming soon");
  },
  
  openQueueFromPopup: function() {
    navbar.closeNowPlayingPopup();
    ui.openNowPlaying();
    ui.switchTab("queue");
  },
  
  openFavoriteSongs: function() {
    const favorites = player.favorites || new Set();
    
    navbar.closeDropdownMenu();
    if (favorites.size === 0) {
      ui.showNotification("No favorite songs yet");
      return;
    }
    ui.showNotification(`Viewing ${favorites.size} favorite songs`);
  },
  
  openFavoriteArtists: function() {
    navbar.closeDropdownMenu();
    if (navbar.favoriteArtists.size === 0) {
      ui.showNotification("No favorite artists yet");
      return;
    }
    ui.showNotification(`Viewing ${navbar.favoriteArtists.size} favorite artists`);
  },
  
  createNewPlaylist: function() {
    navbar.closeDropdownMenu();
    const playlistName = prompt("Enter playlist name:");
    if (playlistName && playlistName.trim()) {
      const playlist = {
        id: Date.now().toString(),
        name: playlistName.trim(),
        songs: [],
        created: new Date().toISOString()
      };
      navbar.playlists.push(playlist);
      ui.showNotification(`Created playlist: ${playlist.name}`);
    }
  },
  
  openRecentlyPlayed: function() {
    const recentlyPlayed = player.recentlyPlayed || [];
    
    navbar.closeDropdownMenu();
    if (recentlyPlayed.length === 0) {
      ui.showNotification("No recently played songs");
      return;
    }
    ui.openNowPlaying();
    ui.switchTab("recent");
  },
  
  openQueueView: function() {
    const queue = player.queue || [];
    
    navbar.closeDropdownMenu();
    if (queue.length === 0) {
      ui.showNotification("Queue is empty");
      return;
    }
    ui.openNowPlaying();
    ui.switchTab("queue");
  },
  
  openSearch: function() {
    navbar.closeDropdownMenu();
    ui.showNotification("Search feature coming soon");
  },
  
  shuffleAllSongs: function() {
    navbar.closeDropdownMenu();
    if (!window.music || window.music.length === 0) {
      ui.showNotification("No music library found");
      return;
    }
    
    const allSongs = [];
    window.music.forEach(artist => {
      artist.albums.forEach(album => {
        album.songs.forEach(song => {
          allSongs.push({
            ...song,
            artist: artist.artist,
            album: album.album,
            cover: helpers.getAlbumImageUrl(album.album)
          });
        });
      });
    });
    
    if (allSongs.length === 0) {
      ui.showNotification("No songs found");
      return;
    }
    
    for (let i = allSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
    }
    
    player.queue = allSongs.slice(1);
    player.playSong(allSongs[0]);
    navbar.isShuffleEnabled = true;
    navbar.updateDropdownCounts();
    ui.showNotification(`Shuffling ${allSongs.length} songs`);
  },
  
  openSettings: function() {
    navbar.closeDropdownMenu();
    ui.showNotification("Settings panel coming soon");
  },
  
  showAbout: function() {
    navbar.closeDropdownMenu();
    ui.showNotification("Music Player v1.0 - Built with love");
  },
  
  enhancedThemeToggle: function() {
    document.documentElement.classList.toggle("light");
    const isDark = !document.documentElement.classList.contains("light");
    
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.innerHTML = isDark
        ? '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 116.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>'
        : '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/></svg>';
    }
    
    ui.showNotification(`Switched to ${isDark ? 'dark' : 'light'} theme`);
  },
  
  handleEnhancedKeyboardShortcuts: function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch (e.key) {
      case ' ':
        e.preventDefault();
        player.togglePlayPause();
        break;
      case 'ArrowLeft':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          player.previousTrack();
        }
        break;
      case 'ArrowRight':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          player.nextTrack();
        }
        break;
      case 'n':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          navbar.openNowPlayingPopup();
        }
        break;
      case 'm':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          navbar.toggleDropdownMenu();
        }
        break;
      case 's':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          navbar.isShuffleEnabled = !navbar.isShuffleEnabled;
          navbar.updatePopupButtons();
          ui.showNotification(navbar.isShuffleEnabled ? "Shuffle enabled" : "Shuffle disabled");
        }
        break;
      case 'f':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          player.toggleCurrentSongFavorite();
        }
        break;
      case 'r':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          navbar.repeatMode = (navbar.repeatMode + 1) % 3;
          navbar.updatePopupButtons();
          const messages = ["Repeat off", "Repeat all", "Repeat one"];
          ui.showNotification(messages[navbar.repeatMode]);
        }
        break;
      case 'Escape':
        navbar.closeNowPlayingPopup();
        navbar.closeDropdownMenu();
        ui.closeNowPlaying();
        break;
    }
  },
  
  getNavbarState: function() {
    return {
      isShuffleEnabled: navbar.isShuffleEnabled,
      repeatMode: navbar.repeatMode,
      playlists: navbar.playlists,
      favoriteArtists: navbar.favoriteArtists
    };
  },
  
  setNavbarState: function(state) {
    if (state.isShuffleEnabled !== undefined) navbar.isShuffleEnabled = state.isShuffleEnabled;
    if (state.repeatMode !== undefined) navbar.repeatMode = state.repeatMode;
    if (state.playlists !== undefined) navbar.playlists = state.playlists;
    if (state.favoriteArtists !== undefined) navbar.favoriteArtists = state.favoriteArtists;
  },
  
  setupNowPlayingPopup: function() {
    document.querySelectorAll('.popup-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        navbar.switchPopupTab(tabName);
        navbar.resetPopupScrollTimeout();
      });
    });

    const queueContent = document.querySelector('.popup-tab-content[data-tab="queue"]');
    const recentContent = document.querySelector('.popup-tab-content[data-tab="recent"]');
    
    if (queueContent) {
      queueContent.addEventListener('scroll', () => {
        if (navbar.currentPopupTab !== 'queue') {
          navbar.switchPopupTab('queue');
        }
        navbar.resetPopupScrollTimeout();
      });
    }
    
    if (recentContent) {
      recentContent.addEventListener('scroll', () => {
        if (navbar.currentPopupTab !== 'recent') {
          navbar.switchPopupTab('recent');
        }
        navbar.resetPopupScrollTimeout();
      });
    }
    
    navbar.resetPopupScrollTimeout();
  },
  
  switchPopupTab: function(tabName) {
    navbar.currentPopupTab = tabName;
    
    document.querySelectorAll('.popup-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.popup-tab-content').forEach(content => {
      content.style.display = content.dataset.tab === tabName ? 'block' : 'none';
    });
  },
  
  resetPopupScrollTimeout: function() {
    if (navbar.popupScrollTimeout) {
      clearTimeout(navbar.popupScrollTimeout);
    }
    
    navbar.popupScrollTimeout = setTimeout(() => {
      if (navbar.currentPopupTab !== 'now-playing') {
        navbar.switchPopupTab('now-playing');
      }
    }, 10000);
  },
  
  updatePopupQueueList: function() {
    const queueList = document.getElementById('popup-queue-list');
    if (!queueList) return;
    
    const queue = player.queue || [];
    
    if (queue.length > 0) {
      queueList.innerHTML = queue.map(song => `
        <li class="popup-song-item" data-song-id="${song.id}">
          <img class="popup-song-cover" src="${song.cover}" alt="${song.title}">
          <div class="popup-song-info">
            <p class="popup-song-title">${song.title}</p>
            <p class="popup-song-artist">${song.artist}</p>
          </div>
          <span class="popup-song-duration">${song.duration}</span>
        </li>
      `).join('');
    } else {
      queueList.innerHTML = '<li class="empty-state p-4 text-center text-sm opacity-50">Queue is empty</li>';
    }
  },
  
  updatePopupRecentList: function() {
    const recentList = document.getElementById('popup-recent-list');
    if (!recentList) return;
    
    const recentlyPlayed = player.recentlyPlayed || [];
    
    if (recentlyPlayed.length > 0) {
      recentList.innerHTML = recentlyPlayed.map(song => `
        <li class="popup-song-item" data-song-id="${song.id}">
          <img class="popup-song-cover" src="${song.cover}" alt="${song.title}">
          <div class="popup-song-info">
            <p class="popup-song-title">${song.title}</p>
            <p class="popup-song-artist">${song.artist}</p>
          </div>
          <span class="popup-song-duration">${song.duration}</span>
        </li>
      `).join('');
    } else {
      recentList.innerHTML = '<li class="empty-state p-4 text-center text-sm opacity-50">No recently played songs</li>';
    }
  }
};

const ui = {  
  elements: {},
  similarArtistsCarousel: null,
  albumSelector: null,
  
  initializeElements: function() {
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
      "close-now-playing",
      "queue-tab",
      "recent-tab",
      "queue-list",
      "recent-list",
      "theme-toggle",
    ];

    ids.forEach((id) => {
      const camelCaseId = id.replace(/-(\w)/g, (_, c) => c.toUpperCase());
      this.elements[camelCaseId] = document.getElementById(id);
    });

    if (!this.elements.homePage || !this.elements.artistPage || !this.elements.featuredArtists) {
      throw new Error("Essential page elements are missing from the DOM.");
    }
  },
  
  updateNowPlayingInfo: function() {
    if (!player.currentSong) return;
    
    if (navbar.elements.popupAlbumCover) {
      const albumImageUrl = helpers.getAlbumImageUrl(player.currentSong.album);
      const fallbackUrl = helpers.getDefaultAlbumImage();
      helpers.loadImageWithFallback(navbar.elements.popupAlbumCover, albumImageUrl, fallbackUrl, 'album');
    }
    
    if (navbar.elements.popupSongTitle) navbar.elements.popupSongTitle.textContent = player.currentSong.title;
    if (navbar.elements.popupArtistName) navbar.elements.popupArtistName.textContent = player.currentSong.artist;
    if (navbar.elements.popupAlbumName) navbar.elements.popupAlbumName.textContent = player.currentSong.album;
    if (navbar.elements.popupTotalTime) navbar.elements.popupTotalTime.textContent = helpers.formatTime(player.duration);
  },
  
  updateNavbarInfo: function() {
    if (!player.currentSong || !this.elements.navbarAlbumCover || !this.elements.navbarArtist || !this.elements.navbarSongTitle) return;
    
    const albumImageUrl = helpers.getAlbumImageUrl(player.currentSong.album);
    const fallbackUrl = helpers.getDefaultAlbumImage();
    helpers.loadImageWithFallback(this.elements.navbarAlbumCover, albumImageUrl, fallbackUrl, 'album');
    
    this.elements.navbarArtist.textContent = player.currentSong.artist;
    const title = player.currentSong.title;
    this.elements.navbarSongTitle.classList.toggle("marquee", title.length > 25);
    this.elements.navbarSongTitle.textContent = title;
  },
  
  updatePlayPauseButton: function() {
    if (!navbar.elements.popupPlayIcon || !navbar.elements.popupPauseIcon) return;
    navbar.elements.popupPlayIcon.classList.toggle("hidden", player.isPlaying);
    navbar.elements.popupPauseIcon.classList.toggle("hidden", !player.isPlaying);
    navbar.updateNavbarPlayPauseButton();
  },
  
  updateQueueDisplay: function() {
    if (!this.elements.queueList) return;
    
    if (player.queue.length > 0) {
      this.elements.queueList.innerHTML = player.queue.map((song) => 
        helpers.renderTemplate("queueItem", {
          ...song,
          cover: helpers.getAlbumImageUrl(song.album)
        })
      ).join("");
      
      this.elements.queueList.querySelectorAll('.queue-item-cover').forEach((img) => {
        const albumName = img.closest('.queue-item')?.querySelector('.queue-item-title')?.textContent;
        if (albumName) {
          const albumImageUrl = helpers.getAlbumImageUrl(albumName);
          const fallbackUrl = helpers.getDefaultAlbumImage();
          helpers.loadImageWithFallback(img, albumImageUrl, fallbackUrl, 'album');
        }
      });
    } else {
      this.elements.queueList.innerHTML = `<li class="p-4 text-center text-sm opacity-50">Queue is empty</li>`;
    }
    
    navbar.updatePopupQueueList();
  },
  
  updateRecentlyPlayedDisplay: function() {
    if (!this.elements.recentList) return;
    
    if (player.recentlyPlayed.length > 0) {
      this.elements.recentList.innerHTML = player.recentlyPlayed.map((song) => 
        helpers.renderTemplate("queueItem", {
          ...song,
          cover: helpers.getAlbumImageUrl(song.album)
        })
      ).join("");
      
      this.elements.recentList.querySelectorAll('.queue-item-cover').forEach((img) => {
        const songData = player.recentlyPlayed.find(song => 
          img.closest('.queue-item')?.querySelector('.queue-item-title')?.textContent === song.title
        );
        if (songData) {
          const albumImageUrl = helpers.getAlbumImageUrl(songData.album);
          const fallbackUrl = helpers.getDefaultAlbumImage();
          helpers.loadImageWithFallback(img, albumImageUrl, fallbackUrl, 'album');
        }
      });
    } else {
      this.elements.recentList.innerHTML = `<li class="p-4 text-center text-sm opacity-50">No recently played songs</li>`;
    }
    
    navbar.updatePopupRecentList();
  },
  
  updateBreadcrumb: function() {
    if (!this.elements.breadcrumb || !this.elements.breadcrumbArtist) return;
    const sep1 = document.getElementById("breadcrumb-sep1");
    if (player.currentPage === "home") {
      this.elements.breadcrumb.classList.add("hidden");
    } else {
      this.elements.breadcrumb.classList.remove("hidden");
      if (player.currentArtist) {
        this.elements.breadcrumbArtist.textContent = player.currentArtist.artist;
        this.elements.breadcrumbArtist.classList.remove("hidden");
        if (sep1) sep1.classList.remove("hidden");
      }
    }
  },
  
  
  
  
  
  
  
  bindEvents: function() {
    window.addEventListener("scroll", () => {
      this.elements.navbar?.classList.toggle("floating", window.scrollY > 50);
    });

    this.elements.breadcrumbHome?.addEventListener("click", pageManager.loadHomePage);
    this.elements.navbarAlbumCover?.addEventListener("click", navbar.openNowPlayingPopup);
    
    const navbarSongTitle = document.getElementById("navbar-song-title");
    navbarSongTitle?.addEventListener("click", navbar.openNowPlayingPopup);
    
    this.elements.closeNowPlaying?.addEventListener("click", this.closeNowPlaying);
    this.elements.nowPlayingOverlay?.addEventListener("click", (e) => {
      if (e.target === this.elements.nowPlayingOverlay) this.closeNowPlaying();
    });
    
    navbar.elements.popupPlayPauseBtn?.addEventListener("click", player.togglePlayPause.bind(player));
    navbar.elements.popupPrevBtn?.addEventListener("click", player.previousTrack.bind(player));
    navbar.elements.popupNextBtn?.addEventListener("click", player.nextTrack.bind(player));
    navbar.elements.popupProgressBar?.addEventListener("click", (e) => player.seekTo(e));
    navbar.elements.popupProgressThumb?.addEventListener("mousedown", (e) => player.startDrag(e));
    document.addEventListener("mousemove", (e) => player.onDrag(e));
    document.addEventListener("mouseup", () => player.endDrag());
    this.elements.queueTab?.addEventListener("click", () => this.switchTab("queue"));
    this.elements.recentTab?.addEventListener("click", () => this.switchTab("recent"));
  },
  
  openNowPlaying: function() {
    if (!player.currentSong || !this.elements.nowPlayingOverlay) return;
    this.elements.nowPlayingOverlay.classList.remove("hidden");
    setTimeout(() => {
      this.elements.nowPlayingOverlay.classList.add("visible");
    }, 10);
  },
  
  closeNowPlaying: function() {
    if (!ui.elements.nowPlayingOverlay || !navbar.elements.nowPlayingPopup) return;
    ui.elements.nowPlayingOverlay.classList.remove("visible");
    navbar.elements.nowPlayingPopup.classList.remove("visible");
    setTimeout(() => ui.elements.nowPlayingOverlay.classList.add("hidden"), 300);
  },
  
  switchTab: function(tab) {
    if (!ui.elements.queueTab || !ui.elements.recentTab || !ui.elements.queueList || !ui.elements.recentList) return;
    const isQueue = tab === "queue";
    ui.elements.queueTab.classList.toggle("active", isQueue);
    ui.elements.recentTab.classList.toggle("active", !isQueue);
    ui.elements.queueList.classList.toggle("hidden", !isQueue);
    ui.elements.recentList.classList.toggle("hidden", isQueue);
  },
  
  bindDynamicPageEvents: function() {
    document.querySelectorAll(".song-item").forEach((item) => {
      const newItem = item.cloneNode(true);
      item.parentNode.replaceChild(newItem, item);
      
      newItem.addEventListener("click", (e) => {
        if (!e.target.closest(".song-toolbar")) {
          try {
            const songData = JSON.parse(newItem.dataset.song);
            player.playSong(songData);
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
        if (action) this.handleToolbarAction(action, button);
      });
    });
    
    document.querySelector(".play-artist")?.addEventListener("click", (e) => {
      e.stopPropagation();
      player.playAllArtistSongs();
    });
    
    if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
  },
  
  handleToolbarAction: function(action, button) {
    const songItem = button.closest(".song-item");
    if (!songItem) return;
    
    try {
      const songData = JSON.parse(songItem.dataset.song);
      const songId = songData.id;
      
      switch (action) {
        case "favorite":
          if (player.favorites.has(songId)) {
            player.favorites.delete(songId);
            button.classList.remove("active");
          } else {
            player.favorites.add(songId);
            button.classList.add("active");
          }
          break;
        case "play-next":
          player.addToQueue(songData, 0);
          this.showNotification("Added to play next");
          break;
        case "add-queue":
          player.addToQueue(songData);
          this.showNotification("Added to queue");
          break;
        case "share":
          helpers.shareSong(songData);
          break;
      }
    } catch (err) {
      console.error("Toolbar action failed:", err);
    }
  },
  
  initializeNotifications: function() {
    if (!this.notificationContainer) {
      this.notificationContainer = document.createElement("div");
      this.notificationContainer.className = "fixed z-50 right-4 bottom-4 space-y-2 max-w-sm";
      document.body.appendChild(this.notificationContainer);
      
      this.historyOverlay = document.createElement("div");
      this.historyOverlay.className = "hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center";
      document.body.appendChild(this.historyOverlay);
      
      this.historyPanel = document.createElement("div");
      this.historyPanel.className = "bg-[#161b22] text-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto p-4 space-y-2";
      this.historyOverlay.appendChild(this.historyPanel);
      
      this.historyBtn = document.createElement("button");
      this.historyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3v6h6M21 21v-6h-6M3 21h6v-6M21 3h-6v6"/></svg>';
      this.historyBtn.className = "fixed bottom-4 left-4 z-50";
      this.historyBtn.addEventListener("click", () => {
        this.updateNotificationHistory();
        this.historyOverlay.classList.remove("hidden");
      });
      document.body.appendChild(this.historyBtn);
      
      this.historyOverlay.addEventListener("click", (e) => {
        if (e.target === this.historyOverlay) this.historyOverlay.classList.add("hidden");
      });
    }
    
    this.notifications = this.notifications || [];
    this.currentNotificationTimeout = null;
  },

  showNotification: function(message, type = "info", undoCallback = null) {
    if (!this.notificationContainer) {
      this.initializeNotifications();
    }
    
    const typeStyles = {
      info: "bg-[#316dca] border-[#265db5] text-white",
      success: "bg-[#238636] border-[#2ea043] text-white", 
      warning: "bg-[#bb8009] border-[#d29922] text-white",
      error: "bg-[#da3633] border-[#f85149] text-white"
    };
    
    const noteIndex = this.notifications.length;
    const note = { message, type, undo: undoCallback };
    this.notifications.push(note);
    
    const notification = document.createElement("div");
    notification.className = `relative border px-3 py-2 rounded-md shadow-md flex items-start justify-between gap-4 text-sm ${typeStyles[type] || typeStyles.info}`;
    
    const msgSpan = document.createElement("span");
    msgSpan.className = "flex-1";
    msgSpan.innerText = message;
    notification.appendChild(msgSpan);
    
    const actions = document.createElement("div");
    actions.className = "absolute -top-3 right-1 flex items-center space-x-2";
    
    if (undoCallback) {
      const undo = document.createElement("button");
      undo.innerHTML = '<svg class="w-5 h-5 text-white hover:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>';
      undo.addEventListener("click", () => {
        if (typeof undoCallback === "function") {
          undoCallback();
          this.removeNotification(notification);
        }
      });
      actions.appendChild(undo);
    }
    
    const close = document.createElement("button");
    close.innerHTML = '<svg class="w-5 h-5 text-white hover:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
    close.addEventListener("click", () => this.removeNotification(notification));
    actions.appendChild(close);
    notification.appendChild(actions);
    
    notification.addEventListener("mouseenter", () => {
      actions.classList.remove("hidden");
    });
    notification.addEventListener("mouseleave", () => {
      if (!this.historyOverlay || this.historyOverlay.classList.contains("hidden")) return;
      actions.classList.add("hidden");
    });
    
    this.notificationContainer.appendChild(notification);
    
    if (this.currentNotificationTimeout) clearTimeout(this.currentNotificationTimeout);
    
    this.currentNotificationTimeout = setTimeout(() => this.removeNotification(notification), 5000);
    
    return notification;
  },

  removeNotification: function(element) {
    element.classList.add("opacity-0", "translate-y-2", "transition-all", "duration-300");
    setTimeout(() => element.remove(), 300);
  },

  updateNotificationHistory: function() {
    if (!this.historyPanel) return;
    
    this.historyPanel.innerHTML = "";
    const typeStyles = {
      info: "bg-[#316dca] border-[#265db5] text-white",
      success: "bg-[#238636] border-[#2ea043] text-white", 
      warning: "bg-[#bb8009] border-[#d29922] text-white",
      error: "bg-[#da3633] border-[#f85149] text-white"
    };
    
    this.notifications.forEach((note, i) => {
      const el = document.createElement("div");
      el.className = `relative border px-3 py-2 rounded-md shadow-md flex items-start justify-between gap-4 text-sm mb-2 ${typeStyles[note.type] || typeStyles.info}`;
      
      const msgSpan = document.createElement("span");
      msgSpan.className = "flex-1";
      msgSpan.innerText = note.message;
      el.appendChild(msgSpan);
      
      const actions = document.createElement("div");
      actions.className = "hidden absolute -top-3 right-1 flex items-center space-x-2";
      
      if (typeof note.undo === "function") {
        const undo = document.createElement("button");
        undo.innerHTML = '<svg class="w-5 h-5 text-white hover:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>';
        undo.disabled = i !== this.notifications.length - 1;
        if (undo.disabled) undo.classList.add("opacity-30", "cursor-not-allowed");
        undo.addEventListener("click", () => {
          note.undo();
          el.remove();
          this.notifications = this.notifications.filter((_, index) => index !== i);
        });
        actions.appendChild(undo);
      }
      
      const close = document.createElement("button");
      close.innerHTML = '<svg class="w-5 h-5 text-white hover:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
      close.addEventListener("click", () => {
        el.remove();
        this.notifications = this.notifications.filter((_, index) => index !== i);
      });
      
      actions.appendChild(close);
      el.appendChild(actions);
      
      el.addEventListener("mouseenter", () => {
        actions.classList.remove("hidden");
      });
      el.addEventListener("mouseleave", () => {
        actions.classList.add("hidden");
      });
      
      this.historyPanel.appendChild(el);
    });
    
    if (this.notifications.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.className = "text-center py-6 text-gray-400";
      emptyState.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No notifications yet</p>
      `;
      this.historyPanel.appendChild(emptyState);
    }
  },

  clearAllNotifications: function() {
    this.notifications = [];
    
    if (this.notificationContainer) {
      this.notificationContainer.innerHTML = "";
    }
    
    if (this.historyPanel && !this.historyOverlay.classList.contains("hidden")) {
      this.updateNotificationHistory();
    }
  },

  getNotificationsHistory: function() {
    return [...this.notifications];
  },

  showLoadingBar: function() {
    if (document.getElementById("global-loading-bar")) return;
    
    ui.loadingProgress = 0;
    const loadingBar = helpers.createElementFromHTML('<div id="global-loading-bar" class="loading-bar"></div>');
    if (loadingBar) {
      document.body.appendChild(loadingBar);
      
      setTimeout(() => {
        loadingBar.classList.add('active');
        ui.startLoadingProgress();
      }, 10);
    }
  },
  
  startLoadingProgress: function() {
    const loadingBar = document.getElementById("global-loading-bar");
    if (!loadingBar) return;
    
    ui.loadingProgress = 0;
    ui.updateLoadingProgress();
    
    ui.loadingTimer = setInterval(() => {
      if (ui.loadingProgress < 90) {
        const increment = ui.loadingProgress < 30 ? 15 : ui.loadingProgress < 60 ? 8 : 3;
        ui.loadingProgress = Math.min(90, ui.loadingProgress + increment);
        ui.updateLoadingProgress();
      }
    }, 150);
  },
  
  updateLoadingProgress: function() {
    const loadingBar = document.getElementById("global-loading-bar");
    if (loadingBar) {
      loadingBar.style.transform = `scaleX(${ui.loadingProgress / 100})`;
    }
  },
  
  completeLoadingBar: function() {
    if (ui.loadingTimer) {
      clearInterval(ui.loadingTimer);
      ui.loadingTimer = null;
    }
    
    const loadingBar = document.getElementById("global-loading-bar");
    if (loadingBar) {
      ui.loadingProgress = 100;
      loadingBar.style.transform = 'scaleX(1)';
      
      setTimeout(() => {
        loadingBar.classList.add('complete');
        setTimeout(() => loadingBar.remove(), 400);
      }, 100);
    }
  },
  
  hideLoadingBar: function() {
    ui.completeLoadingBar();
  },
  
  showSkeletonLoader: function(element, height, count) {
    if (!element) return;
    element.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement("div");
      skeleton.className = "skeleton";
      skeleton.style.height = height;
      element.appendChild(skeleton);
    }
  },
  
  fadeInContent: function(element) {
    if (!element) return;
    element.classList.add("content-fade-in");
    setTimeout(() => element.classList.remove("content-fade-in"), 600);
  },
  
  cleanupCarousels: function() {
    if (this.similarArtistsCarousel) {
      this.similarArtistsCarousel.clear();
      this.similarArtistsCarousel = null;
    }
    
    if (this.albumSelector) {
      this.albumSelector = null;
    }
  }
};






const pageManager = {
  
  updateBreadcrumbs: function(items = []) {
    const breadcrumbList = document.querySelector('.breadcrumb-list');
    if (!breadcrumbList) return;
    
    breadcrumbList.innerHTML = '';
    
    // Always include home
    const homeItem = document.createElement('li');
    homeItem.className = 'breadcrumb-item flex items-center';
    homeItem.innerHTML = `
      <a href="/" class="breadcrumb hover:text-accent-primary transition-colors" data-nav="home">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="ml-1 hidden md:inline">Home</span>
      </a>
    `;
    breadcrumbList.appendChild(homeItem);
    
    // Add remaining items
    items.forEach((item, index) => {
      // Separator
      const separator = document.createElement('li');
      separator.className = 'breadcrumb-separator mx-2 text-fg-subtle';
      separator.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      `;
      breadcrumbList.appendChild(separator);
      
      // Item
      const listItem = document.createElement('li');
      listItem.className = 'breadcrumb-item';
      
      if (index === items.length - 1) {
        // Last item (current page)
        listItem.innerHTML = `<span class="font-medium text-fg-default">${item.text}</span>`;
      } else {
        // Clickable item
        listItem.innerHTML = `
          <a href="${item.url}" class="breadcrumb hover:text-accent-primary transition-colors" 
             data-nav="${item.type}" ${Object.entries(item.params).map(([k,v]) => `data-${k}="${v}"`).join(' ')}>
            ${item.text}
          </a>
        `;
      }
      
      breadcrumbList.appendChild(listItem);
    });
  },

  renderRandomArtists: function() {
    if (!window.music || window.music.length === 0) {
      ui.elements.featuredArtists.innerHTML = "<p>No music library found.</p>";
      return;
    }
    
    const shuffled = [...window.music].sort(() => 0.5 - Math.random());
    const randomArtists = shuffled.slice(0, 4);
    ui.elements.featuredArtists.innerHTML = "";
    
    randomArtists.forEach((artist) => {
      const artistElement = helpers.createElementFromHTML(
        helpers.renderTemplate("artistCard", {
          id: artist.id,
          artist: artist.artist,
          genre: artist.genre,
          cover: helpers.getArtistImageUrl(artist.artist),
          albumCount: artist.albums.length,
        })
      );
      
      const artistImage = artistElement?.querySelector('.artist-avatar');
      if (artistImage) {
        const artistImageUrl = helpers.getArtistImageUrl(artist.artist);
        const fallbackUrl = helpers.getDefaultArtistImage();
        helpers.loadImageWithFallback(artistImage, artistImageUrl, fallbackUrl, 'artist');
      }
      
      artistElement?.addEventListener("click", () => pageManager.loadArtistPage(artist));
      if (artistElement) ui.elements.featuredArtists.appendChild(artistElement);
    });
    
    ui.fadeInContent(ui.elements.featuredArtists);
  },
  
loadHomePage: function() {
  player.currentPage = "home";
  
  // Show loading overlay
  this.showLoading();
  
  this.updateBreadcrumbs([]);
  
  // Prepare home page content
  const homeContent = `
    <div class="text-center py-8 md:py-12">
      <h1 class="text-4xl md:text-5xl font-bold mb-6 gradient-text">Discover Amazing Music</h1>
      <p class="text-lg md:text-xl text-gray-400 mb-8 md:mb-12 max-w-2xl mx-auto">Explore artists, albums, and songs from your personal library with an immersive listening experience</p>
    </div>
    <h2 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8 px-4">Featured Artists</h2>
    <div id="featured-artists" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 px-4"></div>
  `;
  
  // Update content (with fade effect)
  this.updatePageContent(homeContent, () => {
    // After content is loaded, render artists
    this.renderRandomArtists();
    ui.completeLoadingBar();
    this.hideLoading();
  });
},

  normalizeForUrl: function(text) {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');
  },

loadArtistPage: function(artist) {
  player.currentPage = "artist";
  player.currentArtist = artist;
  
  // Show loading overlay
  this.showLoading();
  
        this.updateBreadcrumbs([
        {
          type: 'artist',
          params: { artist: artist.artist },
          url: `/artist/${this.normalizeForUrl(artist.artist)}/`,
          text: artist.artist
        }
      ]);
  
  // Clear content first (with fade effect)
  this.clearPageContent(() => {
    // After clearing, show skeleton loader
    const skeleton = `<div class="skeleton w-full h-[400px] rounded-lg"></div>`;
    document.getElementById('dynamic-content').innerHTML = skeleton;
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      // Render artist page content using your existing enhancedArtist template
      const artistContent = helpers.renderTemplate("enhancedArtist", {
        artist: artist.artist,
        genre: artist.genre,
        cover: helpers.getArtistImageUrl(artist.artist),
        albumCount: artist.albums.length,
        songCount: helpers.getTotalSongs(artist),
      });
      
      // Update content (with fade effect)
      this.updatePageContent(artistContent, () => {
        // After content is loaded, setup additional functionality
        const artistHeader = document.getElementById('artist-header');
        const headerToggle = document.getElementById('header-toggle');
        
        if (artistHeader && headerToggle) {
          const toggleHeader = () => {
            artistHeader.classList.toggle('collapsed');
            
            if (artistHeader.classList.contains('collapsed')) {
              ui.showNotification('Header collapsed', 'info');
            } else {
              ui.showNotification('Header expanded', 'info');
            }
          };
          
          headerToggle.addEventListener('click', toggleHeader);
          
          const keyHandler = (e) => {
            if (e.altKey && e.key === 'h' && artistHeader) {
              toggleHeader();
            }
          };
          
          if (window.currentHeaderKeyHandler) {
            document.removeEventListener('keydown', window.currentHeaderKeyHandler);
          }
          
          document.addEventListener('keydown', keyHandler);
          window.currentHeaderKeyHandler = keyHandler;
        }
        
        const artistHeaderImage = document.querySelector('.artist-avatar img');
        if (artistHeaderImage) {
          const artistImageUrl = helpers.getArtistImageUrl(artist.artist);
          const fallbackUrl = helpers.getDefaultArtistImage();
          helpers.loadImageWithFallback(artistHeaderImage, artistImageUrl, fallbackUrl, 'artist');
        }
        
        const similarContainer = document.getElementById("similar-artists-container");
        if (similarContainer && artist.similar) {
          ui.similarArtistsCarousel = new helpers.SimilarArtistsCarousel(similarContainer);
          
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
              ui.similarArtistsCarousel.addArtist(similarArtistData);
            }, i * 50);
          }
        }
        
        const albumsContainer = document.getElementById("albums-container");
        if (albumsContainer && artist.albums?.length > 0) {
          ui.albumSelector = new helpers.AlbumSelector(albumsContainer, artist);
        }
        
        // Complete the loading
        ui.completeLoadingBar();
        ui.bindDynamicPageEvents();
        this.hideLoading();
      });
    }, 800);
  });
},

loadAllArtistsPage: function() {
  player.currentPage = "allArtists";
  
  // Show loading overlay
  this.showLoading();
  
      this.updateBreadcrumbs([
      {
        type: 'allArtists',
        params: {},
        url: '/artists/',
        text: 'All Artists'
      }
    ]);
  
  // Prepare all artists page content
  const allArtistsContent = `
    <div class="page-header px-4 sm:px-6 py-4">
      <h1 class="text-3xl font-bold mb-6">All Artists</h1>
      <div class="filter-controls mb-6 flex flex-wrap gap-4 items-center">
        <div class="search-wrapper relative flex-grow max-w-md">
          <input type="text" id="artist-search" 
                 class="w-full bg-bg-subtle border border-border-subtle rounded-lg py-2 px-4 pl-10 text-fg-default focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-colors"
                 placeholder="Search artists...">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fg-muted" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div id="genre-filters" class="genre-filters flex flex-wrap gap-2"></div>
        <div class="view-toggle ml-auto">
          <button id="grid-view-btn" class="p-2 rounded-lg bg-bg-subtle hover:bg-bg-muted active:bg-accent-primary transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button id="list-view-btn" class="p-2 rounded-lg bg-bg-subtle hover:bg-bg-muted transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div id="artists-grid" class="artists-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 sm:px-6"></div>
  `;
  
  // Update content (with fade effect)
  this.updatePageContent(allArtistsContent, () => {
    // Show skeleton loaders
    const artistsGrid = document.getElementById('artists-grid');
    ui.showSkeletonLoader(artistsGrid, "220px", 10);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      // Render all artists
      this.renderAllArtists(artistsGrid);
      
      // Setup search and filter functionality
      this.setupArtistFilters();
      
      // Complete the loading
      ui.completeLoadingBar();
      ui.fadeInContent(document.getElementById('dynamic-content'));
      this.hideLoading();
    }, 800);
  });
},

loadSearchPage: function(query) {
  player.currentPage = "search";
  
  // Show loading overlay
  this.showLoading();
  
  // Prepare search page content
  const searchContent = `
    <div class="page-header px-4 sm:px-6 py-4">
      <h1 class="text-3xl font-bold mb-6">Search Results: "${query}"</h1>
      <div class="search-controls mb-6 flex items-center">
        <div class="search-wrapper relative flex-grow max-w-md">
          <input type="text" id="search-input" value="${query}" 
                 class="w-full bg-bg-subtle border border-border-subtle rounded-lg py-2 px-4 pl-10 text-fg-default focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-colors"
                 placeholder="Search...">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fg-muted" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <button id="search-btn" class="ml-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition">
          Search
        </button>
      </div>
      
      <div class="search-tabs border-b border-border-default">
        <div class="flex space-x-6">
          <button class="search-tab active py-2 px-1 border-b-2 border-accent-primary text-accent-primary" data-tab="all">
            All Results
          </button>
          <button class="search-tab py-2 px-1 border-b-2 border-transparent hover:text-accent-primary" data-tab="artists">
            Artists
          </button>
          <button class="search-tab py-2 px-1 border-b-2 border-transparent hover:text-accent-primary" data-tab="albums">
            Albums
          </button>
          <button class="search-tab py-2 px-1 border-b-2 border-transparent hover:text-accent-primary" data-tab="songs">
            Songs
          </button>
        </div>
      </div>
    </div>
    
    <div class="search-results px-4 sm:px-6 py-4">
      <div class="search-tab-content" id="all-results"></div>
      <div class="search-tab-content hidden" id="artists-results"></div>
      <div class="search-tab-content hidden" id="albums-results"></div>
      <div class="search-tab-content hidden" id="songs-results"></div>
    </div>
  `;
  
  // Update content (with fade effect)
  this.updatePageContent(searchContent, () => {
    // Show skeleton loaders
    ui.showSkeletonLoader(document.getElementById('all-results'), "80px", 5);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      // Perform search
      this.performSearch(query);
      
      // Setup search form
      const searchInput = document.getElementById('search-input');
      const searchBtn = document.getElementById('search-btn');
      
      if (searchInput && searchBtn) {
        const handleSearch = () => {
          const newQuery = searchInput.value.trim();
          if (newQuery) {
            window.siteMap.navigateTo('search', { query: newQuery });
          }
        };
        
        searchBtn.addEventListener('click', handleSearch);
        
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        });
      }
      
      // Setup tabs
      const tabs = document.querySelectorAll('.search-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          // Update active tab
          tabs.forEach(t => t.classList.remove('active', 'border-accent-primary', 'text-accent-primary'));
          tab.classList.add('active', 'border-accent-primary', 'text-accent-primary');
          
          // Show corresponding content
          const tabName = tab.dataset.tab;
          document.querySelectorAll('.search-tab-content').forEach(content => {
            content.classList.toggle('hidden', content.id !== `${tabName}-results`);
          });
        });
      });
      
      // Complete the loading
      ui.completeLoadingBar();
      ui.fadeInContent(document.getElementById('dynamic-content'));
      this.hideLoading();
    }, 800);
  });
},

loadAlbumPage: function(artist, album) {
  player.currentPage = "album";
  player.currentArtist = artist;
  player.currentAlbum = album;
  
  // Show loading overlay
  this.showLoading();
  
  // Simulate loading delay for better UX
  setTimeout(() => {
    // Prepare album page content
    const albumContent = `
      <div class="album-header px-4 sm:px-6 py-6">
        <div class="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div class="album-image-container relative flex-shrink-0">
            <img src="${helpers.getAlbumImageUrl(album.album)}" alt="${album.album}" class="album-cover w-64 h-64 rounded-xl shadow-lg">
            <button class="play-album absolute bottom-4 right-4 bg-accent-primary hover:bg-accent-secondary w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-110">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <div class="album-info">
            <h1 class="text-3xl font-bold mb-2">${album.album}</h1>
            <div class="artist-link text-accent-primary hover:underline cursor-pointer mb-1" data-nav="artist" data-artist="${artist.artist}">
              ${artist.artist}
            </div>
            <div class="album-meta text-sm text-fg-muted mb-4">
              ${album.year ? `<span class="album-year">${album.year}</span> • ` : ''}
              <span class="album-songs">${album.songs.length} ${album.songs.length === 1 ? 'song' : 'songs'}</span>
            </div>
            <div class="album-actions flex gap-4 mb-6">
              <button class="play-all-btn flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg transition">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                </svg>
                Play All
              </button>
              <button class="shuffle-btn flex items-center gap-2 px-4 py-2 bg-bg-subtle hover:bg-bg-muted text-fg-default rounded-lg transition">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a1 1 0 10-2 0v6a1 1 0 102 0V5z" />
                </svg>
                Shuffle
              </button>
              <button class="add-to-queue-btn flex items-center gap-2 px-4 py-2 bg-bg-subtle hover:bg-bg-muted text-fg-default rounded-lg transition">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
                Add to Queue
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="album-tracks px-4 sm:px-6 py-4">
        <h2 class="text-xl font-semibold mb-4">Tracks</h2>
        <div class="songs-container" id="album-songs-container"></div>
      </div>
    `;
    
    // Update content (with fade effect)
    this.updatePageContent(albumContent, () => {
      // Load album cover image with fallback
      const albumCoverImage = document.querySelector('.album-cover');
      if (albumCoverImage) {
        const albumImageUrl = helpers.getAlbumImageUrl(album.album);
        const fallbackUrl = helpers.getDefaultAlbumImage();
        helpers.loadImageWithFallback(albumCoverImage, albumImageUrl, fallbackUrl, 'album');
      }
      
      // Render songs
      const songsContainer = document.getElementById('album-songs-container');
      if (songsContainer) {
        album.songs.forEach((song, index) => {
          const songData = { 
            ...song, 
            artist: artist.artist, 
            album: album.album, 
            cover: helpers.getAlbumImageUrl(album.album) 
          };
          
          const songHtml = helpers.renderTemplate("songItem", {
            trackNumber: index + 1,
            title: song.title,
            duration: song.duration,
            id: song.id,
            songData: JSON.stringify(songData).replace(/"/g, "&quot;"),
          });
          
          songsContainer.insertAdjacentHTML("beforeend", songHtml);
        });
      }
      
      // Bind events
      const playAllBtn = document.querySelector('.play-all-btn');
      const shuffleBtn = document.querySelector('.shuffle-btn');
      const addToQueueBtn = document.querySelector('.add-to-queue-btn');
      const playAlbumBtn = document.querySelector('.play-album');
      
      if (playAllBtn) {
        playAllBtn.addEventListener('click', () => this.playAlbum(artist, album, false));
      }
      
      if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => this.playAlbum(artist, album, true));
      }
      
      if (addToQueueBtn) {
        addToQueueBtn.addEventListener('click', () => this.addAlbumToQueue(artist, album));
      }
      
      if (playAlbumBtn) {
        playAlbumBtn.addEventListener('click', () => this.playAlbum(artist, album, false));
      }
      
      // Complete the loading
      ui.bindDynamicPageEvents();
      ui.completeLoadingBar();
      ui.fadeInContent(document.getElementById('dynamic-content'));
      this.hideLoading();
    });
  }, 800);
},


showLoading: function() {
  const loadingOverlay = document.getElementById('content-loading');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('hidden');
  }
  ui.showLoadingBar();
},

hideLoading: function() {
  const loadingOverlay = document.getElementById('content-loading');
  if (loadingOverlay) {
    loadingOverlay.classList.add('hidden');
  }
  ui.completeLoadingBar();
},

clearPageContent: function(callback) {
  const contentWrapper = document.getElementById('dynamic-content');
  if (!contentWrapper) {
    if (callback) callback();
    return;
  }
  
  // Fade out effect
  contentWrapper.classList.add('fade-out');
  
  // After fade out, clear content and call callback
  setTimeout(() => {
    contentWrapper.innerHTML = '';
    contentWrapper.classList.remove('fade-out');
    if (callback) callback();
  }, 300);
},

updatePageContent: function(newContent, callback) {
  const contentWrapper = document.getElementById('dynamic-content');
  if (!contentWrapper) {
    if (callback) callback();
    return;
  }
  
  // Fade out current content
  contentWrapper.classList.add('fade-out');
  
  setTimeout(() => {
    // Update content
    contentWrapper.innerHTML = newContent;
    contentWrapper.classList.remove('fade-out');
    
    // Fade in new content
    contentWrapper.classList.add('fade-in');
    
    setTimeout(() => {
      contentWrapper.classList.remove('fade-in');
      if (callback) callback();
    }, 300);
  }, 300);
},

renderAllArtists: function(container) {
  if (!container || !window.music) return;
  
  container.innerHTML = '';
  
  window.music.forEach((artist) => {
    const artistElement = helpers.createElementFromHTML(
      `<div class="artist-card" data-artist-id="${artist.id}" data-nav="artist" data-artist="${artist.artist}">
        <div class="text-center">
          <div class="artist-avatar w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden">
            <img src="${helpers.getArtistImageUrl(artist.artist)}" alt="${artist.artist}" class="w-full h-full object-cover">
          </div>
          <h3 class="text-lg font-bold mb-2">${artist.artist}</h3>
          <div class="genre-tag inline-block px-3 py-1 bg-blue-600 bg-opacity-30 rounded-full text-xs font-medium mb-3">${artist.genre || 'Unknown'}</div>
          <p class="text-sm opacity-70">${artist.albums.length} album${artist.albums.length !== 1 ? 's' : ''}</p>
        </div>
      </div>`
    );
    
    // Load artist image with fallback
    const artistImage = artistElement?.querySelector('.artist-avatar img');
    if (artistImage) {
      const artistImageUrl = helpers.getArtistImageUrl(artist.artist);
      const fallbackUrl = helpers.getDefaultArtistImage();
      helpers.loadImageWithFallback(artistImage, artistImageUrl, fallbackUrl, 'artist');
    }
    
    if (artistElement) {
      container.appendChild(artistElement);
      
      // Add click event
      artistElement.addEventListener('dblClick', () => {
        window.siteMap.navigateTo('artist', { artist: artist.artist });
      });
    }
  });
},

setupArtistFilters: function() {
  // Get all genres from music library
  const genres = new Set();
  window.music?.forEach(artist => {
    if (artist.genre) genres.add(artist.genre);
  });
  
  // Populate genre filters
  const genreFilters = document.getElementById('genre-filters');
  if (genreFilters) {
    genreFilters.innerHTML = `<div class="genre-tag active" data-genre="all">All Genres</div>`;
    
    Array.from(genres).sort().forEach(genre => {
      const genreTag = document.createElement('div');
      genreTag.className = 'genre-tag';
      genreTag.dataset.genre = genre;
      genreTag.textContent = genre;
      genreFilters.appendChild(genreTag);
    });
    
    // Add click event to genre tags
    genreFilters.querySelectorAll('.genre-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        // Update active state
        genreFilters.querySelectorAll('.genre-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        
        // Filter artists
        const genre = tag.dataset.genre;
        this.filterArtistsByGenre(genre);
      });
    });
  }
  
  // Setup search input
  const searchInput = document.getElementById('artist-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      this.filterArtistsBySearch(searchInput.value);
    });
  }
  
  // Setup view toggles
  const gridViewBtn = document.getElementById('grid-view-btn');
  const listViewBtn = document.getElementById('list-view-btn');
  const artistsGrid = document.getElementById('artists-grid');
  
  if (gridViewBtn && listViewBtn && artistsGrid) {
    gridViewBtn.addEventListener('click', () => {
      gridViewBtn.classList.add('active', 'bg-accent-primary', 'text-white');
      listViewBtn.classList.remove('active', 'bg-accent-primary', 'text-white');
      
      artistsGrid.classList.remove('list-view');
      artistsGrid.classList.add('grid-view');
      
      localStorage.setItem('artistsViewMode', 'grid');
    });
    
    listViewBtn.addEventListener('click', () => {
      listViewBtn.classList.add('active', 'bg-accent-primary', 'text-white');
      gridViewBtn.classList.remove('active', 'bg-accent-primary', 'text-white');
      
      artistsGrid.classList.remove('grid-view');
      artistsGrid.classList.add('list-view');
      
      localStorage.setItem('artistsViewMode', 'list');
    });
    
    // Set initial view mode from localStorage
    const savedViewMode = localStorage.getItem('artistsViewMode') || 'grid';
    if (savedViewMode === 'list') {
      listViewBtn.click();
    } else {
      gridViewBtn.click();
    }
  }
},

filterArtistsByGenre: function(genre) {
  const artistsGrid = document.getElementById('artists-grid');
  const artists = artistsGrid?.querySelectorAll('.artist-card');
  
  if (!artistsGrid || !artists) return;
  
  if (genre === 'all') {
    artists.forEach(artist => artist.style.display = '');
  } else {
    artists.forEach(artist => {
      const artistGenre = artist.querySelector('.genre-tag')?.textContent;
      artist.style.display = artistGenre === genre ? '' : 'none';
    });
  }
},

filterArtistsBySearch: function(query) {
  if (!query) {
    // If search is cleared, restore genre filter
    const activeGenre = document.querySelector('.genre-tag.active')?.dataset.genre || 'all';
    return this.filterArtistsByGenre(activeGenre);
  }
  
  const artistsGrid = document.getElementById('artists-grid');
  const artists = artistsGrid?.querySelectorAll('.artist-card');
  
  if (!artistsGrid || !artists) return;
  
  const searchQuery = query.toLowerCase().trim();
  
  artists.forEach(artist => {
    const artistName = artist.querySelector('h3')?.textContent?.toLowerCase() || '';
    artist.style.display = artistName.includes(searchQuery) ? '' : 'none';
  });
},

performSearch: function(query) {
  if (!query || !window.music) return;
  
  const searchQuery = query.toLowerCase().trim();
  const results = {
    artists: [],
    albums: [],
    songs: []
  };
  
  // Search artists
  window.music.forEach(artist => {
    // Match artist name
    if (artist.artist.toLowerCase().includes(searchQuery)) {
      results.artists.push(artist);
    }
    
    // Search albums
    artist.albums.forEach(album => {
      if (album.album.toLowerCase().includes(searchQuery)) {
        results.albums.push({ album, artist });
      }
      
      // Search songs
      album.songs.forEach(song => {
        if (song.title.toLowerCase().includes(searchQuery)) {
          results.songs.push({ 
            ...song, 
            artist: artist.artist,
            album: album.album,
            cover: helpers.getAlbumImageUrl(album.album)
          });
        }
      });
    });
  });
  
  // Render results
  this.renderSearchResults(results, searchQuery);
},

renderSearchResults: function(results, query) {
  // Render All Results Tab (a mix of everything)
  const allResultsContainer = document.getElementById('all-results');
  if (!allResultsContainer) return;
  
  // Prepare all results view
  let allResultsHTML = '';
  
  // First few artists
  if (results.artists.length > 0) {
    allResultsHTML += `
      <div class="search-section mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Artists</h2>
          <button class="view-all-btn text-sm text-accent-primary hover:underline" data-tab="artists">
            View all (${results.artists.length})
          </button>
        </div>
        <div class="artists-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          ${results.artists.slice(0, 5).map(artist => `
            <div class="artist-card cursor-pointer" data-nav="artist" data-artist="${artist.artist}">
              <div class="text-center">
                <div class="artist-avatar w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden">
                  <img src="${helpers.getArtistImageUrl(artist.artist)}" alt="${artist.artist}" class="w-full h-full object-cover">
                </div>
                <h3 class="text-sm font-medium truncate">${artist.artist}</h3>
                <p class="text-xs text-fg-muted">${artist.albums.length} album${artist.albums.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // First few albums
  if (results.albums.length > 0) {
    allResultsHTML += `
      <div class="search-section mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Albums</h2>
          <button class="view-all-btn text-sm text-accent-primary hover:underline" data-tab="albums">
            View all (${results.albums.length})
          </button>
        </div>
        <div class="albums-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          ${results.albums.slice(0, 5).map(item => `
            <div class="album-grid-item cursor-pointer" data-nav="album" data-artist="${item.artist.artist}" data-album="${item.album.album}">
              <div class="album-image aspect-square rounded-lg overflow-hidden mb-2">
                <img src="${helpers.getAlbumImageUrl(item.album.album)}" alt="${item.album.album}" class="w-full h-full object-cover">
              </div>
              <h3 class="text-sm font-medium truncate">${item.album.album}</h3>
              <p class="text-xs text-fg-muted truncate">${item.artist.artist}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // First few songs
  if (results.songs.length > 0) {
    allResultsHTML += `
      <div class="search-section mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Songs</h2>
          <button class="view-all-btn text-sm text-accent-primary hover:underline" data-tab="songs">
            View all (${results.songs.length})
          </button>
        </div>
        <div class="songs-list space-y-1">
          ${results.songs.slice(0, 5).map(song => `
            <div class="song-item group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition cursor-pointer" data-song='${JSON.stringify(song).replace(/"/g, "&quot;")}'>
              <div class="flex items-center flex-1 min-w-0 gap-3">
                <div class="song-cover w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                  <img src="${song.cover}" alt="${song.title}" class="w-full h-full object-cover">
                </div>
                <div class="truncate">
                  <p class="text-sm font-medium truncate">${song.title}</p>
                  <div class="flex items-center text-xs text-fg-muted">
                    <span class="truncate">${song.artist}</span>
                    <span class="mx-1">•</span>
                    <span class="truncate">${song.album}</span>
                  </div>
                </div>
              </div>
              <div class="song-toolbar flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10" data-action="play-next" title="Play next">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" /></svg>
                </button>
                <button class="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10" data-action="add-queue" title="Add to queue">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // No results state
  if (results.artists.length === 0 && results.albums.length === 0 && results.songs.length === 0) {
    allResultsHTML = `
      <div class="empty-results text-center py-12">
        <svg class="mx-auto h-12 w-12 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium">No results found</h3>
        <p class="mt-1 text-sm text-fg-muted">We couldn't find anything matching "${query}"</p>
      </div>
    `;
  }
  
  allResultsContainer.innerHTML = allResultsHTML;
  
  // Render dedicated tabs
  this.renderArtistsResults(document.getElementById('artists-results'), results.artists, query);
  this.renderAlbumsResults(document.getElementById('albums-results'), results.albums, query);
  this.renderSongsResults(document.getElementById('songs-results'), results.songs, query);
  
  // Bind events
  document.querySelectorAll('.view-all-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabToShow = btn.dataset.tab;
      document.querySelector(`.search-tab[data-tab="${tabToShow}"]`).click();
    });
  });
  
  // Bind events for navigation
  document.querySelectorAll('[data-nav]').forEach(item => {
    item.addEventListener('click', () => {
      const nav = item.dataset.nav;
      const params = {};
      
      if (nav === 'artist') {
        params.artist = item.dataset.artist;
      } else if (nav === 'album') {
        params.artist = item.dataset.artist;
        params.album = item.dataset.album;
      }
      
      window.siteMap.navigateTo(nav, params);
    });
  });
  
  // Bind events for songs
  document.querySelectorAll('.song-item').forEach(item => {
    item.addEventListener('dblClick', (e) => {
      if (!e.target.closest('.song-toolbar')) {
        try {
          const songData = JSON.parse(item.dataset.song);
          player.playSong(songData);
        } catch (err) {
          console.error("Failed to parse song data:", err);
        }
      }
    });
  });
  
  // Bind song toolbar buttons
  document.querySelectorAll('.song-toolbar button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = button.dataset.action;
      const songItem = button.closest('.song-item');
      
      try {
        const songData = JSON.parse(songItem.dataset.song);
        
        switch (action) {
          case 'play-next':
            player.addToQueue(songData, 0);
            ui.showNotification("Added to play next");
            break;
          case 'add-queue':
            player.addToQueue(songData);
            ui.showNotification("Added to queue");
            break;
        }
      } catch (err) {
        console.error("Failed to parse song data:", err);
      }
    });
  });
},

renderArtistsResults: function(container, artists, query) {
  if (!container) return;
  
  if (artists.length === 0) {
    container.innerHTML = `
      <div class="empty-results text-center py-12">
        <svg class="mx-auto h-12 w-12 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium">No artists found</h3>
        <p class="mt-1 text-sm text-fg-muted">We couldn't find any artists matching "${query}"</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="artists-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      ${artists.map(artist => `
        <div class="artist-card cursor-pointer" data-nav="artist" data-artist="${artist.artist}">
          <div class="text-center">
            <div class="artist-avatar w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden">
              <img src="${helpers.getArtistImageUrl(artist.artist)}" alt="${artist.artist}" class="w-full h-full object-cover">
            </div>
            <h3 class="text-lg font-bold mb-2">${artist.artist}</h3>
            <div class="genre-tag inline-block px-3 py-1 bg-blue-600 bg-opacity-30 rounded-full text-xs font-medium mb-3">${artist.genre || 'Unknown'}</div>
            <p class="text-sm opacity-70">${artist.albums.length} album${artist.albums.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  // Bind click events
  container.querySelectorAll('.artist-card').forEach(card => {
    card.addEventListener('click', () => {
      const artist = card.dataset.artist;
      window.siteMap.navigateTo('artist', { artist });
    });
  });
  
  // Load artist images with fallbacks
  container.querySelectorAll('.artist-avatar img').forEach(img => {
    const artistName = img.alt;
    const artistImageUrl = helpers.getArtistImageUrl(artistName);
    const fallbackUrl = helpers.getDefaultArtistImage();
    helpers.loadImageWithFallback(img, artistImageUrl, fallbackUrl, 'artist');
  });
},

renderAlbumsResults: function(container, albums, query) {
  if (!container) return;
  
  if (albums.length === 0) {
    container.innerHTML = `
      <div class="empty-results text-center py-12">
        <svg class="mx-auto h-12 w-12 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium">No albums found</h3>
        <p class="mt-1 text-sm text-fg-muted">We couldn't find any albums matching "${query}"</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="albums-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      ${albums.map(item => `
        <div class="album-grid-item cursor-pointer" data-nav="album" data-artist="${item.artist.artist}" data-album="${item.album.album}">
          <div class="album-image aspect-square rounded-lg overflow-hidden mb-3">
            <img src="${helpers.getAlbumImageUrl(item.album.album)}" alt="${item.album.album}" class="w-full h-full object-cover">
          </div>
          <h3 class="font-medium text-base truncate">${item.album.album}</h3>
          <p class="text-sm text-fg-muted truncate">${item.artist.artist}</p>
          ${item.album.year ? `<p class="text-xs text-fg-subtle">${item.album.year}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `;
  
  // Bind click events
  container.querySelectorAll('.album-grid-item').forEach(album => {
    album.addEventListener('click', () => {
      const artist = album.dataset.artist;
      const albumName = album.dataset.album;
      window.siteMap.navigateTo('album', { artist, album: albumName });
    });
  });
  
  // Load album images with fallbacks
  container.querySelectorAll('.album-image img').forEach(img => {
    const albumName = img.alt;
    const albumImageUrl = helpers.getAlbumImageUrl(albumName);
    const fallbackUrl = helpers.getDefaultAlbumImage();
    helpers.loadImageWithFallback(img, albumImageUrl, fallbackUrl, 'album');
  });
},

renderSongsResults: function(container, songs, query) {
  if (!container) return;
  
  if (songs.length === 0) {
    container.innerHTML = `
      <div class="empty-results text-center py-12">
        <svg class="mx-auto h-12 w-12 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium">No songs found</h3>
        <p class="mt-1 text-sm text-fg-muted">We couldn't find any songs matching "${query}"</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `<div class="songs-list space-y-1"></div>`;
  
  const songsList = container.querySelector('.songs-list');
  
  songs.forEach(song => {
    const songElement = helpers.createElementFromHTML(`
      <div class="song-item group flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white hover:bg-opacity-5 transition cursor-pointer" data-song='${JSON.stringify(song).replace(/"/g, "&quot;")}'>
        <div class="flex items-center flex-1 min-w-0 gap-4">
          <div class="song-cover w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
            <img src="${song.cover}" alt="${song.title}" class="w-full h-full object-cover">
          </div>
          <div class="truncate">
            <p class="text-sm font-medium truncate">${song.title}</p>
            <div class="flex items-center text-xs text-fg-muted mt-1">
              <span class="truncate">${song.artist}</span>
              <span class="mx-1">•</span>
              <span class="truncate">${song.album}</span>
            </div>
          </div>
        </div>
        <div class="song-toolbar flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button class="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10" data-action="favorite" title="Add to favorites">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          </button>
          <button class="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10" data-action="play-next" title="Play next">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" /></svg>
          </button>
          <button class="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10" data-action="add-queue" title="Add to queue">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>
          </button>
          <button class="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10" data-action="share" title="Share">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
          </button>
        </div>
      </div>
    `);
    
    // Load song cover with fallback
    const songImage = songElement?.querySelector('.song-cover img');
    if (songImage) {
      const albumImageUrl = helpers.getAlbumImageUrl(song.album);
      const fallbackUrl = helpers.getDefaultAlbumImage();
      helpers.loadImageWithFallback(songImage, albumImageUrl, fallbackUrl, 'album');
    }
    
    if (songsList && songElement) songsList.appendChild(songElement);
  });
  
  // Bind events for songs
  container.querySelectorAll('.song-item').forEach(item => {
    item.addEventListener('dblClick', (e) => {
      if (!e.target.closest('.song-toolbar')) {
        try {
          const songData = JSON.parse(item.dataset.song);
          player.playSong(songData);
        } catch (err) {
          console.error("Failed to parse song data:", err);
        }
      }
    });
  });
  
  // Bind song toolbar buttons
  container.querySelectorAll('.song-toolbar button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = button.dataset.action;
      if (action) ui.handleToolbarAction(action, button);
    });
  });
},

playAlbum: function(artist, album, shuffle) {
  if (!artist || !album || !album.songs || album.songs.length === 0) return;
  
  // Copy the songs array to avoid modifying the original
  let songs = [...album.songs];
  
  // Shuffle if requested
  if (shuffle) {
    for (let i = songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }
    ui.showNotification(`Shuffling ${album.album}`);
  } else {
    ui.showNotification(`Playing ${album.album}`);
  }
  
  // Clear queue and add all songs except the first one
  player.queue = [];
  for (let i = 1; i < songs.length; i++) {
    player.addToQueue({ 
      ...songs[i], 
      artist: artist.artist, 
      album: album.album, 
      cover: helpers.getAlbumImageUrl(album.album) 
    });
  }
  
  // Play the first song immediately
  player.playSong({ 
    ...songs[0], 
    artist: artist.artist, 
    album: album.album, 
    cover: helpers.getAlbumImageUrl(album.album) 
  });
},

addAlbumToQueue: function(artist, album) {
  if (!artist || !album || !album.songs || album.songs.length === 0) return;
  
  album.songs.forEach((song) => {
    player.addToQueue({ 
      ...song, 
      artist: artist.artist, 
      album: album.album, 
      cover: helpers.getAlbumImageUrl(album.album) 
    });
  });
  
  ui.showNotification(`Added ${album.songs.length} songs to queue`);
},
  

  
};






const helpers = {
  getArtistImageUrl: function(artistName) {
    if (!artistName) return this.getDefaultArtistImage();
    const normalizedName = this.normalizeNameForUrl(artistName);
    return `https://koders.cloud/global/content/images/artistPortraits/${normalizedName}.png`;
  },
  
  getAlbumImageUrl: function(albumName) {
    if (!albumName) return this.getDefaultAlbumImage();
    const normalizedName = this.normalizeNameForUrl(albumName);
    return `https://koders.cloud/global/content/images/albumCovers/${normalizedName}.png`;
  },
  
  normalizeNameForUrl: function(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
  },
  
  getDefaultArtistImage: function() {
    return 'https://koders.cloud/global/content/images/artistPortraits/default-artist.png';
  },
  
  getDefaultAlbumImage: function() {
    return 'https://koders.cloud/global/content/images/albumCovers/default-album.png';
  },
  
  loadImageWithFallback: function(imgElement, primaryUrl, fallbackUrl, type = 'image') {
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
        imgElement.src = this.generatePlaceholderImage(type);
      };
      
      fallbackImage.src = fallbackUrl;
    };
    
    imgElement.classList.add('image-loading');
    imgElement.classList.remove('image-loaded', 'image-error', 'image-fallback');
    testImage.src = primaryUrl;
  },
  
  generatePlaceholderImage: function(type) {
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
  },
  
  parseDuration: function(durationStr) {
    if (typeof durationStr !== "string") return 0;
    const parts = durationStr.split(":").map(Number);
    return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) ? parts[0] * 60 + parts[1] : 0;
  },
  
  formatTime: function(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },
  
  getTotalSongs: function(artist) {
    return artist.albums.reduce((total, album) => total + album.songs.length, 0);
  },
  
  shareSong: async function(song) {
    const shareData = {
      title: `${song.title} by ${song.artist}`,
      text: `Check out "${song.title}" by ${song.artist}`,
      url: window.location.href,
    };
    
    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        ui.showNotification("Song shared!");
      } else {
        await navigator.clipboard.writeText(shareData.text);
        ui.showNotification("Copied to clipboard");
      }
    } catch (err) {
      console.error("Share/Copy failed:", err);
      ui.showNotification("Could not share or copy");
    }
  },
  
  createElementFromHTML: function(htmlString) {
    const div = document.createElement("div");
    div.innerHTML = htmlString.trim();
    return div.firstChild;
  },
  
  renderTemplate: function(templateName, data) {
    switch (templateName) {
      case "queueItem":
        return `
          <div class="queue-item flex items-center space-x-3 p-2 hover:bg-white hover:bg-opacity-10 rounded-lg cursor-pointer transition-colors">
            <img src="${data.cover}" alt="${data.title}" class="queue-item-cover w-10 h-10 rounded-md object-cover">
            <div class="flex-1 min-w-0">
              <p class="queue-item-title text-sm font-medium truncate">${data.title}</p>
              <p class="text-xs opacity-70 truncate">${data.artist}</p>
            </div>
            <span class="text-xs opacity-50">${data.duration}</span>
          </div>
        `;
      case "artistCard":
        return `
          <div class="artist-card rounded-xl bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 p-6 cursor-pointer hover:shadow-lg transition-all" data-artist-id="${data.id}">
            <div class="text-center">
              <div class="artist-avatar w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                <img src="${data.cover}" alt="${data.artist}" class="w-full h-full object-cover">
              </div>
              <h3 class="text-lg font-bold mb-2">${data.artist}</h3>
              <div class="genre-tag inline-block px-3 py-1 bg-blue-600 bg-opacity-30 rounded-full text-xs font-medium mb-3">${data.genre}</div>
              <p class="text-sm opacity-70">${data.albumCount} album${data.albumCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
        `;
      case "enhancedArtist":
        return `
          <div class="artistTop">
            <div class="artist-header" id="artist-header">

              <div class="content-wrapper">
                <div class="artist-avatar">
                  <img src="${data.cover}" alt="${data.artist}">
                </div>

                <div class="artist-info">
                  <h1>${data.artist}</h1>

                  <div class="metadata-tags">
                    <span>${data.genre}</span>
                    <span>${data.albumCount} Albums</span>
                    <span>${data.songCount} Songs</span>
                  </div>

                  <div class="action-buttons">
                    <button class="play">▶️ Play All</button>
                    <button class="follow">⭐ Follow</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="content-offset">
            <div class="similar-artists-section">
              <h2>Similar Artists</h2>
              <div id="similar-artists-container"></div>
            </div>

            <div class="albums-section">
              <h2>Albums</h2>
              <div id="albums-container" class="albums-grid"></div>
            </div>
          </div>
        `;
      case "singleAlbumCard":
        return `
          <div class="album-card p-5 rounded-2xl bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-5">
            <div class="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div class="album-image relative flex-shrink-0">
                <img src="${data.cover}" alt="${data.album}" class="album-cover w-48 h-48 md:w-64 md:h-64 rounded-xl shadow-lg">
                <button class="play-album absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-110">
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <div class="flex-1 artistBottom">
                <h3 class="text-2xl font-bold mb-2">${data.album}</h3>
                <p class="text-sm opacity-70 mb-4">${data.year || 'Unknown year'} • ${data.songCount} Tracks</p>
                <div class="songs-container" id="songs-container-${data.albumId}"></div>
              </div>
            </div>
          </div>
        `;
      case "songItem":
        return `
          <div class="song-item group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition cursor-pointer" data-song='${data.songData}'>
            <div class="flex items-center flex-1 min-w-0 gap-4">
              <span class="text-sm opacity-50 w-4 text-center">${data.trackNumber}</span>
              <div class="truncate">
                <p class="text-sm font-medium truncate">${data.title}</p>
                <p class="text-xs opacity-60">${data.duration}</p>
              </div>
            </div>
            <div class="song-toolbar flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10" data-action="favorite" title="Add to favorites">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              </button>
              <button class="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10" data-action="play-next" title="Play next">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" /></svg>
              </button>
              <button class="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10" data-action="add-queue" title="Add to queue">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>
              </button>
              <button class="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10" data-action="share" title="Share">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
              </button>
            </div>
          </div>
        `;
      default:
        return "";
    }
  },
  
  SimilarArtistsCarousel: class {
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
      const artistElement = helpers.createElementFromHTML(`
        <div class="similar-artist-card" data-artist-name="${artistData.artist}">
          <div class="similar-artist-image">
            <img src="${helpers.getArtistImageUrl(artistData.artist)}" alt="${artistData.artist}" class="w-full h-full object-cover">
          </div>
          <div class="similar-artist-name">${artistData.artist}</div>
          <div class="artist-popover">
            <div class="popover-artist-name">${artistData.artist}</div>
            <div class="popover-stats">
              ${artistData.albums ? artistData.albums.length : 0} Albums<br>
              ${artistData.albums ? helpers.getTotalSongs(artistData) : 0} Songs
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
              pageManager.loadArtistPage(artist);
            } else {
              ui.showNotification(`Artist "${artistData.artist}" not found in library`);
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
  },
  
  AlbumSelector: class {
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
        const tabElement = helpers.createElementFromHTML(`
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
      
      albumContent.innerHTML = helpers.renderTemplate("singleAlbumCard", {
        album: album.album,
        cover: helpers.getAlbumImageUrl(album.album),
        year: album.year,
        songCount: album.songs.length,
        albumId: albumId,
      });
      
      const albumCoverImage = albumContent.querySelector('.album-cover');
      if (albumCoverImage) {
        const albumImageUrl = helpers.getAlbumImageUrl(album.album);
        const fallbackUrl = helpers.getDefaultAlbumImage();
        helpers.loadImageWithFallback(albumCoverImage, albumImageUrl, fallbackUrl, 'album');
      }
      
      const songsContainer = albumContent.querySelector(`#songs-container-${albumId}`);
      if (songsContainer) {
        album.songs.forEach((song, index) => {
          const songData = { 
            ...song, 
            artist: this.artist.artist, 
            album: album.album, 
            cover: helpers.getAlbumImageUrl(album.album) 
          };
          const songHtml = helpers.renderTemplate("songItem", {
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
              player.playSong(songData);
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
          if (action) ui.handleToolbarAction(action, button);
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
      
      player.queue = [];
      album.songs.forEach((song) => player.addToQueue({ 
        ...song, 
        artist: this.artist.artist, 
        album: album.album, 
        cover: helpers.getAlbumImageUrl(album.album) 
      }));
      
      if (player.queue.length > 0) {
        player.playSong(player.queue.shift());
        ui.showNotification(`Playing "${album.album}"`);
      }
    }
  },
  
  createPopoverPortal: function() {
    let portal = document.getElementById('popover-portal');
    if (!portal) {
      portal = document.createElement('div');
      portal.id = 'popover-portal';
      portal.className = 'popover-portal';
      document.body.appendChild(portal);
    }
    return portal;
  },
  
  initializeTheme: function() {
    const savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    }
    
    if (ui.elements.themeToggle) {
      ui.elements.themeToggle.removeEventListener("click", () => {});
      ui.elements.themeToggle.addEventListener("click", navbar.enhancedThemeToggle);
    }
  },
  
  syncGlobalState: function() {
    window.currentSong = player.currentSong;
    window.isPlaying = player.isPlaying;
    window.currentTime = player.currentTime;
    window.duration = player.duration;
    window.queue = player.queue;
    window.recentlyPlayed = player.recentlyPlayed;
    window.favorites = player.favorites;
    window.getAlbumImageUrl = helpers.getAlbumImageUrl;
    window.getDefaultAlbumImage = helpers.getDefaultAlbumImage;
    window.loadImageWithFallback = helpers.loadImageWithFallback;
    window.formatTime = helpers.formatTime;
    window.showNotification = ui.showNotification;
    
    window.navbarModule = {
      openNowPlayingPopup: navbar.openNowPlayingPopup,
      closeNowPlayingPopup: navbar.closeNowPlayingPopup,
      toggleDropdownMenu: navbar.toggleDropdownMenu,
      openDropdownMenu: navbar.openDropdownMenu,
      closeDropdownMenu: navbar.closeDropdownMenu,
      updateNavbarNowPlaying: navbar.updateNavbarNowPlaying,
      updateDropdownCounts: navbar.updateDropdownCounts,
      getNavbarState: navbar.getNavbarState,
      setNavbarState: navbar.setNavbarState
    };
  }
};

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
    
    const tabsHTML = `
      <div class="popup-tabs">
        <button class="popup-tab active" data-tab="nowPlaying">Now Playing</button>
        <button class="popup-tab" data-tab="upNext">Up Next</button>
        <button class="popup-tab" data-tab="recentPlays">Recent Plays</button>
      </div>
      <div class="popup-content">

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
    
    const songInfo = popup.querySelector('.popup-song-info');
    if (songInfo) {
      songInfo.insertAdjacentHTML('afterend', tabsHTML);
    }
    
    this.tabs.nowPlaying.element = popup.querySelector('[data-tab="nowPlaying"]');
    this.tabs.upNext.element = popup.querySelector('[data-tab="upNext"]');
    this.tabs.recentPlays.element = popup.querySelector('[data-tab="recentPlays"]');
    
    this.tabs.nowPlaying.content = popup.querySelector('#nowPlaying-content');
    this.tabs.upNext.content = popup.querySelector('#upNext-content');
    this.tabs.recentPlays.content = popup.querySelector('#recentPlays-content');
    
    this.moveNowPlayingContent();
  }
  
  moveNowPlayingContent() {
    const popup = document.getElementById('now-playing-popup');
    const content = this.tabs.nowPlaying.content;
    if (!popup || !content) return;
    
    const albumCover = popup.querySelector('#popup-album-cover');
    const songInfo = popup.querySelector('.popup-song-info');
    const progress = popup.querySelector('.popup-progress');
    const controls = popup.querySelector('.popup-controls');
    const actions = popup.querySelector('.popup-actions');
    
    if (albumCover) content.appendChild(albumCover.cloneNode(true));
    if (songInfo) content.appendChild(songInfo.cloneNode(true));
    if (progress) content.appendChild(progress.cloneNode(true));
    if (controls) content.appendChild(controls.cloneNode(true));
    if (actions) content.appendChild(actions.cloneNode(true));
  }
  
  bindEvents() {
    const popup = document.getElementById('now-playing-popup');
    if (!popup) return;
    
    Object.values(this.tabs).forEach(tab => {
      if (tab.element) {
        tab.element.addEventListener('click', (e) => {
          const tabName = e.currentTarget.dataset.tab;
          this.switchTab(tabName);
          this.resetInactivityTimer();
        });
      }
    });
    
    popup.addEventListener('scroll', () => this.handleScroll());
    popup.addEventListener('mousemove', () => this.resetInactivityTimer());
    popup.addEventListener('touchstart', () => this.resetInactivityTimer());
    popup.addEventListener('click', () => this.resetInactivityTimer());
    
    document.addEventListener('keydown', (e) => {
      if (popup.classList.contains('show')) {
        this.handleKeyboard(e);
      }
    });
  }
  
  handleScroll() {
    this.resetInactivityTimer();
    
    if (this.isScrolling) return;
    this.isScrolling = true;
    
    setTimeout(() => {
      this.isScrolling = false;
      const popup = document.getElementById('now-playing-popup');
      if (!popup) return;
      
      const scrollPosition = popup.scrollTop;
      if (scrollPosition > 100 && this.activeTab === 'nowPlaying') {
        this.switchTab('upNext');
      }
    }, 200);
  }
  
  switchTab(tabName, skipAnimation = false) {
    if (tabName === this.activeTab || !this.tabs[tabName]) return;
    
    const currentTab = this.tabs[this.activeTab];
    const newTab = this.tabs[tabName];
    
    Object.values(this.tabs).forEach(tab => {
      if (tab.element) tab.element.classList.remove('active');
    });
    
    newTab.element.classList.add('active');
    
    if (skipAnimation) {
      currentTab.content.classList.add('hidden');
      newTab.content.classList.remove('hidden');
      this.activeTab = tabName;
      this.updateTabContent(tabName);
    } else {
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
      case 'upNext':
        this.updateQueueContent();
        break;
      case 'recentPlays':
        this.updateRecentContent();
        break;
    }
  }
  
  updateQueueContent() {
    const content = document.getElementById('queue-list-popup');
    if (!content) return;
    
    const queue = player.queue || [];
    
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
        <img class="queue-item-cover" src="${helpers.getAlbumImageUrl(song.album) || ''}" alt="${song.album}">
        <div class="queue-item-info">
          <h4 class="queue-item-title">${song.title}</h4>
          <p class="queue-item-artist">${song.artist}</p>
        </div>
        <span class="queue-item-duration">${song.duration}</span>
      </div>
    `).join('');
    
    content.querySelectorAll('.queue-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        player.playFromQueue(index);
      });
    });
  }
  
  updateRecentContent() {
    const content = document.getElementById('recent-list-popup');
    if (!content) return;
    
    const recent = player.recentlyPlayed || [];
    
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
        <img class="recent-item-cover" src="${helpers.getAlbumImageUrl(song.album) || ''}" alt="${song.album}">
        <div class="recent-item-info">
          <h4 class="recent-item-title">${song.title}</h4>
          <p class="recent-item-artist">${song.artist}</p>
        </div>
        <span class="recent-item-duration">${song.duration}</span>
      </div>
    `).join('');
    
    content.querySelectorAll('.recent-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        player.playFromRecent(index);
      });
    });
  }
  
  startInactivityTimer() {
    this.resetInactivityTimer();
  }
  
  resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    
    if (this.activeTab !== 'nowPlaying') {
      this.inactivityTimer = setTimeout(() => {
        this.returnToNowPlaying();
      }, 10000); // 10 seconds
    }
  }
  
  returnToNowPlaying() {
    if (this.activeTab !== 'nowPlaying') {
      this.switchTab('nowPlaying');
      
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
    this.resetInactivityTimer();
    
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const hasQueue = (player.queue || []).length > 0;
    const hasRecent = (player.recentlyPlayed || []).length > 0;
    
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
  
  refresh() {
    this.updateTabContent(this.activeTab);
  }
}

function initializeApp() {
  try {
    initializeMusicLibrary();
    
    ui.initializeElements();
    navbar.initializeElements();
    
    ui.bindEvents();
    navbar.bindEvents();
    
    player.initializeAudio();
    
    pageManager.loadHomePage();
    helpers.initializeTheme();
    helpers.createPopoverPortal();
    
    const nowPlayingArea = document.getElementById("now-playing-area");
    if (nowPlayingArea) {
      nowPlayingArea.classList.remove("has-song");
    }
    
    navbar.updateDropdownCounts();
    helpers.syncGlobalState();
    
    window.enhancedNowPlayingController = new EnhancedNowPlayingController();
    
    console.log("Enhanced Music Player initialized successfully");
  } catch (error) {
    console.error("Enhanced initialization failed:", error);
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);




function addNavigationToMenu() {
  const dropdownMenu = document.querySelector('#dropdown-menu');
  if (!dropdownMenu) return;
  
  const navigationSection = document.createElement('div');
  navigationSection.className = 'dropdown-section';
  navigationSection.innerHTML = `
    <h3 class="section-title">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
      </svg>
      Navigation
    </h3>
    <div class="dropdown-item" data-nav="home">
      <div class="dropdown-item-icon">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      </div>
      <div class="dropdown-item-content">
        <p class="dropdown-item-title">Home</p>
        <p class="dropdown-item-subtitle">Featured music and new releases</p>
      </div>
    </div>
    <div class="dropdown-item" data-nav="allArtists">
      <div class="dropdown-item-icon">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      </div>
      <div class="dropdown-item-content">
        <p class="dropdown-item-title">All Artists</p>
        <p class="dropdown-item-subtitle">Browse all artists in the library</p>
      </div>
    </div>
  `;
  
  // Add search option
  navigationSection.innerHTML += `
    <div class="dropdown-item" id="global-search-trigger">
      <div class="dropdown-item-icon">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="dropdown-item-content">
        <p class="dropdown-item-title">Search</p>
        <p class="dropdown-item-subtitle">Find artists, albums, and songs</p>
      </div>
    </div>
  `;
  
  // Insert after first section
  const firstSection = dropdownMenu.querySelector('.dropdown-section');
  if (firstSection) {
    firstSection.after(navigationSection);
  } else {
    dropdownMenu.appendChild(navigationSection);
  }
  
  // Add global search functionality
  const searchTrigger = document.getElementById('global-search-trigger');
  if (searchTrigger) {
    searchTrigger.addEventListener('click', () => {
      navbar.closeDropdownMenu();
      
      // Show search dialog
      const searchDialog = document.createElement('div');
      searchDialog.className = 'search-dialog fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[999] flex items-center justify-center p-4';
      searchDialog.innerHTML = `
        <div class="search-dialog-content w-full max-w-lg bg-bg-default border border-border-default rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold">Search</h2>
            <button class="close-search-dialog p-2 hover:bg-bg-subtle rounded-full">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <form id="global-search-form">
            <div class="relative">
              <input type="text" id="global-search-input" 
                     class="w-full bg-bg-subtle border border-border-subtle rounded-lg py-3 px-4 pl-10 text-fg-default focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-colors"
                     placeholder="Search for artists, albums, or songs..." autofocus>
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-fg-muted" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="mt-4 flex justify-end">
              <button type="submit" class="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition">
                Search
              </button>
            </div>
          </form>
        </div>
      `;
      
      document.body.appendChild(searchDialog);
      document.getElementById('global-search-input').focus();
      
      // Close dialog when clicking outside
      searchDialog.addEventListener('click', (e) => {
        if (e.target === searchDialog) {
          document.body.removeChild(searchDialog);
        }
      });
      
      // Close button
      const closeBtn = searchDialog.querySelector('.close-search-dialog');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          document.body.removeChild(searchDialog);
        });
      }
      
      // Handle search form submission
      const searchForm = document.getElementById('global-search-form');
      if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const searchInput = document.getElementById('global-search-input');
          if (searchInput && searchInput.value.trim()) {
            window.siteMap.navigateTo('search', { query: searchInput.value.trim() });
            document.body.removeChild(searchDialog);
          }
        });
      }
    });
  }
}



// SiteMap class - handles navigation and URL mapping
class SiteMap {
  constructor() {
    this.routes = {
      home: {
        pattern: /^\/$/,
        handler: () => pageManager.loadHomePage()
      },
      artist: {
        pattern: /^\/artist\/(.+)$/,
        handler: (params) => {
          const artistName = params.artist || this.getParameterByName('artist', window.location.href);
          const artistData = window.music?.find(a => a.artist === artistName);
          if (artistData) {
            pageManager.loadArtistPage(artistData);
          } else {
            ui.showNotification(`Artist "${artistName}" not found`, 'error');
            this.navigateTo('home');
          }
        }
      },
      allArtists: {
        pattern: /^\/artists$/,
        handler: () => pageManager.loadAllArtistsPage()
      },
      album: {
        pattern: /^\/artist\/(.+)\/album\/(.+)$/,
        handler: (params) => {
          const artistName = params.artist || this.getParameterByName('artist', window.location.href);
          const albumName = params.album || this.getParameterByName('album', window.location.href);
          
          const artistData = window.music?.find(a => a.artist === artistName);
          if (artistData) {
            const albumData = artistData.albums.find(a => a.album === albumName);
            if (albumData) {
              pageManager.loadAlbumPage(artistData, albumData);
            } else {
              ui.showNotification(`Album "${albumName}" not found`, 'error');
              this.navigateTo('artist', { artist: artistName });
            }
          } else {
            ui.showNotification(`Artist "${artistName}" not found`, 'error');
            this.navigateTo('home');
          }
        }
      },
      search: {
        pattern: /^\/search\?q=(.+)$/,
        handler: (params) => {
          const query = params.query || this.getParameterByName('q', window.location.href);
          if (query) {
            pageManager.loadSearchPage(query);
          } else {
            ui.showNotification('Please enter a search query', 'error');
            this.navigateTo('home');
          }
        }
      }
    };
    
    // Handle initial route based on URL
    this.handleInitialRoute();
    
    // Listen for popstate events (back/forward browser navigation)
    window.addEventListener('popstate', (event) => {
      this.handleRoute(window.location.pathname + window.location.search);
    });
    
    // Bind click events for navigation
    this.bindNavigationEvents();
  }
  
  handleInitialRoute() {
    const path = window.location.pathname + window.location.search;
    this.handleRoute(path);
  }
  
  handleRoute(path) {
    let matchedRoute = false;
    
    for (const key in this.routes) {
      const route = this.routes[key];
      const match = path.match(route.pattern);
      
      if (match) {
        // Extract parameters from the route
        const params = {};
        
        if (key === 'search') {
          params.query = this.getParameterByName('q', window.location.href);
        } else if (key === 'artist') {
          params.artist = decodeURIComponent(match[1]);
        } else if (key === 'album') {
          params.artist = decodeURIComponent(match[1]);
          params.album = decodeURIComponent(match[2]);
        }
        
        // Call the route handler
        route.handler(params);
        matchedRoute = true;
        break;
      }
    }
    
    // If no route matched, go to home page
    if (!matchedRoute) {
      pageManager.loadHomePage();
    }
  }
  
  navigateTo(routeName, params = {}) {
    let url;
    
    switch (routeName) {
      case 'home':
        url = '/';
        break;
      case 'artist':
        url = `/artist/${encodeURIComponent(params.artist)}`;
        break;
      case 'allArtists':
        url = '/artists';
        break;
      case 'album':
        url = `/artist/${encodeURIComponent(params.artist)}/album/${encodeURIComponent(params.album)}`;
        break;
      case 'search':
        url = `/search?q=${encodeURIComponent(params.query)}`;
        break;
      default:
        url = '/';
    }
    
    // Update browser history
    window.history.pushState({}, '', url);
    
    // Call the route handler
    if (this.routes[routeName]) {
      this.routes[routeName].handler(params);
    }
  }
  
  getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
  
  bindNavigationEvents() {
    // Bind click events for navigation items with data-nav attribute
    document.addEventListener('click', (e) => {
      const navItem = e.target.closest('[data-nav]');
      if (!navItem) return;
      
      e.preventDefault();
      const navType = navItem.dataset.nav;
      const params = {};
      
      if (navType === 'artist') {
        params.artist = navItem.dataset.artist;
        this.navigateTo('artist', params);
      } else if (navType === 'allArtists') {
        this.navigateTo('allArtists');
      } else if (navType === 'album') {
        params.artist = navItem.dataset.artist;
        params.album = navItem.dataset.album;
        this.navigateTo('album', params);
      } else if (navType === 'home') {
        this.navigateTo('home');
      }
    });
    
    // Handle search form submissions
    document.addEventListener('click', (e) => {
      if (e.target.id === 'global-search-trigger') {
        this.openSearchDialog();
      }
    });
  }
  
  openSearchDialog() {
    // Create search dialog if it doesn't exist
    if (!document.getElementById('search-dialog')) {
      const searchDialog = document.createElement('div');
      searchDialog.id = 'search-dialog';
      searchDialog.className = 'fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] search-dialog';
      searchDialog.style.backgroundColor = 'rgba(0,0,0,0.7)';
      searchDialog.style.backdropFilter = 'blur(4px)';
      
      searchDialog.innerHTML = `
        <div class="search-dialog-content bg-bg-default border border-border-default rounded-xl w-full max-w-2xl shadow-xl overflow-hidden">
          <form id="global-search-form" class="relative">
            <input type="text" id="global-search-input" placeholder="Search for artists, albums, or songs..." 
                   class="w-full py-4 px-5 text-lg text-fg-default bg-bg-subtle border-none focus:outline-none focus:ring-0">
            <button type="submit" class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-accent-primary hover:bg-accent-secondary text-white p-2 rounded-md">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </form>
          
          <div class="recent-searches px-5 py-4 border-t border-border-muted">
            <h3 class="text-sm font-medium text-fg-muted mb-2">Recent Searches</h3>
            <div id="recent-searches-list" class="space-y-2">
              <p class="text-sm text-fg-subtle">No recent searches</p>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(searchDialog);
      
      // Close dialog when clicking outside
      searchDialog.addEventListener('click', (e) => {
        if (e.target === searchDialog) {
          this.closeSearchDialog();
        }
      });
      
      // Handle search form submission
      const searchForm = document.getElementById('global-search-form');
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const query = document.getElementById('global-search-input').value.trim();
        if (query) {
          this.closeSearchDialog();
          this.navigateTo('search', { query });
          
          // Save to recent searches
          this.addRecentSearch(query);
        }
      });
      
      // Handle escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !document.getElementById('search-dialog').classList.contains('hidden')) {
          this.closeSearchDialog();
        }
      });
      
      // Load recent searches
      this.updateRecentSearchesList();
    }
    
    // Show the dialog
    document.getElementById('search-dialog').classList.remove('hidden');
    document.getElementById('global-search-input').focus();
    
    // Disable scrolling on body
    document.body.style.overflow = 'hidden';
  }
  
  closeSearchDialog() {
    const dialog = document.getElementById('search-dialog');
    if (dialog) {
      dialog.classList.add('hidden');
    }
    
    // Re-enable scrolling on body
    document.body.style.overflow = '';
  }
  
  addRecentSearch(query) {
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    
    // Remove if already exists (to avoid duplicates)
    recentSearches = recentSearches.filter(item => item !== query);
    
    // Add new search at the beginning
    recentSearches.unshift(query);
    
    // Keep only the last 5 searches
    recentSearches = recentSearches.slice(0, 5);
    
    // Save back to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    
    // Update UI
    this.updateRecentSearchesList();
  }
  
  updateRecentSearchesList() {
    const list = document.getElementById('recent-searches-list');
    if (!list) return;
    
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    
    if (recentSearches.length === 0) {
      list.innerHTML = `<p class="text-sm text-fg-subtle">No recent searches</p>`;
      return;
    }
    
    list.innerHTML = recentSearches.map(query => `
      <div class="recent-search-item flex justify-between items-center group">
        <button class="recent-search-btn text-sm py-1 text-fg-default hover:text-accent-primary flex-grow text-left truncate" data-query="${query}">
          <span class="inline-block mr-2 opacity-60">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </span>
          ${query}
        </button>
        <button class="remove-search-btn p-1.5 opacity-0 group-hover:opacity-100 transition-opacity" data-query="${query}">
          <svg class="w-3.5 h-3.5 text-fg-muted hover:text-fg-default" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `).join('');
    
    // Bind click events for recent search items
    list.querySelectorAll('.recent-search-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        this.closeSearchDialog();
        this.navigateTo('search', { query });
      });
    });
    
    // Bind click events for remove buttons
    list.querySelectorAll('.remove-search-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const query = btn.dataset.query;
        
        // Remove from localStorage
        let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        recentSearches = recentSearches.filter(item => item !== query);
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        
        // Update UI
        this.updateRecentSearchesList();
      });
    });
  }
}

// Initialize SiteMap
document.addEventListener('DOMContentLoaded', () => {
  window.siteMap = new SiteMap();
  
  addNavigationToMenu();
});
