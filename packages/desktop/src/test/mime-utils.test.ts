import { describe, it, expect } from 'vitest'
import { MimeTypeUtils } from '../main/utils/mime-type-utils'

describe('MimeTypeUtils', () => {
  describe('getMimeType', () => {
    it('应该正确识别常见文件类型', () => {
      expect(MimeTypeUtils.getMimeType('test.pdf')).toBe('application/pdf')
      expect(MimeTypeUtils.getMimeType('test.jpg')).toBe('image/jpeg')
      expect(MimeTypeUtils.getMimeType('test.jpeg')).toBe('image/jpeg')
      expect(MimeTypeUtils.getMimeType('test.png')).toBe('image/png')
      expect(MimeTypeUtils.getMimeType('test.docx')).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
      expect(MimeTypeUtils.getMimeType('test.txt')).toBe('text/plain')
    })

    it('应该为未知文件类型返回默认值', () => {
      expect(MimeTypeUtils.getMimeType('test.unknown')).toBe('application/octet-stream')
      expect(MimeTypeUtils.getMimeType('test')).toBe('application/octet-stream')
    })
  })

  describe('isImageFile', () => {
    it('应该正确识别图片文件', () => {
      expect(MimeTypeUtils.isImageFile('test.jpg')).toBe(true)
      expect(MimeTypeUtils.isImageFile('test.png')).toBe(true)
      expect(MimeTypeUtils.isImageFile('test.gif')).toBe(true)
      expect(MimeTypeUtils.isImageFile('test.svg')).toBe(true)
    })

    it('应该正确识别非图片文件', () => {
      expect(MimeTypeUtils.isImageFile('test.pdf')).toBe(false)
      expect(MimeTypeUtils.isImageFile('test.txt')).toBe(false)
      expect(MimeTypeUtils.isImageFile('test.docx')).toBe(false)
    })
  })

  describe('isDocumentFile', () => {
    it('应该正确识别文档文件', () => {
      expect(MimeTypeUtils.isDocumentFile('test.pdf')).toBe(true)
      expect(MimeTypeUtils.isDocumentFile('test.docx')).toBe(true)
      expect(MimeTypeUtils.isDocumentFile('test.txt')).toBe(true)
      expect(MimeTypeUtils.isDocumentFile('test.md')).toBe(true)
    })

    it('应该正确识别非文档文件', () => {
      expect(MimeTypeUtils.isDocumentFile('test.jpg')).toBe(false)
      expect(MimeTypeUtils.isDocumentFile('test.mp4')).toBe(false)
      expect(MimeTypeUtils.isDocumentFile('test.mp3')).toBe(false)
    })
  })

  describe('isFileTypeSupported', () => {
    it('应该正确检查文件类型支持', () => {
      const supportedTypes = ['.pdf', '.doc', '.docx', '.txt']

      expect(MimeTypeUtils.isFileTypeSupported('test.pdf', supportedTypes)).toBe(true)
      expect(MimeTypeUtils.isFileTypeSupported('test.docx', supportedTypes)).toBe(true)
      expect(MimeTypeUtils.isFileTypeSupported('test.jpg', supportedTypes)).toBe(false)
    })

    it('应该支持通配符', () => {
      const supportedTypes = ['.*']

      expect(MimeTypeUtils.isFileTypeSupported('test.anything', supportedTypes)).toBe(true)
      expect(MimeTypeUtils.isFileTypeSupported('test.pdf', supportedTypes)).toBe(true)
    })
  })

  describe('getFileInfo', () => {
    it('应该返回完整的文件信息', () => {
      const info = MimeTypeUtils.getFileInfo('test.pdf')

      expect(info.extension).toBe('.pdf')
      expect(info.mimeType).toBe('application/pdf')
      expect(info.isDocument).toBe(true)
      expect(info.isImage).toBe(false)
      expect(info.isVideo).toBe(false)
      expect(info.isAudio).toBe(false)
      expect(info.isArchive).toBe(false)
    })

    it('应该正确识别图片文件信息', () => {
      const info = MimeTypeUtils.getFileInfo('test.jpg')

      expect(info.extension).toBe('.jpg')
      expect(info.mimeType).toBe('image/jpeg')
      expect(info.isImage).toBe(true)
      expect(info.isDocument).toBe(false)
    })
  })
})
