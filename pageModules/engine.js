// Modern View Management System
class ViewManager {
  constructor() {
    this.views = new Map();
    this.activeView = null;
    this.viewHistory = [];
    this.transitionDuration = 300;
    this.container = null;
    this.isTransitioning = false;
    
    this.init();
  }
  
  init() {
    this.createDynamicContainer();
    this.setupDefaultViews();
    this.bindGlobalEvents();
  }
  
  createDynamicContainer() {
    // Remove old static containers
    const homePage = document.getElementById('home-page');
    const artistPage = document.getElementById('artist-page');
    
    if (homePage) homePage.remove();
    if (artistPage) artistPage.remove();
    
    // Create modern dynamic container
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div id="dynamic-container" class="view-manager">
          <div id="main-view" class="view-container active"></div>
          <div id="sidebar-view" class="view-container"></div>
          <div id="modal-view" class="view-container"></div>
          <div id="loading-overlay" class="loading-overlay">
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading...</div>
          </div>
        </div>
      `;
      
      this.container = document.getElementById('dynamic-container');
    }
  }
  
  setupDefaultViews() {
    // Register default views
    this.registerView('home', {
      component: HomeViewComponent,
      container: 'main-view',
      persistent: true,
      preload: true
    });
    
    this.registerView('artist', {
      component: ArtistViewComponent,
      container: 'main-view',
      persistent: false,
      preload: false
    });
    
    this.registerView('search', {
      component: SearchViewComponent,
      container: 'sidebar-view',
      persistent: false,
      preload: false
    });
    
    this.registerView('settings', {
      component: SettingsViewComponent,
      container: 'modal-view',
      persistent: false,
      preload: false
    });
    
    // Load home view by default
    this.navigateToView('home');
  }
  
  registerView(name, config) {
    this.views.set(name, {
      name,
      component: config.component,
      container: config.container || 'main-view',
      persistent: config.persistent || false,
      preload: config.preload || false,
      instance: null,
      loaded: false,
      data: null
    });
    
    if (config.preload) {
      this.preloadView(name);
    }
  }
  
  async navigateToView(viewName, data = {}, options = {}) {
    if (this.isTransitioning) {
      console.warn('View transition in progress, ignoring navigation request');
      return false;
    }
    
    const view = this.views.get(viewName);
    if (!view) {
      console.error(`View '${viewName}' not found`);
      return false;
    }
    
    this.isTransitioning = true;
    
    try {
      // Show loading if needed
      if (options.showLoading !== false) {
        this.showLoading();
      }
      
      // Add to history
      if (this.activeView && options.addToHistory !== false) {
        this.viewHistory.push({
          view: this.activeView,
          data: this.views.get(this.activeView)?.data || {}
        });
      }
      
      // Prepare new view
      await this.prepareView(viewName, data);
      
      // Transition
      await this.performTransition(viewName, options);
      
      // Update state
      this.activeView = viewName;
      this.views.get(viewName).data = data;
      
      // Hide loading
      this.hideLoading();
      
      // Trigger view activated event
      this.triggerViewEvent('activated', viewName, data);
      
      return true;
      
    } catch (error) {
      console.error('Navigation failed:', error);
      this.hideLoading();
      return false;
    } finally {
      this.isTransitioning = false;
    }
  }
  
  async prepareView(viewName, data) {
    const view = this.views.get(viewName);
    
    if (!view.loaded) {
      // Create view instance
      view.instance = new view.component(data);
      await view.instance.init(data);
      view.loaded = true;
    } else if (view.instance.refresh) {
      // Refresh existing view
      await view.instance.refresh(data);
    }
  }
  
  async performTransition(viewName, options) {
    const view = this.views.get(viewName);
    const targetContainer = document.getElementById(view.container);
    
    if (!targetContainer) {
      throw new Error(`Container '${view.container}' not found`);
    }
    
    // Get transition type
    const transition = options.transition || 'fade';
    
    // Hide current view
    if (this.activeView) {
      const currentView = this.views.get(this.activeView);
      const currentContainer = document.getElementById(currentView.container);
      
      if (currentContainer && currentContainer !== targetContainer) {
        await this.animateOut(currentContainer, transition);
        currentContainer.classList.remove('active');
      }
    }
    
    // Show new view
    targetContainer.innerHTML = '';
    targetContainer.appendChild(view.instance.element);
    targetContainer.classList.add('active');
    
    await this.animateIn(targetContainer, transition);
  }
  
  async animateOut(element, transition) {
    return new Promise(resolve => {
      element.style.transition = `all ${this.transitionDuration}ms ease-out`;
      
      switch (transition) {
        case 'slide-left':
          element.style.transform = 'translateX(-100%)';
          break;
        case 'slide-right':
          element.style.transform = 'translateX(100%)';
          break;
        case 'slide-up':
          element.style.transform = 'translateY(-100%)';
          break;
        case 'slide-down':
          element.style.transform = 'translateY(100%)';
          break;
        case 'scale':
          element.style.transform = 'scale(0.8)';
          element.style.opacity = '0';
          break;
        default: // fade
          element.style.opacity = '0';
      }
      
      setTimeout(resolve, this.transitionDuration);
    });
  }
  
  async animateIn(element, transition) {
    return new Promise(resolve => {
      // Set initial state
      switch (transition) {
        case 'slide-left':
          element.style.transform = 'translateX(100%)';
          break;
        case 'slide-right':
          element.style.transform = 'translateX(-100%)';
          break;
        case 'slide-up':
          element.style.transform = 'translateY(100%)';
          break;
        case 'slide-down':
          element.style.transform = 'translateY(-100%)';
          break;
        case 'scale':
          element.style.transform = 'scale(0.8)';
          element.style.opacity = '0';
          break;
        default: // fade
          element.style.opacity = '0';
      }
      
      // Trigger animation
      requestAnimationFrame(() => {
        element.style.transition = `all ${this.transitionDuration}ms ease-out`;
        element.style.transform = 'translateX(0) translateY(0) scale(1)';
        element.style.opacity = '1';
        
        setTimeout(resolve, this.transitionDuration);
      });
    });
  }
  
  goBack() {
    if (this.viewHistory.length === 0) return false;
    
    const previousState = this.viewHistory.pop();
    return this.navigateToView(previousState.view, previousState.data, {
      addToHistory: false,
      transition: 'slide-right'
    });
  }
  
  preloadView(viewName) {
    const view = this.views.get(viewName);
    if (view && !view.loaded) {
      setTimeout(() => {
        this.prepareView(viewName, {});
      }, 100);
    }
  }
  
  showLoading(text = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = overlay?.querySelector('.loading-text');
    
    if (overlay) {
      if (loadingText) loadingText.textContent = text;
      overlay.classList.add('show');
    }
  }
  
  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.remove('show');
    }
  }
  
  triggerViewEvent(eventType, viewName, data) {
    const event = new CustomEvent(`view-${eventType}`, {
      detail: { viewName, data }
    });
    document.dispatchEvent(event);
  }
  
  bindGlobalEvents() {
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state?.view) {
        this.navigateToView(e.state.view, e.state.data, {
          addToHistory: false
        });
      }
    });
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        this.goBack();
      }
    });
  }
  
  // Utility methods
  getCurrentView() {
    return this.activeView;
  }
  
  getViewInstance(viewName) {
    return this.views.get(viewName)?.instance;
  }
  
  refreshCurrentView(data = {}) {
    if (this.activeView) {
      const view = this.views.get(this.activeView);
      if (view?.instance?.refresh) {
        view.instance.refresh(data);
      }
    }
  }
}

// Base View Component Class
class BaseViewComponent {
  constructor(data = {}) {
    this.data = data;
    this.element = null;
    this.isInitialized = false;
  }
  
  async init(data = {}) {
    if (this.isInitialized) return;
    
    this.data = { ...this.data, ...data };
    this.element = this.createElement();
    await this.render();
    this.bindEvents();
    this.isInitialized = true;
  }
  
  createElement() {
    const div = document.createElement('div');
    div.className = this.getClassName();
    return div;
  }
  
  getClassName() {
    return 'view-component';
  }
  
  async render() {
    // Override in subclasses
    this.element.innerHTML = '<div>Base View Component</div>';
  }
  
  bindEvents() {
    // Override in subclasses
  }
  
  async refresh(data = {}) {
    this.data = { ...this.data, ...data };
    await this.render();
  }
  
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.isInitialized = false;
  }
}

// Home View Component
class HomeViewComponent extends BaseViewComponent {
  getClassName() {
    return 'home-view-component';
  }
  
  async render() {
    this.element.innerHTML = `
      <div class="home-content">
        <div class="hero-section">
          <h1 class="hero-title gradient-text">Discover Amazing Music</h1>
          <p class="hero-subtitle">Explore artists, albums, and songs from your personal library</p>
        </div>
        <div class="featured-section">
          <h2 class="section-title">Featured Artists</h2>
          <div id="featured-artists-grid" class="artists-grid"></div>
        </div>
      </div>
    `;
    
    await this.loadFeaturedArtists();
  }
  
  async loadFeaturedArtists() {
    const grid = this.element.querySelector('#featured-artists-grid');
    if (!grid || !window.music) return;
    
    // Show loading state
    grid.innerHTML = Array(4).fill(0).map(() => 
      '<div class="artist-card skeleton"></div>'
    ).join('');
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Render artists
    const shuffled = [...window.music].sort(() => 0.5 - Math.random());
    const featured = shuffled.slice(0, 4);
    
    grid.innerHTML = featured.map(artist => `
      <div class="artist-card" data-artist-id="${artist.id}">
        <div class="artist-avatar-container">
          <img src="${window.getArtistImageUrl?.(artist.artist) || ''}" 
               alt="${artist.artist}" 
               class="artist-avatar">
        </div>
        <h3 class="artist-name">${artist.artist}</h3>
        <div class="artist-genre">${artist.genre}</div>
        <p class="artist-albums">${artist.albums.length} album${artist.albums.length !== 1 ? 's' : ''}</p>
      </div>
    `).join('');
    
    this.bindArtistEvents();
  }
  
  bindArtistEvents() {
    this.element.querySelectorAll('.artist-card').forEach(card => {
      card.addEventListener('click', () => {
        const artistId = card.dataset.artistId;
        const artist = window.music?.find(a => a.id === artistId);
        if (artist && window.viewManager) {
          window.viewManager.navigateToView('artist', { artist });
        }
      });
    });
  }
}

// Artist View Component
class ArtistViewComponent extends BaseViewComponent {
  getClassName() {
    return 'artist-view-component';
  }
  
  async render() {
    const { artist } = this.data;
    if (!artist) {
      this.element.innerHTML = '<div class="error-state">Artist not found</div>';
      return;
    }
    
    this.element.innerHTML = `
      <div class="artist-content">
        <div class="artist-header">
          <button class="back-button" id="back-to-home">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
            </svg>
            Back to Home
          </button>
          <div class="artist-info">
            <div class="artist-avatar-large">
              <img src="${window.getArtistImageUrl?.(artist.artist) || ''}" 
                   alt="${artist.artist}" 
                   class="artist-avatar">
            </div>
            <div class="artist-details">
              <h1 class="artist-name gradient-text">${artist.artist}</h1>
              <div class="artist-meta">
                <span class="artist-genre">${artist.genre}</span>
                <span class="artist-stats">${artist.albums.length} Albums • ${this.getTotalSongs(artist)} Songs</span>
              </div>
              <div class="artist-actions">
                <button class="btn-primary play-all-btn">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
                  </svg>
                  Play All
                </button>
                <button class="btn-secondary follow-btn">Follow Artist</button>
              </div>
            </div>
          </div>
        </div>
        <div class="artist-body">
          <div class="albums-section">
            <h2 class="section-title">Albums</h2>
            <div id="albums-container" class="albums-container"></div>
          </div>
        </div>
      </div>
    `;
    
    this.renderAlbums();
  }
  
  renderAlbums() {
    const container = this.element.querySelector('#albums-container');
    const { artist } = this.data;
    
    if (!container || !artist?.albums) return;
    
    // Create album selector instance
    if (window.AlbumSelector) {
      this.albumSelector = new window.AlbumSelector(container, artist);
    }
  }
  
  bindEvents() {
    const backButton = this.element.querySelector('#back-to-home');
    if (backButton) {
      backButton.addEventListener('click', () => {
        if (window.viewManager) {
          window.viewManager.navigateToView('home', {}, {
            transition: 'slide-right'
          });
        }
      });
    }
    
    const playAllBtn = this.element.querySelector('.play-all-btn');
    if (playAllBtn) {
      playAllBtn.addEventListener('click', () => {
        this.playAllArtistSongs();
      });
    }
  }
  
  playAllArtistSongs() {
    const { artist } = this.data;
    if (!artist || !window.playSong) return;
    
    window.queue = [];
    artist.albums.forEach(album => {
      album.songs.forEach(song => {
        window.queue.push({
          ...song,
          artist: artist.artist,
          album: album.album,
          cover: window.getAlbumImageUrl?.(album.album)
        });
      });
    });
    
    if (window.queue.length > 0) {
      window.playSong(window.queue.shift());
      window.showNotification?.(`Playing all songs by ${artist.artist}`);
    }
  }
  
  getTotalSongs(artist) {
    return artist.albums.reduce((total, album) => total + album.songs.length, 0);
  }
}

// Initialize the modern view manager
window.viewManager = new ViewManager();
