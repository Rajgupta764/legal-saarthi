"""
Government Scheme Matching Service
Matches user profile to government schemes using rule-based matching.
Schemes stored in MongoDB for easy updates without code changes.
Falls back to built-in schemes if DB is unavailable.
"""

import logging
from datetime import datetime
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class MatchResult:
    scheme_id: str
    name: str
    name_hi: str
    description: str
    description_hi: str
    eligibility: str
    eligibility_hi: str
    matched: bool
    score: int
    reasons: list
    reasons_hi: list
    next_steps: list
    next_steps_hi: list
    documents: list
    documents_hi: list
    category: str
    ministry: str
    portal_url: str


# ────────────────────────────────────────────────────────────────
#  Comprehensive built-in schemes database (real Indian schemes)
# ────────────────────────────────────────────────────────────────

BUILTIN_SCHEMES = [
    # ── Agriculture & Farmer Welfare ──
    {
        "id": "pm_kisan",
        "name": "PM-KISAN Samman Nidhi",
        "name_hi": "पीएम-किसान सम्मान निधि",
        "description": "Direct income support of ₹6,000/year in three installments to small and marginal farmer families.",
        "description_hi": "छोटे और सीमांत किसान परिवारों को ₹6,000/वर्ष तीन किस्तों में सीधे आय सहायता।",
        "eligibility": "All landholding farmer families with cultivable land. Excludes institutional landholders, income-tax payers, and government employees.",
        "eligibility_hi": "खेती योग्य भूमि वाले सभी किसान परिवार। संस्थागत भूमिधारक, आयकर दाता और सरकारी कर्मचारी शामिल नहीं।",
        "category": "agriculture",
        "tags": ["farmer", "kisan", "income", "land", "small", "marginal"],
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "portal_url": "https://pmkisan.gov.in",
        "next_steps": [
            "Visit pmkisan.gov.in or local agriculture office",
            "Register with Aadhaar, land records, and bank details",
        ],
        "next_steps_hi": [
            "pmkisan.gov.in या स्थानीय कृषि कार्यालय जाएं",
            "आधार, भूमि रिकॉर्ड और बैंक विवरण के साथ पंजीकरण करें",
        ],
        "documents": ["Aadhaar Card", "Land ownership record", "Bank account (linked to Aadhaar)"],
        "documents_hi": ["आधार कार्ड", "भूमि स्वामित्व रिकॉर्ड", "बैंक खाता (आधार से लिंक)"],
        "match_rules": {"needs_land": True, "max_land_ha": 2.0},
    },
    {
        "id": "pmfby",
        "name": "PM Fasal Bima Yojana (PMFBY)",
        "name_hi": "प्रधानमंत्री फसल बीमा योजना",
        "description": "Crop insurance scheme providing financial support to farmers suffering crop loss due to natural calamities, pests, or diseases.",
        "description_hi": "प्राकृतिक आपदाओं, कीटों या बीमारियों से फसल नुकसान झेलने वाले किसानों को वित्तीय सहायता देने वाली फसल बीमा योजना।",
        "eligibility": "All farmers growing notified crops in notified areas. Both loanee and non-loanee farmers eligible.",
        "eligibility_hi": "अधिसूचित क्षेत्रों में अधिसूचित फसल उगाने वाले सभी किसान। ऋणी और गैर-ऋणी दोनों किसान पात्र।",
        "category": "agriculture",
        "tags": ["farmer", "crop", "insurance", "fasal", "bima", "disaster"],
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "portal_url": "https://pmfby.gov.in",
        "next_steps": [
            "Check notified crops for your area on pmfby.gov.in",
            "Enroll through your bank or local agriculture department before the deadline",
        ],
        "next_steps_hi": [
            "pmfby.gov.in पर अपने क्षेत्र की अधिसूचित फसलें देखें",
            "समय सीमा से पहले बैंक या स्थानीय कृषि विभाग से नामांकन करें",
        ],
        "documents": ["Land record or tenancy proof", "Bank account details", "Aadhaar Card"],
        "documents_hi": ["भूमि रिकॉर्ड या किरायेदारी प्रमाण", "बैंक खाता विवरण", "आधार कार्ड"],
        "match_rules": {"needs_land": True},
    },
    {
        "id": "kcc",
        "name": "Kisan Credit Card (KCC)",
        "name_hi": "किसान क्रेडिट कार्ड (KCC)",
        "description": "Provides farmers with affordable short-term credit for crop production, post-harvest expenses, and allied activities at 4% interest.",
        "description_hi": "किसानों को फसल उत्पादन, कटाई के बाद के खर्च और संबद्ध गतिविधियों के लिए 4% ब्याज पर किफायती अल्पकालिक ऋण।",
        "eligibility": "All farmers – individual/joint borrowers who are owner cultivators, tenant farmers, sharecroppers, or SHGs.",
        "eligibility_hi": "सभी किसान – व्यक्तिगत/संयुक्त उधारकर्ता जो स्वयं खेती करने वाले, काश्तकार, बटाईदार या SHG हैं।",
        "category": "agriculture",
        "tags": ["farmer", "credit", "loan", "kisan", "bank", "kcc"],
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "portal_url": "https://www.pmkisan.gov.in/kcc",
        "next_steps": [
            "Apply at your nearest bank branch (any public/private/cooperative bank)",
            "Fill KCC application form with land documents",
        ],
        "next_steps_hi": [
            "नजदीकी बैंक शाखा में आवेदन करें (कोई भी सार्वजनिक/निजी/सहकारी बैंक)",
            "भूमि दस्तावेजों के साथ KCC आवेदन फॉर्म भरें",
        ],
        "documents": ["Land ownership/tenancy record", "ID proof (Aadhaar)", "Passport-size photos", "Bank account"],
        "documents_hi": ["भूमि स्वामित्व/किरायेदारी रिकॉर्ड", "पहचान प्रमाण (आधार)", "पासपोर्ट साइज फोटो", "बैंक खाता"],
        "match_rules": {"needs_land": True},
    },
    {
        "id": "soil_health_card",
        "name": "Soil Health Card Scheme",
        "name_hi": "मृदा स्वास्थ्य कार्ड योजना",
        "description": "Free soil testing and health card with crop-wise nutrient recommendations to improve productivity and reduce fertilizer costs.",
        "description_hi": "उत्पादकता बढ़ाने और उर्वरक लागत कम करने के लिए फसलवार पोषक तत्वों की सिफारिशों के साथ मुफ्त मिट्टी परीक्षण और स्वास्थ्य कार्ड।",
        "eligibility": "All farmers across India can get their soil tested free of cost.",
        "eligibility_hi": "भारत भर के सभी किसान मुफ्त में अपनी मिट्टी की जांच करवा सकते हैं।",
        "category": "agriculture",
        "tags": ["farmer", "soil", "testing", "fertilizer", "agriculture"],
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "portal_url": "https://soilhealth.dac.gov.in",
        "next_steps": [
            "Visit soilhealth.dac.gov.in to check your soil card",
            "Contact Krishi Vigyan Kendra (KVK) or block agriculture office",
        ],
        "next_steps_hi": [
            "soilhealth.dac.gov.in पर अपना मृदा कार्ड देखें",
            "कृषि विज्ञान केंद्र (KVK) या ब्लॉक कृषि कार्यालय से संपर्क करें",
        ],
        "documents": ["Aadhaar Card", "Land details"],
        "documents_hi": ["आधार कार्ड", "भूमि विवरण"],
        "match_rules": {"needs_land": True},
    },

    # ── Employment & Income Support ──
    {
        "id": "mgnrega",
        "name": "MGNREGA (100 Days Work Guarantee)",
        "name_hi": "मनरेगा (100 दिन काम की गारंटी)",
        "description": "Guarantees 100 days of wage employment per year to every rural household. Minimum wage paid within 15 days.",
        "description_hi": "हर ग्रामीण परिवार को प्रति वर्ष 100 दिन मजदूरी रोजगार की गारंटी। 15 दिनों के भीतर न्यूनतम मजदूरी का भुगतान।",
        "eligibility": "Any adult member of a rural household willing to do unskilled manual work. Must have Job Card.",
        "eligibility_hi": "ग्रामीण परिवार का कोई भी वयस्क सदस्य जो अकुशल शारीरिक काम करने को तैयार है। जॉब कार्ड होना जरूरी।",
        "category": "employment",
        "tags": ["rural", "employment", "job", "labour", "wage", "work", "mazdoor", "garib"],
        "ministry": "Ministry of Rural Development",
        "portal_url": "https://nrega.nic.in",
        "next_steps": [
            "Apply for Job Card at Gram Panchayat",
            "Request work in writing – work must be given within 15 days",
            "Check work status at nrega.nic.in",
        ],
        "next_steps_hi": [
            "ग्राम पंचायत में जॉब कार्ड के लिए आवेदन करें",
            "लिखित में काम की मांग करें – 15 दिनों में काम देना अनिवार्य",
            "nrega.nic.in पर काम की स्थिति देखें",
        ],
        "documents": ["Aadhaar Card", "Photograph", "Bank/Post office account"],
        "documents_hi": ["आधार कार्ड", "फोटो", "बैंक/डाकघर खाता"],
        "match_rules": {"max_income": 300000, "is_rural": True},
    },

    # ── Housing ──
    {
        "id": "pmay_g",
        "name": "PM Awas Yojana – Gramin (PMAY-G)",
        "name_hi": "प्रधानमंत्री आवास योजना – ग्रामीण",
        "description": "Financial assistance of ₹1.20 lakh (plain) / ₹1.30 lakh (hilly) to build pucca house for rural homeless families.",
        "description_hi": "ग्रामीण बेघर परिवारों को पक्का मकान बनाने के लिए ₹1.20 लाख (मैदानी) / ₹1.30 लाख (पहाड़ी) वित्तीय सहायता।",
        "eligibility": "Houseless families or those living in kutcha/dilapidated houses. Selected from SECC 2011 data and verified by Gram Sabha.",
        "eligibility_hi": "बेघर परिवार या कच्चे/जीर्ण-शीर्ण मकान में रहने वाले। SECC 2011 डेटा से चयनित और ग्राम सभा द्वारा सत्यापित।",
        "category": "housing",
        "tags": ["house", "home", "awas", "housing", "rural", "bpl", "garib"],
        "ministry": "Ministry of Rural Development",
        "portal_url": "https://pmayg.nic.in",
        "next_steps": [
            "Check your name in PMAY-G beneficiary list at pmayg.nic.in",
            "Contact Gram Panchayat or Block Development Office",
        ],
        "next_steps_hi": [
            "pmayg.nic.in पर PMAY-G लाभार्थी सूची में अपना नाम जांचें",
            "ग्राम पंचायत या ब्लॉक विकास कार्यालय से संपर्क करें",
        ],
        "documents": ["Aadhaar Card", "SECC/BPL list inclusion", "Bank account", "Photograph"],
        "documents_hi": ["आधार कार्ड", "SECC/BPL सूची में शामिल", "बैंक खाता", "फोटो"],
        "match_rules": {"max_income": 300000, "is_rural": True},
    },

    # ── Legal Aid ──
    {
        "id": "free_legal_aid",
        "name": "Free Legal Aid (NALSA/DLSA)",
        "name_hi": "मुफ्त विधिक सहायता (NALSA/DLSA)",
        "description": "Free legal services including lawyer, court fees, and documentation for eligible persons under Legal Services Authorities Act.",
        "description_hi": "विधिक सेवा प्राधिकरण अधिनियम के तहत पात्र व्यक्तियों को वकील, कोर्ट फीस और दस्तावेजीकरण सहित मुफ्त कानूनी सेवाएं।",
        "eligibility": "SC/ST members, women/children, disabled, industrial workmen, victims of disasters, persons in custody, persons with annual income < ₹3 lakh.",
        "eligibility_hi": "SC/ST सदस्य, महिलाएं/बच्चे, दिव्यांग, औद्योगिक श्रमिक, आपदा पीड़ित, हिरासत में व्यक्ति, वार्षिक आय < ₹3 लाख वाले व्यक्ति।",
        "category": "legal",
        "tags": ["legal", "aid", "lawyer", "court", "free", "nalsa", "dlsa", "kanun", "vakil"],
        "ministry": "Ministry of Law & Justice / NALSA",
        "portal_url": "https://nalsa.gov.in",
        "next_steps": [
            "Contact District Legal Services Authority (DLSA) in your district court",
            "Call NALSA helpline 15100 (toll-free)",
            "Visit nalsa.gov.in for nearest legal aid center",
        ],
        "next_steps_hi": [
            "अपने जिला न्यायालय में जिला विधिक सेवा प्राधिकरण (DLSA) से संपर्क करें",
            "NALSA हेल्पलाइन 15100 (टोल-फ्री) पर कॉल करें",
            "nalsa.gov.in पर निकटतम कानूनी सहायता केंद्र खोजें",
        ],
        "documents": ["ID proof", "Income certificate (if available)", "Case details"],
        "documents_hi": ["पहचान प्रमाण", "आय प्रमाण पत्र (यदि उपलब्ध)", "मामले का विवरण"],
        "match_rules": {"max_income": 300000, "categories": ["sc", "st", "obc", "woman", "disability", "minority"]},
    },

    # ── Women & Child ──
    {
        "id": "ujjwala",
        "name": "PM Ujjwala Yojana",
        "name_hi": "प्रधानमंत्री उज्ज्वला योजना",
        "description": "Free LPG connection with first refill and stove to BPL women to replace unhealthy cooking fuels.",
        "description_hi": "अस्वास्थ्यकर खाना पकाने के ईंधन की जगह BPL महिलाओं को पहली रिफिल और चूल्हे के साथ मुफ्त LPG कनेक्शन।",
        "eligibility": "Women from BPL households. Priority to SC/ST, forest dwellers, most backward classes, tea/ex-tea garden tribes, and island dwellers.",
        "eligibility_hi": "BPL परिवारों की महिलाएं। SC/ST, वनवासी, अत्यंत पिछड़ा वर्ग, चाय बागान जनजाति और द्वीपवासियों को प्राथमिकता।",
        "category": "women",
        "tags": ["women", "mahila", "lpg", "gas", "cooking", "bpl", "garib"],
        "ministry": "Ministry of Petroleum & Natural Gas",
        "portal_url": "https://www.pmujjwalayojana.com",
        "next_steps": [
            "Visit nearest LPG distributor with documents",
            "Apply online at pmujjwalayojana.com",
        ],
        "next_steps_hi": [
            "दस्तावेजों के साथ निकटतम LPG वितरक के पास जाएं",
            "pmujjwalayojana.com पर ऑनलाइन आवेदन करें",
        ],
        "documents": ["Aadhaar Card", "BPL ration card", "Bank account", "Photograph"],
        "documents_hi": ["आधार कार्ड", "BPL राशन कार्ड", "बैंक खाता", "फोटो"],
        "match_rules": {"max_income": 200000, "categories": ["woman"]},
    },
    {
        "id": "sukanya_samriddhi",
        "name": "Sukanya Samriddhi Yojana",
        "name_hi": "सुकन्या समृद्धि योजना",
        "description": "High-interest savings scheme for girl child (up to 10 years). Tax-free returns with government-backed safety.",
        "description_hi": "बालिकाओं (10 वर्ष तक) के लिए उच्च ब्याज बचत योजना। सरकार समर्थित सुरक्षा के साथ कर-मुक्त रिटर्न।",
        "eligibility": "Parents/legal guardian of a girl child below 10 years of age. Maximum 2 accounts (one per girl child).",
        "eligibility_hi": "10 वर्ष से कम उम्र की बालिका के माता-पिता/कानूनी अभिभावक। अधिकतम 2 खाते (एक बालिका के लिए एक)।",
        "category": "women",
        "tags": ["girl", "child", "saving", "women", "education", "marriage", "beti"],
        "ministry": "Ministry of Finance",
        "portal_url": "https://www.nsiindia.gov.in",
        "next_steps": [
            "Open account at any post office or authorized bank",
            "Minimum deposit ₹250/year, maximum ₹1.5 lakh/year",
        ],
        "next_steps_hi": [
            "किसी भी डाकघर या अधिकृत बैंक में खाता खोलें",
            "न्यूनतम जमा ₹250/वर्ष, अधिकतम ₹1.5 लाख/वर्ष",
        ],
        "documents": ["Birth certificate of girl child", "Parent's Aadhaar & ID", "Address proof"],
        "documents_hi": ["बालिका का जन्म प्रमाण पत्र", "माता-पिता का आधार और पहचान पत्र", "पता प्रमाण"],
        "match_rules": {"categories": ["woman"]},
    },

    # ── Health ──
    {
        "id": "ayushman_bharat",
        "name": "Ayushman Bharat (PM-JAY)",
        "name_hi": "आयुष्मान भारत (पीएम-जेएवाई)",
        "description": "Health insurance of ₹5 lakh per family per year for secondary and tertiary hospitalization. Cashless treatment at empanelled hospitals.",
        "description_hi": "माध्यमिक और तृतीयक अस्पताल भर्ती के लिए प्रति परिवार ₹5 लाख/वर्ष का स्वास्थ्य बीमा। सूचीबद्ध अस्पतालों में कैशलेस इलाज।",
        "eligibility": "Deprived rural families (SECC 2011) and identified occupational categories. Automatic inclusion for MGNREGA workers, BPL families.",
        "eligibility_hi": "वंचित ग्रामीण परिवार (SECC 2011) और चिन्हित व्यावसायिक श्रेणियां। मनरेगा श्रमिकों, BPL परिवारों का स्वचालित समावेश।",
        "category": "health",
        "tags": ["health", "hospital", "insurance", "medical", "swasthya", "treatment", "bpl", "garib"],
        "ministry": "Ministry of Health & Family Welfare",
        "portal_url": "https://pmjay.gov.in",
        "next_steps": [
            "Check eligibility at mera.pmjay.gov.in with Aadhaar/ration card number",
            "Call 14555 (Ayushman Bharat helpline)",
            "Visit nearest Ayushman Mitra at empanelled hospital",
        ],
        "next_steps_hi": [
            "mera.pmjay.gov.in पर आधार/राशन कार्ड नंबर से पात्रता की जांच करें",
            "14555 (आयुष्मान भारत हेल्पलाइन) पर कॉल करें",
            "सूचीबद्ध अस्पताल में निकटतम आयुष्मान मित्र से मिलें",
        ],
        "documents": ["Aadhaar Card", "Ration card", "SECC/BPL inclusion proof"],
        "documents_hi": ["आधार कार्ड", "राशन कार्ड", "SECC/BPL समावेश प्रमाण"],
        "match_rules": {"max_income": 500000, "is_rural": True},
    },

    # ── Education & Skill ──
    {
        "id": "scholarship_sc_st",
        "name": "Pre/Post Matric Scholarship (SC/ST/OBC)",
        "name_hi": "प्री/पोस्ट मैट्रिक छात्रवृत्ति (SC/ST/OBC)",
        "description": "Scholarships covering tuition, maintenance, and exam fees for SC/ST/OBC students from Class 9 onwards.",
        "description_hi": "कक्षा 9 से SC/ST/OBC छात्रों के लिए ट्यूशन, रखरखाव और परीक्षा शुल्क कवर करने वाली छात्रवृत्तियां।",
        "eligibility": "SC/ST/OBC students with family income below ₹2.5 lakh/year (SC/ST) or ₹1 lakh/year (OBC). Must be studying in Class 9 or above.",
        "eligibility_hi": "₹2.5 लाख/वर्ष (SC/ST) या ₹1 लाख/वर्ष (OBC) से कम पारिवारिक आय वाले SC/ST/OBC छात्र। कक्षा 9 या ऊपर में पढ़ना जरूरी।",
        "category": "education",
        "tags": ["education", "scholarship", "student", "sc", "st", "obc", "school", "college"],
        "ministry": "Ministry of Social Justice / Ministry of Tribal Affairs",
        "portal_url": "https://scholarships.gov.in",
        "next_steps": [
            "Apply on National Scholarship Portal (scholarships.gov.in)",
            "Contact school/college for institutional verification",
        ],
        "next_steps_hi": [
            "राष्ट्रीय छात्रवृत्ति पोर्टल (scholarships.gov.in) पर आवेदन करें",
            "संस्थागत सत्यापन के लिए स्कूल/कॉलेज से संपर्क करें",
        ],
        "documents": ["Caste certificate", "Income certificate", "Previous marksheet", "Aadhaar", "Bank account"],
        "documents_hi": ["जाति प्रमाण पत्र", "आय प्रमाण पत्र", "पिछली अंकसूची", "आधार", "बैंक खाता"],
        "match_rules": {"max_income": 250000, "categories": ["sc", "st", "obc"]},
    },

    # ── Social Security ──
    {
        "id": "old_age_pension",
        "name": "National Old Age Pension (IGNOAPS)",
        "name_hi": "राष्ट्रीय वृद्धावस्था पेंशन (IGNOAPS)",
        "description": "Monthly pension of ₹200-₹500 for BPL senior citizens aged 60+. States add their own contribution.",
        "description_hi": "60+ आयु के BPL वरिष्ठ नागरिकों को ₹200-₹500 मासिक पेंशन। राज्य अपना अंशदान अलग से जोड़ते हैं।",
        "eligibility": "Indian citizens aged 60+ years living below poverty line (BPL).",
        "eligibility_hi": "गरीबी रेखा से नीचे (BPL) रहने वाले 60+ वर्ष के भारतीय नागरिक।",
        "category": "social_security",
        "tags": ["pension", "old", "senior", "age", "elderly", "bpl", "garib"],
        "ministry": "Ministry of Rural Development",
        "portal_url": "https://nsap.nic.in",
        "next_steps": [
            "Apply through Gram Panchayat or Block Development Office",
            "Check status at nsap.nic.in",
        ],
        "next_steps_hi": [
            "ग्राम पंचायत या ब्लॉक विकास कार्यालय के माध्यम से आवेदन करें",
            "nsap.nic.in पर स्थिति जांचें",
        ],
        "documents": ["Age proof", "BPL certificate/Ration card", "Aadhaar Card", "Bank account"],
        "documents_hi": ["आयु प्रमाण", "BPL प्रमाण/राशन कार्ड", "आधार कार्ड", "बैंक खाता"],
        "match_rules": {"max_income": 200000},
    },
    {
        "id": "widow_pension",
        "name": "National Widow Pension (IGNWPS)",
        "name_hi": "राष्ट्रीय विधवा पेंशन (IGNWPS)",
        "description": "Monthly pension for BPL widows aged 40-79 years. ₹300/month from central government plus state share.",
        "description_hi": "40-79 वर्ष की BPL विधवाओं के लिए मासिक पेंशन। केंद्र सरकार से ₹300/माह साथ में राज्य का हिस्सा।",
        "eligibility": "Widows aged 40-79 years belonging to BPL households.",
        "eligibility_hi": "BPL परिवारों से संबंधित 40-79 वर्ष की विधवाएं।",
        "category": "social_security",
        "tags": ["widow", "pension", "women", "mahila", "vidhwa", "bpl"],
        "ministry": "Ministry of Rural Development",
        "portal_url": "https://nsap.nic.in",
        "next_steps": [
            "Apply at Gram Panchayat or Block Development Office",
            "Submit husband's death certificate and BPL proof",
        ],
        "next_steps_hi": [
            "ग्राम पंचायत या ब्लॉक विकास कार्यालय में आवेदन करें",
            "पति का मृत्यु प्रमाण पत्र और BPL प्रमाण जमा करें",
        ],
        "documents": ["Death certificate of husband", "Age proof", "BPL card", "Aadhaar", "Bank account"],
        "documents_hi": ["पति का मृत्यु प्रमाण पत्र", "आयु प्रमाण", "BPL कार्ड", "आधार", "बैंक खाता"],
        "match_rules": {"max_income": 200000, "categories": ["woman"]},
    },
    {
        "id": "disability_pension",
        "name": "Disability Pension (IGNDPS)",
        "name_hi": "दिव्यांग पेंशन (IGNDPS)",
        "description": "Monthly pension for BPL persons with 80%+ disability aged 18-79 years. ₹300/month plus state contribution.",
        "description_hi": "18-79 वर्ष आयु के 80%+ दिव्यांगता वाले BPL व्यक्तियों के लिए मासिक पेंशन। ₹300/माह साथ में राज्य का अंशदान।",
        "eligibility": "Persons with 80%+ disability aged 18-79 years from BPL families.",
        "eligibility_hi": "BPL परिवारों से 18-79 वर्ष आयु के 80%+ दिव्यांगता वाले व्यक्ति।",
        "category": "social_security",
        "tags": ["disability", "divyang", "handicap", "pension", "bpl"],
        "ministry": "Ministry of Rural Development",
        "portal_url": "https://nsap.nic.in",
        "next_steps": [
            "Apply through Gram Panchayat or Block Office",
            "Get disability certificate from District Hospital",
        ],
        "next_steps_hi": [
            "ग्राम पंचायत या ब्लॉक कार्यालय से आवेदन करें",
            "जिला अस्पताल से दिव्यांगता प्रमाण पत्र प्राप्त करें",
        ],
        "documents": ["Disability certificate (80%+)", "Age proof", "BPL card", "Aadhaar", "Bank account"],
        "documents_hi": ["दिव्यांगता प्रमाण पत्र (80%+)", "आयु प्रमाण", "BPL कार्ड", "आधार", "बैंक खाता"],
        "match_rules": {"max_income": 200000, "categories": ["disability"]},
    },

    # ── Financial Inclusion ──
    {
        "id": "jan_dhan",
        "name": "PM Jan Dhan Yojana",
        "name_hi": "प्रधानमंत्री जन धन योजना",
        "description": "Zero-balance bank account with free RuPay debit card, ₹2 lakh accident insurance, and ₹30,000 life cover.",
        "description_hi": "शून्य बैलेंस बैंक खाता, मुफ्त RuPay डेबिट कार्ड, ₹2 लाख दुर्घटना बीमा और ₹30,000 जीवन बीमा।",
        "eligibility": "Any Indian citizen (10+ years) without a bank account.",
        "eligibility_hi": "बिना बैंक खाते वाला कोई भी भारतीय नागरिक (10+ वर्ष)।",
        "category": "financial",
        "tags": ["bank", "account", "insurance", "financial", "garib", "rural"],
        "ministry": "Ministry of Finance",
        "portal_url": "https://pmjdy.gov.in",
        "next_steps": [
            "Visit any bank branch or Bank Mitra (banking correspondent)",
            "Open account with just Aadhaar – no minimum balance needed",
        ],
        "next_steps_hi": [
            "किसी भी बैंक शाखा या बैंक मित्र (बैंकिंग प्रतिनिधि) से मिलें",
            "बस आधार से खाता खोलें – कोई न्यूनतम बैलेंस नहीं",
        ],
        "documents": ["Aadhaar Card (or any 2 ID proofs if no Aadhaar)"],
        "documents_hi": ["आधार कार्ड (या कोई 2 पहचान प्रमाण यदि आधार नहीं)"],
        "match_rules": {},
    },
    {
        "id": "mudra_loan",
        "name": "PM MUDRA Yojana",
        "name_hi": "प्रधानमंत्री मुद्रा योजना",
        "description": "Collateral-free business loans up to ₹10 lakh for micro/small enterprises. Three categories: Shishu (≤₹50K), Kishore (≤₹5L), Tarun (≤₹10L).",
        "description_hi": "सूक्ष्म/लघु उद्यमों के लिए ₹10 लाख तक बिना गारंटी व्यवसाय ऋण। तीन श्रेणियां: शिशु (≤₹50K), किशोर (≤₹5L), तरुण (≤₹10L)।",
        "eligibility": "Any Indian citizen with a business plan for non-farm income-generating activity. SC/ST/OBC/Women get priority.",
        "eligibility_hi": "गैर-कृषि आय गतिविधि के लिए व्यवसाय योजना वाला कोई भी भारतीय नागरिक। SC/ST/OBC/महिलाओं को प्राथमिकता।",
        "category": "financial",
        "tags": ["loan", "business", "enterprise", "self-employment", "mudra", "vyapar"],
        "ministry": "Ministry of Finance",
        "portal_url": "https://www.mudra.org.in",
        "next_steps": [
            "Approach any bank, MFI, or NBFC with business plan",
            "No collateral needed for loans up to ₹10 lakh",
        ],
        "next_steps_hi": [
            "व्यवसाय योजना के साथ किसी भी बैंक, MFI या NBFC से संपर्क करें",
            "₹10 लाख तक ऋण के लिए कोई गारंटी नहीं चाहिए",
        ],
        "documents": ["ID proof (Aadhaar)", "Address proof", "Business plan/proposal", "Photographs"],
        "documents_hi": ["पहचान प्रमाण (आधार)", "पता प्रमाण", "व्यवसाय योजना/प्रस्ताव", "फोटो"],
        "match_rules": {"categories": ["sc", "st", "obc", "woman"]},
    },

    # ── Sanitation & Water ──
    {
        "id": "swatch_bharat",
        "name": "Swachh Bharat Mission – Gramin",
        "name_hi": "स्वच्छ भारत मिशन – ग्रामीण",
        "description": "Financial incentive of ₹12,000 for construction of individual household toilet to eliminate open defecation.",
        "description_hi": "खुले में शौच समाप्त करने के लिए व्यक्तिगत घरेलू शौचालय निर्माण हेतु ₹12,000 का वित्तीय प्रोत्साहन।",
        "eligibility": "Rural households that do not have a toilet. Priority to BPL, SC/ST, small/marginal farmers, landless labourers.",
        "eligibility_hi": "ग्रामीण परिवार जिनके पास शौचालय नहीं है। BPL, SC/ST, छोटे/सीमांत किसान, भूमिहीन मजदूरों को प्राथमिकता।",
        "category": "sanitation",
        "tags": ["toilet", "sanitation", "shauchalay", "rural", "swachh", "clean"],
        "ministry": "Ministry of Jal Shakti",
        "portal_url": "https://swachhbharatmission.gov.in",
        "next_steps": [
            "Apply through Gram Panchayat",
            "Contact Block Development Office for assistance",
        ],
        "next_steps_hi": [
            "ग्राम पंचायत के माध्यम से आवेदन करें",
            "सहायता के लिए ब्लॉक विकास कार्यालय से संपर्क करें",
        ],
        "documents": ["Aadhaar Card", "BPL/Ration card", "Bank account", "Photograph"],
        "documents_hi": ["आधार कार्ड", "BPL/राशन कार्ड", "बैंक खाता", "फोटो"],
        "match_rules": {"max_income": 300000, "is_rural": True},
    },
    {
        "id": "jal_jeevan",
        "name": "Jal Jeevan Mission",
        "name_hi": "जल जीवन मिशन",
        "description": "Piped drinking water supply (55 litres/person/day) to every rural household. Functional Household Tap Connection (FHTC).",
        "description_hi": "हर ग्रामीण घर में पाइप से पानी (55 लीटर/व्यक्ति/दिन)। कार्यात्मक घरेलू नल कनेक्शन (FHTC)।",
        "eligibility": "All rural households without piped water connection. Implementation through Gram Panchayat.",
        "eligibility_hi": "बिना पाइप जल कनेक्शन वाले सभी ग्रामीण परिवार। ग्राम पंचायत द्वारा क्रियान्वयन।",
        "category": "water",
        "tags": ["water", "pani", "jal", "drinking", "rural", "panchayat"],
        "ministry": "Ministry of Jal Shakti",
        "portal_url": "https://jaljeevanmission.gov.in",
        "next_steps": [
            "Contact your Gram Panchayat to request tap connection",
            "Check your village status at jaljeevanmission.gov.in",
        ],
        "next_steps_hi": [
            "नल कनेक्शन के लिए अपनी ग्राम पंचायत से संपर्क करें",
            "jaljeevanmission.gov.in पर अपने गाँव की स्थिति जांचें",
        ],
        "documents": ["Aadhaar Card", "Address proof"],
        "documents_hi": ["आधार कार्ड", "पता प्रमाण"],
        "match_rules": {"is_rural": True},
    },

    # ── Crop Loss / Disaster ──
    {
        "id": "crop_compensation",
        "name": "Crop Loss Compensation (State Schemes)",
        "name_hi": "फसल नुकसान मुआवजा (राज्य योजनाएं)",
        "description": "State/district-level compensation and relief for farmers affected by natural disasters, drought, flood, or hailstorm.",
        "description_hi": "प्राकृतिक आपदा, सूखा, बाढ़ या ओलावृष्टि से प्रभावित किसानों के लिए राज्य/जिला स्तरीय मुआवजा और राहत।",
        "eligibility": "Farmers affected by natural calamity or crop loss. Must report within the deadline set by the state.",
        "eligibility_hi": "प्राकृतिक आपदा या फसल हानि से प्रभावित किसान। राज्य द्वारा निर्धारित समय सीमा के भीतर रिपोर्ट करना जरूरी।",
        "category": "agriculture",
        "tags": ["crop", "loss", "disaster", "flood", "drought", "compensation", "farmer", "fasal"],
        "ministry": "State Agriculture / Revenue Department",
        "portal_url": "",
        "next_steps": [
            "Report crop loss to Patwari / local agriculture office immediately",
            "Submit required forms during the compensation survey",
            "Keep photos/evidence of crop damage",
        ],
        "next_steps_hi": [
            "फसल नुकसान की सूचना तुरंत पटवारी / स्थानीय कृषि कार्यालय को दें",
            "मुआवजा सर्वे के दौरान आवश्यक फॉर्म जमा करें",
            "फसल नुकसान की फोटो/सबूत रखें",
        ],
        "documents": ["Land record", "Loss assessment report", "Aadhaar", "Bank account"],
        "documents_hi": ["भूमि रिकॉर्ड", "नुकसान आकलन रिपोर्ट", "आधार", "बैंक खाता"],
        "match_rules": {"needs_land": True, "max_income": 500000},
    },
]


class SchemeMatchingService:
    """Service for matching users to government schemes with MongoDB storage"""

    def __init__(self):
        self._db_available = False
        self._collection = None
        self._try_connect_db()

    def _try_connect_db(self):
        """Try to connect to MongoDB schemes collection"""
        try:
            from app.config.mongodb import get_db
            db = get_db()
            if db is not None:
                self._collection = db["government_schemes"]
                self._db_available = True
                logger.info("Scheme service connected to MongoDB")
        except Exception as e:
            logger.warning("MongoDB not available for schemes, using built-in data: %s", e)

    # ────────────────────────────────
    #  Seed / CRUD operations
    # ────────────────────────────────

    def seed_schemes(self):
        """Seed MongoDB with built-in schemes. Upserts so safe to call repeatedly."""
        if not self._db_available:
            return {"seeded": 0, "message": "MongoDB not available – using built-in data"}

        count = 0
        for scheme in BUILTIN_SCHEMES:
            doc = {**scheme, "updated_at": datetime.utcnow().isoformat(), "active": True}
            self._collection.update_one(
                {"id": scheme["id"]},
                {"$set": doc},
                upsert=True,
            )
            count += 1
        return {"seeded": count, "message": f"Seeded {count} schemes into MongoDB"}

    def add_scheme(self, scheme_data):
        """Add a new scheme to MongoDB"""
        if not self._db_available:
            return None, "MongoDB not available"

        required = ["id", "name", "description", "eligibility"]
        for field_name in required:
            if not scheme_data.get(field_name):
                return None, f"Missing required field: {field_name}"

        if self._collection.find_one({"id": scheme_data["id"]}):
            return None, f"Scheme with id '{scheme_data['id']}' already exists"

        scheme_data["active"] = True
        scheme_data["updated_at"] = datetime.utcnow().isoformat()
        scheme_data.setdefault("tags", [])
        scheme_data.setdefault("category", "general")
        scheme_data.setdefault("next_steps", [])
        scheme_data.setdefault("next_steps_hi", [])
        scheme_data.setdefault("documents", [])
        scheme_data.setdefault("documents_hi", [])
        scheme_data.setdefault("match_rules", {})

        self._collection.insert_one(scheme_data)
        return scheme_data["id"], None

    def update_scheme(self, scheme_id, updates):
        """Update an existing scheme"""
        if not self._db_available:
            return False, "MongoDB not available"

        updates["updated_at"] = datetime.utcnow().isoformat()
        updates.pop("_id", None)
        updates.pop("id", None)

        result = self._collection.update_one({"id": scheme_id}, {"$set": updates})
        if result.matched_count == 0:
            return False, "Scheme not found"
        return True, None

    def delete_scheme(self, scheme_id):
        """Soft-delete a scheme (mark inactive)"""
        if not self._db_available:
            return False, "MongoDB not available"
        result = self._collection.update_one({"id": scheme_id}, {"$set": {"active": False}})
        if result.matched_count == 0:
            return False, "Scheme not found"
        return True, None

    # ────────────────────────────────
    #  Query / Listing
    # ────────────────────────────────

    def _get_all_scheme_data(self):
        """Get all active schemes – from MongoDB if available, else built-in"""
        if self._db_available:
            try:
                cursor = self._collection.find({"active": {"$ne": False}}, {"_id": 0})
                db_schemes = list(cursor)
                if db_schemes:
                    return db_schemes
            except Exception as e:
                logger.warning("Error reading schemes from MongoDB: %s", e)
        return BUILTIN_SCHEMES

    def get_all_schemes(self):
        """Get all schemes for browsing"""
        schemes = self._get_all_scheme_data()
        return [
            {
                "id": s.get("id"),
                "name": s.get("name"),
                "name_hi": s.get("name_hi", ""),
                "description": s.get("description"),
                "description_hi": s.get("description_hi", ""),
                "eligibility": s.get("eligibility"),
                "eligibility_hi": s.get("eligibility_hi", ""),
                "category": s.get("category", "general"),
                "ministry": s.get("ministry", ""),
                "portal_url": s.get("portal_url", ""),
                "next_steps": s.get("next_steps", []),
                "next_steps_hi": s.get("next_steps_hi", []),
                "documents": s.get("documents", []),
                "documents_hi": s.get("documents_hi", []),
            }
            for s in schemes
        ]

    def get_scheme_count(self):
        """Get count of active schemes"""
        return len(self._get_all_scheme_data())

    # ────────────────────────────────
    #  Matching Logic
    # ────────────────────────────────

    def match_schemes(self, income, land_size, category, income_period="year", land_unit="acre"):
        """Match user inputs to schemes"""
        normalized = self._normalize_inputs(income, land_size, category, income_period, land_unit)
        schemes = self._get_all_scheme_data()

        results = []
        for scheme in schemes:
            matched, score, reasons, reasons_hi = self._match_scheme(normalized, scheme)
            result = MatchResult(
                scheme_id=scheme.get("id"),
                name=scheme.get("name"),
                name_hi=scheme.get("name_hi", ""),
                description=scheme.get("description"),
                description_hi=scheme.get("description_hi", ""),
                eligibility=scheme.get("eligibility"),
                eligibility_hi=scheme.get("eligibility_hi", ""),
                matched=matched,
                score=score,
                reasons=reasons,
                reasons_hi=reasons_hi,
                next_steps=scheme.get("next_steps", []),
                next_steps_hi=scheme.get("next_steps_hi", []),
                documents=scheme.get("documents", []),
                documents_hi=scheme.get("documents_hi", []),
                category=scheme.get("category", "general"),
                ministry=scheme.get("ministry", ""),
                portal_url=scheme.get("portal_url", ""),
            )
            results.append(result)

        results.sort(key=lambda r: (not r.matched, -r.score, r.name))

        return {
            "success": True,
            "data": {
                "input": normalized,
                "matches": [self._result_to_dict(r) for r in results],
                "assumptions": normalized.get("assumptions", []),
                "totalSchemes": len(schemes),
                "note": "Matches are indicative. Please verify eligibility with local offices.",
            },
        }

    def _match_scheme(self, data, scheme):
        """Universal rule-based matching for any scheme"""
        rules = scheme.get("match_rules", {})
        reasons = []
        reasons_hi = []
        score = 20  # base score
        income = data.get("income")
        land_ha = data.get("landHectare")
        user_category = (data.get("category") or "").lower()

        # ── Land-based matching ──
        needs_land = rules.get("needs_land", False)
        max_land = rules.get("max_land_ha")

        if needs_land:
            if land_ha is not None and land_ha > 0:
                score += 30
                reasons.append("You have agricultural land – scheme applies to farmers.")
                reasons_hi.append("आपके पास कृषि भूमि है – योजना किसानों के लिए है।")
                if max_land and land_ha <= max_land:
                    score += 20
                    reasons.append(f"Land holding ({land_ha:.1f} ha) is within small/marginal range.")
                    reasons_hi.append(f"भूमि जोत ({land_ha:.1f} हेक्टेयर) छोटे/सीमांत दायरे में है।")
                elif max_land and land_ha > max_land:
                    score -= 10
                    reasons.append(f"Land holding ({land_ha:.1f} ha) exceeds small/marginal limit.")
                    reasons_hi.append(f"भूमि जोत ({land_ha:.1f} हेक्टेयर) छोटे/सीमांत सीमा से अधिक है।")
            else:
                score -= 15
                reasons.append("No land size provided – this scheme needs agricultural land.")
                reasons_hi.append("भूमि का आकार नहीं दिया – इस योजना में कृषि भूमि जरूरी है।")

        # ── Income-based matching ──
        max_income = rules.get("max_income")
        if max_income:
            if income is not None:
                if income <= max_income:
                    score += 25
                    reasons.append(f"Your income is within eligibility limit.")
                    reasons_hi.append(f"आपकी आय पात्रता सीमा के भीतर है।")
                else:
                    score -= 10
                    reasons.append(f"Your income may exceed the scheme limit.")
                    reasons_hi.append(f"आपकी आय योजना सीमा से अधिक हो सकती है।")
            else:
                reasons.append("Income not provided – scheme has income criteria.")
                reasons_hi.append("आय नहीं दी गई – योजना में आय मानदंड है।")

        # ── Category-based matching ──
        target_cats = rules.get("categories", [])
        if target_cats and user_category:
            if user_category in target_cats:
                score += 20
                reasons.append(f"Your category ({user_category.upper()}) is eligible for this scheme.")
                reasons_hi.append(f"आपकी श्रेणी ({user_category.upper()}) इस योजना के लिए पात्र है।")
            else:
                reasons.append("Scheme prioritizes specific categories but may still apply.")
                reasons_hi.append("योजना विशिष्ट श्रेणियों को प्राथमिकता देती है लेकिन आप भी पात्र हो सकते हैं।")
        elif target_cats and not user_category:
            reasons.append("Category not provided – this scheme targets specific groups.")
            reasons_hi.append("श्रेणी नहीं दी गई – यह योजना विशिष्ट समूहों के लिए है।")

        # ── Rural focus bonus ──
        is_rural = rules.get("is_rural", False)
        if is_rural:
            score += 5
            reasons.append("This scheme is for rural households.")
            reasons_hi.append("यह योजना ग्रामीण परिवारों के लिए है।")

        # ── General scheme (no specific rules) ──
        if not rules:
            score += 15
            reasons.append("General scheme open to all eligible citizens.")
            reasons_hi.append("सभी पात्र नागरिकों के लिए खुली सामान्य योजना।")

        matched = score >= 40
        return matched, score, reasons, reasons_hi

    # ────────────────────────────────
    #  Helpers
    # ────────────────────────────────

    def _normalize_inputs(self, income, land_size, category, income_period, land_unit):
        assumptions = []

        def to_float(value):
            if value is None:
                return None
            if isinstance(value, (int, float)):
                return float(value)
            value_str = str(value).replace(",", "").strip()
            return float(value_str) if value_str else None

        income_value = to_float(income)
        land_value = to_float(land_size)

        period = (income_period or "year").strip().lower()
        if period not in ["year", "month"]:
            assumptions.append("Income period assumed as yearly.")
            period = "year"

        if income_value is not None and period == "month":
            income_year = income_value * 12.0
        else:
            income_year = income_value

        unit = (land_unit or "acre").strip().lower()
        if unit not in ["acre", "hectare"]:
            assumptions.append("Land unit assumed as acre.")
            unit = "acre"

        if land_value is None:
            land_ha = None
        elif unit == "hectare":
            land_ha = land_value
        else:
            land_ha = land_value * 0.404686

        return {
            "income": income_year,
            "incomePeriod": "year",
            "landSize": land_value,
            "landUnit": unit,
            "landHectare": land_ha,
            "category": (category or "").strip(),
            "assumptions": assumptions,
        }

    def _result_to_dict(self, result):
        return {
            "id": result.scheme_id,
            "name": result.name,
            "name_hi": result.name_hi,
            "description": result.description,
            "description_hi": result.description_hi,
            "eligibility": result.eligibility,
            "eligibility_hi": result.eligibility_hi,
            "matched": result.matched,
            "score": result.score,
            "reasons": result.reasons,
            "reasons_hi": result.reasons_hi,
            "nextSteps": result.next_steps,
            "nextSteps_hi": result.next_steps_hi,
            "documents": result.documents,
            "documents_hi": result.documents_hi,
            "category": result.category,
            "ministry": result.ministry,
            "portalUrl": result.portal_url,
        }
