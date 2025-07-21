const templates = {
  // Enhanced artist template with carousel and album selector
  enhancedArtist: (data) => `
    <div class="p-8">
      <div class="artist-header flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 mb-12">
        <div class="artist-avatar relative group w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 shadow-lg">
          <img src="${data.cover}" alt="${data.artist}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
          <div class="play-overlay absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button class="play-artist hs-tooltip-toggle inline-flex justify-center items-center size-12 rounded-full bg-white/20 backdrop-blur-sm">
              <svg class="flex-shrink-0 size-5 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span class="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded shadow-sm" role="tooltip">Play artist</span>
            </button>
          </div>
        </div>
        <div class="artist-info flex-1">
          <h1 class="artist-name text-4xl font-bold mb-4 gradient-text">${data.artist}</h1>
          <div class="artist-meta flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            <span class="artist-genre inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-gray-800 text-white">${data.genre}</span>
            <span class="album-count text-sm opacity-70">${data.albumCount} Albums</span>
            <span class="song-count text-sm opacity-70">${data.songCount} Songs</span>
          </div>
          <div class="artist-actions flex flex-wrap gap-2">
            <button class="play-all-btn inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 transition-colors">
              <svg class="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Play All
            </button>
            <button class="follow-btn inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-gray-600 bg-transparent text-white hover:bg-gray-700 px-6 py-3 transition-colors">
              <svg class="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
              Follow
            </button>
          </div>
        </div>
      </div>
      <div class="similar-artists-section mb-12">
        <h3 class="section-title text-lg font-semibold mb-4">Fans Also Like</h3>
        <div class="similar-artists-carousel-wrapper" id="similar-artists-container"></div>
      </div>
      <div class="discography-section">
        <h3 class="section-title text-lg font-semibold mb-6">Discography</h3>
        <div class="albums-selector-wrapper" id="albums-container"></div>
      </div>
    </div>
  `,

  // Single album card template for the new album selector
  singleAlbumCard: (data) => `
<div class="album-card group flex flex-col h-full border border-transparent rounded-xl hover:border-gray-600 transition-all" data-album="${data.album}">
  <div class="album-cover-container relative pt-[60%] rounded-t-xl overflow-hidden">
    <img class="album-cover size-full absolute top-0 start-0 object-cover group-hover:scale-105 transition-transform duration-300" src="${data.cover}" alt="${data.album}">
    
    <!-- Combined overlay for both play button and album info -->
    <div class="album-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
      <!-- Play button at the top -->
      <div class="play-overlay absolute top-0 left-0 right-0 h-1/3 flex items-center justify-center">
        <button class="play-album inline-flex items-center justify-center size-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all">
          <svg class="flex-shrink-0 size-5 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
      </div>
      
      <!-- Album info at the bottom -->
      <div class="album-info text-white">
        <h3 class="album-name text-2xl font-bold mb-2">${data.album}</h3>
        <p class="album-meta text-sm text-gray-300 mb-4">${data.year ? `${data.year} • ` : ''}${data.songCount} song${data.songCount !== 1 ? 's' : ''}</p>
        <button class="play-album-full inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-green-600 text-white hover:bg-green-700 px-4 py-2 transition-colors">
          <svg class="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          Play Album
        </button>
      </div>
    </div>
  </div>
  
  <!-- Songs container below the cover -->
  <div class="songs-container p-6 space-y-1" id="songs-container-${data.albumId}"></div>
</div>
  `,

  // Keep the original artist template for backward compatibility
  artist: (data) => `
    <div class="p-8">
      <div class="artist-header flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 mb-12">
        <div class="artist-avatar relative group w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 shadow-lg">
          <img src="${data.cover}" alt="${data.artist}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
          <div class="play-overlay absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button class="play-artist hs-tooltip-toggle inline-flex justify-center items-center size-12 rounded-full bg-white/20 backdrop-blur-sm">
              <svg class="flex-shrink-0 size-5 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span class="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded shadow-sm" role="tooltip">Play artist</span>
            </button>
          </div>
        </div>
        <div class="artist-info flex-1">
          <h1 class="artist-name text-4xl font-bold mb-4 gradient-text">${data.artist}</h1>
          <div class="artist-meta flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            <span class="artist-genre inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-gray-800 text-white">${data.genre}</span>
            <span class="album-count text-sm opacity-70">${data.albumCount} Albums</span>
            <span class="song-count text-sm opacity-70">${data.songCount} Songs</span>
          </div>
          <div class="artist-actions flex flex-wrap gap-2">
            <button class="play-all-btn inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 transition-colors">
              <svg class="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Play All
            </button>
            <button class="follow-btn inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-gray-600 bg-transparent text-white hover:bg-gray-700 px-6 py-3 transition-colors">
              <svg class="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
              Follow
            </button>
          </div>
        </div>
      </div>
      <div class="similar-artists-section mb-8">
        <h3 class="section-title text-lg font-semibold mb-4">Fans Also Like</h3>
        <div class="similar-artists-container flex flex-wrap gap-2" id="similar-artists-container"></div>
      </div>
      <div class="discography-section">
        <h3 class="section-title text-lg font-semibold mb-6">Discography</h3>
        <div class="albums-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="albums-container"></div>
      </div>
    </div>
  `,

  artistCard: (data) => `
    <div class="artist-card group flex flex-col h-full transition-all p-6 cursor-pointer" data-artist-id="${data.id}">
      <div class="artist-card-content text-center">
        <div class="artist-avatar-container w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <img src="${data.cover}" alt="${data.artist}" class="artist-avatar w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
        </div>
        <h3 class="artist-name text-lg font-bold mb-2">${data.artist}</h3>
        <div class="genre-tag inline-block mb-3">${data.genre}</div>
        <p class="album-count text-sm opacity-70">${data.albumCount} album${data.albumCount !== 1 ? 's' : ''}</p>
      </div>
    </div>
  `,

  albumCard: (data) => `
    <div class="album-card group flex flex-col h-full border border-transparent rounded-xl hover:border-gray-600 transition-all" data-album="${data.album}">
      <div class="album-cover-container relative pt-[100%] rounded-t-xl overflow-hidden">
        <img class="album-cover size-full absolute top-0 start-0 object-cover group-hover:scale-105 transition-transform duration-300" src="${data.cover}" alt="${data.album}">
        <div class="play-overlay absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button class="play-album inline-flex items-center justify-center size-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all">
            <svg class="flex-shrink-0 size-4 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
        </div>
      </div>
      <div class="album-info p-4 md:p-5">
        <h3 class="album-name text-lg font-bold text-gray-200">${data.album}</h3>
        <p class="album-meta text-xs text-gray-400 mt-1">${data.year} • ${data.songCount} song${data.songCount !== 1 ? 's' : ''}</p>
        <div class="songs-container mt-4 space-y-1" id="songs-container-${data.albumId}"></div>
      </div>
    </div>
  `,

  songItem: (data) => {
    const songData = JSON.stringify(data.songData).replace(/"/g, '&quot;');
    return `
      <div class="song-item relative group/item flex items-center gap-x-3 p-2 rounded-lg hover:bg-gray-700/50 transition-all cursor-pointer" data-song='${songData}'>
        <div class="song-number-container flex items-center gap-x-3 flex-1 min-w-0">
          <span class="track-number text-sm text-gray-400 w-6 text-center group-hover/item:hidden">${data.trackNumber}</span>
          <div class="play-icon-container w-6 text-center hidden group-hover/item:block"><svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/></svg></div>
          <div class="song-info flex-1 min-w-0">
            <p class="song-title text-sm font-medium text-gray-200 truncate">${data.title}</p>
          </div>
        </div>
        <div class="song-controls flex items-center gap-x-3">
          <div class="song-toolbar opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center gap-x-1">
            <button class="favorite-btn size-7 inline-flex justify-center items-center rounded-full hover:bg-gray-600 text-gray-400 hover:text-white" title="Add to Favorites" data-action="favorite"><svg class="flex-shrink-0 size-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/></svg></button>
            <button class="queue-btn size-7 inline-flex justify-center items-center rounded-full hover:bg-gray-600 text-gray-400 hover:text-white" title="Add to Queue" data-action="add-queue"><svg class="flex-shrink-0 size-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17 3H3a1 1 0 00-1 1v12a1 1 0 102 0V5h12a1 1 0 100-2zM4 7a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1V8a1 1 0 00-1-1H4zm4 5a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg></button>
          </div>
          <p class="song-duration text-xs text-gray-400">${data.duration}</p>
        </div>
      </div>
    `;
  },

  queueItem: (data) => `
    <li class="queue-item flex items-center gap-x-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
      <img class="queue-item-cover flex-shrink-0 size-10 object-cover rounded" src="${data.cover}" alt="${data.title}">
      <div class="queue-item-info flex-1 min-w-0">
        <p class="queue-item-title text-sm font-medium text-gray-200 truncate">${data.title}</p>
        <p class="queue-item-artist text-xs text-gray-400 truncate">${data.artist}</p>
      </div>
      <span class="queue-item-duration text-xs text-gray-400">${data.duration}</span>
    </li>
  `,

  similarArtist: (data) => `
    <div class="similar-artist inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium border border-gray-700 bg-gray-800 text-white hover:bg-gray-700 cursor-pointer transition-colors">
      ${data.artist}
    </div>
  `
};

export function renderTemplate(templateName, data) {
  const template = templates[templateName];
  if (!template) {
    console.error(`Template ${templateName} not found`);
    return '';
  }
  return template(data);
}
