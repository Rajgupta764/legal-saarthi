"""
Legal Education Service - Accurate Legal Information for Public Awareness
Provides trustworthy, simple-language explanations of legal concepts
Based on Indian Constitution, Police Act, and Criminal Procedure Code
"""


class LegalEducationService:
    """Service for providing accurate legal education content"""

    def __init__(self):
        self.content = self._initialize_content()

    def _initialize_content(self):
        """Initialize all legal education content"""
        return {
            "police_powers": self._get_police_powers(),
            "user_rights": self._get_user_rights(),
            "fir_information": self._get_fir_information(),
            "arrest_rights": self._get_arrest_rights(),
            "interrogation_rights": self._get_interrogation_rights(),
            "bail_information": self._get_bail_information(),
        }

    def _get_police_powers(self):
        """What police can do - Based on Police Act 1861 and CrPC 1973"""
        return {
            "title": "Police Kya Kar Sakti Hai",
            "titleEn": "What Police Can Do",
            "summary": "पुलिस कानून के अनुसार सीमित शक्तियां रखती है।",
            "summaryEn": "Police have limited powers defined by law.",
            "sections": [
                {
                    "heading": "जांच करना",
                    "headingEn": "Investigation",
                    "points": [
                        {
                            "title": "अपराध की जांच",
                            "titleEn": "Crime Investigation",
                            "description": "पुलिस किसी अपराध की जांच कर सकती है अगर कोई FIR दर्ज हो या कोई शिकायत हो।",
                            "descriptionEn": "Police can investigate a crime if an FIR is registered or a complaint is filed.",
                            "law": "CrPC Section 154-160"
                        },
                        {
                            "title": "गिरफ्तारी बिना वारंट",
                            "titleEn": "Arrest Without Warrant",
                            "description": "पुलिस किसी को गिरफ्तार कर सकती है अगर: (1) वे एक गंभीर अपराध करते हुए पकड़े जाएं, (2) जेल से भागे हुए हों, (3) कानूनी वारंट हो।",
                            "descriptionEn": "Police can arrest without warrant if: (1) caught committing serious crime, (2) escaped from custody, (3) lawful warrant exists.",
                            "law": "CrPC Section 41-42"
                        }
                    ]
                },
                {
                    "heading": "पूछताछ करना",
                    "headingEn": "Questioning",
                    "points": [
                        {
                            "title": "गिरफ्तारी के बाद पूछताछ",
                            "titleEn": "Interrogation After Arrest",
                            "description": "पुलिस आपसे सवाल पूछ सकती है लेकिन: (1) 24 घंटे में मजिस्ट्रेट के सामने लाना जरूरी है, (2) जबरदस्ती से कोई बयान नहीं ले सकते, (3) आपको अपना वकील बुलाने का अधिकार है।",
                            "descriptionEn": "Police can question you but: (1) must present you before magistrate within 24 hrs, (2) cannot force confession, (3) you have right to call a lawyer.",
                            "law": "CrPC Section 161-163"
                        }
                    ]
                },
                {
                    "heading": "पुलिस की सीमा",
                    "headingEn": "Police Limitations",
                    "points": [
                        {
                            "title": "मारपीट या अत्याचार नहीं",
                            "titleEn": "No Violence or Torture",
                            "description": "पुलिस आपको मार नहीं सकती, प्रताड़ित नहीं कर सकती। यह अत्याचार है और अपराध है।",
                            "descriptionEn": "Police cannot beat you or torture you. This is torture and is a crime.",
                            "law": "IPC Section 330-337, CrPC Section 330"
                        },
                        {
                            "title": "बिना वजह गिरफ्तारी नहीं",
                            "titleEn": "Cannot Arrest Without Reason",
                            "description": "पुलिस बिना कानूनी कारण के आपको गिरफ्तार नहीं कर सकती। अगर गलत गिरफ्तारी हो तो आप मुआवजे के लिए अपील कर सकते हैं।",
                            "descriptionEn": "Police cannot arrest you without legal reason. If wrongfully arrested, you can claim compensation.",
                            "law": "Article 21, CrPC Section 50"
                        }
                    ]
                }
            ]
        }

    def _get_user_rights(self):
        """Your rights when dealing with police"""
        return {
            "title": "आपके अधिकार",
            "titleEn": "Your Rights",
            "summary": "भारत का संविधान आपको कई महत्वपूर्ण अधिकार देता है।",
            "summaryEn": "Indian Constitution grants you important rights.",
            "sections": [
                {
                    "heading": "बुनियादी अधिकार",
                    "headingEn": "Fundamental Rights",
                    "points": [
                        {
                            "title": "समानता का अधिकार",
                            "titleEn": "Right to Equality",
                            "description": "हर व्यक्ति कानून के सामने बराबर है। धर्म, जाति, लिंग के आधार पर भेदभाव नहीं हो सकता।",
                            "descriptionEn": "Everyone is equal before law. No discrimination based on religion, caste, gender.",
                            "law": "Article 14-18"
                        },
                        {
                            "title": "जीवन और आजादी का अधिकार",
                            "titleEn": "Right to Life & Liberty",
                            "description": "आप अपनी जिंदगी जी सकते हैं और आजादी से रह सकते हैं जब तक आप दूसरों को नुकसान न पहुंचाएं।",
                            "descriptionEn": "You have right to life and liberty as long as you don't harm others.",
                            "law": "Article 21"
                        },
                        {
                            "title": "शिक्षा का अधिकार",
                            "titleEn": "Right to Education",
                            "description": "हर बच्चे को 6-14 साल तक मुफ्त शिक्षा का अधिकार है।",
                            "descriptionEn": "Every child has right to free education from age 6-14.",
                            "law": "Article 21A"
                        }
                    ]
                },
                {
                    "heading": "पुलिस के साथ आपके अधिकार",
                    "headingEn": "Your Rights With Police",
                    "points": [
                        {
                            "title": "वकील बुलाने का अधिकार",
                            "titleEn": "Right to Lawyer",
                            "description": "गिरफ्तारी के दौरान आप अपना वकील बुला सकते हैं। सरकार गरीबों के लिए मुफ्त वकील देती है।",
                            "descriptionEn": "You can call a lawyer during arrest. Government provides free lawyers for poor.",
                            "law": "CrPC Section 41D"
                        },
                        {
                            "title": "शिकायत दर्ज करने का अधिकार",
                            "titleEn": "Right to Complaint",
                            "description": "अगर कोई अपराध हुआ है तो आप पुलिस में FIR दर्ज करवा सकते हैं। यह आपका अधिकार है।",
                            "descriptionEn": "You can file FIR against any crime. This is your right.",
                            "law": "CrPC Section 154"
                        },
                        {
                            "title": "मुआवजे का अधिकार",
                            "titleEn": "Right to Compensation",
                            "description": "अगर पुलिस गलत तरीके से गिरफ्तार करती है या मारपीट करती है तो आप मुआवजे के लिए अदालत में अपील कर सकते हैं।",
                            "descriptionEn": "If police wrongfully arrests or beats you, you can claim compensation in court.",
                            "law": "Section 330, 347 IPC"
                        },
                        {
                            "title": "जानकारी पाने का अधिकार",
                            "titleEn": "Right to Information",
                            "description": "आप जान सकते हैं कि उस पर क्या आरोप है, कहां रखा गया है, और उसके खिलाफ क्या साक्ष्य हैं।",
                            "descriptionEn": "You can know charges against you, where you're held, and evidence.",
                            "law": "CrPC Section 50"
                        }
                    ]
                }
            ]
        }

    def _get_fir_information(self):
        """Complete FIR information - Right to file FIR"""
        return {
            "title": "FIR दर्ज करने का अधिकार",
            "titleEn": "Right to File FIR",
            "summary": "FIR (First Information Report) पुलिस को अपराध की सूचना देने का तरीका है।",
            "summaryEn": "FIR (First Information Report) is the way to report a crime to police.",
            "sections": [
                {
                    "heading": "FIR क्या है",
                    "headingEn": "What is FIR",
                    "points": [
                        {
                            "title": "परिभाषा",
                            "titleEn": "Definition",
                            "description": "FIR एक कानूनी दस्तावेज है जो किसी अपराध की जानकारी देता है। इसे पुलिस दर्ज करती है।",
                            "descriptionEn": "FIR is a legal document reporting a crime to police.",
                            "law": "CrPC Section 154"
                        },
                        {
                            "title": "क्यों महत्वपूर्ण है",
                            "titleEn": "Why Important",
                            "description": "बिना FIR के पुलिस अपराध की जांच नहीं कर सकती। FIR जांच की शुरुआत है।",
                            "descriptionEn": "Without FIR, police cannot investigate. FIR is the start of investigation.",
                            "law": "CrPC Section 154-160"
                        }
                    ]
                },
                {
                    "heading": "FIR कौन दर्ज कर सकते हैं",
                    "headingEn": "Who Can File FIR",
                    "points": [
                        {
                            "title": "आप कर सकते हैं",
                            "titleEn": "You Can File",
                            "description": "कोई भी व्यक्ति जिसको यह पता हो कि अपराध हुआ है, FIR दर्ज करवा सकता है।",
                            "descriptionEn": "Anyone who knows about a crime can file FIR.",
                            "law": "CrPC Section 154"
                        },
                        {
                            "title": "बिना भय के",
                            "titleEn": "Without Fear",
                            "description": "आपको FIR दर्ज करने के लिए किसी से डर नहीं होना चाहिए। यह आपका कानूनी अधिकार है।",
                            "descriptionEn": "You don't need to fear filing FIR. It's your legal right.",
                            "law": "Article 21"
                        }
                    ]
                },
                {
                    "heading": "FIR कैसे दर्ज करें",
                    "headingEn": "How to File FIR",
                    "points": [
                        {
                            "title": "पुलिस स्टेशन जाएं",
                            "titleEn": "Go to Police Station",
                            "description": "निकटतम पुलिस स्टेशन जाएं और थाना प्रभारी को बताएं कि अपराध हुआ है।",
                            "descriptionEn": "Go to nearest police station and tell the officer about the crime.",
                            "law": "CrPC Section 154"
                        },
                        {
                            "title": "विस्तार से बताएं",
                            "titleEn": "Explain in Detail",
                            "description": "अपराध क्या है, कहां हुआ, कब हुआ, किसने किया - यह सब बताएं।",
                            "descriptionEn": "Tell what happened, where, when, and who did it.",
                            "law": "CrPC Section 154"
                        },
                        {
                            "title": "FIR की कॉपी लें",
                            "titleEn": "Take FIR Copy",
                            "description": "FIR दर्ज होने के बाद आपको एक कॉपी देनी चाहिए। अगर न दे तो मांगें।",
                            "descriptionEn": "After FIR is registered, you should get a copy. Ask for it if not given.",
                            "law": "CrPC Section 154(3)"
                        }
                    ]
                },
                {
                    "heading": "महत्वपूर्ण बातें",
                    "headingEn": "Important Points",
                    "points": [
                        {
                            "title": "झूठा FIR न दें",
                            "titleEn": "Don't File False FIR",
                            "description": "झूठा FIR दर्ज करना गलत है। इसके लिए आपको सजा हो सकती है।",
                            "descriptionEn": "Filing false FIR is wrong and can lead to punishment.",
                            "law": "IPC Section 182"
                        },
                        {
                            "title": "रिश्वत न दें",
                            "titleEn": "Don't Give Bribe",
                            "description": "पुलिस को FIR दर्ज करने के लिए पैसे नहीं देने चाहिए। यह गलत है।",
                            "descriptionEn": "You should not bribe police to file FIR. It's wrong.",
                            "law": "Prevention of Corruption Act"
                        },
                        {
                            "title": "वकील की मदद लें",
                            "titleEn": "Take Lawyer Help",
                            "description": "गंभीर मामले में वकील की मदद लेना अच्छा है। मुफ्त वकील के लिए आवेदन करें।",
                            "descriptionEn": "For serious cases, take lawyer help. Apply for free lawyer.",
                            "law": "Right to Free Legal Aid"
                        }
                    ]
                }
            ]
        }

    def _get_arrest_rights(self):
        """Your rights during arrest"""
        return {
            "title": "गिरफ्तारी के दौरान आपके अधिकार",
            "titleEn": "Your Rights During Arrest",
            "summary": "गिरफ्तारी एक गंभीर मामला है लेकिन आपके अधिकार हैं।",
            "summaryEn": "Arrest is serious but you have rights.",
            "sections": [
                {
                    "heading": "कानूनी गिरफ्तारी",
                    "headingEn": "Legal Arrest",
                    "points": [
                        {
                            "title": "वारंट दिखाने का अधिकार",
                            "titleEn": "Right to See Warrant",
                            "description": "पुलिस आपको गिरफ्तार करने से पहले वारंट दिखानी चाहिए या अपने कार्यों को समझाना चाहिए।",
                            "descriptionEn": "Police should show warrant before arrest or explain their action.",
                            "law": "CrPC Section 50"
                        },
                        {
                            "title": "नाम और बैज नंबर",
                            "titleEn": "Name & Badge Number",
                            "description": "पुलिस अपना नाम, बैज नंबर, और पद बताने के लिए बाध्य है।",
                            "descriptionEn": "Police must tell their name, badge number, and rank.",
                            "law": "CrPC Section 50"
                        }
                    ]
                },
                {
                    "heading": "हिरासत में आपके अधिकार",
                    "headingEn": "Your Rights in Custody",
                    "points": [
                        {
                            "title": "24 घंटे में मजिस्ट्रेट के सामने लाना जरूरी",
                            "titleEn": "Presentation Before Magistrate in 24 Hours",
                            "description": "पुलिस को आपको 24 घंटे में मजिस्ट्रेट के सामने लाना है। इसके बाद जेल या रिहाई तय होती है।",
                            "descriptionEn": "Police must present you before magistrate within 24 hours.",
                            "law": "CrPC Section 67"
                        },
                        {
                            "title": "डॉक्टरी जांच का अधिकार",
                            "titleEn": "Right to Medical Examination",
                            "description": "अगर पुलिस आपको मारे तो डॉक्टरी जांच करवा सकते हैं। यह सबूत हो सकता है।",
                            "descriptionEn": "You can demand medical examination if police beats you.",
                            "law": "CrPC Section 54"
                        }
                    ]
                }
            ]
        }

    def _get_interrogation_rights(self):
        """Your rights during police questioning"""
        return {
            "title": "पुलिस पूछताछ के दौरान अधिकार",
            "titleEn": "Your Rights During Police Questioning",
            "summary": "पुलिस आपसे सवाल पूछ सकती है लेकिन कुछ नियम हैं।",
            "summaryEn": "Police can question you but certain rules apply.",
            "sections": [
                {
                    "heading": "पूछताछ के नियम",
                    "headingEn": "Rules of Interrogation",
                    "points": [
                        {
                            "title": "बयान देना अनिवार्य नहीं",
                            "titleEn": "You Don't Have to Give Statement",
                            "description": "आप पुलिस को कोई बयान देने के लिए बाध्य नहीं हो। चुप रहने का अधिकार है।",
                            "descriptionEn": "You are not forced to give statement. You have right to silence.",
                            "law": "Article 20(3)"
                        },
                        {
                            "title": "वकील की उपस्थिति",
                            "titleEn": "Lawyer Available",
                            "description": "पूछताछ के दौरान अपना वकील रख सकते हैं। वकील आपके अधिकारों की रक्षा करेगा।",
                            "descriptionEn": "You can have lawyer present during questioning.",
                            "law": "CrPC Section 41D"
                        },
                        {
                            "title": "जबरदस्ती से बयान नहीं",
                            "titleEn": "No Forced Confession",
                            "description": "पुलिस आपको मार, डर, या धमकी से बयान देने के लिए मजबूर नहीं कर सकती।",
                            "descriptionEn": "Police cannot force you to confess through violence or threats.",
                            "law": "IPC Section 330"
                        }
                    ]
                }
            ]
        }

    def _get_bail_information(self):
        """Information about bail and release"""
        return {
            "title": "जेल से बाहर आने का तरीका - जमानत",
            "titleEn": "How to Get Out of Jail - Bail",
            "summary": "कुछ अपराधों में आप जमानत पर रिहा हो सकते हैं।",
            "summaryEn": "In some crimes, you can be released on bail.",
            "sections": [
                {
                    "heading": "जमानत क्या है",
                    "headingEn": "What is Bail",
                    "points": [
                        {
                            "title": "परिभाषा",
                            "titleEn": "Definition",
                            "description": "जमानत एक आर्थिक गारंटी है जो आपको जेल से बाहर रहने देती है जब तक आपका मुकदमा चल रहा हो।",
                            "descriptionEn": "Bail is financial guarantee to stay outside jail during trial.",
                            "law": "CrPC Section 436-450"
                        },
                        {
                            "title": "जमानत के प्रकार",
                            "titleEn": "Types of Bail",
                            "description": "1. आसान अपराधों में: आप स्वीकृति पर रिहा हो सकते हैं। 2. गंभीर अपराधों में: अदालत निर्णय लेती है।",
                            "descriptionEn": "1. Minor crimes: Release on recognition. 2. Serious crimes: Court decides.",
                            "law": "CrPC Section 436-437"
                        }
                    ]
                },
                {
                    "heading": "जमानत कैसे लें",
                    "headingEn": "How to Get Bail",
                    "points": [
                        {
                            "title": "अदालत में आवेदन करें",
                            "titleEn": "Apply in Court",
                            "description": "गिरफ्तारी के बाद 24 घंटे में मजिस्ट्रेट के सामने जमानत के लिए आवेदन करें।",
                            "descriptionEn": "Apply for bail before magistrate within 24 hours of arrest.",
                            "law": "CrPC Section 437"
                        },
                        {
                            "title": "वकील की मदद",
                            "titleEn": "Get Lawyer Help",
                            "description": "मुफ्त वकील पाने के लिए आवेदन करें। वकील आपका जमानत आवेदन तैयार करेगा।",
                            "descriptionEn": "Apply for free lawyer. Lawyer will prepare bail application.",
                            "law": "Right to Free Legal Aid"
                        }
                    ]
                }
            ]
        }

    def get_all_content(self):
        """Get all legal education content"""
        return self.content

    def get_content_by_topic(self, topic):
        """Get content for a specific topic"""
        topic_map = {
            "police_powers": "police_powers",
            "user_rights": "user_rights",
            "fir": "fir_information",
            "fir_information": "fir_information",
            "arrest_rights": "arrest_rights",
            "interrogation_rights": "interrogation_rights",
            "bail": "bail_information",
            "bail_information": "bail_information",
        }
        
        key = topic_map.get(topic.lower())
        if key:
            return self.content[key]
        return None

    def search_content(self, keyword):
        """Search legal education content by keyword"""
        keyword = keyword.lower()
        results = []
        
        for topic_key, topic_data in self.content.items():
            if keyword in topic_data.get("title", "").lower() or \
               keyword in topic_data.get("titleEn", "").lower():
                results.append({
                    "topic": topic_key,
                    "content": topic_data
                })
            
            # Search in sections
            for section in topic_data.get("sections", []):
                for point in section.get("points", []):
                    if keyword in point.get("title", "").lower() or \
                       keyword in point.get("titleEn", "").lower() or \
                       keyword in point.get("description", "").lower() or \
                       keyword in point.get("descriptionEn", "").lower():
                        results.append({
                            "topic": topic_key,
                            "matchType": "point",
                            "content": point
                        })
        
        return results
