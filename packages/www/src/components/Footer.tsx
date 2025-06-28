import { motion } from 'framer-motion'
import { Github, Twitter, Mail, ExternalLink, Heart, Code, Globe, Shield } from 'lucide-react'

export function Footer() {
  const footerSections = [
    {
      title: '产品',
      links: [
        { name: '功能特性', href: '#features' },
        { name: '使用案例', href: '#use-cases' },
        { name: '更新日志', href: '#changelog' },
        { name: '路线图', href: '#roadmap' }
      ]
    },
    {
      title: '资源',
      links: [
        { name: '文档中心', href: '#docs' },
        { name: '开发指南', href: '#dev-guide' },
        { name: 'API 参考', href: '#api' },
        { name: '社区论坛', href: '#community' }
      ]
    },
    {
      title: '支持',
      links: [
        { name: '帮助中心', href: '#help' },
        { name: '联系我们', href: '#contact' },
        { name: '问题反馈', href: '#feedback' },
        { name: '贡献指南', href: '#contribute' }
      ]
    },
    {
      title: '法律',
      links: [
        { name: '隐私政策', href: '#privacy' },
        { name: '服务条款', href: '#terms' },
        { name: '开源许可', href: '#license' },
        { name: '安全政策', href: '#security' }
      ]
    }
  ]

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/wibus-wee/ClarityFile',
      icon: Github,
      color: 'hover:text-gray-600'
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/wibus_wee',
      icon: Twitter,
      color: 'hover:text-blue-500'
    },
    {
      name: 'Email',
      href: 'mailto:wibus@qq.com',
      icon: Mail,
      color: 'hover:text-green-500'
    }
  ]

  const features = [
    { icon: Shield, text: '本地化存储' },
    { icon: Code, text: '开源免费' },
    { icon: Globe, text: '跨平台支持' }
  ]

  return (
    <footer className="relative bg-muted/30 border-t border-border/50">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />

      <div className="relative">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <img src="/icon.png" alt="ClarityFile Logo" className="h-10 w-10" />
                <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  ClarityFile
                </span>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
                专为学术团队设计的智能文档管理中心，让文档管理变得简单高效。
                本地化存储，保护您的数据隐私。
              </p>

              {/* Feature Highlights */}
              <div className="space-y-3 mb-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={feature.text}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{feature.text}</span>
                    </motion.div>
                  )
                })}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      className={`p-2.5 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm text-muted-foreground transition-colors ${social.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.a>
                  )
                })}
              </div>
            </motion.div>

            {/* Links Sections */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              {footerSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: sectionIndex * 0.1 + linkIndex * 0.05
                        }}
                        viewport={{ once: true }}
                      >
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1 group"
                        >
                          {link.name}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-border/50 bg-card/30 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>© 2025 ClarityFile. Made with</span>
                <Heart className="w-4 h-4 text-red-500" />
                <span>by</span>
                <a
                  href="https://github.com/wibus-wee"
                  className="font-medium text-foreground hover:text-primary transition-colors"
                >
                  Wibus Studio
                </a>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>基于 AGPLv3 许可证开源</span>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span>Version 0.0.0 (WIP)</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
