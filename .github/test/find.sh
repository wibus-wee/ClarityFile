#!/bin/bash

# --- 配置 ---
# 构建命令
BUILD_COMMAND="pnpm desktop exec electron-vite build"
# 我们要查找的特定错误信息
ERROR_MESSAGE="Cannot add property 0, object is not extensible"
# 日志文件目录
LOG_DIR="build_logs"
# 向前查找的commit数量
COMMITS_TO_CHECK=${COMMITS_TO_CHECK:-10}
# 最大回溯commit数量
MAX_COMMITS=${MAX_COMMITS:-100}

# --- 颜色定义 ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# --- 脚本开始 ---
echo "${BLUE}=== 开始寻找最后一个可正常构建的 Commit ===${NC}"

# 1. 创建日志目录
mkdir -p "$LOG_DIR"
echo "${YELLOW}信息：日志文件将保存在 '$LOG_DIR' 目录中${NC}"

# 2. 安全检查：确保工作目录是干净的
if ! git diff-index --quiet HEAD --; then
    echo "${RED}错误：你的工作目录有未提交的更改。请先提交或暂存更改后再运行此脚本。${NC}"
    exit 1
fi

# 3. 保存当前分支，以便最后恢复
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
ORIGINAL_COMMIT=$(git rev-parse HEAD)
echo "${YELLOW}信息：当前分支为 '$ORIGINAL_BRANCH'，commit为 $(git rev-parse --short HEAD)。脚本结束后将自动切回。${NC}"

# 4. 设置陷阱，确保无论脚本如何退出（成功、失败、Ctrl+C），都会执行清理操作
function cleanup {
  echo "${YELLOW}\n=== 正在清理并恢复状态 ===${NC}"
  echo "正在切回原始分支: $ORIGINAL_BRANCH..."
  git checkout "$ORIGINAL_BRANCH"
  echo "${GREEN}清理完成。你的工作区已恢复。${NC}"
  echo "${BLUE}所有构建日志已保存在 '$LOG_DIR' 目录中${NC}"
}
trap cleanup EXIT

# 5. 获取要检查的commit列表
echo "${YELLOW}正在获取最近 $COMMITS_TO_CHECK 个commit...${NC}"
COMMITS_TO_TEST=($(git log --format="%H" -n $COMMITS_TO_CHECK))
echo "${YELLOW}将检查 ${#COMMITS_TO_TEST[@]} 个commit${NC}"

# 4. 循环遍历 Git 历史
COMMIT_COUNT=0
while true; do
  
  CURRENT_COMMIT=$(git rev-parse --short HEAD)
  COMMIT_MESSAGE=$(git log -1 --pretty=%B | head -n 1)
  
  echo "\n${BLUE}--------------------------------------------------${NC}"
  echo "${YELLOW}正在测试 Commit ${CURRENT_COMMIT}:${NC} ${COMMIT_MESSAGE}"
  echo "${BLUE}--------------------------------------------------${NC}"

  # 运行构建命令，并将 stdout 和 stderr 都重定向到日志文件
  echo "执行构建命令: $BUILD_COMMAND"
  $BUILD_COMMAND > "$LOG_FILE" 2>&1
  BUILD_EXIT_CODE=$?

  # 检查构建结果
  if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "${GREEN}✅ 构建成功！${NC}"
    echo "${GREEN}找到了最后一个可正常构建的 Commit: ${CURRENT_COMMIT}${NC}"
    echo "Commit 信息: ${COMMIT_MESSAGE}"
    break
  else
    echo "${RED}❌ 构建失败。正在分析错误原因...${NC}"
    # 检查日志文件中是否包含我们正在寻找的特定错误
    if grep -q "$ERROR_MESSAGE" "$LOG_FILE"; then
      echo "${RED}原因：检测到 'object is not extensible' 错误。这是一个“坏”的 Commit。${NC}"
      echo "继续向更早的 Commit 查找..."
      
      # 切换到上一个 commit
      git checkout HEAD~1
      COMMIT_COUNT=$((COMMIT_COUNT + 1))
    else
      echo "${GREEN}✅ 找到了问题边界！${NC}"
      echo "这个 Commit (${CURRENT_COMMIT}) 构建失败，但*不是*因为 'object is not extensible' 错误。"
      echo "这意味着问题是在 ${YELLOW}这个 Commit 之后${NC} 引入的。"
      echo "最后一个“好的” Commit 可能是它的父 Commit。"
      git log -1 HEAD~1 --pretty=format:"%h - %s"
      break
    fi
  fi
  
  # 安全阀，防止无限循环
  if [ $COMMIT_COUNT -gt 100 ]; then
    echo "${RED}错误：已经回溯了 100 个 Commit，仍未找到。脚本中止。${NC}"
    exit 1
  fi
done

exit 0