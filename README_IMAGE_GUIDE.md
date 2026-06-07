# README Image Guide / README 配图建议

| 位置 | 推荐文件名 | 图片类型 | 内容说明 | 尺寸建议 | 是否必需 | 没有图片时的占位方式 |
| --- | --- | --- | --- | --- | --- | --- |
| Logo / Icon | `public/healthlens-logo.svg` | Logo / App icon | 设计一个简洁的 HealthLens AI 标识，可结合“镜片 / 放大镜 / 血检指标线”元素，适合在 README 顶部和浏览器 favicon 中复用。 | 512 × 512 px，另备 SVG | 必需 | 在 README 顶部保留 `[Project Logo]` |
| Hero Banner 或 Hero Demo | `picture/hero-demo.png` | 产品 Hero 截图 | 展示第一屏产品体验，建议包含侧边导航、仪表盘主区域、健康分数、异常指标摘要和趋势卡片；画面应真实来自应用界面。 | 1600 × 900 px | 必需 | 使用 `[Hero Demo Image: show the dashboard and report insight experience here]` |
| 主功能截图 | `picture/features.png` | 功能总览图 | 当前已有图片可继续使用；建议确保图中能同时露出上传、报告详情、趋势和 AI 解读入口，帮助读者快速理解模块关系。 | 1600 × 900 px | 必需 | 使用 `[Feature Screenshot: upload, dashboard, timeline, and insights overview]` |
| 核心流程图 | `picture/workflow.png` | 流程图 / Mermaid 导出图 | 展示从“上传报告图片”到“Doubao Ark 解析 / localStorage / mockData”再到页面展示的流程；视觉上保持白底、细线、少色。 | 1400 × 800 px | 建议 | README 中保留 Mermaid 流程图 |
| 使用场景图或结果图 | `picture/report-result.png` | 报告详情截图 | 展示单份报告解析后的结果页，重点露出指标卡片、参考范围、状态标签和通俗解释；适合替换当前 `picture/1.png` 为更完整的首屏截图。 | 1600 × 1000 px | 必需 | 使用 `[Report Result Screenshot: biomarker cards with status and explanations]` |
| 配置界面或配置示例图 | `picture/config-example.png` | 配置示例图 | 展示 `.env.local` 的关键变量和 Upload 页未配置 / 已配置 API Key 的提示状态；不要暴露真实密钥。 | 1200 × 700 px | 建议 | 使用代码块展示 `VITE_ARK_API_KEY` 和 `ARK_API_KEY` |
| 架构图 | `picture/architecture.png` | 系统架构图 | 展示 React UI、mockApi 路由层、Doubao Ark AI 服务、本地存储和 mock 数据之间的关系；适合放在“技术架构”章节。 | 1400 × 900 px | 建议 | README 中保留模块说明表和 Mermaid 图 |
| 可选 GIF / 动图 | `picture/upload-flow.gif` | 8-12 秒操作 GIF | 录制从 `/upload` 上传报告图片，到解析进度，再进入报告详情页的完整交互；只保留关键步骤，避免过长。 | 1280 × 720 px，控制在 8 MB 内 | 可选 | 使用静态 `picture/demo.png` |
| 社区、赞助或生态相关图片 | `picture/community-card.png` | 社区 / 维护状态卡片 | 如果项目后续开放社区、文档站或赞助入口，可放一个简洁的项目生态卡片；当前不建议强行加入。 | 1200 × 630 px | 可选 | 在 README 中保留 `[Docs URL]`、`[Contact]` 占位符 |
