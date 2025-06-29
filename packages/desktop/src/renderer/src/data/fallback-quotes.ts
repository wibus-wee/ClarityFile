import type { FallbackQuote } from '@renderer/types/quote'

/**
 * 本地备用文案数据
 * 当API请求失败时使用，内容偏向学术研究和项目管理
 */
export const fallbackQuotes: FallbackQuote[] = [
  // 学术研究类
  {
    content: '研究的乐趣在于发现未知，而非证实已知。',
    author: '爱因斯坦',
    category: 'academic'
  },
  {
    content: '科学的进步取决于科学家的劳动和他们的发明的价值。',
    author: '巴斯德',
    category: 'academic'
  },
  {
    content: '真正的科学精神，是要从正确的批评和自我批评发展出来的。',
    author: '钱学森',
    category: 'academic'
  },
  {
    content: '学而时习之，不亦说乎？',
    author: '孔子',
    source: '论语',
    category: 'academic'
  },
  {
    content: '知识就是力量。',
    author: '培根',
    category: 'academic'
  },

  // 研究方法类
  {
    content: '假设是科学研究的起点，实验是检验假设的手段。',
    category: 'research'
  },
  {
    content: '细节决定成败，严谨成就学术。',
    category: 'research'
  },
  {
    content: '数据不会说谎，但解读数据的人可能会。',
    category: 'research'
  },
  {
    content: '好的研究问题是成功研究的一半。',
    category: 'research'
  },
  {
    content: '重复实验是科学可信度的基石。',
    category: 'research'
  },

  // 励志类
  {
    content: '成功不是终点，失败不是末日，继续前进的勇气才最可贵。',
    author: '丘吉尔',
    category: 'motivation'
  },
  {
    content: '路漫漫其修远兮，吾将上下而求索。',
    author: '屈原',
    source: '离骚',
    category: 'motivation'
  },
  {
    content: '千里之行，始于足下。',
    author: '老子',
    category: 'motivation'
  },
  {
    content: '不积跬步，无以至千里；不积小流，无以成江海。',
    author: '荀子',
    category: 'motivation'
  },
  {
    content: '天行健，君子以自强不息。',
    source: '易经',
    category: 'motivation'
  },

  // 智慧类
  {
    content: '知之者不如好之者，好之者不如乐之者。',
    author: '孔子',
    source: '论语',
    category: 'wisdom'
  },
  {
    content: '学而不思则罔，思而不学则殆。',
    author: '孔子',
    source: '论语',
    category: 'wisdom'
  },
  {
    content: '博学之，审问之，慎思之，明辨之，笃行之。',
    source: '中庸',
    category: 'wisdom'
  },
  {
    content: '纸上得来终觉浅，绝知此事要躬行。',
    author: '陆游',
    category: 'wisdom'
  },
  {
    content: '山重水复疑无路，柳暗花明又一村。',
    author: '陆游',
    category: 'wisdom'
  }
]

/**
 * 获取随机的fallback文案
 */
export function getRandomFallbackQuote(): FallbackQuote {
  const randomIndex = Math.floor(Math.random() * fallbackQuotes.length)
  return fallbackQuotes[randomIndex]
}

/**
 * 根据分类获取fallback文案
 */
export function getFallbackQuoteByCategory(category: FallbackQuote['category']): FallbackQuote {
  const categoryQuotes = fallbackQuotes.filter(quote => quote.category === category)
  if (categoryQuotes.length === 0) {
    return getRandomFallbackQuote()
  }
  const randomIndex = Math.floor(Math.random() * categoryQuotes.length)
  return categoryQuotes[randomIndex]
}
