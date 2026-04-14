# PredictCat

`PredictCat` 是一个独立维护的、面向预测市场的 `dataset-first` 数据服务。

它不再把实时 Bot 当成主链，而是围绕 `Polymarket`、`Kalshi` 与 `Binance U` 参考市场，建立可长期治理的数据契约、采集链路、研究面板与外部插件集成边界。

## 赞助与支持

- 本项目由 `交易猫` 赞助与支持
- `交易猫 CA`：`0x8a99b8d53eff6bc331af529af74ad267f3167777`

> 免责声明：本仓库用于数据工程、研究与系统集成，不构成任何投资建议或收益承诺。

---

## 目录

- 赞助与支持
- 快速开始
- 架构设计
- 核心特性
- 数据与功能
- 目录结构
- 运维指南
- 联系方式

> 从零开始？优先阅读 `docs/predict_dataset_first_blueprint.md`，再执行 `make plan` 和 `make doctor`。

---

## 快速开始

### 1. 本地检查

```bash
cd /home/lenovo/.projects/cat/predictcat

make plan
make doctor
make audit
```

### 2. 测试控制面

```bash
cd /home/lenovo/.projects/cat/predictcat

make test
make verify
```

### 3. 运行 legacy 服务

当前 `services/` 只保留兼容运行壳：

```bash
cd /home/lenovo/.projects/cat/predictcat/services/polymarket && npm start
cd /home/lenovo/.projects/cat/predictcat/services/kalshi && npm start
```

### 4. 先读哪些文档

- 控制面蓝图：`docs/predict_dataset_first_blueprint.md`
- 架构总览：`docs/architecture.md`
- 文档索引：`docs/index.md`
- 部署说明：`docs/deployment.md`

---

## 架构设计

### 设计目标

- 先 `dataset`，后 `factor`，最后 `host integration`
- 先冻结契约，再补 adapter、storage、validator、backfill
- `Polymarket` / `Kalshi` 是来源，不是系统真相源
- `Binance U` 是参考市场，不在本仓库承载下单执行
- legacy Bot 只承载消费、告警与兼容运行，不再承担历史数据平台职责

### 主链边界

```text
Polymarket / Kalshi / Binance U
                │
                ▼
          src/predict/sources
                │
                ▼
        raw_http_snapshot / raw_ws_event
                │
                ▼
   canonical datasets（事件 / 市场 / 成交 / 盘口 / 结算）
                │
                ▼
 projection datasets（映射 / 研究面板 / cross-venue link）
                │
                ▼
      factor datasets / host plugin adapter

services/polymarket 与 services/kalshi
仅作为 legacy consumer，不再反向定义主链
```

### 当前仓库定位

- `src/predict/`：独立仓库主链，负责控制面、registry 与审计入口
- `services/polymarket/`：legacy Polymarket 运行壳
- `services/kalshi/`：legacy Kalshi 运行壳
- `services/shared/`：legacy 共用引导层

---

## 核心特性

- `dataset-first` 控制面：先定义 source / dataset / legacy 真相矩阵
- 长期治理导向：区分 `raw`、`canonical`、`projection`，避免把缓存和日志当真相源
- 双预测市场来源：统一纳管 `Polymarket` 与 `Kalshi`
- 加密量化桥接：补入 `Binance U` 参考价格、资金费率、持仓量
- 独立仓库边界：不再依赖 `TradeCat` 目录结构、宿主 `.env` 与宿主读出口
- legacy 收口：保留 Bot 兼容运行能力，但不让它继续长成第二主链

### 当前已落

- 独立仓库控制骨架
- `registry` 真相矩阵
- `plan / doctor / audit` 统一入口
- `opinion` 服务退役并保持不可恢复
- README / docs / AGENTS 的独立仓库边界同步

### 当前未落

- 官方 source adapter 真正实现
- raw landing 物理落盘
- canonical DDL 与物理存储
- backfill / watermark / 覆盖率审计
- 因子物化与统一 query / export
- 宿主系统外部插件安装适配层

---

## 数据与功能

### 来源矩阵

#### Polymarket

- `Gamma API`：事件、市场、发现与元数据回补
- `Data API`：成交、持仓、活动、持有人、榜单
- `CLOB API`：价格、盘口、price history
- `WebSocket`：实时增量与 forward-fill
- `Subgraph / RTDS / 第三方 SQL`：链上与研究补强

#### Kalshi

- `REST API`：事件、市场、订单簿、基础元数据
- `Historical API`：历史市场、candlesticks、trades、orders
- `WebSocket`：实时 market data 与生命周期流

#### Binance U

- 价格与标记价参考序列
- 资金费率历史
- 持仓量历史
- 研究面板对齐与因子桥接

### 已冻结的数据集

#### Raw

- `raw_http_snapshot`
- `raw_ws_event`

#### Canonical

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
- `binance_um_price_history`
- `binance_um_funding_rate_history`
- `binance_um_open_interest_history`

#### Projection

- `cross_venue_market_link_dim`
- `market_binance_mapping_dim`
- `predict_research_panel`

### 当前功能边界

- 可以做：控制面审计、数据契约冻结、研究面板设计、legacy 兼容运行
- 还不能做：完整历史回补、全量订单簿长期存储、统一查询服务、正式因子产线

---

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
│   ├── sources/                 # Polymarket / Kalshi 主来源与 Binance U 参考来源
│   ├── storage/                 # 落地层占位
│   ├── validators/              # 质量校验占位
│   └── datasets/                # dataset 实现单元
├── services/                    # legacy 运行壳
│   ├── shared/                  # 共享 env/bootstrap 最小能力
│   ├── polymarket/
│   └── kalshi/
└── tests/                       # Python 控制面测试
```

---

## 运维指南

### Golden Path

```bash
cd /home/lenovo/.projects/cat/predictcat

make plan
make doctor
make audit
make test
make verify
```

### 运行判断

- `make plan`：输出 source / dataset / legacy 当前契约
- `make doctor`：检查控制面配置与运行边界
- `make audit`：检查主链状态与退役服务状态
- `make test`：执行 Python 控制面测试
- `make verify`：执行仓库校验命令集合

### 操作原则

- 修改长期能力时，先改 `src/predict/registry.py`
- 修改目录边界、入口命令或架构职责时，同步更新 `README.md`、`AGENTS.md`、`docs/`
- 不要把新的 dataset / factor / backfill 主逻辑继续塞回 `services/*/bot.js`

---

## 联系方式

- 仓库地址：<https://github.com/tukuaiai/predictcat>
- Issue 反馈：<https://github.com/tukuaiai/predictcat/issues>
- 文档入口：`docs/index.md`
- 架构蓝图：`docs/predict_dataset_first_blueprint.md`

如果你的目标是把它作为外部插件安装回宿主系统，先从 `docs/predict_dataset_first_blueprint.md` 和 `src/predict/registry.py` 开始。
