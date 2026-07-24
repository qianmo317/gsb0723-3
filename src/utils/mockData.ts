import Mock from 'mockjs'
import type { FruitType, PowerUpType, ItemType, FallingItem } from '../stores/game'

const fruitTypes: FruitType[] = ['apple', 'orange', 'watermelon', 'grape', 'strawberry']
const powerUpTypes: PowerUpType[] = ['goldenChest', 'iceMushroom', 'lightningBanana']

export interface FruitConfig {
  type: FruitType
  color: string
  score: number
  emoji: string
  name: string
}

export interface PowerUpConfig {
  type: PowerUpType
  color: string
  emoji: string
  name: string
  description: string
}

export const fruitConfigs: Record<FruitType, FruitConfig> = {
  apple: { type: 'apple', color: '#e74c3c', score: 10, emoji: '🍎', name: '苹果' },
  orange: { type: 'orange', color: '#f39c12', score: 15, emoji: '🍊', name: '橙子' },
  watermelon: { type: 'watermelon', color: '#2ecc71', score: 25, emoji: '🍉', name: '西瓜' },
  grape: { type: 'grape', color: '#9b59b6', score: 20, emoji: '🍇', name: '葡萄' },
  strawberry: { type: 'strawberry', color: '#e91e63', score: 15, emoji: '🍓', name: '草莓' },
  bomb: { type: 'bomb', color: '#2c3e50', score: -50, emoji: '💣', name: '炸弹' }
}

export const powerUpConfigs: Record<PowerUpType, PowerUpConfig> = {
  goldenChest: {
    type: 'goldenChest',
    color: '#FFD700',
    emoji: '🎁',
    name: '金色宝箱',
    description: '剩余时间 +5 秒'
  },
  iceMushroom: {
    type: 'iceMushroom',
    color: '#4FC3F7',
    emoji: '🍄',
    name: '冰冻蘑菇',
    description: '全体减速 8 秒'
  },
  lightningBanana: {
    type: 'lightningBanana',
    color: '#FFEB3B',
    emoji: '🍌',
    name: '闪电香蕉',
    description: '水果分×2，炸弹变快，被炸扣 2 命'
  }
}

export interface SpawnOptions {
  bombProbability?: number
  powerUpChance?: number
  powerUpWeights?: { chest: number; ice: number; lightning: number }
  adventure?: boolean
}

let itemIdCounter = 0

function pickPowerUp(weights: { chest: number; ice: number; lightning: number }): PowerUpType {
  const total = weights.chest + weights.ice + weights.lightning
  const r = Mock.Random.float(0, total)
  if (r < weights.chest) return 'goldenChest'
  if (r < weights.chest + weights.ice) return 'iceMushroom'
  return 'lightningBanana'
}

export function createRandomItem(
  canvasWidth: number,
  baseSpeed: number,
  options: SpawnOptions = {}
): FallingItem {
  const {
    bombProbability = 0.15,
    powerUpChance = 0,
    powerUpWeights = { chest: 1, ice: 1, lightning: 1 },
    adventure = false
  } = options

  const roll = Mock.Random.float(0, 100) / 100

  if (adventure && roll < powerUpChance) {
    const type = pickPowerUp(powerUpWeights)
    return {
      id: itemIdCounter++,
      type,
      x: Mock.Random.float(40, canvasWidth - 40),
      y: -50,
      speed: baseSpeed * Mock.Random.float(0.85, 1.1),
      rotation: Mock.Random.float(0, Math.PI * 2),
      rotationSpeed: Mock.Random.float(-0.08, 0.08),
      size: 46
    }
  }

  const isBomb = roll < (powerUpChance > 0 ? powerUpChance + bombProbability : bombProbability)

  if (isBomb) {
    return {
      id: itemIdCounter++,
      type: 'bomb',
      x: Mock.Random.float(40, canvasWidth - 40),
      y: -50,
      speed: baseSpeed * Mock.Random.float(0.8, 1.2),
      rotation: Mock.Random.float(0, Math.PI * 2),
      rotationSpeed: Mock.Random.float(-0.1, 0.1),
      size: 40
    }
  }

  const type = fruitTypes[Mock.Random.integer(0, fruitTypes.length - 1)]

  return {
    id: itemIdCounter++,
    type,
    x: Mock.Random.float(40, canvasWidth - 40),
    y: -50,
    speed: baseSpeed * Mock.Random.float(0.7, 1.3),
    rotation: Mock.Random.float(0, Math.PI * 2),
    rotationSpeed: Mock.Random.float(-0.05, 0.05),
    size: Mock.Random.integer(35, 55)
  }
}

export function getFruitConfig(type: FruitType): FruitConfig {
  return fruitConfigs[type]
}

export function getPowerUpConfig(type: PowerUpType): PowerUpConfig {
  return powerUpConfigs[type]
}

export function getItemConfig(type: ItemType): { emoji: string; name: string; color: string } {
  if (type === 'bomb' || fruitTypes.includes(type as FruitType)) {
    return fruitConfigs[type as FruitType]
  }
  return powerUpConfigs[type as PowerUpType]
}

export function isPowerUp(type: ItemType): type is PowerUpType {
  return (powerUpTypes as string[]).includes(type as string)
}

export function resetItemCounter() {
  itemIdCounter = 0
}
