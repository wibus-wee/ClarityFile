import { Button, cn } from '@clarity/shadcn'
import { useDynamicQuote } from '@renderer/hooks/use-dynamic-quote'
import { AnimatePresence, motion } from 'framer-motion'
import { Quote, RefreshCw } from 'lucide-react'

export function DynamicQuoteSection() {
  const { quote, isLoading: quoteLoading, refresh: refreshQuote, isFromAPI } = useDynamicQuote()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={quote?.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0.0, 0.2, 1] // 使用与其他组件一致的缓动函数
        }}
        className="relative"
        whileHover={{ y: -1 }}
      >
        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-muted/30 via-muted/20 to-transparent p-5 transition-all duration-300 hover:border-border/80">
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-xl" />

          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Quote className="w-4 h-4 text-primary" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {quoteLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-muted/50 rounded-md animate-pulse" />
                  <div className="h-4 bg-muted/50 rounded-md w-4/5 animate-pulse" />
                  <div className="h-3 bg-muted/30 rounded-md w-2/3 animate-pulse" />
                </div>
              ) : (
                <div className="space-y-2">
                  <blockquote className="text-sm text-foreground leading-relaxed font-medium">
                    &ldquo;{quote?.content}&rdquo;
                  </blockquote>
                  {(quote?.author || quote?.source) && (
                    <cite className="text-xs text-muted-foreground not-italic flex items-center gap-1">
                      <span>—</span>
                      {quote.author && <span>{quote.author}</span>}
                      {quote.author && quote.source && <span>·</span>}
                      {quote.source && <span>《{quote.source}》</span>}
                    </cite>
                  )}
                </div>
              )}
            </div>

            {/* 刷新按钮 */}
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshQuote}
                disabled={quoteLoading}
                className={cn(
                  'h-7 w-7 p-0 text-muted-foreground hover:text-foreground',
                  'opacity-0 group-hover:opacity-100 transition-all duration-200',
                  'hover:bg-primary/10 hover:border-primary/20 border border-transparent'
                )}
              >
                <RefreshCw className={cn('w-3.5 h-3.5', quoteLoading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
