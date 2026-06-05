--
-- PostgreSQL database dump
--

\restrict 07SEmosESJCTzGJALpIwNjMLSD5KHlfgbRkStg4433FbQpdZXtcQeH8TFJbTMDx

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.likes DROP CONSTRAINT likes_user_id_fkey;
ALTER TABLE ONLY public.likes DROP CONSTRAINT likes_post_id_fkey;
ALTER TABLE ONLY public.comments DROP CONSTRAINT comments_user_id_fkey;
ALTER TABLE ONLY public.comments DROP CONSTRAINT comments_post_id_fkey;
ALTER TABLE ONLY public.comments DROP CONSTRAINT comments_parent_id_fkey;
DROP INDEX public.ix_users_username;
DROP INDEX public.ix_users_id;
DROP INDEX public.ix_users_email;
DROP INDEX public.ix_posts_slug;
DROP INDEX public.ix_posts_is_deleted;
DROP INDEX public.ix_posts_id;
DROP INDEX public.ix_likes_id;
DROP INDEX public.ix_comments_is_deleted;
DROP INDEX public.ix_comments_id;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.likes DROP CONSTRAINT uq_like_user_post;
ALTER TABLE ONLY public.posts DROP CONSTRAINT posts_pkey;
ALTER TABLE ONLY public.likes DROP CONSTRAINT likes_pkey;
ALTER TABLE ONLY public.comments DROP CONSTRAINT comments_pkey;
ALTER TABLE ONLY public.alembic_version DROP CONSTRAINT alembic_version_pkc;
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.posts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.likes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.comments ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.users_id_seq;
DROP TABLE public.users;
DROP SEQUENCE public.posts_id_seq;
DROP TABLE public.posts;
DROP SEQUENCE public.likes_id_seq;
DROP TABLE public.likes;
DROP SEQUENCE public.comments_id_seq;
DROP TABLE public.comments;
DROP TABLE public.alembic_version;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: blog
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO blog;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: blog
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    post_id integer NOT NULL,
    parent_id integer,
    content text NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.comments OWNER TO blog;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: blog
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO blog;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: blog
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: likes; Type: TABLE; Schema: public; Owner: blog
--

CREATE TABLE public.likes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    post_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.likes OWNER TO blog;

--
-- Name: likes_id_seq; Type: SEQUENCE; Schema: public; Owner: blog
--

CREATE SEQUENCE public.likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.likes_id_seq OWNER TO blog;

--
-- Name: likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: blog
--

ALTER SEQUENCE public.likes_id_seq OWNED BY public.likes.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: blog
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    content text NOT NULL,
    summary character varying(500) NOT NULL,
    categories character varying[] NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    tags character varying[] DEFAULT '{}'::character varying[] NOT NULL,
    internal_links character varying[] DEFAULT '{}'::character varying[] NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.posts OWNER TO blog;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: blog
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posts_id_seq OWNER TO blog;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: blog
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: blog
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(320) NOT NULL,
    username character varying(64) NOT NULL,
    hashed_password character varying(128) NOT NULL,
    avatar character varying(512) DEFAULT ''::character varying NOT NULL,
    bio text,
    website character varying(512),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_login_at timestamp with time zone,
    is_admin boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.users OWNER TO blog;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: blog
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO blog;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: blog
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: blog
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: likes id; Type: DEFAULT; Schema: public; Owner: blog
--

ALTER TABLE ONLY public.likes ALTER COLUMN id SET DEFAULT nextval('public.likes_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: blog
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: blog
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: blog
--

INSERT INTO public.alembic_version (version_num) VALUES ('007');


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: blog
--

INSERT INTO public.comments (id, user_id, post_id, parent_id, content, is_visible, created_at, is_deleted, deleted_at) VALUES (1, 2, 7, NULL, '测试评论功能', true, '2026-06-03 04:14:35.039127+00', false, NULL);
INSERT INTO public.comments (id, user_id, post_id, parent_id, content, is_visible, created_at, is_deleted, deleted_at) VALUES (2, 2, 7, 1, '这是回复', true, '2026-06-03 04:17:03.808108+00', false, NULL);
INSERT INTO public.comments (id, user_id, post_id, parent_id, content, is_visible, created_at, is_deleted, deleted_at) VALUES (3, 1, 5, NULL, '测试', true, '2026-06-03 05:44:51.754917+00', false, NULL);


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: blog
--

INSERT INTO public.likes (id, user_id, post_id, created_at) VALUES (3, 1, 6, '2026-06-03 05:44:37.071931+00');
INSERT INTO public.likes (id, user_id, post_id, created_at) VALUES (5, 1, 5, '2026-06-03 05:44:56.94266+00');


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: blog
--

INSERT INTO public.posts (id, title, slug, content, summary, categories, is_published, created_at, tags, internal_links, is_deleted, deleted_at) VALUES (5, '测试', 'my-real-first-post', '通过后端接口上传的第一篇测试博客', '测试', '{笔记}', true, '2026-05-27 03:40:16.397057+00', '{}', '{}', false, NULL);
INSERT INTO public.posts (id, title, slug, content, summary, categories, is_published, created_at, tags, internal_links, is_deleted, deleted_at) VALUES (6, 'Claude Code 完整拆解报告', 'claude-code-拆解报告', '# Claude Code 完整拆解报告

> 基于 Claude Code 泄露源码、官方仓库、逆向工程克隆、开源重建、学术分析论文及教学材料的综合分析
>
> 分析版本: v2.1.88 (泄露源码) / v2.6.5 (CCB) / v2.0.0 (OCC)

---

## 目录

1. [总览](#1-总览)
2. [架构设计](#2-架构设计)
3. [核心工作流](#3-核心工作流)
4. [工具系统](#4-工具系统)
5. [命令系统](#5-命令系统)
6. [上下文管理](#6-上下文管理)
7. [权限与安全](#7-权限与安全)
8. [子智能体与协调](#8-子智能体与协调)
9. [扩展机制](#9-扩展机制)
10. [UI/交互层](#10-ui交互层)
11. [记忆与会话](#11-记忆与会话)
12. [外部集成](#12-外部集成)
13. [模型适配层](#13-模型适配层)
14. [工程基础设施](#14-工程基础设施)

---

## 1. 总览

### 1.1 什么是 Claude Code

Claude Code 是 Anthropic 推出的终端级 AI 编码助手。它是一个运行在终端中的 CLI 工具，通过 **ReAct 模式 Agent Loop** 与 Claude 大模型交互，能够读取代码库、编辑文件、执行 Shell 命令、搜索代码、管理 Git 工作流，以及通过子智能体进行复杂的多步骤任务。

### 1.2 核心哲学

Claude Code 的设计遵循一个根本原则：**模型负责推理（Agency），Harness 负责执行边界（Infrastructure）**。源码分析发现，Claude Code 约 1900 个文件中，仅有 **1.6% 是 AI 决策逻辑**，其余 **98.4% 是确定性基础设施**——权限门控、上下文管理、工具路由、恢复逻辑、会话持久化等。

```
Claude Code = 一个 Agent Loop + 工具集 + 权限系统 + 上下文管理 + 扩展生态
                (while-loop)   (~54工具)  (7层安全)   (5级压缩)    (4种机制)
```

### 1.3 技术概要

| 维度 | 详情 |
|------|------|
| 语言 | TypeScript (strict mode) |
| 运行时 | Bun (非 Node.js) |
| UI 框架 | React + Ink (终端渲染) |
| 构建工具 | Bun.build() + Vite (代码分割) |
| 代码规模 | ~1,900 文件 / ~512,000 行 |
| 模型提供商 | Anthropic / OpenAI / Gemini / Grok / Bedrock / Vertex / Foundry |
| 工具数量 | 约 54 个内置工具 (核心 38 个 + 条件加载 16 个) |
| 命令数量 | 50+ 个斜杠命令 |
| 权限模式 | 7 种 (plan/default/acceptEdits/auto/dontAsk/bypassPermissions/bubble) |

### 1.4 源码生态全景

本报告基于 7 个代码/文档资源的综合分析：

| 资源 | 性质 | 用途 |
|------|------|------|
| `claude-code-disclose-initial` | 2026.3.31 npm source map 泄露源码 | 最完整原始实现参考 |
| `claude-code-official` | Anthropic 官方 GitHub 仓库 | 插件/文档/CI/配置体系 |
| `claude-code-unofficial` (CCB) | 逆向工程克隆 (v2.6.5) | 文档化参考实现 |
| `open-claude-code` (OCC) | 干净房开源重建 (v2.0.0) | 简化架构理解 |
| `learn-claude-code` | 教学实训 (20 课) | 机制分解与概念 |
| `Dive-into-Claude-Code` | 学术分析论文 | 顶层架构框架 |
| `doc` | 两篇研究论文 | 配置与设计空间分析 |

---

## 2. 架构设计

### 2.1 四问定义架构

Claude Code 的架构围绕四个根本设计问题展开：

| 设计问题 | Claude Code 的回答 |
|----------|-------------------|
| 推理放在哪里？ | 模型推理，Harness 强制执行。1.6% AI + 98.4% 基础设施 |
| 多少个执行引擎？ | **一个** `queryLoop` 供所有入口共用（CLI/SDK/IDE） |
| 默认安全姿态？ | **拒绝优先**：拒绝 > 询问 > 允许，最严格的规则优先 |
| 核心资源约束？ | **上下文窗口**（~200K token），5 种压缩策略在每次模型调用前运行 |

### 2.2 五层子系统架构

```
┌─────────────────────────────────────────────────────┐
│  表层 (Surface)                                      │
│  CLI · Headless (-p) · Agent SDK · IDE/Desktop       │
├─────────────────────────────────────────────────────┤
│  核心层 (Core)                                       │
│  queryLoop · 5级压缩管道 · 子智能体生成 · QueryEngine │
├─────────────────────────────────────────────────────┤
│  安全/行动层 (Safety/Action)                          │
│  7种权限模式 · Auto分类器 · 27种钩子事件 · 工具池     │
├─────────────────────────────────────────────────────┤
│  状态层 (State)                                      │
│  JSONL 转录稿 · CLAUDE.md 层级 · 自动记忆 · 侧链文件 │
├─────────────────────────────────────────────────────┤
│  后端层 (Backend)                                    │
│  Shell执行 · MCP连接 (7种传输) · 文件系统 · Web获取   │
└─────────────────────────────────────────────────────┘
```

### 2.3 七组件系统结构

```
User → Interfaces → Agent Loop → Permission System → Tools → State & Persistence → Execution Environment
```

1. **User** — 提交提示、审批权限、审查输出
2. **Interfaces** — 交互式 CLI / Headless CLI / Agent SDK / IDE / Desktop
3. **Agent Loop** — `queryLoop` 异步生成器：模型调用 → 工具分发 → 结果收集 → 重复
4. **Permission System** — 拒绝优先规则 + auto-mode ML 分类器 + 钩子拦截
5. **Tools** — 最多 54 个内置工具 + MCP 工具，通过 `assembleToolPool` 组装
6. **State & Persistence** — 仅追加 JSONL 转录稿、提示历史、子智能体侧链
7. **Execution Environment** — Shell（带沙箱）、文件系统、Web 获取、MCP 连接

### 2.4 关键设计决策

#### 5 个核心价值观 → 13 个设计原则

| 价值 | 核心思想 |
|------|---------|
| Human Decision Authority | 人类通过 principal hierarchy 保留控制权 |
| Safety/Security/Privacy | 系统在人类警惕性下降时仍能保护安全 |
| Reliable Execution | gather-act-verify 循环 + 优雅恢复 |
| Capability Amplification | "Unix 工具，而非产品" — 98.4% 是确定性基础设施 |
| Contextual Adaptability | CLAUDE.md 层级、渐进式扩展、信任轨迹 |

**13 个设计原则** (部分关键原则):
- **Deny-first with human escalation**: 拒绝优先，承认有限批准
- **Defense in depth**: 7 个独立安全层，任何一层都可阻止
- **Context as scarce resource**: 5 层渐进式压缩，非一次性截断
- **Append-only durable state**: JSONL 仅追加，不破坏性编辑
- **Minimal scaffolding, maximal harness**: 最少脚手架，最强基础设施
- **Transparent file-based config and memory**: Markdown 文件，人工可读写可版本控制

### 2.5 核心模块总览

```
src/
├── main.tsx                  # CLI 入口 (Commander.js + React/Ink)
├── entrypoints/cli.tsx       # 真正启动入口，多路径快速分发
├── QueryEngine.ts            # LLM 查询引擎 (~46K 行)
├── query.ts                  # 查询管线 (核心 queryLoop)
├── context.ts                # 上下文收集
├── Tool.ts                   # 工具类型定义 (~29K 行)
├── tools.ts                  # 工具注册中心
├── commands.ts               # 命令注册中心 (~25K 行)
├── commands/                 # 50+ 斜杠命令实现
├── tools/                    # ~40 个工具实现
├── components/               # ~140 个 Ink UI 组件
├── services/
│   ├── api/                  # Anthropic API 客户端
│   ├── mcp/                  # MCP 连接管理
│   ├── oauth/                # OAuth 2.0 认证
│   ├── compact/              # 上下文压缩
│   └── plugins/              # 插件加载器
├── utils/
│   ├── permissions/          # 权限引擎
│   ├── bash/                 # Bash 解析器/AST
│   ├── git/                  # Git 操作
│   └── settings/             # 设置管理器
├── bridge/                   # IDE 双向通信层
├── coordinator/              # 多代理协调器
├── ink/                      # 自定义 Ink 终端渲染器
├── state/                    # 状态管理 (AppState)
└── hooks/                    # React hooks (toolPermission 等)
```

---

## 3. 核心工作流

### 3.1 Agent Loop: 简单但完整的 while 循环

CLI、SDK、IDE 等所有入口最终都汇聚到同一个核心循环——位于 `query.ts` 的 `queryLoop` 异步生成器。

```
┌──────────────────────────────────────────────┐
│              THE AGENT LOOP                   │
│                                              │
│  User → messages[] → LLM → response          │
│                       │                      │
│             stop_reason == "tool_use"?        │
│            /                        \        │
│          yes                         no      │
│           │                           │      │
│     execute tools               return text  │
│     append results                           │
│     loop back ────────────────→ messages[]    │
│                                              │
│  实现为一个 AsyncGenerator，yield 13 种事件类型│
└──────────────────────────────────────────────┘
```

#### 核心代码模式 (Python 版简化)

```python
def agent_loop(messages):
    while True:
        response = client.messages.create(
            model=MODEL, system=SYSTEM,
            messages=messages, tools=TOOLS,
        )
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason != "tool_use":
            return  # 模型决定停止

        results = []
        for block in response.content:
            if block.type == "tool_use":
                output = tool_handlers[block.name](**block.input)
                results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": output
                })
        messages.append({"role": "user", "content": results})
```

#### OCC (JavaScript) 版 AsyncGenerator 的 13 种事件类型

```javascript
async function* run(userMessage, options = {}) {
    yield { type: ''stream_request_start'' };
    // streaming events...
    yield { type: ''stream_event'', text: ''...'' };
    yield { type: ''thinking'', text: ''...'' };
    yield { type: ''assistant'', content: ''...'' };
    yield { type: ''tool_progress'', tool: ''bash'', status: ''running'' };
    yield { type: ''result'', tool: ''bash'', result: ''...'' };
    yield { type: ''compaction'', count: 3 };
    yield { type: ''error'', message: ''...'' };
    yield { type: ''hookPermissionResult'', tool: ''...'', allowed: false };
    yield { type: ''stop'', reason: ''end_turn'' };
}
```

### 3.2 9 步 Turn 执行管道

每个 turn 经过严格的 9 步流水线：

```
1. Settings Resolution → 2. State Init → 3. Context Assembly
    → 4. Five Pre-Model Shapers → 5. Model Call → 6. Tool Dispatch
    → 7. Permission Gate → 8. Tool Execution → 9. Stop Condition
```

### 3.3 五种停止条件

1. **no_tool_use** — 模型不调用任何工具，返回纯文本
2. **max_turns** — 达到最大轮次限制
3. **context_overflow** — 上下文超出窗口
4. **hook_intervention** — Stop 钩子阻止停止
5. **explicit_abort** — 用户/系统显式中断

### 3.4 五种恢复机制

1. **Max output token escalation** — 每轮最多重试 3 次，每次提高 max_tokens
2. **Reactive compaction** — 每轮最多触发一次应急压缩
3. **Prompt-too-long handling** — 尝试 context-collapse → reactive compaction → 终止
4. **Streaming fallback** — 流式失败后切换到非流式
5. **Fallback model** — 模型不可用时切换到备用模型

### 3.5 工具并行执行策略

- **StreamingToolExecutor** — 工具参数一到达就开始执行（优化延迟，边流式接收边执行）
- **Fallback runTools** — 将工具分类为 concurrent-safe（可并行）和 exclusive（需串行），按类执行

---

## 4. 工具系统

### 4.1 工具池组装管道 (5 步)

```
Base Enumeration (54 tools)
  → Mode Filtering (根据权限模式过滤)
  → Deny Pre-filtering (剥离被拒绝的工具)
  → MCP Integration (合并外部 MCP 工具)
  → Deduplication (去重，内置优先)
```

### 4.2 核心工具分类

#### 文件操作
| 工具 | 功能 |
|------|------|
| `FileReadTool` | 读取文件（文本/图片/PDF/Notebook） |
| `FileWriteTool` | 创建/覆写文件 |
| `FileEditTool` | 精确字符串替换编辑 |
| `GlobTool` | 文件模式匹配搜索 |
| `GrepTool` | ripgrep 内容搜索 |
| `NotebookEditTool` | Jupyter Notebook 编辑 |

#### Shell/执行
| 工具 | 功能 |
|------|------|
| `BashTool` | Shell 命令执行（沙箱/超时/后台） |
| `PowerShellTool` | PowerShell 执行 |
| `REPLTool` | REPL 原始工具 |

#### Agent 系统
| 工具 | 功能 |
|------|------|
| `AgentTool` | 子智能体派生 |
| `TaskCreateTool/UpdateTool/ListTool/GetTool` | 任务 CRUD |
| `TaskOutputTool` | 后台任务输出 |
| `TaskStopTool` | 停止后台任务 |
| `SendMessageTool` | 智能体间消息 |
| `TeamCreateTool/DeleteTool` | 团队管理 |

#### 规划与模式
| 工具 | 功能 |
|------|------|
| `EnterPlanModeTool` | 进入计划模式 |
| `ExitPlanModeTool` | 退出计划模式 |
| `EnterWorktreeTool` | Git Worktree 隔离 |
| `ExitWorktreeTool` | 退出 Worktree |

#### 外部集成
| 工具 | 功能 |
|------|------|
| `WebFetchTool` | URL 内容获取 |
| `WebSearchTool` | 网页搜索 |
| `MCPTool` | MCP 服务器工具调用 |
| `LSPTool` | LSP 协议集成 |

#### 其他
| 工具 | 功能 |
|------|------|
| `SkillTool` | 技能执行（注入当前上下文） |
| `AskUserQuestionTool` | 向用户提问 |
| `CronCreateTool/DeleteTool/ListTool` | Cron 调度 |
| `SyntheticOutputTool` | 结构化输出生成 |
| `ToolSearchTool` | 延迟工具发现（TF-IDF 语义搜索） |

### 4.3 工具定义结构

每个工具是一个自包含模块，定义三个核心部分：

```typescript
interface Tool {
  name: string;                    // 工具名称
  description: string;             // 给模型的自然语言描述
  input_schema: ToolInputJSONSchema;  // JSON Schema 参数定义
  permissionModel?: PermissionModel;  // 权限模型
  call(input: ToolInput): Promise<ToolResult>;  // 执行逻辑
  validateInput?(input: unknown): string[];     // 参数校验
}
```

### 4.4 CORE_TOOLS 白名单

Claude Code 定义了 `CORE_TOOLS` 常量（38 个核心工具名），用于延迟加载工具的判定。非核心工具通过 `ToolSearchTool` 按需发现和加载，减少初始上下文消耗。

---

## 5. 命令系统

### 5.1 架构

命令系统与工具系统是**正交**的：

| 维度 | 命令 (Commands) | 工具 (Tools) |
|------|-----------------|--------------|
| 触发方式 | 用户输入 `/` 前缀 | LLM 自动调用 |
| 注册器 | `commands.ts` (~25K 行) | `tools.ts` |
| 实现目录 | `src/commands/` | `src/tools/` |
| 目的 | 用户交互 | 模型操作 |

### 5.2 主要命令分类

#### 代码工作流
| 命令 | 功能 |
|------|------|
| `/commit` | 创建 Git 提交 |
| `/commit-push-pr` | 提交 + 推送 + 创建 PR |
| `/review` | 代码审查 |
| `/security-review` | 安全审查 |
| `/diff` | 查看变更 |
| `/pr_comments` | 查看 PR 评论 |

#### 会话管理
| 命令 | 功能 |
|------|------|
| `/compact` | 手动触发上下文压缩 |
| `/resume` | 恢复之前会话 |
| `/rewind` | 回退上下文 |
| `/clear` | 清除缓存/上下文 |
| `/export` | 导出会话 |
| `/share` | 分享会话 |
| `/rename` | 重命名会话 |

#### 配置与诊断
| 命令 | 功能 |
|------|------|
| `/config` | 设置管理 |
| `/doctor` | 环境诊断 |
| `/cost` | 查看使用成本 |
| `/context` | 上下文可视化 |
| `/stats` | 使用统计 |
| `/theme` | 主题切换 |
| `/vim` | Vim 模式切换 |

#### 扩展管理
| 命令 | 功能 |
|------|------|
| `/mcp` | MCP 服务器管理 |
| `/skills` | 技能管理 |
| `/memory` | 记忆管理 |
| `/hooks` | 钩子管理 |
| `/plugin` | 插件管理 |

#### 认证与连接
| 命令 | 功能 |
|------|------|
| `/login` / `/logout` | 认证 |
| `/ide` | IDE 连接 |
| `/desktop` | 桌面应用切换 |
| `/mobile` | 移动端切换 |

---

## 6. 上下文管理

### 6.1 上下文是核心资源约束

**上下文窗口（~200K token）是塑造几乎所有架构决策的约束条件。** 延迟工具模式加载、仅摘要的子智能体返回、每条工具结果预算——这些设计都源于上下文的稀缺性。

### 6.2 9 个有序上下文来源

每次模型调用时，上下文按以下顺序组装：

```
System Prompt → Environment Info → CLAUDE.md Hierarchy → Path-scoped Rules
  → Auto-memory → Tool Metadata → Conversation History → Tool Results → Compact Summaries
```

### 6.3 四级 CLAUDE.md 层级

| 级别 | 路径 | 范围 |
|------|------|------|
| Managed | `/etc/claude-code/CLAUDE.md` | 系统级（企业 MDM） |
| User | `~/.claude/CLAUDE.md` | 用户级 |
| Project | `CLAUDE.md` / `.claude/CLAUDE.md` / `.claude/rules/*.md` | 项目级 |
| Local | `CLAUDE.local.md` | 个人级（gitignored） |

**关键设计：** CLAUDE.md 作为 **user context** 传递（概率性遵从），而非 system prompt（确定性遵从）。真正提供确定性强制的，是权限规则层。

### 6.4 五层渐进式压缩管道

在**每次模型调用前**按开销从低到高顺序执行：

```
Budget Reduction → Snip → Microcompact → Context Collapse → Auto-Compact
    (始终)        (可选)     (始终)       (可选)            (最后手段)
```

| 阶段 | 策略 | 触发条件 |
|------|------|---------|
| **Budget Reduction** | 每条消息大小上限 | 始终启用 |
| **Snip** | 裁剪较旧的历史消息 | Feature-gated |
| **Microcompact** | 截断超过 5 轮的旧工具结果 | 始终启用，可选缓存感知路径 |
| **Context Collapse** | 读取时虚拟投影（非破坏性）| Feature-gated |
| **Auto-Compact** | 完整模型生成摘要（最后手段）| 当上述阶段都失败时 |

**原则：** 最便宜的压缩优先。保留最大信息量尽可能长时间。只有非破坏性压缩（读取时投影），从不破坏性编辑磁盘上的数据。

### 6.5 OCC 中的 ContextManager 实现

```javascript
class ContextManager {
    getTokenCount(messages)         // 基于字符的 Token 估算 (4 chars/token)
    shouldCompact(messages)         // 判断是否超过 80% 阈值
    microCompact(messages, turns)   // 截断超过N轮的旧工具结果
    compact(messages, keepRecent)   // 先尝试微压缩 → 完整压缩
}
```

### 6.6 Prompt 缓存策略

- 静态前缀（system prompt + CLAUDE.md）标记 `cache_control: { type: ''ephemeral'' }`
- 缓存命中时读取成本仅 10%，写入成本 125%，默认 TTL 5 分钟
- 这是使缓存感知型压缩在架构上有意义的平台特性

---

## 7. 权限与安全

### 7.1 七个独立安全层

请求必须通过**所有**适用层，任一层都可以阻止：

```
1. Tool Pre-filtering        → 被全局拒绝的工具从模型可见清单中移除
2. Deny-first Rule Evaluation → 拒绝始终覆盖允许（即使允许更具体）
3. Permission Mode Constraints → 当前活跃模式决定基线处理
4. Auto-mode ML Classifier   → 独立 LLM 调用评估安全性
5. Shell Sandboxing          → 文件系统 + 网络隔离
6. Non-restoration on Resume → 权限绝不跨会话边界保留
7. Hook-based Interception   → PreToolUse 钩子可修改或阻止操作
```

### 7.2 七种权限模式（渐进式信任光谱）

| 模式 | 行为 | 信任级别 |
|------|------|---------|
| `plan` | 用户在执行前批准所有计划 | 最低 |
| `default` | 标准交互式批准 | 低 |
| `acceptEdits` | 文件编辑 + 文件系统 shell 自动批准 | 中 |
| `auto` | ML 分类器评估工具安全性 | 高 |
| `dontAsk` | 无提示，拒绝规则仍强制执行 | 更高 |
| `bypassPermissions` | 跳过多数提示，安全关键检查保留 | 最高 |
| `bubble` | 内部：子智能体向父级上报 | 特殊 |

### 7.3 授权管道 (4 阶段)

```
Pre-filtering (剥离被拒绝的工具)
  → PreToolUse hooks (可返回 permissionDecision)
  → Rule evaluation (deny-first)
  → Permission handler (4 分支: coordinator/swarm/speculative/interactive)
```

### 7.4 Auto-mode 分类器

`yoloClassifier.ts`: 加载基础系统提示 + 权限模板（内部分离外部）。两阶段评估：

1. **Fast-filter** — 快速预判
2. **Chain-of-thought** — 深度推理

预计算的分类结果与超时时间竞争，超时则回退到交互式审批。

### 7.5 已知安全边界

- **共享故障模式：** 7 层安全均在 Token 经济约束下运行。超过 50 个子命令的命令完全绕过安全分析，导致事件循环饥饿
- **Pre-trust 执行窗口：** 钩子/MCP 服务器在初始化期间执行，早于信任对话框出现，形成在拒绝优先管道之外的结构性特权攻击窗口

---

## 8. 子智能体与协调

### 8.1 6 种内置子智能体类型

| 类型 | 用途 |
|------|------|
| **Explore** | 快速只读代码搜索 |
| **Plan** | 软件架构设计（实现方案规划） |
| **General-purpose** | 通用任务（默认） |
| **Guide** | Claude Code 使用问题解答 |
| **Verification** | 代码变更验证 |
| **Statusline-setup** | 状态行配置 |

### 8.2 SkillTool vs AgentTool 的关键区别

| | SkillTool | AgentTool |
|------|-----------|-----------|
| **上下文** | 注入当前上下文窗口 | 派生新的隔离上下文窗口 |
| **成本** | 低（共享上下文） | 高（约 7 倍 Token 消耗） |
| **返回** | 直接在当前对话中执行 | 仅摘要返回父级 |
| **用途** | 加载专业指导/规则 | 隔离执行子任务 |

### 8.3 三种隔离模式

| 模式 | 机制 | 默认 |
|------|------|------|
| **Worktree** | Git worktree 文件系统隔离 | 否 |
| **Remote** | 远程执行（内部专用） | 否 |
| **In-process** | 共享文件系统，隔离对话 | 是 |

### 8.4 侧链转录稿 (Sidechain Transcripts)

- 每个子智能体写入**独立的 `.jsonl` 文件**
- **只有摘要返回父级**，完整历史永不进入父级上下文——这是防止上下文爆炸的关键设计
- 多实例协调通过 POSIX `flock()` 零外部依赖

### 8.5 权限继承规则

- 子智能体 `permissionMode` 适用，**除非**父级在 `bypassPermissions`/`acceptEdits`/`auto` 模式下
- 如父级是显式用户决策，始终优先于子智能体设置

### 8.6 自定义 Agent 定义

```yaml
---
name: my-agent
description: A custom agent
tools: [Bash, Read, Edit, Glob, Grep]
disallowedTools: [Write]
model: claude-sonnet-4-6
effort: high
permissionMode: acceptEdits
mcpServers: [my-mcp-server]
hooks: [my-hook]
maxTurns: 50
skills: [my-skill]
background: false
isolation: worktree
---
```

---

## 9. 扩展机制

### 9.1 四种扩展机制（渐进式上下文成本）

| 机制 | 上下文成本 | 关键能力 |
|------|-----------|---------|
| **Hooks** | 零 | 27 个事件，4 种执行类型（shell/LLM/webhook/subagent验证器） |
| **Skills** | 低 | SKILL.md 含 15+ YAML frontmatter 字段 |
| **Plugins** | 中 | 10 种组件类型 |
| **MCP Servers** | 高 | 外部工具，7 种传输类型 |

### 9.2 三个注入点

```
assemble() → 模型看到什么：CLAUDE.md、skill 描述、MCP 资源、钩子注入的上下文
model()    → 模型能触达什么：内置工具、MCP 工具、SkillTool、AgentTool
execute()  → 操作是否/如何执行：权限规则、PreToolUse/PostToolUse 钩子、Stop 钩子
```

### 9.3 Hooks 系统

#### 27 种钩子事件

分为 5 大类：
- **生命周期**: SessionStart, SessionEnd, PrePrompt, PostResponse
- **工具**: PreToolUse, PostToolUse, PreToolPermission
- **停止**: Stop
- **通知**: Notification
- **其他**: PreCompact, PreMessageSend 等

#### 4 种执行类型

- **Shell 命令** — 启动外部进程，环境变量传递上下文
- **LLM-evaluated** — 使用模型评估（如 subagent verifier）
- **Webhook** — HTTP 回调
- **Subagent verifier** — 使用子智能体验证

#### Hook 定义示例

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "command": "python my_hook.py",
        "toolName": "Bash",
        "timeout": 5000
      }
    ]
  }
}
```

### 9.4 Skills 系统

Skills 是通过 `SkillTool` 注入当前上下文的知识/指令包。每个技能定义在一个 `SKILL.md` 文件中：

```markdown
---
name: code-review
description: Review code for correctness and style
trigger: review code
aliases: [cr, review]
---

# Code Review Skill
## When to use
...
```

关键特性：
- **按需加载** — 不预先占用上下文
- **语义匹配** — 两步匹配：先快速过滤，再深度语义匹配
- **SkillTool 注入** — 将技能指令注入当前对话上下文
- **去重** — `discoveredSkillsThisSession` Set 避免重复加载

### 9.5 Plugins 系统

#### Plugin 清单 (plugin.json) 支持 10 种组件类型

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "components": {
    "commands": ["./commands/my-command.md"],
    "agents": ["./agents/my-agent.md"],
    "skills": ["./skills/my-skill/"],
    "hooks": ["./hooks/my-hook.json"],
    "mcpServers": ["./mcp/my-server.json"],
    "lspServers": [],
    "outputStyles": [],
    "channels": [],
    "settings": [],
    "userConfig": []
  }
}
```

#### 安装方式
- 本地目录（从 `~/.claude/plugins/` 加载）
- Git 克隆（`claude plugin install <git-url>`）
- 市场安装（`claude plugin install <name>`）

### 9.6 MCP (Model Context Protocol) 集成

MCP 是外部工具/能力集成的主要通道，支持 7 种传输类型：

- stdio（标准输入/输出）
- SSE（Server-Sent Events）
- Streamable HTTP
- WebSocket
- SDK（编程式）
- IDE（IDE 桥接）
- Daemon（守护进程）

MCP 服务器配置示例：

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@my/mcp-server"],
      "env": { "API_KEY": "xxx" }
    }
  }
}
```

---

## 10. UI/交互层

### 10.1 React + Ink 终端渲染

Claude Code 使用 React + Ink（自定义 fork 版本）在终端中渲染完整 UI。这不是简单的文本输出，而是一个功能完整的终端 GUI。

#### Ink 渲染架构

```
React Components (.tsx)
  → Ink Renderer (ink.tsx)
  → Yoga Layout Engine (Flexbox in terminal)
  → Terminal I/O (ANSI/CSI escape codes)
  → stdout
```

### 10.2 核心组件

| 组件 | 功能 |
|------|------|
| `App.tsx` | 根组件（AppState + Stats + FpsMetrics 提供者） |
| `Messages.tsx` | 对话消息列表 |
| `MessageRow.tsx` | 单条消息渲染 |
| `MessageResponse.tsx` | 助手回复渲染 |
| `PromptInput/` | 用户输入处理 |
| `permissions/` | 工具权限审批 UI |
| `design-system/` | 复用组件库（Dialog、FuzzyPicker、ProgressBar 等） |

### 10.3 自定义 Ink fork

位于 `packages/@ant/ink/`（CCB 版本），是一个大幅修改的 Ink 内部版本：
- **components/** — 终端 UI 基元（Box、Text、Button...）
- **hooks/** — 终端专用 hooks
- **layout/** — Yoga 布局引擎包装
- **termio/** — 终端 I/O（ANSI 解析、CSI 控制序列、输入事件）
- **keybindings/** — 快捷键系统

### 10.4 交互式特性

- **REPL 屏幕** — 主交互界面
- **权限对话框** — 工具使用前的确认提示
- **模糊选择器** — 文件/选项选择
- **状态行** — 可配置的底部状态信息
- **会话恢复器** — 从历史会话中选择恢复
- **Doctor 诊断屏** — 全屏环境诊断

---

## 11. 记忆与会话

### 11.1 基于文件的记忆系统

Claude Code **不使用向量数据库或嵌入**，而是使用基于文件系统的 Markdown 记忆：

```
~/.claude/projects/<project-hash>/memory/
├── MEMORY.md            # 记忆索引（每行一个条目链接）
├── user_role.md         # 用户角色/偏好
├── project_context.md   # 项目上下文
├── feedback_coding.md   # 用户反馈
└── ...
```

#### 记忆检索机制
- LLM 扫描记忆文件的 **frontmatter header**（name + description）
- 根据 relevance 选择**最多 5 个**相关文件
- **无向量相似度搜索** — 完全依靠 LLM 的理解能力
- 全透明 — 用户可直接查看、编辑、纳入版本控制

### 11.2 记忆类型体系

Claude Code 定义了多种记忆类型：

| 类型 | 内容 |
|------|------|
| `user` | 用户角色、偏好、知识水平 |
| `project` | 项目目标、约束、Bug、里程碑 |
| `feedback` | 用户纠偏/确认的操作偏好 |
| `reference` | 外部系统资源指针（Linear 项目、Slack 频道、Grafana 面板） |

### 11.3 会话持久化

#### 三个持久化通道

| 通道 | 格式 | 目的 |
|------|------|------|
| 会话转录稿 | 仅追加 JSONL | 完整对话，链式修补的压缩边界 |
| 全局提示历史 | `history.jsonl` | 跨会话提示召回（上箭头键） |
| 子智能体侧链 | 独立 JSONL | 隔离的子智能体历史 |

#### 安全不变量

**权限在恢复会话时永不自动恢复。** 信任总是在当前会话中重新建立。为了守住这条安全不变量，系统宁可让用户多经历一次授权摩擦。

#### 链式修补 (Chain Patching)

压缩边界记录 `headUuid`/`anchorUuid`/`tailUuid`。会话加载器在读取时修补消息链。**磁盘上没有任何数据被破坏性编辑。**

### 11.4 Checkpoints

文件历史检查点用于 `--rewind-files` 功能，存储于：
```
~/.claude/file-history/<sessionId>/
```

---

## 12. 外部集成

### 12.1 Bridge 系统（IDE 双向通信）

Bridge 是连接 IDE 扩展（VS Code、JetBrains）与 Claude Code CLI 的双向通信层：

```
IDE Extension ←→ Bridge Protocol ←→ Claude Code CLI
                  (JWT-based auth)
```

核心模块：
- `bridgeMain.ts` — 主循环
- `bridgeMessaging.ts` — 消息协议
- `bridgePermissionCallbacks.ts` — 权限回调
- `replBridge.ts` — REPL 桥接
- `jwtUtils.ts` — JWT 认证
- `sessionRunner.ts` — 会话执行管理

### 12.2 LSP 集成

通过 `LSPTool` 与 Language Server Protocol 集成，支持代码智能操作：
- `goToDefinition` — 跳转到定义
- `findReferences` — 查找引用
- `hover` — 悬停信息
- `documentSymbol` — 文档符号
- `workspaceSymbol` — 工作区符号
- `goToImplementation` — 跳转到实现
- `prepareCallHierarchy` / `incomingCalls` / `outgoingCalls` — 调用层级

### 12.3 Remote Control / Remote Sessions

- **Remote Control Server (RCS)**: 自托管 Docker 部署，含 Web UI 控制面板
- **Remote Sessions**: 通过 SSH 连接到远程环境
- **Teleport**: 会话跨机器传输
- **ACP Protocol**: Agent Client Protocol 支持第三方 agent 接入

### 12.4 辅助系统

- **Voice Input** — 豆包 ASR 语音转文字
- **Computer Use** — 截图/键鼠/剪贴板控制
- **Chrome Integration** — 浏览器控制
- **WeChat Integration** — 微信通知/交互

---

## 13. 模型适配层

### 13.1 多提供商架构

Claude Code 支持 7 个模型提供商：

```typescript
// provider selection priority:
// modelType parameter > env var > default firstParty
providers = {
  firstParty, // Anthropic direct
  bedrock,    // AWS Bedrock
  vertex,     // Google Cloud Vertex AI
  foundry,    // (内部)
  openai,     // OpenAI (GPT)
  gemini,     // Google Gemini
  grok,       // xAI Grok
};
```

### 13.2 提供商适配 (OCC 版简化)

```javascript
function detectProvider(model) {
  if (model.startsWith(''gpt-'') || model.startsWith(''o1'') || model.startsWith(''o3''))
    return ''openai'';
  if (model.startsWith(''gemini'')) return ''google'';
  return ''anthropic'';
}
```

每个提供商需要适配：
- **请求格式** — messages/system/tools 在不同 API 间的映射
- **响应解析** — 将各 API 响应统一为 `{content, stop_reason, usage}` 格式
- **流式处理** — SSE / streaming 协议适配
- **工具调用** — tool_use ↔ tool_calls ↔ functionCall 转换

### 13.3 流式处理

- Anthropic: SSE 事件流 (`message_start → content_block_start → content_block_delta → ... → message_stop`)
- OpenAI: `chat/completions` with `stream: true`
- Google: `generateContent` with `stream: true`
- 统一累积逻辑：从流式事件重建完整响应消息

### 13.4 速率限制与重试

```javascript
// Rate limiter handles:
// - 429 (rate limit) → exponential backoff
// - 529 (overload) → exponential backoff
// - Max retries per turn (3 for max_tokens escalation)
```

### 13.5 Thinking/Extended Thinking

- Claude Opus/Sonnet 模型支持 extended thinking
- 通过 `thinking: { type: ''enabled'', budget_tokens: 10000 }` 参数启用
- thinking 内容可选择性返回给用户（Redacted Thinking 模式）
- thinking 块不计入上下文窗口的普通 token 配额

---

## 14. 工程基础设施

### 14.1 构建系统

#### Bun 主构建 (claude-code-disclose-initial / CCB)

```typescript
// build.ts
Bun.build({
  entrypoints: [''src/entrypoints/cli.tsx''],
  outdir: ''dist'',
  splitting: true,       // 代码分割
  target: ''bun'',
  define: MACRO_DEFINES,  // 编译时 Feature Flag
  plugins: [...],
});
```

#### Vite 备选构建 (CCB)

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        dir: ''dist'',
        entryFileNames: ''cli.js'',
        chunkFileNames: ''chunks/[name]-[hash].js'',
      },
    },
  },
});
```

**为何 Vite 必须代

码分割：** Bun/JSC 会全量解析大 JS 文件的 bytecode → RSS 暴涨至 ~1GB，代码分割为 600+ 小 chunk 后按需加载，内存从 966MB 降至 35MB。

### 14.2 Feature Flag 系统

通过 Bun 的 `bun:bundle` 的 `feature()` 函数实现编译时死代码消除：

```typescript
import { feature } from ''bun:bundle'';

// 未激活的分支在构建时完全被移除
const voiceCommand = feature(''VOICE_MODE'')
  ? require(''./commands/voice/index.js'').default
  : null;
```

主要 Feature Flags:

| Flag | 功能 |
|------|------|
| `PROACTIVE` | 主动式建议模式 |
| `KAIROS` | Assistant 模式 |
| `BRIDGE_MODE` | IDE 桥接模式 |
| `DAEMON` | 守护进程模式 |
| `VOICE_MODE` | 语音输入 |
| `COORDINATOR_MODE` | 多代理协调器 |
| `WORKTREE_MODE` | Git Worktree 隔离 |
| `ULTRAPLAN` | 超级计划模式 |
| `HISTORY_SNIP` | 历史裁剪压缩 |
| `CONTEXT_COLLAPSE` | 上下文折叠压缩 |

### 14.3 CI/CD

官方仓库 (claude-code-official) 使用 GitHub Actions 进行：
- **Issue 管理**: 自动关闭重复、生命周期评论、标签管理
- **@claude bot 集成**: 自动 Issue 分类和回复
- **重复检测**: 语义相似度匹配

CCB 仓库使用：
- `ci.yml` — lint + build + test
- `publish-npm.yml` — 发布到 npm
- `release-rcs.yml` — RCS Docker 镜像发布

OCC 仓库使用：
- `nightly.yml` — 夜间检测新 Claude Code 发布 → 运行 903+ 测试 → AI 分析变更 → 自动发布

### 14.4 设置与配置

#### 四源深度合并

```
settings.json = merge(
    Default Settings,         // 内置默认
    ~/.claude/settings.json,  // 用户级
    .claude/settings.json,    // 项目级
    .claude/settings.local.json // 本地覆盖 (gitignored)
)
```

#### 三种预设安全级别

| 级别 | 配置 | 用途 |
|------|------|------|
| `settings-strict.json` | 最高限制，所有操作需审批 | 高安全环境 |
| `settings-lax.json` | 宽松，自动批准大部分操作 | 个人开发 |
| `settings-bash-sandbox.json` | Bash 沙箱模式 | 半信任环境 |

### 14.5 企业 MDM 部署

官方支持企业大规模部署：
- **macOS**: `mobileconfig` 配置文件 + plist
- **Windows**: ADMX 模版 + PowerShell 部署脚本 (`Set-ClaudeCodePolicy.ps1`)
- **托管设置**: `/etc/claude-code/CLAUDE.md` 系统级，无法被用户覆盖

### 14.6 遥测与分析

- 基于 **GrowthBook** 的 Feature Flag 管理
- **OpenTelemetry** 遥测数据收集
- 使用统计跟踪（token 消耗、工具使用频率、会话时长）
- 可通过 `isAnalyticsDisabled` 配置完全关闭

### 14.7 反滥用机制

泄露源码中发现了多种反滥用/反蒸馏机制：
- **Anti-distillation** — 检测模型蒸馏尝试
- **Frustration detection** — 检测用户重复提问
- **Undercover Mode** — 隐蔽模式
- 每日约 250K 次被浪费的 API 调用

---

## 附录 A: 源码目录对比

| 目录 | claude-code-disclose-initial | claude-code-unofficial (CCB) | open-claude-code (OCC) |
|------|:---:|:---:|:---:|
| 文件数 | ~1,900 | ~1,400+ | 61 |
| 代码行数 | ~512,000 | ~350,000+ | 8,314 |
| 语言 | TypeScript | TypeScript | JavaScript (.mjs) |
| 运行时 | Bun | Bun | Node.js |
| 构建 | Bun.build() | Bun/Vite | 无构建 |
| 工具数 | ~54 | 60 | 25 |
| 命令数 | 50+ | 100+ | 40 |
| 提供商 | 7 | 7 | 5 |
| Feature Flags | 10+ | 19+ | 无 |
| 测试 | 无 | 单元+集成 | 1,581 测试 |

## 附录 B: 关键术语对照

| 英文 | 中文 |
|------|------|
| Agent Loop | 智能体循环 |
| Harness | 运行系统/载具 |
| Query Engine | 查询引擎 |
| Tool Dispatch | 工具分发 |
| Permission Gate | 权限门控 |
| Context Compaction | 上下文压缩 |
| Subagent Delegation | 子智能体委托 |
| Sidechain Transcript | 侧链转录稿 |
| Hook Interception | 钩子拦截 |
| Prompt Caching | 提示缓存 |
| Deny-first | 拒绝优先 |
| Defense in Depth | 纵深防御 |
| Worktree Isolation | 工作树隔离 |
| Graduated Trust Spectrum | 渐进信任光谱 |
| Append-only JSONL | 仅追加 JSONL |

## 附录 C: 参考资源

- 论文: [Dive into Claude Code (arXiv:2604.14228)](https://arxiv.org/abs/2604.14228)
- 官方文档: [How Claude Code Works](https://code.claude.com/docs/en/how-claude-code-works)
- Anthropic 工程博客:
  - [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
  - [Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
  - [Claude Code Auto Mode](https://www.anthropic.com/engineering/claude-code-auto-mode)
  - [Harness Design for Long-Running Application Development](https://anthropic.com/engineering/harness-design-long-running-apps)', '基于 Claude Code 泄露源码、官方仓库、逆向工程克隆、开源重建、学术分析论文及教学材料的综合分析', '{笔记,Claude,Agent}', true, '2026-05-31 11:44:59.531753+00', '{}', '{}', false, NULL);
INSERT INTO public.posts (id, title, slug, content, summary, categories, is_published, created_at, tags, internal_links, is_deleted, deleted_at) VALUES (7, '网页端发布测试', 'webtest', '测试文本', '测试', '{灵感}', true, '2026-06-02 15:43:41.142163+00', '{}', '{}', false, NULL);
INSERT INTO public.posts (id, title, slug, content, summary, categories, is_published, created_at, tags, internal_links, is_deleted, deleted_at) VALUES (8, '测试', 'tagtest', '测试文本', '测试', '{思考}', true, '2026-06-03 11:48:49.410303+00', '{}', '{}', false, NULL);
INSERT INTO public.posts (id, title, slug, content, summary, categories, is_published, created_at, tags, internal_links, is_deleted, deleted_at) VALUES (9, '测试', 'tagtest2', '测试文本', '测试', '{思考}', true, '2026-06-03 12:02:34.45635+00', '{测试}', '{}', false, NULL);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: blog
--

INSERT INTO public.users (id, email, username, hashed_password, avatar, bio, website, created_at, last_login_at, is_admin, is_active) VALUES (1, '2129381179@qq.com', 'Sjy_in_zju', '$2b$12$xBKJIv3/d7C0AvOAIrL51OfjSYJX6IyjUfxecS0zWGt1VA9p3Lwne', 'http://127.0.0.1:9000/avatars/163520b8effa4d26996b8f1a451e888b.png', '为能够成为自己而挺起胸膛', '', '2026-06-01 08:03:25.937899+00', '2026-06-02 15:43:06.754581+00', true, true);
INSERT INTO public.users (id, email, username, hashed_password, avatar, bio, website, created_at, last_login_at, is_admin, is_active) VALUES (2, 'test_check@example.com', 'testuser_check', '$2b$12$e8fyyPFiyauemEZTeskiWuew9bf.WrOrGeXRXNhciY9.WB46gpPsy', 'http://127.0.0.1:9000/avatars/avatars/1994832980044b87a2aab1dedfe64fac.json', NULL, NULL, '2026-06-02 12:16:35.555881+00', '2026-06-03 04:14:34.279419+00', false, true);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: blog
--

SELECT pg_catalog.setval('public.comments_id_seq', 3, true);


--
-- Name: likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: blog
--

SELECT pg_catalog.setval('public.likes_id_seq', 5, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: blog
--

SELECT pg_catalog.setval('public.posts_id_seq', 9, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: blog
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: blog
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: blog
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: blog
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: blog
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: likes uq_like_user_post; Type: CONSTRAINT; Schema: public; Owner: blog
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT uq_like_user_post UNIQUE (user_id, post_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: blog
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_comments_id; Type: INDEX; Schema: public; Owner: blog
--

CREATE INDEX ix_comments_id ON public.comments USING btree (id);


--
-- Name: ix_comments_is_deleted; Type: INDEX; Schema: public; Owner: blog
--

CREATE INDEX ix_comments_is_deleted ON public.comments USING btree (is_deleted);


--
-- Name: ix_likes_id; Type: INDEX; Schema: public; Owner: blog
--

CREATE INDEX ix_likes_id ON public.likes USING btree (id);


--
-- Name: ix_posts_id; Type: INDEX; Schema: public; Owner: blog
--

CREATE INDEX ix_posts_id ON public.posts USING btree (id);


--
-- Name: ix_posts_is_deleted; Type: INDEX; Schema: public; Owner: blog
--

CREATE INDEX ix_posts_is_deleted ON public.posts USING btree (is_deleted);


--
-- Name: ix_posts_slug; Type: INDEX; Schema: public; Owner: blog
--

CREATE UNIQUE INDEX ix_posts_slug ON public.posts USING btree (slug);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: blog
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: blog
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: blog
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: blog
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id);


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: blog
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: blog
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: likes likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: blog
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: blog
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 07SEmosESJCTzGJALpIwNjMLSD5KHlfgbRkStg4433FbQpdZXtcQeH8TFJbTMDx

