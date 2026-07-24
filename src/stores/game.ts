import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type GameMode = 'classic' | 'adventure'

export type FruitType = 'apple' | 'orange' | 'watermelon' | 'grape' | 'strawberry' | 'bomb'

export type PowerUpType = 'goldenChest' | 'iceMushroom' | 'lightningBanana'

export type ItemType = FruitType | PowerUpType

export type EffectKind = 'slow' | 'fast'

export interface ActiveEffect {
  kind: EffectKind
  remainingMs: number
}

export interface FallingItem {
  id: number
  type: ItemType
  x: number
  y: number
  speed: number
  rotation: number
  rotationSpeed: number
  size: number
}

export interface FinalSettlement {
  mode: GameMode
  score: number
  adventureScore: number
  itemsCaught: number
  bombsHit: number
  maxCombo: number
  level: number
  durationMs: number
  timeLeftMs: number
  chestsCaught: number
  iceCaught: number
  lightningCaught: number
  endedBy: 'lives' | 'time'
}

const ADVENTURE_DURATION_MS = 90_000
const SLOW_EFFECT_MS = 8_000
const FAST_EFFECT_MS = 8_000
const GOLDEN_CHEST_BONUS_MS = 5_000
const BASE_BOMB_PROB = 0.12
const MAX_BOMB_PROB = 0.45
const BASE_POWERUP_CHANCE = 0.06
const MAX_POWERUP_CHANCE = 0.30

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export const useGameStore = defineStore('game', () => {
  const score = ref(0)
  const lives = ref(3)
  const maxLives = ref(3)
  const combo = ref(0)
  const maxCombo = ref(0)
  const itemsCaught = ref(0)
  const bombsHit = ref(0)
  const isPlaying = ref(false)
  const isGameOver = ref(false)
  const isPaused = ref(false)
  const level = ref(1)
  const gameTime = ref(0)
  const basketX = ref(0)
  const basketWidth = ref(100)
  const canvasWidth = ref(800)
  const canvasHeight = ref(600)

  const gameMode = ref<GameMode>('classic')

  const timeLeft = ref(ADVENTURE_DURATION_MS)
  const activeEffect = ref<ActiveEffect | null>(null)

  const comboBonus = ref(0)

  const adventureBaseScore = ref(0)
  const chestsCaught = ref(0)
  const iceCaught = ref(0)
  const lightningCaught = ref(0)
  const missStreak = ref(0)
  const endReason = ref<'lives' | 'time'>('lives')

  const isAdventure = computed(() => gameMode.value === 'adventure')

  const comboMultiplier = computed(() => {
    if (combo.value >= 20) return 4
    if (combo.value >= 15) return 3
    if (combo.value >= 10) return 2.5
    if (combo.value >= 5) return 2
    if (combo.value >= 3) return 1.5
    return 1
  })

  const lightningActive = computed(() => activeEffect.value?.kind === 'fast')
  const iceActive = computed(() => activeEffect.value?.kind === 'slow')

  const levelFactor = computed(() => 1 + (level.value - 1) * 0.15)

  const timeProgress = computed(() => {
    if (!isAdventure.value) return 0
    return clamp(1 - timeLeft.value / ADVENTURE_DURATION_MS, 0, 1)
  })

  const baseSpeed = computed(() => {
    const classicBase = 2 + level.value * 0.3
    if (!isAdventure.value) return classicBase
    return 2 + level.value * 0.3 + timeProgress.value * 2.2
  })

  const spawnRate = computed(() => {
    if (!isAdventure.value) {
      return Math.max(400, 1200 - level.value * 80)
    }
    const base = 1100 - timeProgress.value * 500
    return Math.max(280, base - level.value * 30)
  })

  const bombProbability = computed(() => {
    if (!isAdventure.value) return 0.15
    const growth = Math.pow(timeProgress.value, 1.5)
    const prob = BASE_BOMB_PROB + growth * (MAX_BOMB_PROB - BASE_BOMB_PROB)
    return clamp(prob, BASE_BOMB_PROB, MAX_BOMB_PROB)
  })

  const powerUpChance = computed(() => {
    if (!isAdventure.value) return 0
    const lifeBonus = (maxLives.value - lives.value) * 0.03
    const levelBonus = (level.value - 1) * 0.01
    const missBonus = Math.max(0, missStreak.value - 2) * 0.02
    return clamp(BASE_POWERUP_CHANCE + lifeBonus + levelBonus + missBonus, BASE_POWERUP_CHANCE, MAX_POWERUP_CHANCE)
  })

  const powerUpWeights = computed(() => {
    if (!isAdventure.value) return { chest: 1, ice: 1, lightning: 1 }
    if (lives.value <= 1) return { chest: 3, ice: 1, lightning: 1 }
    if (lives.value === 2) return { chest: 2, ice: 1, lightning: 1 }
    if (missStreak.value >= 3) return { chest: 2, ice: 2, lightning: 1 }
    return { chest: 1, ice: 1, lightning: 1 }
  })

  const fruitSpeedMultiplier = computed(() => {
    if (iceActive.value) return 0.5
    return 1
  })

  const bombSpeedMultiplier = computed(() => {
    if (iceActive.value) return 0.5
    if (lightningActive.value) return 1.5
    return 1
  })

  const fruitScoreMultiplier = computed(() => {
    return lightningActive.value ? 2 : 1
  })

  const bombDamage = computed(() => {
    return lightningActive.value ? 2 : 1
  })

  const currentScore = computed(() => {
    if (isAdventure.value) {
      return score.value + comboBonus.value
    }
    return score.value
  })

  const adventureScore = computed(() => {
    if (!isAdventure.value) return 0
    const timeBonusSec = Math.max(0, Math.floor(timeLeft.value / 1000))
    const timeBonus = timeBonusSec * 3
    const lifeBonus = lives.value * 100
    const comboBonusScore = maxCombo.value * 20
    const levelBonus = level.value * 50
    const powerUpBonus = chestsCaught.value * 80 + iceCaught.value * 50 + lightningCaught.value * 60
    return adventureBaseScore.value + timeBonus + lifeBonus + comboBonusScore + levelBonus + powerUpBonus
  })

  const finalSettlement = computed<FinalSettlement>(() => ({
    mode: gameMode.value,
    score: currentScore.value,
    adventureScore: adventureScore.value,
    itemsCaught: itemsCaught.value,
    bombsHit: bombsHit.value,
    maxCombo: maxCombo.value,
    level: level.value,
    durationMs: isAdventure.value
      ? ADVENTURE_DURATION_MS - Math.max(0, timeLeft.value)
      : gameTime.value,
    timeLeftMs: Math.max(0, timeLeft.value),
    chestsCaught: chestsCaught.value,
    iceCaught: iceCaught.value,
    lightningCaught: lightningCaught.value,
    endedBy: endReason.value
  }))

  function resetState(mode: GameMode) {
    score.value = 0
    lives.value = 3
    maxLives.value = 3
    combo.value = 0
    maxCombo.value = 0
    itemsCaught.value = 0
    bombsHit.value = 0
    isPlaying.value = true
    isGameOver.value = false
    isPaused.value = false
    level.value = 1
    gameTime.value = 0

    gameMode.value = mode
    timeLeft.value = ADVENTURE_DURATION_MS
    activeEffect.value = null
    comboBonus.value = 0
    adventureBaseScore.value = 0
    chestsCaught.value = 0
    iceCaught.value = 0
    lightningCaught.value = 0
    missStreak.value = 0
    endReason.value = 'lives'
  }

  function startGame(mode: GameMode = 'classic') {
    resetState(mode)
  }

  function addScore(baseScore: number) {
    const effectiveBase = Math.round(baseScore * fruitScoreMultiplier.value)
    const multiplied = Math.round(effectiveBase * comboMultiplier.value)

    combo.value++
    if (combo.value > maxCombo.value) {
      maxCombo.value = combo.value
    }
    itemsCaught.value++
    missStreak.value = 0

    if (isAdventure.value) {
      score.value += effectiveBase
      comboBonus.value += multiplied - effectiveBase
      adventureBaseScore.value += effectiveBase
    } else {
      score.value += multiplied
    }

    updateLevel()
    return multiplied
  }

  function resetCombo() {
    combo.value = 0
    if (isAdventure.value) {
      missStreak.value++
    }
  }

  function loseLife() {
    const damage = bombDamage.value
    lives.value = Math.max(0, lives.value - damage)
    bombsHit.value++
    combo.value = 0
    comboBonus.value = 0
    if (lives.value <= 0) {
      endReason.value = 'lives'
      isGameOver.value = true
      isPlaying.value = false
    }
  }

  function updateLevel() {
    if (isAdventure.value) return
    const newLevel = Math.floor(itemsCaught.value / 10) + 1
    if (newLevel > level.value) {
      level.value = newLevel
    }
  }

  function addGameTime(delta: number) {
    gameTime.value += delta
    if (isAdventure.value) {
      tickAdventure(delta)
    }
  }

  function tickAdventure(delta: number) {
    if (isPaused.value || isGameOver.value || !isPlaying.value) return

    timeLeft.value -= delta
    if (activeEffect.value) {
      activeEffect.value.remainingMs -= delta
      if (activeEffect.value.remainingMs <= 0) {
        activeEffect.value = null
      }
    }

    const newLevel = Math.min(20, Math.floor((ADVENTURE_DURATION_MS - timeLeft.value) / 15_000) + 1)
    if (newLevel > level.value) {
      level.value = newLevel
    }

    if (timeLeft.value <= 0) {
      timeLeft.value = 0
      endReason.value = 'time'
      isGameOver.value = true
      isPlaying.value = false
    }
  }

  function applyPowerUp(type: PowerUpType) {
    if (!isAdventure.value) return
    switch (type) {
      case 'goldenChest':
        timeLeft.value = Math.min(ADVENTURE_DURATION_MS + GOLDEN_CHEST_BONUS_MS * 3, timeLeft.value + GOLDEN_CHEST_BONUS_MS)
        chestsCaught.value++
        adventureBaseScore.value += 50
        break
      case 'iceMushroom':
        activeEffect.value = { kind: 'slow', remainingMs: SLOW_EFFECT_MS }
        iceCaught.value++
        adventureBaseScore.value += 30
        break
      case 'lightningBanana':
        activeEffect.value = { kind: 'fast', remainingMs: FAST_EFFECT_MS }
        lightningCaught.value++
        adventureBaseScore.value += 40
        break
    }
    itemsCaught.value++
  }

  function togglePause() {
    if (!isPlaying.value || isGameOver.value) return
    isPaused.value = !isPaused.value
  }

  function pauseGame() {
    if (!isPlaying.value || isGameOver.value) return
    isPaused.value = true
  }

  function setBasketX(x: number) {
    const halfBasket = basketWidth.value / 2
    if (x < halfBasket) {
      basketX.value = halfBasket
    } else if (x > canvasWidth.value - halfBasket) {
      basketX.value = canvasWidth.value - halfBasket
    } else {
      basketX.value = x
    }
  }

  function setCanvasSize(width: number, height: number) {
    canvasWidth.value = width
    canvasHeight.value = height
  }

  return {
    score,
    lives,
    maxLives,
    combo,
    maxCombo,
    itemsCaught,
    bombsHit,
    isPlaying,
    isGameOver,
    isPaused,
    level,
    gameTime,
    basketX,
    basketWidth,
    canvasWidth,
    canvasHeight,

    gameMode,
    timeLeft,
    activeEffect,
    comboBonus,
    chestsCaught,
    iceCaught,
    lightningCaught,
    missStreak,

    isAdventure,
    comboMultiplier,
    baseSpeed,
    spawnRate,
    levelFactor,
    timeProgress,
    bombProbability,
    powerUpChance,
    powerUpWeights,
    fruitSpeedMultiplier,
    bombSpeedMultiplier,
    fruitScoreMultiplier,
    bombDamage,
    lightningActive,
    iceActive,
    currentScore,
    adventureScore,
    finalSettlement,

    startGame,
    addScore,
    resetCombo,
    loseLife,
    updateLevel,
    addGameTime,
    applyPowerUp,
    togglePause,
    pauseGame,
    setBasketX,
    setCanvasSize
  }
})
