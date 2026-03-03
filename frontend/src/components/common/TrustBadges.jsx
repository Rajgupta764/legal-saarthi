const TrustBadges = () => {
  const badges = [
    {
      icon: '🔒',
      title: 'Secure & Private',
      titleHi: 'सुरक्षित और निजी',
      description: 'End-to-end encryption'
    },
    {
      icon: '✓',
      title: 'Verified Information',
      titleHi: 'सत्यापित जानकारी',
      description: 'Based on Indian law'
    },
    {
      icon: '💯',
      title: '100% Free',
      titleHi: '100% मुफ्त',
      description: 'No hidden charges'
    },
    {
      icon: '⚡',
      title: 'Instant Response',
      titleHi: 'तुरंत जवाब',
      description: 'AI-powered assistance'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge, idx) => (
        <div 
          key={idx} 
          className="flex flex-col items-center text-center p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200 hover:border-saffron-300 transition-all hover:shadow-md"
        >
          <div className="text-3xl mb-2">{badge.icon}</div>
          <h4 className="font-semibold text-gray-900 text-sm mb-1">{badge.titleHi}</h4>
          <p className="text-xs text-gray-500">{badge.description}</p>
        </div>
      ))}
    </div>
  )
}

export default TrustBadges
