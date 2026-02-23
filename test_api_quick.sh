#!/bin/bash

# Reports API 快速测试脚本

echo "================================================"
echo "  Reports API 快速测试"
echo "================================================"
echo ""

BASE_URL="http://localhost:8003"
API_BASE="$BASE_URL/api/v1"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() {
    echo -e "${GREEN}✓ $1${NC}"
}

fail() {
    echo -e "${RED}✗ $1${NC}"
}

info() {
    echo -e "${YELLOW}▸ $1${NC}"
}

# 测试计数
PASSED=0
FAILED=0

# 1. 健康检查
echo "1. 健康检查 (GET /health)"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/health" 2>/dev/null)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    status=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', 'unknown'))" 2>/dev/null)
    if [ "$status" = "healthy" ]; then
        pass "健康检查 - 服务正常"
        ((PASSED++))
    else
        fail "健康检查 - 状态: $status"
        ((FAILED++))
    fi
else
    fail "健康检查 - HTTP $http_code"
    ((FAILED++))
fi
echo ""

# 2. 获取报告列表 (空)
echo "2. 获取报告列表 (GET /api/v1/reports?viewer=alice)"
response=$(curl -s -w "\n%{http_code}" "$API_BASE/reports?viewer=alice" 2>/dev/null)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    count=$(echo "$body" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data) if isinstance(data, list) else 'error')" 2>/dev/null)
    pass "获取报告列表 - 返回 $count 条报告"
    ((PASSED++))
else
    fail "获取报告列表 - HTTP $http_code"
    ((FAILED++))
fi
echo ""

# 3. 创建报告 (异步)
echo "3. 创建报告 (POST /api/v1/reports)"
info "发送请求..."

response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "owner": "alice",
        "visibility": "SHARED_SUMMARY",
        "report_text": "CT CHEST\n\nFINDINGS: No acute abnormalities.\n\nIMPRESSION: Normal exam."
    }' \
    "$API_BASE/reports" 2>/dev/null)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "202" ] || [ "$http_code" = "200" ]; then
    report_id=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 0))" 2>/dev/null)
    status=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', 'unknown'))" 2>/dev/null)
    pass "创建报告 - ID: $report_id, 状态: $status"
    ((PASSED++))
else
    fail "创建报告 - HTTP $http_code"
    echo "$body" | head -3
    ((FAILED++))
fi
echo ""

# 4. API 文档可访问性
echo "4. API 文档 (GET /docs)"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/docs" 2>/dev/null)

if [ "$response" = "200" ]; then
    pass "API 文档 - 可访问"
    ((PASSED++))
else
    fail "API 文档 - HTTP $response"
    ((FAILED++))
fi
echo ""

# 总结
echo "================================================"
echo "  测试总结"
echo "================================================"
echo -e "${GREEN}通过: $PASSED${NC} | ${RED}失败: $FAILED${NC} | 总计: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过! Reports API 工作正常${NC}"
    echo ""
    echo "📚 API 文档: $BASE_URL/docs"
    echo "🔧 后端服务: $BASE_URL"
else
    echo -e "${RED}⚠️ 部分测试失败，请检查后端服务${NC}"
fi

echo ""
