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
  const [conversation, setConversation] = useState([])
  const [conversationData, setConversationData] = useState({})
  const [currentStep, setCurrentStep] = useState('initial')
  
  const recognitionRef = useRef(null)
  const synthesisRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = language

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
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'no-speech') {
          speakMessage('कुछ सुनाई नहीं दिया। कृपया फिर से बोलें।')
        } else if (event.error === 'network') {
          speakMessage('इंटरनेट की समस्या है। कृपया जांचें।')
        }
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
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
      const response = await api.get('/chatbot/start')
      if (response.data.success) {
        const initialMsg = response.data.data.message
        const botMessage = {
          type: 'bot',
          content: initialMsg,
          options: response.data.data.options
        }
        setMessages([botMessage])
        speakMessage(initialMsg + ' बोलकर बताएं।')
        setCurrentStep('category_selection')
      }
    } catch (error) {
      console.error('Error starting voice assistant:', error)
      speakMessage('त्रुटि उत्पन्न हुई। कृपया पुनः प्रयास करें।')
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setIsListening(true)
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Error starting recognition:', error)
        setIsListening(false)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      setIsSpeaking(true)
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleVoiceInput = async (voiceText) => {
    setIsListening(false)
    
    // Add user message
    const userMessage = {
      type: 'user',
      content: voiceText
    }
    setMessages(prev => [...prev, userMessage])

    // Create conversation entry
    const conversationEntry = {
      type: 'user_input',
      content: voiceText
    }
    
    const updatedConversation = [...conversation, conversationEntry]
    setConversation(updatedConversation)

    // Process input
    await processVoiceInput(voiceText, updatedConversation)
  }

  const processVoiceInput = async (input, conversationHistory) => {
    try {
      setIsProcessing(true)

      // Check if input matches a category
      const categoryMap = {
        'पुलिस': 'police_harassment',
        'पुलिस परेशानी': 'police_harassment',
        'जमीन': 'property_dispute',
        'संपत्ति': 'property_dispute',
        'परिवार': 'family_matter',
        'नौकरी': 'labor_issue',
        'मजदूरी': 'labor_issue',
        'उपभोक्ता': 'consumer_complaint',
        'शिकायत': 'consumer_complaint',
        'कुछ और': 'others',
        'अन्य': 'others'
      }

      let userInput = input.toLowerCase()
      let matched = null

      // Try to match category from voice input
      for (const [key, value] of Object.entries(categoryMap)) {
        if (userInput.includes(key.toLowerCase())) {
          matched = value
          break
        }
      }

      // If category matched and it's first selection
      if (matched && currentStep === 'category_selection') {
        const conversationEntry = {
          type: 'user_selection',
          selected_option: matched,
          content: input
        }
        const updatedHistory = [conversationEntry]
        setConversation(updatedHistory)
        
        const response = await api.post('/chatbot/message', {
          user_input: matched,
          conversation_history: updatedHistory
        })

        if (response.data.success) {
          handleBotResponse(response.data.data)
        }
      } else {
        // Regular text input processing
        const response = await api.post('/chatbot/message', {
          user_input: input,
          conversation_history: conversationHistory
        })

        if (response.data.success) {
          handleBotResponse(response.data.data)
        }
      }
    } catch (error) {
      console.error('Error processing voice input:', error)
      const errorMsg = {
        type: 'bot',
        content: error.response?.data?.error || 'त्रुटि उत्पन्न हुई। कृपया पुनः प्रयास करें।'
      }
      setMessages(prev => [...prev, errorMsg])
      speakMessage(errorMsg.content)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBotResponse = (data) => {
    // Update conversation data
    if (data.category) {
      setConversationData(prev => ({ ...prev, category: data.category }))
    }

    // Create bot message
    let botContent = data.message
    
    // Add options if available
    if (data.options) {
      botContent += '\n\nविकल्प:\n' + data.options.map((opt, idx) => `${idx + 1}. ${opt.label}`).join('\n')
    }

    const botMessage = {
      type: 'bot',
      content: botContent,
      question: data.question,
      options: data.options,
      progress: data.progress,
      completed: data.completed,
      action: data.action,
      conversationData: data.data
    }

    setMessages(prev => [...prev, botMessage])
    
    // Speak the response
    let spokenText = data.message
    if (data.question && data.question.placeholder) {
      spokenText += ` उदाहरण: ${data.question.placeholder}`
    }
    speakMessage(spokenText)

    // Update conversation history
    const botEntry = {
      type: 'bot_response',
      content: data.message,
      question: data.question
    }
    setConversation(prev => [...prev, botEntry])

    // Check if conversation complete
    if (data.completed) {
      setCurrentStep('document_generation')
      setTimeout(() => {
        speakMessage('आपकी जानकारी पूरी हो गई है। अब दस्तावेज़ तैयार करेंगे।')
        handleGenerateDocument(data.data, data.action)
      }, 2000)
    } else if (data.question) {
      setCurrentStep('information_collection')
    }
  }

  const handleGenerateDocument = async (conversationData, documentType) => {
    try {
      const response = await api.post('/chatbot/generate-document', {
        conversation_data: conversationData,
        document_type: documentType
      })

      if (response.data.success) {
        const generatedData = response.data.data
        
        if (onDocumentGenerated) {
          onDocumentGenerated(generatedData)
        }

        const successMsg = {
          type: 'bot',
          content: `✅ ${documentType.toUpperCase()} सफलतापूर्वक तैयार हो गया है!`
        }
        setMessages(prev => [...prev, successMsg])
        speakMessage('आपका दस्तावेज़ तैयार हो गया है।')
        setCurrentStep('complete')
      }
    } catch (error) {
      console.error('Error generating document:', error)
      const errorMsg = {
        type: 'bot',
        content: 'दस्तावेज़ तैयार करने में त्रुटि। कृपया पुनः प्रयास करें।'
      }
      setMessages(prev => [...prev, errorMsg])
      speakMessage(errorMsg.content)
    }
  }

  const resetAssistant = () => {
    stopSpeaking()
    stopListening()
    setMessages([])
    setConversation([])
    setConversationData({})
    setCurrentStep('initial')
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
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-50 animate-pulse"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-purple-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-white'}`} />
          <div>
            <h3 className="font-semibold">🎙️ आवाज़ सहायक</h3>
            <p className="text-xs text-blue-100">Voice Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors text-xs"
            title="Change Language"
          >
            {language === 'hi-IN' ? '🇮🇳 हि' : '🇬🇧 EN'}
          </button>
          <button
            onClick={resetAssistant}
            className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
            title="Reset"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={closeVoiceAssistant}
            className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-50 to-purple-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs px-4 py-3 rounded-2xl shadow-md ${
                msg.type === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none border border-purple-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              
              {msg.progress && (
                <p className="text-xs mt-2 opacity-75 font-medium">{msg.progress}</p>
              )}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl shadow-md border border-purple-200">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="px-4 py-2 bg-blue-50 border-t border-purple-200">
          <p className="text-xs text-gray-600">आप बोल रहे हैं:</p>
          <p className="text-sm text-purple-700 font-medium">{transcript}</p>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 border-t border-purple-200 bg-white rounded-b-2xl">
        <div className="flex items-center justify-center gap-4">
          {/* Microphone Button */}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || isSpeaking}
            className={`p-6 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-2xl'
            }`}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isListening ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              )}
            </svg>
          </button>

          {/* Stop Speaking Button */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-4 rounded-full bg-orange-500 hover:bg-orange-600 transition-all shadow-lg"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-3">
          {isListening ? '🎤 सुन रहा हूँ...' : isSpeaking ? '🔊 बोल रहा हूँ...' : 'माइक बटन दबाकर बोलें'}
        </p>
      </div>
    </div>
  )
}

export default VoiceAssistant
