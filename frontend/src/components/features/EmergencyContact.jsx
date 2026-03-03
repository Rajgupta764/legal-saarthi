const EmergencyContact = () => {
  const emergencyServices = [
    {
      name: 'राष्ट्रीय कानूनी सेवा',
      number: '1800-180-5001',
      time: '8 AM - 5 PM',
      icon: '⚖️',
      description: 'Free legal aid for poor people',
      isUrgent: false
    },
    {
      name: 'महिला हेल्पलाइन',
      number: '181',
      time: '24/7 उपलब्ध',
      icon: '👩‍⚖️',
      description: 'घरेलू हिंसा, सेक्सुअल अपराध',
      isUrgent: true
    },
    {
      name: 'बाल रक्षा हेल्पलाइन',
      number: '1098',
      time: '24/7 उपलब्ध',
      icon: '👶',
      description: 'बाल शोषण, बाल विवाह',
      isUrgent: true
    },
    {
      name: 'श्रम कल्याण विभाग',
      number: 'Local Office',
      time: '9 AM - 6 PM',
      icon: '💼',
      description: 'मजदूरी, काम की सुविधा',
      isUrgent: false
    },
    {
      name: 'दहेज़ विरोधी कोशिश',
      number: '1800-200-0000',
      time: '24/7 उपलब्ध',
      icon: '💐',
      description: 'दहेज़ प्रथा की शिकायत',
      isUrgent: true
    },
    {
      name: 'पर्यावरण हेल्पलाइन',
      number: 'State Pollution Board',
      time: '8 AM - 8 PM',
      icon: '🌱',
      description: 'प्रदूषण, जल समस्याएं',
      isUrgent: false
    }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">आपातकालीन सेवाएं</h2>
          <p className="text-gray-600 text-sm">गंभीर समस्या हो तो तुरंत संपर्क करें</p>
        </div>
        <span className="text-4xl">📞</span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {emergencyServices.map((service, idx) => (
          <div 
            key={idx}
            className={`rounded-lg p-5 border-2 transition-all hover:shadow-lg group ${
              service.isUrgent
                ? 'bg-red-50 border-red-300 hover:border-red-500'
                : 'bg-white border-gray-200 hover:border-saffron-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{service.icon}</span>
              {service.isUrgent && (
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold animate-pulse">
                  जरूरी
                </span>
              )}
            </div>

            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-saffron-600 transition-colors text-sm">
              {service.name}
            </h3>
            
            <p className="text-xs text-gray-600 mb-3">{service.description}</p>

            <div className="bg-white rounded-lg p-3 mb-3 border border-gray-100">
              <p className="text-lg font-bold text-saffron-600 font-mono">{service.number}</p>
              <p className="text-xs text-gray-600 mt-1">{service.time}</p>
            </div>

            <button className="w-full py-2 px-3 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg font-medium text-sm transition-colors">
              फोन करें
            </button>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-gradient-to-r from-saffron-500 to-trust-600 rounded-lg p-6 text-white">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold">₹0</p>
            <p className="text-sm text-white/80">कोई शुल्क नहीं</p>
          </div>
          <div>
            <p className="text-3xl font-bold">24/7</p>
            <p className="text-sm text-white/80">हमेशा उपलब्ध</p>
          </div>
          <div>
            <p className="text-3xl font-bold">100%</p>
            <p className="text-sm text-white/80">गोपनीय</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyContact
