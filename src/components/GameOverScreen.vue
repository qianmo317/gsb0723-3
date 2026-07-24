<template>
  <div class="game-over-screen">
    <div class="game-over-content">
      <h1 class="game-over-title">
        {{ gameStore.isAdventureMode ? '⚡ 冒险结束' : '🎮 游戏结束' }}
      </h1>

      <div v-if="gameStore.isAdventureMode && result" class="adventure-score">
        <span class="score-label">🏆 冒险积分</span>
        <span class="score-value adventure">{{ result.adventureScore }}</span>
      </div>

      <div class="final-score">
        <span class="score-label">{{ gameStore.isAdventureMode ? '基础得分' : '最终得分' }}</span>
        <span class="score-value">{{ gameStore.score }}</span>
      </div>

      <template v-if="gameStore.isAdventureMode && result">
        <div class="score-breakdown">
          <h4>积分明细</h4>
          <div class="breakdown-list">
            <div class="breakdown-item positive">
              <span class="breakdown-label">⏱️ 剩余时间 ({{ result.timeRemaining }}s)</span>
              <span class="breakdown-value">+{{ result.timeBonus }}</span>
            </div>
            <div class="breakdown-item positive">
              <span class="breakdown-label">❤️ 剩余生命 ({{ gameStore.lives }})</span>
              <span class="breakdown-value">+{{ result.livesBonus }}</span>
            </div>
            <div class="breakdown-item positive">
              <span class="breakdown-label">🔥 最高连击 ({{ gameStore.maxCombo }})</span>
              <span class="breakdown-value">+{{ result.comboBonus }}</span>
            </div>
            <div class="breakdown-item positive">
              <span class="breakdown-label">🍎 接住水果 ({{ gameStore.itemsCaught }})</span>
              <span class="breakdown-value">+{{ result.catchBonus }}</span>
            </div>
            <div class="breakdown-item negative">
              <span class="breakdown-label">💣 被炸弹击中 ({{ gameStore.bombsHit }})</span>
              <span class="breakdown-value">-{{ result.bombPenalty }}</span>
            </div>
          </div>
        </div>

        <div class="powerup-stats">
          <h4>道具统计</h4>
          <div class="powerup-stats-grid">
            <div class="ps-item">
              <span class="ps-emoji">🎁</span>
              <span class="ps-value">{{ result.goldChestsCaught }}</span>
            </div>
            <div class="ps-item">
              <span class="ps-emoji">🍄</span>
              <span class="ps-value">{{ result.iceMushroomsCaught }}</span>
            </div>
            <div class="ps-item">
              <span class="ps-emoji">🍌</span>
              <span class="ps-value">{{ result.lightningBananasCaught }}</span>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="stats-grid">
        <div class="stat-item">
          <span class="stat-emoji">🍎</span>
          <span class="stat-label">接住水果</span>
          <span class="stat-value">{{ gameStore.itemsCaught }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-emoji">💣</span>
          <span class="stat-label">被炸弹击中</span>
          <span class="stat-value">{{ gameStore.bombsHit }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-emoji">🔥</span>
          <span class="stat-label">最高连击</span>
          <span class="stat-value">{{ gameStore.maxCombo }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-emoji">⭐</span>
          <span class="stat-label">最高关卡</span>
          <span class="stat-value">{{ gameStore.level }}</span>
        </div>
      </div>

      <div class="time-display">
        <span class="time-label">游戏时长</span>
        <span class="time-value">{{ formatTime(gameStore.gameTime) }}</span>
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

const result = computed(() => gameStore.adventureResult)

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
  overflow-y: auto;
}

.game-over-content {
  background: rgba(255, 255, 255, 0.98);
  padding: 30px 36px;
  border-radius: 24px;
  text-align: center;
  max-width: 460px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.5s ease-out;
  margin: 20px 0;
}

.game-over-title {
  font-size: 30px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.final-score {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 12px;
}

.adventure-score {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C00 100%);
  padding: 22px;
  border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

.score-label {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 6px;
}

.score-value {
  display: block;
  font-size: 42px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.score-value.adventure {
  font-size: 48px;
}

.score-breakdown {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  text-align: left;
}

.score-breakdown h4,
.powerup-stats h4 {
  font-size: 13px;
  color: #333;
  margin: 0 0 10px;
  font-weight: 600;
  text-align: center;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
}

.breakdown-item.positive {
  color: #2e7d32;
  background: rgba(76, 175, 80, 0.08);
}

.breakdown-item.negative {
  color: #c62828;
  background: rgba(244, 67, 54, 0.08);
}

.breakdown-label {
  font-weight: 500;
}

.breakdown-value {
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.powerup-stats {
  background: #fff8e1;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}

.powerup-stats-grid {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.ps-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.ps-emoji {
  font-size: 28px;
}

.ps-value {
  font-size: 20px;
  font-weight: bold;
  color: #FF8C00;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
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
  transform: scale(1.05);
}

.stat-emoji {
  font-size: 26px;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

.time-display {
  background: #f0f0f0;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.time-label {
  display: block;
  font-size: 12px;
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
  gap: 10px;
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
