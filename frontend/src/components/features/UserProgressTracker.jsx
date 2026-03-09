import { useState, useEffect } from 'react'
import api from '../../services/api'

const UserProgressTracker = () => {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get('/profile/progress')
        if (res.data.success) setProgress(res.data.data)
      } catch (err) {
        console.error('Failed to load progress:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-saffron-500"></div>
      </div>
    )
  }

  const p = progress || {
    name: 'User', level: 1, level_name: 'नया सदस्य', points: 0,
    next_level_points: 100, chats: 0, documents_uploaded: 0,
    drafts_generated: 0, tips_read: 0, schemes_checked: 0, recent_activities: []
  }

  const progressPercent = p.next_level_points > 0
    ? Math.min((p.points / p.next_level_points) * 100, 100)
    : 0

  const achievements = [
    { emoji: '💬', title: 'पहली बातचीत', description: 'AI से पहली बात', unlocked: p.chats >= 1 },
    { emoji: '📄', title: 'पहला दस्तावेज़', description: 'एक दस्तावेज़ अपलोड', unlocked: p.documents_uploaded >= 1 },
    { emoji: '📝', title: 'ड्राफ्ट मास्टर', description: 'एक ड्राफ्ट बनाया', unlocked: p.drafts_generated >= 1 },
    { emoji: '📚', title: 'ज्ञानी', description: '5 कानूनी टिप्स पढ़े', unlocked: p.tips_read >= 5 },
    { emoji: '🏛️', title: 'योजना खोजी', description: '3 योजनाएं देखीं', unlocked: p.schemes_checked >= 3 },
    { emoji: '🏆', title: 'कानून विशेषज्ञ', description: '1500 पॉइंट्स', unlocked: p.points >= 1500 },
  ]

  const pointsNeeded = p.next_level_points - p.points

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
            <h3 className="text-2xl font-bold">{p.name}</h3>
            <p className="text-white/80 text-sm">स्तर {p.level} — {p.level_name}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{p.points}</p>
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
          <p className="text-xs text-white/80 mt-2">{p.points} / {p.next_level_points} पॉइंट्स</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{p.chats}</p>
          <p className="text-sm text-gray-700 mt-1">AI बातचीत</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{p.documents_uploaded}</p>
          <p className="text-sm text-gray-700 mt-1">दस्तावेज़</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{p.drafts_generated}</p>
          <p className="text-sm text-gray-700 mt-1">ड्राफ्ट बनाए</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">{p.tips_read}</p>
          <p className="text-sm text-gray-700 mt-1">टिप्स पढ़े</p>
        </div>
      </div>

      {/* Recent Activity */}
      {p.recent_activities && p.recent_activities.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">हाल की गतिविधियां</h3>
          <div className="space-y-2">
            {p.recent_activities.slice(0, 5).map((act, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 text-sm">
                <span className="text-gray-700">
                  {act.type === 'chat' ? '💬 AI चैट' :
                   act.type === 'voice_chat' ? '🎤 वॉइस चैट' :
                   act.type === 'document_upload' ? '📄 दस्तावेज़ अपलोड' :
                   act.type === 'document_check' ? '📋 दस्तावेज़ जांच' :
                   act.type === 'draft_generated' ? '📝 ड्राफ्ट बनाया' :
                   act.type === 'tip_read' ? '📚 टिप्स पढ़ा' :
                   act.type === 'scheme_check' ? '🏛️ योजना देखी' :
                   '⚡ गतिविधि'}
                </span>
                <span className="text-saffron-600 font-medium">+{act.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
          {pointsNeeded > 0 && (
            <p className="text-sm text-gray-700">• अगले स्तर तक पहुँचने के लिए <strong>{pointsNeeded} और पॉइंट्स</strong> चाहिए</p>
          )}
          {p.chats === 0 && (
            <p className="text-sm text-gray-700">• AI चैटबॉट से बात करके <strong>5 पॉइंट्स</strong> कमाएं</p>
          )}
          {p.documents_uploaded === 0 && (
            <p className="text-sm text-gray-700">• एक दस्तावेज़ अपलोड करके <strong>15 पॉइंट्स</strong> पाएं</p>
          )}
          {p.tips_read < 5 && (
            <p className="text-sm text-gray-700">• कानूनी टिप्स पढ़कर <strong>ज्ञानी</strong> उपाधि पाएं</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProgressTracker
