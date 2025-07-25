const queueItem = (data) => `
<div class="queue-item flex items-center space-x-3 p-2 hover:bg-white hover:bg-opacity-10 rounded-lg cursor-pointer transition-colors">
  <img src="${data.cover}" alt="${data.title}" class="queue-item-cover w-10 h-10 rounded-md object-cover">
  <div class="flex-1 min-w-0">
    <p class="queue-item-title text-sm font-medium truncate">${data.title}</p>
    <p class="text-xs opacity-70 truncate">${data.artist}</p>
  </div>
  <span class="text-xs opacity-50">${data.duration}</span>
</div>
`;

const artistCard = (data) => `
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

const enhancedArtist = (data) => `
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

const singleAlbumCard = (data) => `
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

const songItem = (data) => `
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

const searchDialog = (data) => `
<div class="search-dialog fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
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
</div>
`;

const songElement = (data) => `
<div class="song-element p-3 rounded-lg border border-border-subtle hover:border-border-default transition-colors cursor-pointer" data-song-id="${data.id}">
  <div class="flex items-center gap-3">
    <img src="${data.cover}" alt="${data.album}" class="w-12 h-12 rounded-md object-cover">
    <div class="flex-1 min-w-0">
      <h4 class="font-medium text-fg-default truncate">${data.title}</h4>
      <p class="text-sm text-fg-muted truncate">${data.artist} • ${data.album}</p>
    </div>
    <span class="text-sm text-fg-subtle">${data.duration}</span>
  </div>
</div>
`;

export { 
  queueItem, 
  artistCard, 
  enhancedArtist, 
  singleAlbumCard, 
  songItem, 
  searchDialog, 
  songElement 
};