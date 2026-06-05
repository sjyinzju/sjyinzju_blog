"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import InteractiveGrid from "@/components/InteractiveGrid";
import FormPageHero from "@/components/FormPageHero";

/* ──────────────────────────────────────────────
   Tool 数据（与后端 mcp_tools.py 保持同步）
   ────────────────────────────────────────────── */

interface ToolInfo {
  name: string;
  desc: string;
  inputs: string;
}

const readTools: ToolInfo[] = [
  {
    name: "blog_list_posts",
    desc: "分页列出所有已发布文章，返回标题 / slug / 摘要 / 标签 / 分类 / 创建时间",
    inputs: "limit?=20 offset?=0",
  },
  {
    name: "blog_search_posts",
    desc: "按关键字在标题和标签中模糊搜索文章",
    inputs: "query* limit?=10",
  },
  {
    name: "blog_get_post",
    desc: "获取指定文章的完整 Markdown 内容——最核心的阅读工具",
    inputs: "slug*",
  },
  {
    name: "blog_get_tags",
    desc: "获取热门标签统计，按文章篇数降序排列",
    inputs: "limit?=10",
  },
  {
    name: "blog_get_graph",
    desc: "获取知识图谱——分类→标签→文章 的关联结构及文章间双链",
    inputs: "（无参数）",
  },
  {
    name: "blog_semantic_search",
    desc: "语义向量搜索：用自然语言提问，按语义相似度匹配文章（需配置 Embedding API）",
    inputs: "query* limit?=5",
  },
];

const adminTools: ToolInfo[] = [
  {
    name: "blog_create_post",
    desc: "创建并发布新文章，自动填充 slug / summary / tags，自动生成向量嵌入",
    inputs: "title* content* category* slug? summary? tags? internal_links? is_published?",
  },
  {
    name: "blog_recommend_links",
    desc: "根据标签重叠度和分类为新文章推荐可双链的旧文章",
    inputs: "tags* category? exclude_slug? limit?=5",
  },
  {
    name: "blog_update_post",
    desc: "更新已有文章的元数据（internal_links / tags / summary 等），自动更新嵌入",
    inputs: "slug* internal_links? tags? summary?",
  },
  {
    name: "blog_reindex",
    desc: "批量重建文章的向量嵌入索引，支持单篇或全量",
    inputs: "slug? force?=false",
  },
];

/* ──────────────────────────────────────────────
   子组件
   ────────────────────────────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs tracking-wide text-[#aaa] hover:text-[#FF4A00] transition-colors duration-200"
    >
      {copied ? "已复制 ✓" : "复制"}
    </button>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="mb-6">
      {label && (
        <p className="text-sm text-[#888] mb-1 tracking-wide">{label}</p>
      )}
      <div className="relative bg-[#F1EFEB] p-4 pr-16">
        <pre className="text-sm text-[#444] leading-relaxed whitespace-pre-wrap overflow-x-auto font-mono">
          {code}
        </pre>
        <div className="absolute top-3 right-4">
          <CopyButton text={code} />
        </div>
      </div>
    </div>
  );
}

function ToolTable({
  title,
  tools,
  badge,
}: {
  title: string;
  tools: ToolInfo[];
  badge: string;
}) {
  return (
    <div className="mb-10">
      <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4 tracking-wide flex items-center gap-3">
        {title}
        <span className="text-xs font-normal text-[#888] bg-[#F1EFEB] px-2 py-0.5 rounded-full">
          {tools.length} 个工具
        </span>
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e0ddd8]">
              <th className="py-2 pr-4 text-sm font-semibold text-[#888] tracking-wide w-[200px]">
                工具名
              </th>
              <th className="py-2 pr-4 text-sm font-semibold text-[#888] tracking-wide">
                功能说明
              </th>
              <th className="py-2 text-sm font-semibold text-[#888] tracking-wide w-[260px]">
                参数（* 必填，? 可选）
              </th>
            </tr>
          </thead>
          <tbody>
            {tools.map((t) => (
              <tr
                key={t.name}
                className="border-b border-[#f0ede8] hover:bg-[#FBF9F6] transition-colors"
              >
                <td className="py-2.5 pr-4">
                  <code className="text-sm text-[#FF4A00] bg-[#FFF5ED] px-1.5 py-0.5 font-mono">
                    {t.name}
                  </code>
                  <span className="ml-2 text-xs text-[#aaa]">{badge}</span>
                </td>
                <td className="py-2.5 pr-4 text-sm text-[#555] leading-relaxed">
                  {t.desc}
                </td>
                <td className="py-2.5 text-sm text-[#777] font-mono leading-relaxed">
                  {t.inputs}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   页面主体
   ────────────────────────────────────────────── */

export default function McpPage() {
  const sseUrl = "https://mcp.your-domain.com/mcp/sse";
  const readToken = "f2c89eaa...（你的 MCP_SECRET_TOKEN）";
  const adminToken = "058908cc...（你的 MCP_ADMIN_TOKEN）";

  return (
    <div className="relative min-h-screen bg-[#F8F7F3]">
      <InteractiveGrid />

      {/* ── 橙色弧线 Hero ── */}
      <FormPageHero title="MCP" />

      {/* ── 内容区 ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-8 pt-12 pb-20 space-y-16">

        {/* ============ 简介 ============ */}
        <section>
          <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-wide mb-4">
            什么是 MCP？
          </h2>
          <p className="text-base text-[#666] leading-relaxed max-w-2xl">
            MCP（Model Context Protocol）是 AI Agent
            与外部工具交互的开放协议。本博客通过 MCP
            将文章内容、搜索、发布等能力暴露给 Claude
            Code、Claude Desktop 等 AI 客户端，让 Agent
            可以像一位熟悉你博客的助手一样——搜索、阅读、总结、发布。
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-[#888]">
              <span className="w-3 h-3 rounded-full bg-[#4CAF50]" />
              只读工具
              <span className="font-semibold text-[#666]">{readTools.length}</span>
              个
            </div>
            <div className="flex items-center gap-2 text-sm text-[#888]">
              <span className="w-3 h-3 rounded-full bg-[#FF4A00]" />
              管理工具
              <span className="font-semibold text-[#666]">{adminTools.length}</span>
              个
            </div>
            <div className="flex items-center gap-2 text-sm text-[#888]">
              总计
              <span className="font-semibold text-[#666]">
                {readTools.length + adminTools.length}
              </span>
              个
            </div>
          </div>
        </section>

        {/* ============ 只读工具 ============ */}
        <section>
          <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-wide mb-6">
            工具列表
          </h2>

          <ToolTable
            title="🔍 只读工具（所有用户可用）"
            tools={readTools}
            badge="read"
          />

          <ToolTable
            title="🔧 管理工具（仅管理员可用）"
            tools={adminTools}
            badge="admin"
          />

          <div className="bg-[#FFF9F0] p-4 text-sm text-[#996600] leading-relaxed">
            <strong>权限说明：</strong>
            只读工具使用 <code className="bg-[#ffe0b3] px-1">MCP_SECRET_TOKEN</code>，
            管理工具使用 <code className="bg-[#ffe0b3] px-1">MCP_ADMIN_TOKEN</code>。
            本地 stdio 模式自动拥有管理员权限，无需 Token。
          </div>
        </section>

        {/* ============ 配置教程 ============ */}
        <section>
          <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-wide mb-6">
            如何在 Agent 中配置
          </h2>

          {/* ── Claude Code ── */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-3 tracking-wide">
              Claude Code（.claude/mcp.json）
            </h3>
            <p className="text-sm text-[#888] mb-3 leading-relaxed">
              在项目根目录或用户目录下创建/编辑{" "}
              <code className="bg-[#F1EFEB] px-1">.claude/mcp.json</code>：
            </p>

            <CodeBlock
              label="SSE 远程模式（仅读取）"
              code={`{
  "mcpServers": {
    "sjyblog": {
      "type": "sse",
      "url": "${sseUrl}",
      "headers": {
        "Authorization": "Bearer ${readToken}"
      }
    }
  }
}`}
            />

            <CodeBlock
              label="SSE 远程模式（含管理权限）"
              code={`{
  "mcpServers": {
    "sjyblog-admin": {
      "type": "sse",
      "url": "${sseUrl}",
      "headers": {
        "Authorization": "Bearer ${adminToken}"
      }
    }
  }
}`}
            />

            <CodeBlock
              label="stdio 本地模式（无需网络，自动管理员）"
              code={`{
  "mcpServers": {
    "sjyblog": {
      "command": "uv",
      "args": ["run", "python", "mcp_stdio_bridge.py"],
      "cwd": "/path/to/sjyinzju_blog/backend"
    }
  }
}`}
            />
          </div>

          {/* ── Claude Desktop ── */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-3 tracking-wide">
              Claude Desktop
            </h3>
            <p className="text-sm text-[#888] mb-3 leading-relaxed">
              编辑{" "}
              <code className="bg-[#F1EFEB] px-1">
                claude_desktop_config.json
              </code>
              （位置：macOS{" "}
              <code className="bg-[#F1EFEB] px-1">
                ~/Library/Application Support/Claude/
              </code>
              ，Windows{" "}
              <code className="bg-[#F1EFEB] px-1">
                %APPDATA%\Claude\
              </code>
              ）：
            </p>

            <CodeBlock
              code={`{
  "mcpServers": {
    "sjyblog": {
      "type": "sse",
      "url": "${sseUrl}",
      "headers": {
        "Authorization": "Bearer <你的 Token>"
      }
    }
  }
}`}
            />
          </div>

          {/* ── Cursor / Windsurf / 其他 ── */}
          <div>
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-3 tracking-wide">
              Cursor / Windsurf / 其他 MCP 客户端
            </h3>
            <p className="text-sm text-[#888] mb-3 leading-relaxed">
              任何支持 MCP
              协议的客户端都可以连接。只需提供以下两个信息：
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e0ddd8]">
                    <th className="py-2 pr-4 text-sm font-semibold text-[#888] tracking-wide">
                      字段
                    </th>
                    <th className="py-2 text-sm font-semibold text-[#888] tracking-wide">
                      值
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#f0ede8]">
                    <td className="py-2.5 pr-4 text-sm font-mono text-[#555]">
                      transport
                    </td>
                    <td className="py-2.5 text-sm font-mono text-[#FF4A00]">
                      sse
                    </td>
                  </tr>
                  <tr className="border-b border-[#f0ede8]">
                    <td className="py-2.5 pr-4 text-sm font-mono text-[#555]">
                      url
                    </td>
                    <td className="py-2.5 text-sm font-mono text-[#FF4A00]">
                      {sseUrl}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-sm font-mono text-[#555]">
                      auth header
                    </td>
                    <td className="py-2.5 text-sm text-[#777]">
                      <code className="bg-[#F1EFEB] px-1">
                        Authorization: Bearer &lt;你的 Token&gt;
                      </code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============ 部署说明 ============ */}
        <section>
          <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-wide mb-4">
            部署前提
          </h2>
          <div className="space-y-3 text-sm text-[#666] leading-relaxed">
            <div className="flex items-start gap-3">
              <span className="text-[#FF4A00] font-bold mt-0.5">1.</span>
              <span>
                后端已启动并挂载 MCP SSE 端点（<code className="bg-[#F1EFEB] px-1">app.mount(&quot;/mcp&quot;, build_mcp_app())</code>）
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#FF4A00] font-bold mt-0.5">2.</span>
              <span>
                已配置反向代理（Nginx / Caddy）将 HTTPS 流量转发至后端 8000 端口，
                详见 <code className="bg-[#F1EFEB] px-1">deploy/README.md</code>
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#FF4A00] font-bold mt-0.5">3.</span>
              <span>
                PostgreSQL 已启用 pgvector 扩展（语义搜索需要），
                在 <code className="bg-[#F1EFEB] px-1">.env</code> 中配置了{" "}
                <code className="bg-[#F1EFEB] px-1">EMBEDDING_API_KEY</code>
              </span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
