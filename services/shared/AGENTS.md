# services/shared 约束

本文件作用域：`services/shared/**`。

## 当前职责

- `env.js`：独立仓库环境变量加载入口

## 强规则

- 这里只放 legacy 运行壳的共用引导层
- 禁止把 dataset、factor、storage、query 主逻辑放进来
- 优先保持零外部依赖或最小依赖，避免共享层反向耦合到单个服务的 `node_modules`
