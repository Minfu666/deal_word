# 部署说明（Zeabur + GitHub Pages）

本项目为前后端分离部署：后端 FastAPI 部署到 Zeabur，前端使用 GitHub Pages 托管。

---

## 一、后端部署到 Zeabur（FastAPI）

### 1. 准备事项
- 仓库已包含 `backend/requirements.txt` 与 `backend/main.py`。
- `main.py` 会读取 `PORT` 环境变量启动（Zeabur 会自动注入）。

### 2. 在 Zeabur 创建服务
1. 登录 Zeabur，创建新项目。
2. 选择 **Deploy your source code**，连接你的 GitHub 仓库。
3. 服务创建完成后，进入该服务的设置：
   - **Root Directory** 设为 `backend`
   - 保存后重新部署（Redeploy）

### 3. 入口与环境变量（建议方案）
Zeabur 会自动识别 `main.py`。本项目在 `backend/` 下提供 `zbpack.json` 强制识别为 Python。
如需手动指定入口，可按下述设置：

- 环境变量（任一方式即可）：
  - `ZBPACK_PYTHON_ENTRY=__init__.py`
  - 或 `ZBPACK_PYTHON_ENTRY=main.py`

可选：指定 Python 版本（如需）
- `ZBPACK_PYTHON_VERSION=3.10`

### 4. 启动命令（仅当自动启动失败时）
在 Zeabur 服务中设置启动命令：
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```
说明：当 Root Directory 指向 `backend` 时，`main:app` 即可被识别。

### 5. 获取后端访问地址
部署完成后，在 Zeabur 的服务页面可看到访问域名，例如：
```
https://your-backend.zeabur.app
```
该地址将用于前端的 `VITE_API_URL`。

---

## 二、前端部署到 GitHub Pages（Vite）

### 1. 关键环境变量
前端构建时需要注入以下变量：

- `VITE_API_URL`：后端 Zeabur 地址  
  例：`https://your-backend.zeabur.app`

- `VITE_BASE`：GitHub Pages 子路径  
  例：`/你的仓库名/`  
  如果使用自定义域名，可设为 `/` 或留空。

### 2. GitHub Pages 启用
1. 进入 GitHub 仓库的 **Settings → Pages**。
2. 使用 GitHub Actions（推荐）或指定分支发布。

### 3. 推荐：GitHub Actions 自动部署
使用 Actions 时，在工作流中设置构建环境变量（示例）：
```
VITE_API_URL=https://your-backend.zeabur.app
VITE_BASE=/your-repo/
```

构建命令：
```
npm install
npm run build
```
Vite 会输出到 `dist/`，GitHub Pages 将发布该目录。

---

## 三、常见问题

### 1. 前端请求后端失败
检查 `VITE_API_URL` 是否为 Zeabur 后端地址，且后端服务已部署成功。

### 2. 页面资源 404
检查 `VITE_BASE` 是否与 GitHub Pages 的仓库名一致，例如：
```
https://<username>.github.io/<repo-name>/
```
对应 `VITE_BASE=/repo-name/`。

---

## 四、环境变量示例汇总

### Zeabur（后端）
```
PORT=8080                    # Zeabur 自动注入
ZBPACK_PYTHON_ENTRY=backend/__init__.py
ZBPACK_PYTHON_VERSION=3.10
```

### GitHub Pages（前端构建）
```
VITE_API_URL=https://your-backend.zeabur.app
VITE_BASE=/your-repo/
```
