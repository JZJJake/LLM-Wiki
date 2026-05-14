# LLM Wiki

[![License](https://img.shields.io/badge/license-Apache%202.0-green)](https://opensource.org/licenses/Apache-2.0)

[Karpathy的 LLM Wiki](https://x.com/karpathy/status/2039805659525644595) ([规格说明](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)) 的开源实现。

我构建这个工具是因为研究文件夹中积累有用资料的速度远远超过了我手动维护摘要、链接和引用更新的速度。LLM Wiki 将这些编辑工作交给 DeepSeek/Cline，让我能专注于资料来源的选择和分析。

将它指向一个文件夹，启动本地应用，然后通过 MCP 连接 DeepSeek/Cline。从那时起，DeepSeek/Cline 就会读取你的资料，撰写维基页面，并保持链接和引用的同步。

![LLM Wiki — 带有引用和目录的编译维基页面](wiki-page.png)

## 实际上发生了什么

1. **你有一个文件夹** — PDF、笔记、文章、电子表格。你现有的研究资料。
2. **LLM Wiki 索引它** — 提取文本，为搜索分块，并构建本地的 SQLite 索引。源文件会保留在原处。
3. **DeepSeek/Cline 通过 MCP 连接** — 读取资料，在 `wiki/` 下撰写维基页面，维护交叉引用和脚注引用。
4. **维基不断完善** — 随着 DeepSeek/Cline 读取工作区中更多的内容并撰写更多页面，摘要、实体页面和交叉引用会不断积累，而不是每次对话都从头开始重新推导。

## 快速开始

**一键启动 (Windows):**
在包含本代码的目录下，直接双击运行 `run.bat`，脚本会自动检查环境并进行安装启动。如果默认的资料夹不存在，它会自动创建一个 `research` 文件夹并作为默认工作区。

**要求:** Python 3.11+, Node.js 20+

```bash
git clone https://github.com/lucasastorian/llmwiki.git
cd llmwiki

# 安装 Python 依赖
cd api && python.exe -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cd ..

# 安装 web 依赖
cd web && npm install && cd ..

# 初始化工作区 (指向包含你文件的任意文件夹)
./llmwiki init ~/research

# 启动应用
./llmwiki serve ~/research
```

打开 [localhost:3000](http://localhost:3000)。你的文件已被索引，维基的脚手架已搭建完成，随时可以使用。

### 连接 DeepSeek/Cline

```bash
./llmwiki mcp-config ~/research
```

这将打印出一段用于 `cline_mcp_settings.json` (DeepSeek/Cline Desktop) 或 `cline_mcp_settings.json` (DeepSeek/Cline Code) 的 JSON 配置片段。一个工作区作为一个 MCP 服务器条目运行，所以如果你有多个研究文件夹，请为每个文件夹添加一个条目。

然后告诉 DeepSeek/Cline: *"阅读指南，然后提取我的资料并开始构建维基。"*

### 一键启动 (Linux/Mac)

```bash
./llmwiki open ~/research
```

执行所有操作：如果需要则初始化，启动服务器，打开浏览器，并打印 MCP 配置提示。

## 命令行界面 (CLI)

| 命令 | 它的作用 |
|---------|-------------|
| `llmwiki open <文件夹>` | 初始化 + 启动服务 + 打开浏览器 |
| `llmwiki init <文件夹>` | 创建 `.llmwiki/` + `wiki/`，索引现有文件 |
| `llmwiki serve <文件夹>` | 在端口 8000 启动 API，端口 3000 启动 web |
| `llmwiki mcp <文件夹>` | 运行标准输入输出的 MCP 服务器 (用于 DeepSeek/Cline 配置) |
| `llmwiki mcp-config <文件夹>` | 打印 `cline_mcp_settings.json` 代码片段 |
| `llmwiki reindex <文件夹>` | 从磁盘重建索引 |

## 磁盘上的变化

LLM Wiki 会向你的文件夹中添加两样东西。你的源文件不会被移动或修改。

```
~/research/                  # 你现有的文件 (未触碰)
  papers/paper.pdf
  notes.md
  data.xlsx
  wiki/                      # 生成的页面 (由 LLM Wiki 创建)
    overview.md
    log.md
    concepts/
      attention.md
  .llmwiki/                  # 索引 + 缓存 (隐藏的，可重建)
    index.db
    cache/
```

- `wiki/` — 普通的 Markdown 文件。你可以在任何编辑器中编辑它们。DeepSeek/Cline 通过 MCP 撰写和更新它们。
- `.llmwiki/` — SQLite 搜索索引和处理后的产物。你可以随时删除它；`llmwiki reindex` 会从源文件重新构建它。

默认情况下，索引、存储和文件写入都在你的机器上本地进行。不需要任何云服务。

## DeepSeek/Cline 如何与工作区互动

连接后，DeepSeek/Cline 拥有以下工具：

| 工具 | 描述 |
|------|-------------|
| `guide` | 解释维基如何运作，列出工作区中的内容 |
| `search` | 浏览文件 (`list`) 或全文搜索 (`search`) |
| `read` | 阅读文档 — 按页码范围读取 PDF，通过 glob 批量读取 |
| `write` | 创建维基页面，使用 `str_replace` 编辑，追加内容。SVG/CSV 资产 |
| `delete` | 通过路径或 glob 模式删除文档 |

所有的写入都会先落盘，然后更新搜索索引。如果 DeepSeek/Cline 创建了 `/wiki/concepts/attention.md`，该文件会立即出现在磁盘上。

## 架构

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js    │────▶│   FastAPI    │────▶│   SQLite     │
│   前端       │     │   后端       │     │   (本地)     │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────┴───────┐
                     │  MCP Server  │◀──── Cline / DeepSeek / DeepSeek/Cline
                     │  (标准流)    │
                     └──────────────┘
                            │
                     ┌──────┴───────┐
                     │   文件系统   │  ← 真实数据源
                     └──────────────┘
```

文件系统是真实的数据源。SQLite 是一个派生的索引 — 它加速了搜索并存储了提取出的页面数据，但它随时可以从文件重建。一个后台的文件监视器会捕获你在应用外部所做的更改。

## 文档处理

所有的处理都在本地运行。基本使用无需 API 密钥。

| 格式 | 解析器 | 备注 |
|--------|--------|-------|
| PDF | pdf-oxide | 基于 Rust 的文本提取。对于文本较多的论文效果很好。扫描版 PDF 仍然需要真正的 OCR 处理。 |
| Markdown/文本 | 原生 | 直接索引和分块 |
| HTML | webmd | 去除导航栏/广告，提取干净的 Markdown |
| Excel/CSV | openpyxl | 逐表提取 |
| 图片 | 原生 | 原样存储，可内嵌查看 |
| Word/PowerPoint | LibreOffice | 可选。安装 LibreOffice 进行 office 转换；没有它的话，这些格式的文件会被存储但不会被提取文本。 |

设置 `MISTRAL_API_KEY` 可以获得更高质量的 PDF OCR 提取能力，并带来更好的表格和布局检测。pdf-oxide 是免费的默认选项，处理大多数文本较多的文档效果已经足够好。

## 限制与权衡

- **一个工作区 = 一个 MCP 服务器。** 如果你跨多个研究项目工作，每个项目都应该有自己的文件夹和专属的 MCP 条目。这是有意设计的 — 这样可以保持上下文和文件访问在正确的范围内。
- **PDF 表格提取比较粗糙。** pdf-oxide 可以可靠地提取散文内容，但表格提取出来会变成杂乱的文本。对于财务报表或数据密集型的 PDF，Mistral OCR 的表现要好得多。
- **LibreOffice 增加了设置的门槛。** Office 文件转换需要本地安装 LibreOffice。如果你主要处理 PDF 和 Markdown，你可以完全跳过这一步。
- **本地模式不支持向量搜索。** 全文搜索使用 SQLite FTS5 (porter stemming)。它对于关键词查询效果很好，但不进行语义/嵌入式搜索。托管版本 llmwiki.app 使用 PGroonga 进行排序搜索。

## 许可证

Apache 2.0
