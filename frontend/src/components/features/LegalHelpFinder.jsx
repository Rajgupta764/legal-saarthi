import { useState, useEffect } from 'react'
import api from '../../services/api'

const LegalHelpFinder = () => {
  const [district, setDistrict] = useState('')
  const [pincode, setPincode] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const [locationStatus, setLocationStatus] = useState('idle') // idle, loading, success, error
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)

  // Get user's location on mount
  useEffect(() => {
    getUserLocation()
  }, [])

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error')
      return
    }

    setLocationStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setLocationStatus('success')
      },
      (err) => {
        console.log('Location error:', err.message)
        setLocationStatus('error')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!district.trim() && !pincode.trim() && !userLocation) {
      setError('Please enter district, pincode, or enable location')
      return
    }

    // Validate pincode format
    if (pincode && !/^\d{6}$/.test(pincode.trim())) {
      setError('Please enter a valid 6-digit pincode')
      return
    }

    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const payload = {}
      if (district.trim()) payload.district = district.trim()
      if (pincode.trim()) payload.pincode = pincode.trim()
      if (userLocation) {
        payload.userLat = userLocation.lat
        payload.userLng = userLocation.lng
      }

      const response = await api.post('/find-legal-aid', payload)
      
      if (response.data.success) {
        setResults(response.data)
      } else {
        setError(response.data.message || 'No results found')
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Server error. Please try again.')
      } else if (err.request) {
        setError('Cannot connect to server. Please check your internet.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setDistrict('')
    setPincode('')
    setResults(null)
    setError(null)
  }

  // Common districts for quick selection
  const popularDistricts = [
    { name: 'Lucknow', pincode: '226001' },
    { name: 'Delhi', pincode: '110001' },
    { name: 'Mumbai', pincode: '400001' },
    { name: 'Patna', pincode: '800001' },
    { name: 'Jaipur', pincode: '302001' },
    { name: 'Varanasi', pincode: '221001' },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Search Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <form onSubmit={handleSubmit}>
          {/* Location Status */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-gray-600">Your Location:</span>
              {locationStatus === 'loading' && (
                <span className="text-xs text-gray-500">Detecting...</span>
              )}
              {locationStatus === 'success' && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Enabled
                </span>
              )}
              {locationStatus === 'error' && (
                <span className="text-xs text-gray-400">Not available</span>
              )}
            </div>
            {locationStatus !== 'success' && (
              <button
                type="button"
                onClick={getUserLocation}
                className="text-xs text-saffron-600 hover:text-saffron-700"
              >
                Enable
              </button>
            )}
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* District Input */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                District Name
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g., Lucknow"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500"
                disabled={isLoading}
              />
            </div>

            {/* Pincode Input */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="e.g., 226001"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500"
                disabled={isLoading}
                maxLength={6}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading || (!district.trim() && !pincode.trim() && !userLocation)}
              className={`
                flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2
                ${isLoading || (!district.trim() && !pincode.trim() && !userLocation)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-saffron-500 text-white hover:bg-saffron-600'
                }
              `}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Legal Aid
                </>
              )}
            </button>
            
            {(district || pincode || results) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Quick Select */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Quick select:</p>
          <div className="flex flex-wrap gap-1.5">
            {popularDistricts.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setDistrict(item.name)
                  setPincode(item.pincode)
                }}
                className="px-2.5 py-1 bg-gray-100 hover:bg-saffron-50 hover:text-saffron-700 text-gray-600 rounded text-xs transition-colors"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {results.totalResults} office(s) found
            </p>
            {results.helpline && (
              <a
                href={`tel:${results.helpline.number}`}
                className="text-xs text-saffron-600 hover:text-saffron-700 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                Helpline: {results.helpline.number}
              </a>
            )}
          </div>

          {results.offices && results.offices.length > 0 ? (
            <div className="space-y-3">
              {results.offices.map((office, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Header */}
                  <div className="bg-saffron-50 border-b border-saffron-100 px-4 py-2.5 flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800">
                        {office.name}
                      </h4>
                      {office.nameHi && office.nameHi !== office.name && (
                        <p className="text-xs text-gray-500 mt-0.5">{office.nameHi}</p>
                      )}
                    </div>
                    {office.distance !== undefined && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        {office.distanceText}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3 text-sm">
                    {/* Address */}
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <div>
                        <span className="text-gray-700">{office.address}</span>
                        {office.addressHi && office.addressHi !== office.address && (
                          <p className="text-xs text-gray-500 mt-0.5">{office.addressHi}</p>
                        )}
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                      <a
                        href={`tel:${office.phone}`}
                        className="text-saffron-600 hover:text-saffron-700 font-medium"
                      >
                        {office.phone}
                      </a>
                    </div>

                    {/* Timings */}
                    {office.timings && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                        <span className="text-gray-600">{office.timings}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                      <a
                        href={office.mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
                        </svg>
                        Open in Google Maps
                      </a>
                      
                      <a
                        href={`tel:${office.phone}`}
                        className="inline-flex items-center gap-1.5 text-xs text-saffron-600 hover:text-saffron-700 font-medium"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                        </svg>
                        Call Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-sm text-yellow-700">No offices found. Try a different location.</p>
            </div>
          )}
        </div>
      )}

      {/* Help Info */}
      {!results && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">How to use:</h4>
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-saffron-500">•</span>
              Enter your district name (e.g., Lucknow, Mumbai, Delhi)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-saffron-500">•</span>
              Or enter your 6-digit pincode
            </li>
            <li className="flex items-start gap-2">
              <span className="text-saffron-500">•</span>
              Enable location for accurate distance calculation
            </li>
            <li className="flex items-start gap-2">
              <span className="text-saffron-500">•</span>
              NALSA Helpline (24x7): <span className="font-medium">15100</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default LegalHelpFinder
