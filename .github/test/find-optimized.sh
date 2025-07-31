#!/bin/bash

# --- 配置 ---
# 构建命令
BUILD_COMMAND="pnpm desktop exec electron-vite build"
# 我们要查找的特定错误信息
ERROR_MESSAGE="Cannot add property 0, object is not extensible"
# 日志文件目录
LOG_DIR="build_logs"
# 向前查找的commit数量 - 设置为0表示检查所有commit
COMMITS_TO_CHECK=${COMMITS_TO_CHECK:-0}
# 最大回溯commit数量 - 设置为0表示无限制
MAX_COMMITS=${MAX_COMMITS:-0}

# --- 颜色定义 ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# --- 脚本开始 ---
echo "${BLUE}=== 开始寻找最后一个可正常构建的 Commit ===${NC}"

# 1. 创建日志目录
mkdir -p "$LOG_DIR"
echo "${YELLOW}信息：日志文件将保存在 '$LOG_DIR' 目录中${NC}"

# 2. 警告用户关于工作目录重置
echo "${YELLOW}警告：此脚本会强制重置工作目录更改以切换commit。${NC}"
echo "${YELLOW}如果你有重要的未提交更改，请先备份。${NC}"
if [ -z "$CI" ] && [ -z "$GITHUB_ACTIONS" ]; then
    echo "${YELLOW}按 Ctrl+C 取消，或等待 5 秒后自动继续...${NC}"
    sleep 5
fi

# 3. 保存当前分支，以便最后恢复
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
ORIGINAL_COMMIT=$(git rev-parse HEAD)
echo "${YELLOW}信息：当前分支为 '$ORIGINAL_BRANCH'，commit为 $(git rev-parse --short HEAD)。脚本结束后将自动切回。${NC}"

# 4. 设置陷阱，确保无论脚本如何退出（成功、失败、Ctrl+C），都会执行清理操作
function cleanup {
  echo "${YELLOW}\n=== 正在清理并恢复状态 ===${NC}"
  echo "正在切回原始分支: $ORIGINAL_BRANCH..."

  # 强制重置任何更改并切回原始分支
  git reset --hard HEAD --quiet 2>/dev/null || true
  git clean -fd --quiet 2>/dev/null || true
  git checkout "$ORIGINAL_BRANCH" --force --quiet 2>/dev/null || git checkout "$ORIGINAL_COMMIT" --force --quiet 2>/dev/null

  echo "${GREEN}清理完成。你的工作区已恢复。${NC}"
  echo "${BLUE}所有构建日志已保存在 '$LOG_DIR' 目录中${NC}"
}
trap cleanup EXIT

# 5. 获取要检查的commit列表
if [ $COMMITS_TO_CHECK -eq 0 ]; then
  echo "${YELLOW}正在获取所有commit历史...${NC}"
  COMMITS_TO_TEST=($(git log --format="%H"))
  echo "${YELLOW}将检查所有 ${#COMMITS_TO_TEST[@]} 个commit（从最新到最早）${NC}"
else
  echo "${YELLOW}正在获取最近 $COMMITS_TO_CHECK 个commit...${NC}"
  COMMITS_TO_TEST=($(git log --format="%H" -n $COMMITS_TO_CHECK))
  echo "${YELLOW}将检查 ${#COMMITS_TO_TEST[@]} 个commit${NC}"
fi

# 6. 循环遍历指定的commit列表
GOOD_COMMITS=()
BAD_COMMITS=()
FAILED_COMMITS=()

for i in "${!COMMITS_TO_TEST[@]}"; do
  COMMIT_HASH="${COMMITS_TO_TEST[$i]}"
  CURRENT_COMMIT=$(echo "$COMMIT_HASH" | cut -c1-7)
  
  echo "\n${BLUE}--------------------------------------------------${NC}"
  echo "${YELLOW}正在测试 Commit $((i+1))/${#COMMITS_TO_TEST[@]}: ${CURRENT_COMMIT}${NC}"
  echo "${BLUE}--------------------------------------------------${NC}"
  
  # 强制重置任何本地更改并切换到指定commit
  git reset --hard HEAD --quiet 2>/dev/null || true
  git clean -fd --quiet 2>/dev/null || true
  git checkout "$COMMIT_HASH" --force --quiet 2>/dev/null

  # 重新创建日志目录（可能在git clean时被删除）
  mkdir -p "$LOG_DIR"
  
  COMMIT_MESSAGE=$(git log -1 --pretty=%B | head -n 1)
  COMMIT_DATE=$(git log -1 --pretty=%cd --date=short)
  COMMIT_AUTHOR=$(git log -1 --pretty=%an)
  echo "Commit 信息: ${COMMIT_MESSAGE}"
  echo "日期: ${COMMIT_DATE} | 作者: ${COMMIT_AUTHOR}"
  
  # 创建以commit hash命名的日志文件
  LOG_FILE="$LOG_DIR/build_${CURRENT_COMMIT}.log"
  
  # 运行构建命令，并将 stdout 和 stderr 都重定向到日志文件
  echo "执行构建命令: $BUILD_COMMAND"
  echo "日志文件: $LOG_FILE"
  
  # 在日志文件中记录commit信息
  echo "=== Commit Information ===" > "$LOG_FILE"
  echo "Hash: $COMMIT_HASH" >> "$LOG_FILE"
  echo "Short: $CURRENT_COMMIT" >> "$LOG_FILE"
  echo "Message: $COMMIT_MESSAGE" >> "$LOG_FILE"
  echo "Date: $COMMIT_DATE" >> "$LOG_FILE"
  echo "Author: $COMMIT_AUTHOR" >> "$LOG_FILE"
  echo "Branch: $ORIGINAL_BRANCH" >> "$LOG_FILE"
  echo "" >> "$LOG_FILE"
  echo "=== Build Command ===" >> "$LOG_FILE"
  echo "$BUILD_COMMAND" >> "$LOG_FILE"
  echo "" >> "$LOG_FILE"
  echo "=== Build Output ===" >> "$LOG_FILE"
  
  # 记录开始时间
  START_TIME=$(date +%s)
  
  $BUILD_COMMAND >> "$LOG_FILE" 2>&1
  BUILD_EXIT_CODE=$?
  
  # 记录结束时间
  END_TIME=$(date +%s)
  BUILD_DURATION=$((END_TIME - START_TIME))
  
  echo "" >> "$LOG_FILE"
  echo "=== Build Summary ===" >> "$LOG_FILE"
  echo "Exit Code: $BUILD_EXIT_CODE" >> "$LOG_FILE"
  echo "Duration: ${BUILD_DURATION}s" >> "$LOG_FILE"
  echo "Timestamp: $(date)" >> "$LOG_FILE"

  # 检查构建结果
  if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "${GREEN}✅ 构建成功！(耗时: ${BUILD_DURATION}s)${NC}"
    GOOD_COMMITS+=("$CURRENT_COMMIT:$COMMIT_MESSAGE:SUCCESS")
  else
    echo "${RED}❌ 构建失败。(耗时: ${BUILD_DURATION}s) 正在分析错误原因...${NC}"

    # 提取错误信息的最后几行作为摘要
    ERROR_SUMMARY=$(tail -n 10 "$LOG_FILE" | grep -E "(error|Error|ERROR|failed|Failed|FAILED)" | head -n 1 | sed 's/^[[:space:]]*//' | cut -c1-100)
    if [ -z "$ERROR_SUMMARY" ]; then
      ERROR_SUMMARY=$(tail -n 5 "$LOG_FILE" | tr '\n' ' ' | sed 's/^[[:space:]]*//' | cut -c1-100)
    fi

    # 检查日志文件中是否包含我们正在寻找的特定错误
    if grep -q "$ERROR_MESSAGE" "$LOG_FILE"; then
      echo "${RED}原因：检测到 'object is not extensible' 错误。这是一个"坏"的 Commit。${NC}"
      BAD_COMMITS+=("$CURRENT_COMMIT:$COMMIT_MESSAGE:$ERROR_SUMMARY")
    else
      echo "${YELLOW}原因：其他构建错误（非目标错误）${NC}"
      echo "${YELLOW}错误摘要：${ERROR_SUMMARY}${NC}"
      FAILED_COMMITS+=("$CURRENT_COMMIT:$COMMIT_MESSAGE:$ERROR_SUMMARY")
    fi
  fi
done

# 7. 输出总结报告
echo "\n${PURPLE}================================================================${NC}"
echo "${PURPLE}                        测试结果总结                            ${NC}"
echo "${PURPLE}================================================================${NC}"

echo "\n${GREEN}✅ 构建成功的 Commits (${#GOOD_COMMITS[@]}):${NC}"
if [ ${#GOOD_COMMITS[@]} -eq 0 ]; then
  echo "  ${YELLOW}无${NC}"
else
  printf "  %-10s | %-60s\n" "Commit" "消息"
  printf "  %-10s | %-60s\n" "----------" "------------------------------------------------------------"
  for commit_info in "${GOOD_COMMITS[@]}"; do
    commit_hash=$(echo "$commit_info" | cut -d':' -f1)
    commit_msg=$(echo "$commit_info" | cut -d':' -f2 | cut -c1-58)
    printf "  ${GREEN}%-10s${NC} | %-60s\n" "$commit_hash" "$commit_msg"
  done
fi

echo "\n${RED}❌ 包含目标错误的 Commits (${#BAD_COMMITS[@]}):${NC}"
if [ ${#BAD_COMMITS[@]} -eq 0 ]; then
  echo "  ${YELLOW}无${NC}"
else
  printf "  %-10s | %-40s | %-50s\n" "Commit" "消息" "错误摘要"
  printf "  %-10s | %-40s | %-50s\n" "----------" "----------------------------------------" "--------------------------------------------------"
  for commit_info in "${BAD_COMMITS[@]}"; do
    commit_hash=$(echo "$commit_info" | cut -d':' -f1)
    commit_msg=$(echo "$commit_info" | cut -d':' -f2 | cut -c1-38)
    error_summary=$(echo "$commit_info" | cut -d':' -f3- | cut -c1-48)
    printf "  ${RED}%-10s${NC} | %-40s | %-50s\n" "$commit_hash" "$commit_msg" "$error_summary"
  done
fi

echo "\n${YELLOW}⚠️  其他构建失败的 Commits (${#FAILED_COMMITS[@]}):${NC}"
if [ ${#FAILED_COMMITS[@]} -eq 0 ]; then
  echo "  ${YELLOW}无${NC}"
else
  printf "  %-10s | %-40s | %-50s\n" "Commit" "消息" "错误摘要"
  printf "  %-10s | %-40s | %-50s\n" "----------" "----------------------------------------" "--------------------------------------------------"
  for commit_info in "${FAILED_COMMITS[@]}"; do
    commit_hash=$(echo "$commit_info" | cut -d':' -f1)
    commit_msg=$(echo "$commit_info" | cut -d':' -f2 | cut -c1-38)
    error_summary=$(echo "$commit_info" | cut -d':' -f3- | cut -c1-48)
    printf "  ${YELLOW}%-10s${NC} | %-40s | %-50s\n" "$commit_hash" "$commit_msg" "$error_summary"
  done
fi

# 8. 分析结果并给出建议
echo "\n${CYAN}================================================================${NC}"
echo "${CYAN}                           建议                                 ${NC}"
echo "${CYAN}================================================================${NC}"

if [ ${#GOOD_COMMITS[@]} -gt 0 ]; then
  LATEST_GOOD_COMMIT=$(echo "${GOOD_COMMITS[0]}" | cut -d':' -f1)
  echo "\n${GREEN}🎉 找到了可用的构建版本！${NC}"
  echo "最新的可构建 Commit: ${GREEN}$LATEST_GOOD_COMMIT${NC}"
  echo ""
  echo "你可以切换到这个 Commit 来获得一个稳定的构建版本："
  echo "  ${BLUE}git checkout $LATEST_GOOD_COMMIT${NC}"
  echo ""
  echo "或者创建一个新分支基于这个稳定版本："
  echo "  ${BLUE}git checkout -b stable-build $LATEST_GOOD_COMMIT${NC}"
else
  echo "\n${RED}⚠️  警告：没有找到可构建的版本${NC}"
  echo "在检查的 ${#COMMITS_TO_TEST[@]} 个 Commit 中，没有找到可以成功构建的版本。"
  echo ""
  echo "${YELLOW}建议：${NC}"
  echo "1. 增加检查的 Commit 数量："
  echo "   ${BLUE}COMMITS_TO_CHECK=20 $0${NC}"
  echo "2. 检查构建环境和依赖是否正确安装"
  echo "3. 查看日志文件了解具体的构建错误"
fi

# 9. 创建日志压缩包
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="build_logs_${TIMESTAMP}.tar.gz"

echo "\n${BLUE}📦 正在创建日志压缩包...${NC}"
if tar -czf "$ARCHIVE_NAME" "$LOG_DIR"/ 2>/dev/null; then
  echo "${GREEN}✅ 日志压缩包已创建: $ARCHIVE_NAME${NC}"
  echo "${BLUE}压缩包大小: $(du -h "$ARCHIVE_NAME" | cut -f1)${NC}"
else
  echo "${YELLOW}⚠️  创建压缩包失败，但日志文件仍可在 '$LOG_DIR' 目录中查看${NC}"
fi

echo "\n${BLUE}📁 所有构建日志已保存在 '$LOG_DIR' 目录中，可以查看详细的构建输出。${NC}"
echo "${BLUE}📊 日志文件命名格式: build_<commit_hash>.log${NC}"
echo "${BLUE}📦 压缩包文件: $ARCHIVE_NAME${NC}"

exit 0
