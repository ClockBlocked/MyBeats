import { music } from '../library.js';
import { queueItem, artistCard, enhancedArtist, singleAlbumCard, songItem, searchDialog, songElement } from './pageTemplates.js';

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
  repeatMode: "off",
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