import Mock from 'mockjs'
import type { ItemType, FallingItem, ItemSpawnProbabilities } from '../stores/game'

const fruitTypes: ItemType[] = ['apple', 'orange', 'watermelon', 'grape', 'strawberry']

export interface FruitConfig {
  type: ItemType
  color: string
  score: number
  emoji: string
  name: string
}

export const fruitConfigs: Record<ItemType, FruitConfig> = {
  apple: { type: 'apple', color: '#e74c3c', score: 10, emoji: '🍎', name: '苹果' },
  orange: { type: 'orange', color: '#f39c12', score: 15, emoji: '🍊', name: '橙子' },
  watermelon: { type: 'watermelon', color: '#2ecc71', score: 25, emoji: '🍉', name: '西瓜' },
  grape: { type: 'grape', color: '#9b59b6', score: 20, emoji: '🍇', name: '葡萄' },
  strawberry: { type: 'strawberry', color: '#e91e63', score: 15, emoji: '🍓', name: '草莓' },
  bomb: { type: 'bomb', color: '#2c3e50', score: -50, emoji: '💣', name: '炸弹' },
  goldChest: { type: 'goldChest', color: '#FFD700', score: 0, emoji: '🎁', name: '金色宝箱' },
  iceMushroom: { type: 'iceMushroom', color: '#87CEEB', score: 0, emoji: '🍄', name: '冰冻蘑菇' },
  lightningBanana: { type: 'lightningBanana', color: '#FFE135', score: 0, emoji: '🍌', name: '闪电香蕉' }
}

let itemIdCounter = 0

function randomPosition(canvasWidth: number, size: number): number {
  return Mock.Random.float(size / 2 + 10, canvasWidth - size / 2 - 10)
}

function randomSpeed(baseSpeed: number, min: number, max: number): number {
  return baseSpeed * Mock.Random.float(min, max)
}

function randomRotation(): number {
  return Mock.Random.float(0, Math.PI * 2)
}

export function createRandomItem(
  canvasWidth: number,
  baseSpeed: number,
  probs?: ItemSpawnProbabilities
): FallingItem {
  const probabilities = probs ?? { fruit: 0.85, bomb: 0.15, goldChest: 0, iceMushroom: 0, lightningBanana: 0 }

  const roll = Mock.Random.float(0, 1)

  let cumulative = 0

  cumulative += probabilities.goldChest
  if (roll < cumulative) {
    return {
      id: itemIdCounter++,
      type: 'goldChest',
      x: randomPosition(canvasWidth, 42),
      y: -50,
      speed: randomSpeed(baseSpeed, 0.7, 1.0),
      rotation: randomRotation(),
      rotationSpeed: Mock.Random.float(-0.06, 0.06),
      size: 42
    }
  }

  cumulative += probabilities.iceMushroom
  if (roll < cumulative) {
    return {
      id: itemIdCounter++,
      type: 'iceMushroom',
      x: randomPosition(canvasWidth, 40),
      y: -50,
      speed: randomSpeed(baseSpeed, 0.6, 0.9),
      rotation: randomRotation(),
      rotationSpeed: Mock.Random.float(-0.08, 0.08),
      size: 40
    }
  }

  cumulative += probabilities.lightningBanana
  if (roll < cumulative) {
    return {
      id: itemIdCounter++,
      type: 'lightningBanana',
      x: randomPosition(canvasWidth, 42),
      y: -50,
      speed: randomSpeed(baseSpeed, 0.9, 1.2),
      rotation: randomRotation(),
      rotationSpeed: Mock.Random.float(-0.1, 0.1),
      size: 42
    }
  }

  cumulative += probabilities.bomb
  if (roll < cumulative) {
    return {
      id: itemIdCounter++,
      type: 'bomb',
      x: randomPosition(canvasWidth, 40),
      y: -50,
      speed: randomSpeed(baseSpeed, 0.8, 1.2),
      rotation: randomRotation(),
      rotationSpeed: Mock.Random.float(-0.1, 0.1),
      size: 40
    }
  }

  const type = fruitTypes[Mock.Random.integer(0, fruitTypes.length - 1)]

  return {
    id: itemIdCounter++,
    type,
    x: randomPosition(canvasWidth, 45),
    y: -50,
    speed: randomSpeed(baseSpeed, 0.7, 1.3),
    rotation: randomRotation(),
    rotationSpeed: Mock.Random.float(-0.05, 0.05),
    size: Mock.Random.integer(35, 55)
  }
}

export function getFruitConfig(type: ItemType): FruitConfig {
  return fruitConfigs[type]
}

export function resetItemCounter() {
  itemIdCounter = 0
}
