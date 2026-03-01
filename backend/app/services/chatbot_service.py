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
                'message': 'ठीक है, मुझे बताइए क्या हुआ? पुलिस ने आपके साथ क्या किया? पूरी घटना विस्तार से बताइए।',
                'questions': [
                    {
                        'key': 'full_problem_description',
                        'label': 'अपनी पूरी समस्या बताइए - क्या हुआ था? कब हुआ? कहाँ हुआ? कौन कौन शामिल थे?',
                        'type': 'textarea',
                        'placeholder': 'पूरी घटना विस्तार से'
                    },
                    {
                        'key': 'your_details',
                        'label': 'अब अपना नाम और पता बताइए',
                        'type': 'text',
                        'placeholder': 'आपका नाम और पता'
                    }
                ],
                'next_action': 'analyze_and_suggest',
                'suggestions': {
                    'steps': [
                        '1. तुरंत FIR दर्ज करें',
                        '2. मेडिकल जांच कराएं (चोट के सबूत के लिए)',
                        '3. गवाहों के नाम और संपर्क इकट्ठा करें',
                        '4. घटना की तारीख, समय और जगह नोट करें'
                    ],
                    'proofs_needed': [
                        '📸 चोट की फोटो (अगर मारपीट हुई हो)',
                        '🏥 मेडिकल रिपोर्ट',
                        '👥 गवाहों के नाम और पते',
                        '📝 घटना की लिखित शिकायत',
                        '📍 घटना स्थल की जानकारी',
                        '🎥 अगर कोई वीडियो हो'
                    ],
                    'document_type': 'fir'
                }
            },
            'property_dispute': {
                'message': 'ठीक है। अपनी जमीन/संपत्ति की समस्या विस्तार से बताइए।',
                'questions': [
                    {
                        'key': 'full_problem_description',
                        'label': 'क्या समस्या है? कब शुरू हुई? विरोधी पक्ष कौन है? पूरी बात बताइए।',
                        'type': 'textarea',
                        'placeholder': 'पूरी समस्या विस्तार से'
                    },
                    {
                        'key': 'your_details',
                        'label': 'अपना नाम, पता और संपत्ति का विवरण बताइए',
                        'type': 'text',
                        'placeholder': 'आपका नाम, पता और संपत्ति की जानकारी'
                    }
                ],
                'next_action': 'analyze_and_suggest',
                'suggestions': {
                    'steps': [
                        '1. संपत्ति के पुराने दस्तावेज़ इकट्ठा करें',
                        '2. सीमा की जांच कराएं (Survey)',
                        '3. तहसीलदार/पटवारी से record निकलवाएं',
                        '4. कानूनी नोटिस भेजें'
                    ],
                    'proofs_needed': [
                        '📄 पुराने दस्तावेज़ (रसीद, रजिस्ट्री)',
                        '🗺️ Survey map या नक्शा',
                        '📋 खतौनी/खसरा',
                        '📸 संपत्ति की फोटो',
                        '👥 पुराने गवाहों के नाम',
                        '💰 खरीद की रसीद (अगर हो)'
                    ],
                    'document_type': 'notice'
                }
            },
            'family_matter': {
                'message': 'ठीक है। अपनी पारिवारिक समस्या बताइए।',
                'questions': [
                    {
                        'key': 'full_problem_description',
                        'label': 'क्या हो रहा है? कब से समस्या है? क्या हुआ? विस्तार से बताइए।',
                        'type': 'textarea',
                        'placeholder': 'पूरी स्थिति बताएं'
                    },
                    {
                        'key': 'your_details',
                        'label': 'अपना नाम, पता और सामने वाले व्यक्ति का नाम बताइए',
                        'type': 'text',
                        'placeholder': 'आपकी और विरोधी पक्ष की जानकारी'
                    }
                ],
                'next_action': 'analyze_and_suggest',
                'suggestions': {
                    'steps': [
                        '1. घटनाओं की डायरी रखें (तारीख के साथ)',
                        '2. परिवार के सदस्यों से बात करें',
                        '3. काउंसलिंग का प्रयास करें',
                        '4. अगर जरूरी हो तो FIR/complaint दर्ज करें'
                    ],
                    'proofs_needed': [
                        '💍 शादी का प्रमाण पत्र',
                        '📝 घटनाओं की लिखित डायरी',
                        '💬 Messages/चैट स्क्रीनशॉट',
                        '👥 गवाहों के नाम',
                        '🏥 चोट की रिपोर्ट (यदि हिंसा हुई हो)',
                        '🎥 वीडियो/ऑडियो (यदि हो)'
                    ],
                    'document_type': 'petition'
                }
            },
            'labor_issue': {
                'message': 'ठीक है। अपनी नौकरी/मजदूरी की समस्या बताइए।',
                'questions': [
                    {
                        'key': 'full_problem_description',
                        'label': 'क्या हुआ? कितने दिन से काम कर रहे हैं? क्या समस्या है? पूरी बात बताइए।',
                        'type': 'textarea',
                        'placeholder': 'पूरी समस्या विस्तार से'
                    },
                    {
                        'key': 'your_details',
                        'label': 'अपना नाम, पता और मालिक/कंपनी का नाम बताइए',
                        'type': 'text',
                        'placeholder': 'आपकी और कंपनी की जानकारी'
                    }
                ],
                'next_action': 'analyze_and_suggest',
                'suggestions': {
                    'steps': [
                        '1. मजदूरी की slip/record इकट्ठा करें',
                        '2. साथी मजदूरों से गवाही लें',
                        '3. Labour Office में शिकायत दर्ज करें',
                        '4. कानूनी नोटिस भेजें'
                    ],
                    'proofs_needed': [
                        '📝 नियुक्ति पत्र (Appointment letter)',
                        '💰 वेतन की slip',
                        '📅 उपस्थिति रजिस्टर (Attendance)',
                        '👥 साथी कर्मचारियों के नाम',
                        '💬 मालिक के साथ communication',
                        '🏦 बैंक statement (वेतन का प्रमाण)'
                    ],
                    'document_type': 'notice'
                }
            },
            'consumer_complaint': {
                'message': 'ठीक है। अपनी उपभोक्ता शिकायत बताइए।',
                'questions': [
                    {
                        'key': 'full_problem_description',
                        'label': 'क्या खरीदा? कहाँ से खरीदा? क्या समस्या है? कब खरीदा? पूरी बात बताइए।',
                        'type': 'textarea',
                        'placeholder': 'पूरी शिकायत विस्तार से'
                    },
                    {
                        'key': 'your_details',
                        'label': 'अपना नाम, पता और दुकान/कंपनी का नाम बताइए',
                        'type': 'text',
                        'placeholder': 'आपकी और विक्रेता की जानकारी'
                    }
                ],
                'next_action': 'analyze_and_suggest',
                'suggestions': {
                    'steps': [
                        '1. दुकानदार से शिकायत करें (लिखित में)',
                        '2. Consumer Forum में complaint दर्ज करें',
                        '3. सभी bills और warranty सुरक्षित रखें',
                        '4. अगर जरूरी हो तो नोटिस भेजें'
                    ],
                    'proofs_needed': [
                        '🧾 खरीदी की रसीद/Bill',
                        '📸 सामान की फोटो/वीडियो',
                        '📄 Warranty card',
                        '💬 दुकानदार से बातचीत का proof',
                        '📝 शिकायत की copy',
                        '👥 गवाहों के नाम (यदि हों)'
                    ],
                    'document_type': 'notice'
                }
            },
            'others': {
                'message': 'ठीक है। अपनी समस्या विस्तार से बताइए।',
                'questions': [
                    {
                        'key': 'full_problem_description',
                        'label': 'अपनी समस्या पूरी बताइए - क्या हुआ? कब से है? किसके साथ है?',
                        'type': 'textarea',
                        'placeholder': 'पूरी समस्या विस्तार से'
                    },
                    {
                        'key': 'your_details',
                        'label': 'अपना नाम और पता बताइए',
                        'type': 'text',
                        'placeholder': 'आपका नाम और पता'
                    }
                ],
                'next_action': 'analyze_and_suggest',
                'suggestions': {
                    'steps': [
                        '1. अपनी समस्या लिखित में तैयार करें',
                        '2. सभी सबूत इकट्ठा करें',
                        '3. स्थानीय अधिकारियों से संपर्क करें',
                        '4. कानूनी सलाह लें'
                    ],
                    'proofs_needed': [
                        '📝 समस्या का लिखित विवरण',
                        '📄 सभी संबंधित दस्तावेज़',
                        '👥 गवाहों के नाम',
                        '📸 फोटो/वीडियो (यदि हों)',
                        '💬 संवाद/पत्राचार की copy',
                        '📍 घटना/स्थान की जानकारी'
                    ],
                    'document_type': 'notice'
                }
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
        print(f"[DEBUG] process_user_input called with input: {user_input}")
        print(f"[DEBUG] conversation_history: {conversation_history}")
        
        # Determine current state based on conversation history
        current_state = self._determine_state(conversation_history)
        print(f"[DEBUG] Determined state: {current_state}")
        
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
        # First try exact match
        if selected_category in self.conversation_flow:
            flow = self.conversation_flow[selected_category]
            # Immediately ask first question
            first_question = flow['questions'][0]
            return {
                'category': selected_category,
                'message': flow['message'] + '\n\n' + first_question['label'],
                'question': first_question,
                'question_key': first_question['key'],
                'progress': f"1/{len(flow['questions'])} प्रश्न",
                'next_action': flow['next_action']
            }
        
        # Try to match from natural language input
        category_keywords = {
            'police_harassment': [
                'पुलिस', 'police', 'गिरफ्तारी', 'arrest', 'हिरासत', 'fir', 
                'मारपीट', 'torture', 'रिश्वत', 'bribe', 'बिना वारंट'
            ],
            'property_dispute': [
                'जमीन', 'land', 'संपत्ति', 'property', 'मकान', 'house', 
                'खेत', 'field', 'सीमा', 'boundary', 'मालिकाना', 'ownership',
                'किराया', 'rent', 'दुकान', 'shop'
            ],
            'family_matter': [
                'परिवार', 'family', 'शादी', 'marriage', 'तलाक', 'divorce',
                'पत्नी', 'wife', 'पति', 'husband', 'बच्चे', 'children',
                'विरासत', 'inheritance', 'दहेज', 'dowry'
            ],
            'labor_issue': [
                'नौकरी', 'job', 'मजदूरी', 'labor', 'वेतन', 'salary', 'पैसा', 'payment',
                'काम', 'work', 'निकाल', 'termination', 'मालिक', 'employer',
                'कर्मचारी', 'employee', 'छुट्टी', 'leave'
            ],
            'consumer_complaint': [
                'उपभोक्ता', 'consumer', 'खरीदारी', 'shopping', 'सामान', 'product',
                'दुकान', 'shop', 'सेवा', 'service', 'खराब', 'defective',
                'वारंटी', 'warranty', 'रिफंड', 'refund', 'ठगी', 'fraud'
            ],
            'others': [
                'अन्य', 'other', 'कुछ', 'something', 'और', 'else'
            ]
        }
        
        # Convert input to lowercase for matching
        input_lower = selected_category.lower()
        
        # Try to find best match
        max_matches = 0
        best_category = None
        
        for category, keywords in category_keywords.items():
            matches = sum(1 for keyword in keywords if keyword.lower() in input_lower)
            if matches > max_matches:
                max_matches = matches
                best_category = category
        
        # If we found a good match, use it
        if best_category and max_matches > 0:
            flow = self.conversation_flow[best_category]
            # Return category confirmation and ask first question
            first_question = flow['questions'][0]
            return {
                'category': best_category,
                'message': flow['message'] + '\n\n' + first_question['label'],
                'question': first_question,
                'question_key': first_question['key'],
                'progress': f"1/{len(flow['questions'])} प्रश्न",
                'next_action': flow['next_action']
            }
        
        # If no match, ask user to clarify
        return {
            'error': 'unclear_category',
            'message': 'मुझे समझ नहीं आया। कृपया इनमें से चुनें:\n\n' + 
                      '🚔 पुलिस की परेशानी के लिए "पुलिस" बोलें\n' +
                      '🏠 जमीन/संपत्ति के लिए "जमीन" या "संपत्ति" बोलें\n' +
                      '👨‍👩‍👧‍👦 परिवार के मामले के लिए "परिवार" बोलें\n' +
                      '💼 नौकरी/मजदूरी के लिए "नौकरी" या "मजदूरी" बोलें\n' +
                      '🛍️ उपभोक्ता शिकायत के लिए "उपभोक्ता" बोलें\n' +
                      '📋 कुछ और के लिए "अन्य" बोलें',
            'retry': True
        }

    def _handle_information_collection(self, category, user_input, history):
        """Collect and validate user information"""
        print(f"[DEBUG] _handle_information_collection called")
        print(f"[DEBUG] category: {category}")
        print(f"[DEBUG] user_input: {user_input}")
        print(f"[DEBUG] history length: {len(history)}")
        
        if category not in self.conversation_flow:
            return {'error': 'Invalid category'}
        
        flow = self.conversation_flow[category]
        questions = flow['questions']
        print(f"[DEBUG] Total questions for this category: {len(questions)}")
        
        # Find the last question that was asked by the bot
        last_question_key = None
        for msg in reversed(history):
            if msg.get('type') == 'bot_question' and msg.get('question_key'):
                last_question_key = msg.get('question_key')
                break
        
        print(f"[DEBUG] Last question key: {last_question_key}")
        
        # Count answers that have been stored with question keys
        answers_dict = {}
        for msg in history:
            if msg.get('type') == 'user_answer' and msg.get('question_key'):
                answers_dict[msg.get('question_key')] = msg.get('content')
        
        answered_count = len(answers_dict)
        print(f"[DEBUG] Answers collected so far: {answered_count}")
        print(f"[DEBUG] Answers dict: {answers_dict}")
        
        # Check if we just received an answer to the last question
        if last_question_key and last_question_key not in answers_dict:
            # This is an answer to the last question asked
            # Store it and move to next question
            answered_count += 1
            print(f"[DEBUG] This is an answer to the last question. New count: {answered_count}")
        
        if answered_count < len(questions):
            # More questions to ask
            next_question = questions[answered_count]
            print(f"[DEBUG] Asking next question: {next_question['key']}")
            return {
                'message': next_question['label'],
                'question': next_question,
                'question_key': next_question['key'],
                'progress': f"{answered_count + 1}/{len(questions)} प्रश्न"
            }
        else:
            # All questions answered, ready to generate document
            # Extract final data
            final_data = answers_dict.copy()
            if last_question_key and last_question_key not in final_data:
                final_data[last_question_key] = user_input
            
            print(f"[DEBUG] All questions answered! Final data: {final_data}")
            
            # Get suggestions for this category
            suggestions = flow.get('suggestions', {})
            steps = suggestions.get('steps', [])
            proofs = suggestions.get('proofs_needed', [])
            
            response_message = 'बहुत बढ़िया! मैंने आपकी समस्या समझ ली है।\n\n'
            response_message += '📋 आगे क्या करना है:\n' + '\n'.join(steps) + '\n\n'
            response_message += '📎 जरूरी सबूत/दस्तावेज़:\n' + '\n'.join(proofs)
            
            return {
                'message': response_message,
                'completed': True,
                'action': flow['next_action'],
                'data': final_data,
                'suggestions': suggestions
            }

    def _extract_conversation_data(self, history):
        """Extract structured data from conversation"""
        data = {}
        for msg in history:
            if msg.get('type') == 'user_answer' and msg.get('question_key'):
                data[msg.get('question_key')] = msg.get('content')
            elif msg.get('type') == 'user_input':
                # Fallback for old structure
                if msg.get('key'):
                    data[msg.get('key')] = msg.get('value') or msg.get('content')
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
