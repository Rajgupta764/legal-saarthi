import { useState, useRef, useEffect } from 'react'
import api from '../../services/api'

const VoiceComplaint = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [isSupported, setIsSupported] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN')
  
  const recognitionRef = useRef(null)

  const languages = [
    { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'en-IN', name: 'English', flag: '🇬🇧' },
    { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'mr-IN', name: 'मराठी', flag: '🇮🇳' },
    { code: 'bn-IN', name: 'বাংলা', flag: '🇮🇳' }
  ]

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = selectedLanguage

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

      setTranscript((prev) => {
        if (finalTranscript) return prev + finalTranscript
        return prev.split(' ').slice(0, -1).join(' ') + ' ' + interimTranscript
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
  }, [isRecording, selectedLanguage])

  const startRecording = () => {
    setError(null)
    setResult(null)
    setTranscript('')
    setIsRecording(true)
    if (recognitionRef.current) recognitionRef.current.start()
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recognitionRef.current) recognitionRef.current.stop()
  }

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      setError('कृपया पहले अपनी समस्या बोलें')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post('/classify-issue', { text: transcript.trim() })
      if (response.data.success && response.data.data) {
        setResult(response.data.data)
      } else {
        setResult(response.data)
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

  const handleClear = () => {
    setTranscript('')
    setResult(null)
    setError(null)
  }

  if (!isSupported) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">
            आवाज़ सुविधा इस ब्राउज़र में उपलब्ध नहीं है। कृपया Chrome या Edge ब्राउज़र का उपयोग करें।
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Language Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">🗣️ भाषा चुनें / Select Language</h3>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setSelectedLanguage(lang.code)
                if (isRecording) {
                  stopRecording()
                }
                setTranscript('')
              }}
              disabled={isRecording}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                ${selectedLanguage === lang.code
                  ? 'bg-saffron-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <div className="flex flex-col items-center">
          {/* Recording Animation */}
          {isRecording && (
            <div className="flex items-center gap-1 mb-4">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="w-2 h-3 bg-red-500 rounded-full animate-pulse delay-75"></span>
              <span className="w-2 h-4 bg-red-500 rounded-full animate-pulse delay-150"></span>
              <span className="w-2 h-3 bg-red-500 rounded-full animate-pulse delay-75"></span>
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </div>
          )}
          
          {/* Record Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center transition-all
              ${isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-saffron-500 hover:bg-saffron-600'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>

          <p className="text-sm text-gray-600 mt-3">
            {isRecording ? 'रिकॉर्डिंग जारी... बंद करने के लिए टैप करें' : 'रिकॉर्ड शुरू करने के लिए टैप करें'}
          </p>
        </div>
      </div>

      {/* Transcript / Text Input */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">📝 आपकी बात / Your complaint</h3>
          {transcript && (
            <button onClick={handleClear} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              साफ़ करें
            </button>
          )}
        </div>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={isRecording ? 'सुन रहे हैं... / Listening...' : 'बोलें या यहाँ लिखें... / Speak or type here...'}
          disabled={isRecording}
          rows={3}
          className={`
            w-full p-3 rounded-lg border text-sm resize-none transition-all
            ${isRecording 
              ? 'border-saffron-300 bg-saffron-50 cursor-not-allowed' 
              : 'border-gray-200 bg-gray-50 focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400'
            }
          `}
        />
        <p className="text-xs text-gray-500 mt-2">
          💡 बोलकर या टाइप करके अपनी समस्या बताएं
        </p>
      </div>

      {/* Example Complaints */}
      {!transcript && !result && (
        <div className="bg-blue-50 rounded-lg border border-blue-100 p-4 mb-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">📌 उदाहरण / Examples:</h4>
          <div className="space-y-2">
            {[
              'मेरी ज़मीन पर पड़ोसी ने कब्ज़ा कर लिया है',
              'मेरे पति मुझे रोज़ मारते हैं',
              'दुकानदार ने खराब सामान दिया और पैसे वापस नहीं कर रहा',
              'मेरी नौकरी से बिना कारण निकाल दिया गया'
            ].map((example, idx) => (
              <button 
                key={idx}
                onClick={() => setTranscript(example)}
                className="block w-full text-left text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!transcript.trim() || isLoading || isRecording}
        className={`
          w-full py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
          ${!transcript.trim() || isLoading || isRecording
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-saffron-500 text-white hover:bg-saffron-600 shadow-md hover:shadow-lg'
          }
        `}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            विश्लेषण हो रहा है...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            समस्या विश्लेषण करें / Analyze Issue
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-green-50 border-b border-green-100 px-4 py-3">
            <p className="text-sm font-medium text-green-800">विश्लेषण पूर्ण</p>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Category */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">📌 कानूनी श्रेणी</h4>
              <p className="text-sm text-gray-800 bg-blue-50 px-3 py-2 rounded font-medium">
                {result.categoryName || result.category || 'पहचान नहीं हुई'}
              </p>
              {result.message && (
                <p className="text-xs text-gray-600 mt-1">{result.message}</p>
              )}
            </div>

            {/* Relevant Laws */}
            {result.relevantLaws && result.relevantLaws.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">⚖️ संबंधित कानून</h4>
                <ul className="space-y-1.5 bg-purple-50 rounded-lg p-3">
                  {result.relevantLaws.map((law, index) => (
                    <li key={index} className="text-sm text-purple-800 flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span>{law}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            {result.steps && result.steps.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">📝 अगले कदम</h4>
                <ul className="space-y-2">
                  {result.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Documents */}
            {result.documents && result.documents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">📄 ज़रूरी दस्तावेज़</h4>
                <ul className="space-y-1 bg-amber-50 rounded-lg p-3">
                  {result.documents.map((doc, index) => (
                    <li key={index} className="text-sm text-amber-800 flex items-center gap-2">
                      <span className="text-amber-500">●</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Helplines & Nearby Offices */}
            {result.helplines && result.helplines.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">📞 हेल्पलाइन और कार्यालय</h4>
                <div className="grid gap-2">
                  {result.helplines.map((helpline, index) => (
                    <div key={index} className="flex items-center justify-between bg-saffron-50 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-700">{helpline.name}</span>
                      <a 
                        href={`tel:${helpline.number}`}
                        className="text-sm font-medium text-saffron-600 hover:text-saffron-700 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {helpline.number}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Offices */}
            {result.nearbyOffices && result.nearbyOffices.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">🏛️ नज़दीकी कार्यालय</h4>
                <div className="space-y-2">
                  {result.nearbyOffices.map((office, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-800">{office.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{office.address}</p>
                      {office.timing && (
                        <p className="text-xs text-gray-500 mt-1">⏰ {office.timing}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Tips */}
      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">💡 कैसे इस्तेमाल करें / How to use:</h4>
        <ul className="space-y-1.5 text-xs text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-saffron-500">1.</span>
            भाषा चुनें (हिंदी या अन्य) / Select language
          </li>
          <li className="flex items-start gap-2">
            <span className="text-saffron-500">2.</span>
            माइक बटन दबाएं और अपनी समस्या बोलें / Click mic and speak
          </li>
          <li className="flex items-start gap-2">
            <span className="text-saffron-500">3.</span>
            या टेक्स्ट बॉक्स में समस्या लिखें / Or type in the text box
          </li>
          <li className="flex items-start gap-2">
            <span className="text-saffron-500">4.</span>
            विश्लेषण बटन दबाएं / Click analyze button
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
          🔒 आपकी जानकारी सुरक्षित है / Your information is secure
        </p>
      </div>
    </div>
  )
}

export default VoiceComplaint
