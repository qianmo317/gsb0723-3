<template>
  <div class="game-over-screen">
    <div class="game-over-content">
      <h1 class="game-over-title">
        {{ settlement.mode === 'adventure' ? '🏁 冒险结算' : '🎮 游戏结束' }}
      </h1>

      <div v-if="settlement.endedBy === 'time' && settlement.mode === 'adventure'" class="end-badge time">
        ⏱ 时间到！
      </div>
      <div v-else class="end-badge lives">
        💔 生命耗尽
      </div>

      <div class="final-score">
        <span class="score-label">最终得分</span>
        <span class="score-value">{{ settlement.score }}</span>
      </div>

      <div v-if="settlement.mode === 'adventure'" class="adventure-score-block">
        <span class="score-label">⚡ 冒险积分</span>
        <span class="adventure-value">{{ settlement.adventureScore }}</span>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-emoji">🍎</span>
          <span class="stat-label">接住水果</span>
          <span class="stat-value">{{ settlement.itemsCaught }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-emoji">💣</span>
          <span class="stat-label">被炸弹击中</span>
          <span class="stat-value">{{ settlement.bombsHit }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-emoji">🔥</span>
          <span class="stat-label">最高连击</span>
          <span class="stat-value">{{ settlement.maxCombo }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-emoji">⭐</span>
          <span class="stat-label">最高关卡</span>
          <span class="stat-value">{{ settlement.level }}</span>
        </div>
      </div>

      <div v-if="settlement.mode === 'adventure'" class="powerup-stats">
        <div class="powerup-stat">
          <span class="emoji">🎁</span>
          <span class="num">{{ settlement.chestsCaught }}</span>
        </div>
        <div class="powerup-stat">
          <span class="emoji">🍄</span>
          <span class="num">{{ settlement.iceCaught }}</span>
        </div>
        <div class="powerup-stat">
          <span class="emoji">🍌</span>
          <span class="num">{{ settlement.lightningCaught }}</span>
        </div>
      </div>

      <div class="time-display">
        <span class="time-label">
          {{ settlement.mode === 'adventure' ? '坚持时长' : '游戏时长' }}
        </span>
        <span class="time-value">{{ formatTime(settlement.durationMs) }}</span>
      </div>

      <div class="action-buttons">
        <button class="restart-btn" @click="restartGame">
          🔄 再来一局
        </button>
        <button class="menu-btn" @click="goToMenu">
          🏠 返回主菜单
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const emit = defineEmits<{
  (e: 'restart'): void
  (e: 'menu'): void
}>()

const gameStore = useGameStore()

const settlement = computed(() => gameStore.finalSettlement)

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function restartGame() {
  emit('restart')
}

function goToMenu() {
  emit('menu')
}
</script>

<style scoped>
.game-over-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
  z-index: 100;
}

.game-over-content {
  background: rgba(255, 255, 255, 0.98);
  padding: 36px;
  border-radius: 24px;
  text-align: center;
  max-width: 460px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.5s ease-out;
}

.game-over-title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.end-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 18px;
}

.end-badge.time {
  background: linear-gradient(135deg, #4FC3F7, #29B6F6);
  color: white;
}

.end-badge.lives {
  background: linear-gradient(135deg, #FF5252, #D32F2F);
  color: white;
}

.final-score {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 22px;
  border-radius: 16px;
  margin-bottom: 12px;
}

.score-label {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 6px;
}

.score-value {
  display: block;
  font-size: 44px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.adventure-score-block {
  background: linear-gradient(135deg, #FF8F00 0%, #FF6F00 100%);
  padding: 16px;
  border-radius: 14px;
  margin-bottom: 18px;
}

.adventure-score-block .score-label {
  font-size: 13px;
}

.adventure-value {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.2s;
}

.stat-item:hover {
  transform: scale(1.03);
}

.stat-emoji {
  font-size: 26px;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

.powerup-stats {
  display: flex;
  justify-content: center;
  gap: 18px;
  padding: 12px;
  background: #FFF8E1;
  border-radius: 12px;
  margin-bottom: 14px;
}

.powerup-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.powerup-stat .emoji {
  font-size: 24px;
}

.powerup-stat .num {
  font-size: 18px;
  font-weight: bold;
  color: #E65100;
}

.time-display {
  background: #f0f0f0;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.time-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.time-value {
  display: block;
  font-size: 22px;
  font-weight: bold;
  color: #333;
  font-family: monospace;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.restart-btn,
.menu-btn {
  border: none;
  padding: 12px 22px;
  font-size: 15px;
  font-weight: bold;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.restart-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.restart-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.5);
}

.menu-btn {
  background: #f5f5f5;
  color: #666;
  border: 2px solid #e0e0e0;
}

.menu-btn:hover {
  background: #e8e8e8;
  transform: translateY(-2px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
