# Architecture

`predictcat` 的主链已经确定为 `dataset-first`：

- `services/` 只保留 legacy consumer
- `src/predict/` 负责 source contract、dataset contract、审计入口
- 真正长期真相源必须从 `raw -> canonical -> projection -> factor` 单向流动

## 核心边界

- `source`：对接 `Polymarket`、`Kalshi`、`Binance U`
- `raw`：原始 HTTP / WS 落盘
- `canonical`：标准化长期 dataset
- `projection`：跨市场映射与研究面板
- `factor`：量化因子与策略特征

## 关键原则

- 不把 `services/*/bot.js` 继续当数据平台主链
- 不把缓存、日志、Telegram 文本当真相源
- 先冻结 dataset 契约，再补 adapter、backfill、validator

## 详细蓝图

- `docs/predict_dataset_first_blueprint.md`
