<template>
  <div class="hud">
    <div class="hud-left">
      <div class="score-display">
        <span class="label">{{ gameStore.isAdventureMode ? '得分' : '分数' }}</span>
        <span class="value">{{ gameStore.score }}</span>
      </div>
      <div v-if="gameStore.combo >= 3" class="combo-badge">
        <span class="combo-num">{{ gameStore.combo }}</span>
        <span class="combo-label">连击</span>
        <span v-if="gameStore.comboMultiplier > 1" class="multiplier">
          {{ gameStore.comboMultiplier }}x
        </span>
        <span v-if="gameStore.isScoreDoubled" class="multiplier lightning">
          ⚡x2
        </span>
      </div>
    </div>

    <div class="hud-center">
      <div v-if="gameStore.isAdventureMode" class="timer-display" :class="{ urgent: gameStore.timeRemainingSeconds <= 10 }">
        <span class="label">⏱️ 剩余时间</span>
        <span class="value">{{ formatTime(gameStore.timeRemainingSeconds) }}</span>
      </div>
      <div v-else class="level-display">
        <span class="label">关卡</span>
        <span class="value">{{ gameStore.level }}</span>
      </div>

      <div v-if="slowActive" class="effect-badge effect-ice">
        ❄️ 减速 {{ Math.ceil(gameStore.slowEffectRemaining / 1000) }}s
      </div>
      <div v-if="fastActive" class="effect-badge effect-lightning">
        ⚡ 狂暴 {{ Math.ceil(gameStore.fastEffectRemaining / 1000) }}s
      </div>
    </div>

    <div class="hud-right">
      <div v-if="gameStore.isAdventureMode" class="level-display">
        <span class="label">关卡</span>
        <span class="value">{{ gameStore.level }}</span>
      </div>
      <div class="lives-display">
        <span class="label">生命</span>
        <div class="hearts">
          <span
            v-for="i in gameStore.maxLives"
            :key="i"
            class="heart"
            :class="{ lost: i > gameStore.lives }"
          >
            {{ i <= gameStore.lives ? '❤️' : '🖤' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const gameStore = useGameStore()

const slowActive = computed(() => gameStore.activeSpeedEffect === 'slow')
const fastActive = computed(() => gameStore.activeSpeedEffect === 'fast')

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.hud {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 10;
  pointer-events: none;
}

.hud-left,
.hud-center,
.hud-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hud-center {
  align-items: center;
}

.hud-right {
  align-items: flex-end;
}

.score-display,
.level-display,
.lives-display,
.timer-display {
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.timer-display {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #667eea;
  min-width: 100px;
  text-align: center;
}

.timer-display.urgent {
  background: rgba(255, 80, 80, 0.95);
  border-color: #ff4444;
  animation: urgentPulse 0.8s ease-in-out infinite;
}

.timer-display.urgent .label,
.timer-display.urgent .value {
  color: white;
}

.label {
  display: block;
  font-size: 12px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.value {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.timer-display .value {
  font-family: 'Courier New', monospace;
  font-size: 30px;
}

.combo-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #FF6B35, #FF8C00);
  padding: 8px 14px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
  animation: comboGlow 0.5s ease-out;
}

.combo-num {
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.combo-label {
  font-size: 14px;
  color: white;
  opacity: 0.9;
}

.multiplier {
  font-size: 14px;
  font-weight: bold;
  color: #FFD700;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
}

.multiplier.lightning {
  color: #fff;
  background: rgba(255, 200, 0, 0.6);
}

.effect-badge {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: bold;
  color: white;
  animation: effectPulse 1s ease-in-out infinite;
}

.effect-ice {
  background: linear-gradient(135deg, #4FC3F7, #0288D1);
  box-shadow: 0 4px 15px rgba(79, 195, 247, 0.5);
}

.effect-lightning {
  background: linear-gradient(135deg, #FFD54F, #FF8F00);
  box-shadow: 0 4px 15px rgba(255, 143, 0, 0.5);
}

.hearts {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.heart {
  font-size: 24px;
  transition: all 0.3s ease;
}

.heart.lost {
  opacity: 0.3;
  filter: grayscale(1);
}

@keyframes comboGlow {
  0% {
    transform: scale(0.8);
    box-shadow: 0 0 20px rgba(255, 107, 53, 0.8);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
  }
}

@keyframes urgentPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes effectPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
