# Polymarket legacy runtime

> 当前定位：`legacy runtime`。本目录只保留实时信号消费、翻译与 Telegram 投递；全生命周期 dataset / backfill / factor 主链统一落到 `src/predict/`。

## 当前职责

- 订阅 / 轮询 Polymarket 实时数据
- 检测套利、订单簿、扫尾盘、大额交易、新市场、聪明钱等信号
- 将信号投递到 Telegram
- 保留旧运行链，给迁移期排障和对照使用

## 环境变量加载顺序

运行时会按以下顺序加载并覆盖：

1. 仓库根目录 `.env`
2. 仓库根目录 `.env.local`
3. 当前服务目录 `.env`
4. 当前服务目录 `.env.local`

也就是说：

- 默认建议使用仓库根目录 `.env`
- 若只想覆盖 `polymarket`，可在 `services/polymarket/.env` 中追加

## 快速开始

```bash
cd /home/lenovo/.projects/cat/predictcat
cp .env.example .env

cd services/polymarket
npm install
npm test
npm start
```

调试模式：

```bash
cd /home/lenovo/.projects/cat/predictcat/services/polymarket
npm run dev
```

## 常用配置

基础配置：

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
LOG_LEVEL=info
DEBUG=false
```

Polymarket 连接与 Telegram 限频常用项：

```env
POLYMARKET_WS_HOST=wss://ws-subscriptions-clob.polymarket.com/ws/market
TELEGRAM_RATE_LIMIT_ENABLED=true
TELEGRAM_RATE_LIMIT_MIN_INTERVAL_MS=120
ORDERBOOK_MIN_IMBALANCE=3
ORDERBOOK_MIN_DEPTH=1000
ORDERBOOK_MIN_LIQUIDITY=20000
```

CSV 报告常用项：

```env
CSV_ENABLE_API_RANKINGS=false
CSV_FETCH_TIMEOUT_MS=15000
CSV_TRANSLATE=true
CSV_TRANSLATE_MAX=120
CSV_TRANSLATE_CACHE_FILE=services/polymarket/data/translation-cache.json
```

## 常用命令

```bash
cd /home/lenovo/.projects/cat/predictcat/services/polymarket

npm test
npm run dev
node scripts/csv-report.js
node -e "const config = require('./config/settings'); console.log(config.telegram.rateLimit)"
```

## 目录概览

```text
services/polymarket/
├── bot.js
├── launcher.js
├── config/settings.js
├── commands/
├── pipeline/
├── signals/
├── translation/
├── utils/
├── scripts/
└── tests/
```

## 边界说明

- 不在这里新增 dataset、backfill、factor 主逻辑
- 运行时缓存与日志仅用于排障，不作为长期真相源
- 若需要新增长期治理能力，统一回到 `src/predict/`
    tradingFee: 0.02
}

// 更保守（更少信号，但质量更高）
arbitrage: {
    minProfit: 0.05,  // 提高到5%
    tradingFee: 0.02
}
```

### 开关模块

```javascript
// 只启用套利检测
arbitrage: { enabled: true },
orderbook: { enabled: false }

// 全部启用
arbitrage: { enabled: true },
orderbook: { enabled: true }
```

---

## 🐛 常见问题

### Q1: Bot没有发送消息？

检查：
1. Token是否正确？
2. Chat ID是否正确？
3. 有没有先给Bot发过消息？

### Q2: 发现不了套利机会？

可能原因：
1. 当前市场没有套利机会（正常）
2. minProfit设置太高（降低试试）
3. WebSocket连接有问题（查看日志）

### Q3: 收到太多信号？

解决：
```javascript
// 提高阈值
minProfit: 0.05,      // 从3%提高到5%
minImbalance: 15      // 从10倍提高到15倍
```

---

## 📊 监控和日志

### 查看日志

```bash
# 实时查看
tail -f bot/logs/signal.log

# 查看最近100条
tail -n 100 bot/logs/signal.log

# 搜索错误
grep "ERROR" bot/logs/error.log
```

### 统计信息

Bot每10分钟会打印统计信息：

```
📊 Bot运行统计
━━━━━━━━━━━━━━━━━━
套利检测：12个机会，8条信号
订单簿检测：5个机会，3条信号
运行时间：2小时15分钟
```

---

## 🛠️ 开发计划

### ✅ 第一阶段（已完成）
- [x] 创建项目结构
- [x] 模块1：价格套利
- [x] 模块2：订单簿失衡
- [x] 开发文档

### 🔨 第二阶段（1周后）
- [ ] 添加数据库（SQLite）
- [ ] 模块3：巨鲸跟踪
- [ ] 模块4：交易量异常

### 🚀 第三阶段（1个月后）
- [ ] 模块5：价格突变
- [ ] 模块6：情绪反转
- [ ] Web控制面板

---

## 🤝 贡献

欢迎提Issue和PR！

---

## ⚠️ 免责声明

本项目仅供学习和研究使用。
- 不构成投资建议
- 请自行评估风险
- 交易需谨慎

---

## 📞 联系方式

- GitHub Issues
- Telegram: @your_username

---

## 📄 许可证

MIT License

---

**祝你交易顺利！** 🚀💰
