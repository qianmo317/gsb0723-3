import Mock from 'mockjs'
import type { FruitType, PowerUpType, ItemType, FallingItem } from '../stores/game'

const fruitTypes: FruitType[] = ['apple', 'orange', 'watermelon', 'grape', 'strawberry']

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
  // 冒险模式道具：与水果/炸弹共用同一套配置结构
  goldenChest: { type: 'goldenChest', color: '#FFD700', score: 0, emoji: '🎁', name: '金色宝箱' },
  frozenMushroom: { type: 'frozenMushroom', color: '#5DADE2', score: 0, emoji: '🍄', name: '冰冻蘑菇' },
  lightningBanana: { type: 'lightningBanana', color: '#F4D03F', score: 0, emoji: '🍌', name: '闪电香蕉' }
}

export const powerUpTypes: PowerUpType[] = ['goldenChest', 'frozenMushroom', 'lightningBanana']

let itemIdCounter = 0

// 经典模式沿用固定 15% 炸弹概率的随机生成逻辑
export function createRandomItem(canvasWidth: number, baseSpeed: number): FallingItem {
  const isBomb = Mock.Random.float(0, 100) < 15

  if (isBomb) {
    return buildItem('bomb', canvasWidth, baseSpeed, true)
  }

  const type = fruitTypes[Mock.Random.integer(0, fruitTypes.length - 1)]
  return buildItem(type, canvasWidth, baseSpeed, false)
}

export interface AdventureSpawnConfig {
  bomb: number
  goldenChest: number
  frozenMushroom: number
  lightningBanana: number
  fruit: number
}

// 冒险模式随机生成：概率已在 store 中归一化（bomb + 道具 + fruit === 100），
// 这里按累积区间落点即可，剩余份额必然落到水果，保证水果始终能刷出。
export function createAdventureItem(
  canvasWidth: number,
  baseSpeed: number,
  config: AdventureSpawnConfig
): FallingItem {
  const roll = Mock.Random.float(0, 100)

  let threshold = config.bomb
  if (roll < threshold) {
    return buildItem('bomb', canvasWidth, baseSpeed, true)
  }
  threshold += config.goldenChest
  if (roll < threshold) {
    return buildItem('goldenChest', canvasWidth, baseSpeed, false)
  }
  threshold += config.frozenMushroom
  if (roll < threshold) {
    return buildItem('frozenMushroom', canvasWidth, baseSpeed, false)
  }
  threshold += config.lightningBanana
  if (roll < threshold) {
    return buildItem('lightningBanana', canvasWidth, baseSpeed, false)
  }

  const type = fruitTypes[Mock.Random.integer(0, fruitTypes.length - 1)]
  return buildItem(type, canvasWidth, baseSpeed, false)
}

// 统一构建下落物，炸弹与道具的旋转/尺寸参数与原水果/炸弹保持一致
function buildItem(
  type: ItemType,
  canvasWidth: number,
  baseSpeed: number,
  isBomb: boolean
): FallingItem {
  if (isBomb) {
    return {
      id: itemIdCounter++,
      type,
      x: Mock.Random.float(40, canvasWidth - 40),
      y: -50,
      speed: baseSpeed * Mock.Random.float(0.8, 1.2),
      rotation: Mock.Random.float(0, Math.PI * 2),
      rotationSpeed: Mock.Random.float(-0.1, 0.1),
      size: 40
    }
  }

  const isPowerUp = powerUpTypes.includes(type as PowerUpType)
  return {
    id: itemIdCounter++,
    type,
    x: Mock.Random.float(40, canvasWidth - 40),
    y: -50,
    speed: baseSpeed * Mock.Random.float(0.7, 1.3),
    rotation: Mock.Random.float(0, Math.PI * 2),
    rotationSpeed: Mock.Random.float(-0.05, 0.05),
    // 道具尺寸略大以突出显示，水果保持原随机尺寸
    size: isPowerUp ? 50 : Mock.Random.integer(35, 55)
  }
}

export function getFruitConfig(type: ItemType): FruitConfig {
  return fruitConfigs[type]
}

export function isPowerUpType(type: ItemType): type is PowerUpType {
  return powerUpTypes.includes(type as PowerUpType)
}

export function resetItemCounter() {
  itemIdCounter = 0
}
