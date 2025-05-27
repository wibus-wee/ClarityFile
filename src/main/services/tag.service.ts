import { db } from '../db'
import { tags } from '../../db/schema'
import type { CreateTagInput } from '../types/inputs'

export class TagService {
  // 获取所有标签
  static async getTags() {
    const result = await db.select().from(tags).orderBy(tags.name)
    return result
  }

  // 创建标签
  static async createTag(input: CreateTagInput) {
    const result = await db.insert(tags).values(input).returning()
    return result[0]
  }
}
