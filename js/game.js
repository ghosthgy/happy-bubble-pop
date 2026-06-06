/**
 * Game Layer: Child-Friendly Canvas Engine & Sound Synthesis
 * Refactored for 4-year-old toddlers: Glossy bubbles, cat paws, magic star trails, zero frustration, and nursery procedural BGM.
 */

// --- PROCEDURAL CHEERFUL NURSERY BGM SYNTHESIZER ---
class CuteBGM {
  constructor(audioCtx) {
    this.audioCtx = audioCtx;
    this.isPlaying = false;
    this.beatIndex = 0;
    this.timerId = null;

    // Cheerful pentatonic melody notes (C4, D4, E4, G4, A4, C5, D5, E5, G5, A5)
    this.melodyNotes = [
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.25, 783.99, 880.00
    ];

    // Cheerful, simple progression: C - F - G - C in a loop
    this.chords = [
      { root: 130.81, fifth: 196.00, melodyPool: [0, 2, 3, 5, 7] }, // C major
      { root: 174.61, fifth: 261.63, melodyPool: [1, 4, 5, 8, 9] }, // F major
      { root: 196.00, fifth: 293.66, melodyPool: [1, 3, 6, 8, 9] }, // G major
      { root: 130.81, fifth: 196.00, melodyPool: [0, 2, 4, 5, 7] }  // C major
    ];
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.beatIndex = 0;
    
    const beatDuration = 0.38; // ms per beat (approx 158 BPM, cheerful)
    
    const scheduleNextBeat = () => {
      if (!this.isPlaying) return;
      
      const chordIdx = Math.floor(this.beatIndex / 4) % this.chords.length;
      const subBeat = this.beatIndex % 4;
      const currentChord = this.chords[chordIdx];
      const now = this.audioCtx.currentTime;
      
      // 1. Bass accompaniment
      if (subBeat === 0) {
        this.playTone(currentChord.root, 'triangle', 0.06, now, 0.35); // solid bass
      } else if (subBeat === 2) {
        this.playTone(currentChord.fifth, 'triangle', 0.04, now, 0.2); // harmony
      }
      
      // 2. Cheerful melody note (80% chance for musical variation)
      if (Math.random() > 0.2) {
        const pool = currentChord.melodyPool;
        const noteIndex = pool[Math.floor(Math.random() * pool.length)];
        const freq = this.melodyNotes[noteIndex];
        
        // Toy-piano style sine wave tone
        this.playTone(freq, 'sine', 0.04, now, 0.18);
      }
      
      this.beatIndex++;
      this.timerId = setTimeout(scheduleNextBeat, beatDuration * 1000);
    };
    
    scheduleNextBeat();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  playTone(freq, type, volume, startTime, duration) {
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(volume, startTime);
      // Soft exponential decay
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      console.warn("Failed to synthesize procedural sound node: ", e);
    }
  }
}

// --- SOUND EFFECTS SYNTHESIZER ---
class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBubblePop() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      // Crisp quick slide up
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      console.warn(e);
    }
  }

  playLevelUp() {
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5 rising chime
      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.08);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.08 + 0.25);
        
        osc.start(this.ctx.currentTime + index * 0.08);
        osc.stop(this.ctx.currentTime + index * 0.08 + 0.25);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  playGameOver() {
    this.init();
    if (!this.ctx) return;
    try {
      // Gentle concluding major sweep
      const notes = [523.25, 392.00, 329.63, 261.63]; // C5, G4, E4, C4 falling gently
      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.12);
        
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.12 + 0.3);
        
        osc.start(this.ctx.currentTime + index * 0.12);
        osc.stop(this.ctx.currentTime + index * 0.12 + 0.3);
      });
    } catch (e) {
      console.warn(e);
    }
  }
}

// Instantiate Sound System
const sound = new SoundEffects();

// --- GAME SYSTEM CONFIGS ---
const CONFIG = {
  BUBBLE_MIN_RADIUS: 60,  // minimum bubble size (120px diameter)
  BUBBLE_MAX_RADIUS: 85,  // maximum bubble size (170px diameter)
  COLLISION_RADIUS: 45
};

const STATES = {
  START_MENU: 'START_MENU',
  LOADING: 'LOADING',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

const ANIMAL_BADGES = {
  1: '🐰 小小兔',
  2: '🐱 萌萌猫',
  3: '🐶 汪汪狗',
  4: '🐻 小胖熊',
  5: '🐼 胖熊猫',
  6: '🦁 小狮子',
  7: '🐯 小老虎',
  8: '🦖 恐龙仔',
  9: '🦄 独角兽',
  10: '🐉 金色龙'
};

const PRAISE_WORDS = ["真棒!", "太酷啦!", "好厉害!", "哇哦!", "啪!", "⭐", "🎈", "🌟", "🎉", "哈!"];

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.state = STATES.START_MENU;
    
    // Hands data from tracker
    this.hands = { left: null, right: null };
    
    // Core game metrics
    this.score = 0; // bubbles popped
    this.level = 1;
    this.starsCount = 0; // current stars out of 10
    
    this.items = []; // bubble objects
    this.particles = []; // explosion & magic trail particles
    this.popups = []; // flying praise texts
    
    this.lastFrameTime = 0;
    this.timers = {
      bubble: 0
    };
    
    // DOM bindings
    this.dom = {
      hud: document.getElementById('hud'),
      startMenu: document.getElementById('startMenu'),
      loadingScreen: document.getElementById('loadingScreen'),
      loadingStatus: document.getElementById('loadingStatus'),
      pauseMenu: document.getElementById('pauseMenu'),
      gameOverMenu: document.getElementById('gameOverMenu'),
      finalScore: document.getElementById('finalScore'),
      leftIndicator: document.getElementById('leftHandIndicator'),
      rightIndicator: document.getElementById('rightHandIndicator'),
      bgmBtn: document.getElementById('bgmBtn'),
      bgmIcon: document.getElementById('bgmIcon'),
      bgmText: document.getElementById('bgmText'),
      levelBadge: document.getElementById('levelBadge'),
      animalAvatar: document.getElementById('animalAvatar'),
      starSlots: document.getElementById('starSlots')
    };

    this.tracker = null;
    this.bgmPlayer = null;
    this.bgmMuted = false;
    
    window.addEventListener('resize', () => this.resizeCanvas());
    this.resizeCanvas();
    this.initEvents();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.scaledCollisionRadius = Math.max(45, Math.min(CONFIG.COLLISION_RADIUS * 1.5, window.innerWidth * 0.06));
  }

  initEvents() {
    // Start game trigger
    document.getElementById('startBtn').addEventListener('click', () => {
      this.startGameFlow();
    });

    // Pause UI controls
    document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
    document.getElementById('quitBtn').addEventListener('click', () => this.quitToMenu());
    
    // Score board restart / exit
    document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
    document.getElementById('backToMenuBtn').addEventListener('click', () => this.quitToMenu());
    
    // Keyboard Pause listener (Esc)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (this.state === STATES.PLAYING) {
          this.pauseGame();
        } else if (this.state === STATES.PAUSED) {
          this.resumeGame();
        }
      }
    });

    // BGM mute button listener
    if (this.dom.bgmBtn) {
      this.dom.bgmBtn.addEventListener('click', () => {
        this.bgmMuted = !this.bgmMuted;
        if (this.bgmMuted) {
          this.dom.bgmIcon.textContent = '🔇';
          this.dom.bgmText.textContent = '音乐：关';
          if (this.bgmPlayer) this.bgmPlayer.stop();
        } else {
          this.dom.bgmIcon.textContent = '🎵';
          this.dom.bgmText.textContent = '音乐：开';
          if (this.state === STATES.PLAYING && this.bgmPlayer) {
            this.bgmPlayer.start();
          }
        }
      });
    }

    // Start screen background bubbles
    this.spawnMenuBubbles();
  }

  spawnMenuBubbles() {
    const container = document.getElementById('menuBubbles');
    if (!container) return;
    container.innerHTML = '';
    // Generate ambient background floating bubbles
    for (let i = 0; i < 15; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble-bg';
      
      const size = Math.random() * 50 + 30; // larger ambient bubbles
      const left = Math.random() * 100;
      const delay = Math.random() * 6;
      const duration = Math.random() * 6 + 6;
      
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${left}%`;
      bubble.style.animationDelay = `${delay}s`;
      bubble.style.animationDuration = `${duration}s`;
      
      container.appendChild(bubble);
    }
  }

  async startGameFlow() {
    this.setState(STATES.LOADING);
    sound.init(); // initialize Web Audio context
    
    // Clear ambient background bubbles
    const menuBubbles = document.getElementById('menuBubbles');
    if (menuBubbles) menuBubbles.innerHTML = '';

    // Connect procedural BGM
    if (!this.bgmPlayer && sound.ctx) {
      this.bgmPlayer = new CuteBGM(sound.ctx);
    }

    const webcam = document.getElementById('webcam');
    this.tracker = new window.HandTracker(webcam, (handsData) => {
      this.hands = handsData;
      this.updateStatusIndicators();
    });

    try {
      await this.tracker.init((statusMsg) => {
        this.dom.loadingStatus.textContent = statusMsg;
      });
      
      this.resetVariables();
      this.setState(STATES.PLAYING);
      
      // Start BGM
      if (this.bgmPlayer && !this.bgmMuted) {
        this.bgmPlayer.start();
      }

      this.lastFrameTime = performance.now();
      requestAnimationFrame((t) => this.gameLoop(t));
      
    } catch (error) {
      alert(error.message);
      this.setState(STATES.START_MENU);
      this.spawnMenuBubbles();
    }
  }

  resetVariables() {
    this.score = 0;
    this.level = 1;
    this.starsCount = 0;
    
    this.items = [];
    this.particles = [];
    this.popups = [];
    
    this.timers.bubble = 0;
    
    // UI resets
    if (this.dom.finalScore) this.dom.finalScore.textContent = '0';
    this.updateStarsUI();
    this.updateLevelBadgeUI();
  }

  setState(newState) {
    this.state = newState;
    
    this.dom.startMenu.classList.add('hidden');
    this.dom.loadingScreen.classList.add('hidden');
    this.dom.pauseMenu.classList.add('hidden');
    this.dom.gameOverMenu.classList.add('hidden');
    this.dom.hud.classList.add('opacity-0');
    
    switch (newState) {
      case STATES.START_MENU:
        this.dom.startMenu.classList.remove('hidden');
        if (this.tracker) {
          this.tracker.stop();
          this.tracker = null;
        }
        if (this.bgmPlayer) {
          this.bgmPlayer.stop();
        }
        break;
      case STATES.LOADING:
        this.dom.loadingScreen.classList.remove('hidden');
        break;
      case STATES.PLAYING:
        this.dom.hud.classList.remove('opacity-0');
        break;
      case STATES.PAUSED:
        this.dom.pauseMenu.classList.remove('hidden');
        if (this.bgmPlayer) {
          this.bgmPlayer.stop();
        }
        break;
      case STATES.GAME_OVER:
        this.dom.gameOverMenu.classList.remove('hidden');
        if (this.dom.finalScore) this.dom.finalScore.textContent = this.score;
        if (this.bgmPlayer) {
          this.bgmPlayer.stop();
        }
        sound.playGameOver();
        break;
    }
  }

  pauseGame() {
    if (this.state !== STATES.PLAYING) return;
    this.setState(STATES.PAUSED);
  }

  resumeGame() {
    if (this.state !== STATES.PAUSED) return;
    this.setState(STATES.PLAYING);
    if (this.bgmPlayer && !this.bgmMuted) {
      this.bgmPlayer.start();
    }
    this.lastFrameTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  quitToMenu() {
    this.setState(STATES.START_MENU);
    this.spawnMenuBubbles();
  }

  restartGame() {
    this.resetVariables();
    this.setState(STATES.PLAYING);
    if (this.bgmPlayer && !this.bgmMuted) {
      this.bgmPlayer.start();
    }
    this.lastFrameTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  updateStatusIndicators() {
    if (this.hands.left) {
      this.dom.leftIndicator.className = "inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]";
    } else {
      this.dom.leftIndicator.className = "inline-block w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]";
    }

    if (this.hands.right) {
      this.dom.rightIndicator.className = "inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]";
    } else {
      this.dom.rightIndicator.className = "inline-block w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]";
    }
  }

  updateStarsUI() {
    if (!this.dom.starSlots) return;
    const stars = this.dom.starSlots.children;
    for (let i = 0; i < stars.length; i++) {
      if (i < this.starsCount) {
        stars[i].className = 'star-slot active';
      } else {
        stars[i].className = 'star-slot opacity-25 filter grayscale';
      }
    }
  }

  updateLevelBadgeUI() {
    if (!this.dom.levelBadge || !this.dom.animalAvatar) return;
    const badgeText = ANIMAL_BADGES[this.level] || `${this.level} 🦄`;
    const parts = badgeText.split(' ');
    const emoji = parts[0];
    const name = parts[1] || '魔法生物';
    
    this.dom.levelBadge.firstElementChild.textContent = `第 ${this.level} 关 - ${name}`;
    this.dom.animalAvatar.textContent = emoji;
  }

  // --- SPAWN BUBBLE OBJECT ---
  spawnBubble() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Choose spawn boundaries
    const padding = 100;
    const x = Math.random() * (w - padding * 2) + padding;
    // Spawns below screen bottom
    const y = h + CONFIG.BUBBLE_MAX_RADIUS + 20;
    
    // Slow, toddler-friendly float speed
    const speedY = - (1.2 + Math.random() * 0.8 + Math.min(this.level * 0.1, 0.8));
    
    // Gently drifting swing
    const amplitude = 20 + Math.random() * 20;
    const frequency = 0.004 + Math.random() * 0.006;
    const size = CONFIG.BUBBLE_MIN_RADIUS + Math.random() * (CONFIG.BUBBLE_MAX_RADIUS - CONFIG.BUBBLE_MIN_RADIUS);
    
    // High saturated cheerful macaron/pastel colors
    const macaronColors = [
      { main: '#ff7ca1', secondary: '#ffe4ec' }, // Pastel Pink
      { main: '#8ce600', secondary: '#f3ffd6' }, // Pastel Green/Lime
      { main: '#00d5ff', secondary: '#e6fbff' }, // Pastel Cyan
      { main: '#ffd000', secondary: '#fffde6' }, // Pastel Yellow
      { main: '#ff8400', secondary: '#ffebd6' }, // Pastel Orange
      { main: '#ae5cff', secondary: '#f8f2ff' }  // Pastel Purple/Lavender
    ];
    const color = macaronColors[Math.floor(Math.random() * macaronColors.length)];

    this.items.push({
      id: Math.random(),
      type: 'bubble',
      x: x,
      y: y,
      speedY: speedY,
      amplitude: amplitude,
      frequency: frequency,
      initialX: x,
      angle: Math.random() * Math.PI * 2,
      size: size,
      color: color
    });
  }

  spawnCatchParticles(x, y, color) {
    // Generate nice burst of star & bubble round particles
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        radius: Math.random() * 8 + 4,
        alpha: 1,
        color: Math.random() > 0.5 ? color.main : color.secondary,
        decay: 0.02 + Math.random() * 0.015,
        isStar: Math.random() > 0.4
      });
    }
  }

  triggerConfetti() {
    const w = window.innerWidth;
    // Rain down 45 bright pastel star confetti elements on Level Up
    for (let i = 0; i < 45; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: -30 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 4,
        vy: 2.5 + Math.random() * 4,
        radius: Math.random() * 10 + 5,
        alpha: 1,
        color: `hsl(${Math.random() * 360}, 100%, 75%)`,
        decay: 0.006 + Math.random() * 0.004,
        isStar: true,
        gravity: 0.05
      });
    }
  }

  spawnPraisePopup(x, y) {
    const word = PRAISE_WORDS[Math.floor(Math.random() * PRAISE_WORDS.length)];
    const colors = ['#ff7ca1', '#ffc400', '#00e1ff', '#90ff00', '#ff8400', '#f472b6'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];
    this.popups.push({
      x: x,
      y: y - 30,
      text: word,
      alpha: 1.0,
      color: chosenColor,
      speedY: -1.5
    });
  }

  // --- MAIN LOOP ---
  gameLoop(timestamp) {
    if (this.state !== STATES.PLAYING) return;

    const dt = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    this.update(dt);
    this.draw();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Timer control for spawns
    this.timers.bubble += dt;
    const spawnRate = Math.max(900, 1800 - (this.level * 100)); // spawn faster as level increases, capped at 900ms
    if (this.timers.bubble >= spawnRate) {
      this.spawnBubble();
      this.timers.bubble = 0;
    }

    // Hand magical wand particle trails update (emitted from active palm center)
    if (this.hands.left) {
      const px = (1 - this.hands.left.x) * viewportWidth;
      const py = this.hands.left.y * viewportHeight;
      this.particles.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 2.5,
        vy: (Math.random() - 0.5) * 2.5,
        radius: Math.random() * 4 + 2,
        alpha: 0.8,
        color: '#ff7ca1',
        decay: 0.035,
        isStar: true
      });
    }
    if (this.hands.right) {
      const px = (1 - this.hands.right.x) * viewportWidth;
      const py = this.hands.right.y * viewportHeight;
      this.particles.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 2.5,
        vy: (Math.random() - 0.5) * 2.5,
        radius: Math.random() * 4 + 2,
        alpha: 0.8,
        color: '#00d5ff',
        decay: 0.035,
        isStar: true
      });
    }

    // Update Bubbles
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      
      // Float up
      item.y += item.speedY;
      
      // Gentle sway
      item.angle += item.frequency * (dt / 16.6);
      item.x = item.initialX + Math.sin(item.angle) * item.amplitude;

      // Swipe collision logic (checks all 21 joint positions)
      let hit = false;
      const checkCollision = (handData) => {
        if (!handData || !handData.landmarks) return false;
        
        for (let j = 0; j < handData.landmarks.length; j++) {
          const lm = handData.landmarks[j];
          const lmx = (1 - lm.x) * viewportWidth;
          const lmy = lm.y * viewportHeight;
          
          const dx = item.x - lmx;
          const dy = item.y - lmy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Child-friendly collision threshold: 1.5x bubble size tolerance
          if (dist < item.size * 1.5) {
            return true;
          }
        }
        return false;
      };

      const hitLeft = checkCollision(this.hands.left);
      const hitRight = checkCollision(this.hands.right);

      if (hitLeft || hitRight) {
        hit = true;
        this.handleItemCatch(item);
        this.items.splice(i, 1);
        continue;
      }

      // Out of bounds checks (floated past the top of the screen)
      if (item.y < -item.size - 20) {
        // Zero frustration: no punishment or combo breaks if bubbles are missed
        this.items.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) {
        p.vy += p.gravity;
      }
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Popups
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.y += pop.speedY;
      pop.alpha -= 0.018; // fade out smoothly
      if (pop.alpha <= 0) {
        this.popups.splice(i, 1);
      }
    }
  }

  handleItemCatch(item) {
    this.score++;
    this.starsCount++;
    
    // SFX Pop
    sound.playBubblePop();
    
    // Spawns star explosion particles
    this.spawnCatchParticles(item.x, item.y, item.color);
    
    // Praise words flying popup
    this.spawnPraisePopup(item.x, item.y);
    
    this.updateStarsUI();

    // Check level up (every 10 pops)
    if (this.starsCount >= 10) {
      this.starsCount = 0;
      this.level++;
      sound.playLevelUp();
      this.triggerConfetti();
      this.updateLevelBadgeUI();
      this.updateStarsUI();
      
      // Center giant screen popup
      this.popups.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 3,
        text: `🌟 升级啦！第 ${this.level} 关 🌟`,
        alpha: 1.5,
        color: '#ffc400',
        speedY: -0.6
      });

      // Toddler game end celebration trigger
      // To prevent toddlers from playing endlessly if they get tired, 
      // every 10 levels (100 pops) or 3 levels (30 pops), we can trigger a cute summary screen.
      // Let's prompt a "You Completed the Challenge!" congratulations menu at Level 5
      if (this.level > 5) {
        setTimeout(() => {
          this.setState(STATES.GAME_OVER);
        }, 1200);
      }
    }
  }

  // --- DRAWING ENGINE ---
  draw() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    this.ctx.clearRect(0, 0, w, h);
    
    // Ambient background rays
    this.drawUnderwaterOverlay(w, h);

    // Draw Bubbles
    this.items.forEach(bubble => this.drawBubble(bubble));

    // Draw Particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      
      if (p.isStar) {
        // Draw tiny particle stars
        this.drawStar(p.x, p.y, 5, p.radius, p.radius * 0.4, { main: p.color, secondary: '#ffffff' });
      } else {
        // Draw small bubble particles
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
        
        // Shine inside particle bubble
        this.ctx.beginPath();
        this.ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.2, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fill();
      }
      this.ctx.restore();
    });

    // Draw Praise text popups
    this.ctx.save();
    this.ctx.font = 'bold 26px Fredoka, sans-serif';
    this.ctx.textAlign = 'center';
    this.popups.forEach(pop => {
      this.ctx.globalAlpha = Math.min(1.0, pop.alpha);
      this.ctx.fillStyle = pop.color;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = pop.color;
      this.ctx.fillText(pop.text, pop.x, pop.y);
    });
    this.ctx.restore();

    // Draw Cat Paw Cursors
    this.drawHandOverlay(w, h);
  }

  drawUnderwaterOverlay(w, h) {
    const topGradient = this.ctx.createLinearGradient(0, 0, 0, h * 0.4);
    topGradient.addColorStop(0, 'rgba(236, 72, 153, 0.06)'); // touch of soft pink at the top
    topGradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
    this.ctx.fillStyle = topGradient;
    this.ctx.fillRect(0, 0, w, h);
  }

  drawBubble(bubble) {
    this.ctx.save();
    this.ctx.translate(bubble.x, bubble.y);
    
    // Colored edge glow
    this.ctx.shadowBlur = 12;
    this.ctx.shadowColor = bubble.color.main;
    
    // 1. Semi-transparent 3D gradient body
    const grad = this.ctx.createRadialGradient(
      -bubble.size * 0.2, -bubble.size * 0.2, bubble.size * 0.1,
      0, 0, bubble.size
    );
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    grad.addColorStop(0.6, `${bubble.color.main}20`); // very faint center
    grad.addColorStop(0.95, `${bubble.color.main}60`); // colored rim inner
    grad.addColorStop(1, `${bubble.color.main}90`); // colored outer rim
    
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, bubble.size, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Shiny colored outline
    this.ctx.strokeStyle = `${bubble.color.secondary}bb`;
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();

    // 3. Highlight gloss (crescent arc on top-left)
    this.ctx.beginPath();
    this.ctx.arc(-bubble.size * 0.35, -bubble.size * 0.35, bubble.size * 0.35, Math.PI, Math.PI * 1.5);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.lineWidth = bubble.size * 0.12;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    // Secondary dot reflection (bottom-right)
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    this.ctx.beginPath();
    this.ctx.arc(bubble.size * 0.45, bubble.size * 0.45, bubble.size * 0.08, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius, color) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    const starGrad = this.ctx.createRadialGradient(cx, cy, 2, cx, cy, outerRadius);
    starGrad.addColorStop(0, color.main);
    starGrad.addColorStop(1, color.secondary || '#ffffff');
    this.ctx.fillStyle = starGrad;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }
    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawHandOverlay(w, h) {
    const drawCatPawCursor = (handData, isLeft) => {
      if (!handData) return;

      const px = (1 - handData.x) * w;
      const py = handData.y * h;
      const color = isLeft ? '#ff7ca1' : '#00d5ff'; // Left pink paw, Right blue/cyan paw

      this.ctx.save();
      
      // 1. Draw Paw Shadow
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      
      // 2. Draw Cat Paw White Outer Backing
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(px, py + 6, 26, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Toe backing arcs
      const toes = [
        { x: px - 19, y: py - 16, r: 10 },
        { x: px - 6, y: py - 24, r: 11 },
        { x: px + 6, y: py - 24, r: 11 },
        { x: px + 19, y: py - 16, r: 10 }
      ];
      toes.forEach(toe => {
        this.ctx.beginPath();
        this.ctx.arc(toe.x, toe.y, toe.r, 0, Math.PI * 2);
        this.ctx.fill();
      });
      
      // 3. Draw Cat Paw Pink/Cyan Inner Pads
      this.ctx.shadowBlur = 0; // remove shadow for sharp inner pads
      this.ctx.fillStyle = color;
      
      // Kidney shaped main inner pad
      this.ctx.beginPath();
      this.ctx.arc(px, py + 8, 17, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(px - 9, py + 3, 9, 0, Math.PI * 2);
      this.ctx.arc(px + 9, py + 3, 9, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Inner toe pads
      const innerToes = [
        { x: px - 19, y: py - 16, r: 6 },
        { x: px - 6, y: py - 24, r: 7 },
        { x: px + 6, y: py - 24, r: 7 },
        { x: px + 19, y: py - 16, r: 6 }
      ];
      innerToes.forEach(toe => {
        this.ctx.beginPath();
        this.ctx.arc(toe.x, toe.y, toe.r, 0, Math.PI * 2);
        this.ctx.fill();
      });

      // 4. Draw Label (e.g. "左手" / "右手") in font for kids
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 11px Fredoka, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.shadowBlur = 4;
      this.ctx.shadowColor = '#000000';
      this.ctx.fillText(isLeft ? '左手🐾' : '右手🐾', px, py + 8);
      
      this.ctx.restore();
    };

    drawCatPawCursor(this.hands.left, true);
    drawCatPawCursor(this.hands.right, false);
  }
}

// Start Engine
window.addEventListener('DOMContentLoaded', () => {
  window.Game = new GameEngine();
});
