import { useState } from 'react'
import api from '../../services/api'

/**
 * ProblemRewrite - "Write with AI" component
 * 
 * Takes user's messy problem description, sends to /api/rewrite-problem,
 * shows AI-improved version, lets user accept it.
 * 
 * Props:
 *   onAccept(text) - called when user clicks "Use AI Version" with the rewritten text
 *   language       - 'hindi' or 'english' for UI labels
 *   disabled       - disable all interactions
 */
const ProblemRewrite = ({ onAccept, language = 'hindi', disabled = false }) => {
  const [inputText, setInputText] = useState('')
  const [rewrittenText, setRewrittenText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const isHindi = language !== 'english'

  const handleWriteWithAI = async () => {
    if (!inputText.trim()) {
      setError(isHindi
        ? 'कृपया पहले अपनी समस्या लिखें'
        : 'Please write your problem first')
      return
    }

    if (inputText.trim().length < 10) {
      setError(isHindi
        ? 'कृपया अपनी समस्या थोड़ा विस्तार से लिखें'
        : 'Please write a few more details about your problem')
      return
    }

    setIsLoading(true)
    setError(null)
    setRewrittenText('')

    try {
      const response = await api.post('/rewrite-problem', {
        problem: inputText.trim()
      })

      if (response.data?.success && response.data?.rewritten) {
        setRewrittenText(response.data.rewritten)
      } else {
        setError(response.data?.message || (isHindi
          ? 'AI से लिखने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'AI writing failed. Please try again.'))
      }
    } catch (err) {
      console.error('Rewrite API error:', err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.request) {
        setError(isHindi
          ? 'सर्वर से कनेक्ट नहीं हो पा रहा। कृपया बैकएंड सर्वर चालू करें।'
          : 'Cannot connect to server. Please check if backend is running.')
      } else {
        setError(isHindi
          ? 'कुछ गड़बड़ हुई। कृपया पुनः प्रयास करें।'
          : 'Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseAIVersion = () => {
    if (rewrittenText && onAccept) {
      onAccept(rewrittenText)
      // Reset state after accepting
      setRewrittenText('')
      setInputText('')
      setIsOpen(false)
      setError(null)
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    setRewrittenText('')
    setError(null)
  }

  // Collapsed state - just show the button
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className={`
          mt-3 px-6 py-3 rounded-xl font-bold text-lg
          flex items-center justify-center gap-3
          transition-all duration-200 w-full sm:w-auto
          ${disabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-700'
          }
        `}
      >
        <span className="text-xl">✨</span>
        <span>{isHindi ? 'AI से लिखें' : 'Write with AI'}</span>
      </button>
    )
  }

  // Expanded state - full AI writing panel
  return (
    <div className="mt-4 rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 flex items-center justify-between">
        <h4 className="text-white font-bold text-lg flex items-center gap-2">
          <span>✨</span>
          <span>{isHindi ? 'AI से लिखें' : 'Write with AI'}</span>
        </h4>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="text-white/80 hover:text-white text-2xl leading-none px-2"
        >
          ✕
        </button>
      </div>

      <div className="p-5">
        {/* Step 1: User input */}
        <div className="mb-4">
          <label className="block text-base font-semibold text-gray-700 mb-2">
            {isHindi
              ? '📝 अपनी समस्या आसान भाषा में लिखें:'
              : '📝 Write your problem in simple words:'}
          </label>
          <p className="text-sm text-indigo-600 mb-3">
            {isHindi
              ? 'जैसे भी लिखना है लिखें - गलत भाषा, हिंग्लिश, टूटे शब्द - AI सब सुधार देगा!'
              : 'Write however you want - broken Hindi, Hinglish, wrong grammar - AI will fix everything!'}
          </p>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            disabled={isLoading}
            placeholder={isHindi
              ? 'उदाहरण: mere padosi ne mujhe maara aur dhamkaya kal raat ko 10 baje...'
              : 'Example: my neighbor hit me and threatened me last night at 10pm...'}
            className="w-full px-4 py-3 text-lg border-2 border-indigo-200 rounded-xl
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                       resize-none placeholder-gray-400
                       disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Write with AI button */}
        <button
          type="button"
          onClick={handleWriteWithAI}
          disabled={isLoading || !inputText.trim() || inputText.trim().length < 10}
          className={`
            w-full px-6 py-4 rounded-xl font-bold text-lg
            flex items-center justify-center gap-3
            transition-all duration-200
            ${isLoading || !inputText.trim() || inputText.trim().length < 10
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
            }
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>{isHindi ? 'AI लिख रहा है...' : 'AI is writing...'}</span>
            </>
          ) : (
            <>
              <span>🤖</span>
              <span>{isHindi ? 'AI से लिखवाएं' : 'Write with AI'}</span>
            </>
          )}
        </button>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 font-medium flex items-center gap-2">
              <span>❌</span>
              <span>{error}</span>
            </p>
          </div>
        )}

        {/* Step 2: AI Result */}
        {rewrittenText && (
          <div className="mt-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-green-600 text-xl">✅</span>
              <h5 className="font-bold text-green-800 text-lg">
                {isHindi ? 'AI का सुझाव:' : 'AI Suggestion:'}
              </h5>
            </div>

            <div className="p-5 bg-white border-2 border-green-300 rounded-xl shadow-inner">
              <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap"
                 style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                {rewrittenText}
              </p>
            </div>

            {/* Use AI Version button */}
            <button
              type="button"
              onClick={handleUseAIVersion}
              className="
                mt-4 w-full px-6 py-4 rounded-xl font-bold text-lg
                flex items-center justify-center gap-3
                bg-gradient-to-r from-green-500 to-emerald-600 text-white
                shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700
                transition-all duration-200
              "
            >
              <span>✅</span>
              <span>{isHindi ? 'AI वाला इस्तेमाल करें' : 'Use AI Version'}</span>
            </button>

            {/* Try again button */}
            <button
              type="button"
              onClick={() => setRewrittenText('')}
              className="
                mt-2 w-full px-6 py-3 rounded-xl font-semibold text-base
                border-2 border-indigo-300 text-indigo-700
                hover:bg-indigo-50 transition-all duration-200
              "
            >
              {isHindi ? '🔄 दोबारा लिखवाएं' : '🔄 Try Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProblemRewrite
