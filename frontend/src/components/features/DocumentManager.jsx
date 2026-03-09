import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../../services/api'

const DocumentManager = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('docs') // docs | upload | checklist
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [analyzingId, setAnalyzingId] = useState(null)
  const [expandedDoc, setExpandedDoc] = useState(null)
  const [checklists, setChecklists] = useState([])
  const [activeChecklist, setActiveChecklist] = useState(null)
  const [checklistData, setChecklistData] = useState(null)
  const [checkedItems, setCheckedItems] = useState({})
  const fileInputRef = useRef(null)
  const [docName, setDocName] = useState('')
  const [docType, setDocType] = useState('Document')
  const [isDragging, setIsDragging] = useState(false)

  const docTypes = [
    { value: 'FIR', label: 'FIR / पुलिस रिपोर्ट', icon: '🚔' },
    { value: 'Property', label: 'भूमि / संपत्ति दस्तावेज़', icon: '🏠' },
    { value: 'Court Order', label: 'न्यायालय आदेश', icon: '⚖️' },
    { value: 'Legal Notice', label: 'कानूनी नोटिस', icon: '📜' },
    { value: 'Contract', label: 'समझौता / अनुबंध', icon: '🤝' },
    { value: 'Government Letter', label: 'सरकारी पत्र', icon: '📋' },
    { value: 'Personal', label: 'व्यक्तिगत दस्तावेज़', icon: '👤' },
    { value: 'Draft', label: 'ड्राफ्ट / पत्र', icon: '📝' },
    { value: 'Document', label: 'अन्य', icon: '📁' },
  ]

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/profile/documents')
      if (res.data.success) setDocuments(res.data.data)
    } catch (err) {
      console.error('Failed to load documents:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchChecklists = async () => {
    try {
      const res = await api.get('/profile/checklists')
      if (res.data.success) setChecklists(res.data.data)
    } catch (err) {
      console.error('Failed to load checklists:', err)
    }
  }

  useEffect(() => { fetchDocuments(); fetchChecklists() }, [])

  const handleDelete = async (docId) => {
    if (!window.confirm('क्या आप इस दस्तावेज़ को हटाना चाहते हैं?')) return
    try {
      await api.delete(`/profile/documents/${docId}`)
      setDocuments(prev => prev.filter(d => d._id !== docId))
      if (expandedDoc === docId) setExpandedDoc(null)
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  }

  const handleUpload = async (file) => {
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowed.includes(file.type)) {
      setUploadError('केवल JPG, PNG या PDF फाइल अपलोड करें')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('फाइल 10MB से बड़ी है')
      return
    }

    setUploading(true)
    setUploadError(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', docName || file.name)
    formData.append('type', docType)

    try {
      const res = await api.post('/profile/documents/upload', formData, { timeout: 120000 })
      if (res.data.success) {
        setDocName('')
        setDocType('Document')
        setTab('docs')
        fetchDocuments()
      } else {
        setUploadError(res.data.error || 'अपलोड नहीं हो पाया')
      }
    } catch (err) {
      setUploadError(err.response?.data?.error || 'अपलोड में त्रुटि हुई')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAnalyze = async (docId) => {
    setAnalyzingId(docId)
    try {
      const res = await api.post(`/profile/documents/${docId}/analyze`)
      if (res.data.success) {
        setDocuments(prev => prev.map(d =>
          d._id === docId ? { ...d, ai_summary: res.data.data.summary } : d
        ))
        setExpandedDoc(docId)
      }
    } catch (err) {
      console.error('Analysis failed:', err)
    } finally {
      setAnalyzingId(null)
    }
  }

  const handleViewFile = async (docId) => {
    try {
      const res = await api.get(`/profile/documents/${docId}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      window.open(url, '_blank')
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  const loadChecklist = async (id) => {
    setActiveChecklist(id)
    try {
      const res = await api.get(`/profile/checklist/${id}`)
      if (res.data.success) {
        setChecklistData(res.data.data)
        const saved = localStorage.getItem(`checklist_${id}`)
        setCheckedItems(saved ? JSON.parse(saved) : {})
      }
    } catch (err) {
      console.error('Failed to load checklist:', err)
    }
  }

  const toggleCheckItem = (idx) => {
    setCheckedItems(prev => {
      const updated = { ...prev, [idx]: !prev[idx] }
      localStorage.setItem(`checklist_${activeChecklist}`, JSON.stringify(updated))
      return updated
    })
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) handleUpload(file)
  }, [docName, docType])

  const typeIcon = (type) => {
    const found = docTypes.find(t => t.value === type)
    return found ? found.icon : '📁'
  }

  const sourceLabel = (source) => {
    switch (source) {
      case 'upload': return '📸 अपलोड'
      case 'draft': return '📝 ड्राफ्ट'
      case 'scan': return '🔍 स्कैन'
      default: return '📁 सेव'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">डॉक्यूमेंट वॉल्ट 🔒</h2>
          <p className="text-gray-600 text-sm">अपने सभी कानूनी दस्तावेज़ सुरक्षित रखें, AI से समझें</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'docs', label: '📁 मेरे दस्तावेज़', count: documents.length },
          { id: 'upload', label: '📸 अपलोड करें' },
          { id: 'checklist', label: '✅ दस्तावेज़ चेकलिस्ट' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              tab === t.id
                ? 'bg-saffron-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.label} {t.count !== undefined ? `(${t.count})` : ''}
          </button>
        ))}
      </div>

      {/* ═══ TAB: MY DOCUMENTS ═══ */}
      {tab === 'docs' && (
        loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-saffron-500"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
            <p className="text-5xl mb-3">📂</p>
            <p className="text-gray-700 font-semibold text-lg">अभी कोई दस्तावेज़ नहीं है</p>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              FIR कॉपी, ज़मीन की रजिस्ट्री, कोर्ट नोटिस — कुछ भी अपलोड करें।<br/>
              AI आपको बताएगा कि इसमें क्या लिखा है और आपको क्या करना चाहिए।
            </p>
            <button
              onClick={() => setTab('upload')}
              className="mt-4 px-6 py-2.5 bg-saffron-500 text-white rounded-lg font-medium hover:bg-saffron-600 transition-colors"
            >
              📸 पहला दस्तावेज़ अपलोड करें
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-3xl flex-shrink-0">{typeIcon(doc.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{doc.name}</h3>
                        <div className="flex gap-2 flex-wrap items-center">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{doc.type}</span>
                          <span className="text-xs text-gray-500">{sourceLabel(doc.source)}</span>
                          {doc.size && doc.size !== '—' && <span className="text-xs text-gray-400">{doc.size}</span>}
                          <span className="text-xs text-gray-400">
                            {new Date(doc.created_at).toLocaleDateString('hi-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1 flex-shrink-0 ml-2">
                      {doc.file_mime && (
                        <button onClick={() => handleViewFile(doc._id)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="देखें / डाउनलोड">
                          👁️
                        </button>
                      )}
                      <button
                        onClick={() => handleAnalyze(doc._id)}
                        disabled={analyzingId === doc._id}
                        className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition-colors disabled:opacity-50"
                        title="AI से समझें"
                      >
                        {analyzingId === doc._id ? (
                          <span className="inline-block animate-spin">⏳</span>
                        ) : '🤖'}
                      </button>
                      <button onClick={() => setExpandedDoc(expandedDoc === doc._id ? null : doc._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="विवरण">
                        {expandedDoc === doc._id ? '🔼' : '🔽'}
                      </button>
                      <button onClick={() => handleDelete(doc._id)}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="हटाएं">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded: AI Summary + content */}
                {expandedDoc === doc._id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                    {doc.ai_summary ? (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-purple-700 mb-2">🤖 AI विश्लेषण:</p>
                        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{doc.ai_summary}</div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 mb-2">AI ने अभी इस दस्तावेज़ को नहीं पढ़ा</p>
                        <button
                          onClick={() => handleAnalyze(doc._id)}
                          disabled={analyzingId === doc._id}
                          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                          {analyzingId === doc._id ? '⏳ विश्लेषण हो रहा है...' : '🤖 AI से समझें'}
                        </button>
                      </div>
                    )}
                    {doc.content && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-gray-600 font-medium">📋 दस्तावेज़ सामग्री देखें</summary>
                        <pre className="mt-2 bg-white border rounded p-3 text-xs whitespace-pre-wrap max-h-60 overflow-y-auto">{doc.content}</pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="mt-4 flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <span className="text-sm text-gray-600">कुल दस्तावेज़: <strong>{documents.length}</strong></span>
              <button onClick={() => setTab('upload')}
                className="text-sm text-saffron-600 font-medium hover:text-saffron-700">
                + और अपलोड करें
              </button>
            </div>
          </div>
        )
      )}

      {/* ═══ TAB: UPLOAD ═══ */}
      {tab === 'upload' && (
        <div className="max-w-lg mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 font-medium">💡 ऐसे करें अपलोड:</p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1">
              <li>• FIR, ज़मीन की रजिस्ट्री, कोर्ट नोटिस की <strong>फोटो खींचें</strong></li>
              <li>• या <strong>PDF</strong> फाइल चुनें (अधिकतम 10MB)</li>
              <li>• अपलोड के बाद <strong>AI समझाएगा</strong> कि इसमें क्या लिखा है</li>
            </ul>
          </div>

          {/* Document Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">दस्तावेज़ का नाम</label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="जैसे: ज़मीन की रजिस्ट्री, FIR कॉपी..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500"
            />
          </div>

          {/* Document Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">दस्तावेज़ का प्रकार</label>
            <div className="grid grid-cols-3 gap-2">
              {docTypes.map(dt => (
                <button
                  key={dt.value}
                  onClick={() => setDocType(dt.value)}
                  className={`text-xs p-2 rounded-lg border text-center transition-all ${
                    docType === dt.value
                      ? 'bg-saffron-50 border-saffron-400 text-saffron-800 font-medium'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg block mb-0.5">{dt.icon}</span>
                  {dt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              isDragging ? 'border-saffron-500 bg-saffron-50' : 'border-gray-300 hover:border-saffron-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files?.[0])}
            />
            {uploading ? (
              <div>
                <div className="animate-spin text-4xl mb-2">⏳</div>
                <p className="font-medium text-gray-700">अपलोड हो रहा है...</p>
              </div>
            ) : (
              <>
                <p className="text-5xl mb-3">📸</p>
                <p className="font-semibold text-gray-800">फोटो खींचें या फाइल चुनें</p>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG, PDF — अधिकतम 10MB</p>
              </>
            )}
          </div>

          {uploadError && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              ❌ {uploadError}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: CHECKLIST ═══ */}
      {tab === 'checklist' && (
        <div>
          {!activeChecklist ? (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800 font-medium">📋 दस्तावेज़ चेकलिस्ट कैसे मदद करती है?</p>
                <p className="text-xs text-green-700 mt-1">
                  अपना कानूनी मुद्दा चुनें → हम बताएंगे कौन-कौन से दस्तावेज़ चाहिए → एक-एक टिक करते जाएं
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {checklists.map(cl => (
                  <button
                    key={cl.id}
                    onClick={() => loadChecklist(cl.id)}
                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-saffron-300 transition-all text-left"
                  >
                    <span className="text-3xl">📋</span>
                    <div>
                      <p className="font-semibold text-gray-900">{cl.title}</p>
                      <p className="text-xs text-gray-500">{cl.title_en} • {cl.count} दस्तावेज़</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : checklistData ? (
            <div>
              <button onClick={() => { setActiveChecklist(null); setChecklistData(null) }}
                className="text-sm text-saffron-600 font-medium mb-4 inline-block hover:text-saffron-700">
                ← सभी चेकलिस्ट
              </button>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{checklistData.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{checklistData.title_en}</p>

                {/* Progress */}
                <div className="mb-4">
                  {(() => {
                    const total = checklistData.docs.length
                    const done = Object.values(checkedItems).filter(Boolean).length
                    const pct = total > 0 ? (done / total) * 100 : 0
                    return (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{done}/{total} दस्तावेज़ तैयार</span>
                          <span className="font-medium text-saffron-600">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                <div className="space-y-2">
                  {checklistData.docs.map((item, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        checkedItems[idx]
                          ? 'bg-green-50 border-green-300'
                          : item.critical
                            ? 'bg-red-50 border-red-200'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedItems[idx]}
                        onChange={() => toggleCheckItem(idx)}
                        className="h-5 w-5 rounded text-green-600"
                      />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${checkedItems[idx] ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">{item.name_en}</p>
                      </div>
                      {item.critical && !checkedItems[idx] && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">ज़रूरी</span>
                      )}
                      {checkedItems[idx] && <span className="text-green-600">✅</span>}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">लोड हो रहा है...</div>
          )}
        </div>
      )}
    </div>
  )
}

export default DocumentManager
