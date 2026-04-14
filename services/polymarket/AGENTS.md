# polymarket legacy 服务约束

本文件作用域：`services/polymarket/**`。

## 目录职责

```text
services/polymarket/
├── bot.js                 # 主入口：组装信号、Telegram、翻译与运行时统计
├── launcher.js            # 命令行启动器
├── config/settings.js     # 配置真相源：默认值 + 环境变量覆盖
├── utils/proxyAgent.js    # 代理接入：Telegram / fetch / WebSocket 统一出站策略
├── utils/userManager.js   # 用户订阅、通知开关、阈值与显示模式
├── signals/*              # 各类信号检测与格式化
├── commands/              # Telegram 命令与交互面板
├── translation/           # 翻译队列、缓存与消息更新
└── data/                  # 运行时数据（只读慎动）
```

## 当前定位

- `services/polymarket` 是 legacy 实时信号 Bot
- 它不再是 `predictcat` 的数据主链、dataset 主链或因子主链
- 新的数据平台能力统一落到 `src/predict/**`

## 修改边界

- 优先做最小补丁，禁止顺手重构 `bot.js` 的大段发送链路
- 修改 Telegram 出站逻辑时，优先落在 `utils/proxyAgent.js` 或 `config/settings.js`
- `data/users.json`、`data/translation-cache.json` 仅用于排障读取，禁止手工改写
- 保持 CommonJS、2 空格缩进、中文日志/注释
- 禁止把新的 dataset registry、历史回补、因子物化逻辑继续写回本目录

## 代理与发送规则

- Telegram 代理必须优先使用显式 `agent`，不要只依赖全局代理
- `telegram.rateLimit` 是默认发送保护层；新增相关配置时同步更新 `README.md`
- 若排查“没推送到 TG”，先区分：代理/网络故障、用户关闭通知、阈值过滤、用户已拉黑 bot

## 验证命令

```bash
cd /home/lenovo/.projects/cat/predictcat/services/polymarket
node -e "const { getTelegramBotOptions } = require('./utils/proxyAgent'); console.log(getTelegramBotOptions())"
node -e "const config = require('./config/settings'); console.log(config.telegram.rateLimit)"
npm test
```
