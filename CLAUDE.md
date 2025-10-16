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

**Enemy Types** (sprite-based)
- **Standard Drone** (Stage1Enemy1.png): Basic chase behavior
- **Purple Drone** (Stage1Enemy2.png): Faster, higher HP
- **Ranged Drone** (Stage1Enemy3.png): Keeps distance and shoots projectiles
- **Boss Drones** (Stage1Boss.png, Stage2Boss.png): Large HP pools, special attacks

**Progression System**
- Level-up triggers pause and shows 3 random upgrades
- Rarity system: Common, Uncommon, Rare, Epic, Legend (affects stat multipliers)
- 14+ upgrade types: weapon enhancements, stat boosts, new weapon unlocks
- XP orbs (Gear.png sprites) drop from enemies and auto-collect based on magnet range
- Gold/"Scrap" currency for character unlocks

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
  /bgm/              - Background music files (MainBgm.mp3, Stage1Bgm.mp3, Stage2Bgm.mp3)
  /fonts/            - Custom fonts (DungGeunMo)
  drone_spritesheet.png    - Player drone sprites (4-frame animation, 64x64 each)
  Stage1Enemy1.png   - Basic enemy sprite
  Stage1Enemy2.png   - Purple enemy sprite
  Stage1Enemy3.png   - Ranged enemy sprite
  Stage1Boss.png     - Stage 1 boss sprite
  Stage2Boss.png     - Stage 2 boss sprite
  Stage1Background.png - Stage 1 background (scrolling)
  Stage2Background.png - Stage 2 background
  Stage3Backfround.png - Stage 3 background (note: typo in filename)
  Gear.png           - XP orb icon
  Bullet.png         - Projectile sprite
  ClockIcon.png      - Time display icon
  HomeIcon.png       - Home button icon
  menu_bg.png        - Main menu background
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

**Audio System**: (~lines 1326-1565)
- `masterVolume`, `musicVolume`, `sfxVolume` control audio levels
- `playBgm()` handles BGM transitions between menus/stages
- BGM files: mainBgm, stage1Bgm, stage2Bgm

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
- Haptic feedback on hit via `navigator.vibrate()` (when available)
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

**Performance Considerations**:
- Single HTML file = no bundler, but ~4000+ lines of JavaScript
- All assets loaded as external files
- Canvas rendering with sprite-based graphics
- Entity arrays (enemies, projectiles) grow during gameplay - monitor performance on long runs
