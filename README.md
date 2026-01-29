# 自动化文档处理系统

一个用于图书管理督导工作汇总的 Web 工具：上传 1-3 个 Word 文档，自动解析合并，在线校对后导出汇总文档。

## 功能概览
- 支持上传 1-3 个 `.docx` 文档并自动解析
- 按“值班助理 + 日期”排序，合并汇总并统计总人数/总班次/合计值
- 支持在线编辑关键字段与问题汇总
- 一键导出汇总 Word 文档（保留模板样式）

## 技术栈
- 前端：React + Vite + Tailwind CSS
- 后端：FastAPI + python-docx + pandas

## 目录结构
- `backend/` FastAPI 后端与文档处理逻辑
- `frontend/` React 前端项目
- `DEPLOY.md` 部署说明（Zeabur + GitHub Pages）

## 本地运行

### 1) 启动后端
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2) 启动前端
```bash
cd frontend
npm install
npm run dev
```

### 3) 访问
- 前端：`http://localhost:5173`
- 后端：`http://localhost:8000`

## 环境变量

### 前端
- `VITE_API_URL`：后端地址（默认 `http://localhost:8000`）
- `VITE_BASE`：GitHub Pages 子路径（可选）

### 后端
- `PORT`：运行端口（平台会自动注入）
- `ZBPACK_PYTHON_ENTRY`：Zeabur 入口（可选）
- `ZBPACK_PYTHON_VERSION`：Python 版本（可选）

## 部署
详见 `DEPLOY.md`。

## 说明
本仓库已忽略测试数据与隐私文件（见 `.gitignore`）。如需测试文件，请自行准备 `.docx` 样例。
