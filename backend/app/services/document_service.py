"""
Legal Document Scanner Service
- OCR text extraction using OCR.space API (free) or pytesseract (offline)
- Text summarization and simplification using Google Gemini API
- Outputs simple Hindi explanations for rural users
"""

import os
import re
import base64
import requests
from datetime import datetime, timedelta
from io import BytesIO

# Try to import pytesseract for offline OCR (optional)
try:
    import pytesseract
    from PIL import Image
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False

# Try to import Google Generative AI
try:
    import google.genai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class DocumentService:
    """Service for analyzing legal documents with real OCR and AI"""
    
    def __init__(self):
        # OCR.space API key (free tier: 25,000 requests/month)
        # Get free key at: https://ocr.space/ocrapi
        self.ocr_api_key = os.environ.get('OCR_SPACE_API_KEY', 'K85557640888957')
        
        # Google Gemini API key (free tier available)
        # Get free key at: https://makersuite.google.com/app/apikey
        self.gemini_api_key = os.environ.get('GEMINI_API_KEY', '')
        
        # Initialize Gemini if available
        if GENAI_AVAILABLE and self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.gemini_model = genai.GenerativeModel('gemini-pro')
        else:
            self.gemini_model = None
        
        # Document type patterns for classification
        self.doc_patterns = {
            'legal_notice': {
                'keywords': ['notice', 'नोटिस', 'hereby', 'demanded', 'legal', 'advocate', 'वकील', 'कानूनी', 'चेतावनी'],
                'name': 'कानूनी नोटिस (Legal Notice)',
                'urgency': 'high'
            },
            'fir': {
                'keywords': ['fir', 'first information report', 'प्रथम सूचना रिपोर्ट', 'police', 'थाना', 'धारा', 'ipc', 'bns', 'crpc', 'bnss'],
                'name': 'प्रथम सूचना रिपोर्ट (FIR)',
                'urgency': 'high'
            },
            'court_order': {
                'keywords': ['court', 'न्यायालय', 'order', 'आदेश', 'judge', 'petition', 'case no', 'केस नंबर', 'जज', 'माननीय'],
                'name': 'न्यायालय आदेश (Court Order)',
                'urgency': 'high'
            },
            'land_record': {
                'keywords': ['खतौनी', 'खसरा', 'भूमि', 'land', 'plot', 'registry', 'deed', 'पट्टा', 'रजिस्ट्री', 'जमीन', 'राजस्व', 'तहसील'],
                'name': 'भूमि दस्तावेज़ (Land Record)',
                'urgency': 'medium'
            },
            'government_letter': {
                'keywords': ['government', 'सरकारी', 'department', 'विभाग', 'office', 'कार्यालय', 'memo', 'circular', 'भारत सरकार', 'राज्य सरकार'],
                'name': 'सरकारी पत्र (Government Letter)',
                'urgency': 'medium'
            },
            'agreement': {
                'keywords': ['agreement', 'समझौता', 'contract', 'अनुबंध', 'party', 'witness', 'गवाह', 'करार', 'हस्ताक्षर'],
                'name': 'समझौता पत्र (Agreement)',
                'urgency': 'medium'
            },
            'resume': {
                'keywords': ['resume', 'cv', 'curriculum', 'objective', 'qualifications', 'skills', 'experience', 'education', 
                            'रिज़्यूमे', 'योग्यता', 'अनुभव', 'शिक्षा'],
                'name': 'रिज़्यूमे/CV (Resume)',
                'urgency': 'low'
            }
        }

    def analyze_document(self, file):
        """
        Main method to analyze uploaded document
        1. Extract text using OCR
        2. Classify document type
        3. Simplify text to Hindi
        4. Extract key points and dates
        """
        try:
            # Step 1: Extract text using OCR
            ocr_result = self._extract_text_ocr(file)
            
            if not ocr_result['success']:
                return {
                    'success': False,
                    'error': ocr_result.get('error', 'OCR failed'),
                    'message': 'दस्तावेज़ से टेक्स्ट नहीं निकाल पाए। कृपया साफ़ फोटो अपलोड करें।'
                }
            
            extracted_text = ocr_result['text']
            
            if len(extracted_text.strip()) < 20:
                return {
                    'success': False,
                    'error': 'Insufficient text extracted',
                    'message': 'दस्तावेज़ से पर्याप्त टेक्स्ट नहीं मिला। कृपया अच्छी क्वालिटी की फोटो अपलोड करें।'
                }
            
            # Step 2: Classify document type
            doc_type = self._classify_document(extracted_text)
            
            # Step 3: Simplify text (AI or rule-based)
            simplified = self._simplify_text(extracted_text, doc_type)
            
            # Step 4: Extract key information
            key_points = self._extract_key_points(extracted_text, doc_type)
            dates = self._extract_dates(extracted_text)
            
            # Step 5: Generate recommended actions
            actions = self._get_recommended_actions(doc_type)
            
            return {
                'success': True,
                'data': {
                    'documentType': doc_type,
                    'documentTypeName': self.doc_patterns.get(doc_type, {}).get('name', 'सामान्य दस्तावेज़'),
                    'urgencyLevel': self.doc_patterns.get(doc_type, {}).get('urgency', 'normal'),
                    'extractedText': extracted_text[:2000] + ('...' if len(extracted_text) > 2000 else ''),
                    'simplifiedText': simplified,
                    'keyPoints': key_points,
                    'importantDates': dates,
                    'recommendedActions': actions,
                    'ocrMethod': ocr_result.get('method', 'Unknown'),
                    'wordCount': len(extracted_text.split()),
                    'processedAt': datetime.now().strftime('%d/%m/%Y %H:%M')
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'दस्तावेज़ विश्लेषण में त्रुटि हुई। कृपया पुनः प्रयास करें।'
            }

    def _extract_text_ocr(self, file):
        """
        Extract text from document using OCR
        Primary: OCR.space API (free, supports Hindi)
        Fallback: pytesseract (offline)
        """
        filename = file.filename.lower()
        is_pdf = filename.endswith('.pdf')
        
        print(f"[OCR DEBUG] Processing file: {filename}, is_pdf: {is_pdf}")
        
        # Read file content
        file_content = file.read()
        file.seek(0)  # Reset file pointer
        
        print(f"[OCR DEBUG] File content size: {len(file_content)} bytes")
        
        if len(file_content) == 0:
            return {
                'success': False,
                'error': 'File is empty'
            }
        
        # Try OCR.space API first (better Hindi support)
        ocr_error = None
        try:
            print(f"[OCR DEBUG] Calling OCR.space API...")
            result = self._ocr_space_api(file_content, is_pdf, filename)
            print(f"[OCR DEBUG] OCR.space result: success={result.get('success')}, error={result.get('error', 'none')}")
            if result['success']:
                return result
            ocr_error = result.get('error', 'Unknown OCR error')
        except Exception as e:
            print(f"[OCR DEBUG] OCR.space API exception: {e}")
            import traceback
            traceback.print_exc()
            ocr_error = str(e)
        
        # Fallback to pytesseract if available
        if PYTESSERACT_AVAILABLE and not is_pdf:
            try:
                print(f"[OCR DEBUG] Trying pytesseract fallback...")
                result = self._pytesseract_ocr(file_content)
                if result['success']:
                    return result
            except Exception as e:
                print(f"[OCR DEBUG] Pytesseract failed: {e}")
        
        return {
            'success': False,
            'error': ocr_error or 'All OCR methods failed. Please try with a clearer image.'
        }

    def _ocr_space_api(self, file_content, is_pdf=False, filename='image.png'):
        """
        OCR using OCR.space API (Free: 25,000 requests/month)
        Supports: Hindi, English, and many other languages
        Uses multipart form upload for better reliability
        """
        import io
        url = 'https://api.ocr.space/parse/image'
        
        # Determine file type and extension
        filename_lower = filename.lower()
        if is_pdf or filename_lower.endswith('.pdf'):
            mime = 'application/pdf'
            filetype = 'PDF'
        elif filename_lower.endswith('.png'):
            mime = 'image/png'
            filetype = 'PNG'
        elif filename_lower.endswith('.gif'):
            mime = 'image/gif'
            filetype = 'GIF'
        elif filename_lower.endswith('.bmp'):
            mime = 'image/bmp'
            filetype = 'BMP'
        else:
            # Default to JPEG for .jpg, .jpeg, or unknown
            mime = 'image/jpeg'
            filetype = 'JPG'
        
        # Use multipart form upload (more reliable than base64)
        files = {
            'file': (filename, io.BytesIO(file_content), mime)
        }
        
        payload = {
            'apikey': self.ocr_api_key,
            'filetype': filetype,
            'language': 'eng',  # English (works well for Hindi too with Engine 1)
            'isOverlayRequired': 'false',
            'detectOrientation': 'true',
            'scale': 'true',
            'OCREngine': '1',  # Engine 1 supports more languages
        }
        
        print(f"[OCR API DEBUG] Sending multipart request: filetype={filetype}, mime={mime}, file_size={len(file_content)} bytes")
        
        response = requests.post(url, files=files, data=payload, timeout=60)
        print(f"[OCR API DEBUG] Response status: {response.status_code}")
        data = response.json()
        print(f"[OCR API DEBUG] Response data: OCRExitCode={data.get('OCRExitCode')}, IsErrored={data.get('IsErroredOnProcessing')}, ErrorMsg={data.get('ErrorMessage', 'none')}")
        
        if data.get('IsErroredOnProcessing', False):
            # Check if we still got partial results (e.g. page limit reached but some pages parsed)
            parsed_results = data.get('ParsedResults', [])
            partial_text = '\n'.join([r.get('ParsedText', '') for r in parsed_results]).strip()
            if partial_text and len(partial_text) > 20:
                return {
                    'success': True,
                    'text': partial_text,
                    'method': 'OCR.space API (Cloud - partial)'
                }
            error_messages = data.get('ErrorMessage', ['Unknown error'])
            if isinstance(error_messages, list):
                error_msg = error_messages[0] if error_messages else 'Unknown error'
            else:
                error_msg = str(error_messages)
            return {
                'success': False,
                'error': error_msg
            }
        
        # Extract text from all pages
        parsed_results = data.get('ParsedResults', [])
        if not parsed_results:
            return {
                'success': False,
                'error': 'No text found in document'
            }
        
        full_text = '\n'.join([r.get('ParsedText', '') for r in parsed_results])
        
        return {
            'success': True,
            'text': full_text.strip(),
            'method': 'OCR.space API (Cloud)'
        }

    def _pytesseract_ocr(self, file_content):
        """
        Offline OCR using pytesseract
        Requires: Tesseract-OCR installed on system
        """
        if not PYTESSERACT_AVAILABLE:
            return {'success': False, 'error': 'Pytesseract not available'}
        
        try:
            # Open image
            image = Image.open(BytesIO(file_content))
            
            # OCR with Hindi + English
            text = pytesseract.image_to_string(image, lang='hin+eng')
            
            return {
                'success': True,
                'text': text.strip(),
                'method': 'Pytesseract (Offline)'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def _classify_document(self, text):
        """Classify document type based on content keywords with minimum threshold"""
        text_lower = text.lower()
        
        # First, check if it's a resume
        resume_keywords = ['skills', 'experience', 'education', 'objective', 'summary', 'qualification', 
                          'कौशल', 'अनुभव', 'शिक्षा', 'योग्यता', 'b.tech', 'b.e', 'mba', 'b.sc']
        resume_score = sum(1 for keyword in resume_keywords if keyword in text_lower)
        
        if resume_score >= 3:  # At least 3 resume-related keywords
            return 'resume'
        
        scores = {}
        for doc_type, config in self.doc_patterns.items():
            score = sum(1 for keyword in config['keywords'] if keyword.lower() in text_lower)
            scores[doc_type] = score
        
        # Get highest scoring type with minimum threshold
        max_score = max(scores.values()) if scores else 0
        
        # Require at least 2 matching keywords for classification
        if max_score >= 2:
            return max(scores, key=scores.get)
        
        return 'general'

    def _simplify_text(self, text, doc_type):
        """
        Simplify legal text to simple Hindi
        Primary: Google Gemini API
        Fallback: Rule-based simplification
        """
        # Try AI simplification first
        if self.gemini_model:
            try:
                simplified = self._ai_simplify(text, doc_type)
                if simplified:
                    return simplified
            except Exception as e:
                print(f"Gemini API failed: {e}")
        
        # Fallback to rule-based simplification
        return self._rule_based_simplify(text, doc_type)

    def _ai_simplify(self, text, doc_type):
        """Use Google Gemini to simplify text"""
        if not self.gemini_model:
            return None
        
        prompt = f"""You are a legal assistant helping rural Indian users understand legal documents.
        
Task: Simplify the following legal document text into very simple Hindi that a village person can understand.

Document Type: {doc_type}

Original Text:
{text[:3000]}

Instructions:
1. Explain what this document is about in 2-3 simple lines
2. List what the person needs to do (if anything)
3. Mention any important deadlines
4. Use simple Hindi words, avoid English legal terms
5. Be direct and clear
6. If there are any warnings or urgent matters, highlight them

Format your response as:
📋 इस दस्तावेज़ का मतलब:
[explanation]

✅ आपको क्या करना है:
[actions if any]

⚠️ ध्यान दें:
[important warnings]
"""
        
        response = self.gemini_model.generate_content(prompt)
        return response.text

    def _rule_based_simplify(self, text, doc_type):
        """
        Rule-based text simplification that actually uses the extracted content.
        Creates a summary based on REAL data found in the document.
        """
        import re
        
        # Extract actual information from the text
        extracted_info = self._extract_all_info(text)
        
        # Build a summary based on actual content
        summary_parts = []
        
        # Document type header with specific info
        doc_type_headers = {
            'legal_notice': '📋 यह एक कानूनी नोटिस है',
            'fir': '📋 यह एक FIR (प्रथम सूचना रिपोर्ट) है',
            'court_order': '📋 यह न्यायालय का आदेश है',
            'land_record': '📋 यह भूमि/जमीन संबंधित दस्तावेज़ है',
            'government_letter': '📋 यह सरकारी पत्र है',
            'agreement': '📋 यह समझौता/अनुबंध पत्र है',
            'resume': '🎓 यह एक रिज़्यूमे/CV है',
            'general': '📋 दस्तावेज़ की जानकारी'
        }
        
        summary_parts.append(doc_type_headers.get(doc_type, '📋 दस्तावेज़ की जानकारी'))
        summary_parts.append("")
        
        # Add actual extracted information
        summary_parts.append("📝 दस्तावेज़ में पाई गई जानकारी:")
        
        info_found = False
        
        # Names found
        if extracted_info.get('names'):
            names_list = list(set(extracted_info['names']))[:5]  # Top 5 unique names
            summary_parts.append(f"• नाम: {', '.join(names_list)}")
            info_found = True
        
        # Dates found
        if extracted_info.get('dates'):
            dates_list = list(set(extracted_info['dates']))[:3]  # Top 3 dates
            summary_parts.append(f"• तारीख: {', '.join(dates_list)}")
            info_found = True
        
        # Amounts found
        if extracted_info.get('amounts'):
            amounts_list = list(set(extracted_info['amounts']))[:3]
            summary_parts.append(f"• राशि: {', '.join(['₹' + a for a in amounts_list])}")
            info_found = True
        
        # Case/Reference numbers
        if extracted_info.get('case_numbers'):
            summary_parts.append(f"• संदर्भ/केस नंबर: {', '.join(extracted_info['case_numbers'][:2])}")
            info_found = True
        
        # Phone numbers
        if extracted_info.get('phones'):
            summary_parts.append(f"• फोन नंबर: {', '.join(extracted_info['phones'][:2])}")
            info_found = True
        
        # Email addresses
        if extracted_info.get('emails'):
            summary_parts.append(f"• ईमेल: {', '.join(extracted_info['emails'][:2])}")
            info_found = True
        
        # Addresses
        if extracted_info.get('addresses'):
            summary_parts.append(f"• पता: {extracted_info['addresses'][0][:100]}...")
            info_found = True
        
        # If it looks like a resume/CV
        if extracted_info.get('is_resume'):
            summary_parts.append("")
            summary_parts.append("🎓 यह एक रिज़्यूमे/CV लग रहा है:")
            if extracted_info.get('skills'):
                summary_parts.append(f"• कौशल: {', '.join(extracted_info['skills'][:5])}")
            if extracted_info.get('education'):
                summary_parts.append(f"• शिक्षा: {', '.join(extracted_info['education'][:2])}")
            if extracted_info.get('experience'):
                summary_parts.append(f"• अनुभव: {', '.join(extracted_info['experience'][:2])}")
            info_found = True
        
        if not info_found:
            summary_parts.append("• दस्तावेज़ में विशेष जानकारी नहीं मिली")
        
        # Add first 500 characters of actual text as preview
        summary_parts.append("")
        summary_parts.append("📄 टेक्स्ट का सारांश:")
        clean_text = ' '.join(text.split())[:500]
        summary_parts.append(f"'{clean_text}...'")
        
        # Add recommendations based on document type
        summary_parts.append("")
        summary_parts.append("✅ सुझाव:")
        
        recommendations = {
            'legal_notice': [
                "• इस नोटिस का जवाब 15-30 दिन में दें",
                "• वकील से सलाह लें",
                "• NALSA हेल्पलाइन: 15100"
            ],
            'fir': [
                "• FIR की कॉपी सुरक्षित रखें",
                "• वकील से तुरंत मिलें",
                "• धाराओं के बारे में जानकारी लें"
            ],
            'court_order': [
                "• आदेश का पालन करें",
                "• अगली तारीख याद रखें",
                "• वकील से मिलें"
            ],
            'land_record': [
                "• तहसील से सत्यापित करें",
                "• मूल दस्तावेज़ सुरक्षित रखें",
                "• पटवारी से मिलें"
            ],
            'government_letter': [
                "• समय सीमा का ध्यान रखें",
                "• संबंधित कार्यालय से संपर्क करें",
                "• लिखित जवाब दें"
            ],
            'agreement': [
                "• सभी शर्तें ध्यान से पढ़ें",
                "• एक कॉपी अपने पास रखें",
                "• वकील से जाँच करवाएं"
            ],
            'resume': [
                "• अपनी योग्यता सही तरीके से प्रस्तुत करें",
                "• सभी दस्तावेज़ों की कॉपी तैयार रखें",
                "• संपर्क जानकारी सही होनी चाहिए"
            ],
            'general': [
                "• दस्तावेज़ सुरक्षित रखें",
                "• यदि कानूनी है तो वकील से मिलें",
                "• NALSA हेल्पलाइन: 15100"
            ]
        }
        
        for rec in recommendations.get(doc_type, recommendations['general']):
            summary_parts.append(rec)
        
        return '\n'.join(summary_parts)
    
    def _extract_all_info(self, text):
        """Extract all possible information from text"""
        import re
        
        info = {
            'names': [],
            'dates': [],
            'amounts': [],
            'case_numbers': [],
            'phones': [],
            'emails': [],
            'addresses': [],
            'skills': [],
            'education': [],
            'experience': [],
            'is_resume': False
        }
        
        # Detect if it's a resume - require multiple resume-related keywords
        resume_keywords = ['resume', 'cv', 'curriculum vitae', 'objective', 'experience', 
                          'education', 'skills', 'qualifications', 'career',
                          'रिज़्यूमे', 'अनुभव', 'शिक्षा', 'योग्यता']
        text_lower = text.lower()
        resume_keyword_count = sum(1 for kw in resume_keywords if kw in text_lower)
        # Require at least 3 resume keywords for detection
        if resume_keyword_count >= 3:
            info['is_resume'] = True
        
        # Extract dates with better validation
        date_patterns = [
            r'\b(?:0?[1-9]|[12][0-9]|3[01])[/\-](?:0?[1-9]|1[0-2])[/\-]\d{2,4}\b',  # DD/MM/YYYY with validation
            r'\b\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{2,4}\b',
            r'\b\d{1,2}\s+(?:जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|दिसंबर)\s+\d{2,4}\b',
        ]
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if match not in info['dates'] and len(info['dates']) < 5:
                    info['dates'].append(match)
        
        # Extract amounts
        amount_patterns = [
            r'(?:rs\.?|₹|inr)\s*([0-9,]+(?:\.[0-9]+)?)',
            r'([0-9,]+(?:\.[0-9]+)?)\s*(?:rupees|रुपये)',
        ]
        for pattern in amount_patterns:
            info['amounts'].extend(re.findall(pattern, text, re.IGNORECASE))
        
        # Extract phone numbers
        phone_pattern = r'\b(?:\+91[\-\s]?)?[6-9]\d{9}\b'
        info['phones'] = re.findall(phone_pattern, text)
        
        # Extract email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        info['emails'] = re.findall(email_pattern, text)
        
        # Extract case/reference numbers
        case_patterns = [
            r'(?:case\s*no|ref\s*no|file\s*no|केस\s*नं)[.:]*\s*([A-Z0-9/\-]+)',
            r'(?:fir\s*no|एफआईआर)[.:]*\s*([0-9/\-]+)',
        ]
        for pattern in case_patterns:
            info['case_numbers'].extend(re.findall(pattern, text, re.IGNORECASE))
        
        # Extract names (capitalized words that look like names)
        # Look for patterns like "Name: John Doe" or common name indicators
        name_patterns = [
            r'(?:name|नाम|applicant|complainant|petitioner|respondent)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})',
            r'(?:mr\.|ms\.|mrs\.|shri|smt\.?|श्री|श्रीमती)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})',
        ]
        for pattern in name_patterns:
            info['names'].extend(re.findall(pattern, text, re.IGNORECASE))
        
        # For resumes - extract skills
        if info['is_resume']:
            skill_section = re.search(r'(?:skills|technical\s*skills|कौशल)[:\s]*([^\n]+(?:\n[^\n]+){0,5})', text, re.IGNORECASE)
            if skill_section:
                skills_text = skill_section.group(1)
                # Split by common delimiters
                skills = re.split(r'[,;•\n|]', skills_text)
                info['skills'] = [s.strip() for s in skills if s.strip() and len(s.strip()) < 30][:10]
            
            # Extract education
            edu_pattern = r'(?:b\.?tech|m\.?tech|b\.?e|m\.?e|b\.?sc|m\.?sc|b\.?a|m\.?a|b\.?com|m\.?com|mba|bba|ph\.?d|12th|10th|graduation|post.?graduation)'
            info['education'] = list(set(re.findall(edu_pattern, text, re.IGNORECASE)))[:5]
            
            # Extract years of experience
            exp_pattern = r'(\d+\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp))'
            info['experience'] = re.findall(exp_pattern, text, re.IGNORECASE)[:3]
        
        # Extract addresses (look for PIN codes and surrounding text)
        address_pattern = r'[A-Za-z0-9,.\s\-]+(?:pin|पिन)?[:\s]*\d{6}'
        info['addresses'] = re.findall(address_pattern, text, re.IGNORECASE)[:2]
        
        return info

    def _extract_key_points(self, text, doc_type):
        """Extract key points from the document"""
        key_points = []
        
        # Look for common patterns
        patterns = {
            'case_number': r'(?:case\s*no|केस\s*नं|प्रकरण\s*क्रमांक)[.:]*\s*([A-Z0-9/\-]+)',
            'section': r'(?:धारा|section|u/s)\s*([0-9]+(?:\s*[,/]\s*[0-9]+)*)',
            'amount': r'(?:रु|rs|₹|rupees)[.:]*\s*([0-9,]+)',
            'plot': r'(?:खसरा|plot|प्लॉट|खाता)\s*(?:नं|no|नंबर)?[.:]*\s*([0-9/\-]+)',
            'fir_no': r'(?:fir\s*no|एफआईआर)[.:]*\s*([0-9/\-]+)',
        }
        
        for pattern_name, pattern in patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                if pattern_name == 'case_number':
                    key_points.append(f"केस नंबर: {matches[0]}")
                elif pattern_name == 'section':
                    key_points.append(f"धारा: {matches[0]}")
                elif pattern_name == 'amount':
                    key_points.append(f"राशि: ₹{matches[0]}")
                elif pattern_name == 'plot':
                    key_points.append(f"खसरा/प्लॉट नंबर: {matches[0]}")
                elif pattern_name == 'fir_no':
                    key_points.append(f"FIR नंबर: {matches[0]}")
        
        # Add type-specific points
        type_points = {
            'legal_notice': ['यह कानूनी नोटिस है', 'जवाब देना ज़रूरी है'],
            'fir': ['यह पुलिस FIR है', 'कानूनी कार्यवाही शुरू'],
            'court_order': ['यह न्यायालय का आदेश है', 'पालन अनिवार्य है'],
            'land_record': ['यह भूमि रिकॉर्ड है', 'मालिकाना हक़ का प्रमाण'],
            'government_letter': ['यह सरकारी पत्र है', 'समय सीमा का ध्यान रखें'],
            'agreement': ['यह समझौता पत्र है', 'शर्तें बाध्यकारी हैं'],
            'resume': ['यह एक रिज़्यूमे/CV है', 'योग्यता और अनुभव प्रदर्शित करें'],
        }
        
        key_points.extend(type_points.get(doc_type, ['दस्तावेज़', 'सलाह लें']))
        
        return key_points[:6]  # Max 6 points

    def _extract_dates(self, text):
        """Extract important dates from text with validation"""
        dates = []
        
        # Common date patterns - with proper day/month validation
        date_patterns = [
            # DD/MM/YYYY or DD-MM-YYYY (validates day 1-31, month 1-12)
            r'\b(?:0?[1-9]|[12][0-9]|3[01])[/-](?:0?[1-9]|1[0-2])[/-](?:\d{4}|\d{2})\b',
            # Named months: 1-31 MonthName YYYY
            r'\b(?:0?[1-9]|[12][0-9]|3[01])\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{2,4}\b',
            # Named months in Hindi
            r'\b(?:0?[1-9]|[12][0-9]|3[01])\s+(?:जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|दिसंबर)\s+\d{2,4}\b',
        ]
        
        found_dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Avoid duplicates
                if match not in found_dates and len(found_dates) < 5:
                    found_dates.append(match)
        
        # Format dates
        for date in found_dates:
            dates.append({
                'date': date,
                'description': 'दस्तावेज़ में उल्लेखित तिथि'
            })
        
        return dates

    def _get_recommended_actions(self, doc_type):
        """Get recommended actions based on document type"""
        actions = {
            'legal_notice': [
                'घबराएं नहीं - यह सिर्फ नोटिस है, कोर्ट केस नहीं',
                'जिला विधिक सेवा प्राधिकरण से मुफ्त सलाह लें',
                '15-30 दिन में जवाब दें',
                'सभी संबंधित कागज़ात इकट्ठा करें',
                'NALSA हेल्पलाइन 15100 पर कॉल करें'
            ],
            'fir': [
                'FIR की कॉपी अपने पास रखें',
                'तुरंत वकील से मिलें',
                'अग्रिम जमानत के बारे में पूछें',
                'गवाहों की जानकारी इकट्ठा करें',
                'NALSA हेल्पलाइन 15100 पर कॉल करें'
            ],
            'court_order': [
                'आदेश की कॉपी सुरक्षित रखें',
                'अगली तारीख नोट करें',
                'वकील से तुरंत मिलें',
                'आदेश का समय पर पालन करें',
                'अपील के बारे में वकील से पूछें'
            ],
            'land_record': [
                'तहसील से ताज़ा खतौनी निकालें',
                'नाम और क्षेत्रफल जाँचें',
                'कोई विवाद हो तो SDM को लिखें',
                'मूल दस्तावेज़ सुरक्षित रखें',
                'ज़रूरत हो तो राजस्व विभाग से संपर्क करें'
            ],
            'government_letter': [
                'समय सीमा का पालन करें',
                'जवाब लिखित में दें',
                'पत्र की कॉपी रखें',
                'संबंधित कार्यालय से संपर्क करें',
                'RTI से जानकारी माँग सकते हैं'
            ],
            'agreement': [
                'सभी शर्तें ध्यान से पढ़ें',
                'जो समझ न आए, स्पष्ट करवाएं',
                'जबरदस्ती में साइन न करें',
                'गवाहों के सामने हस्ताक्षर करें',
                'एक कॉपी अपने पास रखें'
            ],
            'resume': [
                'अपनी योग्यता सही तरीके से प्रस्तुत करें',
                'सभी दस्तावेज़ों की कॉपी तैयार रखें',
                'संपर्क जानकारी सही होनी चाहिए',
                'LinkedIn या जॉब पोर्टल पर अपडेट रखें',
                'नियमित रूप से अपडेट करते रहें'
            ]
        }
        
        default_actions = [
            'दस्तावेज़ को ध्यान से पढ़ें',
            'जिला विधिक सेवा प्राधिकरण से मुफ्त सलाह लें',
            'मूल दस्तावेज़ सुरक्षित रखें',
            'NALSA हेल्पलाइन 15100 पर कॉल करें',
            'वकील से परामर्श लें'
        ]
        
        return actions.get(doc_type, default_actions)
