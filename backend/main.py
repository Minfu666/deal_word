from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List
import tempfile
import os
import uuid
from doc_processor import parse_documents, export_document

app = FastAPI(title="图书管理督导工作汇总系统")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_CONTENT_TYPES = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
}
MAX_FILES = 3
MAX_UPLOAD_BYTES = 50 * 1024 * 1024
UPLOAD_CHUNK_SIZE = 1024 * 1024

def _safe_filename(name: str) -> str:
    base = os.path.basename(name or "").strip()
    if not base:
        return f"{uuid.uuid4().hex}.docx"
    return f"{uuid.uuid4().hex}_{base}"

def _safe_remove(path: str) -> None:
    try:
        os.remove(path)
    except FileNotFoundError:
        pass

@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    """上传并解析Word文档"""
    if not files:
        raise HTTPException(status_code=400, detail="未上传文件")
    if not (1 <= len(files) <= MAX_FILES):
        raise HTTPException(status_code=400, detail=f"仅支持上传 1-{MAX_FILES} 个文件")

    with tempfile.TemporaryDirectory() as temp_dir:
        file_paths = []
        for f in files:
            original_name = f.filename or ""
            if not original_name.lower().endswith(".docx"):
                raise HTTPException(status_code=400, detail="仅支持 .docx 文件")
            safe_name = _safe_filename(original_name)
            if f.content_type and f.content_type not in ALLOWED_CONTENT_TYPES:
                raise HTTPException(status_code=400, detail="文件类型不支持")

            path = os.path.join(temp_dir, safe_name)
            size = 0
            try:
                with open(path, "wb") as out:
                    while True:
                        chunk = await f.read(UPLOAD_CHUNK_SIZE)
                        if not chunk:
                            break
                        size += len(chunk)
                        if size > MAX_UPLOAD_BYTES:
                            raise HTTPException(status_code=413, detail="文件过大")
                        out.write(chunk)
            finally:
                await f.close()
            file_paths.append(path)

        try:
            result = parse_documents(file_paths)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"解析失败: {exc}") from exc

    return result

@app.post("/export")
async def export_file(data: dict, background_tasks: BackgroundTasks):
    """导出汇总文档"""
    output_path = export_document(data)
    if not output_path:
        raise HTTPException(status_code=400, detail="导出失败：无可用数据")
    background_tasks.add_task(_safe_remove, output_path)
    return FileResponse(
        output_path,
        filename="督导工作情况汇总.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        background=background_tasks,
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
