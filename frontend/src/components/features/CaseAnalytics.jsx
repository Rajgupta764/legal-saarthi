import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CaseAnalytics = () => {
  const [stats] = useState({
    totalCasesResolved: 4521,
    avgResolutionTime: '12 days',
    successRate: 87,
    casesThisMonth: 342,
    savingUsers: '₹2.4 Cr'
  })

  const caseByType = [
    { name: 'FIR', value: 1245, percentage: 28 },
    { name: 'Property', value: 980, percentage: 22 },
    { name: 'Family', value: 856, percentage: 19 },
    { name: 'Labor', value: 734, percentage: 16 },
    { name: 'Other', value: 706, percentage: 15 }
  ]

  const timelineData = [
    { month: 'Jan', cases: 240, success: 210 },
    { month: 'Feb', cases: 290, success: 252 },
    { month: 'Mar', cases: 340, success: 295 },
    { month: 'Apr', cases: 380, success: 330 },
    { month: 'May', cases: 420, success: 365 },
    { month: 'Jun', cases: 342, success: 297 },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-600 font-medium">कुल समाधान</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalCasesResolved.toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-1">Total Cases Resolved</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-600 font-medium">सफलता दर</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.successRate}%</p>
          <p className="text-xs text-green-600 mt-1">Success Rate</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-purple-600 font-medium">औसत समय</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{stats.avgResolutionTime}</p>
          <p className="text-xs text-purple-600 mt-1">Avg Resolution</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <p className="text-xs text-orange-600 font-medium">इस महीने</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{stats.casesThisMonth}</p>
          <p className="text-xs text-orange-600 mt-1">Cases This Month</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-4 border border-rose-200">
          <p className="text-xs text-rose-600 font-medium">बचत</p>
          <p className="text-2xl font-bold text-rose-900 mt-1">{stats.savingUsers}</p>
          <p className="text-xs text-rose-600 mt-1">User Savings</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">6 महीने में वृद्धि</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px'}}
              />
              <Line 
                type="monotone" 
                dataKey="cases" 
                stroke="#FF9933" 
                strokeWidth={2}
                name="Total Cases"
              />
              <Line 
                type="monotone" 
                dataKey="success" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Success Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Case Type Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">केस के प्रकार</h3>
          <div className="space-y-3">
            {caseByType.map((type, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-900">{type.name}</span>
                  <span className="text-xs text-gray-500">{type.value.toLocaleString()} ({type.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      idx === 0 ? 'bg-blue-500' :
                      idx === 1 ? 'bg-green-500' :
                      idx === 2 ? 'bg-purple-500' :
                      idx === 3 ? 'bg-orange-500' :
                      'bg-pink-500'
                    }`}
                    style={{width: `${type.percentage * 6.67}%`}}
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
