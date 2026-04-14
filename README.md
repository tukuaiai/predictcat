# PredictCat（dataset-first 预测市场数据服务）

`predictcat` 是独立维护的预测市场数据仓库。

目标不是继续把实时 Bot 做成“第二主链”，而是围绕 `Polymarket` / `Kalshi` 建立：

- dataset-first 控制面
- 可长期治理的 canonical dataset 契约
- host-agnostic 的外部集成边界
- 面向研究 / 因子 / 回测 / 插件安装的稳定上游

未来它会以“外部插件 / 外部数据服务”的方式被宿主系统集成，而不是继续内嵌回原来的仓库结构。

## 当前定位

- `src/predict/`：独立仓库主链，负责控制面、registry 与审计入口
- `services/polymarket/`：legacy Polymarket 运行壳，只保留实时消费与 Telegram 投递
- `services/kalshi/`：legacy Kalshi 运行壳，只保留实时消费与 Telegram 投递
- `services/shared/`：legacy 运行时共享引导层，负责本地环境变量加载等最小共用能力

## 目录结构

```text
predictcat/
├── README.md
├── AGENTS.md
├── .env.example
├── Makefile
├── pyproject.toml
├── scripts/                     # 兼容脚本与辅助脚本
├── docs/                        # 架构文档、调研与历史资料
├── src/predict/                 # dataset-first 控制面主链
│   ├── config.py                # 独立仓库配置真相源
│   ├── registry.py              # source / dataset / legacy 真相矩阵
│   ├── service_entry.py         # plan / doctor / audit 统一入口
│   ├── runtime/                 # 审计与运行时探针
│   ├── sources/                 # Polymarket / Kalshi 来源适配层
│   ├── storage/                 # 落地层占位
│   ├── validators/              # 质量校验占位
│   └── datasets/                # dataset 实现单元
├── services/                    # legacy 运行壳
│   ├── shared/                  # 共享 env/bootstrap 最小能力
│   ├── polymarket/
│   └── kalshi/
└── tests/                       # Python 控制面测试
```

## 设计原则

- 先 `dataset`，后 `factor`，最后 `host integration`
- `polymarket` / `kalshi` 是来源，不是系统真相源
- legacy Bot 只承载消费、告警与兼容运行，不再承担历史数据平台职责
- 本仓库不再假设 `TradeCat` 目录结构、`core/query` 读出口或宿主 `.env` 路径
- 未来接入宿主时，通过 adapter / plugin contract 绑定，不把 host-specific 逻辑反写进主链

## 当前冻结的数据对象

首版 registry 已冻结以下 dataset：

- `event_snapshot`
- `market_snapshot`
- `outcome_dim`
- `status_transition`
- `resolution_fact`
- `price_history`
- `trade_fact`
- `orderbook_snapshot`
- `polymarket_user_activity_fact`
- `polymarket_smart_money_position_snapshot`
- `kalshi_series_snapshot`
- `kalshi_candlestick_history`
- `cross_venue_market_link_dim`
- `market_binance_mapping_dim`
- `predict_research_panel`

## 常用命令

```bash
cd /home/lenovo/.projects/cat/predictcat

make plan
make doctor
make audit
make test
make verify
```

legacy 服务仍可单独运行：

```bash
cd /home/lenovo/.projects/cat/predictcat/services/polymarket && npm start
cd /home/lenovo/.projects/cat/predictcat/services/kalshi && npm start
```

## 当前边界

当前已落：

- 独立仓库控制骨架
- registry 真相矩阵
- legacy 边界收口
- 共享 env 加载入口
- `opinion` 退役并保持不可恢复

当前未落：

- 全量 backfill 实现
- 数据库 DDL 与物理存储
- 因子物化任务
- 宿主系统插件安装适配层
- 统一 query / export 服务

## 文档入口

- 文档索引：`docs/index.md`
- 架构总览：`docs/architecture.md`
- 部署说明：`docs/deployment.md`
- Polymarket 外部生态检索：`docs/polymarket_repos_analysis.md`
