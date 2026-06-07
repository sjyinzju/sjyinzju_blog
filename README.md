[README_architecture.md](https://github.com/user-attachments/files/28677941/README_architecture.md)
# 个人博客系统全栈本地化与AI原生架构分析

本项目是一个采用前后端分离架构、深度集成大模型上下文工具链（MCP Server）及向量语义检索的个人“数字花园”博客系统。系统核心设计遵循高可用性、极客流自动化内容生产、生产级安全防御纵深以及数据资产自主掌控的原则。

## 一、 部署拓扑与技术栈

系统的物理部署采用了经典的“边缘静态渲染 + 核心服务云端容器化”模式，将展示层与计算/存储层彻底解耦，在保障全网极速访问的同时，死守数据主权与计算安全。

### 1. 前端展示层 (Vercel)
* **核心框架**：Next.js 16 (基于 App Router)，全面启用服务端组件（RSC）架构。
* **开发语言**：TypeScript，结合严格类型检查模式（Strict Mode）确保前端业务逻辑的鲁棒性。
* **样式系统**：Tailwind CSS v4，基于现代 CSS 变量的原子化样式引擎。
* **交互动效**：Framer Motion，用于实现高级页面过渡、视差滚动及流畅的数字花园组件交互。

### 2. 后端服务层 (VPS 独立部署)
* **核心框架**：FastAPI 0.1.0，利用 Python 异步协程机制（async/await）实现高并发、低延迟的 REST API 响应。
* **AI 原生层**：原生内置 MCP (Model Context Protocol) Server，通过 Server-Sent Events (SSE) 协议对外（如 Claude Code, Cursor 等 Agent 客户端）提供标准化的数字花园上下文注入工具链。
* **运行环境**：Python 3.11+ 运行时，配合轻量高效的 `uv` 进行依赖及包管理。

### 3. 底层基础设施 (VPS Docker 内网隔离)
* **关系型/向量数据库**：PostgreSQL 16，配合官方向量扩展 `pgvector` 镜像（pgvector/pgvector:pg16），原生支持 1536 维高维向量距离运算，实现高阶语义检索。
* **ORM 引擎**：SQLAlchemy 2.x，采用现代声明式映射（Mapped）语法；结合 Alembic 进行严密的数据库版本演进控制与迁移管理。
* **高速缓存/速率限制器**：Redis 7 (Alpine 极简镜像)，作为高频社交数据缓存底座，并为应用层防刷限流器提供中心化计数器。
* **对象存储 (OSS)**：MinIO (S3 兼容协议，最新生产版)，本地化托管静态资产，如图标、用户头像等敏感媒体数据。

---

## 二、 核心组件与数据模型

系统采用严格的领域驱动与原子化组件拆分设计，前端路由天然具备容灾边界，后端实体具备高内聚特征。

### 1. 前端核心组件树
* **全局网格布局**：`RootLayout`（layout.tsx）统一托管页面骨架，挂载全局状态。
* **全景导航系统**：`Navbar` 集成实时全局模糊搜索弹窗（`SearchModal`）及用户身份状态挂件。
* **业务区块组件**：
  * `PageContent`：首页大盘，由 Hero 视觉区块与多维动态分类卡片构成。
  * `SubPageContent`：分类列表页，支持无缝流式分页与 `PostListItem`（内含管理端快速下架/软删除原子按钮）。
  * `ArticleContent`：文章详情核心，包含 `MarkdownViewer`（文档解析渲染器）、`TableOfContents`（动态侧边栏目录锚点联动）以及 `CommentsSection`（多级嵌套评论社交组件）。
  * `KnowledgeGraph`：数字化图谱，基于 `react-force-graph-2d` 驱动的 D3 力导向三部曲（分类 → 标签 → 文章）知识网格。
  * `ActivityCalendar`：关于页组件，提供类似 GitHub 风格的 8 个月高频活动度热力图。
* **前端容灾边界 (Error Boundaries)**：
  * 每个路由层级配备 `loading.tsx`（实现全局高斯模糊遮罩弹窗）。
  * 路由级配备 `error.tsx`（捕获 API 网络抖动、展示图形化错误并提供原地重试机制）。
  * 根布局层配备 `global-error.tsx`（独立于主框架的自包含纯 HTML 错误页，用于极端崩塌场景下的全量兜底）。

### 2. 后端数据模型实体
* **Post (文章实体)**：包含标题、Slug、正文、简短摘要（自动截取/手动定义）、分类集合与标签元数据。特别设计 `internal_links` 字段，存储 Obsidian 风格的双链拓扑节点。
* **User (用户实体)**：包含密码学加盐哈希（Bcrypt）、激活状态标识、管理员权限白名单（`is_admin`）及对象存储头像关联 Key。
* **Comment (评论实体)**：自引用多级树状结构，包含 `parent_id` 物理外键，支持多级盖楼回复；使用 `is_visible` 控制内容合规审查状态。
* **Like (点赞关联实体)**：通过用户外键与文章外键构建物理复合唯一约束（`uq_like_user_post`），在数据库级别锁死单用户重复点赞的竞态缺陷。

---

## 三、 内容生产工作流

系统彻底打通了本地私有知识库（Obsidian 等 Markdown 资产）与云端数字花园的同步管线，构建了非对称的半自动化发布流。

1. **本地高频创作**：在本地安全的受控目录（如 `E:/backend_database/`）下，按标准的物理文件夹（笔记、思考、视频、项目开发、灵感、资源、关于）撰写原生 Markdown。
2. **本地脚本解析**：通过本地同步工具 `sync_posts.py` 进行静态扫描：
   * 解析文章顶部的 YAML Frontmatter 标准元数据。
   * 正则匹配并提取正文中的 `[[双向链接]]` 语法，将其转化为后端知识图谱所需的节点关系。
   * 根据当前 Markdown 所在的物理文件夹路径，自动纠偏并注入系统的分类 Tag。
3. **安全通信入库**：同步工具自动调用管理端鉴权接口获取短暂口令，通过安全的 HTTPS 管道向后端的 `POST /posts/` 路由发起批量 Payload 提交。
4. **后端去重过滤**：FastAPI 拦截请求，基于唯一标识 `slug` 执行增量比对，若已存在则安全跳过或执行覆盖更新，规避数据碰撞。

---

## 四、 架构数据流转机制

前后端数据交换严格执行 React Server Components (RSC) 与 Client Components 的混合数据流模型。

* **服务端直出数据流 (RSC)**：对于 SEO 敏感、加载性能指标要求极高的核心静态页面（如 `/[category]/page.tsx` 与 `/[category]/[slug]/page.tsx`），由 Next.js 服务端在边缘侧直接调用后端基础 REST API 路由（如 `getPosts()`, `getPost()`）。后端异步查询 PostgreSQL 组装数据，在服务端渲染出完整的 HTML 结构后直接下发至浏览器，实现零首屏等待。
* **客户端动态数据流 (Client Components)**：对于高度依赖交互、实时性强的社交及图谱功能（如点赞切换、多级评论提交、知识图谱计算、热力图调取、全局搜索），由前端浏览器异步触发 `apiFetch()` 方法。请求穿过跨域安全层，与 FastAPI 的对应动态路由通信，返回纯净的 JSON 载荷，在客户端完成局部的声明式状态更新。
* **降级与防御流**：非关键次要数据（如侧边栏推荐标签、用户信息读取）若遭遇瓶颈，系统自动采取静默回退策略，回退至安全空值（如标签列表降级为空、用户状态退回未登录态），保证主体文章的正常阅读；核心网络故障则直接抛出由前端路由级 Error Boundary 捕获。

---

## 五、 主要接口矩阵 (API Endpoints)

FastAPI 后端提供了一套无状态、严格契合 RESTful 规范且边界分明的核心端点。

* **内容与检索域 (Posts)**
  * `GET /posts/`：获取已发布且未被软删除的文章分页列表。
  * `GET /posts/search?q=`：标题及标签的多条件模糊检索。
  * `GET /posts/tags/top`：拉取高频热门标签 Top N 聚合统计。
  * `GET /posts/graph`：导出全库知识图谱拓扑数据（分类 → 标签 → 文章的节点链接关系）。
  * `GET /posts/{slug}`：获取单篇文章的完整详情（支持未发布态的管理员预览预览逻辑）。
  * `POST /posts/`：创建文章（需 Admin 管理员权限，成功入库后底层自动异步触发向量化嵌入引擎）。
  * `PUT /posts/{slug}`：编辑/修改文章（需 Admin 管理员权限，内容变更自动重算语义向量）。
  * `DELETE /posts/{slug}`：软删除文章（需 Admin 管理员权限，物理标记删除状态与时间戳）。
* **身份与授权域 (Auth)**
  * `POST /auth/register`：用户注册（挂载 5次/分钟 高频限流阀）。
  * `POST /auth/login`：用户登录（挂载 5次/分钟 限流阀，签发双重 JWT，以 HttpOnly 模式写入 Cookie）。
  * `POST /auth/refresh`：滚动刷新 Token（读取 Refresh Cookie，实现 Access Token 的无感续期）。
  * `GET /auth/me`：读取当前活跃用户的详细个人资料。
  * `PUT /auth/me`：更新个人资料（集成 S3 媒体层头像上传子流）。
  * `PUT /auth/password`：在线修改用户密码（强制二次旧密码验密）。
* **社交与统计域 (Social & Stats)**
  * `POST /posts/{slug}/like`：点赞状态切换（挂载 10次/分钟 限流阀，底层使用原子 Upsert 操作）。
  * `GET /posts/{slug}/like/status`：实时查询当前登录用户对该文章的点赞激活状态。
  * `GET /posts/{slug}/comments`：拉取该文章所属的完整嵌套评论树。
  * `POST /posts/{slug}/comments`：发表新评论或指定父节点回复（挂载 10次/分钟 限流阀）。
  * `DELETE /comments/{comment_id}`：软删除特定评论（仅限作者本人及 Admin 管理员执行）。
  * `GET /stats/heatmap`：拉取后端长达 8 个月的文章发布与社交互动活跃度热力图聚合数据。
  * `GET /stats/activity?date=`：精准查询某一个自然日的文章更新与社交详情列表。
* **基建与 AI 原生域 (Infra & MCP)**
  * `GET /media/avatars/{key}`：对象存储资产安全代理路由，对内隐蔽 MinIO 真实物理存储端点。
  * `* /mcp/*`：MCP Server 核心服务族（通过 `MCP_SECRET_TOKEN` 进行鉴权拦截，支持 SSE 实时事件长连接，向 AI Agent 暴露 `get_notes_summary`、`read_note_content`、`blog_semantic_search` 等核心原子工具）。

---

## 六、 安全与防御纵深

系统在网络层、中间件层、应用逻辑层和底层数据库层部署了多密度的防御策略，打造准生产级的系统韧性。

1. **密码学与认证安全**
   * 用户密码在入库前，必须通过 `bcrypt` 算法进行高强度加盐哈希（Work Factor = 12），数据库内绝对不出现任何明文或可逆加密密文。
   * 采用双 JWT（JSON Web Token）短期访问控制与长期刷新控制机制（Access Token 30分钟超时 / Refresh Token 7天有效）。所有 Token 强制配置 `HttpOnly` 与 `SameSite=Lax` 标识，生产环境开启 `Secure=True`，从物理空间上彻底杜绝 XSS 脚本窃取与常规 CSRF 攻击。
2. **应用权限控制 (RBAC)**
   * 通过 FastAPI 依赖注入系统（`Depends(get_current_user)` / `Depends(get_current_admin)`）锁死接口边界。一般用户仅开放只读与基础评论/点赞权限；发帖、批量建立索引（Reindex）及双链推荐等破坏性写库接口全部划归 Admin 管理员白名单。
3. **恶意流量清洗中间件**
   * **高速网络限流**：中间件最外层挂载基于 Redis 内存后端的 `slowapi` 限流器。敏感路由（登录、注册）实施 5次/分钟 物理拦截；社交交互（点赞、评论）实施 10次/分钟 限制，直接在应用最前线瓦解撞库与恶意刷量行为。
   * **体积拦截**：配置 `enforce_content_length` 中间件，一旦发现 HTTP 请求体（Content-Length）超过 5MB 限制，直接在解析前中断连接并抛出 413 Payload Too Large 报错，切断大文件 DDoS 攻击通道。
   * **CORS 与安全响应头**：配置严密的跨域白名单策略，且显式开启安全响应头（注入 `X-Content-Type-Options: nosniff` 规避 MIME 类型嗅探、`X-Frame-Options: DENY` 防御点击劫持、`Strict-Transport-Security` 强制生产环境 HTTPS 传输）。
4. **数据层防御与竞态保护**
   * **输入严苛校验**：所有进出后端的请求体/响应体全部通过 `Pydantic Schema` 进行强类型强格式规约，字段级别配置 `max_length`、`min_length` 以及严格的正则模式匹配（Pattern），物理杜绝 SQL 注入的可能性。
   * **原子高并发保护**：点赞等高频切态行为，放弃传统的“先查再改”两步走逻辑，直接使用 PostgreSQL 底层的 `INSERT ON CONFLICT DO NOTHING` 或 `UPDATE ... WHERE` 原子语句，由数据库锁机制保证高并发状态下的数据一致性，消灭竞态条件（Race Conditions）。
   * **全线软删除机制**：文章（Post）与评论（Comment）实体全面覆盖 `is_deleted` 与 `deleted_at` 逻辑标记。应用层的所有常规查询默认追加过滤网格，物理删除操作只能由数据库超级管理员在 Docker 容器内部通过物理终端执行，大幅提升数据防误删与灾难恢复能力。
   * **文件上传沙箱**：头像上传端点强制校验文件的真实魔术字（Magic Number），限定 MIME 类型白名单（仅允许 PNG/JPEG/GIF/WebP），单文件体积硬性限制在 2MB 以内，文件名在入库前全量重写为随机 UUID，彻底封死上传 WebShell 木马的路径。
