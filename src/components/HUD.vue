<template>
  <div class="hud">
    <div class="hud-left">
      <div class="score-display">
        <span class="label">分数</span>
        <span class="value">{{ gameStore.currentScore }}</span>
      </div>
      <div v-if="gameStore.isAdventure" class="adventure-score-display">
        <span class="label">冒险积分</span>
        <span class="value adv">{{ gameStore.adventureScore }}</span>
      </div>
      <div v-if="gameStore.combo >= 3" class="combo-badge">
        <span class="combo-num">{{ gameStore.combo }}</span>
        <span class="combo-label">连击</span>
        <span v-if="gameStore.comboMultiplier > 1" class="multiplier">
          {{ gameStore.comboMultiplier }}x
        </span>
      </div>
    </div>

    <div class="hud-center">
      <div class="level-display">
        <span class="label">关卡</span>
        <span class="value">{{ gameStore.level }}</span>
      </div>
      <div v-if="gameStore.isAdventure" class="timer-display" :class="{ urgent: timeLeftSec <= 10 }">
        <span class="label">⏱ 剩余时间</span>
        <span class="value">{{ formatTime(gameStore.timeLeft) }}</span>
      </div>
      <div v-if="effectBadge" class="effect-badge" :class="effectBadge.kind">
        <span class="effect-emoji">{{ effectBadge.emoji }}</span>
        <span class="effect-text">{{ effectBadge.text }}</span>
        <span class="effect-time">{{ effectTimeLeft.toFixed(1) }}s</span>
      </div>
    </div>

    <div class="hud-right">
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

const timeLeftSec = computed(() => Math.max(0, Math.ceil(gameStore.timeLeft / 1000)))

const effectTimeLeft = computed(() => {
  if (!gameStore.activeEffect) return 0
  return Math.max(0, gameStore.activeEffect.remainingMs / 1000)
})

const effectBadge = computed(() => {
  if (!gameStore.activeEffect) return null
  if (gameStore.activeEffect.kind === 'slow') {
    return { kind: 'slow', emoji: '🍄', text: '冰冻减速' }
  }
  return { kind: 'fast', emoji: '🍌', text: '闪电狂暴' }
})

function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
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
.timer-display,
.adventure-score-display {
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.timer-display {
  background: linear-gradient(135deg, #4FC3F7, #29B6F6);
  color: white;
  min-width: 120px;
  text-align: center;
}

.timer-display.urgent {
  background: linear-gradient(135deg, #FF5252, #D32F2F);
  animation: urgentPulse 0.6s ease-in-out infinite;
}

.timer-display .label {
  color: rgba(255, 255, 255, 0.9);
}

.timer-display .value {
  color: white;
  font-family: monospace;
}

.adventure-score-display {
  background: linear-gradient(135deg, #FFB300, #FF8F00);
  color: white;
}

.adventure-score-display .label {
  color: rgba(255, 255, 255, 0.9);
}

.adventure-score-display .value.adv {
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

.effect-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.effect-badge.slow {
  background: linear-gradient(135deg, #4FC3F7, #0288D1);
  color: white;
}

.effect-badge.fast {
  background: linear-gradient(135deg, #FFEB3B, #FBC02D);
  color: #5D4037;
}

.effect-emoji {
  font-size: 20px;
}

.effect-text {
  font-size: 13px;
}

.effect-time {
  font-size: 13px;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
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
    transform: scale(1.06);
  }
}
</style>
