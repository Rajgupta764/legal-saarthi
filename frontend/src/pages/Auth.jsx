import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    setError('')
    setSuccessMessage('')
    setIsLoading(true)
    const result = await loginWithGoogle()
    if (!result.success) {
      setError(result.error)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    if (isLogin) {
      // Login
      const result = await login(email, password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error)
      }
    } else {
      // Signup validation
      if (password !== confirmPassword) {
        setError('पासवर्ड मेल नहीं खाते')
        setIsLoading(false)
        return
      }
      if (password.length < 6) {
        setError('पासवर्ड कम से कम 6 अक्षर का होना चाहिए')
        setIsLoading(false)
        return
      }

      const result = await signup(name, email, phone, password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error)
      }
    }
    
    setIsLoading(false)
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setSuccessMessage('')
    // Clear all form fields when switching modes
    setName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-trust-50 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-saffron-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-trust-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-5">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-saffron-500 to-trust-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-xl">⚖️</span>
            </div>
            <span className="text-xl font-bold gradient-text">Legal Saathi</span>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          {/* Tab Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2 text-sm rounded-md font-semibold transition-all duration-200 ${
                isLogin 
                  ? 'bg-white text-gray-800 shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              लॉगिन
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2 text-sm rounded-md font-semibold transition-all duration-200 ${
                !isLogin 
                  ? 'bg-white text-gray-800 shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              रजिस्टर
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-gray-800 mb-1">
              {isLogin ? 'वापस स्वागत है! 🙏' : 'नया अकाउंट बनाएं'}
            </h1>
            <p className="text-sm text-gray-600">
              {isLogin 
                ? 'अपना अकाउंट एक्सेस करने के लिए लॉगिन करें' 
                : 'मुफ्त कानूनी सहायता पाने के लिए रजिस्टर करें'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-xs flex items-center gap-2">
                <span>❌</span>
                {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-green-600 text-xs flex items-center gap-2">
                <span>✅</span>
                {successMessage}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off" key={isLogin ? 'login' : 'signup'}>
            {/* Name - Only for signup */}
            {!isLogin && (
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-xs font-medium text-gray-700">
                  पूरा नाम
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="अपना नाम लिखें"
                  required={!isLogin}
                  autoComplete="off"
                  className="px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-saffron-500 focus:ring-1 focus:ring-saffron-200 transition-all"
                />
              </div>
            )}

            {/* Email */}
            <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
              <label className="text-xs font-medium text-gray-700">
                ईमेल
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                autoComplete="off"
                className="px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-saffron-500 focus:ring-1 focus:ring-saffron-200 transition-all"
              />
            </div>

            {/* Phone - Only for signup */}
            {!isLogin && (
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-xs font-medium text-gray-700">
                  मोबाइल नंबर
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  required={!isLogin}
                  pattern="[0-9]{10}"
                  autoComplete="off"
                  className="px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-saffron-500 focus:ring-1 focus:ring-saffron-200 transition-all"
                />
              </div>
            )}

            {/* Password */}
            <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
              <label className="text-xs font-medium text-gray-700">
                पासवर्ड
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="off"
                className="px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-saffron-500 focus:ring-1 focus:ring-saffron-200 transition-all"
              />
            </div>

            {/* Confirm Password - Only for signup */}
            {!isLogin && (
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-xs font-medium text-gray-700">
                  पासवर्ड दोबारा
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required={!isLogin}
                  autoComplete="off"
                  className="px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-saffron-500 focus:ring-1 focus:ring-saffron-200 transition-all"
                />
              </div>
            )}

            {/* Forgot Password - Only for login */}
            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-xs text-saffron-600 hover:text-saffron-700 font-medium">
                  पासवर्ड भूल गए?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-2.5 rounded-lg font-semibold text-base mt-4
                flex items-center justify-center gap-2
                transition-all duration-200
                ${isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-saffron-500 to-trust-600 hover:from-saffron-600 hover:to-trust-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }
              `}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>प्रतीक्षा करें...</span>
                </>
              ) : (
                <span>{isLogin ? 'लॉगिन करें' : 'रजिस्टर करें'}</span>
              )}
            </button>
          </form>

          {/* Toggle Link */}
          <p className="text-center mt-4 text-sm text-gray-600">
            {isLogin ? 'नए हैं?' : 'पहले से अकाउंट है?'}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-saffron-600 hover:text-saffron-700 font-semibold"
            >
              {isLogin ? 'रजिस्टर करें' : 'लॉगिन करें'}
            </button>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-xs inline-flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>होम पेज पर वापस जाएं</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Auth
