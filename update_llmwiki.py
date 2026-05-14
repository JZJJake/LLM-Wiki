import re

with open('llmwiki', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    r'Init if needed \+ serve \+ open browser': r'如果需要则初始化 + 启动服务 + 打开浏览器',
    r'Create \.llmwiki/ \+ wiki/, index files': r'创建 .llmwiki/ + wiki/，索引文件',
    r'Start API \+ web on localhost': r'在本地启动 API + Web 服务',
    r'Run stdio MCP server \(for Claude config\)': r'运行标准流 MCP 服务器 (用于 Claude 配置)',
    r'Print claude_desktop_config\.json snippet': r'打印 claude_desktop_config.json 配置片段',
    r'Force full rebuild of index\.db': r'强制完全重建 index.db 索引库',
    r'Indexing': r'正在索引',
    r'Indexed': r'已索引',
}

for old, new in replacements.items():
    content = re.sub(old, new, content)

with open('llmwiki', 'w', encoding='utf-8') as f:
    f.write(content)
