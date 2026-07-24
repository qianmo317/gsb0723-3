import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type FruitType = 'apple' | 'orange' | 'watermelon' | 'grape' | 'strawberry' | 'bomb'
// 冒险模式新增道具，与水果/炸弹共用同一套下落物配置体系
export type PowerUpType = 'goldenChest' | 'frozenMushroom' | 'lightningBanana'
export type ItemType = FruitType | PowerUpType

export type GameMode = 'classic' | 'adventure'
// 减速与加速互斥，统一用一个效果状态表示，'none' 表示无速度效果
export type AdventureEffect = 'none' | 'slow' | 'lightning'

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

// 冒险模式常量集中管理，避免散落在各组件中
export const ADVENTURE_DURATION = 90000
export const CHEST_TIME_BONUS = 5000
export const SLOW_EFFECT_DURATION = 8000
export const LIGHTNING_EFFECT_DURATION = 8000
export const LIGHTNING_LIFE_COST = 2
// 水果始终保留的最低刷新比例，避免后期被炸弹/道具挤占到刷不出来
export const MIN_FRUIT_RATIO = 35

export interface SpawnProbabilities {
  bomb: number
  goldenChest: number
  frozenMushroom: number
  lightningBanana: number
  fruit: number
}

export interface AdventureSettlement {
  score: number
  bonusScore: number
  adventureScore: number
  powerUpsCollected: number
  timeRemaining: number
  itemsCaught: number
  bombsHit: number
  maxCombo: number
  level: number
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

  // 冒险模式专属状态，全部纳入 store 统一管理
  const gameMode = ref<GameMode>('classic')
  const adventureTimeRemaining = ref(0)
  const bonusScore = ref(0)
  const powerUpsCollected = ref(0)
  const consecutiveMisses = ref(0)
  const activeEffect = ref<AdventureEffect>('none')
  const effectTimeRemaining = ref(0)

  const isAdventure = computed(() => gameMode.value === 'adventure')

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
    return Math.max(400, 1200 - level.value * 80)
  })

  // 关卡系数：随关卡平滑上升，用于放大炸弹概率与道具刷新权重
  const levelCoefficient = computed(() => {
    return 1 + (level.value - 1) * 0.12
  })

  // 闪电香蕉激活时水果分值翻倍
  const scoreMultiplier = computed(() => {
    return activeEffect.value === 'lightning' ? 2 : 1
  })

  // 速度系数：减速时全体变慢；闪电时仅炸弹变快，水果保持原速
  const fruitSpeedFactor = computed(() => {
    if (activeEffect.value === 'slow') return 0.5
    return 1
  })

  const bombSpeedFactor = computed(() => {
    if (activeEffect.value === 'slow') return 0.5
    if (activeEffect.value === 'lightning') return 1.7
    return 1
  })

  // 炸弹权重随剩余时间平滑增加，后期用平方项加速上升，并叠加关卡系数
  // 注意：这里得到的是「原始权重」，最终占比由 spawnProbabilities 归一化决定
  const bombWeight = computed(() => {
    const elapsed = 1 - adventureTimeRemaining.value / ADVENTURE_DURATION
    const clamped = Math.min(1, Math.max(0, elapsed))
    return Math.min(55, 12 + 28 * clamped * clamped * levelCoefficient.value)
  })

  // 三种道具原始权重随剩余生命、关卡、连续漏接次数动态变化
  const powerUpWeights = computed(() => {
    const misses = consecutiveMisses.value
    const missingLives = maxLives.value - lives.value
    const levelBonus = (level.value - 1) * levelCoefficient.value

    // 金色宝箱：越挣扎（漏接多、生命少）越容易出现，提供续命时间
    const goldenChest = clampProbability(3 + misses * 1.5 + missingLives * 1.6)
    // 冰冻蘑菇：节奏越快（关卡高、连续漏接）越容易出现，帮助减速
    const frozenMushroom = clampProbability(3 + misses * 1.0 + levelBonus * 0.8)
    // 闪电香蕉：状态越好（生命足、关卡高）越容易出现，作为高风险高收益奖励
    const lightningBanana = clampProbability(3 + lives.value * 1.2 + levelBonus * 0.6 - misses * 0.5)

    return { goldenChest, frozenMushroom, lightningBanana }
  })

  // 归一化后的刷新概率：保证 bomb + 三道具 + fruit === 100，且水果保留最低比例。
  // 当炸弹与道具权重之和超过 (100 - MIN_FRUIT_RATIO) 时按比例缩放，多余份额回补给水果。
  const spawnProbabilities = computed<SpawnProbabilities>(() => {
    const bomb = bombWeight.value
    const { goldenChest, frozenMushroom, lightningBanana } = powerUpWeights.value
    const nonFruitTotal = bomb + goldenChest + frozenMushroom + lightningBanana
    const maxNonFruit = 100 - MIN_FRUIT_RATIO

    // 权重总和未超上限时保持原值，超出则等比例压缩
    const scale = nonFruitTotal > maxNonFruit ? maxNonFruit / nonFruitTotal : 1
    const scaledBomb = bomb * scale
    const scaledChest = goldenChest * scale
    const scaledMushroom = frozenMushroom * scale
    const scaledBanana = lightningBanana * scale
    const fruit = 100 - (scaledBomb + scaledChest + scaledMushroom + scaledBanana)

    return {
      bomb: scaledBomb,
      goldenChest: scaledChest,
      frozenMushroom: scaledMushroom,
      lightningBanana: scaledBanana,
      fruit
    }
  })

  // 冒险积分综合公式：累计奖励分 + 道具收集加成 + 剩余时间加成
  const adventureScore = computed(() => {
    const timeBonus = Math.floor(adventureTimeRemaining.value / 1000) * 10
    const powerUpBonus = powerUpsCollected.value * 50
    return bonusScore.value + powerUpBonus + timeBonus
  })

  function resetState() {
    score.value = 0
    lives.value = 3
    combo.value = 0
    maxCombo.value = 0
    itemsCaught.value = 0
    bombsHit.value = 0
    level.value = 1
    gameTime.value = 0
    // 彻底清除上一局的冒险状态，避免残留影响新局
    adventureTimeRemaining.value = 0
    bonusScore.value = 0
    powerUpsCollected.value = 0
    consecutiveMisses.value = 0
    activeEffect.value = 'none'
    effectTimeRemaining.value = 0
  }

  function startGame(mode: GameMode = 'classic') {
    resetState()
    gameMode.value = mode
    if (mode === 'adventure') {
      adventureTimeRemaining.value = ADVENTURE_DURATION
    }
    isPlaying.value = true
    isGameOver.value = false
    isPaused.value = false
  }

  function addScore(baseScore: number) {
    combo.value++
    if (combo.value > maxCombo.value) {
      maxCombo.value = combo.value
    }
    const finalScore = Math.round(baseScore * comboMultiplier.value * scoreMultiplier.value)
    score.value += finalScore
    itemsCaught.value++
    // 冒险模式下累计奖励分（与连击挂钩），漏接保留、被炸清零
    if (isAdventure.value) {
      bonusScore.value += combo.value
    }
    updateLevel()
    return finalScore
  }

  // 自己漏接：仅断连击，保留已得奖励分，并累计连续漏接次数
  function resetCombo() {
    combo.value = 0
    if (isAdventure.value) {
      consecutiveMisses.value++
    }
  }

  function loseLife() {
    // 闪电香蕉激活时被炸弹命中扣两点生命
    const cost = isAdventure.value && activeEffect.value === 'lightning' ? LIGHTNING_LIFE_COST : 1
    lives.value = Math.max(0, lives.value - cost)
    bombsHit.value++
    combo.value = 0
    // 连击被炸弹打断：清零奖励分
    if (isAdventure.value) {
      bonusScore.value = 0
    }
    if (lives.value <= 0) {
      endGame()
    }
  }

  // 接住道具：金色宝箱加时间，冰冻/闪电切换速度效果（互斥，最后触发者生效）
  function catchPowerUp(type: PowerUpType) {
    powerUpsCollected.value++
    itemsCaught.value++
    if (type === 'goldenChest') {
      adventureTimeRemaining.value += CHEST_TIME_BONUS
    } else if (type === 'frozenMushroom') {
      activeEffect.value = 'slow'
      effectTimeRemaining.value = SLOW_EFFECT_DURATION
    } else if (type === 'lightningBanana') {
      activeEffect.value = 'lightning'
      effectTimeRemaining.value = LIGHTNING_EFFECT_DURATION
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

  // 推进冒险倒计时，归零时结束本局（由 canvas 在非暂停时驱动）
  function tickAdventureTimer(delta: number) {
    if (!isAdventure.value) return
    adventureTimeRemaining.value = Math.max(0, adventureTimeRemaining.value - delta)
    if (adventureTimeRemaining.value <= 0) {
      endGame()
    }
  }

  // 推进速度效果计时，归零时清除效果
  function tickEffect(delta: number) {
    if (activeEffect.value === 'none') return
    effectTimeRemaining.value = Math.max(0, effectTimeRemaining.value - delta)
    if (effectTimeRemaining.value <= 0) {
      activeEffect.value = 'none'
    }
  }

  function endGame() {
    isGameOver.value = true
    isPlaying.value = false
  }

  function togglePause() {
    isPaused.value = !isPaused.value
  }

  function pauseGame() {
    if (isPlaying.value && !isPaused.value) {
      isPaused.value = true
    }
  }

  // 结算快照：直接取当前实时状态，保证与游戏过程严格一致
  function getAdventureSettlement(): AdventureSettlement {
    return {
      score: score.value,
      bonusScore: bonusScore.value,
      adventureScore: adventureScore.value,
      powerUpsCollected: powerUpsCollected.value,
      timeRemaining: adventureTimeRemaining.value,
      itemsCaught: itemsCaught.value,
      bombsHit: bombsHit.value,
      maxCombo: maxCombo.value,
      level: level.value
    }
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
    adventureTimeRemaining,
    bonusScore,
    powerUpsCollected,
    consecutiveMisses,
    activeEffect,
    effectTimeRemaining,
    isAdventure,
    comboMultiplier,
    baseSpeed,
    spawnRate,
    levelCoefficient,
    scoreMultiplier,
    fruitSpeedFactor,
    bombSpeedFactor,
    bombWeight,
    powerUpWeights,
    spawnProbabilities,
    adventureScore,
    startGame,
    addScore,
    resetCombo,
    loseLife,
    catchPowerUp,
    updateLevel,
    addGameTime,
    tickAdventureTimer,
    tickEffect,
    endGame,
    togglePause,
    pauseGame,
    getAdventureSettlement,
    setBasketX,
    setCanvasSize
  }
})

function clampProbability(value: number): number {
  return Math.min(20, Math.max(0, value))
}
