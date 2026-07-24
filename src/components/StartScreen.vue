<template>
  <div class="start-screen">
    <div class="start-content">
      <h1 class="game-title">
        <span class="title-fruit">🍎</span>
        接水果大作战
        <span class="title-fruit">🍊</span>
      </h1>

      <p class="game-subtitle">接住水果，躲避炸弹！</p>

      <div class="instructions">
        <h3>游戏说明</h3>
        <ul>
          <li>🖱️ <strong>鼠标移动</strong> 控制篮子左右移动</li>
          <li>⌨️ <strong>方向键</strong> 或 <strong>A/D 键</strong> 控制篮子</li>
          <li>📱 <strong>触摸滑动</strong> 控制篮子（移动端）</li>
          <li>⏸️ <strong>空格键</strong> 或 <strong>ESC</strong> 暂停游戏</li>
        </ul>
      </div>

      <div class="fruit-legend">
        <h3>水果分值</h3>
        <div class="legend-grid">
          <div class="legend-item">
            <span class="emoji">🍎</span>
            <span class="score">10分</span>
          </div>
          <div class="legend-item">
            <span class="emoji">🍊</span>
            <span class="score">15分</span>
          </div>
          <div class="legend-item">
            <span class="emoji">🍓</span>
            <span class="score">15分</span>
          </div>
          <div class="legend-item">
            <span class="emoji">🍇</span>
            <span class="score">20分</span>
          </div>
          <div class="legend-item">
            <span class="emoji">🍉</span>
            <span class="score">25分</span>
          </div>
          <div class="legend-item bomb">
            <span class="emoji">💣</span>
            <span class="score">-1❤️</span>
          </div>
        </div>
      </div>

      <div class="adventure-legend">
        <h3>🎒 限时冒险道具（90秒挑战）</h3>
        <div class="legend-grid">
          <div class="legend-item powerup chest">
            <span class="emoji">🎁</span>
            <span class="score">+5秒</span>
          </div>
          <div class="legend-item powerup ice">
            <span class="emoji">🍄</span>
            <span class="score">减速8秒</span>
          </div>
          <div class="legend-item powerup lightning">
            <span class="emoji">🍌</span>
            <span class="score">分×2/炸弹快</span>
          </div>
        </div>
        <p class="adventure-tip">
          ⚠️ 闪电期间被炸扣 2 命；减速/加速互斥以最后吃到的为准；连击被炸弹打断会清零奖励分，漏接则保留。
        </p>
      </div>

      <div class="combo-tip">
        <p>💡 连续接住水果可触发连击加分！</p>
      </div>

      <div class="mode-buttons">
        <button class="start-btn classic" @click="startClassic">
          🎮 经典模式
        </button>
        <button class="start-btn adventure" @click="startAdventure">
          ⚡ 限时冒险（90秒）
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/game'

const gameStore = useGameStore()

function startClassic() {
  gameStore.startGame('classic')
}

function startAdventure() {
  gameStore.startGame('adventure')
}
</script>

<style scoped>
.start-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 100;
  overflow-y: auto;
  padding: 20px 0;
}

.start-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 32px;
  border-radius: 24px;
  text-align: center;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.5s ease-out;
}

.game-title {
  font-size: 30px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title-fruit {
  font-size: 34px;
  animation: bounce 1s ease-in-out infinite;
}

.title-fruit:last-child {
  animation-delay: 0.5s;
}

.game-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.instructions,
.fruit-legend,
.adventure-legend {
  text-align: left;
  margin-bottom: 18px;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
}

.adventure-legend {
  background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
}

.instructions h3,
.fruit-legend h3,
.adventure-legend h3 {
  font-size: 15px;
  color: #333;
  margin-bottom: 10px;
  font-weight: 600;
}

.instructions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.instructions li {
  font-size: 13px;
  color: #555;
  padding: 4px 0;
}

.instructions strong {
  color: #667eea;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.legend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  background: white;
  border-radius: 8px;
  transition: transform 0.2s;
}

.legend-item:hover {
  transform: scale(1.05);
}

.legend-item.bomb {
  background: #ffebee;
}

.legend-item.powerup.chest {
  background: #FFF8E1;
}

.legend-item.powerup.ice {
  background: #E1F5FE;
}

.legend-item.powerup.lightning {
  background: #FFFDE7;
}

.legend-item .emoji {
  font-size: 26px;
}

.legend-item .score {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  text-align: center;
}

.adventure-tip {
  font-size: 11px;
  color: #795548;
  margin: 10px 0 0;
  line-height: 1.5;
}

.combo-tip {
  background: linear-gradient(135deg, #FF6B35, #FF8C00);
  padding: 10px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.combo-tip p {
  color: white;
  font-size: 13px;
  margin: 0;
}

.mode-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.start-btn {
  color: white;
  border: none;
  padding: 14px 24px;
  font-size: 17px;
  font-weight: bold;
  border-radius: 26px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn.classic {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.start-btn.adventure {
  background: linear-gradient(135deg, #FF8F00 0%, #FF6F00 100%);
  box-shadow: 0 6px 20px rgba(255, 143, 0, 0.4);
}

.start-btn:hover {
  transform: translateY(-3px);
  filter: brightness(1.08);
}

.start-btn:active {
  transform: translateY(-1px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
