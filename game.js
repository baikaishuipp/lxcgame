// 游戏配置
const CONFIG = {
    GAME_DURATION: 120, // 2分钟
    RELOAD_TIME: 1000, // 1秒装填时间
    MAX_TARGETS: 5, // 最多5个目标
    
    // 海面目标配置
    SHIPS: {
        DESTROYER: { speed: 6, hitsRequired: 2, score: 20, size: 60, color: '#8B4513', name: '驱逐舰' },
        FRIGATE: { speed: 4, hitsRequired: 2, score: 40, size: 80, color: '#696969', name: '护卫舰' },
        CARRIER: { speed: 2, hitsRequired: 3, score: 60, size: 120, color: '#2F4F4F', name: '航空母舰' }
    },
    
    // 海底目标配置
    SUBMARINES: {
        SMALL: { speed: 6, hitsRequired: 1, score: 20, size: 40, color: '#4169E1', name: '小潜艇' },
        MEDIUM: { speed: 4, hitsRequired: 2, score: 40, size: 60, color: '#1E90FF', name: '中潜艇' },
        LARGE: { speed: 2, hitsRequired: 3, score: 60, size: 90, color: '#00008B', name: '大潜艇' }
    },
    
    HIT_SPEED: 0.2 // 被击中后的速度
};

// 图片资源配置
const IMAGE_RESOURCES = {
    // 海面目标
    DESTROYER: 'https://cdn.pixabay.com/photo/2017/01/31/14/43/animal-2024347_1280.png',
    FRIGATE: 'https://cdn.pixabay.com/photo/2017/01/31/14/43/animal-2024347_1280.png',
    CARRIER: 'https://cdn.pixabay.com/photo/2017/01/31/14/43/animal-2024347_1280.png',
    
    // 海底目标
    SUBMARINE_SMALL: 'https://cdn.pixabay.com/photo/2013/07/12/14/15/submarine-148109_1280.png',
    SUBMARINE_MEDIUM: 'https://cdn.pixabay.com/photo/2013/07/12/14/15/submarine-148109_1280.png',
    SUBMARINE_LARGE: 'https://cdn.pixabay.com/photo/2013/07/12/14/15/submarine-148109_1280.png',
    
    // 导弹
    MISSILE: 'https://cdn.pixabay.com/photo/2017/01/31/19/11/missile-2026150_1280.png',
    
    // 爆炸效果
    EXPLOSION: 'https://cdn.pixabay.com/photo/2017/02/08/14/26/explosion-2048795_1280.png'
};

// 游戏状态
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        this.images = {};
        this.imagesLoaded = false;
        this.loadingProgress = 0;
        
        this.score = 0;
        this.timer = CONFIG.GAME_DURATION;
        this.combo = 0;
        this.maxCombo = 0;
        this.isPlaying = false;
        this.canShoot = true;
        this.reloadProgress = 100;
        this.scene = 'surface'; // 'surface' 或 'underwater'
        
        this.missiles = [];
        this.targets = [];
        this.explosions = [];
        this.particles = [];
        
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.totalKills = 0;
        
        this.lastTime = 0;
        this.lastComboTime = 0;
        
        this.loadImages();
        this.setupEventListeners();
        this.setupAudio();
    }
    
    loadImages() {
        // 使用免费的Twemoji CDN图片（表情符号风格，可靠且快速）
        // 如果要使用本地图片，请将URL改为: './images/xxx.png'
        const imageUrls = {
            destroyer: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f6a2.png', // 🚢
            frigate: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/26f4.png',   // ⛴️
            carrier: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f6a2.png',  // 🚢（大）
            submarineSmall: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f41f.png', // 🐟
            submarineMedium: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f420.png', // 🐠
            submarineLarge: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f433.png',  // 🐳
            missile: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f680.png',  // 🚀
            explosion: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4a5.png' // 💥
        };
        
        // 更多在线图片配置选项，请查看 online-images-config.js 文件
        
        let loadedCount = 0;
        const totalImages = Object.keys(imageUrls).length;
        
        // 快速检测图片是否存在，不存在则立即使用Canvas绘制
        let hasAnyImage = false;
        
        Object.keys(imageUrls).forEach(key => {
            const img = new Image();
            // 如果使用在线图片，需要设置crossOrigin
            if (imageUrls[key].startsWith('http')) {
                img.crossOrigin = "anonymous";
            }
            
            img.onload = () => {
                loadedCount++;
                hasAnyImage = true;
                this.loadingProgress = (loadedCount / totalImages) * 100;
                this.updateLoadingUI();
                if (loadedCount === totalImages) {
                    this.imagesLoaded = true;
                    this.onImagesLoaded();
                }
            };
            img.onerror = () => {
                // 图片加载失败，静默处理
                loadedCount++;
                this.loadingProgress = (loadedCount / totalImages) * 100;
                this.updateLoadingUI();
                if (loadedCount === totalImages) {
                    this.imagesLoaded = true;
                    this.onImagesLoaded();
                    if (!hasAnyImage) {
                        console.log('未找到图片素材，使用Canvas绘制模式');
                    }
                }
            };
            img.src = imageUrls[key];
            this.images[key] = img;
        });
        
        // 设置超时，1秒后如果还没加载完就直接开始游戏
        setTimeout(() => {
            if (!this.imagesLoaded) {
                console.log('图片加载超时，使用Canvas绘制模式');
                this.imagesLoaded = true;
                this.onImagesLoaded();
            }
        }, 1000);
    }
    
    updateLoadingUI() {
        const progressBar = document.getElementById('loadingProgress');
        if (progressBar) {
            progressBar.style.width = this.loadingProgress + '%';
        }
    }
    
    onImagesLoaded() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const startBtn = document.getElementById('startBtn');
        
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        if (startBtn) {
            startBtn.style.display = 'block';
        }
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // 移动端优化：使用较低的分辨率提升性能
        if (this.isMobile) {
            const dpr = window.devicePixelRatio || 1;
            // 限制最大像素比率
            const maxDpr = 2;
            const useDpr = Math.min(dpr, maxDpr);
            
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
            this.canvas.width = window.innerWidth * useDpr;
            this.canvas.height = window.innerHeight * useDpr;
            this.ctx.scale(useDpr, useDpr);
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        
        document.getElementById('sceneToggle').addEventListener('click', () => this.toggleScene());
        
        // PC端：鼠标点击
        this.canvas.addEventListener('click', (e) => this.shoot(e));
        
        // 移动端：触摸事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // 防止触摸时页面滚动
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            // 创建模拟的点击事件对象
            const fakeEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            this.shoot(fakeEvent);
        }, { passive: false });
        
        // 防止移动端双击缩放
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // 防止长按菜单
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // 检测设备类型
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (this.isMobile) {
            console.log('移动设备检测：已启用触摸优化');
            document.body.classList.add('mobile-device');
        }
    }
    
    setupAudio() {
        // 创建音效上下文
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.sounds = {
                shoot: this.createShootSound.bind(this),
                hit: this.createHitSound.bind(this),
                explosion: this.createExplosionSound.bind(this),
                combo: this.createComboSound.bind(this)
            };
            
            // 移动端：首次用户交互后解锁音频上下文
            if (this.isMobile && this.audioContext.state === 'suspended') {
                const unlockAudio = () => {
                    this.audioContext.resume().then(() => {
                        console.log('音频已解锁');
                        document.removeEventListener('touchstart', unlockAudio);
                        document.removeEventListener('click', unlockAudio);
                    });
                };
                document.addEventListener('touchstart', unlockAudio, { once: true });
                document.addEventListener('click', unlockAudio, { once: true });
            }
        } catch (e) {
            console.warn('音频初始化失败，游戏将静音运行', e);
            this.audioContext = null;
            this.sounds = {
                shoot: () => {},
                hit: () => {},
                explosion: () => {},
                combo: () => {}
            };
        }
    }
    
    // 创建射击音效
    createShootSound() {
        if (!this.audioContext) return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    // 创建击中音效
    createHitSound() {
        if (!this.audioContext) return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    // 创建爆炸音效
    createExplosionSound() {
        if (!this.audioContext) return;
        const bufferSize = this.audioContext.sampleRate * 0.5;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        noise.start(this.audioContext.currentTime);
        noise.stop(this.audioContext.currentTime + 0.5);
    }
    
    // 创建连击音效
    createComboSound() {
        if (!this.audioContext) return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440 * (1 + this.combo * 0.1), this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    start() {
        document.getElementById('startScreen').classList.add('hidden');
        this.isPlaying = true;
        this.lastTime = performance.now();
        this.spawnTarget();
        this.gameLoop();
        this.startTimer();
    }
    
    restart() {
        this.score = 0;
        this.timer = CONFIG.GAME_DURATION;
        this.combo = 0;
        this.maxCombo = 0;
        this.canShoot = true;
        this.reloadProgress = 100;
        this.missiles = [];
        this.targets = [];
        this.explosions = [];
        this.particles = [];
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.totalKills = 0;
        
        document.getElementById('gameOverScreen').classList.add('hidden');
        this.start();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.isPlaying) {
                this.timer--;
                document.getElementById('timer').textContent = this.timer;
                
                if (this.timer <= 0) {
                    this.gameOver();
                }
                
                // 定期检查是否需要生成新目标
                if (this.timer % 3 === 0 && this.targets.length < CONFIG.MAX_TARGETS) {
                    this.spawnTarget();
                }
            }
        }, 1000);
    }
    
    toggleScene() {
        this.scene = this.scene === 'surface' ? 'underwater' : 'surface';
        const btn = document.getElementById('sceneToggle');
        btn.textContent = this.scene === 'surface' ? '切换到海底 🌊' : '切换到海面 ⛵';
        
        // 清除当前所有目标
        this.targets = [];
        
        // 立即生成新场景的目标
        for (let i = 0; i < 2; i++) {
            setTimeout(() => this.spawnTarget(), i * 500);
        }
        
        // 更新背景色
        this.updateBackground();
    }
    
    updateBackground() {
        if (this.scene === 'surface') {
            this.canvas.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #4682B4 50%, #1E3A5F 100%)';
        } else {
            this.canvas.style.background = 'linear-gradient(to bottom, #001f3f 0%, #003366 50%, #000d1a 100%)';
        }
    }
    
    spawnTarget() {
        if (this.targets.length >= CONFIG.MAX_TARGETS) return;
        
        const configs = this.scene === 'surface' ? CONFIG.SHIPS : CONFIG.SUBMARINES;
        const types = Object.keys(configs);
        const type = types[Math.floor(Math.random() * types.length)];
        const config = configs[type];
        
        const target = {
            type: type,
            config: config,
            x: Math.random() < 0.5 ? -config.size : this.canvas.width + config.size,
            y: this.canvas.height * 0.2 + Math.random() * (this.canvas.height * 0.3),
            direction: Math.random() < 0.5 ? 1 : -1,
            speed: config.speed,
            hits: 0,
            alpha: 1
        };
        
        // 确保方向和初始位置匹配
        if (target.x < 0) {
            target.direction = 1;
        } else {
            target.direction = -1;
        }
        
        this.targets.push(target);
    }
    
    shoot(e) {
        if (!this.isPlaying || !this.canShoot) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const targetX = e.clientX - rect.left;
        const targetY = e.clientY - rect.top;
        
        const startX = this.canvas.width / 2;
        const startY = this.canvas.height - 50;
        
        const missile = {
            x: startX,
            y: startY,
            targetX: targetX,
            targetY: targetY,
            speed: 15,
            trail: []
        };
        
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        missile.vx = (dx / distance) * missile.speed;
        missile.vy = (dy / distance) * missile.speed;
        
        this.missiles.push(missile);
        this.shotsFired++;
        this.canShoot = false;
        this.reloadProgress = 0;
        
        this.sounds.shoot();
        
        // 装填时间
        const reloadInterval = setInterval(() => {
            this.reloadProgress += (100 / CONFIG.RELOAD_TIME) * 50;
            if (this.reloadProgress >= 100) {
                this.reloadProgress = 100;
                this.canShoot = true;
                clearInterval(reloadInterval);
            }
            this.updateReloadUI();
        }, 50);
    }
    
    updateReloadUI() {
        document.getElementById('reloadBar').style.width = this.reloadProgress + '%';
        document.getElementById('reloadText').textContent = this.canShoot ? '准备发射' : '装填中...';
    }
    
    checkCollisions() {
        for (let i = this.missiles.length - 1; i >= 0; i--) {
            const missile = this.missiles[i];
            
            for (let j = this.targets.length - 1; j >= 0; j--) {
                const target = this.targets[j];
                
                const dx = missile.x - target.x;
                const dy = missile.y - target.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < target.config.size / 2) {
                    // 击中
                    this.missiles.splice(i, 1);
                    target.hits++;
                    this.shotsHit++;
                    
                    this.sounds.hit();
                    this.createHitParticles(target.x, target.y, target.config.color);
                    
                    // 检查是否击沉
                    if (target.hits >= target.config.hitsRequired) {
                        this.destroyTarget(target, j);
                    } else {
                        // 被击中后减速
                        target.speed = CONFIG.HIT_SPEED;
                    }
                    
                    break;
                }
            }
        }
    }
    
    destroyTarget(target, index) {
        this.targets.splice(index, 1);
        
        // 更新得分
        this.score += target.config.score;
        this.totalKills++;
        
        // 更新连击
        const now = Date.now();
        if (now - this.lastComboTime < 3000) {
            this.combo++;
            this.sounds.combo();
        } else {
            this.combo = 1;
        }
        this.lastComboTime = now;
        
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        
        // 连击奖励
        const comboBonus = (this.combo - 1) * 10;
        this.score += comboBonus;
        
        this.updateScore();
        
        // 创建爆炸效果
        this.createExplosion(target.x, target.y, target.config.size);
        this.sounds.explosion();
        
        // 生成新目标
        setTimeout(() => this.spawnTarget(), 1000);
    }
    
    createExplosion(x, y, size) {
        this.explosions.push({
            x: x,
            y: y,
            size: size,
            maxSize: size * 3,
            alpha: 1,
            particles: []
        });
        
        // 创建爆炸粒子（移动端减少数量以提升性能）
        const particleCount = this.isMobile ? 15 : 30;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                size: 3 + Math.random() * 5,
                color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`
            });
        }
    }
    
    createHitParticles(x, y, color) {
        const particleCount = this.isMobile ? 5 : 10;
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                size: 2 + Math.random() * 3,
                color: color
            });
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('combo').textContent = this.combo;
        
        // 检查连击是否超时
        if (Date.now() - this.lastComboTime > 3000 && this.combo > 0) {
            this.combo = 0;
            document.getElementById('combo').textContent = this.combo;
        }
    }
    
    update(deltaTime) {
        // 更新导弹
        for (let i = this.missiles.length - 1; i >= 0; i--) {
            const missile = this.missiles[i];
            missile.x += missile.vx;
            missile.y += missile.vy;
            
            // 添加尾迹
            missile.trail.push({ x: missile.x, y: missile.y });
            if (missile.trail.length > 10) {
                missile.trail.shift();
            }
            
            // 移除超出屏幕的导弹
            if (missile.x < 0 || missile.x > this.canvas.width || 
                missile.y < 0 || missile.y > this.canvas.height) {
                this.missiles.splice(i, 1);
            }
        }
        
        // 更新目标
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i];
            target.x += target.direction * target.speed;
            
            // 移除超出屏幕的目标
            if (target.x < -target.config.size - 100 || target.x > this.canvas.width + target.config.size + 100) {
                this.targets.splice(i, 1);
                setTimeout(() => this.spawnTarget(), 500);
            }
        }
        
        // 更新爆炸
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.size += 2;
            explosion.alpha -= 0.02;
            
            if (explosion.alpha <= 0) {
                this.explosions.splice(i, 1);
            }
        }
        
        // 更新粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // 重力
            particle.life -= 0.02;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        this.checkCollisions();
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制波浪效果
        this.drawWaves();
        
        // 绘制目标
        this.targets.forEach(target => this.drawTarget(target));
        
        // 绘制导弹
        this.missiles.forEach(missile => this.drawMissile(missile));
        
        // 绘制爆炸
        this.explosions.forEach(explosion => this.drawExplosion(explosion));
        
        // 绘制粒子
        this.particles.forEach(particle => this.drawParticle(particle));
        
        // 绘制发射器
        this.drawLauncher();
    }
    
    drawWaves() {
        const time = Date.now() / 1000;
        this.ctx.save();
        this.ctx.strokeStyle = this.scene === 'surface' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 100, 200, 0.2)';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            const y = this.canvas.height * 0.3 + i * 100;
            for (let x = 0; x < this.canvas.width; x += 10) {
                const wave = Math.sin((x + time * 50 * (i + 1)) / 50) * 10;
                this.ctx.lineTo(x, y + wave);
            }
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
    
    drawTarget(target) {
        this.ctx.save();
        this.ctx.globalAlpha = target.alpha;
        
        if (this.scene === 'surface') {
            // 绘制舰艇
            this.drawShip(target);
        } else {
            // 绘制潜艇
            this.drawSubmarine(target);
        }
        
        // 绘制血条
        this.drawHealthBar(target);
        
        this.ctx.restore();
    }
    
    drawShip(target) {
        const size = target.config.size;
        let imageName = null;
        
        // 根据类型选择图片
        if (target.type === 'DESTROYER') imageName = 'destroyer';
        else if (target.type === 'FRIGATE') imageName = 'frigate';
        else if (target.type === 'CARRIER') imageName = 'carrier';
        
        // 如果图片已加载，使用图片
        if (this.imagesLoaded && imageName && this.images[imageName] && this.images[imageName].complete) {
            this.ctx.save();
            this.ctx.translate(target.x, target.y);
            if (target.direction < 0) {
                this.ctx.scale(-1, 1);
            }
            this.ctx.drawImage(this.images[imageName], -size / 2, -size / 2, size, size);
            this.ctx.restore();
        } else {
            // 备用绘制方法
            this.ctx.fillStyle = target.config.color;
            
            // 船体
            this.ctx.beginPath();
            this.ctx.ellipse(target.x, target.y, size / 2, size / 4, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 船舱
            this.ctx.fillStyle = '#555';
            this.ctx.fillRect(target.x - size / 4, target.y - size / 3, size / 2, size / 3);
            
            // 烟囱或天线
            this.ctx.fillStyle = '#888';
            this.ctx.fillRect(target.x - size / 8, target.y - size / 2, size / 12, size / 4);
        }
        
        // 标记类型
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(target.config.name, target.x, target.y + size / 2 + 15);
    }
    
    drawSubmarine(target) {
        const size = target.config.size;
        let imageName = null;
        
        // 根据类型选择图片
        if (target.type === 'SMALL') imageName = 'submarineSmall';
        else if (target.type === 'MEDIUM') imageName = 'submarineMedium';
        else if (target.type === 'LARGE') imageName = 'submarineLarge';
        
        // 如果图片已加载，使用图片
        if (this.imagesLoaded && imageName && this.images[imageName] && this.images[imageName].complete) {
            this.ctx.save();
            this.ctx.translate(target.x, target.y);
            if (target.direction < 0) {
                this.ctx.scale(-1, 1);
            }
            this.ctx.drawImage(this.images[imageName], -size / 2, -size / 2, size, size);
            this.ctx.restore();
        } else {
            // 备用绘制方法
            this.ctx.fillStyle = target.config.color;
            
            // 潜艇身体
            this.ctx.beginPath();
            this.ctx.ellipse(target.x, target.y, size / 2, size / 5, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 指挥塔
            this.ctx.fillStyle = '#000080';
            this.ctx.fillRect(target.x - size / 6, target.y - size / 4, size / 3, size / 4);
            
            // 潜望镜
            this.ctx.strokeStyle = '#666';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(target.x, target.y - size / 4);
            this.ctx.lineTo(target.x, target.y - size / 2);
            this.ctx.stroke();
        }
        
        // 标记类型
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(target.config.name, target.x, target.y + size / 2 + 15);
    }
    
    drawHealthBar(target) {
        const barWidth = target.config.size;
        const barHeight = 5;
        const x = target.x - barWidth / 2;
        const y = target.y - target.config.size / 2 - 15;
        
        // 背景
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        // 血量
        const healthPercent = 1 - (target.hits / target.config.hitsRequired);
        this.ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336';
        this.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    }
    
    drawMissile(missile) {
        this.ctx.save();
        
        // 绘制尾迹
        if (missile.trail.length > 1) {
            this.ctx.strokeStyle = 'rgba(255, 100, 0, 0.5)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(missile.trail[0].x, missile.trail[0].y);
            for (let i = 1; i < missile.trail.length; i++) {
                this.ctx.lineTo(missile.trail[i].x, missile.trail[i].y);
            }
            this.ctx.stroke();
        }
        
        // 绘制导弹
        const angle = Math.atan2(missile.vy, missile.vx);
        this.ctx.translate(missile.x, missile.y);
        this.ctx.rotate(angle);
        
        // 如果图片已加载，使用图片
        if (this.imagesLoaded && this.images.missile && this.images.missile.complete) {
            this.ctx.drawImage(this.images.missile, -15, -10, 30, 20);
        } else {
            // 备用绘制方法
            // 导弹主体
            this.ctx.fillStyle = '#FF4500';
            this.ctx.beginPath();
            this.ctx.moveTo(15, 0);
            this.ctx.lineTo(-10, -5);
            this.ctx.lineTo(-10, 5);
            this.ctx.closePath();
            this.ctx.fill();
            
            // 导弹头部
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(15, 0, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 导弹尾翼
            this.ctx.fillStyle = '#8B0000';
            this.ctx.fillRect(-10, -7, 5, 3);
            this.ctx.fillRect(-10, 4, 5, 3);
        }
        
        this.ctx.restore();
    }
    
    drawExplosion(explosion) {
        this.ctx.save();
        this.ctx.globalAlpha = explosion.alpha;
        
        // 外圈
        const gradient = this.ctx.createRadialGradient(explosion.x, explosion.y, 0, explosion.x, explosion.y, explosion.size);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 100, 0, 0.8)');
        gradient.addColorStop(0.6, 'rgba(255, 0, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(explosion.x, explosion.y, explosion.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawParticle(particle) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.life;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    drawLauncher() {
        const x = this.canvas.width / 2;
        const y = this.canvas.height - 30;
        
        this.ctx.save();
        
        // 发射器基座
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 发射器
        this.ctx.fillStyle = this.canShoot ? '#4CAF50' : '#F44336';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 18, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 导弹图标
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🚀', x, y);
        
        this.ctx.restore();
    }
    
    gameLoop(timestamp = 0) {
        if (!this.isPlaying) return;
        
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.draw();
        this.updateScore();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    gameOver() {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        
        const accuracy = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;
        
        document.getElementById('finalScore').querySelector('span').textContent = this.score;
        document.getElementById('totalKills').textContent = this.totalKills;
        document.getElementById('maxCombo').textContent = this.maxCombo;
        document.getElementById('accuracy').textContent = accuracy;
        
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
}

// 初始化游戏
window.addEventListener('load', () => {
    const game = new Game();
});

