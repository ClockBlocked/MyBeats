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
  
  togglePlayPause: function() {
    if (!this.currentSong || !this.audioElement) return;
    
    if (this.isPlaying) {
      this.audioElement.pause();
    } else {
      this.audioElement.play();
    }
  }
};



const navbar = {
