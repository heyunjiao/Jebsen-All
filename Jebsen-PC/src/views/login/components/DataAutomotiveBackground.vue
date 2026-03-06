<template>
  <div class="flow-bg" ref="containerRef">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationId: number;
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;
// Smooth mouse follow
const mouseSpeed = 0.05;

// Configuration
const PARTICLE_COUNT = 40;
const CONNECTION_DISTANCE = 150;
const WAVE_COUNT = 5;

// State
let width = 0;
let height = 0;
let time = 0;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseX: number;
  baseY: number;
  phase: number;
}

const particles: Particle[] = [];

const initParticles = () => {
  particles.length = 0;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    particles.push({
      x,
      y,
      baseX: x,
      baseY: y,
      vx: (Math.random() - 0.5) * 0.5, // Slow horizontal drift
      vy: (Math.random() - 0.5) * 0.5, // Slow vertical drift
      size: Math.random() * 2 + 1,
      phase: Math.random() * Math.PI * 2
    });
  }
};

const handleMouseMove = (e: MouseEvent) => {
  targetMouseX = e.clientX;
  targetMouseY = e.clientY;
};

const initCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initParticles();
  };

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", handleMouseMove);
  resize();

  // Initialize mouse at center
  targetMouseX = width / 2;
  targetMouseY = height / 2;
  mouseX = targetMouseX;
  mouseY = targetMouseY;

  const animate = () => {
    const isDark = document.documentElement.classList.contains("dark");

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse update
    mouseX += (targetMouseX - mouseX) * mouseSpeed;
    mouseY += (targetMouseY - mouseY) * mouseSpeed;

    time++;

    // 1. Draw Organic Waves (The "Premium" Lines)
    // Using multiple overlapping sine waves with different frequencies and gradients
    ctx.globalCompositeOperation = isDark ? "screen" : "multiply";

    for (let i = 0; i < WAVE_COUNT; i++) {
      ctx.beginPath();
      const amplitude = height * (0.05 + i * 0.02); // Varying amplitude
      const speed = 0.001 + i * 0.0005;
      const phase = i * 2;
      const yOffset = height * 0.5 + (i - WAVE_COUNT / 2) * 40; // Spread vertically

      // Gradient for line
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      if (isDark) {
        gradient.addColorStop(0, "rgba(56, 189, 248, 0)");
        gradient.addColorStop(0.5, `rgba(56, 189, 248, ${0.1 + i * 0.05})`);
        gradient.addColorStop(1, "rgba(56, 189, 248, 0)");
      } else {
        gradient.addColorStop(0, "rgba(37, 99, 235, 0)");
        gradient.addColorStop(0.5, `rgba(37, 99, 235, ${0.1 + i * 0.05})`);
        gradient.addColorStop(1, "rgba(37, 99, 235, 0)");
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1 + i * 0.5;

      for (let x = 0; x <= width; x += 5) {
        // Mouse Repulsion/Attraction influence on wave
        const distToMouseX = (x - mouseX) / width;
        const mouseInfluence = Math.exp(-Math.pow(distToMouseX * 4, 2)) * (mouseY - height / 2) * 0.5;

        const y =
          yOffset +
          Math.sin(x * 0.003 + time * speed + phase) * amplitude +
          Math.cos(x * 0.01 - time * speed) * (amplitude * 0.3) +
          mouseInfluence * 0.2; // Subtle interaction

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 2. Draw Connecting Particles (The "Tech" Network)
    ctx.globalCompositeOperation = "source-over";

    particles.forEach((p, i) => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges (softly)
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Mouse interact
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 300) {
        const force = (300 - dist) / 300;
        p.x += dx * force * 0.05;
        p.y += dy * force * 0.05;
      }

      // Draw Particle
      ctx.beginPath();
      const alpha = 0.3 + Math.sin(time * 0.02 + p.phase) * 0.2;
      ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${alpha})` : `rgba(15, 23, 42, ${alpha})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          ctx.beginPath();
          const connectionAlpha = (1 - dist / CONNECTION_DISTANCE) * 0.15;
          ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${connectionAlpha})` : `rgba(15, 23, 42, ${connectionAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    });

    animationId = requestAnimationFrame(animate);
  };

  animate();
};

onMounted(() => {
  initCanvas();
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  cancelAnimationFrame(animationId);
});
</script>

<style scoped>
.flow-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: transparent;
  z-index: 1; /* Ensure it is above the image but below content */
  overflow: hidden;
}
</style>
