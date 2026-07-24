<template>
  <div class="start-screen">
    <div class="start-content">
      <h1 class="game-title">
        <span class="title-fruit">🍎</span>
        接水果大作战
        <span class="title-fruit">🍊</span>
      </h1>

      <p class="game-subtitle">接住水果，躲避炸弹！</p>

      <div class="mode-selector">
        <button
          class="mode-btn"
          :class="{ active: selectedMode === 'classic' }"
          @click="selectedMode = 'classic'"
        >
          <span class="mode-icon">🎮</span>
          <span class="mode-name">经典模式</span>
          <span class="mode-desc">无限时间，接水果闯关</span>
        </button>
        <button
          class="mode-btn adventure"
          :class="{ active: selectedMode === 'adventure' }"
          @click="selectedMode = 'adventure'"
        >
          <span class="mode-icon">⚡</span>
          <span class="mode-name">限时冒险</span>
          <span class="mode-desc">90秒冲刺，冒险积分挑战</span>
        </button>
      </div>

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

      <div v-if="selectedMode === 'adventure'" class="powerup-legend">
        <h3>⚡ 冒险道具</h3>
        <div class="powerup-list">
          <div class="powerup-item">
            <span class="powerup-emoji">🎁</span>
            <div class="powerup-info">
              <span class="powerup-name">金色宝箱</span>
              <span class="powerup-desc">接住增加 5 秒时间</span>
            </div>
          </div>
          <div class="powerup-item">
            <span class="powerup-emoji">🍄</span>
            <div class="powerup-info">
              <span class="powerup-name">冰冻蘑菇</span>
              <span class="powerup-desc">减速 8 秒，轻松接水果</span>
            </div>
          </div>
          <div class="powerup-item">
            <span class="powerup-emoji">🍌</span>
            <div class="powerup-info">
              <span class="powerup-name">闪电香蕉</span>
              <span class="powerup-desc">水果双倍积分 8 秒，但炸弹变快且被炸扣 2 ❤️</span>
            </div>
          </div>
        </div>
        <p class="powerup-tip">💡 减速与加速效果互斥，以最后吃到的为准</p>
      </div>

      <div class="combo-tip">
        <p>💡 连续接住水果可触发连击加分！被炸弹击中会清零连击奖励分，漏接水果保留已得奖励分</p>
      </div>

      <button class="start-btn" @click="startGame">
        {{ selectedMode === 'adventure' ? '⚡ 开始冒险' : '🎮 开始游戏' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../stores/game'
import type { GameMode } from '../stores/game'

const gameStore = useGameStore()
const selectedMode = ref<GameMode>('classic')

function startGame() {
  gameStore.startGame(selectedMode.value)
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
}

.start-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px 40px;
  border-radius: 24px;
  text-align: center;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.5s ease-out;
  margin: 20px 0;
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

.mode-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 10px;
  border: 2px solid #e0e0e0;
  border-radius: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.mode-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.mode-btn.adventure.active {
  border-color: #FF8C00;
  background: linear-gradient(135deg, #FF6B35, #FF8C00);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.mode-icon {
  font-size: 28px;
}

.mode-name {
  font-size: 16px;
  font-weight: bold;
}

.mode-desc {
  font-size: 11px;
  opacity: 0.8;
}

.instructions,
.fruit-legend,
.powerup-legend {
  text-align: left;
  margin-bottom: 16px;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
}

.instructions h3,
.fruit-legend h3,
.powerup-legend h3 {
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
  padding: 6px;
  background: white;
  border-radius: 8px;
  transition: transform 0.2s;
}

.legend-item:hover {
  transform: scale(1.1);
}

.legend-item.bomb {
  background: #ffebee;
}

.legend-item .emoji {
  font-size: 26px;
}

.legend-item .score {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.powerup-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.powerup-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: white;
  border-radius: 10px;
}

.powerup-emoji {
  font-size: 28px;
  flex-shrink: 0;
}

.powerup-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.powerup-name {
  font-size: 13px;
  font-weight: bold;
  color: #333;
}

.powerup-desc {
  font-size: 11px;
  color: #666;
}

.powerup-tip {
  margin: 8px 0 0;
  font-size: 11px;
  color: #888;
  text-align: center;
}

.combo-tip {
  background: linear-gradient(135deg, #FF6B35, #FF8C00);
  padding: 10px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.combo-tip p {
  color: white;
  font-size: 12px;
  margin: 0;
  line-height: 1.5;
}

.start-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 40px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  width: 100%;
}

.start-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
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
