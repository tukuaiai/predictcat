# AGENTS.md - PredictCat 仓库约束

本文件作用域：仓库根目录及其全部子目录（`./**`）。

## 目录职责

```text
predictcat/
├── src/predict/         # 主链：dataset-first 控制面与数据生产骨架
├── services/            # legacy 运行壳与最小共享运行时能力
├── docs/                # 架构文档、调研与历史资料
├── scripts/             # 兼容脚本与辅助脚本
├── tests/               # Python 控制面测试
└── libs/external/       # 外部参考库（只读）
```

## 允许

- 修改 `src/predict/**` 下的配置、registry、runtime、sources、storage、validators、datasets
- 修改 `services/polymarket/**`、`services/kalshi/**`、`services/shared/**` 的运行文档与最小兼容补丁
- 更新 `README.md`、`AGENTS.md`、`docs/**`、测试与独立仓库基础文件
- 保持 `opinion` 退役状态，并在 registry 中继续标记为 retired

## 禁止

- 禁止在 `libs/external/**` 下写入或改源码
- 禁止重新创建 `services/opinion/**`
- 禁止把新的 dataset / backfill / factor 主逻辑继续写回 legacy `bot.js`
- 禁止重新引入 `TradeCat` 专属路径、`core/query` 假设或宿主仓库 `.env` 搜索规则
- 禁止把运行时缓存、日志、翻译文件当成长期真相源

## Golden Path

```bash
cd /home/lenovo/.projects/cat/predictcat

make plan
make doctor
make audit
make test
make verify
```

legacy 运行仅用于兼容：

```bash
cd /home/lenovo/.projects/cat/predictcat/services/polymarket && npm start
cd /home/lenovo/.projects/cat/predictcat/services/kalshi && npm start
```

## 架构规则

- `src/predict/registry.py` 是 source / dataset / legacy 真相矩阵
- `src/predict/config.py` 是独立仓库配置真相源，不绑定具体宿主
- `src/predict/service_entry.py` 是 `plan / doctor / audit` 统一入口
- `src/predict/sources/` 只负责来源适配，不直接定义研究口径
- `src/predict/datasets/` 按稳定交付对象组织，不按脚本或信号模块组织
- `services/` 只允许保留 legacy consumer 行为，不允许长成第二主链

## 生命周期约束

- 所有正式 dataset 必须先冻结：主键、时间语义、来源、幂等策略、回补策略
- append-only 优先，`latest_*` 只能作为派生层
- 同时保留 `event_time / observed_at / ingested_at`
- 研究 / 因子 / 回测 / 宿主插件只消费 canonical dataset 或 projection，不直接消费 legacy 内存态

## 文档同步

- 只要改目录结构、边界、入口命令、控制面约束，必须同步更新 `README.md` 和本文件
- 若修改 `services/` 的职责边界，必须同步更新对应子目录 `README.md` / `AGENTS.md`
- 若修改 `docs/` 的信息架构，必须同步更新 `docs/index.md` 与 `docs/AGENTS.md`

## 验证门槛

```bash
cd /home/lenovo/.projects/cat/predictcat
make test
make verify
```
