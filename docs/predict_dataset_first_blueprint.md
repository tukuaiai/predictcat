# PredictCat 数据集优先重构蓝图

> 更新时间：2026-04-14  
> 适用范围：`predictcat` 独立仓库主链，聚焦 `Polymarket`、`Kalshi` 与 `Binance U` 参考市场  
> 结论口径：优先引用官方文档；第三方数据源只作为补强，不作为唯一真相源

## 1. 先给结论

- 当前仓库**还不具备完整全生命周期采集能力**。它已经有 `dataset-first` registry 骨架，但还没有真正落地的 source adapter、raw landing、canonical 写入、回补与校验链路。
- `Kalshi` 的官方历史数据面在 2026-03-03 与 2026-03-06 后明显增强，已经形成较清晰的 `/historical/*` 主链，适合作为官方 backfill 主入口。
- `Polymarket` 官方公开了 `Gamma API`、`Data API`、`CLOB API`、WebSocket、Subgraph、RTDS 等多条数据面，但**基于当前官方文档所列公开接口推断**：它没有提供一个“全市场、全生命周期、完整历史订单簿”的官方 bulk dump 下载包；要做完整历史，必须走“REST 回补 + WS 长期落盘 + 链上补强 + 第三方 SQL 数据补强”的组合路径。
- 如果目标是服务加密量化，且主要执行市场是 `Binance U`，那么预测市场数据不能单独存；必须同时建设 `Binance U` 参考序列，否则无法把预测市场信号量化成可交易因子。

## 2. 当前仓库缺口

当前 `predictcat` 已经有：

- `src/predict/registry.py`：source / dataset / legacy 真相矩阵
- `src/predict/service_entry.py`：`plan / doctor / audit`
- `services/polymarket/`、`services/kalshi/`：legacy 运行壳

当前还没有：

- 官方 API / WS 的正式适配器
- 原始消息落盘层
- canonical dataset 物理表结构
- 历史回补与断点续采
- 质量校验、去重、幂等写入
- 与 `Binance U` 的参考数据桥

这意味着现在的仓库是“控制面已立，数据面未通”。

## 3. 官方数据面与成熟工具

### 3.1 Polymarket 官方数据面

官方文档入口：

- API 总览：<https://docs.polymarket.com/api-reference/introduction>
- Clients & SDKs：<https://docs.polymarket.com/api-reference/clients-sdks>
- Subgraph：<https://docs.polymarket.com/market-data/subgraph>
- RTDS：<https://docs.polymarket.com/market-data/websocket/rtds>
- Blockchain Data Resources：<https://docs.polymarket.com/resources/blockchain-data>

按职责拆开后，Polymarket 的官方数据面是：

- `Gamma API`：事件、市场、标签、series、搜索、profile；适合做 `event_snapshot`、`market_snapshot`、发现与元数据回补。
- `Data API`：positions、trades、activity、holders、open interest、leaderboards；适合做 `trade_fact`、`user_activity`、聪明钱快照。
- `CLOB API`：orderbook、pricing、midpoint、spread、price history；适合做 `price_history` 与 `orderbook_snapshot`。
- `WebSocket Market/User Channel`：适合实时 forward-fill、盘口状态增量、状态变更捕捉。
- `Subgraph / Blockchain Data`：适合链上成交、余额、positions、redeems 补强与审计。
- `RTDS`：官方文档明确提供 comments、crypto prices、equity prices 的实时流；更适合作为研究补强，而不是主真相源。

官方成熟组件：

- TypeScript CLOB SDK：<https://github.com/Polymarket/clob-client>
- Python CLOB SDK：<https://github.com/Polymarket/py-clob-client>
- Rust CLOB SDK：<https://github.com/Polymarket/rs-clob-client>
- RTDS TypeScript Client：<https://github.com/Polymarket/real-time-data-client>

关键判断：

- `Gamma/Data/CLOB` 能覆盖大量“当前态 + 一部分历史”。
- 真正难点不在“有没有接口”，而在“有没有官方全量历史归档包”。
- **基于当前文档推断**：Polymarket 并未公开一个可直接下载的“全市场历史订单簿 / 全生命周期快照总包”。因此必须自己保留 raw WS 与周期性 REST snapshot。

### 3.2 Kalshi 官方数据面

官方文档入口：

- Welcome：<https://docs.kalshi.com/welcome>
- Quick Start Market Data：<https://docs.kalshi.com/getting_started/quick_start_market_data>
- Historical Data：<https://docs.kalshi.com/getting_started/historical_data>
- WebSocket Quick Start：<https://docs.kalshi.com/getting_started/quick_start_websockets>
- Get Market Orderbook：<https://docs.kalshi.com/api-reference/market/get-market-orderbook>
- API Changelog：<https://docs.kalshi.com/changelog>

Kalshi 的官方数据面更像“交易所 API 正统路线”：

- `REST`：事件、市场、订单簿、基础元数据、candlesticks。
- `WebSocket`：ticker、orderbook snapshot / delta、lifecycle、用户与公开市场流。
- `Historical API`：官方单独切出历史层。

历史能力的关键时间点：

- **2026-03-03**：Kalshi changelog 公布 `GET /historical/cutoff`、`GET /historical/markets`、`GET /historical/markets/{ticker}`、`GET /historical/markets/{ticker}/candlesticks`、`GET /historical/fills`、`GET /historical/orders`，并明确 live endpoint 与 historical endpoint 的分界。
- **2026-03-06**：新增 `GET /historical/trades`，用于查询历史库中的全市场成交。

这意味着：

- `Kalshi` 可以比较自然地做“live + historical” 双层采集。
- 它比 `Polymarket` 更适合先打通官方全生命周期 backfill。

官方成熟组件：

- Python starter code：<https://github.com/Kalshi/kalshi-starter-code-python>
- 官方分析仓库：<https://github.com/Kalshi/tools-and-analysis>
- Python SDK 文档：<https://docs.kalshi.com/python-sdk>
- TypeScript SDK 文档：<https://docs.kalshi.com/typescript-sdk>

### 3.3 Polymarket / Kalshi 的第三方补强源

这些来源可以用，但只能作为补强层：

- Dune Prediction Markets：<https://docs.dune.com/data-catalog/curated/prediction-markets/all-tables-overview>
- Polymarket 官方列出的 blockchain data providers：`Goldsky`、`Dune`、`Allium`  
  参考：<https://docs.polymarket.com/resources/blockchain-data>

目前可确认的价值：

- Dune 已有 `polymarket_polygon.market_trades`、`market_details`、`positions`、`market_prices_hourly`、`market_prices_daily` 等表。
- Dune 对 `Kalshi` 当前文档列出的主要是 `market_report` 与 `trade_report`，更偏研究报表，不等同于官方逐笔主链。
- `Goldsky / Allium` 更适合做链上大批量同步与研究库补强，但不应替代官方 API 与自建原始采集。

## 4. 完整生命周期采集结论

### 4.1 单个市场 / 事件是否能做到全生命周期

`Kalshi`：

- 可以。
- 原因：官方已经把 `live` 与 `historical` 边界清楚拆开，并给了 cutoff 语义。

`Polymarket`：

- 可以做到“工程上完整”，但不是“单靠一个官方下载入口完整”。
- 需要同时具备：
  - `Gamma` 元数据快照
  - `CLOB` 价格 / 盘口回补
  - `Data API` 成交 / 持仓 / 活动
  - `WS` 实时长期落盘
  - `Subgraph / 第三方 SQL` 链上补强

### 4.2 哪里能下载到完整历史数据

`Polymarket`：

- **没有发现官方单点 bulk dump** 能直接覆盖“全市场 + 全历史 + 全深度订单簿”。
- 最可行下载路径：
  1. 用 `Gamma API` 拉事件 / 市场全集与状态历史快照；
  2. 用 `CLOB API` 拉价格历史与定期盘口 snapshot；
  3. 用 `Data API` 拉 trades / activity / holders / open interest；
  4. 从现在开始常驻采集 `WS`，把实时变更长期落盘；
  5. 用 `Subgraph / Dune / Goldsky / Allium` 对链上历史做补强和校验。

`Kalshi`：

- 官方 historical API 已经是首选下载入口。
- 推荐顺序：
  1. `historical/cutoff`
  2. `historical/markets`
  3. `historical/markets/{ticker}/candlesticks`
  4. `historical/trades`
  5. `historical/orders`
  6. live REST / WS 继续接最新增量

## 5. 长期可治理的存储方案

### 5.1 必须先分层，不要直接写业务表

建议固定四层：

1. `raw`
2. `canonical`
3. `projection`
4. `factor`

### 5.2 每层职责

`raw`

- 保留原始 HTTP 响应与 WS 消息
- 不做业务解释
- 只做最小 envelope：`source_id`、`resource`、`request_params`、`payload`、`observed_at`、`ingested_at`
- 这是重放、审计、回补、查漏的基础

`canonical`

- 统一命名、主键、时间语义、幂等策略
- 对外只暴露稳定 dataset，不暴露来源私有字段
- 本层才是长期真相源

`projection`

- 为研究、回测、跨 venue 对齐、面板查询服务
- 可以重建，不应作为唯一真相源

`factor`

- 因子、标签、策略特征
- 完全派生，允许快速迭代

### 5.3 物理存储建议

长期维护优先，不先上重型分布式：

- `raw`：`jsonl.zst` 或 `ndjson.zst`，按 `source_id/resource/date/hour` 分区
- `canonical / projection / factor`：`Parquet`
- 本地分析与批量回补：`DuckDB`
- 控制面元数据、watermark、任务状态：`SQLite` 或轻量 `PostgreSQL`

推荐目录：

```text
data/
├── raw/
│   ├── source_id=polymarket_clob/resource=book/date=YYYY-MM-DD/hour=HH/
│   └── source_id=kalshi_ws/resource=orderbook/date=YYYY-MM-DD/hour=HH/
├── canonical/
│   ├── dataset=trade_fact/venue=polymarket/date=YYYY-MM-DD/
│   ├── dataset=orderbook_snapshot/venue=kalshi/date=YYYY-MM-DD/
│   └── dataset=binance_um_funding_rate_history/symbol=BTCUSDT/date=YYYY-MM-DD/
├── projection/
│   └── dataset=predict_research_panel/bar=1h/date=YYYY-MM-DD/
└── state/
    ├── ingestion.sqlite
    └── checkpoints/
```

不建议：

- 把 runtime cache、Bot 内存态、日志文本当成真相源
- 把 Telegram 输出内容反向当数据库
- 直接把未标准化 API 响应写成对外消费表

## 6. 哪些数据应该长期结构化存储

### 6.1 必存

- `raw_http_snapshot`
- `raw_ws_event`
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
- `cross_venue_market_link_dim`
- `market_binance_mapping_dim`

### 6.2 可选长期存储

- Polymarket comments / reactions
- 更多链上钱包标签与聪明钱名单
- 更细粒度 L2 delta 流
- 外部 SQL 平台导出的研究切片

### 6.3 不应作为长期真相源

- `services/*` 运行缓存
- `bugs.jsonl`
- Telegram 推送记录
- 临时导出的 CSV / notebook 中间文件

## 7. 面向 Binance U 的因子组织方式

### 7.1 因子不是从预测市场直接来，而是从“映射后的面板”来

必须先建立：

- `cross_venue_market_link_dim`
- `market_binance_mapping_dim`
- `predict_research_panel`

其中 `predict_research_panel` 至少要统一：

- `market_id / event_id / venue`
- `bar_time`
- `yes_price / no_price / midpoint`
- `spread / depth / imbalance`
- `trade_count / buy_volume / sell_volume`
- `time_to_resolve`
- `binance_symbol`
- `binance_return`
- `binance_funding_rate`
- `binance_open_interest`

### 7.2 建议的因子族

`概率水平因子`

- 预测市场隐含概率
- 跨 venue 概率分歧
- 概率变化率与加速度

`微结构因子`

- BBO spread
- 深度不平衡
- 成交方向不平衡
- 大单占比 / 吃单强度

`生命周期因子`

- 距离结算剩余时间
- 状态切换频率
- 接近结算时的概率跳变

`参与者因子`

- 聪明钱持仓集中度
- 大户净增减仓
- 用户活动爆发度

`跨市场联动因子`

- 预测市场概率变动领先 `Binance U` 收益
- 预测市场概率与 `Binance` 价格 / 资金费率 / OI 的背离
- 事件型市场与标的币种短期波动的 lead-lag

### 7.3 对加密交易最有价值的几组最小因子

首批只做四组：

1. `predict_prob_delta`
2. `predict_orderbook_imbalance`
3. `smart_money_position_delta`
4. `predict_vs_binance_divergence`

原因很简单：

- 都有明确数据依赖
- 可以从冻结 dataset 直接派生
- 不需要先解决评论 NLP、复杂图谱、跨语言文本治理

## 8. 最小可执行重构路线

### Phase 1：契约冻结

- 冻结 source matrix
- 冻结 raw / canonical / projection dataset
- 明确时间字段：`event_time`、`observed_at`、`ingested_at`
- 明确主键与幂等键

### Phase 2：采集主链

- `Polymarket`：先打通 `Gamma + CLOB + Data API + WS`
- `Kalshi`：先打通 `historical + live REST + WS`
- `Binance U`：先打通价格、资金费率、OI

### Phase 3：规范化与回补

- `raw -> canonical`
- 断点续采
- backfill watermark
- 覆盖率审计

### Phase 4：研究面板与因子

- 建 `market_binance_mapping_dim`
- 物化 `predict_research_panel`
- 产出首批四类因子

## 9. 本轮收敛后的工程动作

本轮建议固定为：

- registry 增加 `raw` 层 dataset
- registry 增加 `Binance U` 参考数据源与 dataset
- 文档显式区分“官方主链”与“第三方补强源”
- 不在本轮直接实现所有 adapter，先把契约和落盘策略冻结

这条路径的优点：

- 不空谈
- 不过度实现
- 下一轮可以直接开始写 adapter，而不会再回头重改 dataset 契约
