import { useState, useRef, useCallback } from 'react'
import api from '../../services/api'

const DocumentUpload = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(1) // 1: Upload, 2: Processing, 3: Results
  const fileInputRef = useRef(null)

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  
  const documentTypes = [
    { id: 'legal_notice', name: 'कानूनी नोटिस', nameEn: 'Legal Notice', icon: '📜' },
    { id: 'fir', name: 'FIR', nameEn: 'Police FIR', icon: '🚔' },
    { id: 'court_order', name: 'न्यायालय आदेश', nameEn: 'Court Order', icon: '⚖️' },
    { id: 'land_record', name: 'भूमि दस्तावेज़', nameEn: 'Land Record', icon: '🏠' },
    { id: 'government_letter', name: 'सरकारी पत्र', nameEn: 'Govt. Letter', icon: '📋' },
    { id: 'agreement', name: 'समझौता पत्र', nameEn: 'Agreement', icon: '🤝' },
  ]

  const handleFileSelect = useCallback((selectedFile) => {
    setError(null)
    setResult(null)
    setStep(1)

    if (!selectedFile) return

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('केवल JPG, PNG या PDF फाइल अपलोड करें')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('फाइल का आकार 10MB से कम होना चाहिए')
      return
    }

    setFile(selectedFile)

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview('pdf')
    }
  }, [])

  const handleInputChange = (e) => handleFileSelect(e.target.files[0])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    if (!file) {
      setError('कृपया पहले एक फाइल चुनें')
      return
    }

    setIsLoading(true)
    setError(null)
    setStep(2)

    const formData = new FormData()
    formData.append('document', file)

    // Debug logging
    console.log('Uploading file:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      formDataKeys: Array.from(formData.keys()),
    })

    try {
      // Let axios handle FormData properly - don't set Content-Type header
      const response = await api.post('/analyze-document', formData, {
        timeout: 120000, // 2 minutes for OCR processing
      })
      
      if (response.data.success) {
        setResult(response.data.data)
        setStep(3)
        // Auto-save scan result to Document Vault
        const r = response.data.data
        api.post('/profile/documents', {
          name: file.name,
          type: r.document_type || 'Scanned Document',
          content: r.simplified_text || r.extracted_text || '',
          source: 'scan',
        }).catch(() => {})
        api.post('/profile/activity', { type: 'document_check', details: { name: file.name } }).catch(() => {})
      } else {
        setError(response.data.message || 'विश्लेषण में त्रुटि हुई')
        setStep(1)
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.code === 'ECONNABORTED') {
        setError('समय समाप्त। कृपया पुनः प्रयास करें।')
      } else if (err.request) {
        setError('सर्वर से कनेक्ट नहीं हो पा रहा। कृपया इंटरनेट जाँचें।')
      } else {
        setError('कुछ गलत हो गया। कृपया पुनः प्रयास करें।')
      }
      setStep(1)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setStep(1)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getUrgencyBadge = (urgency) => {
    const badges = {
      high: { bg: 'bg-red-100', text: 'text-red-700', label: '🔴 तुरंत कार्यवाही करें' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '🟡 जल्द देखें' },
      normal: { bg: 'bg-green-100', text: 'text-green-700', label: '🟢 सामान्य' },
    }
    return badges[urgency] || badges.normal
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-saffron-400 to-saffron-600 rounded-2xl mb-4 shadow-lg">
          <span className="text-3xl">📷</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">कानूनी दस्तावेज़ स्कैनर</h1>
        <p className="text-gray-600">अपना दस्तावेज़ अपलोड करें - हम आसान हिंदी में समझाएंगे</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[
          { num: 1, label: 'अपलोड' },
          { num: 2, label: 'विश्लेषण' },
          { num: 3, label: 'परिणाम' },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full font-medium text-sm transition-all
              ${step >= s.num 
                ? 'bg-saffron-500 text-white shadow-md' 
                : 'bg-gray-200 text-gray-500'}
            `}>
              {step > s.num ? '✓' : s.num}
            </div>
            <span className={`ml-2 text-sm hidden sm:inline ${step >= s.num ? 'text-saffron-600 font-medium' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {idx < 2 && (
              <div className={`w-12 h-1 mx-2 rounded ${step > s.num ? 'bg-saffron-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Document Types Info */}
      {step === 1 && !file && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">ये दस्तावेज़ अपलोड कर सकते हैं:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {documentTypes.map((doc) => (
              <div key={doc.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                <span className="text-xl">{doc.icon}</span>
                <div>
                  <p className="text-xs font-medium text-gray-800">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.nameEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Upload Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Upload Zone */}
        {step !== 3 && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-lg m-4 p-8 text-center transition-all cursor-pointer
              ${isDragging ? 'border-saffron-400 bg-saffron-50 scale-[1.02]' : 'border-gray-300 hover:border-gray-400'}
              ${file ? 'border-green-400 bg-green-50' : ''}
              ${isLoading ? 'pointer-events-none opacity-70' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleInputChange}
              className="hidden"
              disabled={isLoading}
            />

            {isLoading ? (
              <div className="py-4">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-saffron-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-saffron-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                </div>
                <p className="text-saffron-600 font-medium mb-1">दस्तावेज़ स्कैन हो रहा है...</p>
                <p className="text-sm text-gray-500">OCR से टेक्स्ट निकाला जा रहा है</p>
                <div className="mt-4 flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-saffron-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : !file ? (
              <div className="py-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-700 font-medium mb-1">
                  फाइल खींचकर यहाँ छोड़ें या <span className="text-saffron-600">ब्राउज़ करें</span>
                </p>
                <p className="text-sm text-gray-500">JPG, PNG, PDF (अधिकतम 10MB)</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4 py-2">
                {preview === 'pdf' ? (
                  <div className="w-16 h-20 bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
                    <span className="text-3xl">📄</span>
                  </div>
                ) : (
                  <img src={preview} alt="Preview" className="w-16 h-20 object-cover rounded-lg shadow-md" />
                )}
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p className="text-xs text-green-600 mt-1">✓ तैयार है</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-medium text-red-800">त्रुटि हुई</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {step !== 3 && (
          <div className="px-4 pb-4 flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className={`
                flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all
                ${!file || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-saffron-500 to-saffron-600 text-white hover:shadow-lg hover:scale-[1.02]'
                }
              `}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>स्कैन हो रहा है...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">🔍</span>
                  <span>दस्तावेज़ स्कैन करें</span>
                </>
              )}
            </button>

            {file && !isLoading && (
              <button
                onClick={handleClear}
                className="px-4 py-3 rounded-xl text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                हटाएं
              </button>
            )}
          </div>
        )}

        {/* Results Section */}
        {result && step === 3 && (
          <div className="p-4 space-y-4">
            {/* Document Type & Urgency */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-saffron-50 rounded-full">
                <span className="text-xl">📋</span>
                <span className="text-sm font-medium text-saffron-700">{result.documentTypeName}</span>
              </div>
              {result.urgencyLevel && (
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${getUrgencyBadge(result.urgencyLevel).bg} ${getUrgencyBadge(result.urgencyLevel).text}`}>
                  {getUrgencyBadge(result.urgencyLevel).label}
                </div>
              )}
            </div>

            {/* Simplified Explanation - Main Card */}
            <div className="bg-gradient-to-br from-saffron-50 to-orange-50 rounded-xl p-5 border border-saffron-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💡</span>
                <h3 className="font-bold text-gray-800">आसान भाषा में समझें</h3>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {result.simplifiedText}
              </div>
            </div>

            {/* Key Points */}
            {result.keyPoints && result.keyPoints.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📌</span>
                  <h3 className="font-bold text-gray-800">मुख्य बिंदु</h3>
                </div>
                <div className="grid gap-2">
                  {result.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="w-6 h-6 bg-saffron-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Dates */}
            {result.importantDates && result.importantDates.length > 0 && (
              <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📅</span>
                  <h3 className="font-bold text-red-800">महत्वपूर्ण तिथियां</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {result.importantDates.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                      <span className="text-lg">🗓️</span>
                      <div>
                        <p className="text-sm font-bold text-red-700">{item.date}</p>
                        <p className="text-xs text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            {result.recommendedActions && result.recommendedActions.length > 0 && (
              <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">✅</span>
                  <h3 className="font-bold text-green-800">आपको क्या करना चाहिए</h3>
                </div>
                <div className="space-y-2">
                  {result.recommendedActions.map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <span className="text-green-500 text-lg">→</span>
                      <span className="text-sm text-gray-700">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Text (Collapsible) */}
            <details className="bg-gray-50 rounded-xl border border-gray-200">
              <summary className="p-4 cursor-pointer font-medium text-gray-700 hover:bg-gray-100 rounded-xl">
                📝 मूल टेक्स्ट देखें (OCR द्वारा निकाला गया)
              </summary>
              <div className="px-4 pb-4">
                <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto border">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                    {result.extractedText}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>शब्द: {result.wordCount}</span>
                  <span>OCR: {result.ocrMethod}</span>
                  <span>समय: {result.processedAt}</span>
                </div>
              </div>
            </details>

            {/* Help Section */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="font-medium text-blue-800">मुफ्त कानूनी सहायता के लिए</p>
                  <p className="text-sm text-blue-700 mt-1">
                    NALSA हेल्पलाइन: <span className="font-bold">15100</span> (टोल फ्री, 24x7)
                  </p>
                  <p className="text-xs text-blue-600 mt-1">या अपने जिले के विधिक सेवा प्राधिकरण से मिलें</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClear}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-saffron-500 to-saffron-600 text-white hover:shadow-lg transition-all"
              >
                <span>📄</span>
                <span>नया दस्तावेज़ स्कैन करें</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-3 rounded-xl text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                🖨️
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips Section */}
      {step === 1 && (
        <div className="mt-6 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-medium text-yellow-800">बेहतर परिणाम के लिए टिप्स:</p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• साफ़ और स्पष्ट फोटो खींचें</li>
                <li>• पूरा दस्तावेज़ फ्रेम में आना चाहिए</li>
                <li>• अच्छी रोशनी में फोटो लें</li>
                <li>• धुंधली या तिरछी फोटो न लें</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentUpload
