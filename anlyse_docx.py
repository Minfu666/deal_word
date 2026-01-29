import os
import json
from docx import Document

def analyze_docx(file_path):
    if not os.path.exists(file_path):
        return f"Error: File not found: {file_path}"
    
    try:
        doc = Document(file_path)
        content = {"tables": []}
        
        # 提取表格数据用于调试
        for i, table in enumerate(doc.tables):
            table_data = []
            for row in table.rows:
                row_data = [cell.text.strip() for cell in row.cells]
                table_data.append(row_data)
            content["tables"].append({"index": i, "data": table_data})
            
        return content
    except Exception as e:
        return f"Error reading {file_path}: {str(e)}"

# 针对当前问题的三个关键文件进行解析
files = [
    r"E:\newlife\自动化文档处理系统\图书管理岗督导工作情况通报(模板).docx",
    r"E:\newlife\自动化文档处理系统\测试\督导工作情况汇总.docx",
    r"E:\newlife\自动化文档处理系统\测试\11月3日-11月9日督导工作情况通报.docx"
]

results = {}
for f in files:
    results[os.path.basename(f)] = analyze_docx(f)

print(json.dumps(results, indent=2, ensure_ascii=False))
