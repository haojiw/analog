# analog · 会议记录

---

## 产品

**北极星：** 把你说过的话，变成你留给自己的东西。

**隐喻：** 达尔文在小猎犬号上的笔记本。每天记录普通的观察，五年后拼出了进化论。你在航行，每天开口说的话是你的航海日志。

**楔入点：** 给十年后的自己讲故事的人。坐下来讲一段感情、一次和父母的对话、一个关于自己的困惑。不急着被回答，只是不想忘记。

**产品人格：** non-intrusive，有求必应。录完不立即回应，只有存储动画。AI 是独立入口，用户主动召唤才出现。所有人都在做更主动的 AI，这个产品在做一个懂得沉默的 AI。

**输入优先级：** 语音（首要）→ 视频（同等）→ 文字（允许）

rawness 在语音本身，不在文字。文字必须可读——有标点、有分段、修正口误。

---

## 技术栈

| 层 | 选型 |
|----|------|
| 前端 | Expo (React Native) + NativeWind |
| 样式 | 自定义 theme token，见 `docs/aesthetics.md` |
| 语音转文字 | AssemblyAI → Gemini 润色 |
| AI 对话 | Claude API，memory 通过传历史 transcript 实现 |
| 后端 | Supabase（用户 + 数据库 + 文件存储）+ Edge Functions |
| 部署 | Vercel |
| 包管理 | npm |
| Auth | Magic Link |

---

## MVP 范围

目标是融资 demo。需要震撼，不需要健壮。

**必须有：** 丝滑语音录入 / 存储动画 / 转文字日志列表 / AI 对话入口（能答「我最近在纠结什么」）

**可占位：** 用户系统 / Weekly Wrapped / My Portrait

**现在不做：** 多端 / 视频输入 / 后端扩展性

---

## UX 三个高风险断点

- 录音第一秒：简短文案打破空白感，如「今天发生了什么？」
- 录完之后：存储动画 + 「已存入你的航海日志」接住用户
- AI 第一次出现：第一印象决定这个功能的生死，必须极其用心

---

## 留存机制

- **回音：** AI 拿着三个月前的话问「后来呢」
- **时间感：** 叙事式轨迹呈现，不是数据 dashboard
- **仪式感：** 录音动作有重量，强化「给未来自己留东西」的意识

增长靠 My Portrait / Weekly Wrapped 的输出让用户想截图分享，不靠撒网推广。

**商业模式：** 订阅制。免费层限制 AI 回溯条数，付费解锁全部记忆。存的越多越离不开。

---

## 数据模型

转录数据流：录音完成 → 上传 Supabase Storage → 创建 entry（status: uploaded）→ 提交 AssemblyAI → 轮询结果（每 3 秒）→ Gemini 润色 → 存回（status: done）

entries 表核心字段：`audio_url` / `duration_seconds` / `raw_transcript` / `formatted_text` / `summary` / `embedding` / `status`

Row Level Security 开启，用户只能访问自己的数据。

---

## Feature 架构

- **record** — 输入层。语音 / 文字 / 视频，只管「记」
- **journal** — 读取层。Chronological，原子化 entry，含详情页
- **subconscious** — 被动 AI。后台运作，主动呈现。Portrait / Wrapped / Knowledge Graph / 回音。用户是观众
- **conscious** — 主动 AI。用户召唤，实时交互。Chat / Search / Memory Query。用户是提问者
- **settings** — 基础设施

subconscious / conscious 的分裂是产品哲学在架构层的体现。

---

## 目录结构

```
analog/
├── CLAUDE.md
├── .claude/
│   ├── agents/
│   └── commands/
├── docs/
│   ├── aesthetics.md
│   ├── architecture.md
│   ├── ai-strategy.md
│   └── data-schema.md
├── memory/                      # .gitignore
│   ├── decisions/
│   └── meetings/
├── supabase/
│   ├── functions/
│   └── migrations/
├── apps/
│   ├── mobile/
│   │   ├── CLAUDE.md
│   │   ├── app/
│   │   │   ├── (tabs)/
│   │   │   ├── (auth)/
│   │   │   └── entry/[id].tsx
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── record/
│   │   │   │   ├── journal/
│   │   │   │   ├── subconscious/
│   │   │   │   ├── conscious/
│   │   │   │   └── settings/
│   │   │   ├── core/
│   │   │   │   ├── services/
│   │   │   │   └── providers/
│   │   │   ├── shared/
│   │   │   └── theme/
│   │   └── assets/
│   ├── web/
│   └── landing/
└── packages/
    └── shared-types/
```

---

## 工作方式

- Git：Feature branch → merge to main
- 测试：TDD。新功能先写失败测试，测试通过才算完成。Jest + React Native Testing Library，测试文件与组件并排放
- 自主权：每个大 feature 开工前开会讨论，开工后直接执行。以下情况暂停等确认：新 feature 启动 / 改数据库 schema / 引入新第三方依赖 / 改路由结构

---

## CLAUDE.md 分工

- **根层 `analog/CLAUDE.md`：** 项目 identity、技术栈地图、决策边界、指向 `docs/` 的指针
- **`apps/mobile/CLAUDE.md`：** Expo 命令、导航结构、测试方式、feature 边界

---

## Plantalk 迁移

Plantalk 是 analog 的前身，本地存储，无云端后端。analog 从零重建，但部分底层工程值得参考。

**初步判断可借鉴：** TranscriptionService 队列架构 / useRecorder 状态机 / Waveform 组件 / feature-based 目录分层

**初步判断需重建：** AI 层（从处理管道变成有记忆的伴侣）/ 数据模型（加 embedding）/ 录音后体验 / 视觉语言 / 转录策略

具体每个决定将在迁移评审会中逐一拍板，结论记入 `memory/decisions/plantalk-migration.md`。

---

## 下一步

1. 将本文件及产品核心、美学文档放入 analog 根目录
2. 让 Claude Code 读取所有 md 文件，初始化项目结构，写 CLAUDE.md 及 docs/ 四个文件
3. 召开迁移评审会
