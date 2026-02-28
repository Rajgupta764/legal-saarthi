import { useState, useRef, useEffect } from 'react'
import api from '../../services/api'

const DraftGenerator = () => {
  const [issueType, setIssueType] = useState('')
  const [details, setDetails] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generatedDraft, setGeneratedDraft] = useState(null)
  const [copied, setCopied] = useState(false)
  
  // Voice input states
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(true)
  const recognitionRef = useRef(null)

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsVoiceSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'hi-IN'

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' '
        } else {
          interimTranscript += result[0].transcript
        }
      }

      setDetails((prev) => {
        if (finalTranscript) return prev + finalTranscript
        const words = prev.trim().split(' ')
        if (words.length > 0 && interimTranscript) {
          return words.slice(0, -1).join(' ') + (words.length > 1 ? ' ' : '') + interimTranscript
        }
        return prev + interimTranscript
      })
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'no-speech') {
        setError('आवाज़ नहीं सुनाई दी। कृपया फिर से बोलें।')
      } else if (event.error === 'audio-capture') {
        setError('माइक्रोफ़ोन नहीं मिला। कृपया जांचें।')
      } else if (event.error === 'not-allowed') {
        setError('माइक्रोफ़ोन की अनुमति नहीं है। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।')
      } else {
        setError('आवाज़ पहचान में त्रुटि। कृपया पुनः प्रयास करें।')
      }
      setIsRecording(false)
    }

    recognition.onend = () => {
      if (isRecording) recognition.start()
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [isRecording])

  const startVoiceInput = () => {
    setError(null)
    setIsRecording(true)
    if (recognitionRef.current) recognitionRef.current.start()
  }

  const stopVoiceInput = () => {
    setIsRecording(false)
    if (recognitionRef.current) recognitionRef.current.stop()
  }

  // Issue types for dropdown
  const issueTypes = [
    { value: '', label: 'समस्या का प्रकार चुनें' },
    { value: 'land_dispute', label: '🏠 भूमि विवाद' },
    { value: 'property_dispute', label: '🏢 संपत्ति विवाद' },
    { value: 'family_dispute', label: '👨‍👩‍👧‍👦 पारिवारिक विवाद' },
    { value: 'domestic_violence', label: '🚨 घरेलू हिंसा' },
    { value: 'consumer_complaint', label: '🛒 उपभोक्ता शिकायत' },
    { value: 'employment_issue', label: '💼 रोजगार संबंधी' },
    { value: 'police_complaint', label: '👮 पुलिस शिकायत (FIR)' },
    { value: 'court_affidavit', label: '⚖️ न्यायालय शपथ पत्र' },
    { value: 'rti_application', label: '📋 RTI आवेदन' },
    { value: 'pension_issue', label: '👴 पेंशन संबंधी' },
    { value: 'caste_certificate', label: '📄 जाति प्रमाण पत्र' },
    { value: 'ration_card', label: '🍚 राशन कार्ड' },
    { value: 'other', label: '📝 अन्य' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!issueType) {
      setError('कृपया समस्या का प्रकार चुनें')
      return
    }

    if (!details.trim()) {
      setError('कृपया समस्या का विवरण लिखें')
      return
    }

    setIsLoading(true)
    setError(null)
    setGeneratedDraft(null)

    try {
      const response = await api.post('/generate-draft', {
        issueType,
        details: details.trim()
      })
      // Backend returns {success: true, data: {draft, tips, submitTo}}
      if (response.data.success && response.data.data) {
        setGeneratedDraft(response.data.data)
      } else {
        setError(response.data.message || 'पत्र बनाने में त्रुटि हुई')
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'सर्वर त्रुटि। कृपया पुनः प्रयास करें।')
      } else if (err.request) {
        setError('सर्वर से कनेक्ट नहीं हो पा रहा। कृपया इंटरनेट जांचें।')
      } else {
        setError('कुछ गड़बड़ हुई। कृपया पुनः प्रयास करें।')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    const textToCopy = generatedDraft?.draft || generatedDraft?.content || ''
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = textToCopy
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownloadPDF = () => {
    const draftContent = generatedDraft?.draft || generatedDraft?.content || ''
    const issueLabel = issueTypes.find(i => i.value === issueType)?.label || 'शिकायत पत्र'
    
    // Create print-friendly HTML
    const printContent = `
      <!DOCTYPE html>
      <html lang="hi">
      <head>
        <meta charset="UTF-8">
        <title>${issueLabel} - Legal Saathi</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Noto Sans Devanagari', sans-serif;
            font-size: 14pt;
            line-height: 1.8;
            padding: 40px 60px;
            color: #1a1a1a;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
          }
          
          .header h1 {
            font-size: 18pt;
            font-weight: 700;
            margin-bottom: 5px;
          }
          
          .header p {
            font-size: 10pt;
            color: #666;
          }
          
          .content {
            white-space: pre-wrap;
            text-align: justify;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            font-size: 10pt;
            color: #666;
            text-align: center;
          }
          
          @media print {
            body {
              padding: 20px 40px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${issueLabel.replace(/[🏠🏢👨‍👩‍👧‍👦🚨🛒💼👮📋👴📄🍚📝]/g, '').trim()}</h1>
          <p>Legal Saathi द्वारा जनरेट किया गया</p>
        </div>
        <div class="content">${draftContent}</div>
        <div class="footer">
          <p>यह दस्तावेज़ Legal Saathi एप्लिकेशन द्वारा ${new Date().toLocaleDateString('hi-IN')} को बनाया गया है।</p>
        </div>
      </body>
      </html>
    `
    
    // Open print dialog
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  const handleClear = () => {
    setIssueType('')
    setDetails('')
    setGeneratedDraft(null)
    setError(null)
  }

  // Icons
  const DocumentIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  )

  const CopyIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )

  const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )

  const CheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
          <DocumentIcon className="w-10 h-10 text-purple-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          शिकायत पत्र जनरेटर
        </h2>
        <p className="text-gray-600 text-lg">
          अपनी समस्या बताएं, हम आपके लिए शिकायत पत्र तैयार करेंगे
        </p>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
        <form onSubmit={handleSubmit}>
          {/* Issue Type Dropdown */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              समस्या का प्रकार
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              disabled={isLoading}
              className="
                w-full px-5 py-4 text-lg
                border-2 border-gray-200 rounded-xl
                focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                transition-all duration-200
                bg-white cursor-pointer
                appearance-none
              "
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 1rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              {issueTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Details Textarea with Voice Input */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              समस्या का विवरण
            </label>
            <div className="relative">
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="अपनी समस्या के बारे में विस्तार से लिखें...&#10;&#10;उदाहरण: मेरे पड़ोसी ने मेरी 2 बीघा ज़मीन पर अवैध कब्ज़ा कर लिया है। यह ज़मीन मेरे पिताजी के नाम से है और हमारे पास सभी कागज़ात हैं..."
                rows={6}
                disabled={isLoading}
                className={`
                  w-full px-5 py-4 text-lg pr-16
                  border-2 rounded-xl
                  focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                  transition-all duration-200
                  placeholder-gray-400
                  resize-none
                  ${isRecording ? 'border-red-400 bg-red-50' : 'border-gray-200'}
                `}
              />
              
              {/* Voice Input Button */}
              {isVoiceSupported && (
                <button
                  type="button"
                  onClick={isRecording ? stopVoiceInput : startVoiceInput}
                  disabled={isLoading}
                  className={`
                    absolute right-3 top-3
                    w-12 h-12 rounded-full
                    flex items-center justify-center
                    transition-all duration-200
                    ${isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                      : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  title={isRecording ? 'रिकॉर्डिंग बंद करें' : 'बोलकर लिखें'}
                >
                  {isRecording ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            
            {/* Voice Recording Status */}
            {isRecording && (
              <div className="mt-3 flex items-center gap-2 text-red-600">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">रिकॉर्डिंग जारी है... बोलें और फिर बंद करें</span>
              </div>
            )}
            
            <p className="mt-2 text-sm text-gray-500">
              💡 जितना विस्तार से लिखेंगे, उतना बेहतर पत्र बनेगा | 🎤 माइक बटन से बोलकर भी लिख सकते हैं
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isLoading || !issueType || !details.trim()}
              className={`
                flex-1 px-8 py-4 rounded-xl font-bold text-lg
                flex items-center justify-center gap-3
                transition-all duration-200
                ${isLoading || !issueType || !details.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                }
              `}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>पत्र बना रहे हैं...</span>
                </>
              ) : (
                <>
                  <DocumentIcon className="w-6 h-6" />
                  <span>पत्र बनाएं</span>
                </>
              )}
            </button>

            {(issueType || details) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-4 rounded-xl font-semibold text-lg border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                साफ़ करें
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">❌</span>
            <div>
              <h4 className="font-bold text-red-700 text-lg">त्रुटि</h4>
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Generated Draft Display */}
      {generatedDraft && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Draft Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📄</span>
              <span>आपका शिकायत पत्र</span>
            </h3>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className={`
                  px-4 py-2 rounded-lg font-semibold text-sm
                  flex items-center gap-2
                  transition-all duration-200
                  ${copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
                  }
                `}
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    <span>कॉपी हो गया!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-5 h-5" />
                    <span>कॉपी करें</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="
                  px-4 py-2 rounded-lg font-semibold text-sm
                  flex items-center gap-2
                  bg-white text-purple-600
                  hover:bg-purple-50
                  transition-all duration-200
                "
              >
                <DownloadIcon className="w-5 h-5" />
                <span>PDF डाउनलोड</span>
              </button>
            </div>
          </div>

          {/* Draft Content */}
          <div className="p-6 sm:p-8">
            <div 
              className="
                bg-gray-50 rounded-xl p-6 sm:p-8
                border-2 border-dashed border-gray-200
                font-serif text-lg leading-relaxed
                whitespace-pre-wrap
              "
              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            >
              {generatedDraft.draft || generatedDraft.content || 'पत्र जनरेट नहीं हो पाया'}
            </div>

            {/* Additional Info */}
            {generatedDraft.tips && (
              <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
                <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <span>💡</span>
                  <span>महत्वपूर्ण सुझाव</span>
                </h4>
                <ul className="space-y-2 text-amber-700">
                  {Array.isArray(generatedDraft.tips) ? (
                    generatedDraft.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{tip}</span>
                      </li>
                    ))
                  ) : (
                    <li>{generatedDraft.tips}</li>
                  )}
                </ul>
              </div>
            )}

            {/* Where to Submit */}
            {generatedDraft.submitTo && (
              <div className="mt-4 bg-blue-50 rounded-xl p-5 border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <span>📍</span>
                  <span>कहाँ जमा करें</span>
                </h4>
                <ul className="space-y-2 text-blue-700">
                  {Array.isArray(generatedDraft.submitTo) ? (
                    generatedDraft.submitTo.map((place, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500">→</span>
                        <span>{place}</span>
                      </li>
                    ))
                  ) : (
                    <li>{generatedDraft.submitTo}</li>
                  )}
                </ul>
              </div>
            )}

            {/* Mobile Action Buttons */}
            <div className="mt-6 flex flex-col sm:hidden gap-3">
              <button
                onClick={handleCopy}
                className={`
                  w-full px-6 py-4 rounded-xl font-bold text-lg
                  flex items-center justify-center gap-3
                  transition-all duration-200
                  ${copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }
                `}
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-6 h-6" />
                    <span>कॉपी हो गया!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-6 h-6" />
                    <span>कॉपी करें</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="
                  w-full px-6 py-4 rounded-xl font-bold text-lg
                  flex items-center justify-center gap-3
                  bg-gradient-to-r from-purple-600 to-indigo-600
                  text-white shadow-lg
                  hover:shadow-xl
                  transition-all duration-200
                "
              >
                <DownloadIcon className="w-6 h-6" />
                <span>PDF डाउनलोड करें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-purple-50 rounded-xl p-6">
        <h4 className="font-bold text-purple-800 text-lg mb-3 flex items-center gap-2">
          <span>📝</span>
          <span>कैसे उपयोग करें</span>
        </h4>
        <ol className="space-y-3 text-purple-700">
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 bg-purple-200 rounded-full flex items-center justify-center font-bold text-purple-800 flex-shrink-0">1</span>
            <span>ड्रॉपडाउन से अपनी समस्या का प्रकार चुनें</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 bg-purple-200 rounded-full flex items-center justify-center font-bold text-purple-800 flex-shrink-0">2</span>
            <span>अपनी समस्या का पूरा विवरण लिखें - नाम, तारीख, जगह सब बताएं</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 bg-purple-200 rounded-full flex items-center justify-center font-bold text-purple-800 flex-shrink-0">3</span>
            <span>"पत्र बनाएं" बटन दबाएं</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 bg-purple-200 rounded-full flex items-center justify-center font-bold text-purple-800 flex-shrink-0">4</span>
            <span>पत्र को कॉपी करें या PDF में डाउनलोड करें</span>
          </li>
        </ol>
      </div>
    </div>
  )
}

export default DraftGenerator
