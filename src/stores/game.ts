import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type GameMode = 'classic' | 'adventure'
export type ItemType = 'apple' | 'orange' | 'watermelon' | 'grape' | 'strawberry' | 'bomb' | 'goldChest' | 'iceMushroom' | 'lightningBanana'
export type SpeedEffect = 'none' | 'slow' | 'fast'

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

export interface ItemSpawnProbabilities {
  fruit: number
  bomb: number
  goldChest: number
  iceMushroom: number
  lightningBanana: number
}

export interface AdventureResult {
  totalScore: number
  adventureScore: number
  timeBonus: number
  livesBonus: number
  comboBonus: number
  catchBonus: number
  bombPenalty: number
  timeRemaining: number
  goldChestsCaught: number
  iceMushroomsCaught: number
  lightningBananasCaught: number
}

const ADVENTURE_DURATION_MS = 90_000
const SLOW_EFFECT_DURATION_MS = 8_000
const FAST_EFFECT_DURATION_MS = 8_000
const GOLD_CHEST_TIME_BONUS_S = 5
const SLOW_SPEED_MULTIPLIER = 0.5
const FAST_SPEED_MULTIPLIER = 1.5
const FAST_BOMB_SPEED_MULTIPLIER = 1.8
const FAST_FRUIT_SCORE_MULTIPLIER = 2
const ADVENTURE_BASE_BOMB_PROB = 0.10
const ADVENTURE_MAX_BOMB_PROB = 0.35

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

  const comboBonusScore = ref(0)

  const timeRemaining = ref(ADVENTURE_DURATION_MS)

  const activeSpeedEffect = ref<SpeedEffect>('none')
  const speedEffectEndTime = ref(0)
  const isScoreDoubled = ref(false)

  const consecutiveMisses = ref(0)

  const goldChestsCaught = ref(0)
  const iceMushroomsCaught = ref(0)
  const lightningBananasCaught = ref(0)

  const adventureResult = ref<AdventureResult | null>(null)

  const comboMultiplier = computed(() => {
    if (combo.value >= 20) return 4
    if (combo.value >= 15) return 3
    if (combo.value >= 10) return 2.5
    if (combo.value >= 5) return 2
    if (combo.value >= 3) return 1.5
    return 1
  })

  const baseSpeed = computed(() => {
    return 2 + level.value * 0.3
  })

  const spawnRate = computed(() => {
    const base = Math.max(400, 1200 - level.value * 80)
    if (gameMode.value === 'adventure') {
      const elapsed = ADVENTURE_DURATION_MS - timeRemaining.value
      const progress = Math.min(1, elapsed / ADVENTURE_DURATION_MS)
      return Math.max(280, base - progress * 200)
    }
    return base
  })

  const isAdventureMode = computed(() => gameMode.value === 'adventure')

  const timeRemainingSeconds = computed(() => Math.max(0, Math.ceil(timeRemaining.value / 1000)))

  const speedMultiplier = computed(() => {
    if (activeSpeedEffect.value === 'slow') return SLOW_SPEED_MULTIPLIER
    if (activeSpeedEffect.value === 'fast') return FAST_SPEED_MULTIPLIER
    return 1
  })

  const fruitScoreMultiplier = computed(() => {
    if (isScoreDoubled.value) return FAST_FRUIT_SCORE_MULTIPLIER
    return 1
  })

  const bombSpeedMultiplier = computed(() => {
    if (activeSpeedEffect.value === 'fast') return FAST_BOMB_SPEED_MULTIPLIER
    return speedMultiplier.value
  })

  const slowEffectRemaining = computed(() => {
    if (activeSpeedEffect.value !== 'slow') return 0
    return Math.max(0, speedEffectEndTime.value - performance.now())
  })

  const fastEffectRemaining = computed(() => {
    if (activeSpeedEffect.value !== 'fast') return 0
    return Math.max(0, speedEffectEndTime.value - performance.now())
  })

  const bombProbability = computed(() => {
    if (gameMode.value !== 'adventure') return 0.15
    const elapsed = ADVENTURE_DURATION_MS - timeRemaining.value
    const progress = Math.min(1, elapsed / ADVENTURE_DURATION_MS)
    const curved = Math.pow(progress, 1.4)
    return ADVENTURE_BASE_BOMB_PROB + (ADVENTURE_MAX_BOMB_PROB - ADVENTURE_BASE_BOMB_PROB) * curved
  })

  const itemSpawnProbabilities = computed<ItemSpawnProbabilities>(() => {
    if (gameMode.value !== 'adventure') {
      return { fruit: 0.85, bomb: 0.15, goldChest: 0, iceMushroom: 0, lightningBanana: 0 }
    }

    const bombP = bombProbability.value

    const livesFactor = 1 - lives.value / maxLives.value
    const levelFactor = Math.min(1, (level.value - 1) / 10)
    const missFactor = Math.min(1, consecutiveMisses.value / 5)

    let goldChestP = 0.04 * (1 - livesFactor * 0.3) * (1 + levelFactor * 0.2)
    let iceMushroomP = 0.05 * (1 + livesFactor * 1.2) * (1 + missFactor * 1.5) * (1 + levelFactor * 0.3)
    let lightningP = 0.04 * (1 - livesFactor * 0.5) * (1 - missFactor * 0.6) * (1 + levelFactor * 0.5)

    const powerUpTotal = goldChestP + iceMushroomP + lightningP
    const maxPowerUp = 0.20
    if (powerUpTotal > maxPowerUp) {
      const scale = maxPowerUp / powerUpTotal
      goldChestP *= scale
      iceMushroomP *= scale
      lightningP *= scale
    }

    const fruitP = 1 - bombP - goldChestP - iceMushroomP - lightningP
    const minFruit = 0.4

    let finalBomb = bombP
    let finalFruit = fruitP

    if (fruitP < minFruit) {
      finalFruit = minFruit
      finalBomb = Math.max(0, 1 - minFruit - goldChestP - iceMushroomP - lightningP)
    }

    return {
      fruit: finalFruit,
      bomb: finalBomb,
      goldChest: goldChestP,
      iceMushroom: iceMushroomP,
      lightningBanana: lightningP
    }
  })

  function resetAllState() {
    score.value = 0
    lives.value = 3
    maxLives.value = 3
    combo.value = 0
    maxCombo.value = 0
    itemsCaught.value = 0
    bombsHit.value = 0
    isPlaying.value = false
    isGameOver.value = false
    isPaused.value = false
    level.value = 1
    gameTime.value = 0
    gameMode.value = 'classic'
    comboBonusScore.value = 0
    timeRemaining.value = ADVENTURE_DURATION_MS
    activeSpeedEffect.value = 'none'
    speedEffectEndTime.value = 0
    isScoreDoubled.value = false
    consecutiveMisses.value = 0
    goldChestsCaught.value = 0
    iceMushroomsCaught.value = 0
    lightningBananasCaught.value = 0
    adventureResult.value = null
  }

  function startGame(mode: GameMode = 'classic') {
    resetAllState()
    gameMode.value = mode
    isPlaying.value = true
    isGameOver.value = false
    isPaused.value = false
    if (mode === 'adventure') {
      timeRemaining.value = ADVENTURE_DURATION_MS
    }
  }

  function addScore(baseScore: number) {
    combo.value++
    if (combo.value > maxCombo.value) {
      maxCombo.value = combo.value
    }
    const multiplier = comboMultiplier.value * fruitScoreMultiplier.value
    const finalScore = Math.round(baseScore * multiplier)
    score.value += finalScore
    itemsCaught.value++

    if (comboMultiplier.value > 1) {
      const bonusPortion = Math.round(baseScore * multiplier) - Math.round(baseScore * fruitScoreMultiplier.value)
      comboBonusScore.value += Math.max(0, bonusPortion)
    }

    consecutiveMisses.value = 0
    updateLevel()
    return finalScore
  }

  function resetCombo() {
    combo.value = 0
  }

  function onFruitMiss() {
    combo.value = 0
    consecutiveMisses.value++
  }

  function loseLife(count: number = 1) {
    lives.value -= count
    bombsHit.value++

    score.value = Math.max(0, score.value - comboBonusScore.value)
    comboBonusScore.value = 0
    combo.value = 0

    if (lives.value <= 0) {
      endGame()
    }
  }

  function endGame() {
    isGameOver.value = true
    isPlaying.value = false
    clearSpeedEffects()

    if (gameMode.value === 'adventure') {
      adventureResult.value = calculateAdventureResult()
    }
  }

  function updateLevel() {
    const newLevel = Math.floor(itemsCaught.value / 10) + 1
    if (newLevel > level.value) {
      level.value = newLevel
    }
  }

  function addGameTime(delta: number) {
    gameTime.value += delta
  }

  function tickCountdown(delta: number) {
    if (gameMode.value !== 'adventure') return
    timeRemaining.value = Math.max(0, timeRemaining.value - delta)
    if (timeRemaining.value <= 0) {
      endGame()
    }
  }

  function updateEffects(now: number) {
    if (activeSpeedEffect.value !== 'none' && now >= speedEffectEndTime.value) {
      clearSpeedEffects()
    }
  }

  function activateSlowEffect() {
    const now = performance.now()
    activeSpeedEffect.value = 'slow'
    speedEffectEndTime.value = now + SLOW_EFFECT_DURATION_MS
    isScoreDoubled.value = false
    iceMushroomsCaught.value++
  }

  function activateFastEffect() {
    const now = performance.now()
    activeSpeedEffect.value = 'fast'
    speedEffectEndTime.value = now + FAST_EFFECT_DURATION_MS
    isScoreDoubled.value = true
    lightningBananasCaught.value++
  }

  function clearSpeedEffects() {
    activeSpeedEffect.value = 'none'
    speedEffectEndTime.value = 0
    isScoreDoubled.value = false
  }

  function addTimeBonus() {
    if (gameMode.value !== 'adventure') return
    timeRemaining.value += GOLD_CHEST_TIME_BONUS_S * 1000
    goldChestsCaught.value++
  }

  function calculateAdventureResult(): AdventureResult {
    const timeRemainingSec = Math.floor(timeRemaining.value / 1000)
    const timeBonus = timeRemainingSec * 10
    const livesBonus = lives.value * 500
    const comboBonus = maxCombo.value * 20
    const catchBonus = itemsCaught.value * 5
    const bombPenalty = bombsHit.value * 100

    const adventureScore = score.value + timeBonus + livesBonus + comboBonus + catchBonus - bombPenalty

    return {
      totalScore: score.value,
      adventureScore: Math.max(0, adventureScore),
      timeBonus,
      livesBonus,
      comboBonus,
      catchBonus,
      bombPenalty,
      timeRemaining: timeRemainingSec,
      goldChestsCaught: goldChestsCaught.value,
      iceMushroomsCaught: iceMushroomsCaught.value,
      lightningBananasCaught: lightningBananasCaught.value
    }
  }

  function togglePause() {
    isPaused.value = !isPaused.value
  }

  function pauseGame() {
    isPaused.value = true
  }

  function resumeGame() {
    isPaused.value = false
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
    comboBonusScore,
    timeRemaining,
    activeSpeedEffect,
    speedEffectEndTime,
    isScoreDoubled,
    consecutiveMisses,
    goldChestsCaught,
    iceMushroomsCaught,
    lightningBananasCaught,
    adventureResult,
    comboMultiplier,
    baseSpeed,
    spawnRate,
    isAdventureMode,
    timeRemainingSeconds,
    speedMultiplier,
    fruitScoreMultiplier,
    bombSpeedMultiplier,
    slowEffectRemaining,
    fastEffectRemaining,
    bombProbability,
    itemSpawnProbabilities,
    startGame,
    addScore,
    resetCombo,
    onFruitMiss,
    loseLife,
    endGame,
    updateLevel,
    addGameTime,
    tickCountdown,
    updateEffects,
    activateSlowEffect,
    activateFastEffect,
    clearSpeedEffects,
    addTimeBonus,
    togglePause,
    pauseGame,
    resumeGame,
    setBasketX,
    setCanvasSize,
    resetAllState
  }
})
