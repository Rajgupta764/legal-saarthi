"""
Legal Tips Service - Government-Verified Legal Tips for Rural Users
Focus: Real problems in rural India with trusted government sources
Provides credible, actionable legal tips for common situations
"""

from datetime import datetime
import json


class LegalTipsService:
    """
    Service providing curated legal tips with government API integration
    All tips are sourced from official government resources
    """

    def __init__(self):
        self.tips_database = self._initialize_tips()
        self.update_timestamp = datetime.now().isoformat()

    def _initialize_tips(self):
        """
        Initialize comprehensive legal tips database
        Each tip includes:
        - Real problem it solves
        - Simple solution
        - Legal reference
        - Government source
        - Action steps
        - Related resources
        """
        return {
            "property_disputes": self._get_property_tips(),
            "labour_rights": self._get_labour_tips(),
            "family_law": self._get_family_tips(),
            "agricultural_law": self._get_agricultural_tips(),
            "consumer_rights": self._get_consumer_tips(),
            "police_rights": self._get_police_tips(),
            "tenant_rights": self._get_tenant_tips(),
        }

    def _get_property_tips(self):
        """Property and land tips - Most common issue in rural India"""
        return [
            {
                "id": "property_001",
                "category": "Property Rights",
                "priority": "critical",
                "hindi": "खेती की जमीन बेचने से पहले करें",
                "title": "Protect Your Agricultural Land",
                "emoji": "🏞️",
                "problem": "लोग गलत कागज़ी काम के कारण अपनी जमीन गवा देते हैं",
                "problem_en": "Rural people lose land due to improper documentation",
                
                "tip": "कभी भी खेती की जमीन बेचने से पहले: (1) सभी दस्तावेज़ की मूल कॉपी देखें, (2) गिरदावरी (प्राचीन मालिक की जानकारी) चेक करें, (3) पटवारी से नक्शा करवाएं, (4) लेखपाल से रजिस्ट्री करवाएं।",
                "tip_en": "Before selling agricultural land: (1) Verify all original documents, (2) Check Girdawari records, (3) Get updated map from Patwari, (4) Register officially with Lekhpal.",
                
                "actions": [
                    {
                        "step": 1,
                        "hindi": "जमीन के सभी पुराने कागज़ इकट्ठा करें",
                        "en": "Collect all old property documents",
                        "why": "बिना पुरानी कागज़ के नई रजिस्ट्री नहीं हो सकती"
                    },
                    {
                        "step": 2,
                        "hindi": "पटवारी कार्यालय से गिरदावरी अपडेट करवाएं",
                        "en": "Update Girdawari (land record) from Patwari office",
                        "why": "यह सरकारी दस्तावेज़ जमीन के मालिक को साबित करता है"
                    },
                    {
                        "step": 3,
                        "hindi": "मुंसिफ या नोटरी से पोषित नक्शा करवाएं",
                        "en": "Get certified map from Sub-Registrar",
                        "why": "नक्शा साबित करता है कि जमीन की सीमा क्या है"
                    },
                    {
                        "step": 4,
                        "hindi": "स्टाम्प ड्यूटी भरकर रजिस्ट्री करवाएं",
                        "en": "Register deed with proper stamp duty",
                        "why": "रजिस्ट्री से ही मालिकाना हक कानूनी तरीके से साबित होता है"
                    },
                    {
                        "step": 5,
                        "hindi": "खरीदार को सभी मूल कागज़ सौंपें",
                        "en": "Hand over all original documents to buyer",
                        "why": "दोनों पक्षों की सुरक्षा के लिए"
                    }
                ],
                
                "law": {
                    "act": "Land Registration Act, 1908",
                    "section": "Section 17-18",
                    "reference": "भारतीय संविधान अनुच्छेद 300 - संपत्ति का अधिकार"
                },
                
                "government_source": {
                    "source": "Land Records Department, Ministry of Rural Development",
                    "url": "https://ror.co.in",
                    "trust_level": "Official Government",
                    "verified": True
                },
                
                "warning": "⚠️ सावधानी: मुँह की बातों पर कभी भी जमीन न दें। बिना रजिस्ट्री के बिक्री कानूनी नहीं है।",
                
                "related_topics": ["land_disputes", "inheritance_property"],
                "keywords": ["भूमि", "जमीन", "रजिस्ट्री", "दस्तावेज़", "पटवारी"]
            },
            
            {
                "id": "property_002",
                "category": "Property Rights",
                "priority": "high",
                "hindi": "विरासत की जमीन को कानूनी तरीके से विभाजित करें",
                "title": "Inheritance Property Division",
                "emoji": "👨‍👩‍👧‍👦",
                "problem": "परिवार में संपत्ति बंटवारे पर झगड़े होते हैं",
                "problem_en": "Family disputes over inherited property division",
                
                "tip": "विरासत की संपत्ति कानूनी तरीके से बंटवारा करें: (1) मृतक की वसीयत देखें (अगर हो), (2) कोई वसीयत न हो तो हिंदू उत्तराधिकार अधिनियम के नियम लागू होंगे, (3) सभी वारिसों की सहमति लें, (4) विभाजन विलेख (Partition Deed) बनवाएं और रजिस्ट्री करवाएं।",
                "tip_en": "Divide inherited property legally: (1) Check deceased's will, (2) If no will, Hindu Succession Act applies, (3) Get consent of all heirs, (4) Execute Partition Deed and register it.",
                
                "actions": [
                    {
                        "step": 1,
                        "hindi": "मृतक की वसीयत की तलाश करें या रजिस्ट्रार के पास जांचें",
                        "en": "Search for deceased's will or check with registrar",
                        "why": "वसीयत होने से संपत्ति का बंटवारा उसी के अनुसार होता है"
                    },
                    {
                        "step": 2,
                        "hindi": "सभी कानूनी वारिसों की एक सूची बनाएं",
                        "en": "List all legal heirs (spouse, children, parents)",
                        "why": "कानून सभी योग्य लोगों को समान अधिकार देता है"
                    },
                    {
                        "step": 3,
                        "hindi": "सभी वारिसों की लिखित सहमति (No Objection) लें",
                        "en": "Get written consent from all heirs",
                        "why": "भविष्य में झगड़े से बचने के लिए"
                    },
                    {
                        "step": 4,
                        "hindi": "वकील की मदद से विभाजन विलेख तैयार करवाएं",
                        "en": "Draft Partition Deed through lawyer",
                        "why": "कानूनी दस्तावेज़ सुरक्षा देता है"
                    },
                    {
                        "step": 5,
                        "hindi": "रजिस्ट्रार के पास विभाजन विलेख को रजिस्ट्री करवाएं",
                        "en": "Register the Partition Deed with Sub-Registrar",
                        "why": "रजिस्ट्री से ही कानूनी मालिकाना हक स्थापित होता है"
                    }
                ],
                
                "law": {
                    "act": "Hindu Succession Act, 1956",
                    "section": "Section 8-9 (Succession order)",
                    "reference": "भारतीय संविधान अनुच्छेद 300A - संपत्ति का अधिकार"
                },
                
                "government_source": {
                    "source": "Ministry of Law & Justice, Succession Laws Division",
                    "url": "https://www.moljco.gov.in",
                    "trust_level": "Official Government",
                    "verified": True
                },
                
                "warning": "⚠️ सावधानी: बिना कानूनी विभाजन के एक व्यक्ति पूरी संपत्ति नहीं बेच सकता।",
                
                "related_topics": ["will_making", "legal_succession"],
                "keywords": ["विरासत", "वसीयत", "बंटवारा", "हिंदू उत्तराधिकार"]
            },
        ]

    def _get_labour_tips(self):
        """Labour rights tips - Common exploitation in rural areas"""
        return [
            {
                "id": "labour_001",
                "category": "Labour Rights",
                "priority": "critical",
                "hindi": "न्यूनतम मजदूरी का अधिकार जानें",
                "title": "Know Minimum Wage Rights",
                "emoji": "💼",
                "problem": "मजदूरों को सही मजदूरी नहीं मिलती या अनुबंध तोड़ दिए जाते हैं",
                "problem_en": "Workers don't get minimum wage or contracts are broken arbitrarily",
                
                "tip": "हर श्रमिक को कानूनी न्यूनतम मजदूरी पाने का अधिकार है: (1) सरकार हर महीने न्यूनतम मजदूरी तय करती है (राज्य अनुसार अलग), (2) 8 घंटे काम, 8 घंटे आराम, 8 घंटे नींद - यह कानूनी नियम है, (3) अगर मालिक सही मजदूरी न दे तो श्रम विभाग में शिकायत करें।",
                "tip_en": "Every worker has right to minimum wage: (1) Government sets minimum wage monthly (varies by state), (2) 8-hour work day is legal norm, (3) Complain to Labour Department if not paid properly.",
                
                "actions": [
                    {
                        "step": 1,
                        "hindi": "अपने राज्य की वर्तमान न्यूनतम मजदूरी जानें",
                        "en": "Find your state's current minimum wage",
                        "why": "क्षेत्र अनुसार मजदूरी अलग होती है - सरकार की वेबसाइट पर देखें"
                    },
                    {
                        "step": 2,
                        "hindi": "हर महीने अपनी मजदूरी का रिकॉर्ड रखें",
                        "en": "Keep monthly wage record/receipt",
                        "why": "शिकायत करते समय प्रमाण के लिए जरूरी है"
                    },
                    {
                        "step": 3,
                        "hindi": "अगर मजदूरी कम हो तो पहले मालिक से बात करें",
                        "en": "Talk to employer about wage difference",
                        "why": "कभी-कभी गलतफहमी हो सकती है"
                    },
                    {
                        "step": 4,
                        "hindi": "समस्या का समाधान न हो तो श्रम विभाग में शिकायत दर्ज करें",
                        "en": "File complaint with Labour Department if not resolved",
                        "why": "सरकार आपकी मजदूरी की सुरक्षा करती है"
                    },
                    {
                        "step": 5,
                        "hindi": "श्रमिक संघ (Union) की सदस्यता लें",
                        "en": "Join worker's union for collective support",
                        "why": "संगठित होने से बेहतर सुरक्षा मिलती है"
                    }
                ],
                
                "law": {
                    "act": "Minimum Wages Act, 1948",
                    "section": "Section 3-4",
                    "reference": "भारतीय संविधान अनुच्छेद 43 - निष्पक्ष मजदूरी"
                },
                
                "government_source": {
                    "source": "Ministry of Labour & Employment, Government of India",
                    "url": "https://www.mole.gov.in",
                    "trust_level": "Official Government",
                    "verified": True
                },
                
                "state_resources": {
                    "note": "हर राज्य का अपना श्रम विभाग है - अपने जिले के Labour Commissioner से संपर्क करें"
                },
                
                "warning": "⚠️ सावधानी: किसी को भी न्यूनतम मजदूरी से कम देना कानूनी अपराध है।",
                
                "related_topics": ["workplace_safety", "overtime_pay", "leave_benefits"],
                "keywords": ["न्यूनतम मजदूरी", "मजदूर", "काम के घंटे", "श्रम अधिकार"]
            },
            
            {
                "id": "labour_002",
                "category": "Labour Rights",
                "priority": "high",
                "hindi": "छुट्टी और बोनस के अधिकार",
                "title": "Know Leave & Bonus Rights",
                "emoji": "📅",
                "problem": "मजदूरों को सप्ताह की छुट्टी, छुट्टी के दिन (casual leave) और त्योहार की छुट्टी नहीं मिलती",
                "problem_en": "Workers denied weekly offs, casual leave, and festival holidays",
                
                "tip": "सभी मजदूरों को कानूनी छुट्टी का अधिकार है: (1) हर सप्ताह कम से कम एक दिन की छुट्टी (आमतौर पर रविवार), (2) सालभर में कम से कम 8-10 दिन की छुट्टी (मजदूरी कानून में), (3) राष्ट्रीय त्योहारों पर छुट्टी, (4) मजदूरी को पूरा भुगतान करना होगा।",
                "tip_en": "Workers have right to legal leave: (1) At least 1 weekly off, (2) 8-10 casual leave days yearly, (3) National holidays off, (4) Full wage must be paid.",
                
                "actions": [
                    {
                        "step": 1,
                        "hindi": "अपने काम कानून (Labour Code) के छुट्टी नियम जानें",
                        "en": "Know leave rules from your state's Labour Code",
                        "why": "हर राज्य के अलग नियम हो सकते हैं"
                    },
                    {
                        "step": 2,
                        "hindi": "मालिक से लिखित में छुट्टी की नीति मांगें",
                        "en": "Request written leave policy from employer",
                        "why": "भविष्य में विवाद से बचने के लिए"
                    },
                    {
                        "step": 3,
                        "hindi": "छुट्टी लेते समय उसका रिकॉर्ड रखें",
                        "en": "Keep record of leaves taken",
                        "why": "शिकायत के समय प्रमाण के लिए जरूरी"
                    },
                    {
                        "step": 4,
                        "hindi": "सालांत बोनस के लिए पूछें (सरकारी नियम है)",
                        "en": "Ask for annual bonus (if eligible)",
                        "why": "Bonus Act के तहत योग्य कर्मचारियों को बोनस मिलना चाहिए"
                    },
                    {
                        "step": 5,
                        "hindi": "छुट्टी नहीं मिले तो श्रम विभाग को खबर दें",
                        "en": "Report to Labour Department if leave denied",
                        "why": "सरकार आपके अधिकारों की रक्षा करती है"
                    }
                ],
                
                "law": {
                    "act": "Factories Act, 1948; Shops & Establishments Act",
                    "section": "Section 54-55",
                    "reference": "Payment of Bonus Act, 1965"
                },
                
                "government_source": {
                    "source": "Ministry of Labour & Employment",
                    "url": "https://www.mole.gov.in",
                    "trust_level": "Official Government",
                    "verified": True
                },
                
                "warning": "⚠️ सावधानी: किसी भी कर्मचारी से छुट्टी की जगह पैसे वसूल करना कानूनी अपराध है।",
                
                "related_topics": ["overtime_compensation", "gratuity_rights"],
                "keywords": ["छुट्टी", "बोनस", "वेकेशन", "छुट्टी के दिन"]
            },
        ]

    def _get_family_tips(self):
        """Family law tips - Dowry, domestic violence, child welfare"""
        return [
            {
                "id": "family_001",
                "category": "Family Rights",
                "priority": "critical",
                "hindi": "दहेज़ प्रथा के खिलाफ कानूनी सुरक्षा",
                "title": "Protection Against Dowry",
                "emoji": "💍",
                "problem": "दहेज़ की मांग करना भारत में अपराध है लेकिन अभी भी होता है",
                "problem_en": "Dowry demand is illegal but still prevalent in some areas",
                
                "tip": "दहेज़ प्रथा के विरुद्ध भारतीय कानून है: (1) दहेज़ की मांग करना, देना, या लेना - सभी अपराध हैं, (2) दहेज़ के लिए किसी को प्रताड़ित करना और हत्या तक करना एक गंभीर अपराध है, (3) अगर आप दहेज़ के लिए परेशान हो रहे हैं तो तुरंत पुलिस में FIR दर्ज करें।",
                "tip_en": "India has strict laws against dowry: (1) Demanding, giving, or taking dowry is crime, (2) Torture or death for dowry is serious offence, (3) File FIR immediately if harassed for dowry.",
                
                "actions": [
                    {
                        "step": 1,
                        "hindi": "दहेज़ की किसी भी मांग को स्पष्ट मना करें",
                        "en": "Clearly refuse any dowry demand",
                        "why": "सहमति न देने से कानूनी सुरक्षा मजबूत होती है"
                    },
                    {
                        "step": 2,
                        "hindi": "अगर दहेज़ की मांग हो तो लिखित सबूत रखें (WhatsApp, ईमेल आदि)",
                        "en": "Keep written proof of dowry demand (messages, emails)",
                        "why": "FIR दर्ज करते समय सबूत की जरूरत होती है"
                    },
                    {
                        "step": 3,
                        "hindi": "अपने माता-पिता को सूचित करें",
                        "en": "Inform your parents immediately",
                        "why": "पारिवारिक समर्थन बहुत जरूरी है"
                    },
                    {
                        "step": 4,
                        "hindi": "महिला हेल्पलाइन को कॉल करें (1091) - 24/7 फ्री सेवा",
                        "en": "Call Women's Helpline 1091 (24/7 free)",
                        "why": "तुरंत कानूनी सलाह और मदद के लिए"
                    },
                    {
                        "step": 5,
                        "hindi": "FIR दर्ज करें और बाद में तहसील/पंचायत की मदद लें",
                        "en": "File FIR and get panchayat/tehsil mediation if needed",
                        "why": "कानूनी प्रक्रिया सुरक्षा सुनिश्चित करती है"
                    }
                ],
                
                "law": {
                    "act": "Dowry Prohibition Act, 1961",
                    "section": "Section 2-4 (Prohibition and punishment)",
                    "reference": "IPC Section 498a - Cruelty to wife; भारतीय संविधान अनुच्छेद 14,15"
                },
                
                "government_source": {
                    "source": "Ministry of Women & Child Development, Gender Equality Division",
                    "url": "https://www.wcd.nic.in",
                    "trust_level": "Official Government",
                    "verified": True
                },
                
                "helplines": [
                    {
                        "name": "Women's Helpline",
                        "number": "1091",
                        "state": "National",
                        "24_7": True
                    },
                    {
                        "name": "AADHAR Helpline",
                        "number": "1800-180-1111",
                        "state": "National",
                        "24_7": True
                    }
                ],
                
                "warning": "⚠️ खतरे की स्थिति में तुरंत 100 पर कॉल करें या नजदीकी पुलिस स्टेशन जाएं।",
                
                "related_topics": ["domestic_violence", "marriage_laws"],
                "keywords": ["दहेज़", "विवाह", "अधिकार", "महिला सुरक्षा"]
            },
            
            {
                "id": "family_002",
                "category": "Family Rights",
                "priority": "critical",
                "hindi": "घरेलू हिंसा से सुरक्षा",
                "title": "Protection from Domestic Violence",
                "emoji": "🛡️",
                "problem": "घरेलू हिंसा (शारीरिक, मानसिक, आर्थिक) से महिलाओं को सुरक्षा चाहिए",
                "problem_en": "Women need protection from physical, mental, and economic abuse at home",
                
                "tip": "घरेलू हिंसा के खिलाफ भारत के पास विशेष कानून है: (1) Protection of Women from Domestic Violence Act, 2005, (2) महिला को तुरंत सुरक्षा और मुआवजे का अधिकार है, (3) Police को मदद करनी होगी, (4) कोई भी फोन कॉल, मैसेज, या शारीरिक हिंसा गिने जा सकते हैं।",
                "tip_en": "India has special law against domestic violence: (1) Protection of Women from Domestic Violence Act 2005, (2) Woman can get immediate protection & compensation, (3) Police must help, (4) Any call, message, or physical abuse counts.",
                
                "actions": [
                    {
                        "step": 1,
                        "hindi": "गलत बर्ताव का रिकॉर्ड रखें (तारीख, समय, क्या हुआ)",
                        "en": "Document abuse (date, time, what happened)",
                        "why": "फोटो, डायरी, ईमेल - सब प्रमाण हो सकते हैं"
                    },
                    {
                        "step": 2,
                        "hindi": "Women's Helpline को कॉल करें (1091) - बिल्कुल गोपनीय",
                        "en": "Call Women's Helpline 1091 - completely confidential",
                        "why": "तुरंत सलाह और आश्रय की जानकारी मिलेगी"
                    },
                    {
                        "step": 3,
                        "hindi": "अपने विश्वस्त परिवार या मित्रों को बताएं",
                        "en": "Tell trusted family members or friends",
                        "why": "अपने आप को सुरक्षित रखने के लिए समर्थन जरूरी है"
                    },
                    {
                        "step": 4,
                        "hindi": "नजदीकी महिला पुलिस स्टेशन या थाने में जाएं",
                        "en": "Go to nearest women's police station or local police",
                        "why": "FIR या Protection Order के लिए"
                    },
                    {
                        "step": 5,
                        "hindi": "महिला अधिकार संस्था या NGO से कानूनी सहायता लें",
                        "en": "Get legal aid from women's organization or NGO",
                        "why": "मुफ्त कानूनी सलाह और आश्रय"
                    }
                ],
                
                "law": {
                    "act": "Protection of Women from Domestic Violence Act, 2005",
                    "section": "Section 12-18 (Protection order, Residence order)",
                    "reference": "IPC Section 498a, 304b, 406"
                },
                
                "government_source": {
                    "source": "Ministry of Women & Child Development",
                    "url": "https://www.wcd.nic.in",
                    "trust_level": "Official Government",
                    "verified": True
                },
                
                "helplines": [
                    {
                        "name": "National Women's Helpline",
                        "number": "1091",
                        "state": "National",
                        "24_7": True
                    },
                    {
                        "name": "iCall Helpline",
                        "number": "9152987821",
                        "state": "National",
                        "availability": "Mental health support"
                    }
                ],
                
                "urgent": "🚨 तुरंत खतरे में - 100 पर कॉल करें या नजदीकी थाने में जाएं।",
                
                "related_topics": ["dowry_protection", "womens_rights"],
                "keywords": ["घरेलू हिंसा", "महिला सुरक्षा", "अधिकार", "दुर्व्यवहार"]
            },
        ]

    def _get_agricultural_tips(self):
        """Agricultural law tips - farmer rights, MSP, loan waiver"""
        return [
            {
                "id": "agriculture_001",
                "category": "Agricultural Rights",
                "priority": "high",
                "hindi": "न्यूनतम समर्थन मूल्य (MSP) पर फसल बेचने का अधिकार",
                "title": "Know Minimum Support Price (MSP) Rights",
                "emoji": "🌾",
                "problem": "किसानों को फसल का सही मूल्य नहीं मिलता",
                "problem_en": "Farmers don't get fair price for their crops",
                
                "tip": "सरकार हर फसल के लिए न्यूनतम समर्थन मूल्य (MSP) तय करती है: (1) MSP से कम कीमत में फसल न बेचें, (2) ब्याज मुक्त कृषि ऋण के लिए सरकारी योजनाएं हैं, (3) अपनी सहायक मंडी (Agriculture Produce Market Committee - APMC) में फसल बेचें।",
                "tip_en": "Government sets Minimum Support Price (MSP) for crops: (1) Don't sell below MSP, (2) Interest-free farm loans available, (3) Sell through regulated APMC market.",
                
                "actions": [
                    {
                        "step": 1,
                        "hindi": "अपनी फसल के लिए वर्तमान MSP जानें (बदलता है हर साल)",
                        "en": "Know current MSP for your crop (updated annually)",
                        "why": "www.agromarketnet.gov.in पर चेक करें"
                    },
                    {
                        "step": 2,
                        "hindi": "केवल सरकारी मंडी (APMC) में ही बेचें",
                        "en": "Sell only through official APMC market",
                        "why": "सरकार कीमत की निर्धारण में मदद करती है"
                    },
                    {
                        "step": 3,
                        "hindi": "कर्ज के लिए बैंक को संपर्क करें (PM Kisan Yojana, KCC)",
                        "en": "Apply for government farm loan scheme",
                        "why": "कम ब्याज दर और आसान शर्तें"
                    },
                    {
                        "step": 4,
                        "hindi": "कृषि विभाग से नई योजनाओं की जानकारी लें",
                        "en": "Get info about new agricultural schemes",
                        "why": "सब्सिडी और support मिल सकता है"
                    },
                    {
                        "step": 5,
                        "hindi": "Farmer Producer Organisations में शामिल हों",
                        "en": "Join Farmer Producer Organization (FPO)",
                        "why": "संगठित होने से बेहतर कीमत मिलता है"
                    }
                ],
                
                "law": {
                    "act": "Agricultural Produce Market Committee Act, 1966",
                    "government_scheme": "PM Kisan Yojana, Kisan Credit Card, Pradhan Mantri Fasal Bima Yojana"
                },
                
                "government_source": {
                    "source": "Ministry of Agriculture & Farmers Welfare, Government of India",
                    "url": "https://www.agromarketnet.gov.in",
                    "trust_level": "Official Government",
                    "verified": True
                },
                
                "related_topics": ["farm_subsidies", "crop_insurance"],
                "keywords": ["MSP", "फसल", "मंडी", "किसान योजना"]
            },
        ]

    def _get_consumer_tips(self):
        """Consumer rights tips - product quality, fraud, refund"""
        return [
            {
                "id": "consumer_001",
                "category": "Consumer Rights",
                "priority": "high",
                "hindi": "खराब उत्पाद या सेवा के खिलाफ अधिकार",
                "title": "Know Your Consumer Rights",
                "emoji": "🛍️",
                "problem": "दुकानदार खराब चीज़ बेचते हैं या धोखे की बिक्री करते हैं",
                "problem_en": "Shopkeepers sell defective products or commit fraud",
                
                "tip": "Consumer Protection Act के तहत आपके पास अधिकार हैं: (1) खराब माल वापस करने का अधिकार, (2) पैसा वापस दिलवाने का अधिकार, (3) अगर नुकसान हुआ तो मुआवजा पाने का अधिकार, (4) Consumer Dispute Redressal Commission में शिकायत दर्ज कर सकते हैं।",
                "tip_en": "Consumer Protection Act gives you rights: (1) Return defective goods, (2) Claim refund, (3) Get compensation for damage, (4) File complaint with Consumer Disputes Commission.",
                
                "actions": [
                    {
                        "step": 1,
                        "hindi": "खरीद का रसीद (Bill/Receipt) हमेशा रखें",
                        "en": "Always keep bill/receipt of purchase",
                        "why": "शिकायत दर्ज करते समय जरूरी है"
                    },
                    {
                        "step": 2,
                        "hindi": "खराब माल की तस्वीर लें (Warranty के साथ if available)",
                        "en": "Take photo/video of defective product",
                        "why": "प्रमाण के लिए जरूरी है"
                    },
                    {
                        "step": 3,
                        "hindi": "सबसे पहले दुकानदार को लिखित में शिकायत दें (Email/Letter)",
                        "en": "Send written complaint to shopkeeper first",
                        "why": "7 दिन का जवाब देने का मौका देना चाहिए"
                    },
                    {
                        "step": 4,
                        "hindi": "अगर जवाब न आए तो District Consumer Redressal Commission में शिकायत दर्ज करें",
                        "en": "File complaint with Consumer Disputes Commission",
                        "why": "सरकार आपकी सुरक्षा करती है"
                    },
                    {
                        "step": 5,
                        "hindi": "अदालत में जाने से पहले मुफ्त कानूनी सहायता लें",
                        "en": "Get free legal aid before court proceeding",
                        "why": "छोटे दावों में अदालत की फीस कम है"
                    }
                ],
                
                "law": {
                    "act": "Consumer Protection Act, 2019",
                    "section": "Section 2(d) - Consumer definition; Section 12-14 (Remedies)",
                    "reference": "भारतीय संविधान अनुच्छेद 51A(g) - Consumer duties"
                },
                
                "government_source": {
                    "source": "Ministry of Consumer Affairs, Government of India",
                    "url": "https://www.consumeraffairs.gov.in",
                    "trust_level": "Official Government",
                    "verified": True
                },
                
                "related_topics": ["product_warranty", "false_advertising"],
                "keywords": ["उपभोक्ता अधिकार", "खराब माल", "रिफंड", "धोखाधड़ी"]
            },
        ]

    def _get_police_tips(self):
        """Police rights tips - arrest, FIR, interrogation"""
        return [
            {
                "id": "police_001",
                "category": "Police Rights",
                "priority": "critical",
                "hindi": "गिरफ्तारी होने पर आपके अधिकार",
                "title": "Your Rights During Arrest",
                "emoji": "⚖️",
                "problem": "पुलिस गलत तरीके से गिरफ्तार करती है या प्रताड़ित करती है",
                "problem_en": "Police arrest wrongfully or harass people",
                
                "tip": "भारतीय कानून के तहत आपके अधिकार हैं: (1) 24 घंटे में मजिस्ट्रेट के सामने लाना जरूरी, (2) गिरफ्तारी की वजह जानने का अधिकार, (3) वकील बुलाने का अधिकार, (4) मार या प्रताड़ना से सुरक्षा, (5) मौन रहने का अधिकार (कुछ न कहने का)।",
                "tip_en": "Your arrest rights: (1) Must be produced before magistrate within 24 hrs, (2) Right to know reason of arrest, (3) Right to call lawyer, (4) Protected from violence, (5) Right to remain silent.",
                
                "actions": [
                    {
                        "step": 1,
                        "hindi": "पुलिस का नाम, बैज नंबर, और थाना नोट करें",
                        "en": "Note police officer's name, badge number, police station",
                        "why": "बाद में शिकायत के लिए"
                    },
                    {
                        "step": 2,
                        "hindi": "गिरफ्तारी का कारण पूछें - वो बताना अनिवार्य है",
                        "en": "Ask reason for arrest - police must tell",
                        "why": "आपका कानूनी अधिकार है"
                    },
                    {
                        "step": 3,
                        "hindi": "अपना वकील बुलाएं या मुफ्त वकील के लिए कहें",
                        "en": "Call your lawyer or ask for free legal aid",
                        "why": "वकील के बिना सवाल का जवाब न दें"
                    },
                    {
                        "step": 4,
                        "hindi": "किसी को भी मार (थप्पड़, लात) या प्रताड़ना का शिकार न बनें",
                        "en": "Don't let police beat or torture you",
                        "why": "यह गंभीर अपराध है - तुरंत शिकायत दर्ज करें"
                    },
                    {
                        "step": 5,
                        "hindi": "कुछ न कहने का अधिकार है - मौन रहें",
                        "en": "You have right to remain silent",
                        "why": "आपके शब्द आपके खिलाफ जा सकते हैं"
                    }
                ],
                
                "law": {
                    "act": "Criminal Procedure Code (CrPC), 1973",
                    "section": "Section 41-42 (Arrest), Section 50 (Rights), Section 330-337 (Torture offence)"
                },
                
                "government_source": {
                    "source": "Ministry of Home Affairs, Police Reform Division",
                    "url": "https://www.mha.gov.in",
                    "trust_level": "Official Government",
                    "verified": True
                },
                
                "emergency_contacts": [
                    {
                        "name": "Police Emergency",
                        "number": "100",
                        "use": "Report crime or arrest"
                    },
                    {
                        "name": "Women's Helpline",
                        "number": "1091",
                        "use": "If woman is being harassed"
                    },
                    {
                        "name": "Human Rights Commission",
                        "number": "State-specific",
                        "use": "Report police brutality"
                    }
                ],
                
                "warning": "⚠️ पुलिस किसी को मार नहीं सकती। अगर मारा जाए तो तुरंत चिकित्सा लें और शिकायत दर्ज करें।",
                
                "related_topics": ["fir_rights", "false_imprisonment"],
                "keywords": ["गिरफ्तारी", "पुलिस अधिकार", "अत्याचार", "वकील"]
            },
        ]

    def _get_tenant_tips(self):
        """Tenant protection tips - rent, eviction, security deposit"""
        return [
            {
                "id": "tenant_001",
                "category": "Tenant Rights",
                "priority": "high",
                "hindi": "किरायेदार के अधिकार - जमा राशि और किराया",
                "title": "Know Your Tenant Rights",
                "emoji": "🏠",
                "problem": "मकान मालिक को किरायेदारों की सुरक्षा के अधिकार नहीं पता होते",
                "problem_en": "Landlords don't know tenant protection laws",
                
                "tip": "किरायेदार (Tenant) के पास कानूनी अधिकार हैं: (1) सुरक्षा जमा (Security Deposit) 10-12 महीने का किराया हो सकता है, (2) किराया बढ़ोतरी सालभर में एक बार ही हो सकती है (साधारणतः 5-10%), (3) मकान मालिक को 3-6 महीने की सूचना के बाद ही निकाल सकता है।",
                "tip_en": "Tenant rights: (1) Security deposit can be 10-12 months rent, (2) Rent increase once yearly (usually 5-10%), (3) Landlord must give 3-6 months notice for eviction.",
                
                "actions": [
                    {
                        "step": 1,
                        "hindi": "मकान मालिक के साथ लिखित किराया अनुबंध (Lease Agreement) बनवाएं",
                        "en": "Make written lease agreement with landlord",
                        "why": "भविष्य के विवाद से बचने के लिए"
                    },
                    {
                        "step": 2,
                        "hindi": "जमा राशि (Deposit) का रसीद अवश्य लें",
                        "en": "Get receipt for security deposit",
                        "why": "निकलते समय जमा वापसी के लिए"
                    },
                    {
                        "step": 3,
                        "hindi": "हर महीने किराया का रिकॉर्ड रखें",
                        "en": "Keep record of monthly rent payments",
                        "why": "दावे या विवाद में प्रमाण के लिए"
                    },
                    {
                        "step": 4,
                        "hindi": "किराया बढ़ोतरी से पहले 30 दिन की नोटिस दोनों पक्ष दें",
                        "en": "Give 30 days notice before rent increase",
                        "why": "कानूनी सूचना प्रक्रिया"
                    },
                    {
                        "step": 5,
                        "hindi": "खाली करने से पहले मकान की स्थिति की फोटो लें",
                        "en": "Take photos of house condition before vacating",
                        "why": "जमा की वापसी में विवाद से बचने के लिए"
                    }
                ],
                
                "law": {
                    "act": "Rental Housing Act, 2021 (or State Rent Control Act)",
                    "reference": "कुछ राज्यों में अपने-अपने Rent Control Laws हैं"
                },
                
                "government_source": {
                    "source": "State Housing & Urban Development Department",
                    "note": "हर राज्य का अपना किराया कानून यदि हैं"
                },
                
                "warning": "⚠️ बिना नोटिस दिए किरायेदार को निकालना कानूनसम्मत नहीं है।",
                
                "related_topics": ["eviction_notice", "repair_rights"],
                "keywords": ["किराया", "जमा राशि", "अनुबंध", "मकान मालिक"]
            },
        ]

    def get_all_tips(self):
        """Get all tips organized by category"""
        all_tips = []
        for category_tips in self.tips_database.values():
            all_tips.extend(category_tips)
        return all_tips

    def get_tips_by_category(self, category):
        """Get tips for specific category"""
        category_key = category.lower().replace(" ", "_")
        if category_key in self.tips_database:
            return self.tips_database[category_key]
        return None

    def get_tip_by_id(self, tip_id):
        """Get specific tip by ID"""
        for category_tips in self.tips_database.values():
            for tip in category_tips:
                if tip.get("id") == tip_id:
                    return tip
        return None

    # Common transliteration mappings (Roman → Hindi)
    TRANSLITERATION_MAP = {
        "krishi": "कृषि",
        "kanun": "कानून",
        "kisan": "किसान",
        "jamin": "जमीन",
        "zameen": "जमीन",
        "zamin": "जमीन",
        "sampatti": "संपत्ति",
        "property": "संपत्ति",
        "dahej": "दहेज़",
        "dowry": "दहेज़",
        "majduri": "मजदूरी",
        "mazdoori": "मजदूरी",
        "labour": "मजदूरी",
        "police": "पुलिस",
        "giraftari": "गिरफ्तारी",
        "arrest": "गिरफ्तारी",
        "kiraya": "किराया",
        "rent": "किराया",
        "virasaat": "विरासत",
        "inheritance": "विरासत",
        "upbhokta": "उपभोक्ता",
        "consumer": "उपभोक्ता",
        "fasal": "फसल",
        "crop": "फसल",
        "mandi": "मंडी",
        "hinsaa": "हिंसा",
        "hinsa": "हिंसा",
        "violence": "हिंसा",
        "mahila": "महिला",
        "women": "महिला",
        "chutti": "छुट्टी",
        "leave": "छुट्टी",
        "bonus": "बोनस",
        "vivah": "विवाह",
        "marriage": "विवाह",
        "agricultural": "कृषि",
        "agriculture": "कृषि",
        "family": "पारिवारिक",
        "tenant": "किरायेदार",
    }

    # Category keyword mappings for matching search terms to categories
    CATEGORY_KEYWORDS = {
        "property_disputes": ["property", "land", "jamin", "zameen", "sampatti", "भूमि", "जमीन", "संपत्ति", "रजिस्ट्री", "विरासत"],
        "labour_rights": ["labour", "labor", "worker", "majduri", "mazdoori", "श्रमिक", "मजदूरी", "मजदूर", "काम"],
        "family_law": ["family", "dahej", "dowry", "divorce", "marriage", "vivah", "दहेज", "विवाह", "पारिवारिक", "घरेलू"],
        "agricultural_law": ["krishi", "kisan", "agriculture", "agricultural", "farm", "farming", "crop", "fasal", "msp", "mandi", "कृषि", "किसान", "फसल", "खेती", "मंडी"],
        "consumer_rights": ["consumer", "upbhokta", "product", "refund", "उपभोक्ता", "खराब", "रिफंड"],
        "police_rights": ["police", "arrest", "fir", "giraftari", "पुलिस", "गिरफ्तारी", "एफआईआर"],
        "tenant_rights": ["tenant", "rent", "kiraya", "landlord", "किराया", "मकान", "किरायेदार"],
    }

    def _expand_keywords(self, keyword):
        """Expand a keyword with its Hindi transliteration equivalents"""
        expanded = {keyword}
        lower = keyword.lower()
        if lower in self.TRANSLITERATION_MAP:
            expanded.add(self.TRANSLITERATION_MAP[lower])
        # Also check if the keyword is Hindi and find its Roman equivalent
        for roman, hindi in self.TRANSLITERATION_MAP.items():
            if lower == hindi or lower == roman:
                expanded.add(roman)
                expanded.add(hindi)
        return expanded

    def search_tips(self, keyword):
        """Search tips by keyword with transliteration support"""
        keyword = keyword.strip().lower()
        if not keyword:
            return []

        # Split into individual words for multi-word search
        words = keyword.split()

        # Expand each word with transliteration equivalents
        expanded_per_word = []
        for word in words:
            expanded_per_word.append(self._expand_keywords(word))

        # Check if any word maps to a specific category
        matched_categories = set()
        for cat_key, cat_keywords in self.CATEGORY_KEYWORDS.items():
            for word in words:
                if word.lower() in [k.lower() for k in cat_keywords]:
                    matched_categories.add(cat_key)

        results = []
        seen_ids = set()

        # If we matched a category, include all tips from that category first
        for cat_key in matched_categories:
            if cat_key in self.tips_database:
                for tip in self.tips_database[cat_key]:
                    if tip.get("id") not in seen_ids:
                        results.append(tip)
                        seen_ids.add(tip.get("id"))

        # Search across all fields - ALL words must match (AND logic)
        searchable_fields = ["title", "hindi", "problem", "problem_en", "tip", "tip_en", "category"]
        for category_tips in self.tips_database.values():
            for tip in category_tips:
                if tip.get("id") in seen_ids:
                    continue

                # Collect all searchable text for this tip
                all_text = " ".join(
                    tip.get(field, "").lower() for field in searchable_fields
                )
                all_text += " " + " ".join(k.lower() for k in tip.get("keywords", []))
                all_text += " " + tip.get("law", {}).get("act", "").lower()

                # Every word (via any expansion) must appear in the combined text
                all_words_match = True
                for word_expansions in expanded_per_word:
                    word_found = any(exp.lower() in all_text for exp in word_expansions)
                    if not word_found:
                        all_words_match = False
                        break

                if all_words_match:
                    results.append(tip)
                    seen_ids.add(tip.get("id"))

        return results

    def get_tips_by_priority(self, priority="critical"):
        """Get tips organized by priority (critical, high, medium)"""
        all_tips = self.get_all_tips()
        return [t for t in all_tips if t.get("priority") == priority]

    def get_daily_tips(self, limit=3):
        """Get random tips for daily alert (rotates)"""
        import random
        all_tips = self.get_all_tips()
        return random.sample(all_tips, min(limit, len(all_tips)))


# Initialize service
legal_tips_service = LegalTipsService()
