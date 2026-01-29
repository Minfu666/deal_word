import { useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://deal-word.zeabur.app'
const MAX_FILES = 3

function App() {
  const [files, setFiles] = useState([])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || [])
    setError('')
    if (selected.length === 0) {
      setFiles([])
      return
    }

    let docxFiles = selected.filter(f => f.name.toLowerCase().endsWith('.docx'))
    if (docxFiles.length !== selected.length) {
      setError('仅支持 .docx 文件')
    }
    if (docxFiles.length > MAX_FILES) {
      setError(`最多选择 ${MAX_FILES} 个文件`)
      docxFiles = docxFiles.slice(0, MAX_FILES)
    }
    setFiles(docxFiles)
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('请选择至少一个文件')
      return
    }
    if (files.length > MAX_FILES) {
      setError(`最多选择 ${MAX_FILES} 个文件`)
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData()
    files.forEach(f => formData.append('files', f))

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.detail || '上传失败')
      }
      if (!payload) {
        throw new Error('上传返回为空')
      }
      setData(payload)
    } catch (err) {
      setError('上传失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCellEdit = (index, field, value) => {
    const newRows = [...data.rows]
    newRows[index][field] = field === '上书量' || field === '纠错量' ? parseInt(value) || 0 : value

    // 重新计算汇总
    const totals = {
      总人数: new Set(newRows.map(r => r.值班助理)).size,
      总班次: newRows.length,
      上书量合计: newRows.reduce((sum, r) => sum + (r.上书量 || 0), 0),
      纠错量合计: newRows.reduce((sum, r) => sum + (r.纠错量 || 0), 0),
    }

    setData({ ...data, rows: newRows, totals })
  }

  const handleProblemsChange = (value) => {
    setData({ ...data, problems: value })
  }

  const handleExport = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.detail || '导出失败')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = '督导工作情况汇总.docx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('导出失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="clay-ambient" aria-hidden="true">
        <span className="blob blob-a" />
        <span className="blob blob-b" />
        <span className="blob blob-c" />
      </div>
      <main className="container">
        <header className="hero clay-card reveal">
          <div className="hero-copy">
            <span className="hero-kicker">自动化 · 汇总 · 导出</span>
            <h1>图书管理督导工作汇总系统</h1>
            <p className="hero-sub">
              上传 1-3 个 Word 文档，系统自动解析合并，你只需校对关键数据即可下载成稿。
            </p>
            <div className="hero-tags">
              <span className="clay-tag">支持 .docx</span>
              <span className="clay-tag">可编辑汇总</span>
              <span className="clay-tag">秒级导出</span>
            </div>
          </div>
          <div className="hero-orb" aria-hidden="true" />
        </header>

        <section className="clay-card reveal delay-1">
          <div className="section-head">
            <div>
              <h2>上传文档</h2>
              <p className="section-sub">将 1-3 个周报文档交给系统处理</p>
            </div>
            {loading && <span className="status-pill">处理中...</span>}
          </div>
          <div className="upload-row">
            <label className="file-input">
              <input
                type="file"
                multiple
                accept=".docx"
                onChange={handleFileChange}
              />
              <span className="file-button">选择文件</span>
              <span className="file-text">
                {files.length > 0 ? `已选 ${files.length} 个文件` : '未选择文件'}
              </span>
            </label>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="clay-button primary"
            >
              {loading ? '处理中...' : '开始处理'}
            </button>
          </div>
          {files.length > 0 && (
            <div className="file-list">
              {files.map((file, index) => (
                <span className="file-chip" key={`${file.name}-${index}`}>
                  {file.name}
                </span>
              ))}
            </div>
          )}
          {error && <p className="error-bubble">{error}</p>}
        </section>

        {data && data.rows && data.rows.length > 0 && (
          <section className="clay-card reveal delay-2">
            <div className="section-head">
              <div>
                <h2>数据预览（可编辑）</h2>
                <p className="section-sub">调整上书量、纠错量与整架范围后导出</p>
              </div>
              <button
                onClick={handleExport}
                disabled={loading}
                className="clay-button success"
              >
                下载汇总文档
              </button>
            </div>

            <div className="stat-grid">
              <div className="stat-card">
                <span>总人数</span>
                <strong>{data.totals.总人数}</strong>
              </div>
              <div className="stat-card">
                <span>总班次</span>
                <strong>{data.totals.总班次}</strong>
              </div>
              <div className="stat-card">
                <span>上书量合计</span>
                <strong>{data.totals.上书量合计}</strong>
              </div>
              <div className="stat-card">
                <span>纠错量合计</span>
                <strong>{data.totals.纠错量合计}</strong>
              </div>
            </div>

            <div className="problem-box clay-inset">
              <label>督导检查问题汇总</label>
              <textarea
                value={data.problems || ''}
                onChange={(e) => handleProblemsChange(e.target.value)}
                rows={4}
                className="clay-input"
                placeholder="可在此编辑“存在问题”汇总内容"
              />
            </div>

            <div className="table-wrap clay-inset">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>值班助理</th>
                    <th>日期</th>
                    <th>上书量</th>
                    <th>纠错量</th>
                    <th>整架范围</th>
                    <th>工作地点</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, i) => (
                    <tr key={i}>
                      <td className="center">{i + 1}</td>
                      <td>{row.值班助理}</td>
                      <td>{row.日期}</td>
                      <td>
                        <input
                          type="number"
                          value={row.上书量}
                          onChange={(e) => handleCellEdit(i, '上书量', e.target.value)}
                          className="clay-input small"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.纠错量}
                          onChange={(e) => handleCellEdit(i, '纠错量', e.target.value)}
                          className="clay-input small"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.整架范围}
                          onChange={(e) => handleCellEdit(i, '整架范围', e.target.value)}
                          className="clay-input small"
                        />
                      </td>
                      <td>{row.工作地点}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
