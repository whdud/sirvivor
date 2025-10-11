# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser-based survival game called "SURVIVOR" (시르바이버), written entirely in a single HTML file (`index.html`) using vanilla JavaScript and Canvas API. The game is a bullet hell / vampire survivors-style game where players automatically attack enemies while manually moving to survive.

## Architecture

### Single-File Structure
The entire game is contained in `index.html` with three main sections:
- **CSS** (lines 7-433): All styling including responsive design and animations
- **HTML** (lines 436-499): UI overlays and game container
- **JavaScript** (lines 501-1603): Complete game logic

### Core Systems

**Game State Management** (lines 520-636)
- `player` object: Position, stats (HP, XP, level), size, speed
- Multiple arrays for game entities: `enemies`, `projectiles`, `missiles`, `lightnings`, `enemyProjectiles`, `xpOrbs`, `goldOrbs`, `meleeWeapons`
- Global state: `gameStarted`, `gameRunning`, `gameTime`, `kills`, `currentGold`, `totalGold`

**Character System** (lines 557-609)
- 6 playable characters with different stats (HP, speed, damage)
- Characters are unlockable via gold earned during gameplay
- Each character has unique emoji icon and stat distribution

**Weapon Systems**
- **Basic Projectile** (lines 895-926): Auto-targeting with spread pattern
- **Guided Missiles** (lines 928-946, 1337-1375): Homing projectiles with turn speed
- **Rotating Melee Weapons** (lines 687-695, 1226-1247): Orbital weapons around player
- **Lightning Strike** (lines 948-972): AOE damage with visual effect

**Enemy Types** (lines 840-893)
- **Melee enemies** (red circles): Chase player directly
- **Purple enemies** (purple squares): Faster, more HP
- **Ranged enemies** (orange circles): Keep distance and shoot projectiles

**Progression System** (lines 1009-1189)
- Level-up triggers pause and shows 3 random upgrades
- Rarity system: Common, Uncommon, Rare, Epic, Legend (affects multipliers)
- 14+ upgrade types affecting weapons, stats, and abilities

**Input Handling**
- Keyboard: WASD or arrow keys for movement (lines 679-685)
- Touch: Direct touch/drag movement for mobile (lines 643-677)
- Mobile detection and scaling adjustments (lines 522-524)

## Development Workflow

### Running the Game
Simply open `index.html` in any modern web browser. No build step or dependencies required.

### Testing
- **Desktop**: Use WASD or arrow keys to move
- **Mobile**: Use touch controls; sizes are automatically scaled down
- Test different screen sizes using browser dev tools

### Key Functions to Modify

**Balancing enemy difficulty**: `spawnEnemy()` at line 840
- Adjust spawn rate multipliers: `speedMultiplier` (line 851), `hpMultiplier` (line 852)
- Change enemy type probabilities: `purpleChance` (line 854), `rangedChance` (line 855)

**Modifying upgrades**: `showUpgradeOptions()` at line 1019
- Upgrade definitions in `upgrades` array (lines 1049-1142)
- Rarity probabilities in `rarityRoll()` (lines 1024-1031)
- Multipliers in `rarityMultiplier` object (lines 1041-1047)

**Adjusting player stats**: `characters` array at line 557
- Modify base stats: `hp`, `speed`, `damage`
- Add new characters by extending the array

**Game loop**: `gameLoop()` at line 1593
- Calls `update()` for game logic (line 1191)
- Calls `draw()` for rendering (line 1459)

## Language and Localization

The game UI is currently in Korean (ko):
- UI text: "게임 시작" (Start Game), "레벨 업" (Level Up), etc.
- Stats: "처치" (Kills), "시간" (Time), "골드" (Gold)
- Character names and upgrade descriptions are in Korean

To localize, search and replace UI strings in:
- `#startScreen` content (lines 463-467)
- `#shopScreen` and `#settingsScreen` titles (lines 332-336)
- Upgrade names in `upgrades` array (lines 1049-1142)
- UI labels (line 454)

## Mobile Optimization

Mobile-specific adjustments:
- Size scaling: `sizeScale = 0.4`, `playerSizeScale = 0.5` for mobile (lines 523-524)
- Touch event handlers prevent default browser behavior (passive: false)
- Enemy speed multiplier increased 1.5x on mobile (line 851)
- Haptic feedback on hit via `navigator.vibrate()` (lines 1298-1299, 1393-1394)

## Canvas Rendering

Canvas uses device pixel ratio for sharp rendering on high-DPI displays (lines 505-516):
- Canvas dimensions set to `containerSize * dpr`
- Context scaled by `dpr` to maintain logical coordinate system
- Resizes on window resize event
