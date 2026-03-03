const DocumentManager = () => {
  const documents = [
    {
      id: 1,
      name: 'FIR 2024-001',
      type: 'FIR',
      date: '15 Feb 2024',
      status: 'Submitted',
      size: '2.4 MB',
      icon: '📄'
    },
    {
      id: 2,
      name: 'Property Deed - Land 5 Acres',
      type: 'Property Document',
      date: '10 Feb 2024',
      status: 'Verified',
      size: '1.8 MB',
      icon: '📋'
    },
    {
      id: 3,
      name: 'Employment Contract',
      type: 'Contract',
      date: '5 Feb 2024',
      status: 'In Review',
      size: '890 KB',
      icon: '💼'
    },
    {
      id: 4,
      name: 'Marriage Certificate',
      type: 'Personal Document',
      date: '28 Jan 2024',
      status: 'Verified',
      size: '1.2 MB',
      icon: '💍'
    }
  ]

  const getStatusColor = (status) => {
    switch(status) {
      case 'Submitted': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Verified': return 'bg-green-50 text-green-700 border-green-200'
      case 'In Review': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">आपके दस्तावेज़</h2>
          <p className="text-gray-600 text-sm">सभी कानूनी दस्तावेज़ एक जगह सुरक्षित</p>
        </div>
        <span className="text-4xl">📁</span>
      </div>

      {/* Upload Section */}
      <div className="border-2 border-dashed border-saffron-300 rounded-lg p-8 text-center mb-6 hover:bg-saffron-50 transition-colors">
        <p className="text-4xl mb-2">📸</p>
        <p className="font-semibold text-gray-900 mb-1">दस्तावेज़ अपलोड करें</p>
        <p className="text-sm text-gray-600 mb-4">अपने दस्तावेज़ की फोटो खींचिए या PDF अपलोड करें</p>
        <button className="px-6 py-2.5 bg-saffron-500 text-white rounded-lg font-medium hover:bg-saffron-600 transition-colors">
          फाइल चुनें
        </button>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {documents.map(doc => (
          <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <span className="text-3xl flex-shrink-0">{doc.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-saffron-600 transition-colors">
                    {doc.name}
                  </h3>
                  <div className="flex gap-2 flex-wrap mb-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {doc.type}
                    </span>
                    <span className="text-xs text-gray-500">{doc.date}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{doc.size}</span>
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                  ⬇️
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Share">
                  🔗
                </button>
                <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Storage Info */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">क्लाउड स्टोरेज</span>
          <span className="text-sm text-gray-600">8.2 GB / 10 GB उपयोग किया गया</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-saffron-500 h-2 rounded-full transition-all" style={{width: '82%'}}></div>
        </div>
      </div>
    </div>
  )
}

export default DocumentManager
