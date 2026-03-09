import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../services/api'

const CaseAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/profile/analytics')
        if (res.data.success) setAnalytics(res.data.data)
      } catch (err) {
        console.error('Failed to load analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-500">लोड हो रहा है...</div>

  const a = analytics || {}
  const monthly = a.monthly || []

  const activityBreakdown = [
    { name: 'चैट', value: a.chats || 0, color: 'bg-blue-500' },
    { name: 'वॉइस चैट', value: a.voice_chats || 0, color: 'bg-green-500' },
    { name: 'दस्तावेज़', value: a.documents || 0, color: 'bg-purple-500' },
    { name: 'ड्राफ्ट', value: a.drafts || 0, color: 'bg-orange-500' },
    { name: 'टिप्स पढ़े', value: a.tips_read || 0, color: 'bg-pink-500' },
    { name: 'योजना जांच', value: a.schemes_checked || 0, color: 'bg-teal-500' },
  ]
  const maxVal = Math.max(...activityBreakdown.map(x => x.value), 1)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-600 font-medium">कुल गतिविधियाँ</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{(a.total_actions || 0).toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-1">Total Actions</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-600 font-medium">कुल अंक</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{(a.total_points || 0).toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">Total Points</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-purple-600 font-medium">चैट सत्र</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{(a.chats || 0) + (a.voice_chats || 0)}</p>
          <p className="text-xs text-purple-600 mt-1">Chat Sessions</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <p className="text-xs text-orange-600 font-medium">दस्तावेज़</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{(a.documents || 0) + (a.drafts || 0)}</p>
          <p className="text-xs text-orange-600 mt-1">Documents & Drafts</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">मासिक गतिविधि</h3>
          {monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px'}} />
                <Bar dataKey="actions" fill="#FF9933" name="गतिविधियाँ" radius={[4,4,0,0]} />
                <Bar dataKey="points" fill="#22c55e" name="अंक" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">अभी कोई डेटा नहीं</div>
          )}
        </div>

        {/* Activity Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">गतिविधि विवरण</h3>
          <div className="space-y-3">
            {activityBreakdown.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${item.color}`}
                    style={{width: `${(item.value / maxVal) * 100}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaseAnalytics
