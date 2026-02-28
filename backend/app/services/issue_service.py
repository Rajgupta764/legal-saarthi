"""
Issue Classification Service
Handles legal issue classification and guidance
"""

import re


class IssueService:
    """Service for classifying legal issues"""
    
    def __init__(self):
        # Keywords for issue classification
        self.issue_keywords = {
            'land_dispute': {
                'keywords': ['ज़मीन', 'जमीन', 'ज़मीन', 'जमीन', 'भूमि', 'खेत', 'प्लॉट', 'प्लाट',
                           'कब्ज़ा', 'कब्जा', 'कब्ज़े', 'कब्जे', 'दखल', 'दखला', 
                           'सीमा', 'बाउंड्री', 'पड़ोसी', 'पडोसी', 'पड़ोस',
                           'land', 'plot', 'boundary', 'encroachment', 'zameen', 'zamin',
                           'खसरा', 'खतौनी', 'रजिस्ट्री', 'registry', 'meri zameen', 'मेरी जमीन'],
                'name': 'भूमि विवाद',
                'relevantLaws': [
                    'भारतीय दंड संहिता (IPC) धारा 441 - आपराधिक अतिचार',
                    'भारतीय दंड संहिता (IPC) धारा 447 - भूमि पर अवैध प्रवेश',
                    'सिविल प्रक्रिया संहिता (CPC) - संपत्ति विवाद',
                    'राजस्व न्यायालय अधिनियम',
                    'भूमि अधिग्रहण अधिनियम, 2013'
                ],
                'steps': [
                    'सबसे पहले अपने ज़मीन के सभी कागज़ात इकट्ठा करें (खसरा, खतौनी, रजिस्ट्री)',
                    'पटवारी/लेखपाल से ज़मीन का नक्शा और रिकॉर्ड निकलवाएं',
                    'तहसीलदार कार्यालय में शिकायत दर्ज करें',
                    'जिला विधिक सेवा प्राधिकरण से मुफ्त कानूनी सलाह लें',
                    'यदि समाधान न हो तो सिविल कोर्ट में केस दायर करें'
                ],
                'documents': [
                    'खसरा-खतौनी की नकल',
                    'ज़मीन की रजिस्ट्री',
                    'नक्शा (Map)',
                    'पहचान पत्र (Aadhaar/Voter ID)',
                    'पुराने कागज़ात (यदि हों)'
                ],
                'nearbyOffices': [
                    {'name': 'तहसील कार्यालय', 'address': 'आपके जिले का तहसील भवन', 'timing': 'सोम-शनि: 10:00 AM - 5:00 PM'},
                    {'name': 'जिला विधिक सेवा प्राधिकरण', 'address': 'जिला न्यायालय परिसर', 'timing': 'सोम-शनि: 10:00 AM - 5:00 PM'},
                    {'name': 'राजस्व न्यायालय', 'address': 'कलेक्टर कार्यालय परिसर', 'timing': 'सोम-शनि: 10:30 AM - 4:30 PM'}
                ]
            },
            'family_dispute': {
                'keywords': ['पति', 'पत्नी', 'तलाक', 'divorce', 'शादी', 'marriage', 
                           'गुज़ारा', 'गुजारा', 'भरण-पोषण', 'भरण पोषण', 'maintenance', 'बच्चे', 'custody',
                           'परिवार', 'family', 'ससुराल', 'मायके', 'पिता', 'माता', 'बेटा', 'बेटी',
                           'विवाह', 'निकाह', 'पारिवारिक', 'विवाद'],
                'name': 'पारिवारिक विवाद',
                'relevantLaws': [
                    'हिंदू विवाह अधिनियम, 1955',
                    'हिंदू उत्तराधिकार अधिनियम, 1956',
                    'भरण-पोषण अधिनियम (CrPC धारा 125)',
                    'बाल विवाह निषेध अधिनियम, 2006',
                    'घरेलू हिंसा से महिला संरक्षण अधिनियम, 2005'
                ],
                'steps': [
                    'परिवार के बड़ों से बात करें',
                    'महिला हेल्पलाइन 181 पर कॉल करें',
                    'परिवार परामर्श केंद्र (Family Counselling Centre) जाएं',
                    'जिला विधिक सेवा प्राधिकरण से मदद लें',
                    'फैमिली कोर्ट में केस दायर करें'
                ],
                'documents': [
                    'शादी का प्रमाण पत्र',
                    'पहचान पत्र',
                    'आय प्रमाण पत्र',
                    'बच्चों के जन्म प्रमाण पत्र',
                    'फोटो और अन्य प्रमाण'
                ],
                'nearbyOffices': [
                    {'name': 'परिवार न्यायालय (Family Court)', 'address': 'जिला न्यायालय परिसर', 'timing': 'सोम-शनि: 10:00 AM - 4:30 PM'},
                    {'name': 'महिला एवं बाल विकास कार्यालय', 'address': 'जिला कलेक्टर कार्यालय', 'timing': 'सोम-शनि: 10:00 AM - 5:00 PM'},
                    {'name': 'परिवार परामर्श केंद्र', 'address': 'जिला मुख्यालय', 'timing': 'सोम-शनि: 9:00 AM - 5:00 PM'}
                ]
            },
            'domestic_violence': {
                'keywords': ['मारपीट', 'मार पीट', 'मारा', 'मारता', 'मारती', 'मारते', 'पीटा', 'पीटता', 'पीटते',
                           'हिंसा', 'violence', 'दहेज', 'dowry', 'प्रताड़ित', 'प्रताड़ना',
                           'धमकी', 'threat', 'ससुराल', 'घरेलू', 'घरेलु', 'domestic',
                           'पिटाई', 'पीटना', 'तंग करना', 'तंग', 'जलाना', 'जला',
                           'मार', 'पीट', 'सास', 'ससुर', 'देवर', 'ननद', '498A', '498a',
                           'पति मारता', 'पति मारते', 'ससुराल वाले', 'torture', 'cruelty'],
                'name': 'घरेलू हिंसा',
                'relevantLaws': [
                    'घरेलू हिंसा से महिला संरक्षण अधिनियम, 2005',
                    'भारतीय दंड संहिता (IPC) धारा 498A - क्रूरता',
                    'दहेज निषेध अधिनियम, 1961',
                    'IPC धारा 304B - दहेज हत्या',
                    'IPC धारा 323 - स्वेच्छापूर्वक चोट पहुंचाना'
                ],
                'steps': [
                    'तुरंत महिला हेल्पलाइन 181 या पुलिस 100 पर कॉल करें',
                    'नज़दीकी पुलिस स्टेशन में शिकायत दर्ज करें',
                    'महिला थाना या महिला आयोग से संपर्क करें',
                    'Protection Order के लिए आवेदन करें',
                    'One Stop Centre से मदद लें'
                ],
                'documents': [
                    'FIR की कॉपी',
                    'मेडिकल रिपोर्ट (यदि चोट हो)',
                    'पहचान पत्र',
                    'शादी का प्रमाण',
                    'फोटो/वीडियो प्रमाण (यदि हो)'
                ],
                'nearbyOffices': [
                    {'name': 'महिला थाना', 'address': 'जिला मुख्यालय', 'timing': '24x7 खुला'},
                    {'name': 'One Stop Centre (सखी केंद्र)', 'address': 'जिला अस्पताल परिसर', 'timing': '24x7 खुला'},
                    {'name': 'महिला आयोग कार्यालय', 'address': 'जिला कलेक्टर कार्यालय', 'timing': 'सोम-शनि: 10:00 AM - 5:00 PM'}
                ]
            },
            'consumer_complaint': {
                'keywords': ['धोखा', 'धोखाधड़ी', 'fraud', 'ठगी', 'ठग', 'प्रोडक्ट', 'product', 'सर्विस', 
                           'रिफंड', 'refund', 'खरीदारी', 'purchase', 'दुकान', 'कंपनी',
                           'consumer', 'complaint', 'उपभोक्ता', 'शिकायत', 'खराब', 'सामान', 
                           'ऑनलाइन', 'online', 'shopping', 'खरीद'],
                'name': 'उपभोक्ता शिकायत',
                'relevantLaws': [
                    'उपभोक्ता संरक्षण अधिनियम, 2019',
                    'भारतीय अनुबंध अधिनियम, 1872',
                    'वस्तु विक्रय अधिनियम, 1930',
                    'ई-कॉमर्स नियम, 2020',
                    'भारतीय दंड संहिता धारा 420 - धोखाधड़ी'
                ],
                'steps': [
                    'विक्रेता/कंपनी को लिखित शिकायत दें',
                    'शिकायत का प्रमाण रखें (ईमेल/पत्र)',
                    'उपभोक्ता हेल्पलाइन 1800-11-4000 पर कॉल करें',
                    'consumerhelpline.gov.in पर ऑनलाइन शिकायत करें',
                    'जिला उपभोक्ता फोरम में केस दायर करें'
                ],
                'documents': [
                    'खरीदारी का बिल/रसीद',
                    'वारंटी कार्ड',
                    'उत्पाद की फोटो',
                    'शिकायत पत्र की कॉपी',
                    'बैंक स्टेटमेंट (यदि ऑनलाइन पेमेंट हो)'
                ],
                'nearbyOffices': [
                    {'name': 'जिला उपभोक्ता फोरम', 'address': 'कलेक्टर कार्यालय परिसर', 'timing': 'सोम-शनि: 10:30 AM - 4:30 PM'},
                    {'name': 'उपभोक्ता मामले विभाग', 'address': 'जिला कार्यालय', 'timing': 'सोम-शुक्र: 10:00 AM - 5:00 PM'}
                ]
            },
            'employment_issue': {
                'keywords': ['नौकरी', 'job', 'वेतन', 'तनख्वाह', 'salary', 'निकाला', 'fired', 
                           'ऑफिस', 'कंपनी', 'बॉस', 'PF', 'provident', 'EPF', 'EPFO',
                           'रोजगार', 'रोज़गार', 'employment', 'work', 'काम', 'कर्मचारी',
                           'सैलरी', 'पेमेंट', 'payment', 'भुगतान'],
                'name': 'रोज़गार संबंधी',
                'relevantLaws': [
                    'औद्योगिक विवाद अधिनियम, 1947',
                    'न्यूनतम वेतन अधिनियम, 1948',
                    'कर्मचारी भविष्य निधि अधिनियम, 1952',
                    'बोनस भुगतान अधिनियम, 1965',
                    'वेतन संहिता, 2019'
                ],
                'steps': [
                    'HR विभाग में लिखित शिकायत दें',
                    'सभी पत्राचार का रिकॉर्ड रखें',
                    'श्रम विभाग (Labour Department) में शिकायत करें',
                    'श्रम न्यायालय में केस दायर करें',
                    'वकील से सलाह लें'
                ],
                'documents': [
                    'नियुक्ति पत्र (Appointment Letter)',
                    'सैलरी स्लिप',
                    'PF स्टेटमेंट',
                    'शिकायत पत्र की कॉपी',
                    'ईमेल/मैसेज का प्रिंट'
                ],
                'nearbyOffices': [
                    {'name': 'श्रम कार्यालय', 'address': 'जिला उद्योग भवन', 'timing': 'सोम-शुक्र: 10:00 AM - 5:00 PM'},
                    {'name': 'श्रम न्यायालय', 'address': 'जिला न्यायालय परिसर', 'timing': 'सोम-शनि: 10:30 AM - 4:30 PM'},
                    {'name': 'EPFO कार्यालय', 'address': 'क्षेत्रीय EPFO भवन', 'timing': 'सोम-शुक्र: 9:30 AM - 5:30 PM'}
                ]
            },
            'police_complaint': {
                'keywords': ['चोरी', 'theft', 'लूट', 'robbery', 'धमकी', 'FIR', 'एफआईआर',
                           'पुलिस', 'police', 'अपराध', 'crime', 'हमला', 'attack', 'थाना',
                           'शिकायत', 'complaint', 'रिपोर्ट', 'report', 'मारपीट', 'गुम'],
                'name': 'पुलिस शिकायत',
                'relevantLaws': [
                    'भारतीय दंड संहिता (IPC)',
                    'दंड प्रक्रिया संहिता (CrPC)',
                    'IPC धारा 379 - चोरी',
                    'IPC धारा 392 - लूट',
                    'IPC धारा 506 - आपराधिक धमकी'
                ],
                'steps': [
                    'तुरंत नज़दीकी पुलिस स्टेशन जाएं या 100 डायल करें',
                    'FIR दर्ज करवाएं और कॉपी लें',
                    'यदि FIR न लिखी जाए तो SP/DM को लिखें',
                    'ऑनलाइन FIR: cfrms.police.gov.in',
                    'FIR की कॉपी सुरक्षित रखें'
                ],
                'documents': [
                    'पहचान पत्र',
                    'घटना का विवरण',
                    'गवाहों की जानकारी',
                    'फोटो/वीडियो प्रमाण',
                    'मेडिकल रिपोर्ट (यदि चोट हो)'
                ],
                'nearbyOffices': [
                    {'name': 'नज़दीकी थाना', 'address': 'आपके क्षेत्र का पुलिस स्टेशन', 'timing': '24x7 खुला'},
                    {'name': 'SP कार्यालय', 'address': 'जिला पुलिस मुख्यालय', 'timing': 'सोम-शनि: 10:00 AM - 5:00 PM'},
                    {'name': 'साइबर सेल', 'address': 'जिला पुलिस मुख्यालय', 'timing': 'सोम-शनि: 10:00 AM - 6:00 PM'}
                ]
            },
            'rti_application': {
                'keywords': ['RTI', 'आरटीआई', 'आर टी आई', 'सूचना', 'information', 'जानकारी', 
                           'सरकारी', 'government', 'विभाग', 'department', 'सूचना का अधिकार',
                           'right to information'],
                'name': 'RTI आवेदन',
                'relevantLaws': [
                    'सूचना का अधिकार अधिनियम, 2005',
                    'RTI नियम, 2012',
                    'केंद्रीय सूचना आयोग नियम'
                ],
                'steps': [
                    'जिस जानकारी की ज़रूरत है उसे स्पष्ट लिखें',
                    'संबंधित विभाग का PIO (Public Information Officer) पता करें',
                    'RTI आवेदन लिखें (सादे कागज़ पर भी हो सकता है)',
                    '₹10 का पोस्टल ऑर्डर या कोर्ट फीस स्टांप लगाएं',
                    'आवेदन जमा करें और रसीद लें'
                ],
                'documents': [
                    'RTI आवेदन पत्र',
                    '₹10 का शुल्क',
                    'पहचान पत्र की कॉपी',
                    'BPL होने पर शुल्क माफ़ी के लिए प्रमाण'
                ],
                'nearbyOffices': [
                    {'name': 'जिला सूचना अधिकारी कार्यालय', 'address': 'कलेक्टर कार्यालय', 'timing': 'सोम-शुक्र: 10:00 AM - 5:00 PM'},
                    {'name': 'जन सुविधा केंद्र (CSC)', 'address': 'आपके गांव/ब्लॉक में', 'timing': 'सोम-शनि: 9:00 AM - 6:00 PM'}
                ]
            },
            'cyber_crime': {
                'keywords': ['साइबर', 'cyber', 'ऑनलाइन', 'online', 'हैक', 'hack', 'फ़िशिंग', 'phishing',
                           'फ्रॉड', 'OTP', 'बैंक खाता', 'bank account', 'पैसे कट', 'UPI', 'गूगल पे',
                           'फोन पे', 'पेटीएम', 'सोशल मीडिया', 'फेसबुक', 'इंस्टाग्राम', 'व्हाट्सएप',
                           'whatsapp', 'facebook', 'instagram', 'fake id', 'धमकी online', 'ब्लैकमेल'],
                'name': 'साइबर अपराध',
                'relevantLaws': [
                    'सूचना प्रौद्योगिकी अधिनियम, 2000',
                    'IT Act धारा 66 - कंप्यूटर संबंधित अपराध',
                    'IT Act धारा 66A - आपत्तिजनक संदेश',
                    'IT Act धारा 66C - पहचान की चोरी',
                    'IT Act धारा 66D - कंप्यूटर से धोखाधड़ी',
                    'IPC धारा 420 - धोखाधड़ी'
                ],
                'steps': [
                    'तुरंत बैंक को कॉल करके खाता फ्रीज़ करवाएं',
                    'साइबर हेल्पलाइन 1930 पर कॉल करें',
                    'cybercrime.gov.in पर ऑनलाइन शिकायत करें',
                    'नज़दीकी पुलिस स्टेशन में FIR दर्ज करें',
                    'सभी स्क्रीनशॉट और प्रमाण सुरक्षित रखें'
                ],
                'documents': [
                    'बैंक स्टेटमेंट',
                    'ट्रांजैक्शन की डिटेल',
                    'स्क्रीनशॉट/चैट का प्रिंट',
                    'पहचान पत्र',
                    'मोबाइल नंबर जिससे ठगी हुई'
                ],
                'nearbyOffices': [
                    {'name': 'साइबर क्राइम सेल', 'address': 'जिला पुलिस मुख्यालय', 'timing': 'सोम-शनि: 10:00 AM - 6:00 PM'},
                    {'name': 'नज़दीकी थाना', 'address': 'आपके क्षेत्र का पुलिस स्टेशन', 'timing': '24x7 खुला'}
                ]
            },
            'property_inheritance': {
                'keywords': ['वसीयत', 'will', 'जायदाद', 'संपत्ति', 'property', 'inheritance', 'उत्तराधिकार',
                           'बंटवारा', 'partition', 'हिस्सा', 'share', 'विरासत', 'मृत्यु प्रमाण पत्र',
                           'पैतृक', 'पुश्तैनी', 'ancestral', 'मरने के बाद', 'पिता की संपत्ति',
                           'मृत्यु', 'death', 'मरने', 'गुज़रने', 'गुजरने', 'स्वर्गवास',
                           'माता-पिता', 'दादा', 'दादी', 'नाना', 'नानी', 'विभाजन',
                           'heir', 'legal heir', 'successor', 'succession'],
                'name': 'संपत्ति उत्तराधिकार',
                'relevantLaws': [
                    'हिंदू उत्तराधिकार अधिनियम, 1956',
                    'भारतीय उत्तराधिकार अधिनियम, 1925',
                    'हिंदू संयुक्त परिवार संपत्ति कानून',
                    'उत्तराधिकार संशोधन अधिनियम, 2005',
                    'ट्रांसफर ऑफ प्रॉपर्टी एक्ट, 1882'
                ],
                'steps': [
                    'मृत्यु प्रमाण पत्र प्राप्त करें',
                    'संपत्ति के सभी दस्तावेज़ इकट्ठा करें',
                    'कानूनी उत्तराधिकारियों की सूची बनाएं',
                    'उत्तराधिकार प्रमाण पत्र के लिए आवेदन करें',
                    'म्यूटेशन (नामांतरण) करवाएं'
                ],
                'documents': [
                    'मृत्यु प्रमाण पत्र',
                    'संपत्ति के कागज़ात',
                    'राशन कार्ड/परिवार रजिस्टर',
                    'पहचान पत्र',
                    'वसीयत (यदि हो)'
                ],
                'nearbyOffices': [
                    {'name': 'तहसील कार्यालय', 'address': 'तहसील भवन', 'timing': 'सोम-शनि: 10:00 AM - 5:00 PM'},
                    {'name': 'सब-रजिस्ट्रार कार्यालय', 'address': 'जिला मुख्यालय', 'timing': 'सोम-शनि: 10:00 AM - 4:00 PM'},
                    {'name': 'सिविल कोर्ट', 'address': 'जिला न्यायालय परिसर', 'timing': 'सोम-शनि: 10:00 AM - 4:30 PM'}
                ]
            }
        }
        
        # Default category
        self.default_category = {
            'name': 'सामान्य कानूनी मामला',
            'relevantLaws': [
                'भारतीय दंड संहिता (IPC)',
                'दंड प्रक्रिया संहिता (CrPC)',
                'सिविल प्रक्रिया संहिता (CPC)'
            ],
            'steps': [
                'अपनी समस्या को विस्तार से लिखें',
                'संबंधित सभी कागज़ात इकट्ठा करें',
                'जिला विधिक सेवा प्राधिकरण से मुफ्त सलाह लें',
                'वकील से परामर्श करें',
                'उचित मंच पर शिकायत/केस दायर करें'
            ],
            'documents': [
                'पहचान पत्र',
                'समस्या से संबंधित कागज़ात',
                'फोटो/वीडियो प्रमाण (यदि हो)',
                'गवाहों की जानकारी'
            ],
            'nearbyOffices': [
                {'name': 'जिला विधिक सेवा प्राधिकरण', 'address': 'जिला न्यायालय परिसर', 'timing': 'सोम-शनि: 10:00 AM - 5:00 PM'},
                {'name': 'तहसील कार्यालय', 'address': 'तहसील भवन', 'timing': 'सोम-शनि: 10:00 AM - 5:00 PM'}
            ]
        }
    
    def classify_issue(self, text):
        """
        Classify legal issue from text
        Returns category, steps, and required documents
        """
        # Keep original text for Hindi keyword matching
        text_for_match = text.lower()  # For English keywords
        text_original = text  # For Hindi keywords
        
        # Find best matching category
        best_match = None
        best_score = 0
        
        for category, data in self.issue_keywords.items():
            score = 0
            for keyword in data['keywords']:
                # Check if keyword exists in text (case-insensitive for English, direct for Hindi)
                if keyword.lower() in text_for_match or keyword in text_original:
                    score += 1
            if score > best_score:
                best_score = score
                best_match = category
        
        # Use default if no match found
        if best_match and best_score > 0:
            matched_data = self.issue_keywords[best_match]
            return {
                'category': best_match,
                'categoryName': matched_data['name'],
                'confidence': min(best_score * 20, 95),  # Mock confidence score
                'relevantLaws': matched_data.get('relevantLaws', []),
                'steps': matched_data['steps'],
                'documents': matched_data['documents'],
                'helplines': self._get_helplines(best_match),
                'nearbyOffices': matched_data.get('nearbyOffices', []),
                'message': f"आपकी समस्या '{matched_data['name']}' श्रेणी में आती है।"
            }
        else:
            return {
                'category': 'general',
                'categoryName': self.default_category['name'],
                'confidence': 50,
                'relevantLaws': self.default_category.get('relevantLaws', []),
                'steps': self.default_category['steps'],
                'documents': self.default_category['documents'],
                'helplines': self._get_helplines('general'),
                'nearbyOffices': self.default_category.get('nearbyOffices', []),
                'message': 'आपकी समस्या का विश्लेषण किया गया है। कृपया नीचे दिए गए सुझाव देखें।'
            }
    
    def _get_helplines(self, category):
        """Get relevant helplines for a category"""
        helplines = {
            'land_dispute': [
                {'name': 'राजस्व विभाग', 'number': '1800-180-7777'},
                {'name': 'जिला विधिक सेवा', 'number': '15100'}
            ],
            'family_dispute': [
                {'name': 'महिला हेल्पलाइन', 'number': '181'},
                {'name': 'परिवार परामर्श', 'number': '1800-599-0019'}
            ],
            'domestic_violence': [
                {'name': 'महिला हेल्पलाइन', 'number': '181'},
                {'name': 'पुलिस', 'number': '100'},
                {'name': 'महिला आयोग', 'number': '7827-170-170'}
            ],
            'consumer_complaint': [
                {'name': 'उपभोक्ता हेल्पलाइन', 'number': '1800-11-4000'},
                {'name': 'NCH', 'number': '14404'}
            ],
            'employment_issue': [
                {'name': 'श्रम हेल्पलाइन', 'number': '14434'},
                {'name': 'EPFO', 'number': '1800-118-005'}
            ],
            'police_complaint': [
                {'name': 'पुलिस', 'number': '100'},
                {'name': 'महिला हेल्पलाइन', 'number': '181'}
            ],
            'rti_application': [
                {'name': 'RTI हेल्पलाइन', 'number': '1800-110-001'}
            ],
            'cyber_crime': [
                {'name': 'साइबर क्राइम हेल्पलाइन', 'number': '1930'},
                {'name': 'पुलिस', 'number': '100'}
            ],
            'property_inheritance': [
                {'name': 'जिला विधिक सेवा', 'number': '15100'},
                {'name': 'राजस्व विभाग', 'number': '1800-180-7777'}
            ],
            'general': [
                {'name': 'विधिक सेवा', 'number': '15100'},
                {'name': 'पुलिस', 'number': '100'}
            ]
        }
        
        return helplines.get(category, helplines['general'])
