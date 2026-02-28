"""
Chatbot Service - Conversational Legal Assistance
Guides users through issue reporting and document generation
"""

import json
from enum import Enum


class IssueCategory(Enum):
    """Legal issue categories"""
    POLICE_HARASSMENT = "police_harassment"
    PROPERTY_DISPUTE = "property_dispute"
    FAMILY_MATTER = "family_matter"
    LABOR_ISSUE = "labor_issue"
    CONSUMER_COMPLAINT = "consumer_complaint"
    LAND_DISPUTE = "land_dispute"
    DEBT_RECOVERY = "debt_recovery"
    OTHERS = "others"


class ChatbotService:
    """Conversational chatbot for legal assistance"""
    
    def __init__(self):
        self.conversation_flow = {
            'start': {
                'message': 'नमस्ते! मैं आपकी कानूनी मदद करने के लिए यहाँ हूँ। \nकृपया बताइए, आपको किस तरह की समस्या है?',
                'options': [
                    {'label': '🚔 पुलिस परेशानी', 'value': 'police_harassment'},
                    {'label': '🏠 जमीन/संपत्ति विवाद', 'value': 'property_dispute'},
                    {'label': '👨‍👩‍👧‍👦 परिवार संबंधित मामला', 'value': 'family_matter'},
                    {'label': '💼 नौकरी/मजदूरी समस्या', 'value': 'labor_issue'},
                    {'label': '🛍️ उपभोक्ता शिकायत', 'value': 'consumer_complaint'},
                    {'label': '📋 कुछ और', 'value': 'others'}
                ]
            },
            'police_harassment': {
                'message': 'पुलिस परेशानी के बारे में बताइए। क्या हुआ?',
                'questions': [
                    {
                        'key': 'incident_type',
                        'label': 'घटना का प्रकार',
                        'options': [
                            {'label': 'गिरफ्तारी/हिरासत', 'value': 'arrest'},
                            {'label': 'पूछताछ में मारपीट', 'value': 'torture'},
                            {'label': 'अन्यायपूर्ण FIR', 'value': 'false_fir'},
                            {'label': 'रिश्वत माँगना', 'value': 'bribery'},
                            {'label': 'अन्य परेशानी', 'value': 'other'}
                        ]
                    },
                    {
                        'key': 'when_happened',
                        'label': 'यह कब हुआ?',
                        'type': 'text',
                        'placeholder': 'तारीख (जैसे: 15 दिन पहले)'
                    },
                    {
                        'key': 'police_station',
                        'label': 'किस पुलिस स्टेशन में हुआ?',
                        'type': 'text',
                        'placeholder': 'पुलिस स्टेशन का नाम'
                    },
                    {
                        'key': 'description',
                        'label': 'विस्तार से बताइए',
                        'type': 'textarea',
                        'placeholder': 'क्या हुआ था? कितने लोग शामिल थे?'
                    }
                ],
                'next_action': 'generate_fir'
            },
            'property_dispute': {
                'message': 'संपत्ति संबंधित विवाद के बारे में बताइए।',
                'questions': [
                    {
                        'key': 'dispute_type',
                        'label': 'विवाद का प्रकार',
                        'options': [
                            {'label': 'सीमा विवाद', 'value': 'boundary'},
                            {'label': 'मालिकाना हक़', 'value': 'ownership'},
                            {'label': 'किराया विवाद', 'value': 'rent'},
                            {'label': 'दस्तावेज़ संबंधित', 'value': 'document'},
                            {'label': 'अन्य', 'value': 'other'}
                        ]
                    },
                    {
                        'key': 'property_type',
                        'label': 'संपत्ति का प्रकार',
                        'options': [
                            {'label': 'जमीन/खेत', 'value': 'land'},
                            {'label': 'मकान', 'value': 'house'},
                            {'label': 'दुकान', 'value': 'shop'},
                            {'label': 'अन्य', 'value': 'other'}
                        ]
                    },
                    {
                        'key': 'opposite_party',
                        'label': 'विरोधी पक्ष कौन है?',
                        'type': 'text',
                        'placeholder': 'नाम या रिश्ता (जैसे: पड़ोसी राज)'
                    },
                    {
                        'key': 'when_started',
                        'label': 'विवाद कब शुरू हुआ?',
                        'type': 'text',
                        'placeholder': 'तारीख या महीना'
                    },
                    {
                        'key': 'description',
                        'label': 'पूरी स्थिति बताइए',
                        'type': 'textarea',
                        'placeholder': 'क्या हुआ? दस्तावेज़ हैं? किसने दावा किया?'
                    }
                ],
                'next_action': 'generate_notice'
            },
            'labor_issue': {
                'message': 'नौकरी/मजदूरी संबंधी समस्या बताइए।',
                'questions': [
                    {
                        'key': 'issue_type',
                        'label': 'समस्या का प्रकार',
                        'options': [
                            {'label': 'तनख्वाह न मिलना', 'value': 'unpaid_salary'},
                            {'label': 'बिना कारण निकाला गया', 'value': 'wrongful_termination'},
                            {'label': 'काम की शर्तें', 'value': 'bad_conditions'},
                            {'label': 'प्रोविडेंट फंड', 'value': 'pf_issue'},
                            {'label': 'अन्य', 'value': 'other'}
                        ]
                    },
                    {
                        'key': 'company_name',
                        'label': 'कंपनी/मालिक का नाम',
                        'type': 'text',
                        'placeholder': 'कहाँ काम करते हैं?'
                    },
                    {
                        'key': 'months_worked',
                        'label': 'कितने महीने काम किया?',
                        'type': 'text',
                        'placeholder': 'महीने का संख्या'
                    },
                    {
                        'key': 'amount_due',
                        'label': 'कितना पैसा बकाया है? (यदि लागू हो)',
                        'type': 'text',
                        'placeholder': 'राशि (जैसे: ₹50,000)'
                    },
                    {
                        'key': 'description',
                        'label': 'विस्तार से बताइए',
                        'type': 'textarea',
                        'placeholder': 'कब शुरू हुई समस्या? क्या कोशिश की?'
                    }
                ],
                'next_action': 'generate_notice'
            },
            'family_matter': {
                'message': 'परिवार संबंधी मामले बताइए।',
                'questions': [
                    {
                        'key': 'matter_type',
                        'label': 'मामले का प्रकार',
                        'options': [
                            {'label': 'विवाह संबंधी', 'value': 'marriage'},
                            {'label': 'तलाक/अलगाव', 'value': 'divorce'},
                            {'label': 'संतान की कस्टडी', 'value': 'custody'},
                            {'label': 'विरासत/विल', 'value': 'inheritance'},
                            {'label': 'दहेज़ दुर्व्यवहार', 'value': 'dowry'},
                            {'label': 'अन्य', 'value': 'other'}
                        ]
                    },
                    {
                        'key': 'opposite_party',
                        'label': 'विरोधी पक्ष कौन है?',
                        'type': 'text',
                        'placeholder': 'रिश्ता (जैसे: पति, माता-पिता)'
                    },
                    {
                        'key': 'married_since',
                        'label': 'शादी कब की? (यदि लागू हो)',
                        'type': 'text',
                        'placeholder': 'साल या तारीख'
                    },
                    {
                        'key': 'description',
                        'label': 'स्थिति बताइए',
                        'type': 'textarea',
                        'placeholder': 'क्या समस्या है? कब से है?'
                    }
                ],
                'next_action': 'generate_petition'
            },
            'consumer_complaint': {
                'message': 'उपभोक्ता शिकायत के बारे में बताइए।',
                'questions': [
                    {
                        'key': 'complaint_type',
                        'label': 'शिकायत का प्रकार',
                        'options': [
                            {'label': 'खराब सामान/सेवा', 'value': 'defective_product'},
                            {'label': 'गलत कीमत वसूली', 'value': 'overcharging'},
                            {'label': 'वारंटी न मिलना', 'value': 'warranty_issue'},
                            {'label': 'ठगी/धोखेबाजी', 'value': 'fraud'},
                            {'label': 'अन्य', 'value': 'other'}
                        ]
                    },
                    {
                        'key': 'shop_name',
                        'label': 'दुकान/कंपनी का नाम',
                        'type': 'text',
                        'placeholder': 'कहाँ से खरीदा?'
                    },
                    {
                        'key': 'purchase_date',
                        'label': 'खरीदारी कब की?',
                        'type': 'text',
                        'placeholder': 'तारीख (जैसे: 1 महीना पहले)'
                    },
                    {
                        'key': 'amount_paid',
                        'label': 'कितना पैसा दिया?',
                        'type': 'text',
                        'placeholder': 'राशि (जैसे: ₹5,000)'
                    },
                    {
                        'key': 'description',
                        'label': 'समस्या का विवरण',
                        'type': 'textarea',
                        'placeholder': 'क्या हुआ? क्या सबूत हैं (बिल, फोटो)?'
                    }
                ],
                'next_action': 'generate_notice'
            },
            'others': {
                'message': 'अपनी समस्या विस्तार से बताइए।',
                'questions': [
                    {
                        'key': 'problem_type',
                        'label': 'समस्या का प्रकार',
                        'type': 'text',
                        'placeholder': 'समस्या क्या है?'
                    },
                    {
                        'key': 'opposite_party',
                        'label': 'विरोधी पक्ष कौन है?',
                        'type': 'text',
                        'placeholder': 'नाम या पहचान'
                    },
                    {
                        'key': 'when_started',
                        'label': 'समस्या कब शुरू हुई?',
                        'type': 'text',
                        'placeholder': 'तारीख या समय अवधि'
                    },
                    {
                        'key': 'description',
                        'label': 'पूरी स्थिति बताइए',
                        'type': 'textarea',
                        'placeholder': 'विस्तार से क्या हुआ? कोई सबूत हैं?'
                    },
                    {
                        'key': 'relief_sought',
                        'label': 'आप क्या चाहते हैं?',
                        'type': 'text',
                        'placeholder': 'समाधान क्या है? (जैसे: वापसी, मुआवजा)'
                    }
                ],
                'next_action': 'generate_notice'
            }
        }

    def get_initial_message(self):
        """Get initial chatbot message"""
        return self.conversation_flow['start']

    def process_user_input(self, user_input, conversation_history):
        """
        Process user input and return next message
        
        Args:
            user_input: User's response
            conversation_history: List of previous exchanges
        
        Returns:
            dict with next message and questions
        """
        # Determine current state based on conversation history
        current_state = self._determine_state(conversation_history)
        
        if current_state == 'start':
            return self._handle_category_selection(user_input)
        else:
            # Collect information for the selected category
            return self._handle_information_collection(current_state, user_input, conversation_history)

    def _determine_state(self, history):
        """Determine current conversation state"""
        if not history:
            return 'start'
        
        # Find the last category selected
        for msg in reversed(history):
            if msg.get('type') == 'user_selection':
                return msg.get('selected_option')
        
        return 'start'

    def _handle_category_selection(self, selected_category):
        """Handle category selection from initial menu"""
        if selected_category not in self.conversation_flow:
            return {
                'error': 'Invalid category',
                'message': 'कृपया सही विकल्प चुनें।'
            }
        
        flow = self.conversation_flow[selected_category]
        return {
            'category': selected_category,
            'message': flow['message'],
            'questions': flow['questions'],
            'next_action': flow['next_action']
        }

    def _handle_information_collection(self, category, user_input, history):
        """Collect and validate user information"""
        if category not in self.conversation_flow:
            return {'error': 'Invalid category'}
        
        flow = self.conversation_flow[category]
        questions = flow['questions']
        
        # Count how many questions have been answered
        answered_count = len([h for h in history if h.get('type') == 'user_input'])
        
        if answered_count < len(questions):
            # More questions to ask
            next_question = questions[answered_count]
            return {
                'message': next_question['label'],
                'question': next_question,
                'progress': f"{answered_count}/{len(questions)} प्रश्न उत्तरित"
            }
        else:
            # All questions answered, ready to generate document
            return {
                'message': 'धन्यवाद! आपकी जानकारी तैयार है।',
                'completed': True,
                'action': flow['next_action'],
                'data': self._extract_conversation_data(history)
            }

    def _extract_conversation_data(self, history):
        """Extract structured data from conversation"""
        data = {}
        for msg in history:
            if msg.get('type') == 'user_input':
                data[msg.get('key')] = msg.get('value')
        return data

    def get_suggested_action(self, conversation_data):
        """Get the recommended action based on conversation"""
        issue_type = conversation_data.get('issue_type') or conversation_data.get('incident_type')
        
        suggestions = {
            'fir': {
                'title': 'FIR दर्ज करने के लिए तैयार हैं?',
                'description': 'आपकी जानकारी के आधार पर, FIR दर्ज करना जरूरी है।',
                'action': 'generate_fir',
                'button': 'FIR ड्राफ्ट बनाएं'
            },
            'notice': {
                'title': 'कानूनी नोटिस तैयार करें',
                'description': 'विरोधी पक्ष को लिखित नोटिस भेजना फायदेमंद है।',
                'action': 'generate_notice',
                'button': 'नोटिस बनाएं'
            },
            'petition': {
                'title': 'पेटीशन दाखिल करें',
                'description': 'अदालत में याचिका दाखिल करना होगा।',
                'action': 'generate_petition',
                'button': 'पेटीशन ड्राफ्ट करें'
            }
        }
        
        # Return appropriate suggestion
        if issue_type in ['arrest', 'false_fir', 'torture']:
            return suggestions['fir']
        elif issue_type in ['unpaid_salary', 'wrongful_termination']:
            return suggestions['notice']
        else:
            return suggestions['petition']

    def format_conversation_for_document(self, conversation_data):
        """Format conversation data for document generation"""
        return {
            'applicant_name': conversation_data.get('applicant_name', ''),
            'applicant_address': conversation_data.get('applicant_address', ''),
            'issue_description': conversation_data.get('description', ''),
            'incident_date': conversation_data.get('when_happened') or conversation_data.get('when_started'),
            'opposite_party': conversation_data.get('opposite_party', ''),
            'incident_type': conversation_data.get('incident_type') or conversation_data.get('dispute_type'),
            'location': conversation_data.get('police_station') or conversation_data.get('location', ''),
            'evidence': conversation_data.get('evidence', ''),
            'witness': conversation_data.get('witness', '')
        }
