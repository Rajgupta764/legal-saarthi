import { useState } from 'react'
import api from '../../services/api'

const SchemeMatcher = () => {
  const [language, setLanguage] = useState('hi')
  const [income, setIncome] = useState('')
  const [incomePeriod, setIncomePeriod] = useState('year')
  const [landSize, setLandSize] = useState('')
  const [landUnit, setLandUnit] = useState('acre')
  const [category, setCategory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const labels = {
    en: {
      title: 'Government Scheme Matching',
      subtitle: '19 verified government schemes for rural India',
      income: 'Income (INR)',
      incomePeriod: 'Income Period',
      landSize: 'Land Size',
      landUnit: 'Land Unit',
      category: 'Category',
      yearly: 'Yearly',
      monthly: 'Monthly',
      acre: 'Acre',
      hectare: 'Hectare',
      find: 'Find Schemes',
      matching: 'Matching...',
      clear: 'Clear',
      provideInput: 'Please provide at least one input: income, land size, or category',
      noMatches: 'No matches found',
      serverError: 'Server error. Please try again.',
      connectError: 'Cannot connect to server. Please check your internet.',
      genericError: 'Something went wrong. Please try again.',
      assumptions: 'Assumptions:',
      eligibility: 'Eligibility',
      reasons: 'Reasons',
      nextSteps: 'Next Steps',
      documents: 'Documents',
      matched: 'Matched',
      possible: 'Possible',
      note: 'Matches are indicative. Please verify eligibility with local offices.',
      ministry: 'Ministry',
      visitPortal: 'Visit Portal',
    },
    hi: {
      title: 'सरकारी योजना मिलान',
      subtitle: 'ग्रामीण भारत के लिए 19 सत्यापित सरकारी योजनाएं',
      income: 'आय (रुपये)',
      incomePeriod: 'आय अवधि',
      landSize: 'भूमि का आकार',
      landUnit: 'भूमि इकाई',
      category: 'श्रेणी',
      yearly: 'वार्षिक',
      monthly: 'मासिक',
      acre: 'एकड़',
      hectare: 'हेक्टेयर',
      find: 'योजना खोजें',
      matching: 'मिलान हो रहा है...',
      clear: 'साफ करें',
      provideInput: 'कृपया कम से कम एक जानकारी दें: आय, जमीन या श्रेणी',
      noMatches: 'कोई परिणाम नहीं मिला',
      serverError: 'सर्वर त्रुटि। कृपया पुनः प्रयास करें।',
      connectError: 'सर्वर से कनेक्ट नहीं हो पा रहा। कृपया इंटरनेट जांचें।',
      genericError: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
      assumptions: 'मान्यताएं:',
      eligibility: 'पात्रता',
      reasons: 'कारण',
      nextSteps: 'अगले कदम',
      documents: 'दस्तावेज़',
      matched: 'मिला',
      possible: 'संभावित',
      note: 'ये परिणाम संकेतात्मक हैं। कृपया स्थानीय कार्यालय से पुष्टि करें।',
      ministry: 'मंत्रालय',
      visitPortal: 'पोर्टल पर जाएं',
    }
  }

  const t = labels[language]

  const categoryOptions = [
    { value: '', label: language === 'hi' ? 'श्रेणी चुनें' : 'Select category' },
    { value: 'General', label: language === 'hi' ? 'General / सामान्य' : 'General' },
    { value: 'SC', label: language === 'hi' ? 'SC / अनुसूचित जाति' : 'SC' },
    { value: 'ST', label: language === 'hi' ? 'ST / अनुसूचित जनजाति' : 'ST' },
    { value: 'OBC', label: language === 'hi' ? 'OBC / अन्य पिछड़ा वर्ग' : 'OBC' },
    { value: 'Minority', label: language === 'hi' ? 'Minority / अल्पसंख्यक' : 'Minority' },
    { value: 'Woman', label: language === 'hi' ? 'Woman / महिला' : 'Woman' },
    { value: 'Disability', label: language === 'hi' ? 'Disability / दिव्यांग' : 'Disability' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!income && !landSize && !category) {
      setError(t.provideInput)
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const payload = {
        income: income ? Number(income) : undefined,
        incomePeriod,
        landSize: landSize ? Number(landSize) : undefined,
        landUnit,
        category: category || undefined
      }

      const response = await api.post('/match-schemes', payload)
      if (response.data.success) {
        setResult(response.data.data)
        api.post('/profile/activity', { type: 'scheme_check', details: { income, category } }).catch(() => {})
      } else {
        setError(response.data.message || t.noMatches)
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || t.serverError)
      } else if (err.request) {
        setError(t.connectError)
      } else {
        setError(t.genericError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setIncome('')
    setIncomePeriod('year')
    setLandSize('')
    setLandUnit('acre')
    setCategory('')
    setError(null)
    setResult(null)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-saffron-50 text-saffron-600 flex items-center justify-center">
            <span className="text-lg">🌾</span>
          </div>
          <div>
              <h3 className="text-sm font-semibold text-gray-800">{t.title}</h3>
              <p className="text-xs text-gray-500">{t.subtitle}</p>
          </div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded ${language === 'hi' ? 'bg-saffron-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded ${language === 'en' ? 'bg-saffron-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              English
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{t.income}</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="e.g., 120000"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500"
                min="0"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{t.incomePeriod}</label>
              <select
                value={incomePeriod}
                onChange={(e) => setIncomePeriod(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500"
                disabled={isLoading}
              >
                <option value="year">{t.yearly}</option>
                <option value="month">{t.monthly}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{t.landSize}</label>
              <input
                type="number"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value)}
                placeholder="e.g., 1.5"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500"
                min="0"
                step="0.01"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{t.landUnit}</label>
              <select
                value={landUnit}
                onChange={(e) => setLandUnit(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500"
                disabled={isLoading}
              >
                <option value="acre">{t.acre}</option>
                <option value="hectare">{t.hectare}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{t.category}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500"
                disabled={isLoading}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value || 'none'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={isLoading || (!income && !landSize && !category)}
              className={`
                flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2
                ${isLoading || (!income && !landSize && !category)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-saffron-500 text-white hover:bg-saffron-600'}
              `}
            >
              {isLoading ? t.matching : t.find}
            </button>
            {(income || landSize || category || result) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
              >
                {t.clear}
              </button>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          {result.assumptions?.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700">{t.assumptions} {result.assumptions.join(' ')}</p>
            </div>
          )}

          {result.totalSchemes && (
            <p className="text-xs text-gray-500 mb-2">
              {language === 'hi' ? `कुल ${result.totalSchemes} योजनाओं में से मिलान` : `Matched against ${result.totalSchemes} schemes`}
            </p>
          )}

          {result.matches?.map((match) => {
            const name = language === 'hi' && match.name_hi ? match.name_hi : match.name
            const description = language === 'hi' && match.description_hi ? match.description_hi : match.description
            const eligibility = language === 'hi' && match.eligibility_hi ? match.eligibility_hi : match.eligibility
            const reasons = language === 'hi' && match.reasons_hi?.length ? match.reasons_hi : match.reasons
            const nextSteps = language === 'hi' && match.nextSteps_hi?.length ? match.nextSteps_hi : match.nextSteps
            const documents = language === 'hi' && match.documents_hi?.length ? match.documents_hi : match.documents

            return (
              <div key={match.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                    {match.ministry && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{t.ministry}: {match.ministry}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${match.matched ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {match.matched ? t.matched : t.possible}
                    </span>
                    {match.category && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-saffron-50 text-saffron-600 border border-saffron-200">
                        {match.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid md:grid-cols-2 gap-3 text-xs text-gray-600">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">{t.eligibility}</p>
                    <p>{eligibility}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">{t.reasons}</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {reasons?.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-3 grid md:grid-cols-2 gap-3 text-xs text-gray-600">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">{t.nextSteps}</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {nextSteps?.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">{t.documents}</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {documents?.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {match.portalUrl && (
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <a
                      href={match.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-saffron-600 hover:text-saffron-700 font-medium"
                    >
                      🔗 {t.visitPortal} →
                    </a>
                  </div>
                )}
              </div>
            )
          })}

          {result.note && (
            <p className="text-xs text-gray-500">{language === 'hi' ? t.note : result.note}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default SchemeMatcher
