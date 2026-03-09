import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'

const VoiceAssistant = ({ onDocumentGenerated, autoStart = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [language, setLanguage] = useState('hi-IN') // Hindi by default
  const [aiHistory, setAiHistory] = useState([])
  
  const recognitionRef = useRef(null)
  const synthesisRef = useRef(null)
  const audioRef = useRef(null)
  const messagesEndRef = useRef(null)
  const isListeningRef = useRef(false)
  const stopListeningRequestedRef = useRef(false)
  const speechSessionRef = useRef(0) // tracks current speech session to prevent overlaps

  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  // Load voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        console.log('Available voices:', voices.map(v => v.name))
      }
      
      loadVoices()
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
    }
  }, [])

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = language
      recognitionRef.current.maxAlternatives = 1

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)

        if (finalTranscript) {
          handleVoiceInput(finalTranscript.trim())
        }
      }

      recognitionRef.current.onerror = (event) => {
        const expectedErrors = new Set(['aborted', 'no-speech'])
        if (!expectedErrors.has(event.error)) {
          console.error('Speech recognition error:', event.error)
        }

        if (event.error === 'aborted') {
          return
        }

        setIsListening(false)
        if (event.error === 'no-speech') {
          if (messages.length > 1) {
            speakMessage('कुछ सुनाई नहीं दिया। कृपया फिर से बोलें।')
          }
        } else if (event.error === 'network') {
          speakMessage('इंटरनेट की समस्या है। कृपया जांचें।')
        } else if (event.error === 'not-allowed') {
          speakMessage('माइक्रोफ़ोन की अनुमति नहीं है।')
        }
      }

      recognitionRef.current.onend = () => {
        if (!stopListeningRequestedRef.current) {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [language])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-start if prop is true
  useEffect(() => {
    if (autoStart) {
      setIsOpen(true)
      startVoiceAssistant()
    }
  }, [autoStart])

  const startVoiceAssistant = async () => {
    try {
      const lang = language === 'hi-IN' ? 'hi' : 'en'
      const response = await api.get(`/chatbot/ai-chat/welcome?lang=${lang}`)
      if (response.data.success) {
        const initialMsg = response.data.data.message
        // Use a spoken-friendly version for voice
        const spokenMsg = language === 'hi-IN'
          ? 'नमस्ते! मैं कानूनी साथी हूँ। अपनी समस्या बताइए, मैं मदद करूँगी।'
          : 'Hello! I am Legal Saathi. Tell me your problem, I will help.'
        const botMessage = { type: 'bot', content: initialMsg }
        setMessages([botMessage])
        setAiHistory([])
        speakMessage(spokenMsg, () => {
          setTimeout(() => startListening(), 500)
        })
      }
    } catch (error) {
      console.error('Error starting voice assistant:', error)
      const fallback = language === 'hi-IN'
        ? 'नमस्ते! मैं कानूनी साथी हूँ। अपनी समस्या बताइए, मैं मदद करूँगी।'
        : 'Hello! I am Legal Saathi. Tell me your problem, I will help.'
      setMessages([{ type: 'bot', content: fallback }])
      speakMessage(fallback, () => setTimeout(() => startListening(), 500))
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListeningRef.current) {
      stopListeningRequestedRef.current = false
      setTranscript('')
      setIsListening(true)
      try {
        recognitionRef.current.start()
      } catch (error) {
        if (error?.name !== 'InvalidStateError') {
          console.error('Error starting recognition:', error)
        }
        setIsListening(false)
      }
    }
  }

  const stopListening = () => {
    stopListeningRequestedRef.current = true
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speakWithBrowser = (text, onComplete = null, sessionId = null) => {
    // If session changed, abort
    if (sessionId !== null && sessionId !== speechSessionRef.current) {
      if (onComplete) onComplete()
      return
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.volume = 1
      const voices = window.speechSynthesis.getVoices()
      const preferred = voices.find(v =>
        v.lang.startsWith(language.split('-')[0]) &&
        /female|woman|zira|hazel|samantha/i.test(v.name)
      ) || voices.find(v => v.lang.startsWith(language.split('-')[0]))
      if (preferred) utterance.voice = preferred
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => { setIsSpeaking(false); if (onComplete) onComplete() }
      utterance.onerror = () => { setIsSpeaking(false); if (onComplete) onComplete() }
      setIsSpeaking(true)
      setTimeout(() => window.speechSynthesis.speak(utterance), 100)
    } else if (onComplete) {
      onComplete()
    }
  }

  const speakMessage = async (text, onComplete = null) => {
    // Increment session to cancel any previous in-flight speech
    const sessionId = ++speechSessionRef.current

    // Stop ALL ongoing audio and browser speech immediately
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)

    // Also stop mic so bot voice isn't picked up as input
    if (recognitionRef.current && isListeningRef.current) {
      try { recognitionRef.current.stop() } catch(e) {}
      setIsListening(false)
    }

    // Try AI TTS first for natural voice
    try {
      const lang = language === 'hi-IN' ? 'hi' : 'en'
      const resp = await api.post('/chatbot/tts', { text, language: lang }, { responseType: 'blob' })

      // Check if this session is still current (not superseded)
      if (sessionId !== speechSessionRef.current) {
        if (onComplete) onComplete()
        return
      }

      if (resp.status === 200 && resp.data instanceof Blob && resp.data.size > 0) {
        const url = URL.createObjectURL(resp.data)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onplay = () => setIsSpeaking(true)
        audio.onended = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(url)
          if (audioRef.current === audio) audioRef.current = null
          if (onComplete) onComplete()
        }
        audio.onerror = () => {
          URL.revokeObjectURL(url)
          if (audioRef.current === audio) audioRef.current = null
          // Fallback to browser speech only if session still valid
          speakWithBrowser(text, onComplete, sessionId)
        }
        audio.play()
        return
      }
    } catch (err) {
      // TTS unavailable
    }

    // If session was superseded during await, bail out
    if (sessionId !== speechSessionRef.current) {
      if (onComplete) onComplete()
      return
    }

    // Fallback to browser speech
    speakWithBrowser(text, onComplete, sessionId)
  }

  const stopSpeaking = () => {
    // Bump session to invalidate any in-flight TTS requests
    speechSessionRef.current++
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }



  const handleVoiceInput = async (voiceText) => {
    // Stop mic immediately so bot voice isn't re-captured
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch(e) {}
    }
    setIsListening(false)
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: voiceText }])

    // Send to AI chat
    try {
      setIsProcessing(true)
      const lang = language === 'hi-IN' ? 'hi' : 'en'
      const updatedHistory = [...aiHistory, { role: 'user', content: voiceText }]
      setAiHistory(updatedHistory)

      const response = await api.post('/chatbot/voice-chat', {
        message: voiceText,
        history: updatedHistory.slice(-16),
        language: lang,
      })

      if (response.data.success) {
        const reply = response.data.data.reply
        setMessages(prev => [...prev, { type: 'bot', content: reply }])
        setAiHistory(prev => [...prev, { role: 'assistant', content: reply }])
        api.post('/profile/activity', { type: 'voice_chat', details: { query: voiceText.substring(0, 100) } }).catch(() => {})

        // Voice replies are already speech-friendly, speak directly
        speakMessage(reply, () => {
          // Auto-start listening after bot finishes speaking
          setTimeout(() => startListening(), 800)
        })
      } else {
        const errMsg = language === 'hi-IN'
          ? 'माफ़ करें, कुछ गलत हो गया। कृपया फिर से बोलें।'
          : 'Sorry, something went wrong. Please try again.'
        setMessages(prev => [...prev, { type: 'bot', content: errMsg }])
        speakMessage(errMsg, () => setTimeout(() => startListening(), 800))
      }
    } catch (error) {
      console.error('AI voice error:', error)
      const errMsg = language === 'hi-IN'
        ? 'सर्वर से जुड़ नहीं पाया। कृपया फिर से प्रयास करें।'
        : 'Could not connect to server. Please try again.'
      setMessages(prev => [...prev, { type: 'bot', content: errMsg }])
      speakMessage(errMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetAssistant = () => {
    stopSpeaking()
    stopListening()
    setMessages([])
    setAiHistory([])
    setTranscript('')
    startVoiceAssistant()
  }

  const toggleLanguage = () => {
    const newLang = language === 'hi-IN' ? 'en-US' : 'hi-IN'
    setLanguage(newLang)
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang
    }
    speakMessage(newLang === 'hi-IN' ? 'हिंदी में बदल गया' : 'Changed to English')
  }

  const openVoiceAssistant = () => {
    setIsOpen(true)
    if (messages.length === 0) {
      startVoiceAssistant()
    }
  }

  const closeVoiceAssistant = () => {
    stopSpeaking()
    stopListening()
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={openVoiceAssistant}
        className="fixed bottom-6 right-6 group bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white p-5 rounded-full shadow-2xl hover:shadow-purple-500/40 transform hover:scale-110 transition-all duration-300 z-50"
      >
        <span className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500" />
        <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        {/* Subtle ping indicator */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
      </button>
    )
  }

  // --- Inline / Dashboard mode (autoStart) ---
  if (autoStart) {
    return (
      <div className="w-full max-w-3xl mx-auto animate-fade-in-up">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-6 py-5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Animated status orb */}
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg ${
                    isListening ? 'bg-red-500/90' :
                    isSpeaking ? 'bg-emerald-500/90' :
                    isProcessing ? 'bg-amber-500/90' :
                    'bg-white/15'
                  }`}>
                    {isListening ? '🎤' : isSpeaking ? '🔊' : isProcessing ? '⏳' : '🎙️'}
                  </div>
                  {(isListening || isSpeaking) && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-white animate-ping" />
                  )}
                </div>
                <div>
                  <h2 className="text-white font-display font-bold text-lg tracking-tight">
                    {language === 'hi-IN' ? 'आवाज़ सहायक' : 'Voice Assistant'}
                  </h2>
                  <p className="text-purple-200 text-sm font-medium">
                    {isListening ? (language === 'hi-IN' ? '🎤 सुन रहा हूँ...' : '🎤 Listening...') :
                     isSpeaking ? (language === 'hi-IN' ? '🔊 बोल रहा हूँ...' : '🔊 Speaking...') :
                     isProcessing ? (language === 'hi-IN' ? '💭 सोच रहा हूँ...' : '💭 Thinking...') :
                     (language === 'hi-IN' ? 'AI कानूनी सहायक' : 'AI Legal Assistant')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleLanguage}
                  className="px-3 py-1.5 text-sm font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/10"
                >
                  {language === 'hi-IN' ? '🇮🇳 हिंदी' : '🇬🇧 EN'}
                </button>
                <button
                  onClick={resetAssistant}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/10"
                  title="Reset"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex flex-col" style={{ height: '420px' }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 voice-chat-scroll bg-gradient-to-b from-gray-50/50 to-white">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-60">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-3xl mb-4">🎙️</div>
                  <p className="text-gray-500 text-sm font-medium">
                    {language === 'hi-IN' ? 'आवाज़ सहायक शुरू हो रहा है...' : 'Starting voice assistant...'}
                  </p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} voice-msg-enter`}>
                  {msg.type === 'bot' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2.5 mt-1 shrink-0 shadow-sm">
                      AI
                    </div>
                  )}
                  <div className={`max-w-[75%] px-4 py-3 shadow-sm ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl rounded-br-md'
                      : 'bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-100 shadow-soft'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.progress && (
                      <p className="text-xs mt-2 opacity-70 font-medium">{msg.progress}</p>
                    )}
                  </div>
                  {msg.type === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center text-sm ml-2.5 mt-1 shrink-0">
                      👤
                    </div>
                  )}
                </div>
              ))}

              {isProcessing && (
                <div className="flex justify-start voice-msg-enter">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2.5 mt-1 shrink-0 shadow-sm">
                    AI
                  </div>
                  <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-md shadow-soft border border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Live transcript */}
            {transcript && (
              <div className="px-5 py-3 bg-purple-50/70 border-t border-purple-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <p className="text-xs text-purple-500 font-semibold uppercase tracking-wider">
                    {language === 'hi-IN' ? 'सुन रहा हूँ' : 'Hearing'}
                  </p>
                </div>
                <p className="text-sm text-purple-700 font-medium mt-1">{transcript}</p>
              </div>
            )}

            {/* Controls */}
            <div className="px-5 py-5 border-t border-gray-100 bg-white">
              <div className="flex items-center justify-center gap-6">
                {/* Stop speaking */}
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="p-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 shadow-lg hover:shadow-orange-500/30 hover:scale-105 active:scale-95"
                    title={language === 'hi-IN' ? 'आवाज़ बंद करें' : 'Stop speaking'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  </button>
                )}

                {/* Main mic button */}
                <div className="relative">
                  {/* Ripple rings when listening */}
                  {isListening && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-red-400/30 voice-ripple-1" />
                      <span className="absolute inset-0 rounded-full bg-red-400/20 voice-ripple-2" />
                      <span className="absolute inset-0 rounded-full bg-red-400/10 voice-ripple-3" />
                    </>
                  )}
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing || isSpeaking}
                    className={`relative z-10 p-5 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 mic-glow-active'
                        : 'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 hover:shadow-purple-500/40'
                    }`}
                  >
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isListening ? (
                        <rect x="6" y="6" width="12" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Sound wave visualization when listening */}
              {isListening && (
                <div className="flex items-center justify-center gap-1 mt-4 h-7">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div
                      key={i}
                      className="voice-wave-bar bg-gradient-to-t from-purple-500 to-violet-400"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}

              {/* Status text */}
              <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                {isListening ? (language === 'hi-IN' ? '🎤 बोलिए... मैं सुन रहा हूँ' : '🎤 Speak... I\'m listening') :
                 isSpeaking ? (language === 'hi-IN' ? '🔊 सुनिए...' : '🔊 Listen...') :
                 isProcessing ? (language === 'hi-IN' ? '💭 जवाब तैयार हो रहा है...' : '💭 Preparing response...') :
                 (language === 'hi-IN' ? 'माइक बटन दबाएं और बोलें' : 'Press the mic and speak')}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- Floating modal mode (Home page) ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeVoiceAssistant}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col animate-scale-in overflow-hidden border border-gray-100"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-5 py-4">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-lg ${
                  isListening ? 'bg-red-500/90' :
                  isSpeaking ? 'bg-emerald-500/90' :
                  isProcessing ? 'bg-amber-500/90' :
                  'bg-white/15'
                }`}>
                  {isListening ? '🎤' : isSpeaking ? '🔊' : isProcessing ? '⏳' : '🎙️'}
                </div>
                {(isListening || isSpeaking) && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                )}
              </div>
              <div>
                <h3 className="text-white font-display font-bold text-base">
                  {language === 'hi-IN' ? 'आवाज़ सहायक' : 'Voice Assistant'}
                </h3>
                <p className="text-purple-200 text-xs">
                  {isListening ? (language === 'hi-IN' ? 'सुन रहा हूँ...' : 'Listening...') :
                   isSpeaking ? (language === 'hi-IN' ? 'बोल रहा हूँ...' : 'Speaking...') :
                   isProcessing ? (language === 'hi-IN' ? 'सोच रहा हूँ...' : 'Thinking...') :
                   'AI Legal Assistant'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleLanguage}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
              >
                {language === 'hi-IN' ? '🇮🇳 हि' : '🇬🇧 EN'}
              </button>
              <button
                onClick={resetAssistant}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
                title="Reset"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={closeVoiceAssistant}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 voice-chat-scroll bg-gradient-to-b from-gray-50/50 to-white" style={{ minHeight: '260px', maxHeight: '380px' }}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-6 opacity-60">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl mb-3">🎙️</div>
              <p className="text-gray-500 text-sm font-medium">
                {language === 'hi-IN' ? 'शुरू हो रहा है...' : 'Starting...'}
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} voice-msg-enter`}>
              {msg.type === 'bot' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xs font-bold mr-2 mt-1 shrink-0 shadow-sm">
                  AI
                </div>
              )}
              <div className={`max-w-[78%] px-3.5 py-2.5 shadow-sm ${
                msg.type === 'user'
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl rounded-br-md'
                  : 'bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-100'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.progress && (
                  <p className="text-xs mt-1.5 opacity-70 font-medium">{msg.progress}</p>
                )}
              </div>
              {msg.type === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center text-xs ml-2 mt-1 shrink-0">
                  👤
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start voice-msg-enter">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xs font-bold mr-2 mt-1 shrink-0 shadow-sm">
                AI
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="px-4 py-2.5 bg-purple-50/70 border-t border-purple-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <p className="text-xs text-purple-500 font-semibold uppercase tracking-wider">
                {language === 'hi-IN' ? 'सुन रहा हूँ' : 'Hearing'}
              </p>
            </div>
            <p className="text-sm text-purple-700 font-medium mt-0.5">{transcript}</p>
          </div>
        )}

        {/* Controls */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white rounded-b-3xl">
          <div className="flex items-center justify-center gap-5">
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 shadow-lg hover:shadow-orange-500/30 hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              </button>
            )}

            <div className="relative">
              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-400/30 voice-ripple-1" />
                  <span className="absolute inset-0 rounded-full bg-red-400/20 voice-ripple-2" />
                  <span className="absolute inset-0 rounded-full bg-red-400/10 voice-ripple-3" />
                </>
              )}
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing || isSpeaking}
                className={`relative z-10 p-5 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 mic-glow-active'
                    : 'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 hover:shadow-purple-500/40'
                }`}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isListening ? (
                    <rect x="6" y="6" width="12" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {isListening && (
            <div className="flex items-center justify-center gap-1 mt-3 h-6">
              {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className="voice-wave-bar bg-gradient-to-t from-purple-500 to-violet-400"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-2.5 font-medium">
            {isListening ? (language === 'hi-IN' ? '🎤 बोलिए...' : '🎤 Speak...') :
             isSpeaking ? (language === 'hi-IN' ? '🔊 सुनिए...' : '🔊 Listen...') :
             isProcessing ? (language === 'hi-IN' ? '💭 जवाब तैयार हो रहा है...' : '💭 Preparing...') :
             (language === 'hi-IN' ? 'माइक बटन दबाएं' : 'Press the mic')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default VoiceAssistant
