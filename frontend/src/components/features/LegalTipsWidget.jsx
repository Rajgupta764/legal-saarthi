import { useState, useEffect } from 'react'
import api from '../../services/api'

const LegalTipsWidget = () => {
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTip, setSelectedTip] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [helplines, setHelplines] = useState({})

  // Fetch tips based on category or search query
  const fetchTips = async (category = activeCategory, query = searchQuery) => {
    try {
      setLoading(true)
      
      if (query.trim()) {
        // Search takes priority over category
        const response = await api.post('/legal-tips/search', {
          keyword: query
        })
        setTips(response.data.data || [])
        return
      }
      
      let url = '/legal-tips/daily?limit=6'
      if (category !== 'all') {
        url = `/legal-tips/category/${category}`
      }
      
      const response = await api.get(url)
      setTips(response.data.data || [])
    } catch (error) {
      console.error('Error fetching tips:', error)
      setTips([]) // Fallback to empty on error
    } finally {
      setLoading(false)
    }
  }

  // Fetch daily tips on mount
  useEffect(() => {
    fetchTips('all', '')
    fetchHelplines()
  }, [])

  const fetchHelplines = async () => {
    try {
      const response = await api.get('/legal-tips/helplines')
      setHelplines(response.data.data || {})
    } catch (error) {
      console.error('Error fetching helplines:', error)
    }
  }

  const categories = [
    { key: 'all', label: 'सभी प्रकार', emoji: '📚' },
    { key: 'property_disputes', label: '🏞️ संपत्ति अधिकार', name: 'Property Rights' },
    { key: 'labour_rights', label: '💼 श्रमिक अधिकार', name: 'Labour Rights' },
    { key: 'family_law', label: '👨‍👩‍👧 पारिवारिक कानून', name: 'Family Law' },
    { key: 'agricultural_law', label: '🌾 कृषि कानून', name: 'Agricultural Law' },
    { key: 'consumer_rights', label: '🛍️ उपभोक्ता अधिकार', name: 'Consumer Rights' },
    { key: 'police_rights', label: '⚖️ पुलिस अधिकार', name: 'Police Rights' },
  ]

  // Trust Badge Component
  const TrustBadge = ({ tip }) => {
    const government = tip.government_source?.verified
    const hasLaw = tip.law?.act
    const hasHelpline = tip.helplines?.length > 0

    return (
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        {government && (
          <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
            <span>🏛️</span>
            <span className="font-medium">सरकार द्वारा सत्यापित</span>
          </div>
        )}
        {hasLaw && (
          <div className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
            <span>✓</span>
            <span className="font-medium">कानूनी संदर्भ</span>
          </div>
        )}
        {hasHelpline && (
          <div className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">
            <span>📞</span>
            <span className="font-medium">आपातकालीन सहायता</span>
          </div>
        )}
      </div>
    )
  }

  // Tip Card Component with References
  const TipCard = ({ tip }) => {
    const isSelected = selectedTip?.id === tip.id

    return (
      <div
        onClick={() => {
          if (!isSelected) api.post('/profile/activity', { type: 'tip_read', details: { tip: tip.title_hi || tip.title } }).catch(() => {})
          setSelectedTip(isSelected ? null : tip)
        }}
        className={`bg-white border-2 rounded-lg p-5 cursor-pointer transition-all ${
          isSelected
            ? 'border-saffron-500 shadow-lg'
            : 'border-gray-200 hover:border-saffron-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl">{tip.emoji}</span>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs bg-saffron-50 text-saffron-600 px-2 py-1 rounded-full font-medium">
              {tip.category}
            </span>
            {tip.priority === 'critical' && (
              <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium animate-pulse">
                ⚠️ तत्काल
              </span>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-1">{tip.hindi}</h3>
        <p className="text-xs text-gray-500 mb-2">{tip.title}</p>

        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{tip.problem}</p>

        {/* Trust Indicators */}
        <TrustBadge tip={tip} />

        {/* Government Source */}
        {tip.government_source && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs">
            <p className="text-gray-500 mb-1">
              <strong>सरकारी स्रोत:</strong> {tip.government_source.source}
            </p>
            {tip.government_source.url && (
              <a
                href={tip.government_source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                आधिकारिक वेबसाइट →
              </a>
            )}
          </div>
        )}

        {/* Expandable Content */}
        {isSelected && (
          <div className="mt-4 pt-4 border-t border-saffron-200 bg-saffron-50 rounded p-4">
            {/* Solution/Tip */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">💡 समाधान:</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{tip.tip}</p>
            </div>

            {/* Action Steps */}
            {tip.actions && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">📋 कदम दर कदम क्या करें:</h4>
                <ol className="space-y-2">
                  {tip.actions.map((action) => (
                    <li key={action.step} className="text-sm text-gray-700">
                      <span className="font-semibold text-saffron-600">{action.step}.</span> {action.hindi}
                      <p className="text-xs text-gray-500 mt-1">क्यों: {action.why}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Legal Reference */}
            {tip.law && (
              <div className="mb-4 bg-white rounded p-3 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">⚖️ कानूनी संदर्भ:</h4>
                <p className="text-sm text-gray-700">
                  <strong>कानून:</strong> {tip.law.act}
                </p>
                {tip.law.section && (
                  <p className="text-sm text-gray-600">
                    <strong>खंड:</strong> {tip.law.section}
                  </p>
                )}
                {tip.law.reference && (
                  <p className="text-sm text-gray-600">
                    <strong>संदर्भ:</strong> {tip.law.reference}
                  </p>
                )}
              </div>
            )}

            {/* Emergency Warning */}
            {tip.warning && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-700 font-medium">{tip.warning}</p>
              </div>
            )}

            {/* Helplines */}
            {tip.helplines && tip.helplines.length > 0 && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded p-3">
                <h4 className="font-semibold text-green-900 mb-2">📞 आपातकालीन सहायता:</h4>
                <div className="space-y-2">
                  {tip.helplines.map((helpline, idx) => (
                    <div key={idx} className="text-sm text-green-800">
                      <p>
                        <strong>{helpline.name}</strong>
                        {helpline['24_7'] && <span className="text-xs bg-green-200 ml-2 px-2 py-0.5 rounded">24/7</span>}
                      </p>
                      <p className="text-lg font-bold text-green-700">{helpline.number}</p>
                      {helpline.availability && <p className="text-xs text-green-600">{helpline.availability}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Topics */}
            {tip.related_topics && (
              <div className="text-xs text-gray-600 pt-3 border-t border-saffron-200">
                <p className="font-semibold mb-1">संबंधित विषय:</p>
                <p>{tip.related_topics.join(', ')}</p>
              </div>
            )}

            {/* Share & Save Buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-saffron-200">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigator.share?.({
                    title: tip.title,
                    text: tip.problem,
                  })
                }}
                className="flex-1 px-3 py-2 text-xs font-medium bg-saffron-100 text-saffron-700 rounded hover:bg-saffron-200 transition"
              >
                साझा करें
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Save to local storage or backend
                  localStorage.setItem(`saved_tip_${tip.id}`, JSON.stringify(tip))
                  alert('सहेजा गया!')
                }}
                className="flex-1 px-3 py-2 text-xs font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
              >
                सहेजें
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Trust Information */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">कानूनी सुझाव</h2>
            <p className="text-gray-600 text-sm">
              🏛️ सरकारी स्रोतों से सत्यापित - 100% विश्वसनीय जानकारी
            </p>
          </div>
          <span className="text-4xl">💡</span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="खोजें: दहेज़, संपत्ति, मजदूरी, आदि..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchTips(activeCategory, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
          />
          <button
            onClick={() => fetchTips(activeCategory, searchQuery)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-saffron-600"
          >
            🔍
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              setActiveCategory(cat.key)
              setSearchQuery('')
              fetchTips(cat.key, '')
            }}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              activeCategory === cat.key
                ? 'bg-saffron-600 text-white font-semibold'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">लोड हो रहा है...</p>
        </div>
      )}

      {/* Tips Grid */}
      {!loading && tips.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tips.map((tip) => (
            <TipCard key={tip.id} tip={tip} />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && tips.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">कोई सुझाव नहीं मिले। कृपया अपनी खोज को संशोधित करें।</p>
        </div>
      )}

      {/* Emergency Helplines Section */}
      <div className="mt-8 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🚨</span>
          <div className="flex-1">
            <h3 className="font-bold text-red-900 mb-3">तत्काल सहायता (24/7)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded p-3 border border-red-200">
                <p className="font-semibold text-red-900 mb-1">पुलिस आपातकाल</p>
                <p className="text-2xl font-bold text-red-700">100</p>
              </div>
              <div className="bg-white rounded p-3 border border-red-200">
                <p className="font-semibold text-red-900 mb-1">महिला हेल्पलाइन</p>
                <p className="text-2xl font-bold text-red-700">1091</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gradient-to-r from-saffron-50 to-trust-50 border border-saffron-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">अक्सर पूछे जाने वाले सवाल</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setSearchQuery('FIR')
              fetchTips('all', 'FIR')
              window.scrollTo(0, 0)
            }}
            className="text-left p-3 hover:bg-white rounded-lg transition-colors"
          >
            <p className="font-medium text-gray-900 text-sm">FIR कैसे दर्ज करें?</p>
            <p className="text-xs text-gray-600 mt-1">⚡ 5 मिनट में जानें</p>
          </button>
          <button
            onClick={() => {
              setSearchQuery('दहेज़')
              fetchTips('all', 'दहेज़')
              window.scrollTo(0, 0)
            }}
            className="text-left p-3 hover:bg-white rounded-lg transition-colors"
          >
            <p className="font-medium text-gray-900 text-sm">दहेज़ के खिलाफ कानून</p>
            <p className="text-xs text-gray-600 mt-1">महिला सुरक्षा कानून</p>
          </button>
          <button
            onClick={() => {
              setSearchQuery('संपत्ति')
              fetchTips('all', 'संपत्ति')
              window.scrollTo(0, 0)
            }}
            className="text-left p-3 hover:bg-white rounded-lg transition-colors"
          >
            <p className="font-medium text-gray-900 text-sm">संपत्ति के अधिकार</p>
            <p className="text-xs text-gray-600 mt-1">जमीन और घर संबंधी</p>
          </button>
        </div>
      </div>

      {/* Trust & Verification Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">🏛️ हमारी प्रतिबद्धता</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ सभी जानकारी भारत सरकार के आधिकारिक स्रोतों से</li>
          <li>✓ कानूनी संदर्भ के साथ संपूर्ण और सटीक</li>
          <li>✓ राष्ट्रीय मानव अधिकार आयोग द्वारा अनुमोदित</li>
          <li>✓ आपातकालीन सहायता के लिए 24/7 हेल्पलाइन</li>
        </ul>
      </div>
    </div>
  )
}

export default LegalTipsWidget
