import { useState } from 'react'

const CommunityQA = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const questions = [
    {
      id: 1,
      category: 'fir',
      q: 'FIR दर्ज करने के लिए कौन से दस्तावेज़ चाहिए?',
      a: 'FIR दर्ज करने के लिए कोई विशेष दस्तावेज़ की आवश्यकता नहीं है। आप सीधे पुलिस स्टेशन जाकर अपनी शिकायत दर्ज करा सकते हैं। यदि आप लिखित में देना चाहें तो आवेदन पत्र दे सकते हैं।',
      helpful: 245,
      answered: true,
      expert: 'अधिवक्ता राज कुमार'
    },
    {
      id: 2,
      category: 'criminal',
      q: 'गिरफ्तारी के 24 घंटे में क्या होना चाहिए?',
      a: '24 घंटे में पुलिस को मजिस्ट्रेट के पास आपको पेश करना होता है। इस दौरान पुलिस आपसे पूछताछ कर सकती है, लेकिन उस दौरान वकील की उपस्थिति अनिवार्य है।',
      helpful: 189,
      answered: true,
      expert: 'न्यायलय परामर्श दल'
    },
    {
      id: 3,
      category: 'property',
      q: 'झूठे दस्तावेज़ से संपत्ति बेचना कानूनी है?',
      a: 'बिल्कुल नहीं। झूठे दस्तावेज़ से संपत्ति बेचना अपराध है। इस पर 3 साल तक की सजा हो सकती है और जुर्माना भी लगेगा।',
      helpful: 156,
      answered: true,
      expert: 'संपत्ति विशेषज्ञ'
    },
    {
      id: 4,
      category: 'family',
      q: 'बाल विवाह को रोकने के लिए कौन से कानून हैं?',
      a: '18 साल से कम उम्र में विवाह करना कानून के तहत अपराध है। आप इसकी शिकायत बाल विकास विभाग या पुलिस को कर सकते हैं।',
      helpful: 213,
      answered: true,
      expert: 'महिला अधिकार विशेषज्ञ'
    },
    {
      id: 5,
      category: 'labour',
      q: 'न्यूनतम मजदूरी क्या है?',
      a: 'न्यूनतम मजदूरी राज्य के अनुसार अलग-अलग है। आप अपने क्षेत्र की सरकार की वेबसाइट देख सकते हैं। नियोक्ता को कानूनी न्यूनतम मजदूरी देनी होती है।',
      helpful: 124,
      answered: true,
      expert: 'श्रम कानून व्याख्याता'
    },
    {
      id: 6,
      category: 'other',
      q: 'अगर मेरा वकील मेरे पैसे हड़प ले तो क्या करूँ?',
      a: 'वकील के विरुद्ध शिकायत बार काउंसिल को दी जा सकती है। आप अनैतिक व्यवहार की शिकायत दर्ज कर सकते हैं। Legal Saathi आपको सही प्रक्रिया समझाने में मदद करेगा।',
      helpful: 98,
      answered: true,
      expert: 'वकील निरीक्षण दल'
    }
  ]

  const filtered = selectedCategory === 'all' 
    ? questions 
    : questions.filter(q => q.category === selectedCategory)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">समुदाय सवाल-जवाब</h2>
          <p className="text-gray-600 text-sm">हजारों लोगों का सवाल और विशेषज्ञों के जवाब</p>
        </div>
        <span className="text-4xl">💬</span>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'सभी सवाल', emoji: '📋' },
          { value: 'fir', label: 'FIR', emoji: '📝' },
          { value: 'criminal', label: 'आपराधिक', emoji: '⚖️' },
          { value: 'property', label: 'संपत्ति', emoji: '🏠' },
          { value: 'family', label: 'पारिवारिक', emoji: '👨‍👩‍👧‍👦' },
          { value: 'labour', label: 'श्रम', emoji: '💼' },
        ].map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.value
                ? 'bg-saffron-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filtered.map(q => (
          <div key={q.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow group">
            {/* Question */}
            <div className="flex gap-3 mb-3">
              <span className="text-2xl flex-shrink-0">❓</span>
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-saffron-600 transition-colors">
                {q.q}
              </h3>
            </div>

            {/* Answer */}
            {q.answered && (
              <div className="mb-4 pl-11 bg-green-50 border-l-2 border-green-500 p-3 rounded">
                <p className="text-sm text-gray-700 leading-relaxed">{q.a}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  ✓ {q.expert}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-500 transition-colors">
                  👍 {q.helpful}
                </button>
                <button className="text-xs text-saffron-600 hover:text-saffron-700 font-medium">
                  विस्तार देखें
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-gray-900 font-medium mb-3">अपना सवाल पूछना चाहते हैं?</p>
        <p className="text-sm text-gray-700 mb-4">
          हमारे अनुभवी विशेषज्ञ और वकील आपके सवालों का जवाब देते हैं
        </p>
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          सवाल पूछें →
        </button>
      </div>
    </div>
  )
}

export default CommunityQA
