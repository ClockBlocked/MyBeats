import { music } from '../library.js';
import './core.js'; // This will import core.js which imports navBar.js

document.addEventListener('DOMContentLoaded', () => {
    // Set up the music library
    if (!window.music) {
        window.music = music;
    }
    
    // Initialize the enhanced app with navbar module
    if (typeof window.initializeEnhancedApp === 'function') {
        window.initializeEnhancedApp();
        console.log('✅ Enhanced Music Player with Navbar Module loaded successfully');
        console.log('📊 Music library loaded with', window.music?.length || 0, 'artists');
        console.log('🎛️ Navbar functions available:', Object.keys(window.navbarModule || {}));
    } else {
        // Fallback to original initialization if enhanced version isn't available
        console.warn('⚠️ Enhanced initialization not found, using fallback');
        if (typeof window.initializeApp === 'function') {
            window.initializeApp();
        } else {
            console.error('❌ No initialization function found');
        }
    }
    
    // Log available keyboard shortcuts
    console.log('⌨️ Keyboard shortcuts:');
    console.log('  Space: Play/Pause');
    console.log('  Ctrl/Cmd + ←/→: Previous/Next');
    console.log('  Ctrl/Cmd + N: Open Now Playing');
    console.log('  Ctrl/Cmd + M: Toggle Menu');
    console.log('  Ctrl/Cmd + S: Toggle Shuffle');
    console.log('  Ctrl/Cmd + F: Toggle Favorite');
    console.log('  Ctrl/Cmd + R: Toggle Repeat');
    console.log('  Escape: Close popups');
});
