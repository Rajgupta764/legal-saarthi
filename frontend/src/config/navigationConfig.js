// Scalable navigation structure for future growth
export const navigationStructure = {
  // TIER 1: Core Tools (Always visible, most used)
  coreTools: {
    label: 'कानूनी उपकरण',
    icon: '🛠️',
    features: [
      { id: 'document', label: 'Document Check' },
      { id: 'voice', label: 'Voice Complaint' },
      { id: 'draft', label: 'FIR Generator' },
      { id: 'helpfinder', label: 'Find Help' }
    ]
  },

  // TIER 2: Learning (Educational)
  learning: {
    label: 'सीखने के लिए',
    icon: '📚',
    features: [
      { id: 'tips', label: 'Legal Tips' },
      { id: 'fear-removal', label: 'Rights Guide' },
      { id: 'community-qa', label: 'Q&A' },
      { id: 'schemes', label: 'Schemes' }
    ]
  },

  // TIER 3: User Profile
  myProfile: {
    label: 'मेरी प्रोफाइल',
    icon: '👤',
    features: [
      { id: 'progress', label: 'My Progress' },
      { id: 'documents', label: 'My Documents' },
      { id: 'analytics', label: 'Analytics' },
      { id: 'lawyers', label: 'Lawyers' }
    ]
  },

  // TIER 4: Emergency (Always accessible)
  emergency: {
    label: 'तत्काल सहायता',
    icon: '🆘',
    features: [
      { id: 'emergency', label: 'Emergency' },
      { id: 'chatbot', label: 'AI Chat' },
      { id: 'voice-assistant', label: 'Voice Assistant' }
    ]
  },

  // Future placeholder for scalability
  futureModules: {
    label: 'आने वाली सुविधाएं',
    icon: '🚀',
    features: [
      // Will be filled as company grows - e.g., video consultations, case tracking, etc.
    ]
  }
}

// Export tier-based features for conditional rendering
export const FEATURE_TIERS = {
  CORE: 'core',
  LEARNING: 'learning',
  PROFILE: 'profile',
  EMERGENCY: 'emergency'
}
