# services legacy 运行壳约束

本文件作用域：`services/**`。

## 目录职责

- `services/shared/`：共享 env/bootstrap 最小能力
- `services/polymarket/`：legacy Polymarket 实时信号 Bot
- `services/kalshi/`：legacy Kalshi 实时信号 Bot

## 强边界

- 本目录只承载 legacy Bot 运行与最小兼容补丁
- `shared/` 只允许放置通用引导与最小共用能力，不承载 dataset 主逻辑
- 不得继续把新的 dataset / backfill / factor 主逻辑写回本目录
- 若需要新增长期治理能力，统一落到 `src/predict/**`
- `opinion/` 已退役，不得恢复

## 修改策略

- 允许：修正 README、AGENTS、启动说明、共享 env 引导、最小兼容补丁
- 禁止：顺手重构为第二主链
- 若改 legacy 边界，必须同步更新根目录 `README.md` / `AGENTS.md`
