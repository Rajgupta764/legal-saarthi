const LegalTipsWidget = () => {
  const dailyTips = [
    {
      emoji: '⚠️',
      hindi: 'FIR की महत्ता',
      title: 'Know Your FIR Rights',
      description: 'आप बिना पैसे दिए पुलिस स्टेशन में FIR दर्ज करा सकते हैं। यह आपका मौलिक कानूनी अधिकार है।',
      category: 'Criminal Law'
    },
    {
      emoji: '💼',
      hindi: 'मजदूरी का अधिकार',
      title: 'Labour Rights',
      description: 'न्यूनतम मजदूरी, काम के घंटे, और छुट्टी के दिन - ये सब कानून द्वारा सुरक्षित हैं।',
      category: 'Labour Law'
    },
    {
      emoji: '🏠',
      hindi: 'संपत्ति के अधिकार',
      title: 'Property Rights',
      description: 'आपकी भूमि का दस्तावेज़ सुरक्षित रखें। बिना सही कानूनी कागज़ के संपत्ति न बेचें।',
      category: 'Property Law'
    },
    {
      emoji: '👨‍👩‍👧‍👦',
      hindi: 'परिवार कानून',
      title: 'Family Law',
      description: 'महिलाओं को दहेज़, बाल विवाह, और घरेलू हिंसा से सुरक्षा दी जाती है।',
      category: 'Family Law'
    },
    {
      emoji: '📋',
      hindi: 'अनुबंध की जानकारी',
      title: 'Contract Know-How',
      description: 'कोई भी समझौता लिखित होना चाहिए। मुँह की बातों पर कानून में विश्वास नहीं होता।',
      category: 'Contract Law'
    },
    {
      emoji: '⚖️',
      hindi: 'बेल का अधिकार',
      title: 'Bail Rights',
      description: 'गिरफ्तारी के 24 घंटे में पुलिस को बेल देनी है। यह आपका कानूनी अधिकार है।',
      category: 'Criminal Law'
    }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">कानूनी सुझाव</h2>
          <p className="text-gray-600 text-sm">प्रतिदिन नए कानूनी सुझाव सीखें</p>
        </div>
        <span className="text-4xl">💡</span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dailyTips.map((tip, idx) => (
          <div 
            key={idx}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-saffron-300 transition-all group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{tip.emoji}</span>
              <span className="text-xs bg-saffron-50 text-saffron-600 px-2 py-1 rounded-full font-medium">
                {tip.category}
              </span>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-saffron-600 transition-colors">
              {tip.hindi}
            </h3>
            <p className="text-xs text-gray-500 mb-2">{tip.title}</p>
            
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              {tip.description}
            </p>
            
            <button className="text-xs text-saffron-600 font-medium hover:text-saffron-700 flex items-center gap-1">
              विस्तार से पढ़ें →
            </button>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-saffron-50 to-trust-50 border border-saffron-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">अक्सर पूछे जाने वाले सवाल</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="text-left p-3 hover:bg-white rounded-lg transition-colors">
            <p className="font-medium text-gray-900 text-sm">FIR कैसे दर्ज करें?</p>
            <p className="text-xs text-gray-600 mt-1">5 मिनट में शीखें</p>
          </button>
          <button className="text-left p-3 hover:bg-white rounded-lg transition-colors">
            <p className="font-medium text-gray-900 text-sm">अपने अधिकार जानें</p>
            <p className="text-xs text-gray-600 mt-1">गिरफ्तारी से संबंधित</p>
          </button>
          <button className="text-left p-3 hover:bg-white rounded-lg transition-colors">
            <p className="font-medium text-gray-900 text-sm">दस्तावेज़ प्रमाणित करें</p>
            <p className="text-xs text-gray-600 mt-1">कानूनी तरीके से</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LegalTipsWidget
