import re

file_path = 'web/src/app/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    r'LLM Wiki': r'LLM Wiki',
    r'Research is messy\.': r'研究往往是杂乱无章的。',
    r'The wiki writes itself\.': r'让维基自动为你编写。',
    r'LLM Wiki offloads the bookkeeping to Claude so you can focus on analysis\.': r'LLM Wiki 将繁杂的记录工作交给 Claude，让你可以专注于分析。',
    r'Get Started': r'开始使用',
    r'View on GitHub': r'在 GitHub 上查看',
    r'Search wiki\.\.\.': r'搜索维基...',
    r'Overview': r'概览',
    r'It synthesizes findings from': r'它综合了来自',
    r'sources': r'个来源的发现',
    r'across': r'跨越',
    r'pages\.': r'页内容。',
    r'Three layers': r'三层架构',
    r'Your files stay untouched\. Claude writes the wiki via MCP\.': r'你的文件保持原样。Claude 通过 MCP 撰写维基。',
    r'How it works': r'工作原理',
    r'Point it at a folder': r'指向一个文件夹',
    r'Connect Claude': r'连接 Claude',
    r'The wiki improves': r'维基不断完善',
    r'All local, no cloud required': r'全本地运行，无需云端',
    r'Your files stay where they are\. LLM Wiki builds a local SQLite index to make them searchable, then gives Claude tools to read documents and write markdown pages\.': r'你的文件保留在原处。LLM Wiki 构建本地 SQLite 索引使其可搜索，然后赋予 Claude 读取文档和编写 markdown 页面的工具。',
    r'Start building your wiki': r'开始构建你的维基',
    r'Free and open source\. Run it locally or deploy it yourself\.': r'免费开源。在本地运行或自行部署。',
    r'Terms': r'服务条款',
    r'Privacy': r'隐私政策',
    r'You have a folder of PDFs, notes, and data\. LLM Wiki extracts text and builds a local search index\.': r'你有一个包含 PDF、笔记和数据的文件夹。LLM Wiki 会提取文本并构建本地搜索索引。',
    r'Claude connects via MCP\. It reads your sources and writes markdown pages under a `wiki/` directory\.': r'Claude 通过 MCP 连接。它读取你的资料并在 `wiki/` 目录下编写 markdown 页面。',
    r'As Claude writes more pages, summaries and cross-references accumulate instead of being re-derived from scratch\.': r'随着 Claude 撰写更多页面，摘要和交叉引用会不断积累，而不是每次都从头开始推导。',
}

for old, new in replacements.items():
    content = re.sub(old, new, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
