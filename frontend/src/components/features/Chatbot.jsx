import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'

const Chatbot = ({ onDocumentGenerated = null, autoStart = false }) => {
  const [isOpen, setIsOpen] = useState(autoStart)
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiHistory, setAiHistory] = useState([])
  const [language, setLanguage] = useState('hi')
  const [aiAvailable, setAiAvailable] = useState(false)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize AI chat when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initAIChat()
    }
  }, [isOpen])

  const initAIChat = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/chatbot/ai-chat/welcome?lang=${language}`)
      if (response.data.success) {
        setAiAvailable(response.data.data.ai_available)
        const welcome = {
          type: 'bot',
          content: response.data.data.message,
        }
        setMessages([welcome])
      }
    } catch (error) {
      console.error('Error initializing AI chat:', error)
      setMessages([{
        type: 'bot',
        content: language === 'hi'
          ? '🙏 नमस्ते! मैं कानूनी साथी हूँ। अपनी कानूनी समस्या बताइए।'
          : '🙏 Hello! I am Legal Saathi. Please describe your legal problem.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    const text = userInput.trim()
    if (!text || isLoading) return

    // Add user message to UI
    const userMsg = { type: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setUserInput('')

    // Update history for context
    const updatedHistory = [...aiHistory, { role: 'user', content: text }]
    setAiHistory(updatedHistory)

    try {
      setIsLoading(true)
      const response = await api.post('/chatbot/ai-chat', {
        message: text,
        history: updatedHistory.slice(-20),
        language,
      })

      if (response.data.success) {
        const reply = response.data.data.reply
        setMessages(prev => [...prev, { type: 'bot', content: reply }])
        setAiHistory(prev => [...prev, { role: 'assistant', content: reply }])
        api.post('/profile/activity', { type: 'chat', details: { query: userInput.substring(0, 100) } }).catch(() => {})
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: response.data.error || (language === 'hi' ? 'त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'An error occurred. Please try again.'),
          isError: true,
        }])
      }
    } catch (error) {
      console.error('AI chat error:', error)
      const errMsg = error.response?.data?.error || (language === 'hi'
        ? 'सर्वर से जुड़ नहीं पाया। कृपया पुनः प्रयास करें।'
        : 'Could not connect to server. Please try again.')
      setMessages(prev => [...prev, { type: 'bot', content: errMsg, isError: true }])
    } finally {
      setIsLoading(false)
    }
  }

  const resetChat = () => {
    setMessages([])
    setAiHistory([])
    initAIChat()
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'hi' ? 'en' : 'hi')
  }

  return (
    <>
      {/* Floating Chatbot Button */}
      {!isOpen && !autoStart && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-saffron-500 text-white rounded-full shadow-lg hover:bg-saffron-600 flex items-center justify-center z-40 transition-all hover:scale-110"
          title="AI कानूनी साथी"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat Dialog */}
      {isOpen && (
        <div className={`${autoStart ? 'relative w-full max-w-2xl mx-auto' : 'fixed bottom-6 right-6 w-96'} max-h-[36rem] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50`}>
          {/* Header */}
          <div className="bg-saffron-500 text-white p-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm">
                ⚖️
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  {language === 'hi' ? 'AI कानूनी साथी' : 'AI Legal Saathi'}
                </h3>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${aiAvailable ? 'bg-green-300' : 'bg-yellow-300'}`}></span>
                  <p className="text-[10px] text-saffron-100">
                    {aiAvailable ? 'GPT-Powered' : 'Connecting...'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleLanguage}
                className="text-[10px] px-2 py-1 bg-saffron-600 rounded hover:bg-saffron-700 transition-colors"
              >
                {language === 'hi' ? 'EN' : 'हि'}
              </button>
              <button
                onClick={resetChat}
                className="p-1 hover:bg-saffron-600 rounded transition-colors"
                title={language === 'hi' ? 'नई बातचीत' : 'New chat'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              {!autoStart && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-saffron-600 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                    msg.type === 'user'
                      ? 'bg-saffron-500 text-white rounded-br-none'
                      : msg.isError
                        ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(msg.content)
                    }}
                  />
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg rounded-bl-none px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-saffron-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-saffron-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2 h-2 bg-saffron-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area — always visible */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={language === 'hi' ? 'अपनी समस्या बताइए...' : 'Describe your problem...'}
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-saffron-500 disabled:bg-gray-50"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="px-3 py-2 bg-saffron-500 text-white rounded-lg hover:bg-saffron-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}

/**
 * Format markdown-like text for display.
 * Handles **bold**, bullet points, numbered lists, and line breaks.
 */
function formatMessage(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export default Chatbot
