// ===== FIREBASE SDK (v11) =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    increment,
    collection,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// 🔥 КОНФИГ ПРОЕКТА blue-rocket-aa9d5
const firebaseConfig = {
    apiKey: "AIzaSyB6gDsBFadkThGUxVjjKC8SFI8bW5LDrQQ",
    authDomain: "blue-rocket-aa9d5.firebaseapp.com",
    projectId: "blue-rocket-aa9d5",
    storageBucket: "blue-rocket-aa9d5.firebasestorage.app",
    messagingSenderId: "841718771195",
    appId: "1:841718771195:web:5ad2a3044d7638bf3def5e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===== AUDIO SYSTEM =====
class AudioSystem {
    constructor() {
        this.ctx = null;
        this.enabled = localStorage.getItem('rocket_sound') !== 'false';
        this.bgmOscillators = [];
        this.isPlayingBGM = false;
        this.bgmInterval = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('rocket_sound', this.enabled);
        if (this.enabled) {
            this.init();
            this.startBGM();
        } else {
            this.stopBGM();
            if (this.ctx) this.ctx.suspend();
        }
        return this.enabled;
    }

    startBGM() {
        if (!this.enabled || this.isPlayingBGM) return;
        this.isPlayingBGM = true;
        this.init();
        this.playAmbientLoop();
        this.bgmInterval = setInterval(() => this.playAmbientLoop(), 4000);
    }

    stopBGM() {
        this.bgmOscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
        });
        this.bgmOscillators = [];
        this.isPlayingBGM = false;
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }

    playAmbientLoop() {
        if (!this.enabled || !this.isPlayingBGM || !this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [110, 130.81, 146.83, 164.81, 196, 220];
        const duration = 3.5;

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = i % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + duration);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, now);
            filter.frequency.linearRampToValueAtTime(150, now + duration);

            gain.gain.setValueAtTime(0.025, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + duration);
            this.bgmOscillators.push(osc);
        });
    }

    playCollect() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playShoot() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    playHit() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playGameOver() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        [400, 300, 200, 100].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            const t = now + i * 0.15;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.start(t);
            osc.stop(t + 0.15);
        });
    }

    playPowerUp() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.exponentialRampToValueAtTime(1047, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

const audio = new AudioSystem();

// ===== AUTH FUNCTIONS =====
window.register = async () => {
    const nickname = document.getElementById('regNickname').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const errorDiv = document.getElementById('registerError');

    errorDiv.classList.add('hidden');

    if (!nickname || !email || !password) {
        errorDiv.textContent = '❌ Заполните все поля';
        errorDiv.classList.remove('hidden');
        return;
    }
    if (password.length < 6) {
        errorDiv.textContent = '❌ Пароль минимум 6 символов';
        errorDiv.classList.remove('hidden');
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: nickname });

        await setDoc(doc(db, 'users', userCredential.user.uid), {
            nickname: nickname,
            email: email,
            bestScore: 0,
            gamesPlayed: 0,
            totalScore: 0,
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp()
        });

        startGame(userCredential.user);
    } catch (error) {
        let msg = error.message;
        if (msg.includes('email-already-in-use')) msg = 'Email уже используется';
        else if (msg.includes('invalid-email')) msg = 'Неверный формат email';
        else if (msg.includes('weak-password')) msg = 'Слабый пароль';
        errorDiv.textContent = '❌ ' + msg;
        errorDiv.classList.remove('hidden');
    }
};

window.login = async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    errorDiv.classList.add('hidden');

    if (!email || !password) {
        errorDiv.textContent = '❌ Заполните все поля';
        errorDiv.classList.remove('hidden');
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        startGame(userCredential.user);
    } catch (error) {
        errorDiv.textContent = '❌ Неверный email или пароль';
        errorDiv.classList.remove('hidden');
    }
};

window.logout = async () => {
    await signOut(auth);
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('gameScreen').style.display = 'none';
    audio.stopBGM();
    if (unsubscribeLeaderboard) unsubscribeLeaderboard();
};

window.toggleForms = () => {
    document.getElementById('registerForm').classList.toggle('hidden');
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('registerError').classList.add('hidden');
    document.getElementById('loginError').classList.add('hidden');
};

window.toggleSound = () => {
    const enabled = audio.toggle();
    document.getElementById('soundToggle').textContent = enabled ? '🔊 ВКЛ' : '🔇 ВЫКЛ';
};

// ===== GAME STATE =====
let currentUser = null;
let gameActive = false;
let score = 0;
let lives = 3;
let gameTime = 0;
let difficulty = 1;
let unsubscribeLeaderboard = null;

// ===== CANVAS SETUP =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let animationId;

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
window.addEventListener('resize', resizeCanvas);

// ===== GAME CLASSES =====
class Rocket {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 80;
        this.width = 36;
        this.height = 48;
        this.speed = 6;
        this.vx = 0;
        this.hasShield = false;
        this.shieldTimer = 0;
        this.hasShooter = false;
        this.shooterTimer = 0;
        this.invulnerable = 0;
    }

    update(keys) {
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) this.vx = -this.speed;
        else if (keys['ArrowRight'] || keys['d'] || keys['D']) this.vx = this.speed;
        else this.vx *= 0.85;

        this.x += this.vx;
        this.x = Math.max(this.width/2, Math.min(canvas.width - this.width/2, this.x));

        if (this.invulnerable > 0) this.invulnerable--;
        if (this.hasShield) {
            this.shieldTimer--;
            const timerEl = document.getElementById('shieldTimer');
            if (timerEl) timerEl.textContent = Math.ceil(this.shieldTimer/60) + 's';
            if (this.shieldTimer <= 0) {
                this.hasShield = false;
                document.getElementById('shieldIndicator').style.display = 'none';
            }
        }
        if (this.hasShooter) {
            this.shooterTimer--;
            const timerEl = document.getElementById('shooterTimer');
            if (timerEl) timerEl.textContent = Math.ceil(this.shooterTimer/60) + 's';
            if (this.shooterTimer <= 0) {
                this.hasShooter = false;
                document.getElementById('shooterIndicator').style.display = 'none';
            }
        }
    }

    draw() {
        ctx.save();

        if (this.hasShield) {
            ctx.strokeStyle = `rgba(0, 255, 136, ${0.3 + Math.sin(Date.now()/200)*0.3})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 50, 0, Math.PI*2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(0, 255, 136, 0.05)';
            ctx.fill();
        }

        if (this.invulnerable > 0 && Math.floor(this.invulnerable/5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height/2);
        ctx.lineTo(this.x - this.width/2, this.y + this.height/2);
        ctx.lineTo(this.x + this.width/2, this.y + this.height/2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#00ccff';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 5, 10, 0, Math.PI*2);
        ctx.fill();

        const flameH = 15 + Math.random() * 15;
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(this.x - 8, this.y + this.height/2);
        ctx.lineTo(this.x + 8, this.y + this.height/2);
        ctx.lineTo(this.x, this.y + this.height/2 + flameH);
        ctx.fill();

        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y + this.height/2 + 5);
        ctx.lineTo(this.x + 5, this.y + this.height/2 + 5);
        ctx.lineTo(this.x, this.y + this.height/2 + flameH - 5);
        ctx.fill();

        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x - this.width/2,
            y: this.y - this.height/2,
            width: this.width,
            height: this.height
        };
    }

    hit() {
        if (this.hasShield) {
            this.hasShield = false;
            document.getElementById('shieldIndicator').style.display = 'none';
            audio.playHit();
            return false;
        }
        if (this.invulnerable > 0) return false;
        this.invulnerable = 120;
        audio.playHit();
        return true;
    }
}

class Star {
    constructor() {
        this.x = Math.random() * (canvas.width - 20) + 10;
        this.y = -15;
        this.radius = 8;
        this.speed = 2 + Math.random();
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.1;
    }
    update() {
        this.y += this.speed;
        this.rotation += this.rotSpeed;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 10;

        const points = 5;
        const outer = this.radius;
        const inner = this.radius * 0.4;
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outer : inner;
            const a = (i * Math.PI) / points - Math.PI/2;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    isOut() { return this.y > canvas.height + 20; }
    collides(box) {
        return this.x > box.x && this.x < box.x + box.width &&
               this.y > box.y && this.y < box.y + box.height;
    }
}

class Meteorite {
    constructor() {
        this.x = Math.random() * (canvas.width - 40) + 20;
        this.y = -30;
        this.radius = 10 + Math.random() * 15;
        this.speed = (2 + Math.random() * 2) * difficulty;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.08;
        this.vertices = [];
        const sides = 6 + Math.floor(Math.random() * 4);
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const r = this.radius * (0.7 + Math.random() * 0.3);
            this.vertices.push({x: Math.cos(angle) * r, y: Math.sin(angle) * r});
        }
    }
    update() {
        this.y += this.speed;
        this.rotation += this.rotSpeed;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = '#884422';
        ctx.strokeStyle = '#aa5533';
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.vertices.forEach((v, i) => {
            if (i === 0) ctx.moveTo(v.x, v.y);
            else ctx.lineTo(v.x, v.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#553311';
        ctx.beginPath();
        ctx.arc(this.radius*0.3, -this.radius*0.2, this.radius*0.2, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
    isOut() { return this.y > canvas.height + 30; }
    collides(box) {
        const dx = this.x - (box.x + box.width/2);
        const dy = this.y - (box.y + box.height/2);
        return Math.sqrt(dx*dx + dy*dy) < this.radius + Math.max(box.width, box.height)/2;
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 10;
        this.radius = 4;
    }
    update() { this.y -= this.speed; }
    draw() {
        ctx.fillStyle = '#00ccff';
        ctx.shadowColor = '#00ccff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    isOut() { return this.y < -10; }
    collides(m) {
        const dx = this.x - m.x;
        const dy = this.y - m.y;
        return Math.sqrt(dx*dx + dy*dy) < this.radius + m.radius;
    }
}

class PowerUp {
    constructor(type) {
        this.x = Math.random() * (canvas.width - 40) + 20;
        this.y = -20;
        this.type = type;
        this.radius = 14;
        this.speed = 1.5;
        this.bob = 0;
    }
    update() {
        this.y += this.speed;
        this.bob += 0.1;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y + Math.sin(this.bob) * 3);

        ctx.fillStyle = this.type === 'shield' ? 'rgba(0, 255, 136, 0.8)' : 'rgba(255, 200, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI*2);
        ctx.fill();

        ctx.strokeStyle = this.type === 'shield' ? '#00ff88' : '#ffc800';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 3, 0, Math.PI*2);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type === 'shield' ? '🛡️' : '⚡', 0, 0);

        ctx.restore();
    }
    isOut() { return this.y > canvas.height + 20; }
    collides(box) {
        return this.x > box.x && this.x < box.x + box.width &&
               this.y > box.y && this.y < box.y + box.height;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 1;
        this.color = color;
        this.size = 2 + Math.random() * 3;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
        this.size *= 0.98;
    }
    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ===== GAME VARIABLES =====
let rocket = new Rocket();
let stars = [];
let meteorites = [];
let bullets = [];
let powerups = [];
let particles = [];
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if ((e.key === ' ' || e.key === 'ArrowUp') && rocket.hasShooter && gameActive) {
        audio.playShoot();
        bullets.push(new Bullet(rocket.x - 8, rocket.y - 20));
        bullets.push(new Bullet(rocket.x + 8, rocket.y - 20));
        e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => keys[e.key] = false);

let spawnTimer = 0;
let powerupTimer = 0;

function spawnParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function updateGame() {
    if (!gameActive) return;

    gameTime++;
    difficulty = 1 + Math.floor(gameTime / 600) * 0.2;

    rocket.update(keys);

    spawnTimer++;
    if (spawnTimer > Math.max(30, 50 - difficulty * 5)) {
        stars.push(new Star());
        spawnTimer = 0;
    }

    if (Math.random() < 0.008 * difficulty && meteorites.length < 6) {
        meteorites.push(new Meteorite());
    }

    powerupTimer++;
    if (powerupTimer > 400) {
        powerups.push(new PowerUp(Math.random() > 0.5 ? 'shield' : 'shooter'));
        powerupTimer = 0;
    }

    stars.forEach((s, i) => {
        s.update();
        if (s.isOut()) stars.splice(i, 1);
        else if (s.collides(rocket.getBounds())) {
            audio.playCollect();
            score += 10;
            spawnParticles(s.x, s.y, '#ffff00', 5);
            stars.splice(i, 1);
        }
    });

    bullets.forEach((b, i) => {
        b.update();
        if (b.isOut()) bullets.splice(i, 1);
    });

    meteorites.forEach((m, mi) => {
        m.update();
        if (m.isOut()) meteorites.splice(mi, 1);
        else {
            bullets.forEach((b, bi) => {
                if (b.collides(m)) {
                    audio.playHit();
                    spawnParticles(m.x, m.y, '#ff6600', 8);
                    score += 15;
                    meteorites.splice(mi, 1);
                    bullets.splice(bi, 1);
                }
            });

            if (m.collides(rocket.getBounds())) {
                if (rocket.hit()) {
                    spawnParticles(m.x, m.y, '#ff0000', 15);
                    meteorites.splice(mi, 1);
                    lives--;
                    const livesEl = document.getElementById('livesDisplay');
                    if (livesEl) livesEl.textContent = '♥'.repeat(Math.max(0, lives));
                    if (lives <= 0) {
                        gameActive = false;
                        endGame();
                    }
                }
            }
        }
    });

    powerups.forEach((p, i) => {
        p.update();
        if (p.isOut()) powerups.splice(i, 1);
        else if (p.collides(rocket.getBounds())) {
            audio.playPowerUp();
            if (p.type === 'shield') {
                rocket.hasShield = true;
                rocket.shieldTimer = 360;
                document.getElementById('shieldIndicator').style.display = 'flex';
            } else {
                rocket.hasShooter = true;
                rocket.shooterTimer = 360;
                document.getElementById('shooterIndicator').style.display = 'flex';
            }
            powerups.splice(i, 1);
        }
    });

    particles.forEach((p, i) => {
        p.update();
        if (p.life <= 0) particles.splice(i, 1);
    });

    const scoreEl = document.getElementById('scoreDisplay');
    if (scoreEl) scoreEl.textContent = score;
    const diffEl = document.getElementById('difficultyDisplay');
    if (diffEl) diffEl.textContent = 'x' + difficulty.toFixed(1);
}

function drawGame() {
    ctx.fillStyle = 'rgba(10, 14, 39, 0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 60) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 60) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    powerups.forEach(p => p.draw());
    stars.forEach(s => s.draw());
    meteorites.forEach(m => m.draw());
    bullets.forEach(b => b.draw());
    particles.forEach(p => p.draw());
    rocket.draw();
}

function gameLoop() {
    updateGame();
    drawGame();
    animationId = requestAnimationFrame(gameLoop);
}

// ===== FIREBASE LEADERBOARD =====
function setupRealtimeLeaderboard() {
    if (unsubscribeLeaderboard) unsubscribeLeaderboard();

    const q = query(collection(db, 'users'), orderBy('bestScore', 'desc'), limit(10));
    unsubscribeLeaderboard = onSnapshot(q, (snapshot) => {
        const users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        updateLeaderboardUI(users);
    }, (error) => {
        console.error('Leaderboard error:', error);
        document.getElementById('leaderboardList').innerHTML = 
            '<div style="text-align:center;color:#ff4444;padding:20px;">Ошибка загрузки таблицы</div>';
    });
}

function updateLeaderboardUI(users) {
    const container = document.getElementById('leaderboardList');
    if (!container) return;

    if (users.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:rgba(0,255,136,0.4);padding:20px;">Пока нет игроков</div>';
        return;
    }

    const html = users.map((user, idx) => {
        const isCurrent = currentUser && user.id === currentUser.uid;
        const medals = ['🥇', '🥈', '🥉'];
        const medal = medals[idx] || '•';

        return `
            <div class="leaderboard-item ${idx < 3 ? `top-${idx+1}` : ''} ${isCurrent ? 'current-user' : ''}">
                <div class="leaderboard-rank">${medal}</div>
                <div class="leaderboard-name">${escapeHtml(user.nickname || 'Unknown')}</div>
                <div class="leaderboard-score">${user.bestScore || 0}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== START/END GAME =====
window.startGame = async (user) => {
    currentUser = user;
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'flex';
    document.getElementById('nicknameDisplay').textContent = (user.displayName || 'Cosmonaut').toUpperCase();

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data() || {};
    lives = 3;
    document.getElementById('livesDisplay').textContent = '♥♥♥';

    resizeCanvas();
    audio.init();
    audio.startBGM();
    setupRealtimeLeaderboard();

    gameActive = true;
    score = 0;
    gameTime = 0;
    difficulty = 1;
    rocket = new Rocket();
    stars = [];
    meteorites = [];
    bullets = [];
    powerups = [];
    particles = [];
    spawnTimer = 0;
    powerupTimer = 0;

    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
};

async function endGame() {
    audio.stopBGM();
    audio.playGameOver();

    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() || {};

    const isNewRecord = score > (userData.bestScore || 0);

    await updateDoc(userRef, {
        bestScore: Math.max(score, userData.bestScore || 0),
        gamesPlayed: increment(1),
        totalScore: increment(score),
        lastActive: serverTimestamp()
    });

    document.getElementById('finalScore').textContent = `ОЧКИ: ${score}`;
    document.getElementById('gameOverMessage').innerHTML = isNewRecord ? 
        '🎉 НОВЫЙ РЕКОРД!' : 
        `💥 Игр сыграно: ${(userData.gamesPlayed || 0) + 1}`;

    document.getElementById('gameOverModal').classList.add('active');
}

window.restartGame = () => {
    document.getElementById('gameOverModal').classList.remove('active');
    if (animationId) cancelAnimationFrame(animationId);
    startGame(currentUser);
};

window.goToLeaderboard = () => {
    document.getElementById('gameOverModal').classList.remove('active');
    showFullLeaderboard();
};

window.showFullLeaderboard = async () => {
    document.getElementById('gameScreen').style.display = 'none';

    const q = query(collection(db, 'users'), orderBy('bestScore', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    const users = [];
    snapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));

    const html = users.map((user, idx) => {
        const isCurrent = currentUser && user.id === currentUser.uid;
        return `
            <div class="lb-item ${isCurrent ? 'current' : ''}">
                <div class="lb-rank">#${idx + 1}</div>
                <div class="lb-info">
                    <div class="lb-nickname">${escapeHtml(user.nickname || 'Unknown')}</div>
                    <div class="lb-email">${escapeHtml(user.email || '')}</div>
                </div>
                <div class="lb-best-score">${user.bestScore || 0}</div>
                <div class="lb-current-streak">${user.gamesPlayed || 0} игр</div>
            </div>
        `;
    }).join('');

    const screen = document.createElement('div');
    screen.className = 'leaderboard-screen active';
    screen.id = 'fullLeaderboardScreen';
    screen.innerHTML = `
        <div class="lb-header">
            <h1 class="lb-title">🏆 ТУРНИРНАЯ ТАБЛИЦА</h1>
            <button class="lb-back-btn" onclick="backToGame()">← ВЕРНУТЬСЯ</button>
        </div>
        <div class="leaderboard-full">${html || '<div style="text-align:center;color:rgba(0,255,136,0.4);padding:40px;">Пока нет игроков</div>'}</div>
    `;
    document.querySelector('.container').appendChild(screen);
};

window.backToGame = () => {
    document.getElementById('fullLeaderboardScreen')?.remove();
    document.getElementById('gameScreen').style.display = 'flex';
};

// ===== INIT =====
onAuthStateChanged(auth, (user) => {
    if (user) {
        startGame(user);
    }
});

function generateStars() {
    const bg = document.getElementById('starsBg');
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.width = (1 + Math.random() * 2) + 'px';
        star.style.height = star.style.width;
        bg.appendChild(star);
    }
}
generateStars();

const soundBtn = document.getElementById('soundToggle');
if (soundBtn) soundBtn.textContent = audio.enabled ? '🔊 ВКЛ' : '🔇 ВЫКЛ';