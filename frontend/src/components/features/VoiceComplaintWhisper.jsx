import { useState, useRef, useEffect } from 'react'
import api from '../../services/api'

const VoiceComplaintWhisper = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [isSupported, setIsSupported] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN')
  const [recordingTime, setRecordingTime] = useState(0)
  
  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const streamRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingTimerRef = useRef(null)

  const languages = [
    { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'en-IN', name: 'English', flag: '🇬🇧' },
    { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'mr-IN', name: 'मराठी', flag: '🇮🇳' },
    { code: 'bn-IN', name: 'বাংলা', flag: '🇮🇳' }
  ]

  // Check browser support for MediaRecorder API
  useEffect(() => {
    const hasMediaRecorder = !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    )
    
    if (!hasMediaRecorder) {
      setIsSupported(false)
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      setResult(null)
      setTranscript('')
      setRecordingTime(0)
      audioChunksRef.current = []

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      streamRef.current = stream

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstart = () => {
        setIsRecording(true)
        setRecordingTime(0)
        
        // Update recording timer every second
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      }

      mediaRecorder.onstop = async () => {
        setIsRecording(false)
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current)
        }

        // Combine audio chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        
        // Send to backend for transcription
        await transcribeAudio(audioBlob)

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('माइक्रोफ़ोन की अनुमति नहीं दी गई। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।')
      } else if (err.name === 'NotFoundError') {
        setError('कोई माइक्रोफ़ोन नहीं मिला। कृपया जांचें।')
      } else {
        setError('माइक्रोफ़ोन शुरू नहीं हो सका। कृपया पुनः प्रयास करें।')
      }
      console.error('Error accessing microphone:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }

  const transcribeAudio = async (audioBlob) => {
    try {
      setIsLoading(true)
      setError(null)

      // Create FormData and send to backend
      const formData = new FormData()
      formData.append('audio_file', audioBlob, 'recording.webm')
      formData.append('language', selectedLanguage)

      const response = await api.post('/speech/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        setTranscript(response.data.data.transcript)
      } else {
        setError(response.data.message || 'ऑडियो को टेक्स्ट में बदलने में विफल रहे।')
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'सर्वर त्रुटि। कृपया पुनः प्रयास करें।')
      } else if (err.request) {
        setError('सर्वर से कनेक्ट नहीं हो पा रहा। कृपया इंटरनेट जांचें।')
      } else {
        setError('कुछ गड़बड़ हुई। कृपया पुनः प्रयास करें।')
      }
      console.error('Error transcribing audio:', err)
    } finally {
      setIsLoading(false)
    }
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

          {/* Recording Timer */}
          {isRecording && (
            <div className="text-2xl font-bold text-red-500 mb-4 text-center min-w-24">
              {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
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
          placeholder={isLoading ? 'टेक्स्ट में बदल रहे हैं... / Converting...' : 'बोलें या यहाँ लिखें... / Speak or type here...'}
          disabled={isRecording || isLoading}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 resize-none"
        />
        
        {isLoading && (
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-saffron-500 rounded-full animate-bounce"></div>
            <span className="text-xs text-gray-600">ऑडियो को टेक्स्ट में बदल रहे हैं...</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      {transcript && (
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {isLoading ? 'प्रोसेस हो रहा है...' : 'समस्या को वर्गीकृत करें'}
        </button>
      )}

      {/* Results Display */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">विश्लेषण परिणाम:</h4>
          <pre className="text-sm text-green-800 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default VoiceComplaintWhisper
