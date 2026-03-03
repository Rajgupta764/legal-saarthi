const LawyerNetwork = () => {
  const lawyers = [
    {
      id: 1,
      name: 'अधिवक्ता राज कुमार',
      specialization: 'Criminal Law',
      rating: 4.8,
      reviews: 156,
      consultationFee: '₹300/30 min',
      availability: 'Available Now',
      languages: ['Hindi', 'English'],
      experience: '15 years',
      image: '👨‍⚖️'
    },
    {
      id: 2,
      name: 'अधिवक्ता प्रिया शर्मा',
      specialization: 'Family & Women Rights',
      rating: 4.9,
      reviews: 243,
      consultationFee: '₹250/30 min',
      availability: 'Available in 2 hours',
      languages: ['Hindi', 'English'],
      experience: '12 years',
      image: '👩‍⚖️'
    },
    {
      id: 3,
      name: 'अधिवक्ता विजय पटेल',
      specialization: 'Property & Real Estate',
      rating: 4.7,
      reviews: 198,
      consultationFee: '₹400/30 min',
      availability: 'Available Tomorrow',
      languages: ['Hindi', 'Gujarati', 'English'],
      experience: '18 years',
      image: '👨‍⚖️'
    },
    {
      id: 4,
      name: 'अधिवक्ता अनीता दास',
      specialization: 'Labour Law',
      rating: 4.6,
      reviews: 127,
      consultationFee: '₹280/30 min',
      availability: 'Available Now',
      languages: ['Hindi', 'Bengali', 'English'],
      experience: '10 years',
      image: '👩‍⚖️'
    }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">अनुभवी वकीलों का नेटवर्क</h2>
          <p className="text-gray-600 text-sm">विशेषज्ञ कानूनी सलाह सीधे वकीलों से लें</p>
        </div>
        <span className="text-4xl">⚖️</span>
      </div>

      {/* Filter & Search */}
      <div className="mb-6 flex gap-3">
        <input 
          type="text"
          placeholder="विशेषज्ञता खोजें..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-saffron-500"
        />
        <select className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-saffron-500">
          <option>सभी विशेषज्ञताएं</option>
          <option>Criminal Law</option>
          <option>Family Law</option>
          <option>Property Law</option>
          <option>Labour Law</option>
        </select>
      </div>

      {/* Lawyers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
        {lawyers.map(lawyer => (
          <div key={lawyer.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <span className="text-5xl">{lawyer.image}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{lawyer.name}</h3>
                <p className="text-sm text-saffron-600 font-medium">{lawyer.specialization}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm font-medium text-gray-900">{lawyer.rating}</span>
                  <span className="text-xs text-gray-600">({lawyer.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Experience & Languages */}
            <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-600">अनुभव</p>
                <p className="font-semibold text-gray-900 text-sm">{lawyer.experience}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">भाषाएं</p>
                <p className="font-semibold text-gray-900 text-sm">{lawyer.languages.join(', ')}</p>
              </div>
            </div>

            {/* Fee & Availability */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">परामर्श शुल्क</span>
                <span className="text-lg font-bold text-saffron-600">{lawyer.consultationFee}</span>
              </div>
              <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                lawyer.availability.includes('Now')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-blue-50 text-blue-700'
              }`}>
                {lawyer.availability}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 bg-saffron-500 text-white rounded-lg font-medium hover:bg-saffron-600 transition-colors">
                कॉल करें
              </button>
              <button className="flex-1 py-2.5 border border-saffron-500 text-saffron-600 rounded-lg font-medium hover:bg-saffron-50 transition-colors">
                प्रोफाइल देखें
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-8 bg-gradient-to-r from-saffron-500 to-trust-600 rounded-lg p-6 text-white text-center">
        <p className="font-semibold mb-2">किसी विशेष वकील को खोज रहे हैं?</p>
        <p className="text-sm text-white/90 mb-4">हमारे 500+ अनुभवी वकीलों में से चुनें</p>
        <button className="px-6 py-2.5 bg-white text-saffron-600 rounded-lg font-medium hover:bg-gray-50 transition-colors">
          सभी वकील देखें
        </button>
      </div>
    </div>
  )
}

export default LawyerNetwork
