# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser-based drone combat survival game called "DRONE WARFARE" (드론 전쟁), written entirely in a single HTML file (`index.html`) using vanilla JavaScript and Canvas API. The game is a bullet hell / vampire survivors-style game where players control a drone that automatically attacks enemy drones while manually moving to survive. It features:
- **Story Mode**: 3 stages with progressive difficulty and boss battles
- **Endless Mode**: Infinite survival mode
- **6 unlockable playable drones** with different stats
- **Multiple weapon systems**: Projectiles, missiles, EMP waves, satellite strikes
- **Asset-based graphics**: Sprites for drones, enemies, backgrounds, and UI elements

## Architecture

### Single-File Structure
The entire game is contained in `index.html` with three main sections:
- **CSS** (~lines 7-1020): All styling including responsive design, animations, and themed UI
- **HTML** (~lines 1022-1177): UI overlays, menus, and game container
- **JavaScript** (~lines 1179-end): Complete game logic (~4000+ lines)

### Core Systems

**Game State Management** (~lines 1284-1500)
- `player` object: Position, stats (HP, XP, level), size, speed
- Multiple arrays for game entities: `enemies`, `projectiles`, `missiles`, `lightnings`, `enemyProjectiles`, `xpOrbs`, `goldOrbs`, `meleeWeapons`, `empWaves`
- Global state: `gameStarted`, `gameRunning`, `gameTime`, `kills`, `currentGold`, `totalGold`, `gameMode`, `selectedStage`, `bossSpawned`

**Game Modes and Stages** (~lines 1398-1461)
- **Story Mode**: 3 stages with unique backgrounds, enemy compositions, and boss battles at 3-minute mark
  - Stage 1: "기지 방어전" (Base Defense) - Basic enemies, progressive difficulty
  - Stage 2: "도시 전선" (City Front) - Introduces purple drones
  - Stage 3: "사막 작전" (Desert Operation) - All enemy types
- **Endless Mode**: Continuous survival with mixed enemy types
- Stage progression unlocks via completing previous stages

**Character/Drone System** (~lines 1346-1395)
- 6 playable drones with different stats (HP, speed, damage)
- Unlockable via in-game currency ("스크랩" / Scrap)
- Characters: 정찰기 (Scout), 공격기 (Fighter), 스텔스기 (Stealth), 미사일드론 (Missile), 중장갑기 (Tank), 특수작전기 (Special Ops)
- Selected character stats affect starting HP, movement speed, and base damage

**Weapon Systems**
- **Basic Projectile**: Auto-targeting bullets with spread pattern, upgradable (damage, speed, count, piercing)
- **Guided Missiles**: Homing projectiles with turn speed and trail effects
- **EMP Wave** (formerly melee): Circular shockwave that damages nearby enemies
- **Satellite Strike** (formerly lightning): Orbital bombardment from above

**Enemy Types** (sprite-based, stage-specific)
- **Stage-specific sprites**: Each stage has unique enemy visuals (Stage1/2/3Enemy1/2/3.png)
  - Enemy1: Basic melee drone (chase behavior)
  - Enemy2: Enhanced/purple drone (faster, higher HP)
  - Enemy3: Ranged drone (keeps distance, shoots projectiles)
- **Boss Drones**: Each stage has unique boss sprite (Stage1/2/3Boss.png)
  - Stage 1 Boss: 8-way radial bullet pattern
  - Stage 2 Boss: 12-way spiral pattern (rotating)
  - Stage 3 Boss: 16-way + targeted mixed pattern
- **Endless Mode**: Cycles through stage enemies every 5 minutes, bosses at 5/10/15min

**Progression System**
- Level-up triggers pause and shows 3 random upgrades
- Rarity system: Common, Uncommon, Rare, Epic, Legend (affects stat multipliers)
- 14+ upgrade types: weapon enhancements, stat boosts, new weapon unlocks
- XP orbs (Gear.png sprites) drop from enemies and auto-collect based on magnet range
- Gold/"Scrap" currency for character unlocks
- **XP Scaling**: 1.2x multiplier per level (reduced from 1.5x for faster progression)

**Input Handling**
- Keyboard: WASD or arrow keys for movement (~lines 1570-1582)
- Touch: Direct touch/drag movement for mobile (~lines 1508-1538)
- Mobile detection and scaling adjustments (~lines 1287-1289)
- Cheat key: '1' skips to 4:59 in story mode (for testing boss spawns) (~line 1574)

## Development Workflow

### Running the Game
Simply open `index.html` in any modern web browser. No build step or dependencies required.

**Required Assets Structure:**
```
/assets/
  /bgm/              - Background music files
    MainBgm.mp3      - Main menu music
    Stage1Bgm.mp3    - Stage 1 music
    Stage2Bgm.mp3    - Stage 2 music
    Stage3Bgm.mp3    - Stage 3 music
  /fonts/            - Custom fonts (DungGeunMo)
  drone_spritesheet.png    - Player drone sprites (4-frame animation, 64x64 each)

  # Enemy sprites (stage-specific)
  Stage1Enemy1.png   - Stage 1 basic melee enemy
  Stage1Enemy2.png   - Stage 1 enhanced enemy
  Stage1Enemy3.png   - Stage 1 ranged enemy
  Stage2Enemy1.png   - Stage 2 basic melee enemy
  Stage2Enemy2.png   - Stage 2 enhanced enemy
  Stage2Enemy3.png   - Stage 2 ranged enemy
  Stage3Enemy1.png   - Stage 3 basic melee enemy
  Stage3Enemy2.png   - Stage 3 enhanced enemy
  Stage3Enemy3.png   - Stage 3 ranged enemy

  # Boss sprites
  Stage1Boss.png     - Stage 1 boss sprite
  Stage2Boss.png     - Stage 2 boss sprite
  Stage3Boss.png     - Stage 3 boss sprite

  # Backgrounds
  Stage1Background.png - Stage 1 background (scrolling)
  Stage2Background.png - Stage 2 background
  Stage3Backfround.png - Stage 3 background (note: typo in filename)
  menu_bg.png        - Main menu background

  # Projectiles and UI
  Gear.png           - XP orb icon
  Bullet.png         - Projectile sprite
  guidedMissile.png  - Guided missile sprite
  EnemyBall.png      - Enemy projectile sprite
  ClockIcon.png      - Time display icon
  HomeIcon.png       - Home button icon
```

### Testing
- **Desktop**: Use WASD or arrow keys to move
- **Mobile**: Use touch controls; sizes are automatically scaled up (1.2x enemies, 2.25x player)
- Test different screen sizes using browser dev tools
- Use cheat key '1' during gameplay to skip to 4:59 for boss testing

### Key Functions and Systems to Modify

**Stage Configuration**: `stages` array (~line 1404)
- Modify `spawnRate`, `enemyTypes` ratios, `bossTime` (ms)
- Add new stages by extending the array
- Control stage unlock progression

**Balancing enemy difficulty**: Search for `spawnEnemy()` function
- Adjust spawn rate based on game time and mode
- Modify enemy HP/speed/damage multipliers
- Change enemy type probabilities

**Modifying upgrades**: Search for `showUpgradeOptions()` function
- Upgrade definitions in `upgrades` array
- Rarity probabilities in `rarityRoll()` function
- Multipliers in `rarityMultiplier` object
- Add new upgrade types by extending the upgrades array

**Adjusting drone stats**: `characters` array (~line 1346)
- Modify base stats: `hp`, `speed`, `damage`
- Change unlock prices
- Add new drones by extending the array

**Game loop**: Search for `gameLoop()` function
- Calls `update()` for game logic
- Calls `draw()` for rendering
- Uses `gameLoopId` to prevent duplicate loops

**Audio System**: (~lines 1750-1900)
- `masterVolume`, `musicVolume`, `sfxVolume` control audio levels
- `playBgm()` handles BGM transitions between menus/stages
- BGM files: mainBgm, stage1Bgm, stage2Bgm, stage3Bgm
- **SFX System** (Web Audio API, procedurally generated):
  - `playSFX('hit')` - Square wave impact sound (player damage)
  - `playSFX('shoot')` - Sine wave projectile sound (30% trigger rate)
  - `playSFX('levelup')` - C-E-G ascending chord
  - `playSFX('bossdeath')` - Sawtooth descending tone (0.5s)
  - `playSFX('explosion')` - White noise burst (enemy death, 20% rate)
  - All SFX respect master and SFX volume settings
  - Zero file size overhead (no audio files needed)

## Language and Localization

The game UI is currently in Korean (ko):
- Game title: "DRONE WAR" / "드론 전쟁"
- UI text: "게임 시작" (Start Game), "레벨 업" (Level Up), "모드 선택" (Mode Select)
- Stats: "격추" (Kills), "시간" (Time), "스크랩" (Scrap/Gold)
- Game modes: "스토리 모드" (Story Mode), "무한 모드" (Endless Mode)
- Character/Drone names in Korean (정찰기, 공격기, 스텔스기, etc.)
- Stage names in Korean (기지 방어전, 도시 전선, 사막 작전)

To localize, search and replace UI strings in:
- Menu titles and buttons in HTML section (~lines 1061-1094)
- Shop and settings screen content (~lines 1122-1162)
- Stage and mode descriptions in `stages` array (~line 1404)
- Character names in `characters` array (~line 1346)
- Upgrade names and descriptions in `upgrades` array (search for "upgrades")

## Mobile Optimization

Mobile-specific adjustments:
- Device detection: `/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)` (~line 1287)
- Size scaling: `sizeScale = 1.2`, `playerSizeScale = 2.25` for mobile (increases visibility) (~line 1288-1289)
- Touch event handlers prevent default browser behavior with `{ passive: false }` (~lines 1566-1568)
- Direct touch-drag movement system (~lines 1508-1538)
- **Haptic Feedback** via `navigator.vibrate()`:
  - 50ms pulse on player damage (enemy collision or projectile hit)
  - [100, 50, 100]ms double pulse on level up
  - [200, 100, 200, 100, 200]ms triple pulse on boss kill
- Responsive CSS breakpoints for small screens (~line 508)
- Time UI repositioned on mobile devices

## Canvas Rendering

Canvas uses device pixel ratio for sharp rendering on high-DPI displays:
- `resizeCanvas()` function (~line 1269) handles DPR scaling
- Canvas dimensions set to `window.innerWidth/Height * dpr`
- Context scaled by `dpr` to maintain logical coordinate system
- Resizes dynamically on window resize event
- Fullscreen container with no borders (`width: 100vw; height: 100vh`)

**Sprite Rendering**:
- Player drone: 4-frame spritesheet animation at 30 FPS (64x64 frames)
- Enemies: Static sprites scaled by `sizeScale`
- Background: Scrolling vertical parallax effect using `backgroundY1` and `backgroundY2`
- All sprites loaded via `Image()` objects with `onload`/`onerror` handlers

## Important Technical Details

**Game Loop Management**:
- Uses `gameLoopId` counter to prevent multiple simultaneous game loops
- Each new game increments `gameLoopId` and checks it in the loop
- Previous loops automatically stop when ID doesn't match

**State Persistence**:
- `totalGold` and character unlock states persist (likely localStorage, check implementation)
- Best records (`bestTime`, `bestKills`) tracked per session
- Stage unlocks persist across game sessions

**Performance Optimizations**:
- **Spatial Hash Grid** (~lines 1587-1630): Cell-based collision detection (150px cells) reduces O(n²) to O(n)
- **Object Pooling** (~lines 1632-1685): Pre-allocated projectile pool (100 objects) reduces GC pressure
- **Asset Preloader** (~lines 3843-3906): Progressive loading with visual feedback (22 assets)
- **FPS Counter** (toggle with 'F' key): Performance monitoring tool for development
- **Loading Screen**: Menu background with progress bar during asset loading
- Single HTML file = no bundler, but ~4000+ lines of JavaScript
- All assets loaded as external files
- Canvas rendering with sprite-based graphics
- Entity arrays (enemies, projectiles) managed with pooling for better performance

## Toss Apps-in-Toss Integration

This game is designed for the **Toss Game Competition** and integrates with Toss's Apps-in-Toss platform.

### Configuration Files
- **granite.config.ts** - Toss Apps-in-Toss framework configuration
  - App name: `dronewar`, display name: `드론 워`
  - Primary color: `#FF4444`
  - Bridge view settings: `inverted` color mode
  - Web server configuration
    - Host: `14.33.15.42` (update when IP changes)
    - Port: `3000`
  - App icon: `assets/app-icon.png` (718KB PNG)
  - Build output: `./dist` directory

- **toss-integration.js** - Toss SDK integration module
  - Game Center leaderboard integration
  - User authentication and user key management
  - Rewarded ads (AdMob)
  - Friend invitation system
  - Audio control for ads (pause/resume)

### Key Integrations

**Game Center Leaderboard** (toss-integration.js:205-238, index.html:8769-8789)
- `openGameCenterLeaderboard()` - Opens leaderboard (requires Toss v5.221.0+)
- Returns `{ success: true/false, reason: '...' }` object
- Handles version check and SDK availability
- `submitGameCenterLeaderBoardScore({ score: 'string' })` - Submits score

**Background Audio Management** (index.html:8012-8034)
- Page Visibility API integration (already implemented)
- Auto-pauses game and BGM when app goes to background
- Auto-resumes game and BGM when app returns to foreground
- Integrated with game state management (`gameRunning`)
- Respects Toss guidelines for audio in ads
- Additional `pauseAllAudio()` / `resumeAllAudio()` functions for ad integration (line 3444-3463)

**User Key System** (toss-integration.js:14-69)
- `getUserKeyForGame()` - Gets hashed user key for game features
- Fallback to localStorage test key for local development
- Required for leaderboard and game progress tracking

### Toss Submission Requirements (2025-11-14 Update)
All competition feedback items fully resolved:
1. ✅ **Leaderboard fixed** - Returns proper result object, no false error alerts
   - Fixed return value handling (`Promise<void>` to `{ success, reason }`)
   - Line references: toss-integration.js:206-238, index.html:8979-9011
   - Now displays Toss-style modal instead of system alert
2. ✅ **Background audio control** - Game and BGM auto-pause on background
   - Implemented via Page Visibility API (line 8251-8271)
   - Pauses game logic, BGM, and resumes on foreground return
3. ✅ **Bridge view app icon** - `assets/app-icon.png` added to granite.config.ts
   - 718KB PNG file, renamed from `app-icon.png.png`
   - Config line: granite.config.ts:8
4. ✅ **Age rating display** - GRAC rating image on main menu
   - Image: `assets/age-rating.png` (96KB PNG)
   - Displayed at 80px width on main menu (line 2219)
5. ✅ **TDS Modal** - Custom Toss-style modal implemented in vanilla JS
   - All 17 system alerts replaced with custom modal (line 1276-1413)
   - Toss brand color (#3182F6), smooth animations, 3 button styles
   - Function: `showTossModal()` (line 4674-4703)
   - Compatible with single HTML file architecture

### Development & Testing
- **Local testing**: Game works standalone in browser (open `index.html` directly)
- **Toss Sandbox app testing**:
  - Requires build: `npm run build` (copies to `dist/web/`)
  - Server: `npm run dev` (serves from project root on port 3000)
  - Update IP in `granite.config.ts` when network changes
  - Sandbox app connects to `http://{IP}:3000`
- **Build workflow**:
  1. Edit `index.html` and `toss-integration.js` in project root
  2. Run `npm run build` to copy to `dist/web/`
  3. Restart server if needed
  4. Refresh Toss Sandbox app
- SDK functions gracefully degrade with console warnings when unavailable
- Test user key automatically generated for local development

## Production Build

### Files
- **index.html** (162KB) - Development version with full comments and formatting
- **index.min.html** (91KB) - Production version, 44% smaller
- **minify.js** - Node.js build script for creating minified version
- **BUILD.md** - Comprehensive production deployment guide
- **granite.config.ts** - Toss framework configuration

### SEO & Social Media
Complete meta tags in `<head>` section (~lines 8-36):
- SEO meta tags (description, keywords, author)
- Open Graph tags for Facebook/Kakao sharing
- Twitter Card support
- PWA-ready meta tags (mobile-web-app-capable, theme-color)
- Game-specific metadata

### Building for Production
```bash
node minify.js
```
Outputs `index.min.html` with:
- All comments removed
- Whitespace compressed
- 44% file size reduction
- Further compression possible with gzip (15-20KB estimated)

### Deployment Checklist
See `BUILD.md` for complete guide including:
- Meta tag URL updates
- Mobile testing verification
- Audio/haptic testing
- Asset verification
- CORS configuration
- Server gzip setup
- Optional service worker for offline play
