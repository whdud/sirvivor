# DRONE WAR - Production Build Guide

## File Structure

- **index.html** - Development version (162KB) with full comments and formatting
- **index.min.html** - Production version (91KB) - 44% smaller, optimized for deployment
- **minify.js** - Build script for creating minified version

## Production Features Added

### 1. SEO & Social Media Optimization
- Comprehensive meta tags for search engines
- Open Graph tags for Facebook sharing
- Twitter Card tags for social media
- Mobile web app meta tags (PWA-ready)
- Korean locale optimization

### 2. Mobile Experience Enhancements
- **Haptic Feedback** (Vibration API)
  - Light vibration (50ms) when player takes damage
  - Double pulse (100-50-100ms) on level up
  - Triple pulse (200-100-200-100-200ms) on boss kill
  - Works on all modern mobile browsers

### 3. Sound Effects (Web Audio API)
- **hit** - Square wave impact sound when player damaged
- **shoot** - Sine wave pew sound for projectiles (30% trigger rate)
- **levelup** - Ascending C-E-G major chord
- **bossdeath** - Dramatic sawtooth descending tone (0.5s)
- **explosion** - White noise burst for enemy deaths (20% trigger rate)
- All SFX respect master volume and SFX volume settings
- Zero file size overhead (procedurally generated)

### 4. Performance Optimizations
- Spatial hash grid collision detection (150px cells)
- Object pooling for projectiles (100 pre-allocated objects)
- FPS counter for monitoring (toggle with 'F' key)
- Asset preloader with progress bar
- Global error handlers for stability

## Building for Production

### Create Minified Version
```bash
node minify.js
```

This will:
- Remove all comments
- Strip whitespace
- Compress code
- Output to `index.min.html`

### Deployment Checklist

1. **Update og:url meta tag** in index.min.html with your actual deployment URL
2. **Test on mobile devices** - verify vibration and touch controls
3. **Test audio** - check SFX volume levels on different devices
4. **Verify assets** - ensure all files in `/assets/` folder are included:
   - `/assets/bgm/` - 3 BGM files
   - `/assets/fonts/` - DungGeunMo font files
   - All sprite PNG files (backgrounds, enemies, UI icons)
5. **Check CORS** - if hosting assets on CDN, configure CORS headers
6. **Enable gzip** - configure server to gzip .html files (additional 70-80% compression)
7. **Add service worker** (optional) - for offline play capability

## File Size Comparison

| Version | Size | Use Case |
|---------|------|----------|
| index.html | 162KB | Development, debugging |
| index.min.html | 91KB | Production deployment |
| index.min.html.gz | ~15-20KB | With gzip enabled |

## Performance Targets

- **First Paint**: < 1 second
- **Assets Loaded**: < 3 seconds (22 assets)
- **60 FPS gameplay**: Maintained with 50+ enemies on screen
- **Mobile compatibility**: iOS 12+, Android 8+

## Notes

- All features work without external dependencies
- Single-file architecture (except assets)
- No build tools required to run development version
- Compatible with all modern browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
