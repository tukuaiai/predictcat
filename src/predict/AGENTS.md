# src/predict 控制面约束

本文件作用域：`src/predict/**`。

## 职责边界

- `config.py`：独立仓库配置真相源
- `registry.py`：source / dataset / legacy 真相矩阵
- `service_entry.py`：`plan / doctor / audit` 统一入口
- `runtime/`：运行时探针与审计摘要
- `sources/`：Polymarket / Kalshi 来源适配层
- `storage/`：落地层占位
- `validators/`：质量门禁占位
- `datasets/`：未来 dataset 单元落点

## 强规则

- 新增长期能力优先改 `registry.py`，先冻结契约，再补实现
- 这里保持 host-agnostic，不绑定具体宿主仓库或读出口
- 不要把 legacy Bot 行为复制进这里
- 注释、文档与输出文本使用中文；标识符使用英文
