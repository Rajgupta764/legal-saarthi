const UserProgressTracker = () => {
  const userProgress = {
    name: 'राम कुमार',
    level: 3,
    points: 2450,
    nextLevel: 3500,
    casesResolved: 5,
    documentsUploaded: 12,
    articlesRead: 23
  }

  const achievements = [
    { emoji: '🎯', title: 'पहला FIR', description: 'एक FIR सफलतापूर्वक दर्ज किया', unlocked: true },
    { emoji: '📚', title: 'ज्ञानी', description: '10 कानूनी लेख पढ़े', unlocked: true },
    { emoji: '💼', title: 'कानून विशेषज्ञ', description: '5 केस समाधान किए', unlocked: true },
    { emoji: '🌟', title: 'तारे का राहगीर', description: '50 पॉइंट्स हासिल किए', unlocked: false },
    { emoji: '🏆', title: 'कानून शिक्षक', description: '20 कानूनी सुझाव साझा किए', unlocked: false },
    { emoji: '🎖️', title: 'महान वकील', description: '100 पॉइंट्स हासिल किए', unlocked: false }
  ]

  const milestones = [
    { marker: 100, label: '100 पॉइंट्स', completed: true },
    { marker: 500, label: '500 पॉइंट्स', completed: true },
    { marker: 1000, label: '1000 पॉइंट्स', completed: true },
    { marker: 2000, label: '2000 पॉइंट्स', completed: true },
    { marker: 3500, label: '3500 पॉइंट्स', completed: false }
  ]

  const progressPercent = (userProgress.points / userProgress.nextLevel) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">आपकी प्रगति</h2>
          <p className="text-gray-600 text-sm">कानूनी शिक्षा में आपका सफर</p>
        </div>
        <span className="text-4xl">🏅</span>
      </div>

      {/* User Header */}
      <div className="bg-gradient-to-r from-saffron-500 to-trust-600 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">{userProgress.name}</h3>
            <p className="text-white/80 text-sm">स्तर {userProgress.level} का कानून सहायक</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{userProgress.points}</p>
            <p className="text-white/80 text-sm">कुल पॉइंट्स</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">अगले स्तर तक</span>
            <span className="text-sm font-medium">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all"
              style={{width: `${progressPercent}%`}}
            ></div>
          </div>
          <p className="text-xs text-white/80 mt-2">{userProgress.points} / {userProgress.nextLevel} पॉइंट्स</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{userProgress.casesResolved}</p>
          <p className="text-sm text-gray-700 mt-1">केस हल किए गए</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{userProgress.documentsUploaded}</p>
          <p className="text-sm text-gray-700 mt-1">दस्तावेज़ अपलोड किए</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{userProgress.articlesRead}</p>
          <p className="text-sm text-gray-700 mt-1">लेख पढ़े गए</p>
        </div>
      </div>

      {/* Milestones */}
      <div className="mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">आपके मील के पत्थर</h3>
        <div className="flex items-center gap-2">
          {milestones.map((milestone, idx) => (
            <div key={idx} className="flex-1">
              <div className={`h-12 rounded-lg flex items-center justify-center font-medium text-sm transition-all ${
                milestone.completed
                  ? 'bg-saffron-100 text-saffron-700 border border-saffron-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}>
                {milestone.completed ? '✓' : '-'}
              </div>
              <p className="text-xs text-center text-gray-600 mt-1">{milestone.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">उपलब्धियां</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {achievements.map((achievement, idx) => (
            <div 
              key={idx}
              className={`flex flex-col items-center text-center p-4 rounded-lg border-2 transition-all ${
                achievement.unlocked
                  ? 'bg-yellow-50 border-yellow-300 hover:shadow-md'
                  : 'bg-gray-50 border-gray-200 opacity-50'
              }`}
            >
              <div className={`text-4xl mb-2 ${achievement.unlocked ? '' : 'grayscale'}`}>
                {achievement.emoji}
              </div>
              <p className="font-medium text-gray-900 text-xs">{achievement.title}</p>
              <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
              {achievement.unlocked && (
                <span className="text-xs text-yellow-600 mt-2 font-medium">✓ प्राप्त</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next Actions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">अगला कदम</h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-700">• आपको अगले स्तर तक पहुँचने के लिए <strong>1050 और पॉइंट्स</strong> चाहिए</p>
          <p className="text-sm text-gray-700">• एक और केस हल करके <strong>500 पॉइंट्स</strong> कमाएं</p>
          <p className="text-sm text-gray-700">• <strong>भारतीय संविधान</strong> लेख पढ़कर <strong>200 पॉइंट्स</strong> पाएं</p>
        </div>
      </div>
    </div>
  )
}

export default UserProgressTracker
