<template>
  <div class="hud">
    <div class="hud-left">
      <div class="score-display">
        <span class="label">分数</span>
        <span class="value">{{ gameStore.score }}</span>
      </div>
      <div v-if="gameStore.isAdventure" class="bonus-display">
        <span class="label">奖励分</span>
        <span class="bonus-value">{{ gameStore.bonusScore }}</span>
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
      <div v-if="gameStore.isAdventure" class="timer-display" :class="{ urgent: isTimeUrgent }">
        <span class="label">剩余时间</span>
        <span class="value">{{ formatSeconds(gameStore.adventureTimeRemaining) }}</span>
      </div>
      <div v-if="gameStore.isAdventure && gameStore.activeEffect !== 'none'" class="effect-badge" :class="gameStore.activeEffect">
        <span class="effect-icon">{{ effectIcon }}</span>
        <span class="effect-text">{{ effectText }}</span>
        <span class="effect-time">{{ formatSeconds(gameStore.effectTimeRemaining) }}</span>
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

// 剩余时间不足 15 秒时高亮告警
const isTimeUrgent = computed(() => gameStore.adventureTimeRemaining <= 15000)

const effectIcon = computed(() => (gameStore.activeEffect === 'slow' ? '🍄' : '🍌'))
const effectText = computed(() => (gameStore.activeEffect === 'slow' ? '减速中' : '翻倍中'))

function formatSeconds(ms: number): string {
  return `${Math.ceil(ms / 1000)}s`
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
.lives-display {
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.bonus-display {
  background: linear-gradient(135deg, #FF6B35, #F7B733);
  padding: 8px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(247, 147, 51, 0.35);
}

.bonus-value {
  display: block;
  font-size: 22px;
  font-weight: bold;
  color: #fff;
}

.timer-display {
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  text-align: center;
  transition: all 0.3s ease;
}

.timer-display.urgent {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  animation: timerPulse 0.8s ease-in-out infinite;
}

.timer-display.urgent .label,
.timer-display.urgent .value {
  color: #fff;
}

.effect-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.effect-badge.slow {
  background: linear-gradient(135deg, #5DADE2, #2E86C1);
}

.effect-badge.lightning {
  background: linear-gradient(135deg, #F4D03F, #F39C12);
}

.effect-icon {
  font-size: 18px;
}

.effect-text {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
}

.effect-time {
  font-size: 13px;
  font-weight: bold;
  color: #fff;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
}

@keyframes timerPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
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
</style>
