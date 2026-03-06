<template>
  <div class="professional-background">
    <canvas ref="canvasRef" class="data-canvas"></canvas>
    <div class="content-overlay">
      <div class="brand-section">
        <h1 class="main-title">Customer 360</h1>
        <p class="subtitle">全息洞察，驱动增长</p>
      </div>
      <div class="features-section">
        <div class="feature-item" v-for="(feature, index) in features" :key="index">
          <div class="feature-icon">{{ feature.icon }}</div>
          <div class="feature-text">{{ feature.text }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number;

const features = [
  { icon: "🔗", text: "7大系统数据互通" },
  { icon: "🎯", text: "360° 客户画像" },
  { icon: "🚀", text: "智能业务洞察" }
];

// 专业的数据节点
interface DataNode {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  opacity: number;
  speed: number;
  angle: number;
}

const initCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const resizeCanvas = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // 创建网格节点
  const nodes: DataNode[] = [];
  const gridSize = 80;
  const cols = Math.ceil(canvas.width / gridSize) + 1;
  const rows = Math.ceil(canvas.height / gridSize) + 1;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      nodes.push({
        x: i * gridSize,
        y: j * gridSize,
        targetX: i * gridSize + (Math.random() - 0.5) * 20,
        targetY: j * gridSize + (Math.random() - 0.5) * 20,
        radius: 2,
        opacity: 0.15 + Math.random() * 0.15,
        speed: 0.02 + Math.random() * 0.02,
        angle: Math.random() * Math.PI * 2
      });
    }
  }

  // 数据流动的线条
  const dataFlows: Array<{ x: number; y: number; targetX: number; targetY: number; progress: number }> = [];

  // 创建7条主要数据流（代表7个系统）
  for (let i = 0; i < 7; i++) {
    const angle = (i * Math.PI * 2) / 7;
    const startRadius = Math.max(canvas.width, canvas.height) * 0.6;
    dataFlows.push({
      x: centerX + Math.cos(angle) * startRadius,
      y: centerY + Math.sin(angle) * startRadius,
      targetX: centerX,
      targetY: centerY,
      progress: Math.random()
    });
  }

  let time = 0;

  const animate = () => {
    time += 0.01;

    // 清空画布 - 使用浅色背景
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格线 - 极淡的灰色
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i < cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j < rows; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * gridSize);
      ctx.lineTo(canvas.width, j * gridSize);
      ctx.stroke();
    }

    // 绘制节点
    nodes.forEach(node => {
      // 微动画
      node.angle += node.speed;
      const offsetX = Math.cos(node.angle) * 3;
      const offsetY = Math.sin(node.angle) * 3;

      ctx.beginPath();
      ctx.arc(node.x + offsetX, node.y + offsetY, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${node.opacity})`;
      ctx.fill();
    });

    // 绘制数据流
    dataFlows.forEach((flow, index) => {
      flow.progress += 0.003;
      if (flow.progress > 1) flow.progress = 0;

      const currentX = flow.x + (flow.targetX - flow.x) * flow.progress;
      const currentY = flow.y + (flow.targetY - flow.y) * flow.progress;

      // 绘制流动的线
      ctx.beginPath();
      ctx.moveTo(flow.x, flow.y);
      ctx.lineTo(currentX, currentY);
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - flow.progress)})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制流动的点
      const gradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 6);
      gradient.addColorStop(0, `rgba(59, 130, 246, ${0.8 * (1 - flow.progress)})`);
      gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // 绘制中心的连接节点 - 代表 OneID
    const pulseSize = 60 + Math.sin(time * 2) * 8;

    // 外圈
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    const outerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
    outerGradient.addColorStop(0, "rgba(59, 130, 246, 0.05)");
    outerGradient.addColorStop(1, "rgba(59, 130, 246, 0)");
    ctx.fillStyle = outerGradient;
    ctx.fill();

    // 中圈
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(59, 130, 246, 0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 内核
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
    coreGradient.addColorStop(0, "rgba(59, 130, 246, 0.3)");
    coreGradient.addColorStop(1, "rgba(59, 130, 246, 0.1)");
    ctx.fillStyle = coreGradient;
    ctx.fill();

    // 绘制连接到中心的7条线
    dataFlows.forEach((_, index) => {
      const angle = (index * Math.PI * 2) / 7 + time * 0.2;
      const lineLength = 35;
      const startX = centerX + Math.cos(angle) * 25;
      const startY = centerY + Math.sin(angle) * 25;
      const endX = centerX + Math.cos(angle) * (25 + lineLength);
      const endY = centerY + Math.sin(angle) * (25 + lineLength);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 末端小圆点
      ctx.beginPath();
      ctx.arc(endX, endY, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(59, 130, 246, 0.5)";
      ctx.fill();
    });

    animationFrameId = requestAnimationFrame(animate);
  };

  animate();

  return () => {
    window.removeEventListener("resize", resizeCanvas);
  };
};

onMounted(() => {
  initCanvas();
});

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped lang="scss">
.professional-background {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f1f5f9 100%);

  .data-canvas {
    width: 100%;
    height: 100%;
    opacity: 0.6;
  }

  .content-overlay {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding: 60px;
    pointer-events: none;

    .brand-section {
      .main-title {
        margin: 0 0 12px;
        font-size: 52px;
        font-weight: 700;
        color: #1e293b;
        letter-spacing: -1px;
        line-height: 1.2;
      }

      .subtitle {
        margin: 0;
        font-size: 20px;
        font-weight: 400;
        color: #64748b;
        letter-spacing: 2px;
      }
    }

    .features-section {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        background: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(148, 163, 184, 0.15);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

        .feature-icon {
          font-size: 24px;
        }

        .feature-text {
          font-size: 15px;
          font-weight: 500;
          color: #475569;
        }
      }
    }
  }
}

@media screen and (max-width: 1024px) {
  .professional-background {
    .content-overlay {
      padding: 40px;

      .brand-section .main-title {
        font-size: 40px;
      }
    }
  }
}
</style>
