# services（legacy 运行壳）

本目录不再承载 `predictcat` 的主数据平台职责。

当前只保留：

- `shared/`
- `polymarket/`
- `kalshi/`

它们的定位是：

- 共享运行时引导层
- 实时信号消费器
- Telegram 投递器
- legacy 兼容运行壳

不再允许：

- 新增 dataset 主链
- 新增历史回补主链
- 新增研究面板真相

`opinion/` 已退役并删除，不再作为运行单元保留。
