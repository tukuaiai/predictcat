# 变更日志

所有重要变更记录在此文件。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

## [Unreleased]

### Added
- 建立单一真源文档体系
- 创建 `docs/index.md` 作为文档唯一入口
- 添加 ADR、Prompt、会话、复盘模板
- 添加 PR 模板和验证脚本
- 添加 Git 钩子和 CI 配置
- 新增仓库根 `.env.example`
- 新增 `services/shared/env.js` 作为独立仓库环境变量引导层

### Changed
- 迁移散落文档到 `docs/design/` 和 `docs/requirements/`
- 将仓库语义从 `tradecat` 插件路径切换为独立维护的 `predictcat`
- legacy 服务改为优先加载仓库根 `.env` / 服务目录 `.env`

---

## [1.0.0] - 2025-12-25

### Added
- 价格套利检测模块
- 订单簿失衡检测模块
- 扫尾盘信号模块
- 新市场检测模块
- 价格突变检测模块
- 巨鲸跟踪模块
- 深度套利模块
- 流动性枯竭预警模块
- 订单簿倾斜突变模块
- 聪明钱跟踪模块
- Google Cloud 翻译集成
- Telegram Bot 推送

---
*详细变更记录见 `docs/changelog/`*
