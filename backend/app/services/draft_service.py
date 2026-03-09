"""
Draft Generator Service
Handles generating complaint letters and legal drafts in Hindi
"""

from datetime import datetime
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


class DraftService:
    """Service for generating legal drafts and complaint letters"""
    
    def __init__(self):
        # Draft templates for different issue types
        self.templates = {
            'land_dispute': self._generate_land_dispute_draft,
            'property_dispute': self._generate_land_dispute_draft,  # Same template
            'family_dispute': self._generate_family_dispute_draft,
            'domestic_violence': self._generate_domestic_violence_draft,
            'consumer_complaint': self._generate_consumer_complaint_draft,
            'employment_issue': self._generate_employment_draft,
            'police_complaint': self._generate_police_complaint_draft,
            'court_affidavit': self._generate_court_affidavit_draft,
            'rti_application': self._generate_rti_draft,
            'pension_issue': self._generate_pension_draft,
            'caste_certificate': self._generate_certificate_draft,
            'ration_card': self._generate_ration_card_draft,
            'other': self._generate_general_draft
        }
        
        self.current_date = datetime.now().strftime('%d/%m/%Y')

        self.issue_labels = {
            'land_dispute': {'hindi': 'भूमि विवाद', 'english': 'Land Dispute'},
            'property_dispute': {'hindi': 'संपत्ति विवाद', 'english': 'Property Dispute'},
            'family_dispute': {'hindi': 'पारिवारिक विवाद', 'english': 'Family Dispute'},
            'domestic_violence': {'hindi': 'घरेलू हिंसा', 'english': 'Domestic Violence'},
            'consumer_complaint': {'hindi': 'उपभोक्ता शिकायत', 'english': 'Consumer Complaint'},
            'employment_issue': {'hindi': 'रोजगार संबंधी शिकायत', 'english': 'Employment Issue'},
            'police_complaint': {'hindi': 'पुलिस शिकायत (FIR)', 'english': 'Police Complaint (FIR)'},
            'court_affidavit': {'hindi': 'न्यायालय शपथ पत्र', 'english': 'Court Affidavit'},
            'rti_application': {'hindi': 'RTI आवेदन', 'english': 'RTI Application'},
            'pension_issue': {'hindi': 'पेंशन संबंधी मामला', 'english': 'Pension Issue'},
            'caste_certificate': {'hindi': 'प्रमाण पत्र आवेदन', 'english': 'Certificate Application'},
            'ration_card': {'hindi': 'राशन कार्ड आवेदन', 'english': 'Ration Card Application'},
            'other': {'hindi': 'सामान्य शिकायत', 'english': 'General Complaint'}
        }

        # Authority mapping for each issue type
        self._authorities = {
            'land_dispute': {
                'hindi': {'to': 'श्रीमान जिलाधिकारी/तहसीलदार महोदय', 'office': 'जिला कार्यालय/तहसील कार्यालय'},
                'english': {'to': 'The District Magistrate/Tehsildar', 'office': 'District Office/Tehsil Office'}
            },
            'property_dispute': {
                'hindi': {'to': 'श्रीमान जिलाधिकारी/उप-जिलाधिकारी महोदय', 'office': 'जिला कार्यालय'},
                'english': {'to': 'The District Magistrate/Sub-Divisional Magistrate', 'office': 'District Office'}
            },
            'family_dispute': {
                'hindi': {'to': 'श्रीमान न्यायिक मजिस्ट्रेट/परिवार न्यायालय', 'office': 'परिवार न्यायालय'},
                'english': {'to': 'The Family Court Judge', 'office': 'Family Court'}
            },
            'domestic_violence': {
                'hindi': {'to': 'श्रीमान थाना प्रभारी/महिला थाना', 'office': 'थाना/महिला थाना'},
                'english': {'to': 'The Station House Officer/Women\'s Police Station', 'office': 'Police Station/Women\'s Police Station'}
            },
            'consumer_complaint': {
                'hindi': {'to': 'श्रीमान अध्यक्ष, जिला उपभोक्ता विवाद निवारण आयोग', 'office': 'जिला उपभोक्ता मंच'},
                'english': {'to': 'The President, District Consumer Disputes Redressal Commission', 'office': 'District Consumer Forum'}
            },
            'employment_issue': {
                'hindi': {'to': 'श्रीमान श्रम आयुक्त/श्रम अधिकारी', 'office': 'श्रम विभाग कार्यालय'},
                'english': {'to': 'The Labour Commissioner/Labour Officer', 'office': 'Labour Department Office'}
            },
            'police_complaint': {
                'hindi': {'to': 'श्रीमान थाना प्रभारी (SHO)', 'office': 'थाना'},
                'english': {'to': 'The Station House Officer (SHO)', 'office': 'Police Station'}
            },
            'court_affidavit': {
                'hindi': {'to': 'माननीय न्यायालय', 'office': 'न्यायालय'},
                'english': {'to': 'The Hon\'ble Court', 'office': 'Court'}
            },
            'rti_application': {
                'hindi': {'to': 'श्रीमान जन सूचना अधिकारी', 'office': 'संबंधित विभाग'},
                'english': {'to': 'The Public Information Officer', 'office': 'Concerned Department'}
            },
            'pension_issue': {
                'hindi': {'to': 'श्रीमान जिला समाज कल्याण अधिकारी', 'office': 'समाज कल्याण विभाग'},
                'english': {'to': 'The District Social Welfare Officer', 'office': 'Social Welfare Department'}
            },
            'caste_certificate': {
                'hindi': {'to': 'श्रीमान तहसीलदार/उप-जिलाधिकारी', 'office': 'तहसील कार्यालय'},
                'english': {'to': 'The Tehsildar/Sub-Divisional Magistrate', 'office': 'Tehsil Office'}
            },
            'ration_card': {
                'hindi': {'to': 'श्रीमान जिला आपूर्ति अधिकारी', 'office': 'खाद्य एवं आपूर्ति विभाग'},
                'english': {'to': 'The District Supply Officer', 'office': 'Food & Supply Department'}
            },
            'other': {
                'hindi': {'to': 'श्रीमान संबंधित अधिकारी', 'office': 'संबंधित कार्यालय'},
                'english': {'to': 'The Concerned Authority', 'office': 'Concerned Office'}
            }
        }

        # Subject line mapping
        self._subjects = {
            'land_dispute': {'hindi': 'भूमि विवाद/अवैध कब्ज़े के संबंध में शिकायत', 'english': 'Complaint Regarding Land Dispute / Illegal Occupation'},
            'property_dispute': {'hindi': 'संपत्ति विवाद के संबंध में शिकायत', 'english': 'Complaint Regarding Property Dispute'},
            'family_dispute': {'hindi': 'पारिवारिक विवाद के संबंध में शिकायत', 'english': 'Complaint Regarding Family Dispute'},
            'domestic_violence': {'hindi': 'घरेलू हिंसा के संबंध में शिकायत/FIR', 'english': 'Complaint Regarding Domestic Violence'},
            'consumer_complaint': {'hindi': 'उपभोक्ता शिकायत - दोषपूर्ण सामान/सेवा', 'english': 'Consumer Complaint - Defective Goods/Service'},
            'employment_issue': {'hindi': 'रोजगार संबंधी शिकायत/वेतन बकाया', 'english': 'Employment Complaint / Salary Dues'},
            'police_complaint': {'hindi': 'FIR दर्ज करने हेतु शिकायत', 'english': 'Complaint for Registration of FIR'},
            'court_affidavit': {'hindi': 'शपथ पत्र', 'english': 'Affidavit'},
            'rti_application': {'hindi': 'सूचना का अधिकार अधिनियम 2005 के तहत आवेदन', 'english': 'Application under Right to Information Act 2005'},
            'pension_issue': {'hindi': 'पेंशन संबंधी शिकायत/आवेदन', 'english': 'Complaint/Application Regarding Pension'},
            'caste_certificate': {'hindi': 'जाति/आय/निवास प्रमाण पत्र हेतु आवेदन', 'english': 'Application for Caste/Income/Residence Certificate'},
            'ration_card': {'hindi': 'राशन कार्ड संबंधी आवेदन/शिकायत', 'english': 'Application/Complaint Regarding Ration Card'},
            'other': {'hindi': 'शिकायत/आवेदन', 'english': 'Complaint/Application'}
        }

        # Try to set up OpenAI client
        self.ai_client = None
        api_key = os.getenv('OPENAI_API_KEY')
        if api_key and OpenAI:
            try:
                self.ai_client = OpenAI(api_key=api_key)
            except Exception:
                self.ai_client = None
    
    def generate_draft(self, issue_type, details, language='hindi', sender_info=None, recipient=None, subject_line=None):
        """
        Generate a complaint letter based on issue type and details.
        Uses AI (OpenAI) when available for professional quality Hindi/English.
        Falls back to templates when AI is unavailable.
        """
        sender_info = sender_info or {}
        recipient = recipient or {}
        subject_line = subject_line or ''

        # Always get template result for tips/submitTo metadata
        template_func = self.templates.get(issue_type, self._generate_general_draft)

        # Clean up the details text (Hinglish → Hindi conversion) for template use
        cleaned_details = details
        try:
            converted = self._rewrite_with_builtin(details)
            conv = converted.get('rewritten', '')
            if conv and len(conv) > 10:
                cleaned_details = conv
        except Exception:
            pass

        template_result = template_func(cleaned_details, language)

        # Try AI-powered draft generation first
        if self.ai_client:
            try:
                ai_draft = self._generate_draft_with_ai(
                    issue_type, details, language,
                    sender_info, recipient, subject_line
                )
                if ai_draft:
                    # Use AI draft text but keep template's tips/submitTo
                    template_result['draft'] = ai_draft
                    return template_result
            except Exception as e:
                print(f"AI draft generation failed, falling back to templates: {e}")

        # Fallback: use template + fill personal info
        if sender_info or recipient or subject_line:
            template_result['draft'] = self._fill_personal_info(
                template_result.get('draft', ''),
                sender_info,
                recipient,
                subject_line,
                language
            )
        
        return template_result

    def _generate_draft_with_ai(self, issue_type, details, language, sender_info, recipient, subject_line):
        """Use OpenAI to generate a complete, professional complaint letter.
        
        Handles Hinglish, broken Hindi, typos, mixed languages — converts
        everything into polished formal Hindi/English like ChatGPT quality.
        Returns the draft text string, or None on failure.
        """
        issue_label = self.issue_labels.get(issue_type, self.issue_labels['other'])
        label_hi = issue_label.get('hindi', 'शिकायत')
        label_en = issue_label.get('english', 'Complaint')

        # Build sender details string for the prompt
        sender_info = sender_info or {}
        s_name = sender_info.get('name', '').strip()
        s_father = sender_info.get('fatherName', '').strip()
        s_address = sender_info.get('address', '').strip()
        s_phone = sender_info.get('phone', '').strip()
        s_district = sender_info.get('district', '').strip()
        s_state = sender_info.get('state', '').strip()
        if isinstance(recipient, dict):
            r_name = recipient.get('name', '').strip()
            r_office = recipient.get('office', '').strip()
        elif isinstance(recipient, str):
            r_name = recipient.strip()
            r_office = ''
        else:
            r_name = ''
            r_office = ''

        sender_block = '\n'.join(filter(None, [
            f'नाम: {s_name}' if s_name else None,
            f'पिता/पति का नाम: {s_father}' if s_father else None,
            f'पता: {s_address}' if s_address else None,
            f'मोबाइल: {s_phone}' if s_phone else None,
            f'जिला: {s_district}' if s_district else None,
            f'राज्य: {s_state}' if s_state else None,
        ]))

        if language == 'english':
            system_prompt = (
                'You are an expert legal letter writer for Indian citizens. '
                'Your job is to write a COMPLETE, PROFESSIONAL, READY-TO-SUBMIT formal complaint/application letter in proper English.\n\n'
                'CRITICAL RULES:\n'
                '1. The user may write in Hinglish, broken Hindi, Roman Hindi, mixed language, or have typos — you MUST understand their meaning and rewrite everything in perfect formal English.\n'
                '2. DO NOT leave any blanks (___), placeholders, or [brackets] in the letter. Every field must be filled with the provided information.\n'
                '3. The letter must be COMPLETE and ready to print and submit — no editing needed by the user.\n'
                '4. Use formal, legal English language suitable for official correspondence in India.\n'
                '5. Keep ONLY the user\'s facts. Do NOT invent dates, places, amounts, or names the user did not mention.\n'
                '6. Structure the letter properly: To → Office → Date → Subject → Salutation → Body → Prayer → Signature block.\n'
                '7. The body should have well-structured paragraphs explaining the problem chronologically and formally.\n'
                '8. Add a formal closing requesting appropriate action.\n'
                '9. Include enclosure list (identity proof, supporting documents).\n'
                '10. If user mentions amounts use ₹ symbol. If user mentions dates, format them properly.\n'
            )
            user_prompt = (
                f'Issue Type: {label_en}\n'
                f'Recipient: {r_name or "The Concerned Authority"}\n'
                f'Office: {r_office or "Concerned Office"}\n'
                f'Subject: {subject_line or label_en}\n'
                f'Date: {self.current_date}\n\n'
                f'Applicant Information:\n{sender_block or "Not provided"}\n\n'
                f'User\'s problem description (may be in Hinglish/broken language — understand meaning and rewrite formally):\n'
                f'{details}\n\n'
                'Write the COMPLETE formal letter now. No blanks. No placeholders. Ready to print.'
            )
        else:
            system_prompt = (
                'आप एक विशेषज्ञ कानूनी पत्र लेखक हैं जो भारतीय नागरिकों के लिए पेशेवर शिकायत पत्र लिखते हैं।\n\n'
                'अत्यंत महत्वपूर्ण नियम:\n'
                '1. यूज़र किसी भी भाषा में लिख सकता है — Hinglish, टूटी-फूटी हिंदी, Roman Hindi, अंग्रेज़ी-हिंदी मिश्रित, गलत स्पेलिंग — आपको उसका अर्थ समझकर शुद्ध, औपचारिक, साहित्यिक हिंदी में पूरा पत्र लिखना है।\n'
                '2. पत्र में कोई भी खाली जगह (___), कोष्ठक [brackets], या "यहाँ भरें" जैसा कुछ भी नहीं होना चाहिए। हर जगह असली जानकारी भरी होनी चाहिए।\n'
                '3. पत्र पूरी तरह तैयार होना चाहिए — सीधे प्रिंट करके जमा किया जा सके।\n'
                '4. भाषा शुद्ध, औपचारिक, सरकारी पत्राचार योग्य हिंदी होनी चाहिए। जैसे सरकारी दफ्तर में लिखा जाता है।\n'
                '5. केवल यूज़र के बताए तथ्य लिखें। कोई नई तिथि, स्थान, राशि, नाम न जोड़ें जो यूज़र ने नहीं बताया।\n'
                '6. पत्र का प्रारूप:\n'
                '   सेवा में, → प्राप्तकर्ता → कार्यालय → दिनांक → विषय → महोदय → प्रारंभ "सविनय निवेदन है कि..." → समस्या का विस्तृत विवरण (औपचारिक पैराग्राफ में) → प्रार्थना/निवेदन → संलग्नक → भवदीय → नाम/हस्ताक्षर\n'
                '7. समस्या विवरण भाग में यूज़र की बात को तथ्यात्मक, क्रमबद्ध, स्पष्ट पैराग्राफ में लिखें।\n'
                '8. अंत में प्रार्थना भाग में उचित कार्यवाही का अनुरोध करें।\n'
                '9. यदि यूज़र ने रकम बताई है तो ₹ चिह्न लगाएं। तिथियाँ सही प्रारूप में लिखें।\n'
                '10. "आवेदक का विवरण" अनुभाग में दी गई जानकारी (नाम, पता, मोबाइल आदि) भरें।\n'
            )
            user_prompt = (
                f'समस्या का प्रकार: {label_hi}\n'
                f'प्राप्तकर्ता (सेवा में): {r_name or "संबंधित अधिकारी"}\n'
                f'कार्यालय: {r_office or "संबंधित कार्यालय"}\n'
                f'विषय: {subject_line or label_hi}\n'
                f'दिनांक: {self.current_date}\n\n'
                f'आवेदक की जानकारी:\n{sender_block or "उपलब्ध नहीं"}\n\n'
                f'यूज़र की समस्या (Hinglish/टूटी भाषा में हो सकती है — अर्थ समझें और शुद्ध हिंदी में लिखें):\n'
                f'{details}\n\n'
                'अब पूरा औपचारिक शिकायत पत्र लिखें। कोई खाली जगह नहीं। कोई placeholder नहीं। सीधे प्रिंट योग्य।'
            )

        completion = self.ai_client.chat.completions.create(
            model='gpt-4o-mini',
            temperature=0.25,
            max_tokens=2000,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ]
        )

        result = (completion.choices[0].message.content or '').strip()
        if not result or len(result) < 100:
            return None
        return result

    def _fill_personal_info(self, draft_text, sender, recipient, subject_line, language):
        """Replace blanks and placeholder lines in draft with actual sender/recipient data."""
        import re
        
        text = draft_text
        sender = sender or {}
        name = sender.get('name', '').strip()
        father = sender.get('fatherName', '').strip()
        address = sender.get('address', '').strip()
        phone = sender.get('phone', '').strip()
        district = sender.get('district', '').strip()
        state = sender.get('state', '').strip()
        
        # recipient can be a string or a dict
        if isinstance(recipient, dict):
            rec_name = recipient.get('name', '').strip()
            rec_office = recipient.get('office', '').strip()
        elif isinstance(recipient, str):
            rec_name = recipient.strip()
            rec_office = ''
        else:
            rec_name = ''
            rec_office = ''
        
        blank = r'_________________________+'
        
        def _replace(pattern, value, txt, count=0):
            """Safe regex replace that avoids backreference issues in value."""
            return re.sub(pattern + blank, lambda m: m.group(1) + value, txt, count=count)
        
        def _replace_line(pattern, value, txt, count=1):
            """Replace entire match (not just blank part)."""
            return re.sub(pattern, lambda m: m.group(1) + value, txt, count=count)
        
        # --- Replace recipient header ---
        if rec_name:
            text = re.sub(
                r'(सेवा में,\s*\n)([^\n]+)',
                lambda m: m.group(1) + rec_name + ',',
                text, count=1
            )
            text = re.sub(
                r'(To,\s*\n)([^\n]+)',
                lambda m: m.group(1) + rec_name + ',',
                text, count=1
            )
        
        if rec_office:
            lines = text.split('\n')
            found_header = False
            for i, line in enumerate(lines):
                stripped = line.strip().rstrip(',')
                if stripped in ['सेवा में', 'To']:
                    found_header = True
                    continue
                if found_header and i > 0:
                    if i + 1 < len(lines):
                        next_line = lines[i + 1].strip().rstrip(',')
                        if next_line and not next_line.startswith('जिला') and not next_line.startswith('District'):
                            lines[i + 1] = rec_office + ','
                    break
            text = '\n'.join(lines)
        
        # --- Replace subject line ---
        if subject_line:
            text = _replace_line(r'(विषय:\s*)(.+)', subject_line, text)
            text = _replace_line(r'(Subject:\s*)(.+)', subject_line, text)
        
        # --- Replace sender details ---
        # IMPORTANT: Process specific patterns BEFORE generic "नाम:" to avoid
        # filling "पिता का नाम:" or "आरोपी का नाम:" with sender's name.
        # Also, skip "आरोपी/Accused/गवाह/Witness" sections entirely.
        
        # Identify lines that belong to accused/witness sections (should NOT be filled)
        skip_keywords = {'आरोपी', 'Accused', 'गवाह', 'Witness', 'प्रतिवादी', 'Defendant'}
        safe_keywords = {'आवेदक', 'Applicant', 'प्रार्थी', 'Petitioner', 'शिकायतकर्ता', 'Complainant'}
        
        def _is_in_skip_section(text_str, match_start):
            """Check if the match position falls inside an accused/witness section."""
            preceding = text_str[:match_start]
            last_safe_pos = -1
            last_skip_pos = -1
            for kw in safe_keywords:
                pos = preceding.rfind(kw)
                if pos > last_safe_pos:
                    last_safe_pos = pos
            for kw in skip_keywords:
                pos = preceding.rfind(kw)
                if pos > last_skip_pos:
                    last_skip_pos = pos
            # If the last relevant header is a skip keyword, we're in a skip section
            return last_skip_pos > last_safe_pos
        
        def _safe_replace(pattern, value, txt):
            """Replace blanks but skip matches inside accused/witness sections."""
            full_pattern = pattern + blank
            result = txt
            for m in reversed(list(re.finditer(full_pattern, txt, flags=re.MULTILINE))):
                if not _is_in_skip_section(txt, m.start()):
                    result = result[:m.start()] + m.group(1) + value + result[m.end():]
            return result
        
        if father:
            text = _safe_replace(r'(पिता/पति का नाम:\s*)', father, text)
            text = _safe_replace(r'(पिता का नाम:\s*)', father, text)
            text = _safe_replace(r"(Father's/Husband's Name:\s*)", father, text)
            text = _safe_replace(r"(Father's Name:\s*)", father, text)
            text = _safe_replace(r'(Husband Name:\s*)', father, text)
            text = _safe_replace(r'(पति का नाम:\s*)', father, text)
        
        if name:
            text = _safe_replace(r'((?:^|• )नाम:\s*)', name, text)
            text = _safe_replace(r'((?:^|• )Name:\s*)', name, text)
        
        if address:
            text = _safe_replace(r'((?:^|• )पता:\s*)', address, text)
            text = _safe_replace(r'((?:^|• )Address:\s*)', address, text)
        
        if phone:
            text = _replace(r'(मोबाइल नंबर:\s*)', phone, text)
            text = _replace(r'(फोन:\s*)', phone, text)
            text = _replace(r'(Phone No\.?:\s*)', phone, text)
        
        if district:
            text = _replace(r'(जिला:\s*)', district, text)
            text = _replace(r'(District:\s*)', district, text)
            text = text.replace('[जिले का नाम]', district)
            text = text.replace('[जिला]', district)
        
        if state:
            text = _replace(r'(राज्य:\s*)', state, text)
            text = _replace(r'(State:\s*)', state, text)
        
        if address:
            text = _replace(r'(ग्राम/शहर:\s*)', address, text)
            text = _replace(r'(ग्राम/मोहल्ला:\s*)', address, text)
            text = _replace(r'(Village/Town:\s*)', address, text)
            text = _replace(r'(Village/Locality:\s*)', address, text)
        
        place = district or address
        if place:
            text = _replace(r'(स्थान:\s*)', place, text)
            text = _replace(r'(Place:\s*)', place, text)
        
        if rec_office:
            text = _replace(r'(थाना:\s*)', rec_office, text)
            text = _replace(r'(Police Station:\s*)', rec_office, text)
        
        return text

    def enhance_details(self, issue_type, raw_details, language='hindi'):
        """Generate complete formal complaint/application from user's simple description.
        
        Uses OpenAI if available, otherwise uses built-in smart templates.
        Always produces a complete formatted complaint letter.
        """
        details = (raw_details or '').strip()
        if len(details) < 10:
            raise ValueError('कृपया पहले अपनी समस्या थोड़ी विस्तार से लिखें' if language != 'english'
                             else 'Please write at least a few words about your problem')

        language = (language or 'hindi').lower().strip()
        if language not in ('hindi', 'english'):
            language = 'hindi'

        # Try OpenAI first if available
        if self.ai_client:
            try:
                return self._enhance_with_openai(issue_type, details, language)
            except Exception:
                pass  # Fall through to built-in generator

        # Built-in AI: generate complete formal complaint from simple description
        return self._enhance_with_templates(issue_type, details, language)

    def _enhance_with_openai(self, issue_type, details, language):
        """Use OpenAI to generate a complete formal complaint."""
        issue_label = self.issue_labels.get(issue_type, self.issue_labels['other'])[language]

        if language == 'english':
            system_prompt = (
                'You are a legal writing assistant for rural Indian citizens. '
                'Write a COMPLETE FORMAL COMPLAINT/APPLICATION from scratch based on the user\'s simple problem description.\n\n'
                'Format the complaint with these sections in order:\n'
                '1. "To," line with appropriate authority\n'
                '2. Office/Department address\n'
                '3. Date line\n'
                '4. Subject line\n'
                '5. "Respected Sir/Madam,"\n'
                '6. Opening: "I, the undersigned applicant, respectfully submit..." introducing the complaint\n'
                '7. Detailed problem description - rewrite the user\'s words into formal, chronological, factual paragraphs\n'
                '8. "Applicant Details:" section with:\n'
                '   Name: _______\n'
                '   Father\'s/Husband\'s Name: _______\n'
                '   Address: _______\n'
                '   Phone No.: _______\n'
                '9. Formal closing requesting action\n'
                '10. "Yours faithfully,"\n'
                '    Name: _______\n'
                '    Signature: _______\n\n'
                'Rules: Keep user\'s facts only. No legal advice. No invented details. Formal English.'
            )
            user_prompt = (
                f'Issue Type: {issue_label}\n'
                f'User\'s simple description:\n{details}\n\n'
                'Write the complete formal complaint now.'
            )
        else:
            system_prompt = (
                'आप भारत के ग्रामीण नागरिकों के लिए कानूनी लेखन सहायक हैं। '
                'यूज़र की आसान भाषा से एक पूरा औपचारिक शिकायत पत्र/आवेदन लिखें।\n\n'
                'पत्र का प्रारूप इस क्रम में:\n'
                '1. "सेवा में," - संबंधित अधिकारी\n'
                '2. कार्यालय/विभाग का पता\n'
                '3. दिनांक\n'
                '4. विषय\n'
                '5. "महोदय/महोदया,"\n'
                '6. "मैं, निम्नलिखित आवेदक, सविनय निवेदन करता/करती हूँ कि..." से शुरू करें\n'
                '7. समस्या का विस्तृत विवरण - यूज़र के शब्दों को औपचारिक, तथ्यात्मक, क्रमबद्ध पैराग्राफ में लिखें\n'
                '8. "आवेदक का विवरण:" अनुभाग:\n'
                '   नाम: _______\n'
                '   पिता/पति का नाम: _______\n'
                '   पता: _______\n'
                '   मोबाइल नंबर: _______\n'
                '9. कार्यवाही का औपचारिक अनुरोध\n'
                '10. "भवदीय/भवदीया,"\n'
                '    नाम: _______\n'
                '    हस्ताक्षर: _______\n\n'
                'नियम: केवल यूज़र के तथ्य। कोई कानूनी सलाह नहीं। नई जानकारी न जोड़ें। शुद्ध औपचारिक हिंदी।'
            )
            user_prompt = (
                f'समस्या का प्रकार: {issue_label}\n'
                f'यूज़र का सरल विवरण:\n{details}\n\n'
                'अभी पूरा औपचारिक शिकायत पत्र लिखें।'
            )

        completion = self.ai_client.chat.completions.create(
            model='gpt-4o-mini',
            temperature=0.2,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ]
        )

        result = (completion.choices[0].message.content or '').strip()
        if not result:
            return self._enhance_with_templates(issue_type, details, language)

        return {
            'enhancedDetails': result,
            'message': 'AI ने पूरा शिकायत पत्र तैयार कर दिया है।' if language == 'hindi'
                       else 'AI has prepared the complete complaint letter.',
            'usedAI': True
        }

    def _enhance_with_templates(self, issue_type, details, language):
        """Generate complete formal complaint using built-in smart templates.
        
        This works WITHOUT any API key.
        """
        authority = self._authorities.get(issue_type, self._authorities['other'])[language]
        subject = self._subjects.get(issue_type, self._subjects['other'])[language]
        issue_label = self.issue_labels.get(issue_type, self.issue_labels['other'])[language]

        if language == 'english':
            complaint = f"""To,
{authority['to']},
{authority['office']},
District: _______________________________

Date: {self.current_date}

Subject: {subject}

Respected Sir/Madam,

I, the undersigned applicant, most respectfully submit this complaint/application for your kind attention and necessary action regarding the following matter:

--- Problem Description ---

{self._format_details_english(details)}

--- Applicant Details ---

Name: _______________________________
Father's/Husband's Name: _______________________________
Address: _______________________________
Village/Town: _______________________________
District: _______________________________
State: _______________________________
Phone No.: _______________________________
Aadhaar No.: _______________________________

In view of the above-mentioned facts and circumstances, I humbly request you to kindly look into this matter and take appropriate action at the earliest. I shall be highly obliged.

Enclosures:
1. Copy of identity proof (Aadhaar/Voter ID)
2. Supporting documents (if any)
3. Previous complaints/correspondence (if any)

Yours faithfully,

Name: _______________________________
Signature: _______________________________
Date: {self.current_date}
Place: _______________________________"""
        else:
            complaint = f"""सेवा में,
{authority['to']},
{authority['office']},
जिला: _______________________________

दिनांक: {self.current_date}

विषय: {subject}

महोदय/महोदया,

सविनय निवेदन है कि मैं, निम्नलिखित आवेदक, आपके समक्ष उपरोक्त विषय के संबंध में यह शिकायत/आवेदन प्रस्तुत करता/करती हूँ। कृपया मेरी समस्या पर ध्यान दें और उचित कार्यवाही करें:

--- समस्या का विवरण ---

{self._format_details_hindi(details)}

--- आवेदक का विवरण ---

नाम: _______________________________
पिता/पति का नाम: _______________________________
पता: _______________________________
ग्राम/शहर: _______________________________
जिला: _______________________________
राज्य: _______________________________
मोबाइल नंबर: _______________________________
आधार नंबर: _______________________________

अतः श्रीमान/श्रीमती से सविनय निवेदन है कि उपरोक्त तथ्यों एवं परिस्थितियों को ध्यान में रखते हुए मेरी शिकायत पर शीघ्र उचित कार्यवाही करने की कृपा करें। मैं आपका/आपकी सदा आभारी रहूँगा/रहूँगी।

संलग्नक:
1. पहचान पत्र की प्रति (आधार/वोटर ID)
2. संबंधित दस्तावेज़ (यदि हों)
3. पूर्व शिकायतें/पत्र-व्यवहार (यदि हो)

धन्यवाद सहित,

भवदीय/भवदीया,
नाम: _______________________________
हस्ताक्षर: _______________________________
दिनांक: {self.current_date}
स्थान: _______________________________"""

        return {
            'enhancedDetails': complaint,
            'message': 'पूरा औपचारिक शिकायत पत्र तैयार हो गया है। कृपया अपना विवरण भरें।' if language == 'hindi'
                       else 'Complete formal complaint letter is ready. Please fill in your details.',
            'usedAI': True
        }

    def _format_details_hindi(self, raw_text):
        """Convert simple user text into formal Hindi paragraphs.
        Also applies Hinglish-to-Hindi conversion for template fallback."""
        text = raw_text.strip()

        # Apply Hinglish word conversion (reuse the builtin map)
        try:
            converted = self._rewrite_with_builtin(text)
            text = converted.get('rewritten', text)
        except Exception:
            pass

        # Split into sentences for better formatting
        sentences = [s.strip() for s in text.replace('|', '।').split('।') if s.strip()]
        if not sentences:
            sentences = [s.strip() for s in text.split('.') if s.strip()]
        if not sentences:
            sentences = [text]

        # Clean up each sentence
        clean_sentences = []
        for s in sentences:
            s = s.strip().rstrip('।. ')
            if s:
                clean_sentences.append(s)

        if not clean_sentences:
            clean_sentences = [text]

        # Build formal paragraphs
        formatted = 'उपरोक्त विषय के संबंध में सविनय सूचित करना है कि '
        formatted += '। '.join(clean_sentences)
        if not formatted.endswith('।') and not formatted.endswith('.'):
            formatted += '।'
        formatted += '\n\nइस समस्या के कारण मुझे/मेरे परिवार को अत्यधिक कठिनाई और मानसिक परेशानी हो रही है। कई बार स्थानीय स्तर पर समाधान का प्रयास किया गया परंतु कोई सुनवाई नहीं हुई। अतः विवश होकर आपके समक्ष यह शिकायत प्रस्तुत कर रहा/रही हूँ।'
        return formatted

    def _format_details_english(self, raw_text):
        """Convert simple user text into formal English paragraphs.
        Also applies Hinglish-to-Hindi conversion then presents in English-ready format."""
        text = raw_text.strip()

        # Try Hinglish conversion first to get cleaner text
        try:
            converted = self._rewrite_with_builtin(text)
            # Use original if conversion made it worse (e.g. already English)
            conv_text = converted.get('rewritten', text)
            if conv_text and len(conv_text) > len(text) * 0.5:
                text = conv_text
        except Exception:
            pass

        sentences = [s.strip().rstrip('।. ') for s in text.replace('।', '.').split('.') if s.strip()]
        if not sentences:
            sentences = [text]

        formatted = 'I wish to bring to your kind notice that '
        formatted += '. '.join(sentences)
        if not formatted.endswith('.'):
            formatted += '.'
        formatted += '\n\nDue to this problem, I and my family have been facing severe hardship and mental distress. Multiple attempts were made to resolve this matter at the local level, but no resolution could be achieved. Therefore, I am compelled to bring this complaint before your esteemed office for appropriate action.'
        return formatted

    def rewrite_problem(self, problem):
        """Rewrite user's messy complaint text into clear, professional Hindi.
        
        Uses OpenAI if API key is configured, otherwise uses built-in formatting.
        
        Args:
            problem: Raw user text (can be messy, informal, mixed language)
            
        Returns:
            dict with 'rewritten' key containing improved Hindi text
        """
        problem = (problem or '').strip()
        if not problem:
            raise ValueError('कृपया पहले अपनी समस्या लिखें')
        if len(problem) < 10:
            raise ValueError('कृपया अपनी समस्या थोड़ा विस्तार से लिखें (कम से कम कुछ शब्द)')

        # Try OpenAI first
        if self.ai_client:
            try:
                return self._rewrite_with_openai(problem)
            except Exception as e:
                print(f"OpenAI rewrite failed: {e}")
                # Fall through to built-in rewriter

        # Built-in rewriter (no API key needed)
        return self._rewrite_with_builtin(problem)

    def _rewrite_with_openai(self, problem):
        """Rewrite using OpenAI API — converts ANY input to professional formal Hindi."""
        system_prompt = (
            "आप एक विशेषज्ञ हिंदी भाषा सुधारक हैं। आपका काम है यूज़र की शिकायत को शुद्ध, स्पष्ट, औपचारिक हिंदी में बदलना।\n\n"
            "यूज़र इनमें से किसी भी तरीके से लिख सकता है:\n"
            "- Hinglish (Roman Hindi): 'mere ghar me chori ho gai'\n"
            "- टूटी-फूटी हिंदी: 'मेरा जमीन पे कबज़ा हो गय'\n"
            "- अंग्रेज़ी-हिंदी मिश्रित: 'police ne FIR nahi likhi मेरी'\n"
            "- गलत स्पेलिंग/व्याकरण: 'मेरे पडोशी ने मरी जामीन चीन ली'\n"
            "- बहुत छोटा या अधूरा विवरण\n\n"
            "आपके नियम:\n"
            "1. पहले यूज़र के शब्दों का अर्थ पूरी तरह समझें — चाहे कैसी भी भाषा हो।\n"
            "2. पूरी बात को शुद्ध देवनागरी हिंदी में लिखें — कोई अंग्रेज़ी/Hinglish शब्द नहीं (FIR, RTI जैसे स्थापित शब्द रख सकते हैं)।\n"
            "3. व्याकरण, वर्तनी, विराम चिह्न सब सही करें।\n"
            "4. भाषा औपचारिक और स्पष्ट हो — जैसे कोई पढ़ा-लिखा व्यक्ति शिकायत लिख रहा हो।\n"
            "5. तथ्य वही रखें जो यूज़र ने बताए। कोई नई जानकारी न जोड़ें।\n"
            "6. वाक्य पूरे और सुसंगत हों। '।' से समाप्त हों।\n"
            "7. यदि विवरण छोटा है तो उसे थोड़ा विस्तृत करें (जैसे 'चोरी हो गई' → 'चोरी की घटना हुई'), लेकिन नए तथ्य न जोड़ें।\n"
            "8. संख्याएँ सही लिखें: '1lakh' → '1 लाख रुपये', '3 log' → 'तीन व्यक्ति'।\n\n"
            "उदाहरण:\n"
            "Input: mere ghar me kl chori ho gai rat ke lagbhar 12 baj rhe the 3 log pichhe se tala tod ke andar aaye aur mere 1lakh cash lekr chale gaye\n"
            "Output: कल रात लगभग 12 बजे मेरे घर में चोरी की घटना हुई। तीन अज्ञात व्यक्ति घर के पीछे से ताला तोड़कर अंदर आए और घर में रखी लगभग 1 लाख रुपये की नकद राशि लेकर फरार हो गए।\n\n"
            "Input: मेरा पडोशी ने मरी 2 बीघा जामीन पे कबज़ा कर लिया है वो मना नही कर रहा\n"
            "Output: मेरे पड़ोसी ने मेरी 2 बीघा ज़मीन पर अवैध कब्ज़ा कर लिया है। कई बार मना करने के बावजूद वह ज़मीन खाली करने से इनकार कर रहा है।\n\n"
            "Input: boss ne 3 month se salary nhi di aur office se nikal diya bina notice ke\n"
            "Output: मेरे नियोक्ता (बॉस) ने पिछले 3 महीने से वेतन का भुगतान नहीं किया है और बिना किसी पूर्व सूचना के मुझे कार्यालय से निकाल दिया है।\n\n"
            "केवल सुधरा हुआ हिंदी टेक्स्ट लौटाएं। कोई अतिरिक्त टिप्पणी या व्याख्या न दें।"
        )

        user_prompt = f"यूज़र का टेक्स्ट:\n{problem}"

        completion = self.ai_client.chat.completions.create(
            model='gpt-4o-mini',
            temperature=0.2,
            max_tokens=600,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ]
        )

        rewritten = (completion.choices[0].message.content or '').strip()
        if not rewritten:
            return self._rewrite_with_builtin(problem)

        return {'rewritten': rewritten}

    def _rewrite_with_builtin(self, problem):
        """Rewrite using built-in Hinglish-to-Hindi transliteration + formatting.
        
        Converts common Romanised Hindi words to Devanagari, then structures
        the text into a clean complaint paragraph.  Works WITHOUT any API key.
        """
        text = problem.strip()

        # --- Hinglish to Hindi word mapping (common legal/complaint words) ---
        hinglish_map = {
            # Pronouns & common words
            'mere': 'मेरे', 'mera': 'मेरा', 'meri': 'मेरी', 'mujhe': 'मुझे',
            'mujhse': 'मुझसे', 'mai': 'मैं', 'main': 'मैं', 'maine': 'मैंने',
            'hum': 'हम', 'humne': 'हमने', 'humara': 'हमारा', 'humare': 'हमारे',
            'hamari': 'हमारी', 'hamare': 'हमारे', 'hamara': 'हमारा',
            'uska': 'उसका', 'uski': 'उसकी', 'uske': 'उसके', 'unka': 'उनका',
            'unki': 'उनकी', 'unke': 'उनके', 'usne': 'उसने', 'unhone': 'उन्होंने',
            'wo': 'वो', 'woh': 'वह', 'ye': 'यह', 'yeh': 'यह',
            'koi': 'कोई', 'kisi': 'किसी', 'kisne': 'किसने',
            'apna': 'अपना', 'apni': 'अपनी', 'apne': 'अपने',

            # Verbs
            'hai': 'है', 'hain': 'हैं', 'tha': 'था', 'thi': 'थी', 'the': 'थे',
            'ho': 'हो', 'hua': 'हुआ', 'hui': 'हुई', 'hue': 'हुए',
            'gaya': 'गया', 'gayi': 'गई', 'gai': 'गई', 'gaye': 'गए',
            'kiya': 'किया', 'kiye': 'किए', 'ki': 'की', 'ka': 'का', 'ke': 'के',
            'kar': 'कर', 'karna': 'करना', 'karte': 'करते', 'karti': 'करती',
            'karke': 'करके', 'karenge': 'करेंगे',
            'diya': 'दिया', 'diye': 'दिए', 'di': 'दी', 'de': 'दे', 'dena': 'देना',
            'liya': 'लिया', 'liye': 'लिए', 'li': 'ली', 'le': 'ले', 'lena': 'लेना',
            'lekr': 'लेकर', 'lekar': 'लेकर', 'leker': 'लेकर',
            'chahiye': 'चाहिए', 'chaiye': 'चाहिए', 'chahie': 'चाहिए',
            'chahta': 'चाहता', 'chahti': 'चाहती', 'chahte': 'चाहते',
            'sakta': 'सकता', 'sakti': 'सकती', 'sakte': 'सकते',
            'pata': 'पता', 'maloom': 'मालूम', 'malum': 'मालूम',
            'kharch': 'खर्च', 'kharcha': 'खर्चा', 'kharche': 'खर्चे',
            'kitna': 'कितना', 'kitni': 'कितनी', 'kitne': 'कितने',
            'jitna': 'जितना', 'jitni': 'जितनी', 'jitne': 'जितने',
            'utna': 'उतना', 'utni': 'उतनी', 'utne': 'उतने',
            'sabhi': 'सभी', 'sab': 'सब',
            'poora': 'पूरा', 'pura': 'पूरा', 'puri': 'पूरी', 'pure': 'पूरे',
            'sahi': 'सही', 'galat': 'गलत',
            'zaroor': 'ज़रूर', 'jaroor': 'ज़रूर', 'zaruri': 'ज़रूरी',
            'pehle': 'पहले', 'pahle': 'पहले',
            'baad': 'बाद', 'iske': 'इसके', 'uske': 'उसके',
            'kuch': 'कुछ', 'kuchh': 'कुछ',
            'jaise': 'जैसे', 'waise': 'वैसे',
            'tarah': 'तरह', 'prakar': 'प्रकार',
            'raha': 'रहा', 'rahi': 'रही', 'rahe': 'रहे',
            'rhe': 'रहे', 'rha': 'रहा', 'rhi': 'रही',
            'aaya': 'आया', 'aayi': 'आई', 'aaye': 'आए',
            'aae': 'आए', 'aai': 'आई',
            'chale': 'चले', 'chala': 'चला', 'chali': 'चली',
            'bola': 'बोला', 'boli': 'बोली', 'bole': 'बोले', 'bolte': 'बोलते',
            'bulaya': 'बुलाया', 'bulayi': 'बुलाई', 'bulaye': 'बुलाए',
            'bulana': 'बुलाना', 'bulata': 'बुलाता', 'bulati': 'बुलाती',
            'maara': 'मारा', 'maari': 'मारी', 'maar': 'मार',
            'marta': 'मारता', 'marti': 'मारती', 'marte': 'मारते',
            'toda': 'तोड़ा', 'todi': 'तोड़ी', 'tod': 'तोड़', 'todke': 'तोड़कर',
            'todta': 'तोड़ता', 'todti': 'तोड़ती',
            'dekha': 'देखा', 'dekhi': 'देखी', 'dekhe': 'देखे',
            'dekhta': 'देखता', 'dekhti': 'देखती',
            'suna': 'सुना', 'suni': 'सुनी', 'sunwai': 'सुनवाई',
            'sunta': 'सुनता', 'sunti': 'सुनती', 'sunte': 'सुनते',
            'bataya': 'बताया', 'bataye': 'बताए',
            'batata': 'बताता', 'batati': 'बताती',
            'bhaga': 'भागा', 'bhag': 'भाग', 'bhaag': 'भाग',
            'bhagta': 'भागता', 'bhagti': 'भागती',
            'farar': 'फरार',
            'maang': 'माँग', 'maanga': 'माँगा', 'maangi': 'माँगी',
            'maangta': 'माँगता', 'maangti': 'माँगती',
            'rok': 'रोक', 'roka': 'रोका', 'roki': 'रोकी',
            'rokta': 'रोकता', 'rokti': 'रोकती',
            'kabza': 'कब्ज़ा', 'kabja': 'कब्ज़ा',
            'deta': 'देता', 'deti': 'देती', 'dete': 'देते',
            'leta': 'लेता', 'leti': 'लेती', 'lete': 'लेते',
            'karta': 'करता', 'karate': 'करते',
            'aata': 'आता', 'aati': 'आती', 'aate': 'आते',
            'jaata': 'जाता', 'jaati': 'जाती', 'jaate': 'जाते',
            'jata': 'जाता', 'jati': 'जाती', 'jate': 'जाते',
            'rehta': 'रहता', 'rehti': 'रहती', 'rehte': 'रहते',
            'nikla': 'निकला', 'nikli': 'निकली', 'nikle': 'निकले',
            'nikal': 'निकाल', 'nikalta': 'निकालता', 'nikalti': 'निकालती',
            'nikala': 'निकाला', 'nikali': 'निकाली',
            'peeta': 'पीटता', 'peeti': 'पीटती',
            'khata': 'खाता', 'khati': 'खाती', 'khate': 'खाते',
            'peeta_hai': 'पीटता है',
            'lagta': 'लगता', 'lagti': 'लगती', 'lagte': 'लगते',
            'milta': 'मिलता', 'milti': 'मिलती', 'milte': 'मिलते',
            'mila': 'मिला', 'mili': 'मिली', 'mile': 'मिले',
            'chalta': 'चलता', 'chalti': 'चलती', 'chalte': 'चलते',
            'puchha': 'पूछा', 'puchhi': 'पूछी', 'puchhe': 'पूछे',
            'puchta': 'पूछता', 'puchti': 'पूछती',
            'bechta': 'बेचता', 'bechti': 'बेचती',
            'becha': 'बेचा', 'bechi': 'बेची',

            # Time & place
            'kal': 'कल', 'aaj': 'आज', 'parso': 'परसों',
            'raat': 'रात', 'rat': 'रात', 'din': 'दिन', 'subah': 'सुबह',
            'sham': 'शाम', 'dopahar': 'दोपहर',
            'baje': 'बजे', 'baj': 'बज',
            'ghar': 'घर', 'dukaan': 'दुकान', 'kheti': 'खेती',
            'gaon': 'गाँव', 'gaav': 'गाँव', 'shehar': 'शहर',
            'bazaar': 'बाज़ार', 'bazar': 'बाज़ार',
            'thana': 'थाना', 'thaane': 'थाने',
            'office': 'कार्यालय',
            'andar': 'अंदर', 'bahar': 'बाहर',
            'pichhe': 'पीछे', 'peeche': 'पीछे',
            'aage': 'आगे', 'upar': 'ऊपर', 'neeche': 'नीचे',
            'paas': 'पास', 'door': 'दूर',
            'yahan': 'यहाँ', 'wahan': 'वहाँ',
            'jagah': 'जगह', 'taraf': 'तरफ़', 'saamne': 'सामने',
            'kamra': 'कमरा', 'kamre': 'कमरे', 'makaan': 'मकान',
            'rasta': 'रास्ता', 'raasta': 'रास्ता',
            'nadi': 'नदी', 'nala': 'नाला', 'khet': 'खेत',

            # People
            'padosi': 'पड़ोसी', 'padoshi': 'पड़ोसी',
            'log': 'लोग', 'aadmi': 'आदमी', 'vyakti': 'व्यक्ति',
            'ladka': 'लड़का', 'ladki': 'लड़की',
            'pati': 'पति', 'patni': 'पत्नी',
            'beta': 'बेटा', 'beti': 'बेटी',
            'bhai': 'भाई', 'behen': 'बहन',
            'papa': 'पिताजी', 'maa': 'माँ', 'baap': 'पिता',
            'sasur': 'ससुर', 'saas': 'सास',
            'patwari': 'पटवारी', 'pradhan': 'प्रधान',
            'police': 'पुलिस', 'daroga': 'दरोगा',

            # Legal & complaint words
            'chori': 'चोरी', 'loot': 'लूट', 'dhamki': 'धमकी',
            'dhamkaya': 'धमकाया', 'dhamka': 'धमका',
            'gaali': 'गाली', 'gali': 'गाली',
            'marpeet': 'मारपीट', 'maar': 'मार', 'peet': 'पीट',
            'zameen': 'ज़मीन', 'zamiin': 'ज़मीन', 'jamin': 'ज़मीन',
            'deewar': 'दीवार', 'diwar': 'दीवार',
            'tala': 'ताला', 'taala': 'ताला',
            'paise': 'पैसे', 'paisa': 'पैसा', 'rupaiye': 'रुपये', 'rupaye': 'रुपये',
            'cash': 'नकद राशि',
            'kagzaat': 'कागज़ात', 'kagjat': 'कागज़ात',
            'ration': 'राशन', 'card': 'कार्ड',
            'bijli': 'बिजली', 'paani': 'पानी', 'sadak': 'सड़क',
            'shikayat': 'शिकायत', 'avedan': 'आवेदन',
            'nuksaan': 'नुकसान', 'nuksan': 'नुकसान',

            # Connectors
            'aur': 'और', 'ya': 'या', 'lekin': 'लेकिन', 'par': 'पर',
            'mein': 'में', 'me': 'में', 'se': 'से', 'ko': 'को', 'ne': 'ने',
            'pe': 'पर', 'tak': 'तक', 'bhi': 'भी',
            'phir': 'फिर', 'uske baad': 'उसके बाद',
            'isliye': 'इसलिए', 'kyunki': 'क्योंकि',
            'kuch': 'कुछ', 'bahut': 'बहुत', 'bohot': 'बहुत',
            'lagbhag': 'लगभग', 'lagbhar': 'लगभग',
            'sirf': 'सिर्फ', 'bilkul': 'बिलकुल',
            'baar': 'बार', 'ek': 'एक', 'do': 'दो', 'teen': 'तीन',
            'chaar': 'चार', 'paanch': 'पाँच',

            # Misc
            'nahi': 'नहीं', 'nhi': 'नहीं', 'na': 'ना',
            'haan': 'हाँ', 'ji': 'जी',
            'kab': 'कब', 'kahan': 'कहाँ', 'kaise': 'कैसे',
            'kyon': 'क्यों', 'kya': 'क्या', 'kitna': 'कितना',
            'abhi': 'अभी', 'jab': 'जब', 'tab': 'तब',
            'wapas': 'वापस', 'dobara': 'दोबारा',
            'saath': 'साथ', 'sath': 'साथ',
            'roz': 'रोज़', 'roj': 'रोज़', 'rozana': 'रोज़ाना',
            'hamesha': 'हमेशा', 'hamesa': 'हमेशा',
            'bachcha': 'बच्चा', 'bachchi': 'बच्ची',
            'bachche': 'बच्चे', 'bachcho': 'बच्चों', 'bacho': 'बच्चों',
            'khaana': 'खाना', 'khana': 'खाना',
            'peena': 'पीना', 'pina': 'पीना',
            'jaankari': 'जानकारी', 'jankari': 'जानकारी',
            'saman': 'सामान', 'samaan': 'सामान',
            'kapda': 'कपड़ा', 'kapde': 'कपड़े',
            'zewar': 'ज़ेवर', 'jewar': 'ज़ेवर', 'zever': 'ज़ेवर',
            'makan': 'मकान', 'gadi': 'गाड़ी', 'gaadi': 'गाड़ी',
            'cycle': 'साइकिल', 'mobile': 'मोबाइल', 'phone': 'फ़ोन',
            'kaam': 'काम', 'naukri': 'नौकरी',
            'padhai': 'पढ़ाई', 'padhna': 'पढ़ना',
            'bimaari': 'बीमारी', 'bimari': 'बीमारी',
            'ilaaj': 'इलाज', 'ilaj': 'इलाज',
            'hospital': 'अस्पताल', 'aspatal': 'अस्पताल',
            'school': 'स्कूल', 'skool': 'स्कूल',
            'sarkaar': 'सरकार', 'sarkar': 'सरकार',
            'afsar': 'अफ़सर', 'adhikari': 'अधिकारी',
            'madat': 'मदद', 'sahayata': 'सहायता',
            'suraksha': 'सुरक्षा', 'nyay': 'न्याय', 'insaaf': 'इंसाफ़',
            'kanoon': 'कानून', 'kaanoon': 'कानून',
            'haq': 'हक़', 'adhikar': 'अधिकार',
            'jaan': 'जान', 'khatra': 'ख़तरा', 'khatara': 'ख़तरा',
            'darr': 'डर', 'dar': 'डर',
            'takleef': 'तकलीफ़', 'taklif': 'तकलीफ़',
            'pareshaan': 'परेशान', 'pareshan': 'परेशान',
            'mushkil': 'मुश्किल',
            'majboor': 'मजबूर', 'majbur': 'मजबूर',
            'galat': 'गलत', 'sahi': 'सही',
            'saboot': 'सबूत', 'gawah': 'गवाह',
            'dahej': 'दहेज', 'dahez': 'दहेज',
            'sharab': 'शराब', 'nashe': 'नशे', 'nasha': 'नशा',
            'hinsa': 'हिंसा', 'atyachaar': 'अत्याचार',
            'bigha': 'बीघा',
            'lakh': 'लाख', 'hazar': 'हज़ार', 'hazaar': 'हज़ार',
        }

        # Convert Hinglish words to Hindi
        words = text.split()
        converted = []
        for word in words:
            # Strip punctuation for lookup, preserve it after
            clean = word.strip('.,;:!?।|')
            trail = word[len(clean):] if len(word) > len(clean) else ''
            lookup = clean.lower()
            if lookup in hinglish_map:
                converted.append(hinglish_map[lookup] + trail)
            else:
                # Check for number+word combos like "1lakh"
                import re
                m = re.match(r'^(\d+)(lakh|hazar|hazaar|rupaiye|rupaye)$', lookup)
                if m:
                    num = m.group(1)
                    unit = hinglish_map.get(m.group(2), m.group(2))
                    converted.append(f'{num} {unit}{trail}')
                else:
                    converted.append(word)

        hindi_text = ' '.join(converted)

        # Split into sentences
        sentences = []
        for sep in ['।', '.', '|', '\n']:
            if sep in hindi_text:
                sentences = [s.strip() for s in hindi_text.split(sep) if s.strip()]
                break
        if not sentences:
            sentences = [hindi_text]

        # Build clean structured paragraph
        result_parts = []
        for i, sentence in enumerate(sentences):
            s = sentence.strip().rstrip('।. ')
            if s:
                result_parts.append(s)

        rewritten = '। '.join(result_parts)
        if rewritten and not rewritten.endswith('।'):
            rewritten += '।'

        return {'rewritten': rewritten}
    
    def _generate_land_dispute_draft(self, details, language='hindi'):
        """Generate land dispute complaint letter"""
        
        if language == 'english':
            draft = f"""To,
The District Magistrate/Sub-Divisional Officer,
District Office,
District: _________________________

Date: {self.current_date}

Subject: Complaint Regarding Land Dispute / Illegal Occupation

Respected Sir/Madam,

Applicant Details:
• Name: _________________________
• Address: _________________________

I hereby bring to your notice the following land dispute:

Description of Problem:
{details}

Details of My Land:
• Khesra Number/Plot No: _________________________
• Khata Number/Account No: _________________________
• Area/Size: _________________________ (Bigha/Hectare)
• Village/Locality: _________________________

I respectfully request you to take appropriate action on my complaint and secure my property rights.

Enclosures:
1. Certified copy of Khesra-Khatauni (Land records)
2. Land Map/Sketch
3. Identity Proof
4. Other relevant documents

Thanking you,

Yours faithfully,
Name: _________________________
Phone No.: _________________________
Address: _________________________"""

            return {
                'draft': draft,
                'tips': [
                    'Attach certified copies of land records (Khesra-Khatauni)',
                    'Get a copy of your petition when submitting',
                    'Keep the receipt of submission for future reference',
                    'Also file copy with Tehsildar (Revenue Officer)',
                    'Consider mediation through Gram Panchayat first'
                ],
                'submitTo': [
                    'District Magistrate Office',
                    'Tehsildar/Revenue Officer',
                    'Sub-Divisional Officer',
                    'Revenue Department'
                ]
            }
        
        else:  # Hindi version
            draft = f"""सेवा में,
श्रीमान जिलाधिकारी/उप-जिलाधिकारी महोदय,
जिला कार्यालय,
जिला: _________________________

दिनांक: {self.current_date}

विषय: भूमि विवाद/अवैध कब्ज़े के संबंध में शिकायत

महोदय,

आवेदक का विवरण:
• नाम: _________________________
• पता: _________________________

मैं आपके संज्ञान में निम्नलिखित भूमि विवाद लाना चाहता/चाहती हूँ:

समस्या का विवरण:
{details}

मेरी ज़मीन का विवरण:
• खसरा नंबर: _________________________
• खाता नंबर: _________________________
• क्षेत्रफल: _________________________ (बीघा/हेक्टेयर)
• ग्राम/मोहल्ला: _________________________

अतः श्रीमान से विनम्र निवेदन है कि मेरी शिकायत पर उचित कार्यवाही करते हुए मुझे न्याय दिलाने की कृपा करें।

संलग्नक:
1. खसरा-खतौनी की प्रमाणित प्रति
2. भूमि का नक्शा
3. पहचान पत्र की प्रति
4. अन्य संबंधित दस्तावेज़

धन्यवाद सहित,

भवदीय,
नाम: _________________________
मोबाइल नंबर: _________________________
पता: _________________________"""

            return {
                'draft': draft,
                'tips': [
                    'खसरा-खतौनी की प्रमाणित प्रति अवश्य संलग्न करें',
                    'शिकायत की 2 प्रतियां बनाएं - एक अपने पास रखें',
                    'जमा करते समय रसीद अवश्य लें',
                    'तहसीलदार कार्यालय में भी प्रति जमा करें',
                    'पहले ग्राम पंचायत से सुलह-समझौते की कोशिश करें'
                ],
                'submitTo': [
                    'जिलाधिकारी कार्यालय',
                    'तहसीलदार कार्यालय',
                    'उप-जिलाधिकारी कार्यालय',
                    'राजस्व विभाग'
                ]
            }
    
    def _generate_family_dispute_draft(self, details, language='hindi'):
        """Generate family dispute application"""
        
        if language == 'english':
            draft = f"""To,
The Hon'ble Judge,
Family Court,
District: _________________________

Date: {self.current_date}

Subject: Application for Resolution of Family Dispute

Respected Sir/Madam,

Applicant Details:
• Name: _________________________
• Father/Husband Name: _________________________
• Address: _________________________

I hereby submit the following family dispute for resolution:

Description of Problem:
{details}

Family Details:
• Date of Marriage: _________________________
• Number of Children: _________________________
• Current Situation: _________________________

Prayer/Relief Sought:
I humbly request you to hear my case and pass appropriate orders for resolution of this family matter.

Enclosures:
1. Marriage Certificate
2. Identity Proof
3. Proof of Residence
4. Other relevant documents

Yours faithfully,
Petitioner's Signature
Name: _________________________
Phone No.: _________________________
Address: _________________________"""

            return {
                'draft': draft,
                'tips': [
                    'First try Family Counselling Centre for mediation',
                    'Marriage certificate must be attached',
                    'Women Helpline: 181 (available 24/7)',
                    'Seek free legal aid from District Legal Services Authority (DLSA)',
                    'Document all incidents with dates and witnesses'
                ],
                'submitTo': [
                    'Family Court',
                    'Women Commission',
                    'District Legal Services Authority (DLSA)',
                    'Family Counselling Centre'
                ]
            }
        
        else:  # Hindi version
            draft = f"""सेवा में,
श्रीमान न्यायाधीश महोदय,
परिवार न्यायालय,
जिला: _________________________

दिनांक: {self.current_date}

विषय: पारिवारिक विवाद के संबंध में आवेदन

महोदय,

आवेदक का विवरण:
• नाम: _________________________
• पिता/पति का नाम: _________________________
• पता: _________________________

मैं निम्नलिखित पारिवारिक विवाद के समाधान हेतु आपकी सेवा में उपस्थित हूँ:

समस्या का विवरण:
{details}

परिवार का विवरण:
• विवाह की तिथि: _________________________
• बच्चों की संख्या: _________________________
• वर्तमान स्थिति: _________________________

प्रार्थना:
अतः श्रीमान से विनम्र निवेदन है कि मेरे प्रकरण की सुनवाई कर उचित आदेश पारित करने की कृपा करें।

संलग्नक:
1. विवाह प्रमाण पत्र
2. पहचान पत्र
3. निवास प्रमाण
4. अन्य संबंधित दस्तावेज़

धन्यवाद सहित,

प्रार्थी,
नाम: _________________________
मोबाइल नंबर: _________________________
पता: _________________________"""

            return {
                'draft': draft,
                'tips': [
                    'पहले परिवार परामर्श केंद्र से संपर्क करें',
                    'विवाह प्रमाण पत्र अवश्य संलग्न करें',
                    'महिला हेल्पलाइन 181 से मार्गदर्शन लें (24 घंटे)',
                    'मुफ्त कानूनी सहायता के लिए DLSA से संपर्क करें',
                    'सभी घटनाएं तिथि और गवाहों के साथ दस्तावेज़ करें'
                ],
                'submitTo': [
                    'परिवार न्यायालय',
                    'महिला आयोग',
                    'जिला विधिक सेवा प्राधिकरण',
                    'परिवार परामर्श केंद्र'
                ]
            }
    
    def _generate_domestic_violence_draft(self, details, language='hindi'):
        """Generate domestic violence complaint"""
        
        if language == 'english':
            draft = f"""To,
The Police Officer-in-Charge / Lady Police Officer,
Police Station: _________________________
District: _________________________

Date: {self.current_date}

Subject: Complaint of Domestic Violence - IPC Section 498A / Domestic Violence Act 2005

Respected Sir/Madam,

Applicant Details:
• Name: _________________________
• Husband Name: _________________________
• Address: _________________________

I hereby lodge the following complaint:

Details of Incident:
{details}

Details of Accused:
• Name: _________________________
• Relationship: _________________________
• Address: _________________________

I request you to:
1. Register my FIR immediately
2. Initiate appropriate legal action against the accused
3. Provide me with protection and safety

Enclosures:
1. Identity Proof
2. Medical Report (if injured)
3. Marriage Certificate
4. Photos/Evidence (if available)

Complaint Lodger,
Name: _________________________
Phone No.: _________________________
Address: _________________________"""

            return {
                'draft': draft,
                'tips': [
                    'Call Police (100) or Women Helpline (181) immediately',
                    'Get medical examination done if injured - report is evidence',
                    'Get a copy of the registered FIR for records',
                    'Visit nearest One Stop Centre for support',
                    'You can file complaint without proof - police will investigate',
                    'Know your rights under Domestic Violence Act'
                ],
                'submitTo': [
                    'Nearest Police Station',
                    'Lady Police Station',
                    'Women Commission',
                    'One Stop Centre'
                ],
                'emergencyContacts': [
                    {'name': 'Police Emergency', 'number': '100'},
                    {'name': 'Women Helpline', 'number': '181'},
                    {'name': 'Women Commission', 'number': '7827-170-170'}
                ]
            }
        
        else:  # Hindi version
            draft = f"""सेवा में,
श्रीमान थानाध्यक्ष/महिला थाना प्रभारी,
थाना: _________________________
जिला: _________________________

दिनांक: {self.current_date}

विषय: घरेलू हिंसा की शिकायत - धारा 498A IPC / घरेलू हिंसा अधिनियम 2005

महोदय,

आवेदक का विवरण:
• नाम: _________________________
• पति का नाम: _________________________
• पता: _________________________

मैं निम्नलिखित शिकायत दर्ज करवाना चाहती हूँ:

घटना का विवरण:
{details}

आरोपी का विवरण:
• नाम: _________________________
• संबंध: _________________________
• पता: _________________________

प्रार्थना:
1. मेरी FIR दर्ज की जाए
2. आरोपियों के विरुद्ध कार्यवाही की जाए
3. मुझे सुरक्षा प्रदान की जाए

संलग्नक:
1. पहचान पत्र
2. मेडिकल रिपोर्ट (यदि हो)
3. विवाह प्रमाण पत्र
4. फोटो/अन्य प्रमाण

शिकायतकर्ता,
नाम: _________________________
मोबाइल नंबर: _________________________
पता: _________________________"""

            return {
                'draft': draft,
                'tips': [
                    'तुरंत 100 या महिला हेल्पलाइन 181 पर कॉल करें',
                    'चोट लगी हो तो पहले मेडिकल जाँच करवाएं - रिपोर्ट साक्ष्य है',
                    'FIR की कॉपी अवश्य लें',
                    'One Stop Centre से मदद लें',
                    'प्रमाण न हो तो भी शिकायत दर्ज करवाएं - पुलिस अन्वेषण करेगी',
                    'घरेलू हिंसा अधिनियम के तहत अपने अधिकार जानें'
                ],
                'submitTo': [
                    'नज़दीकी पुलिस थाना',
                    'महिला थाना',
                    'महिला आयोग',
                    'One Stop Centre'
                ],
                'emergencyContacts': [
                    {'name': 'पुलिस', 'number': '100'},
                    {'name': 'महिला हेल्पलाइन', 'number': '181'},
                    {'name': 'महिला आयोग', 'number': '7827-170-170'}
                ]
            }
    
    def _generate_consumer_complaint_draft(self, details, language='hindi'):
        """Generate consumer complaint"""
        draft = f"""सेवा में,
श्रीमान अध्यक्ष,
जिला उपभोक्ता विवाद निवारण आयोग,
[जिले का नाम]

दिनांक: {self.current_date}

विषय: उपभोक्ता शिकायत - सेवा में कमी/दोषपूर्ण उत्पाद

महोदय,

मैं, नीचे हस्ताक्षरकर्ता, निम्नलिखित उपभोक्ता शिकायत दर्ज करना चाहता/चाहती हूँ:

आवेदक का विवरण:
• नाम: _________________________
• पता: _________________________

शिकायत का विवरण:
{details}

प्रतिवादी (विक्रेता/कंपनी) का विवरण:
• नाम: [कंपनी/दुकान का नाम]
• पता: [पता]
• खरीदारी की तिथि: [तिथि]
• रसीद/बिल नंबर: [नंबर]
• भुगतान की राशि: ₹[राशि]

क्षतिपूर्ति की माँग:
1. रिफंड/बदली: ₹[राशि]
2. मानसिक क्षतिपूर्ति: ₹[राशि]
3. वाद व्यय: ₹[राशि]

संलग्नक:
1. खरीदारी की रसीद/बिल
2. वारंटी कार्ड
3. उत्पाद की फोटो
4. पत्राचार की प्रतियाँ

प्रार्थी,
नाम: _________________________
मोबाइल नंबर: _________________________
ईमेल: _________________________"""

        return {
            'draft': draft,
            'tips': [
                'पहले विक्रेता को लिखित शिकायत दें',
                'consumerhelpline.gov.in पर ऑनलाइन शिकायत करें',
                'बिल और वारंटी कार्ड अवश्य संलग्न करें',
                '₹1 लाख तक की शिकायत पर कोई फीस नहीं'
            ],
            'submitTo': [
                'जिला उपभोक्ता फोरम',
                'National Consumer Helpline (1800-11-4000)',
                'ई-दाखिल पोर्टल (edaakhil.nic.in)'
            ]
        }
    
    def _generate_employment_draft(self, details, language='hindi'):
        """Generate employment related complaint"""
        draft = f"""सेवा में,
श्रीमान श्रम आयुक्त/सहायक श्रम आयुक्त,
श्रम विभाग,
[जिले का नाम]

दिनांक: {self.current_date}

विषय: वेतन/सेवा संबंधी शिकायत

महोदय,

मैं, नीचे हस्ताक्षरकर्ता, कर्मचारी _________________________ (कंपनी का नाम), निम्नलिखित शिकायत दर्ज करना चाहता/चाहती हूँ:

आवेदक का विवरण:
• नाम: _________________________
• पता: _________________________

शिकायत का विवरण:
{details}

नियोक्ता का विवरण:
• कंपनी का नाम: [नाम]
• पता: [पता]
• कार्य की अवधि: [तिथि से तिथि तक]
• पद: [पद का नाम]
• मासिक वेतन: ₹[राशि]

बकाया राशि का विवरण:
• वेतन बकाया: ₹[राशि]
• PF बकाया: ₹[राशि]
• अन्य: ₹[राशि]

संलग्नक:
1. नियुक्ति पत्र
2. सैलरी स्लिप
3. PF स्टेटमेंट
4. पहचान पत्र

प्रार्थी,
नाम: _________________________
मोबाइल नंबर: _________________________"""

        return {
            'draft': draft,
            'tips': [
                'नियुक्ति पत्र और सैलरी स्लिप ज़रूरी हैं',
                'PF शिकायत के लिए EPFO पोर्टल पर जाएं',
                'श्रम हेल्पलाइन 14434 पर कॉल करें',
                '90 दिन के अंदर शिकायत करें'
            ],
            'submitTo': [
                'श्रम विभाग कार्यालय',
                'श्रम न्यायालय',
                'EPFO कार्यालय (PF संबंधी)'
            ]
        }
    
    def _generate_police_complaint_draft(self, details, language='hindi'):
        """Generate police complaint (FIR) in Hindi or English"""
        
        if language == 'english':
            draft = f"""To,
The Police Officer-in-Charge,
Police Station: _________________________
District: _________________________

Date: {self.current_date}

Subject: Application for Registration of First Information Report (FIR)

Respected Sir/Madam,

Applicant Details:
• Name: _________________________
• Father's Name: _________________________
• Address: _________________________

I hereby lodge the following complaint:

Details of Incident:
{details}

Information about the Incident:
• Date of Incident: _________________________
• Time of Incident: _________________________
• Place of Incident: _________________________

Details of Accused (if known):
• Name: _________________________
• Address: _________________________
• Identification: _________________________

Witnesses (if any):
1. Name: _________________________, Address: _________________________

I request you to register my FIR and take appropriate legal action against the accused.

Submitted by,
Name: _________________________
Phone No.: _________________________
Address: _________________________"""

            return {
                'draft': draft,
                'tips': [
                    'Always obtain a copy of the registered FIR',
                    'If FIR is not registered, file a complaint with SP/DM',
                    'Online FIR option is available on state police websites',
                    'Zero FIR can be filed at any police station',
                    'Keep all supporting documents and medical reports if injured'
                ],
                'submitTo': [
                    'Nearest Police Station',
                    'SP Office (if not heard at local station)',
                    'Online FIR Portal (state police website)',
                    'National Crime Records Bureau'
                ]
            }
        
        else:  # Hindi version
            draft = f"""सेवा में,
श्रीमान थानाध्यक्ष,
थाना: _________________________
जिला: _________________________

दिनांक: {self.current_date}

विषय: प्राथमिकी (FIR) दर्ज करने हेतु प्रार्थना पत्र

महोदय,

आवेदक का विवरण:
• नाम: _________________________
• पिता का नाम: _________________________
• पता: _________________________

मैं निम्नलिखित घटना की शिकायत दर्ज करवाना चाहता/चाहती हूँ:

घटना का विवरण:
{details}

घटना की जानकारी:
• घटना की तिथि: _________________________
• घटना का समय: _________________________
• घटना का स्थान: _________________________

आरोपी का विवरण (यदि ज्ञात हो):
• नाम: _________________________
• पता: _________________________
• पहचान: _________________________

गवाह (यदि कोई हो):
1. नाम: _________________________, पता: _________________________

प्रार्थना:
कृपया मेरी FIR दर्ज कर उचित कार्यवाही करें।

प्रार्थी,
नाम: _________________________
मोबाइल नंबर: _________________________
पता: _________________________"""

            return {
                'draft': draft,
                'tips': [
                    'FIR दर्ज होने पर कॉपी अवश्य लें',
                    'यदि FIR न लिखी जाए तो SP/DM को शिकायत करें',
                    'ऑनलाइन FIR: राज्य पुलिस वेबसाइट पर',
                    'Zero FIR का विकल्प भी उपलब्ध है',
                    'चोट लगी हो तो मेडिकल रिपोर्ट अवश्य प्राप्त करें'
                ],
                'submitTo': [
                    'नज़दीकी पुलिस थाना',
                    'SP कार्यालय (यदि थाने में न सुनी जाए)',
                    'ऑनलाइन FIR पोर्टल',
                    'राष्ट्रीय अपराध रिकॉर्ड ब्यूरो'
                ]
            }
    
    def _generate_court_affidavit_draft(self, details, language='hindi'):
        """Generate court affidavit (शपथ पत्र)"""
        draft = f"""शपथ पत्र
(Affidavit)

न्यायालय श्रीमान [न्यायाधीश पद], [न्यायालय का नाम]
[जिले का नाम], [राज्य]

वाद संख्या: _______________
[वादी का नाम] ........................ वादी
बनाम
[प्रतिवादी का नाम] ........................ प्रतिवादी

दिनांक: {self.current_date}

मैं, नीचे हस्ताक्षरकर्ता, शपथपूर्वक कथन करता/करती हूँ कि:

शपथकर्ता का विवरण:
• नाम: _________________________
• पिता/पति का नाम: _________________________
• आयु: _________________________ वर्ष
• पता: _________________________

1. मैं उपरोक्त वाद में वादी/प्रतिवादी/साक्षी हूँ और इस मामले से पूर्ण रूप से परिचित हूँ।

2. निम्नलिखित तथ्य मेरी व्यक्तिगत जानकारी में हैं और सत्य हैं:

{details}

3. यह शपथ पत्र स्वेच्छा से बिना किसी दबाव या प्रलोभन के दिया जा रहा है।

4. इस शपथ पत्र की सामग्री मेरी जानकारी और विश्वास के अनुसार सत्य है। इसमें कुछ भी छिपाया नहीं गया है और कोई भाग असत्य नहीं है।

5. मुझे ज्ञात है कि यदि इस शपथ पत्र में कोई बात असत्य पाई गई तो मेरे विरुद्ध भारतीय दण्ड संहिता की धारा 191/199 के अंतर्गत मिथ्या साक्ष्य/मिथ्या शपथ पत्र हेतु कार्यवाही की जा सकती है।

सत्यापन:
मैं उपरोक्त शपथ पत्र की सामग्री को सत्य एवं सही पाते हुए आज दिनांक _____________ को [स्थान] में सत्यापित करता/करती हूँ।

शपथकर्ता

हस्ताक्षर: _______________________
नाम: _________________________

_______________________
(नोटरी/ओथ कमिश्नर की मुहर एवं हस्ताक्षर)

संलग्नक:
1. पहचान पत्र (आधार/वोटर ID)
2. पासपोर्ट साइज़ फोटो"""

        return {
            'draft': draft,
            'tips': [
                'शपथ पत्र को नोटरी से सत्यापित कराना अनिवार्य है',
                'नोटरी शुल्क ₹10-50 होता है',
                '₹10 का स्टांप पेपर पर लिखें',
                'सभी तथ्य सत्य लिखें - मिथ्या शपथ पत्र अपराध है',
                'दो प्रतियाँ बनवाएं - एक कोर्ट के लिए, एक अपने पास'
            ],
            'submitTo': [
                'संबंधित न्यायालय',
                'नोटरी कार्यालय (सत्यापन हेतु)',
                'ओथ कमिश्नर कार्यालय'
            ]
        }
    
    def _generate_rti_draft(self, details, language='hindi'):
        """Generate RTI application"""
        draft = f"""सेवा में,
श्रीमान जन सूचना अधिकारी (PIO),
[विभाग का नाम],
[कार्यालय का पता]

दिनांक: {self.current_date}

विषय: सूचना का अधिकार अधिनियम, 2005 के तहत सूचना प्राप्ति हेतु आवेदन

महोदय,

सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के अंतर्गत मैं निम्नलिखित सूचना प्राप्त करना चाहता/चाहती हूँ:

मांगी गई सूचना का विवरण:
{details}

सूचना का प्रारूप: [प्रिंट/फोटोकॉपी/सॉफ्ट कॉपी]

सूचना की अवधि: [तिथि से तिथि तक]

मैं इस आवेदन के साथ ₹10 (दस रुपये) का शुल्क [पोस्टल ऑर्डर/कोर्ट फीस स्टांप/ऑनलाइन] के माध्यम से जमा कर रहा/रही हूँ।

[यदि BPL हों तो: मैं गरीबी रेखा से नीचे (BPL) श्रेणी में आता/आती हूँ, अतः मुझे शुल्क से छूट प्राप्त है। BPL कार्ड की प्रति संलग्न है।]

आवेदक का विवरण:
नाम: _________________________
पता: _________________________
फोन: _________________________
ईमेल: _________________________

हस्ताक्षर: _________________________
नाम: _________________________"""

        return {
            'draft': draft,
            'tips': [
                'आवेदन शुल्क ₹10 है (BPL के लिए मुफ्त)',
                '30 दिनों में जवाब मिलना चाहिए',
                'जवाब न मिले तो प्रथम अपीलीय अधिकारी को लिखें',
                'rtionline.gov.in पर ऑनलाइन भी आवेदन कर सकते हैं'
            ],
            'submitTo': [
                'संबंधित विभाग का PIO कार्यालय',
                'rtionline.gov.in (केंद्र सरकार के लिए)',
                'राज्य RTI पोर्टल (राज्य सरकार के लिए)'
            ]
        }
    
    def _generate_pension_draft(self, details, language='hindi'):
        """Generate pension related application"""
        draft = f"""सेवा में,
श्रीमान जिला समाज कल्याण अधिकारी/पेंशन अधिकारी,
[जिले का नाम]

दिनांक: {self.current_date}

विषय: वृद्धावस्था/विधवा/विकलांग पेंशन हेतु आवेदन/शिकायत

महोदय,

मैं, नीचे हस्ताक्षरकर्ता, निम्नलिखित निवेदन करता/करती हूँ:

आवेदक का विवरण:
• नाम: _________________________
• आयु: _________________________ वर्ष
• पता: _________________________

विवरण:
{details}

व्यक्तिगत जानकारी:
• जन्म तिथि: [तिथि]
• आधार नंबर: [नंबर]
• बैंक खाता: [खाता नंबर]
• IFSC कोड: [कोड]

संलग्नक:
1. आधार कार्ड
2. आयु प्रमाण पत्र
3. आय प्रमाण पत्र
4. बैंक पासबुक की प्रति
5. फोटो

प्रार्थी,
नाम: _________________________
मोबाइल नंबर: _________________________"""

        return {
            'draft': draft,
            'tips': [
                'आयु प्रमाण के लिए जन्म प्रमाण पत्र/आधार दें',
                'बैंक खाता आधार से लिंक होना चाहिए',
                'आवेदन जमा करने की रसीद लें',
                'ऑनलाइन आवेदन भी कर सकते हैं'
            ],
            'submitTo': [
                'समाज कल्याण विभाग',
                'ब्लॉक/तहसील कार्यालय',
                'CSC केंद्र (ऑनलाइन आवेदन)'
            ]
        }
    
    def _generate_certificate_draft(self, details, language='hindi'):
        """Generate certificate application"""
        draft = f"""सेवा में,
श्रीमान तहसीलदार/उप-जिलाधिकारी,
तहसील कार्यालय,
[तहसील का नाम], [जिले का नाम]

दिनांक: {self.current_date}

विषय: जाति/आय/निवास प्रमाण पत्र हेतु आवेदन

महोदय,

मैं, नीचे हस्ताक्षरकर्ता, निम्नलिखित प्रमाण पत्र प्राप्त करना चाहता/चाहती हूँ:

आवेदक का विवरण:
• नाम: _________________________
• पिता का नाम: _________________________
• पता: _________________________

विवरण:
{details}

व्यक्तिगत जानकारी:
• जन्म तिथि: [तिथि]
• जाति: [जाति]
• पिता का व्यवसाय: [व्यवसाय]
• वार्षिक आय: ₹[राशि]

संलग्नक:
1. आधार कार्ड
2. राशन कार्ड
3. पहचान पत्र
4. पुराना प्रमाण पत्र (यदि हो)
5. फोटो

प्रार्थी,
नाम: _________________________
मोबाइल नंबर: _________________________"""

        return {
            'draft': draft,
            'tips': [
                'ऑनलाइन आवेदन करें - तेज़ और आसान',
                'सभी दस्तावेज़ों की स्व-प्रमाणित प्रति दें',
                'CSC केंद्र से भी बनवा सकते हैं',
                '15-30 दिनों में प्रमाण पत्र मिलना चाहिए'
            ],
            'submitTo': [
                'तहसील कार्यालय',
                'CSC/जन सेवा केंद्र',
                'ई-डिस्ट्रिक्ट पोर्टल (ऑनलाइन)'
            ]
        }
    
    def _generate_ration_card_draft(self, details, language='hindi'):
        """Generate ration card application"""
        draft = f"""सेवा में,
श्रीमान जिला आपूर्ति अधिकारी,
खाद्य एवं रसद विभाग,
[जिले का नाम]

दिनांक: {self.current_date}

विषय: नया राशन कार्ड/राशन कार्ड में संशोधन हेतु आवेदन

महोदय,

मैं, नीचे हस्ताक्षरकर्ता, निम्नलिखित निवेदन करता/करती हूँ:

आवेदक का विवरण:
• नाम: _________________________
• पता: _________________________

विवरण:
{details}

परिवार की जानकारी:
• परिवार के मुखिया का नाम: [नाम]
• कुल सदस्य: [संख्या]
• वार्षिक आय: ₹[राशि]

परिवार के सदस्यों का विवरण:
1. [नाम] - [संबंध] - [आयु]
2. [नाम] - [संबंध] - [आयु]

संलग्नक:
1. आधार कार्ड (सभी सदस्यों के)
2. आय प्रमाण पत्र
3. निवास प्रमाण
4. पासपोर्ट साइज़ फोटो

प्रार्थी,
नाम: _________________________
मोबाइल नंबर: _________________________"""

        return {
            'draft': draft,
            'tips': [
                'सभी सदस्यों के आधार कार्ड ज़रूरी हैं',
                'ऑनलाइन आवेदन करें - nfsa.gov.in',
                'फोटो और बायोमेट्रिक के लिए बुलाया जाएगा',
                'e-Ration Card ऐप से स्टेटस चेक करें'
            ],
            'submitTo': [
                'खाद्य एवं रसद विभाग',
                'CSC/जन सेवा केंद्र',
                'nfsa.gov.in (ऑनलाइन)'
            ]
        }
    
    def _generate_general_draft(self, details, language='hindi'):
        """Generate general complaint letter"""
        draft = f"""सेवा में,
श्रीमान [अधिकारी का पद],
[विभाग/कार्यालय का नाम],
[पता]

दिनांक: {self.current_date}

विषय: शिकायत/आवेदन

महोदय,

सविनय निवेदन है कि मैं, नीचे हस्ताक्षरकर्ता, आपके संज्ञान में निम्नलिखित विषय लाना चाहता/चाहती हूँ:

आवेदक का विवरण:
• नाम: _________________________
• पता: _________________________

विवरण:
{details}

अतः श्रीमान से विनम्र निवेदन है कि मेरी समस्या पर उचित कार्यवाही करने की कृपा करें।

संलग्नक:
1. पहचान पत्र
2. संबंधित दस्तावेज़

धन्यवाद सहित,

भवदीय,
नाम: _________________________
मोबाइल नंबर: _________________________
पता: _________________________
ईमेल: _________________________"""

        return {
            'draft': draft,
            'tips': [
                'शिकायत की 2 प्रतियां बनाएं',
                'जमा करते समय रसीद अवश्य लें',
                'संबंधित दस्तावेज़ संलग्न करें',
                'जिला विधिक सेवा से मार्गदर्शन लें'
            ],
            'submitTo': [
                'संबंधित विभाग/कार्यालय',
                'जिलाधिकारी कार्यालय',
                'लोकायुक्त (यदि भ्रष्टाचार संबंधी हो)'
            ]
        }
