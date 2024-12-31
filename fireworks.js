const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
const fireworkSound = document.getElementById('fireworkSound');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * 15,
            y: (Math.random() - 0.5) * 15
        };
        this.alpha = 1;
        this.friction = 0.95;
        this.gravity = 0.3;
        this.life = Math.random() * 50 + 80;
        this.size = Math.random() * 3 + 2;
    }

    draw() {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
        this.life--;
    }
}

class Firework {
    constructor() {
        this.reset();
        this.particles = [];
        this.colors = [
            '255, 50, 50',
            '255, 150, 50',
            '255, 255, 50',
            '50, 255, 50',
            '50, 255, 255',
            '50, 50, 255',
            '255, 50, 255',
            '255, 255, 255'
        ];
        this.trail = [];
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.targetY = canvas.height * 0.3 + Math.random() * (canvas.height * 0.2);
        this.speed = 8;
        this.angle = Math.atan2(this.targetY - this.y, (Math.random() - 0.5) * 30);
        this.shouldExplode = false;
        this.brightness = 0.5;
        this.trail = [];
    }

    explode() {
        const particleCount = 150;
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i * Math.PI * 2) / particleCount;
            const velocity = 8 + Math.random() * 4;
            const particle = new Particle(this.x, this.y, color);
            particle.velocity.x = Math.cos(angle) * velocity;
            particle.velocity.y = Math.sin(angle) * velocity;
            this.particles.push(particle);
        }
        
        const secondColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        for (let i = 0; i < particleCount/2; i++) {
            const angle = (i * Math.PI * 2) / (particleCount/2);
            const velocity = 6 + Math.random() * 3;
            const particle = new Particle(this.x, this.y, secondColor);
            particle.velocity.x = Math.cos(angle) * velocity;
            particle.velocity.y = Math.sin(angle) * velocity;
            this.particles.push(particle);
        }

        fireworkSound.currentTime = 0;
        fireworkSound.play();
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) {
            this.trail.shift();
        }

        const dy = this.targetY - this.y;
        const dx = Math.cos(this.angle) * 50 - this.x;
        this.x += dx * 0.02;
        this.y += dy * 0.02;
        
        if (Math.abs(dy) < 10) {
            this.shouldExplode = true;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.trail[0]?.x || this.x, this.trail[0]?.y || this.y);
        for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.brightness})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness + 0.5})`;
        ctx.fill();
    }
}

class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width * 0.3;
        this.y = 0;
        this.length = Math.random() * 100 + 80;
        this.speed = Math.random() * 10 + 15;
        this.angle = Math.PI / 4 + (Math.random() * Math.PI / 8);
        this.brightness = Math.random() * 0.5 + 0.5;
        this.width = Math.random() * 2 + 1;
        this.trail = [];
        this.maxTrail = 20;
        this.alive = true;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }

        if (this.x > canvas.width || this.y > canvas.height) {
            this.alive = false;
        }
    }

    draw() {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        ctx.beginPath();
        ctx.moveTo(this.trail[0]?.x || this.x, this.trail[0]?.y || this.y);
        for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        
        const gradient = ctx.createLinearGradient(
            this.x, this.y,
            this.trail[0]?.x || this.x,
            this.trail[0]?.y || this.y
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.brightness})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.width;
        ctx.stroke();
        ctx.restore();
    }
}

let fireworks = [];
const maxFireworks = 8;
let shootingStars = [];
const maxShootingStars = 3;

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (fireworks.length < maxFireworks && Math.random() < 0.03) {
        fireworks.push(new Firework());
    }

    if (shootingStars.length < maxShootingStars && Math.random() < 0.01) {
        shootingStars.push(new ShootingStar());
    }

    shootingStars.forEach((star, index) => {
        if (!star.alive) {
            shootingStars.splice(index, 1);
            return;
        }
        star.update();
        star.draw();
    });

    fireworks.forEach((firework, index) => {
        if (firework.shouldExplode) {
            firework.explode();
            fireworks.splice(index, 1);
            return;
        }

        firework.particles.forEach((particle, particleIndex) => {
            if (particle.alpha <= 0 || particle.life <= 0) {
                firework.particles.splice(particleIndex, 1);
            } else {
                particle.update();
                particle.draw();
            }
        });

        firework.update();
        firework.draw();
    });

    updateCountdown();
    requestAnimationFrame(animate);
}

function updateCountdown() {
    const now = new Date();
    const target = new Date('2025-01-01T00:00:00');
    const diff = target - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('countdown').innerHTML = 
        `${days}天 ${hours}时 ${minutes}分 ${seconds}秒`;
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    shootingStars = [];
});

animate(); 