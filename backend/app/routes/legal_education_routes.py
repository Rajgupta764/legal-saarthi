"""
Legal Education Routes - Fear Removal Mode
Provides accurate legal information in simple language
"""

from flask import Blueprint, request, jsonify
from app.services.legal_education_service import LegalEducationService

legal_education_bp = Blueprint('legal_education', __name__)
legal_service = LegalEducationService()


@legal_education_bp.route('/all-topics', methods=['GET'])
def get_all_topics():
    """
    Get all legal education topics
    
    Response:
    {
        "police_powers": { ... },
        "user_rights": { ... },
        "fir_information": { ... },
        ...
    }
    """
    return jsonify({
        "success": True,
        "data": legal_service.get_all_content()
    }), 200


@legal_education_bp.route('/topic/<topic_name>', methods=['GET'])
def get_topic(topic_name):
    """
    Get content for a specific legal education topic
    
    Topics:
    - police_powers: Police Kya Kar Sakti Hai (What police can do)
    - user_rights: Aapke Rights Kya Hain (Your rights)
    - fir_information: FIR darz karne ka haq (Right to file FIR)
    - arrest_rights: Giraftari ke dauran adhikaar (Rights during arrest)
    - interrogation_rights: Police poochtaachh adhikaar (Rights during questioning)
    - bail_information: Jamant (Bail)
    
    Response:
    {
        "title": "...",
        "titleEn": "...",
        "summary": "...",
        "sections": [
            {
                "heading": "...",
                "points": [ ... ]
            }
        ]
    }
    """
    content = legal_service.get_content_by_topic(topic_name)
    
    if content is None:
        return jsonify({
            "success": False,
            "error": "Topic not found",
            "available_topics": [
                "police_powers",
                "user_rights",
                "fir_information",
                "arrest_rights",
                "interrogation_rights",
                "bail_information"
            ]
        }), 404
    
    return jsonify({
        "success": True,
        "topic": topic_name,
        "data": content
    }), 200


@legal_education_bp.route('/search', methods=['POST'])
def search_legal_info():
    """
    Search legal education content by keyword
    
    Request JSON:
    {
        "keyword": "police"
    }
    
    Response:
    {
        "success": true,
        "keyword": "police",
        "results": [
            {
                "topic": "police_powers",
                "content": { ... }
            },
            ...
        ],
        "count": 3
    }
    """
    data = request.get_json() or {}
    keyword = data.get('keyword', '').strip()
    
    if not keyword:
        return jsonify({
            "success": False,
            "error": "Keyword is required"
        }), 400
    
    results = legal_service.search_content(keyword)
    
    return jsonify({
        "success": True,
        "keyword": keyword,
        "result_count": len(results),
        "results": results
    }), 200


@legal_education_bp.route('/fear-removal-mode', methods=['GET'])
def fear_removal_mode():
    """
    Main Fear Removal Mode - Overview of all features
    
    This is the main endpoint for the Legal Fear Removal Mode feature.
    It provides a structured overview of all available legal information.
    
    Response includes:
    - Police powers and limitations
    - User rights
    - How to file FIR
    - Rights during arrest
    - Rights during interrogation
    - Bail information
    """
    modes = {
        "title": "⚖️ Legal Fear Removal Mode - आपकी कानूनी जानकारी",
        "titleEn": "⚖️ Legal Fear Removal Mode - Your Legal Information",
        "description": "यहाँ आप साधारण भाषा में जान सकते हैं कि पुलिस क्या कर सकती है, आपके अधिकार क्या हैं, और FIR कैसे दर्ज करते हैं।",
        "descriptionEn": "Learn in simple language what police can do, what are your rights, and how to file FIR.",
        "features": [
            {
                "id": "police_powers",
                "icon": "👮",
                "title": "Police Kya Kar Sakti Hai",
                "titleHi": "पुलिस क्या कर सकती है",
                "description": "पुलिस की शक्तियों और सीमाओं को समझें",
                "descriptionEn": "Understand police powers and limitations",
                "link": "/api/legal-education/topic/police_powers"
            },
            {
                "id": "user_rights",
                "icon": "🛡️",
                "title": "Your Rights - Aapke Adhikaar",
                "titleHi": "आपके अधिकार",
                "description": "आपके मौलिक और कानूनी अधिकार",
                "descriptionEn": "Your fundamental and legal rights",
                "link": "/api/legal-education/topic/user_rights"
            },
            {
                "id": "fir_information",
                "icon": "📋",
                "title": "File FIR - FIR Darz Karna",
                "titleHi": "FIR दर्ज करना",
                "description": "FIR क्या है और कैसे दर्ज करते हैं",
                "descriptionEn": "What is FIR and how to file it",
                "link": "/api/legal-education/topic/fir_information"
            },
            {
                "id": "arrest_rights",
                "icon": "🚔",
                "title": "During Arrest - Giraftari Ke Dauran",
                "titleHi": "गिरफ्तारी के दौरान",
                "description": "गिरफ्तारी के दौरान आपके अधिकार",
                "descriptionEn": "Your rights during arrest",
                "link": "/api/legal-education/topic/arrest_rights"
            },
            {
                "id": "interrogation_rights",
                "icon": "❓",
                "title": "Police Questioning - Poochtaachh",
                "titleHi": "पुलिस पूछताछ",
                "description": "पुलिस के सवालों के जवाब देते समय अपने अधिकार",
                "descriptionEn": "Your rights when police questions you",
                "link": "/api/legal-education/topic/interrogation_rights"
            },
            {
                "id": "bail_information",
                "icon": "🔓",
                "title": "Bail - Jamnat",
                "titleHi": "जमानत",
                "description": "जेल से बाहर आने का तरीका",
                "descriptionEn": "How to get released from jail",
                "link": "/api/legal-education/topic/bail_information"
            }
        ],
        "disclaimer": {
            "title": "महत्वपूर्ण नोट",
            "titleEn": "Important Notice",
            "text": "यह जानकारी सामान्य शिक्षा के लिए है। कानूनी राय के लिए किसी योग्य वकील से मिलें।",
            "textEn": "This information is for general education only. Consult a qualified lawyer for legal advice.",
            "legalBasis": "Based on Indian Constitution, Police Act 1861, CrPC 1973, and IPC 1860"
        }
    }
    
    return jsonify({
        "success": True,
        "data": modes
    }), 200


@legal_education_bp.route('/common-questions', methods=['GET'])
def common_questions():
    """
    FAQ - Frequently asked questions about legal rights
    """
    faqs = {
        "title": "आम सवालों के जवाब",
        "titleEn": "Frequently Asked Questions",
        "questions": [
            {
                "question": "क्या अगर मैं पुलिस को कुछ बताना नहीं चाहता तो?",
                "questionEn": "What if I don't want to tell police anything?",
                "answer": "आप अपने अधिकार का प्रयोग कर सकते हैं और चुप रह सकते हैं। लेकिन यह संदेह बढ़ा सकता है। वकील की सलाह लें।",
                "answerEn": "You can exercise your right to silence. But it may raise suspicion. Consult a lawyer.",
                "law": "Article 20(3) CrPC"
            },
            {
                "question": "क्या 24 घंटे में जमानत मिल जाएगी?",
                "questionEn": "Will I get bail within 24 hours?",
                "answer": "24 घंटे में आपको मजिस्ट्रेट के सामने लाना जरूरी है। मजिस्ट्रेट अपराध की गंभीरता के अनुसार जमानत देने का फैसला करेंगे।",
                "answerEn": "You must be presented before magistrate within 24 hrs. Magistrate decides bail based on crime severity.",
                "law": "CrPC Section 67, 437"
            },
            {
                "question": "अगर पुलिस गलत जानकारी दे तो?",
                "questionEn": "What if police gives wrong information?",
                "answer": "आप अपील के माध्यम से शिकायत कर सकते हैं या उच्च न्यायालय में याचिका दे सकते हैं।",
                "answerEn": "You can file a complaint or petition to high court.",
                "law": "Article 32, 226 Constitution"
            },
            {
                "question": "क्या मेरे परिवार को मेरी गिरफ्तारी के बारे में बताना चाहिए?",
                "questionEn": "Should police inform my family about arrest?",
                "answer": "हाँ, आपके परिवार को तुरंत सूचित किया जाना चाहिए। यह आपका अधिकार है।",
                "answerEn": "Yes, your family should be notified immediately. This is your right.",
                "law": "CrPC Section 50"
            },
            {
                "question": "क्या FIR दर्ज करने के लिए पुलिस को रिश्वत देनी चाहिए?",
                "questionEn": "Should I bribe police to file FIR?",
                "answer": "नहीं। FIR दर्ज करना आपका अधिकार है। पुलिस को रिश्वत न दें। रिश्वत देना भी गलत है।",
                "answerEn": "No. Filing FIR is your right. Don't bribe. Giving bribe is also wrong.",
                "law": "CrPC Section 154, PC Act"
            },
            {
                "question": "अगर पुलिस मेरी पूछताछ के दौरान मारपीट करे?",
                "questionEn": "If police beats me during interrogation?",
                "answer": "तुरंत डॉक्टरी जांच कराएं और लिखित शिकायत दर्ज करें। आप मुआवजे के लिए अदालत जा सकते हैं।",
                "answerEn": "Get medical examination immediately and file written complaint. You can claim compensation.",
                "law": "IPC Section 330, 347"
            }
        ],
        "note": "अगर आपको किसी विशेष मामले में कानूनी सलाह चाहिए तो किसी योग्य वकील से मिलें।",
        "noteEn": "For specific legal advice, consult a qualified lawyer."
    }
    
    return jsonify({
        "success": True,
        "data": faqs
    }), 200
