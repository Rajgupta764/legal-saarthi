import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'

const Chatbot = ({ onDocumentGenerated = null, autoStart = false }) => {
  const [isOpen, setIsOpen] = useState(autoStart)
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState([])
  const [currentStep, setCurrentStep] = useState('initial')
  const [conversationData, setConversationData] = useState({})
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize chatbot
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startChatbot()
    }
  }, [isOpen])

  const startChatbot = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/chatbot/start')
      
      if (response.data.success) {
        const botMessage = {
          type: 'bot',
          content: response.data.data.message,
          options: response.data.data.options
        }
        setMessages([botMessage])
        setConversation([botMessage])
        setCurrentStep('category_selection')
      }
    } catch (error) {
      console.error('Error starting chatbot:', error)
      const errorMessage = {
        type: 'bot',
        content: 'चैटबॉट शुरू करने में त्रुटि। कृपया पुनः प्रयास करें।'
      }
      setMessages([errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptionSelect = async (option) => {
    // Add user selection to UI
    const userMessage = {
      type: 'user',
      content: option.label,
      value: option.value
    }
    
    setMessages([...messages, userMessage])
    
    // Create proper format for backend conversation history
    const conversationEntry = {
      type: 'user_selection',
      selected_option: option.value,
      content: option.label
    }
    
    const updatedConversation = [...conversation, conversationEntry]
    setConversation(updatedConversation)

    // Process the selection
    await processUserInput(option.value, updatedConversation)
  }

  const handleTextInput = async (e) => {
    e.preventDefault()
    if (!userInput.trim()) return

    // Add user message to UI
    const userMessage = {
      type: 'user',
      content: userInput.trim()
    }
    
    setMessages([...messages, userMessage])
    
    // Create proper format for backend conversation history
    const conversationEntry = {
      type: 'user_input',
      content: userInput.trim()
    }
    
    const updatedConversation = [...conversation, conversationEntry]
    setConversation(updatedConversation)
    setUserInput('')

    // Process the input
    await processUserInput(userInput.trim(), updatedConversation)
  }

  const processUserInput = async (input, conversationHistory) => {
    try {
      setIsLoading(true)
      
      const payload = {
        user_input: input,
        conversation_history: conversationHistory
      }
      console.log('Sending chatbot message payload:', JSON.stringify(payload, null, 2))
      
      const response = await api.post('/chatbot/message', payload)

      if (response.data.success) {
        const data = response.data.data
        
        // Update conversation data
        if (data.category) {
          setConversationData(prev => ({ ...prev, category: data.category }))
        }

        // Add bot response (user message already added in the handler)
        const botMessage = {
          type: 'bot',
          content: data.message,
          question: data.question,
          options: data.options,
          progress: data.progress,
          completed: data.completed,
          action: data.action,
          conversationData: data.data
        }

        setMessages(prev => [...prev, botMessage])
        
        // Add bot response to conversation history
        const botEntry = {
          type: 'bot_response',
          content: data.message,
          question: data.question
        }
        setConversation(prev => [...prev, botEntry])

        // If conversation is complete, show action suggestion
        if (data.completed) {
          setCurrentStep('document_generation')
          getSuggestion(data.data)
        } else if (data.question) {
          setCurrentStep('information_collection')
        }
      }
    } catch (error) {
      console.error('Error processing input:', error)
      const errorMsg = {
        type: 'bot',
        content: error.response?.data?.error || 'त्रुटि उत्पन्न हुई। कृपया पुनः प्रयास करें।'
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const getSuggestion = async (conversationData) => {
    try {
      const response = await api.post('/chatbot/get-suggestion', {
        conversation_data: conversationData
      })

      if (response.data.success) {
        const suggestion = response.data.data
        const suggestionMsg = {
          type: 'bot',
          content: `${suggestion.title}\n\n${suggestion.description}`,
          action: suggestion.action,
          button: suggestion.button,
          hidden: true
        }
        setMessages(prev => [...prev, suggestionMsg])
      }
    } catch (error) {
      console.error('Error getting suggestion:', error)
    }
  }

  const handleGenerateDocument = async (conversationData, documentType) => {
    try {
      setIsLoading(true)
      
      const response = await api.post('/chatbot/generate-document', {
        conversation_data: conversationData,
        document_type: documentType
      })

      if (response.data.success) {
        const generatedData = response.data.data
        
        // Call the callback if provided
        if (onDocumentGenerated) {
          onDocumentGenerated(generatedData)
        }

        // Show success message
        const successMsg = {
          type: 'bot',
          content: `✅ ${documentType.toUpperCase()} सफलतापूर्वक तैयार किया जा रहा है!`,
          successData: generatedData
        }
        setMessages(prev => [...prev, successMsg])
        setCurrentStep('complete')
      }
    } catch (error) {
      console.error('Error generating document:', error)
      const errorMsg = {
        type: 'bot',
        content: 'दस्तावेज़ तैयार करने में त्रुटि। कृपया पुनः प्रयास करें।'
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const resetChatbot = () => {
    setMessages([])
    setConversation([])
    setConversationData({})
    setCurrentStep('initial')
    setUserInput('')
    startChatbot()
  }

  const closeChatbot = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Chatbot Button */}
      {!isOpen && !autoStart && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-saffron-500 text-white rounded-full shadow-lg hover:bg-saffron-600 flex items-center justify-center z-40 transition-all hover:scale-110"
          title="चैटबॉट खोलें"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chatbot Dialog */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-h-[32rem] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="bg-saffron-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-saffron-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18.535 15.177A6 6 0 004.823 4.823a6 6 0 0113.712 10.354z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">कानूनी साथी</h3>
                <p className="text-xs text-saffron-100">24/7 सहायता</p>
              </div>
            </div>
            <button
              onClick={closeChatbot}
              className="text-white hover:bg-saffron-600 p-1 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-saffron-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  
                  {/* Options */}
                  {msg.options && msg.type === 'bot' && (
                    <div className="mt-3 space-y-2">
                      {msg.options.map((option, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => handleOptionSelect(option)}
                          disabled={isLoading}
                          className="w-full text-left px-3 py-2 bg-white border border-gray-300 rounded hover:bg-saffron-50 hover:border-saffron-500 text-sm text-gray-700 transition-colors disabled:opacity-50"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Progress */}
                  {msg.progress && (
                    <p className="text-xs mt-2 opacity-75">{msg.progress}</p>
                  )}

                  {/* Action Button */}
                  {msg.action && msg.type === 'bot' && (
                    <button
                      onClick={() => handleGenerateDocument(msg.conversationData, msg.action)}
                      disabled={isLoading}
                      className="w-full mt-3 px-3 py-2 bg-saffron-600 text-white rounded hover:bg-saffron-700 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {msg.button || 'ड्राफ्ट बनाएं'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg rounded-bl-none px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {currentStep === 'information_collection' && (
            <form onSubmit={handleTextInput} className="border-t border-gray-200 p-3 flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="उत्तर दें..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-saffron-500 disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-saffron-500 text-white rounded-lg hover:bg-saffron-600 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.488 5.951 1.488a1 1 0 001.169-1.409l-7-14z" />
                </svg>
              </button>
            </form>
          )}

          {/* Reset Button */}
          {currentStep === 'complete' && (
            <div className="border-t border-gray-200 p-3">
              <button
                onClick={resetChatbot}
                className="w-full px-4 py-2 bg-saffron-500 text-white rounded-lg hover:bg-saffron-600 transition-colors text-sm font-medium"
              >
                नया प्रश्न पूछें
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default Chatbot
