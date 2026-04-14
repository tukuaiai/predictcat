"""predict source / dataset / legacy 真相矩阵。"""

from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class SourceDefinition:
    """外部来源定义。"""

    source_id: str
    venue: str
    kind: str
    role: str

    def to_dict(self) -> dict[str, str]:
        return asdict(self)


@dataclass(frozen=True)
class DatasetDefinition:
    """dataset 定义。"""

    dataset_id: str
    layer: str
    owner: str
    write_mode: str
    cadence: str
    sources: tuple[str, ...]
    description: str

    def to_dict(self) -> dict[str, object]:
        return asdict(self)


@dataclass(frozen=True)
class LegacyServiceDefinition:
    """legacy 运行壳定义。"""

    service_id: str
    path: str
    status: str
    role: str

    def to_dict(self) -> dict[str, str]:
        return asdict(self)


SOURCES: tuple[SourceDefinition, ...] = (
    SourceDefinition("polymarket_gamma", "polymarket", "rest", "元数据与当前态回补"),
    SourceDefinition("polymarket_clob", "polymarket", "rest", "价格与订单簿历史"),
    SourceDefinition("polymarket_data_api", "polymarket", "rest", "成交、持仓、活动与榜单"),
    SourceDefinition("polymarket_ws", "polymarket", "websocket", "实时 forward-fill"),
    SourceDefinition("polymarket_subgraph", "polymarket", "graphql", "链上补强"),
    SourceDefinition("kalshi_rest", "kalshi", "rest", "市场、事件、订单簿与基础元数据"),
    SourceDefinition("kalshi_ws", "kalshi", "websocket", "实时 market data"),
    SourceDefinition("kalshi_historical", "kalshi", "rest", "historical markets / trades / orders / candlesticks"),
    SourceDefinition("binance_um_rest", "binance", "rest", "U 本位合约参考价格、资金费率、持仓量"),
    SourceDefinition("binance_um_ws", "binance", "websocket", "U 本位合约实时行情与 book ticker"),
)


DATASETS: tuple[DatasetDefinition, ...] = (
    DatasetDefinition(
        "raw_http_snapshot",
        "raw",
        "predict",
        "append_only",
        "snapshot",
        (
            "polymarket_gamma",
            "polymarket_clob",
            "polymarket_data_api",
            "kalshi_rest",
            "kalshi_historical",
            "binance_um_rest",
        ),
        "原始 HTTP 拉取落盘；按 source_id / resource / partition_date 保留重放证据。",
    ),
    DatasetDefinition(
        "raw_ws_event",
        "raw",
        "predict",
        "append_only",
        "event_driven",
        ("polymarket_ws", "kalshi_ws", "binance_um_ws"),
        "原始 WebSocket 消息日志；用于断点续采、回放与审计。",
    ),
    DatasetDefinition(
        "event_snapshot",
        "canonical",
        "predict",
        "append_only",
        "snapshot",
        ("polymarket_gamma", "kalshi_rest"),
        "事件级当前态与归档态快照。",
    ),
    DatasetDefinition(
        "market_snapshot",
        "canonical",
        "predict",
        "append_only",
        "snapshot",
        ("polymarket_gamma", "kalshi_rest"),
        "市场级元数据快照与状态字段。",
    ),
    DatasetDefinition(
        "outcome_dim",
        "canonical",
        "predict",
        "upsert",
        "on_change",
        ("polymarket_gamma", "polymarket_clob", "kalshi_rest"),
        "市场 outcome / token 标准化维表。",
    ),
    DatasetDefinition(
        "status_transition",
        "canonical",
        "predict",
        "append_only",
        "event_driven",
        ("polymarket_gamma", "polymarket_ws", "kalshi_rest", "kalshi_ws"),
        "市场状态变更链。",
    ),
    DatasetDefinition(
        "resolution_fact",
        "canonical",
        "predict",
        "append_only",
        "event_driven",
        ("polymarket_gamma", "polymarket_ws", "polymarket_subgraph", "kalshi_rest", "kalshi_historical"),
        "市场结算事实与最终结果。",
    ),
    DatasetDefinition(
        "price_history",
        "canonical",
        "predict",
        "append_only",
        "timeseries",
        ("polymarket_clob", "kalshi_historical"),
        "token / contract 价格历史主链。",
    ),
    DatasetDefinition(
        "trade_fact",
        "canonical",
        "predict",
        "append_only",
        "timeseries",
        ("polymarket_data_api", "polymarket_ws", "kalshi_historical", "kalshi_ws"),
        "成交事实表。",
    ),
    DatasetDefinition(
        "orderbook_snapshot",
        "canonical",
        "predict",
        "append_only",
        "timeseries",
        ("polymarket_clob", "polymarket_ws", "kalshi_rest", "kalshi_ws"),
        "订单簿与最优买卖价快照。",
    ),
    DatasetDefinition(
        "polymarket_user_activity_fact",
        "canonical",
        "predict",
        "append_only",
        "timeseries",
        ("polymarket_data_api", "polymarket_subgraph"),
        "Polymarket 用户活动事实。",
    ),
    DatasetDefinition(
        "polymarket_smart_money_position_snapshot",
        "canonical",
        "predict",
        "append_only",
        "snapshot",
        ("polymarket_data_api",),
        "Polymarket 聪明钱持仓快照。",
    ),
    DatasetDefinition(
        "kalshi_series_snapshot",
        "canonical",
        "predict",
        "append_only",
        "snapshot",
        ("kalshi_rest", "kalshi_historical"),
        "Kalshi series / event 体系快照。",
    ),
    DatasetDefinition(
        "kalshi_candlestick_history",
        "canonical",
        "predict",
        "append_only",
        "timeseries",
        ("kalshi_historical",),
        "Kalshi 官方历史 K 线。",
    ),
    DatasetDefinition(
        "binance_um_price_history",
        "canonical",
        "predict",
        "append_only",
        "timeseries",
        ("binance_um_rest", "binance_um_ws"),
        "Binance U 本位合约价格、标记价与基差参考序列。",
    ),
    DatasetDefinition(
        "binance_um_funding_rate_history",
        "canonical",
        "predict",
        "append_only",
        "timeseries",
        ("binance_um_rest",),
        "Binance U 本位合约资金费率历史。",
    ),
    DatasetDefinition(
        "binance_um_open_interest_history",
        "canonical",
        "predict",
        "append_only",
        "timeseries",
        ("binance_um_rest",),
        "Binance U 本位合约持仓量历史。",
    ),
    DatasetDefinition(
        "cross_venue_market_link_dim",
        "projection",
        "predict",
        "rebuild",
        "daily",
        ("polymarket_gamma", "kalshi_rest"),
        "跨平台相似市场链接维表。",
    ),
    DatasetDefinition(
        "market_binance_mapping_dim",
        "projection",
        "predict",
        "rebuild",
        "daily",
        ("polymarket_gamma", "kalshi_rest", "binance_um_rest"),
        "预测市场到 Binance U 本位合约的映射维表。",
    ),
    DatasetDefinition(
        "predict_research_panel",
        "projection",
        "predict",
        "rebuild",
        "15m_1h_4h_1d",
        (
            "polymarket_clob",
            "polymarket_data_api",
            "kalshi_historical",
            "binance_um_rest",
            "binance_um_ws",
        ),
        "统一研究面板与因子承载对象。",
    ),
)


LEGACY_SERVICES: tuple[LegacyServiceDefinition, ...] = (
    LegacyServiceDefinition(
        "polymarket_bot",
        "services/polymarket",
        "legacy_active",
        "实时信号消费与 Telegram 投递。",
    ),
    LegacyServiceDefinition(
        "kalshi_bot",
        "services/kalshi",
        "legacy_active",
        "实时信号消费与 Telegram 投递。",
    ),
    LegacyServiceDefinition(
        "opinion_bot",
        "services/opinion",
        "retired",
        "已退役；不得恢复或复活。",
    ),
)


def dataset_ids() -> tuple[str, ...]:
    """返回冻结的 dataset id 列表。"""

    return tuple(dataset.dataset_id for dataset in DATASETS)
