# 文档中心

> 本文件是 `predictcat` 当前文档的统一入口。历史文档保留，但不自动代表当前事实。

## 核心文档

| 文档 | 用途 | 状态 |
|------|------|------|
| `architecture.md` | 项目总体架构概览 | 活跃 |
| `deployment.md` | 部署与运行说明 | 活跃 |
| `polymarket_repos_analysis.md` | Polymarket 生态仓库调研摘要 | 活跃 |
| `polymarket_repos_analysis_detailed.md` | Polymarket 生态仓库详细分析 | 活跃 |
| `polymarket_repos_analysis_flat.md` | 平铺版调研记录 | 活跃 |

## 历史执行文档

以下文档主要用于保留迁移、性能修复与历史分析上下文：

- `ALGORITHM_FIX_PLAN.md`
- `ALGORITHM_SPEC.md`
- `ARCH_OPTIMIZATION_EXECUTION_PLAN.md`
- `CACHE_POLICY_PLAN.md`
- `FIX_PLAN_SUPPLEMENT.md`
- `PERFORMANCE_TUNING_REPORT.md`
- `POLYMARKET_LINK_FORMAT.md`
- `TELEGRAM_PERFORMANCE_FIX.md`
- `Polymarket 套利全解析.md`

## 模板与协作资产

| 路径 | 用途 |
|------|------|
| `prompts/0000-template.md` | Prompt 模板 |
| `sessions/YYYYMMDD-template.md` | 会话模板 |
| `retros/YYYYMMDD-template.md` | 复盘模板 |
| `developers/proxy-wallet.md` | 开发者辅助文档 |

## 外部参考

- `../libs/external/poly-sdk-main/docs/`
- `../libs/external/clob-client-main/`

## 维护说明

- 若文档中出现旧仓库路径，请按“历史上下文”理解
- 当前结构与运行入口以仓库根 `README.md`、根 `AGENTS.md` 和 `src/predict/service_entry.py` 为准
