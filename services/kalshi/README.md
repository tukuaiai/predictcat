# Kalshi legacy runtime

> 当前定位：`legacy runtime`。本目录只保留实时信号消费与 Telegram 投递；新的 dataset-first 主链统一落到 `src/predict/`。

## 当前职责

- 轮询 / 订阅 Kalshi 市场数据
- 检测新市场、订单簿失衡、扫尾盘、大额交易、价格突变、套利等信号
- 推送到 Telegram
- 在数据主链迁移期保留 legacy 对照运行能力

## 环境变量加载顺序

运行时会按以下顺序加载并覆盖：

1. 仓库根目录 `.env`
2. 仓库根目录 `.env.local`
3. 当前服务目录 `.env`
4. 当前服务目录 `.env.local`

默认建议在仓库根目录维护 `.env`，必要时再用 `services/kalshi/.env` 局部覆盖。

## 快速开始

```bash
cd /home/lenovo/.projects/cat/predictcat
cp .env.example .env

cd services/kalshi
npm install
npm start
```

调试模式：

```bash
cd /home/lenovo/.projects/cat/predictcat/services/kalshi
npm run dev
```

## 常用配置

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
KALSHI_API_KEY_ID=
KALSHI_PRIVATE_KEY_PATH=
KALSHI_API_URL=https://api.elections.kalshi.com/trade-api/v2
KALSHI_WS_URL=wss://api.elections.kalshi.com
LOG_LEVEL=info
DEBUG=false
```

## 目录概览

```text
services/kalshi/
├── bot.js
├── config/settings.js
├── ecosystem.config.js
├── utils/
└── package.json
```

## 边界说明

- 不在这里新增 dataset、backfill、factor 主逻辑
- 若后续需要长期结构化数据能力，统一回到 `src/predict/`
- legacy runtime 仅作为兼容运行与迁移期对照层
