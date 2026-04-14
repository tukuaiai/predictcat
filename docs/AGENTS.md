# docs/

本目录存放 `predictcat` 的架构文档、生态调研与历史材料；目标是让新读者在 5 分钟内看清：系统是什么、为什么这么设计、下一步改哪里。

```text
docs/
├── AGENTS.md
├── index.md                          # 文档索引
├── architecture.md                   # 项目总体架构概览
├── deployment.md                     # 部署说明
├── polymarket_repos_analysis*.md     # Polymarket 外部生态调研
├── developers/                       # 开发者辅助文档
├── prompts/                          # 模板
├── sessions/                         # 会话模板
└── retros/                           # 复盘模板
```

## 维护原则

- 活跃文档与历史材料要分层表达，避免把过时结论伪装成当前事实
- 若历史文档保留旧仓库路径，必须明确其为“历史上下文”，不要让它冒充现行结构
- 任何新增/变更核心流程（数据契约、运行边界、部署入口）都要同步更新文档索引与相关说明，否则等同于系统失忆
