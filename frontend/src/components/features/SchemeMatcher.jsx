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
      subtitle: 'Match based on income, land size, and category',
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
      note: 'Matches are indicative. Please verify eligibility with local offices.'
    },
    hi: {
      title: 'सरकारी योजना मिलान',
      subtitle: 'आय, जमीन और श्रेणी के आधार पर योजना मिलान',
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
      note: 'ये परिणाम संकेतात्मक हैं। कृपया स्थानीय कार्यालय से पुष्टि करें।'
    }
  }

  const schemeTranslations = {
    pm_kisan: {
      name: 'पीएम-किसान',
      description: 'छोटे और सीमांत किसानों के लिए आय सहायता।',
      eligibility: 'कृषि भूमि का मालिक होना (आम तौर पर छोटे/सीमांत जोत)।',
      reasons: [
        'जमीन का आकार छोटे/सीमांत दायरे में है।',
        'जमीन का आकार छोटे/सीमांत दायरे से ऊपर है।',
        'कृषि भूमि का आकार नहीं दिया गया।'
      ],
      nextSteps: [
        'पीएम-किसान पोर्टल या स्थानीय कृषि कार्यालय से पात्रता जांचें।',
        'भूमि रिकॉर्ड और बैंक विवरण के साथ आवेदन करें।'
      ],
      documents: [
        'भूमि रिकॉर्ड',
        'आधार या अन्य पहचान पत्र',
        'बैंक खाता विवरण'
      ]
    },
    legal_aid: {
      name: 'मुफ्त विधिक सहायता (NALSA/DLSA)',
      description: 'कम आय और पात्र श्रेणियों के लिए मुफ्त कानूनी सहायता।',
      eligibility: 'कम आय या पात्र श्रेणी (राज्य के अनुसार बदल सकता है)।',
      reasons: [
        'श्रेणी की जानकारी दी गई है।',
        'आय की जानकारी नहीं दी गई है।',
        'आय सामान्य सीमा में है।',
        'कुछ राज्यों में आय पात्र हो सकती है।',
        'आय सामान्य सीमा से अधिक है।'
      ],
      nextSteps: [
        'जिला विधिक सेवा प्राधिकरण (DLSA) से संपर्क करें।',
        'NALSA हेल्पलाइन 15100 पर कॉल करें।'
      ],
      documents: [
        'आय प्रमाण पत्र (यदि उपलब्ध)',
        'पहचान पत्र'
      ]
    },
    farmer_insurance: {
      name: 'पीएम फसल बीमा योजना (PMFBY)',
      description: 'प्राकृतिक जोखिमों के खिलाफ फसल बीमा।',
      eligibility: 'कृषि भूमि वाले किसान या अधिसूचित फसलें।',
      reasons: [
        'कृषि भूमि होने से पात्रता संभव है।',
        'कृषि भूमि का आकार नहीं दिया गया।'
      ],
      nextSteps: [
        'अधिसूचित फसल और मौसम की जानकारी कृषि कार्यालय से लें।',
        'बैंक या कृषि विभाग के माध्यम से नामांकन करें।'
      ],
      documents: [
        'भूमि रिकॉर्ड या किरायेदारी प्रमाण',
        'बैंक खाता विवरण'
      ]
    },
    compensation_schemes: {
      name: 'फसल क्षति मुआवजा योजनाएं',
      description: 'प्राकृतिक आपदा या फसल नुकसान पर राज्य/जिला सहायता।',
      eligibility: 'प्राकृतिक आपदा या फसल नुकसान से प्रभावित किसान।',
      reasons: [
        'कृषि भूमि होने से पात्रता संभव है।',
        'कम आय होने पर प्राथमिकता मिल सकती है।',
        'कृषि भूमि का आकार नहीं दिया गया।'
      ],
      nextSteps: [
        'समय सीमा के भीतर नुकसान की सूचना स्थानीय कृषि कार्यालय में दें।',
        'मुआवजा सर्वे के दौरान आवश्यक फॉर्म जमा करें।'
      ],
      documents: [
        'भूमि रिकॉर्ड',
        'नुकसान आकलन रिपोर्ट (यदि हो)',
        'बैंक खाता विवरण'
      ]
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

          {result.matches?.map((match) => (
            <div key={match.id} className="bg-white border border-gray-200 rounded-lg p-4">
              {(() => {
                const translated = schemeTranslations[match.id]
                const name = language === 'hi' && translated?.name ? translated.name : match.name
                const description = language === 'hi' && translated?.description ? translated.description : match.description
                const eligibility = language === 'hi' && translated?.eligibility ? translated.eligibility : match.eligibility
                const reasons = language === 'hi' && translated?.reasons?.length ? translated.reasons : match.reasons
                const nextSteps = language === 'hi' && translated?.nextSteps?.length ? translated.nextSteps : match.nextSteps
                const documents = language === 'hi' && translated?.documents?.length ? translated.documents : match.documents

                return (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{description}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${match.matched ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {match.matched ? t.matched : t.possible}
                      </span>
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
                  </>
                )
              })()}
            </div>
          ))}

          {result.note && (
            <p className="text-xs text-gray-500">{language === 'hi' ? t.note : result.note}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default SchemeMatcher
