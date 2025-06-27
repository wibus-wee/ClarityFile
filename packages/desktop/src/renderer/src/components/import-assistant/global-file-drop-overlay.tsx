import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 全局文件拖拽覆盖层组件
 * 显示拖拽时的视觉反馈
 */
export function GlobalFileDropOverlay() {
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const checkDraggingState = () => {
      setIsDragging(document.body.classList.contains('file-dragging'))
    }

    // 监听 body 类变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkDraggingState()
        }
      })
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    })

    // 初始检查
    checkDraggingState()

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <AnimatePresence>
        {isDragging && (
          <div className="file-drop-overlay">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex flex-col items-center justify-center"
            >
              {/* SF Symbols 风格的上传图标 */}
              <svg
                className="file-drop-icon"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* 文档背景 */}
                <rect
                  x="16"
                  y="20"
                  width="32"
                  height="28"
                  rx="4"
                  fill="currentColor"
                  fillOpacity="0.1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                />

                {/* 上传箭头 */}
                <path
                  d="M32 36V16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.7"
                />
                <path
                  d="M26 22L32 16L38 22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.7"
                />

                {/* 底部线条 */}
                <path
                  d="M24 40H40"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeOpacity="0.4"
                />
              </svg>
              <div className="file-drop-text">拖拽文件到此处</div>
              <div className="file-drop-subtitle">松开鼠标以开始导入</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
