/**
 * 动态文案相关类型定义
 */

// 一言API响应类型
export interface HitokotoResponse {
  id: number
  uuid: string
  hitokoto: string
  type: string
  from: string
  from_who?: string
  creator: string
  creator_uid: number
  reviewer: number
  commit_from: string
  created_at: string
  length: number
}

// Quotable API响应类型
export interface QuotableResponse {
  _id: string
  content: string
  author: string
  authorSlug: string
  length: number
  tags: string[]
}

// 统一的文案数据类型
export interface Quote {
  id: string
  content: string
  author?: string
  source?: string
  category?: string
  length: number
}

// 本地fallback文案类型
export interface FallbackQuote {
  content: string
  author?: string
  source?: string
  category: 'academic' | 'research' | 'motivation' | 'wisdom'
}

// 文案分类
export type QuoteCategory = 'literature' | 'philosophy' | 'academic' | 'motivation' | 'wisdom'

// API来源
export type QuoteSource = 'hitokoto' | 'quotable' | 'fallback'
