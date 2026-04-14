# kalshi legacy 服务约束

本文件作用域：`services/kalshi/**`。

## 当前定位

- `services/kalshi` 是 legacy 实时信号 Bot
- 它负责兼容已有运行链，不再承载长期 dataset 主链
- 新的数据采集、历史回补、研究与控制面能力统一落到 `src/predict/**`

## 修改边界

- 允许做最小兼容补丁、运行说明修正与边界收口
- 禁止在本目录继续扩张 dataset / factor / query 真相
- 若修改目录职责，必须同步更新根 `README.md` / `AGENTS.md`

## 验证建议

```bash
cd /home/lenovo/.projects/cat/predictcat/services/kalshi
npm test
```
