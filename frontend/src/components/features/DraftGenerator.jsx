import { useState, useRef, useEffect } from 'react'
import html2pdf from 'html2pdf.js'
import api from '../../services/api'
import ProblemRewrite from './ProblemRewrite'

const DraftGenerator = () => {
  const [step, setStep] = useState(1)
  const [issueType, setIssueType] = useState('')
  const [details, setDetails] = useState('')
  const [language, setLanguage] = useState('hindi')
  const [isLoading, setIsLoading] = useState(false)

  // Sender & Recipient info
  const [senderName, setSenderName] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [senderAddress, setSenderAddress] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [senderDistrict, setSenderDistrict] = useState('')
  const [senderState, setSenderState] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientOffice, setRecipientOffice] = useState('')
  const [subject, setSubject] = useState('')

  const [error, setError] = useState(null)
  const [generatedDraft, setGeneratedDraft] = useState(null)
  const [copied, setCopied] = useState(false)
  
  // Voice input states
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(true)
  const recognitionRef = useRef(null)
  const isRecordingRef = useRef(false)
  const stopRequestedRef = useRef(false)
  const restartTimeoutRef = useRef(null)
  const finalDetailsRef = useRef('')

  const mergeWithOverlap = (baseText, incomingText) => {
    const base = baseText.trim()
    const incoming = incomingText.trim()

    if (!base) return incoming
    if (!incoming) return base
    if (base === incoming) return base

    const baseWords = base.split(/\s+/)
    const incomingWords = incoming.split(/\s+/)
    const maxOverlap = Math.min(baseWords.length, incomingWords.length)

    for (let overlap = maxOverlap; overlap >= 1; overlap--) {
      const baseTail = baseWords.slice(-overlap).join(' ').toLowerCase()
      const incomingHead = incomingWords.slice(0, overlap).join(' ').toLowerCase()

      if (baseTail === incomingHead) {
        const remainder = incomingWords.slice(overlap).join(' ')
        return remainder ? `${base} ${remainder}` : base
      }
    }

    return `${base} ${incoming}`
  }

  useEffect(() => {
    isRecordingRef.current = isRecording
  }, [isRecording])

  useEffect(() => {
    finalDetailsRef.current = details.trimEnd()
  }, [details])

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
      let finalChunk = ''
      let interimChunk = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalChunk += result[0].transcript + ' '
        } else {
          interimChunk += result[0].transcript
        }
      }

      if (finalChunk) {
        finalDetailsRef.current = mergeWithOverlap(finalDetailsRef.current, finalChunk)
      }

      const composedText = [finalDetailsRef.current, interimChunk.trim()].filter(Boolean).join(' ').trim()
      setDetails(composedText)
    }

    recognition.onerror = (event) => {
      const expectedErrors = new Set(['aborted', 'no-speech'])
      if (!expectedErrors.has(event.error)) {
        console.error('Speech recognition error:', event.error)
      }

      if (event.error === 'no-speech' || event.error === 'aborted') {
        return
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
      if (isRecordingRef.current && !stopRequestedRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (!isRecordingRef.current || stopRequestedRef.current || !recognitionRef.current) {
            return
          }
          try {
            recognitionRef.current.start()
          } catch (e) {
            if (e?.name !== 'InvalidStateError') {
              console.error('Error restarting recognition:', e)
            }
          }
        }, 300)
      }
    }

    recognitionRef.current = recognition

    return () => {
      stopRequestedRef.current = true
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [])

  const startVoiceInput = () => {
    setError(null)
    stopRequestedRef.current = false
    finalDetailsRef.current = details.trimEnd()
    setIsRecording(true)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        if (e?.name !== 'InvalidStateError') {
          console.error('Error starting recognition:', e)
        }
        setError('आवाज़ पहचान शुरू नहीं हो सकी। कृपया पुनः प्रयास करें।')
        setIsRecording(false)
      }
    }
  }

  const stopVoiceInput = () => {
    stopRequestedRef.current = true
    setIsRecording(false)
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
    }
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

  // Auto-fill recipient & subject when issue type changes
  const recipientDefaults = {
    land_dispute: { hi: { name: 'श्रीमान जिलाधिकारी/तहसीलदार महोदय', office: 'जिला कार्यालय/तहसील कार्यालय', subject: 'भूमि विवाद/अवैध कब्ज़े के संबंध में शिकायत' }, en: { name: 'The District Magistrate/Tehsildar', office: 'District Office/Tehsil Office', subject: 'Complaint Regarding Land Dispute / Illegal Occupation' } },
    property_dispute: { hi: { name: 'श्रीमान जिलाधिकारी/उप-जिलाधिकारी महोदय', office: 'जिला कार्यालय', subject: 'संपत्ति विवाद के संबंध में शिकायत' }, en: { name: 'The District Magistrate/Sub-Divisional Magistrate', office: 'District Office', subject: 'Complaint Regarding Property Dispute' } },
    family_dispute: { hi: { name: 'श्रीमान न्यायिक मजिस्ट्रेट/परिवार न्यायालय', office: 'परिवार न्यायालय', subject: 'पारिवारिक विवाद के संबंध में शिकायत' }, en: { name: 'The Family Court Judge', office: 'Family Court', subject: 'Complaint Regarding Family Dispute' } },
    domestic_violence: { hi: { name: 'श्रीमान थाना प्रभारी/महिला थाना', office: 'थाना/महिला थाना', subject: 'घरेलू हिंसा के संबंध में शिकायत/FIR' }, en: { name: 'The Station House Officer/Women\'s Police Station', office: 'Police Station/Women\'s Police Station', subject: 'Complaint Regarding Domestic Violence' } },
    consumer_complaint: { hi: { name: 'श्रीमान अध्यक्ष, जिला उपभोक्ता विवाद निवारण आयोग', office: 'जिला उपभोक्ता मंच', subject: 'उपभोक्ता शिकायत - दोषपूर्ण सामान/सेवा' }, en: { name: 'The President, District Consumer Disputes Redressal Commission', office: 'District Consumer Forum', subject: 'Consumer Complaint - Defective Goods/Service' } },
    employment_issue: { hi: { name: 'श्रीमान श्रम आयुक्त/श्रम अधिकारी', office: 'श्रम विभाग कार्यालय', subject: 'रोजगार संबंधी शिकायत/वेतन बकाया' }, en: { name: 'The Labour Commissioner/Labour Officer', office: 'Labour Department Office', subject: 'Employment Complaint / Salary Dues' } },
    police_complaint: { hi: { name: 'श्रीमान थाना प्रभारी (SHO)', office: 'थाना', subject: 'FIR दर्ज करने हेतु प्रार्थना पत्र' }, en: { name: 'The Station House Officer (SHO)', office: 'Police Station', subject: 'Complaint for Registration of FIR' } },
    court_affidavit: { hi: { name: 'माननीय न्यायालय', office: 'न्यायालय', subject: 'शपथ पत्र' }, en: { name: "The Hon'ble Court", office: 'Court', subject: 'Affidavit' } },
    rti_application: { hi: { name: 'श्रीमान जन सूचना अधिकारी', office: 'संबंधित विभाग', subject: 'सूचना का अधिकार अधिनियम 2005 के तहत आवेदन' }, en: { name: 'The Public Information Officer', office: 'Concerned Department', subject: 'Application under Right to Information Act 2005' } },
    pension_issue: { hi: { name: 'श्रीमान जिला समाज कल्याण अधिकारी', office: 'समाज कल्याण विभाग', subject: 'पेंशन संबंधी शिकायत/आवेदन' }, en: { name: 'The District Social Welfare Officer', office: 'Social Welfare Department', subject: 'Complaint/Application Regarding Pension' } },
    caste_certificate: { hi: { name: 'श्रीमान तहसीलदार/उप-जिलाधिकारी', office: 'तहसील कार्यालय', subject: 'जाति/आय/निवास प्रमाण पत्र हेतु आवेदन' }, en: { name: 'The Tehsildar/Sub-Divisional Magistrate', office: 'Tehsil Office', subject: 'Application for Caste/Income/Residence Certificate' } },
    ration_card: { hi: { name: 'श्रीमान जिला आपूर्ति अधिकारी', office: 'खाद्य एवं आपूर्ति विभाग', subject: 'राशन कार्ड संबंधी आवेदन/शिकायत' }, en: { name: 'The District Supply Officer', office: 'Food & Supply Department', subject: 'Application/Complaint Regarding Ration Card' } },
    other: { hi: { name: 'श्रीमान संबंधित अधिकारी', office: 'संबंधित कार्यालय', subject: 'शिकायत/आवेदन' }, en: { name: 'The Concerned Authority', office: 'Concerned Office', subject: 'Complaint/Application' } },
  }

  const handleIssueTypeChange = (val) => {
    setIssueType(val)
    if (val && recipientDefaults[val]) {
      const lang = language === 'english' ? 'en' : 'hi'
      const defaults = recipientDefaults[val][lang]
      setRecipientName(defaults.name)
      setRecipientOffice(defaults.office)
      setSubject(defaults.subject)
    }
  }

  // Also update defaults when language changes
  useEffect(() => {
    if (issueType && recipientDefaults[issueType]) {
      const lang = language === 'english' ? 'en' : 'hi'
      const defaults = recipientDefaults[issueType][lang]
      setRecipientName(defaults.name)
      setRecipientOffice(defaults.office)
      setSubject(defaults.subject)
    }
  }, [language])



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
        details: details.trim(),
        language,
        senderInfo: {
          name: senderName.trim(),
          fatherName: fatherName.trim(),
          address: senderAddress.trim(),
          phone: senderPhone.trim(),
          district: senderDistrict.trim(),
          state: senderState.trim(),
        },
        recipient: {
          name: recipientName.trim(),
          office: recipientOffice.trim(),
        },
        subject: subject.trim(),
      })
      // Backend returns {success: true, data: {draft, tips, submitTo}, language}
      if (response.data.success && response.data.data) {
        setGeneratedDraft(response.data.data)
        // Auto-save draft to Document Vault
        const draftText = response.data.data.draft || response.data.data.content || ''
        if (draftText) {
          api.post('/profile/documents', {
            name: `${issueType} — शिकायत पत्र`,
            type: 'Draft',
            content: draftText,
            source: 'draft',
          }).catch(() => {})
        }
        api.post('/profile/activity', { type: 'draft_generated', details: { issueType } }).catch(() => {})
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

  // Called when user accepts AI rewritten text
  const handleAIRewriteAccept = (rewrittenText) => {
    setDetails(rewrittenText)
    setError(null)
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
    const cleanLabel = issueLabel.replace(/[🏠🏢👨‍👩‍👧‍👦🚨🛒💼👮⚖️📋👴📄🍚📝]/g, '').trim()
    const dateStr = new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })

    const escapeHtml = (str) => str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    const safeContent = escapeHtml(draftContent)

    // Build an off-screen element for html2pdf
    const container = document.createElement('div')
    container.style.width = '190mm' // A4 width minus margins
    container.innerHTML = `
      <div style="font-family: 'Noto Sans Devanagari', 'Times New Roman', serif; color: #111; padding: 6px;">
        <div style="border: 2px solid #222; padding: 16px 18px; position: relative;">
          <div style="position:absolute; inset:3px; border:1px solid #999; pointer-events:none;"></div>
          <div style="text-align:center; padding-bottom:8px; margin-bottom:10px; border-bottom:2.5px double #333;">
            <h1 style="font-size:14pt; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin:0 0 2px 0;">${escapeHtml(cleanLabel)}</h1>
            <div style="font-size:9pt; font-weight:600; color:#444;">${language === 'english' ? 'Formal Application / Complaint Letter' : 'औपचारिक आवेदन / शिकायत पत्र'}</div>
            <div style="font-size:7.5pt; color:#888; margin-top:3px;">${language === 'english' ? 'Date' : 'दिनांक'}: ${dateStr} &nbsp;|&nbsp; ${language === 'english' ? 'Ref' : 'संदर्भ'}: LS/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}</div>
          </div>
          <div style="white-space:pre-wrap; text-align:justify; font-size:9.5pt; line-height:1.45;">${safeContent}</div>
          <div style="margin-top:14px; padding-top:6px; border-top:1px solid #aaa; display:flex; justify-content:space-between; align-items:flex-end; font-size:7pt; color:#999;">
            <div>
              <div>${language === 'english' ? 'Generated via Legal Saathi' : 'Legal Saathi द्वारा निर्मित'}</div>
              <div>${dateStr}</div>
            </div>
            <div style="width:70px; height:40px; border:1px dashed #ccc; display:flex; align-items:center; justify-content:center; font-size:6pt; color:#bbb; text-align:center;">${language === 'english' ? 'Office Stamp / Seal' : 'कार्यालय मोहर'}</div>
          </div>
        </div>
      </div>
    `

    const fileName = `${cleanLabel.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`

    html2pdf()
      .set({
        margin: [8, 6, 8, 6],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, width: 718 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(container)
      .save()
  }

  const handleClear = () => {
    setStep(1)
    setIssueType('')
    setDetails('')
    setLanguage('hindi')
    setSenderName('')
    setFatherName('')
    setSenderAddress('')
    setSenderPhone('')
    setSenderDistrict('')
    setSenderState('')
    setRecipientName('')
    setRecipientOffice('')
    setSubject('')
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

  // Step validation
  const canGoToStep2 = issueType !== ''
  const canGoToStep3 = senderName.trim() && senderAddress.trim() && recipientName.trim() && subject.trim()
  const canSubmit = details.trim().length > 10

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
          3 आसान चरणों में अपना तैयार शिकायत पत्र बनाएं — बिना किसी खाली जगह के
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8 gap-0">
        {[
          { num: 1, label: 'प्रकार चुनें', icon: '📋' },
          { num: 2, label: 'जानकारी भरें', icon: '✍️' },
          { num: 3, label: 'समस्या बताएं', icon: '📝' },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <button
              type="button"
              onClick={() => {
                if (s.num === 1) setStep(1)
                else if (s.num === 2 && canGoToStep2) setStep(2)
                else if (s.num === 3 && canGoToStep2 && canGoToStep3) setStep(3)
              }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                step === s.num
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : step > s.num
                  ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <span className="text-lg">{step > s.num ? '✅' : s.icon}</span>
              <span className="text-xs font-semibold hidden sm:block">{s.label}</span>
              <span className="text-xs font-bold sm:hidden">चरण {s.num}</span>
            </button>
            {idx < 2 && (
              <div className={`w-8 sm:w-16 h-1 mx-1 rounded-full ${step > s.num ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
        <form onSubmit={handleSubmit}>

          {/* ===== STEP 1: Language + Issue Type ===== */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">📋 चरण 1: भाषा और समस्या का प्रकार</h3>
                <p className="text-gray-500 mt-1">सबसे पहले बताएं कि आप किस विषय में पत्र लिखना चाहते हैं</p>
              </div>

              {/* Language Selector */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  भाषा चुनें / Choose Language
                </label>
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center gap-3 cursor-pointer p-4 border-2 rounded-xl transition-all duration-200" 
                         style={{borderColor: language === 'hindi' ? '#9333ea' : '#e5e7eb', backgroundColor: language === 'hindi' ? '#faf5ff' : 'transparent'}}>
                    <input type="radio" value="hindi" checked={language === 'hindi'} onChange={(e) => setLanguage(e.target.value)} className="w-5 h-5 cursor-pointer" />
                    <span className={`font-semibold ${language === 'hindi' ? 'text-purple-600' : 'text-gray-700'}`}>🇮🇳 हिंदी में</span>
                  </label>
                  <label className="flex-1 flex items-center gap-3 cursor-pointer p-4 border-2 rounded-xl transition-all duration-200"
                         style={{borderColor: language === 'english' ? '#9333ea' : '#e5e7eb', backgroundColor: language === 'english' ? '#faf5ff' : 'transparent'}}>
                    <input type="radio" value="english" checked={language === 'english'} onChange={(e) => setLanguage(e.target.value)} className="w-5 h-5 cursor-pointer" />
                    <span className={`font-semibold ${language === 'english' ? 'text-purple-600' : 'text-gray-700'}`}>🇬🇧 English</span>
                  </label>
                </div>
              </div>

              {/* Issue Type as Cards */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  समस्या का प्रकार चुनें
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {issueTypes.filter(t => t.value).map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleIssueTypeChange(type.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                        issueType === type.value
                          ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-200'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <span className="text-sm font-semibold">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-4">
                <button
                  type="button"
                  disabled={!canGoToStep2}
                  onClick={() => setStep(2)}
                  className={`w-full px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                    canGoToStep2
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>आगे बढ़ें</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 2: Sender & Recipient Info ===== */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">✍️ चरण 2: आपकी और प्राप्तकर्ता की जानकारी</h3>
                <p className="text-gray-500 mt-1">पत्र में आपका नाम, पता और किसे भेजना है — यह भरें</p>
              </div>

              {/* Recipient Section */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <span>📬</span>
                  <span>किसे लिखना है (प्राप्तकर्ता)</span>
                </h4>
                <p className="text-sm text-blue-600 mb-3">✅ आपकी समस्या के अनुसार स्वतः भरा गया है — आप बदल भी सकते हैं</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">प्राप्तकर्ता (सेवा में) *</label>
                    <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      placeholder="जैसे: श्रीमान थाना प्रभारी" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">कार्यालय</label>
                    <input type="text" value={recipientOffice} onChange={(e) => setRecipientOffice(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      placeholder="जैसे: थाना सदर" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">विषय (Subject) *</label>
                  <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    placeholder="जैसे: FIR दर्ज करने हेतु प्रार्थना पत्र" />
                </div>
              </div>

              {/* Sender Section */}
              <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  <span>👤</span>
                  <span>आपकी जानकारी (प्रार्थी/आवेदक)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">आपका नाम *</label>
                    <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      placeholder="अपना पूरा नाम लिखें" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">पिता/पति का नाम</label>
                    <input type="text" value={fatherName} onChange={(e) => setFatherName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      placeholder="पिता या पति का नाम" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">पूरा पता *</label>
                    <input type="text" value={senderAddress} onChange={(e) => setSenderAddress(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      placeholder="गांव/मोहल्ला, तहसील, ज़िला" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">मोबाइल नंबर</label>
                    <input type="tel" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      placeholder="10 अंकों का मोबाइल नंबर" maxLength={10} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">ज़िला</label>
                    <input type="text" value={senderDistrict} onChange={(e) => setSenderDistrict(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      placeholder="आपका ज़िला" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">राज्य</label>
                    <input type="text" value={senderState} onChange={(e) => setSenderState(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      placeholder="जैसे: उत्तर प्रदेश" />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setStep(1)}
                  className="px-6 py-4 rounded-xl font-semibold text-lg border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  <span>पीछे</span>
                </button>
                <button type="button" disabled={!canGoToStep3} onClick={() => setStep(3)}
                  className={`flex-1 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                    canGoToStep3
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}>
                  <span>आगे बढ़ें</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 3: Problem Details + Submit ===== */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">📝 चरण 3: अपनी समस्या बताएं</h3>
                <p className="text-gray-500 mt-1">अपनी समस्या विस्तार से लिखें या बोलकर बताएं — AI इसे सही भाषा में लिख देगा</p>
              </div>

              {/* Summary of previous steps */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-sm">
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-gray-600">
                  <span><strong>पत्र:</strong> {issueTypes.find(i => i.value === issueType)?.label}</span>
                  <span><strong>प्रति:</strong> {recipientName}</span>
                  <span><strong>प्रार्थी:</strong> {senderName}</span>
                </div>
                <button type="button" onClick={() => setStep(2)} className="text-purple-600 text-xs mt-1 hover:underline">बदलें ✏️</button>
              </div>

              {/* Details Textarea with Voice Input */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  समस्या का विवरण *
                </label>
                <div className="relative">
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder={language === 'english'
                      ? "Describe your problem in detail...\n\nExample: My neighbor has illegally occupied my 2 bigha land. The land is registered in my father's name and we have all documents..."
                      : "अपनी समस्या के बारे में विस्तार से लिखें...\n\nउदाहरण: मेरे पड़ोसी ने मेरी 2 बीघा ज़मीन पर अवैध कब्ज़ा कर लिया है। यह ज़मीन मेरे पिताजी के नाम से है और हमारे पास सभी कागज़ात हैं..."}
                    rows={6}
                    disabled={isLoading}
                    className={`w-full px-5 py-4 text-lg pr-16 border-2 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 placeholder-gray-400 resize-none ${
                      isRecording ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  
                  {/* Voice Input Button */}
                  {isVoiceSupported && (
                    <button type="button" onClick={isRecording ? stopVoiceInput : startVoiceInput} disabled={isLoading}
                      className={`absolute right-3 top-3 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isRecording ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={isRecording ? 'रिकॉर्डिंग बंद करें' : 'बोलकर लिखें'}>
                      {isRecording ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      )}
                    </button>
                  )}
                </div>
                
                {isRecording && (
                  <div className="mt-3 flex items-center gap-2 text-red-600">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-medium">🎙️ रिकॉर्डिंग जारी है... बोलें और फिर बंद करें</span>
                  </div>
                )}
                
                <p className="mt-2 text-sm text-gray-500">
                  💡 जितना विस्तार से लिखेंगे, उतना बेहतर पत्र बनेगा | 🎤 माइक बटन से बोलकर भी लिख सकते हैं
                </p>

                <ProblemRewrite onAccept={handleAIRewriteAccept} language={language} disabled={isLoading} />
              </div>

              {/* Navigation + Submit */}
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setStep(2)}
                  className="px-6 py-4 rounded-xl font-semibold text-lg border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  <span>पीछे</span>
                </button>
                <button type="submit" disabled={isLoading || !canSubmit}
                  className={`flex-1 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 ${
                    isLoading || !canSubmit
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                  }`}>
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>पत्र बना रहे हैं...</span>
                    </>
                  ) : (
                    <>
                      <DocumentIcon className="w-6 h-6" />
                      <span>🎯 तैयार पत्र बनाएं</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
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
              <span>{language === 'english' ? 'Your Application Letter' : 'आपका शिकायत पत्र'}</span>
              <span className="text-sm ml-2 px-3 py-1 bg-white/20 rounded-full">
                {language === 'english' ? '🇬🇧 English' : '🇮🇳 हिंदी'}
              </span>
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

          {/* Draft Content — A4 Paper Style */}
          <div className="p-4 sm:p-8 bg-gray-100">
            <div
              className="relative mx-auto bg-white shadow-card"
              style={{
                fontFamily: "'Noto Sans Devanagari', 'Times New Roman', serif",
                maxWidth: '720px',
              }}
            >
              {/* Double border frame */}
              <div className="absolute inset-3 border-2 border-gray-800 pointer-events-none" style={{ zIndex: 1 }} />
              <div className="absolute inset-[14px] border border-gray-400 pointer-events-none" style={{ zIndex: 1 }} />

              <div className="relative px-10 sm:px-14 py-10 sm:py-12">
                {/* Document header */}
                <div className="text-center pb-4 mb-5" style={{ borderBottom: '2.5px double #333' }}>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-wide uppercase text-gray-900 mb-1">
                    {(issueTypes.find(i => i.value === issueType)?.label || 'शिकायत पत्र').replace(/[🏠🏢👨‍👩‍👧‍👦🚨🛒💼👮⚖️📋👴📄🍚📝]/g, '').trim()}
                  </h2>
                  <p className="text-sm font-semibold text-gray-500">
                    {language === 'english' ? 'Formal Application / Complaint Letter' : 'औपचारिक आवेदन / शिकायत पत्र'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {language === 'english' ? 'Date' : 'दिनांक'}: {new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    {language === 'english' ? 'Ref' : 'संदर्भ'}: LS/{new Date().getFullYear()}/{String(Date.now()).slice(-6)}
                  </p>
                </div>

                {/* Document body */}
                <div
                  className="text-base leading-relaxed whitespace-pre-wrap"
                  style={{ textAlign: 'justify', fontSize: '12pt' }}
                >
                  {generatedDraft.draft || generatedDraft.content || 'पत्र जनरेट नहीं हो पाया'}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-3 border-t border-gray-300 flex justify-between items-end">
                  <div className="text-xs text-gray-400">
                    <p>{language === 'english' ? 'Generated via Legal Saathi' : 'Legal Saathi द्वारा निर्मित'}</p>
                    <p>{new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="w-24 h-16 border border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-[9px] text-gray-300 text-center leading-tight">
                      {language === 'english' ? 'Office Stamp / Seal' : 'कार्यालय\nमोहर'}
                    </span>
                  </div>
                </div>
              </div>
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
            <span><strong>चरण 1:</strong> भाषा और समस्या का प्रकार चुनें (जैसे FIR, भूमि विवाद, RTI आदि)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 bg-purple-200 rounded-full flex items-center justify-center font-bold text-purple-800 flex-shrink-0">2</span>
            <span><strong>चरण 2:</strong> अपना नाम, पता, मोबाइल भरें — पत्र किसको भेजना है वो अपने-आप भर जाएगा</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 bg-purple-200 rounded-full flex items-center justify-center font-bold text-purple-800 flex-shrink-0">3</span>
            <span><strong>चरण 3:</strong> अपनी समस्या लिखें या बोलकर बताएं — AI से भी लिखवा सकते हैं</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 bg-green-200 rounded-full flex items-center justify-center font-bold text-green-800 flex-shrink-0">✓</span>
            <span><strong>तैयार पत्र:</strong> आपका पूरा भरा हुआ, तैयार पत्र बन जाएगा — बस PDF डाउनलोड करें और जमा करें!</span>
          </li>
        </ol>
        
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            <strong>🎯 खास बात:</strong> आपका पत्र पूरी तरह तैयार होगा — कोई खाली जगह नहीं! सीधे प्रिंट करके जमा कर सकते हैं।
          </p>
        </div>
      </div>
    </div>
  )
}

export default DraftGenerator
