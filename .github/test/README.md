# Commit Build Finder

这个工具用于查找项目中最后一个可以成功构建的 commit，特别是当遇到特定错误（如 "Cannot add property 0, object is not extensible"）时。

**特点：**

- 🔍 **完整历史扫描**: 默认检查所有 commit 历史，直到找到第一个可构建的版本
- 📁 **完整日志保存**: 每个 commit 的构建日志都单独保存，便于详细分析
- 📦 **自动打包**: 自动创建日志压缩包，方便分享和存档
- 🎯 **精确分类**: 将 commit 分为成功、目标错误、其他错误三类

## 🚀 快速开始

### 本地使用

```bash
# 检查所有 commit（默认，推荐）
chmod +x .github/test/find-optimized.sh
./.github/test/find-optimized.sh

# 只检查最近 20 个 commit
COMMITS_TO_CHECK=20 ./.github/test/find-optimized.sh
```

### GitHub Actions 使用

1. 在 GitHub 仓库页面，点击 "Actions" 标签
2. 找到 "Find Good Commit" workflow
3. 点击 "Run workflow"
4. 配置参数：
   - **commits_to_check**: 要检查的 commit 数量（默认：0 = 所有 commit）
   - **error_message**: 要查找的错误信息（默认：Cannot add property 0, object is not extensible）
   - **branch**: 要检查的分支（默认：当前分支）
5. 点击 "Run workflow" 开始执行

## 📁 文件说明

### 脚本文件

| 文件                | 用途         | 特点                                      |
| ------------------- | ------------ | ----------------------------------------- |
| `find-optimized.sh` | 完整构建分析 | 检查所有 commit，生成详细报告和日志压缩包 |
| `find.sh`           | 原始脚本     | 旧版本，逐个回溯查找                      |

### GitHub Actions

| 文件                   | 用途                        |
| ---------------------- | --------------------------- |
| `find-good-commit.yml` | 自动化 commit 查找 workflow |

## 🔧 配置选项

### 环境变量

- `COMMITS_TO_CHECK`: 要检查的 commit 数量（默认：0 = 所有 commit）
- `ERROR_MESSAGE`: 要查找的特定错误信息
- `MAX_COMMITS`: 最大回溯 commit 数量（默认：100）

### 构建命令

默认构建命令：`pnpm desktop exec electron-vite build`

如需修改，编辑脚本中的 `BUILD_COMMAND` 变量。

## 📊 输出说明

### 脚本输出

脚本会将 commit 分为三类：

- ✅ **构建成功**: 可以正常构建的 commit
- ❌ **包含目标错误**: 包含指定错误信息的 commit
- ⚠️ **其他构建失败**: 因其他原因构建失败的 commit

### 日志文件

- **quick-find.sh**: 日志保存在 `quick_logs/` 目录
- **find-optimized.sh**: 日志保存在 `build_logs/` 目录，并自动创建压缩包
- **GitHub Actions**: 日志作为 artifact 上传（目录和压缩包两种格式），保留 30 天

日志文件命名格式：`build_<commit_hash>.log`
压缩包命名格式：`build_logs_<timestamp>.tar.gz`

每个日志文件包含：

- Commit 信息（hash、消息、日期、作者）
- 构建命令
- 完整的构建输出
- 构建结果摘要（退出码、耗时等）

## 🎯 使用场景

### 1. 开发过程中遇到构建错误

```bash
# 完整分析所有 commit 找到可构建版本
./.github/test/find-optimized.sh

# 切换到可构建的 commit
git checkout <found_commit_hash>
```

### 2. CI/CD 失败排查

使用 GitHub Actions workflow 自动分析多个 commit 的构建状态，生成详细报告。

### 3. 版本回退

当需要回退到稳定版本时，使用完整分析脚本检查所有历史 commit 的构建状态，找到最适合的稳定版本。

## 🛠️ 自定义

### 修改构建命令

编辑脚本中的 `BUILD_COMMAND` 变量：

```bash
BUILD_COMMAND="npm run build"
# 或
BUILD_COMMAND="yarn build"
# 或
BUILD_COMMAND="pnpm build"
```

### 修改错误信息

编辑脚本中的 `ERROR_MESSAGE` 变量：

```bash
ERROR_MESSAGE="Your custom error message"
```

### 添加更多检查

可以在脚本中添加更多的错误检查逻辑，例如：

```bash
# 检查特定的警告信息
if grep -q "WARNING" "$LOG_FILE"; then
  echo "发现警告信息"
fi

# 检查构建产物
if [ ! -f "dist/main.js" ]; then
  echo "构建产物缺失"
fi
```

## 🔍 故障排除

### 常见问题

1. **权限错误**

   ```bash
   chmod +x .github/test/*.sh
   ```

2. **Git 工作目录不干净**

   ```bash
   git stash  # 暂存更改
   # 或
   git commit -am "临时提交"
   ```

3. **依赖未安装**

   ```bash
   pnpm install
   ```

4. **Node.js 版本不兼容**
   检查项目的 Node.js 版本要求，使用 nvm 切换版本。

### 调试模式

在脚本开头添加 `set -x` 可以启用调试模式，显示每个命令的执行过程。

## 📈 性能优化

- **find-optimized.sh**: 完整扫描所有 commit，提供最全面的分析结果
- **GitHub Actions**: 使用缓存加速依赖安装，支持大规模 commit 历史分析
- **日志压缩**: 自动创建压缩包，减少存储空间和传输时间

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这些工具！

## 📄 许可证

与主项目保持一致。
