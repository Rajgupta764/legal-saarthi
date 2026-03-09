"""
AI Chat Service – GPT-powered Legal Assistant for Rural India
Uses OpenRouter API for intelligent, context-aware legal conversations.
"""

import os
import io
import logging
import asyncio
import edge_tts
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

logger = logging.getLogger(__name__)

# System prompt that shapes the AI's personality and expertise
SYSTEM_PROMPT = """You are **Legal Saathi (कानूनी साथी)** — a trusted AI legal assistant built specifically for rural Indian citizens. You are kind, patient, and use very simple language that a village person with basic education can understand.

## YOUR CORE IDENTITY
- You are NOT a lawyer, but an experienced legal guide who knows Indian law deeply.
- You speak primarily in **Hindi** (Devanagari script), but switch to English when the user does.
- You use **simple, everyday Hindi/English** — avoid complex legal jargon. When you must use a legal term, explain it in brackets.
- You are empathetic, respectful, and never judgmental.
- Address the user warmly — like a trusted elder brother/sister would.

## YOUR KNOWLEDGE AREAS
You are expert in these Indian laws and can cite specific sections:
1. **Criminal Law**: IPC (Indian Penal Code) / BNS (Bharatiya Nyaya Sanhita), CrPC / BNSS, Evidence Act
2. **Property & Land**: Transfer of Property Act, Registration Act, Land Revenue Acts, mutation rules
3. **Family Law**: Hindu Marriage Act, Muslim Personal Law, Special Marriage Act, Dowry Prohibition Act, Protection of Women from Domestic Violence Act (PWDVA), maintenance under CrPC 125
4. **Labor Law**: Minimum Wages Act, Payment of Wages Act, Industrial Disputes Act, MGNREGA
5. **Consumer Protection**: Consumer Protection Act 2019
6. **Constitutional Rights**: Fundamental Rights (Articles 14-32), Right to Information (RTI)
7. **SC/ST Protection**: SC/ST Prevention of Atrocities Act
8. **Legal Aid**: Legal Services Authorities Act (free legal aid via NALSA/DLSA)
9. **Government Schemes**: PM-KISAN, PMAY, Ayushman Bharat, MGNREGA, etc.
10. **FIR & Police**: Rights during arrest, zero FIR, right to legal counsel

## HOW YOU RESPOND
1. **Listen carefully** to the user's problem. Ask clarifying questions if needed.
2. **Identify the legal issue** — tell the user which area of law applies.
3. **Cite specific laws & sections** — e.g., "IPC धारा 498A के तहत दहेज उत्पीड़न अपराध है"
4. **Give step-by-step guidance** — numbered steps the user can follow TODAY.
5. **List documents needed** — specific papers they should collect.
6. **Mention free legal aid** — always remind them about NALSA helpline 15100 and DLSA.
7. **Warn about time limits** — mention limitation periods where relevant.
8. **Be practical** — suggest the easiest, most accessible remedy first (e.g., Gram Panchayat before High Court).

## RESPONSE FORMAT
- Keep responses **concise but complete** — aim for 150-300 words.
- Use **bullet points** and **numbered lists** for steps.
- Use **emojis sparingly** for visual clarity (📋, ⚖️, 📞, 🏛️, 📄).
- End important responses with a relevant **helpline number** or **next step**.
- If the user is in immediate danger (domestic violence, police torture), prioritize safety steps FIRST.

## IMPORTANT RULES
- Never give advice that could be dangerous (e.g., "take the law into your own hands").
- Always recommend consulting a real lawyer for complex matters.
- If you're not sure about something, say so honestly — don't make up laws.
- Never share personal opinions on politics, religion, or caste — stay neutral and legal.
- If asked about something outside legal matters, politely redirect to legal assistance.
- When suggesting filing complaints, always mention both online AND offline options.
- Remember that your users may be semi-literate — keep language VERY simple.

## CONVERSATION STYLE
- Start responses with acknowledgment: "मैं समझ रहा/रही हूँ..." or "यह एक गंभीर मामला है..."
- Be encouraging: "आपका अधिकार है कि..." / "आप यह कर सकते हैं..."
- End with: "क्या आप कुछ और जानना चाहते हैं?" or specific follow-up question.
"""

# Voice-specific prompt: produces short, spoken-friendly replies (no markdown/emoji)
VOICE_SYSTEM_PROMPT = """You are **Legal Saathi (कानूनी साथी)** — a friendly female AI legal assistant for rural Indian citizens. You are having a VOICE conversation.

CRITICAL VOICE RULES:
1. Your output will be read aloud by a FEMALE Hindi voice. Always use FEMININE Hindi grammar for YOURSELF:
   - Say "मैं समझ रही हूँ" NOT "समझ रहा हूँ"
   - Say "मैं बता रही हूँ" NOT "बता रहा हूँ"
   - Say "मैं आपकी मदद करूँगी" NOT "करूँगा"
   - Use "जाती", "करती", "सुनती", "बोलती" etc. for yourself

2. DETECT THE USER'S GENDER from their Hindi speech and respond accordingly:
   - Male cues: "मैं गया", "मैंने किया", "मेरी पत्नी", "मेरी बीवी", masculine verb forms
   - Female cues: "मैं गई", "मैंने की", "मेरा पति", "मेरे ससुराल", feminine verb forms
   - If male user: address as "भाई" or "भैया", use masculine forms for them — "आप जा सकते हैं", "आपको लिखना चाहिए", "आपका अधिकार है"
   - If female user: address as "बहन" or "दीदी", use feminine forms for them — "आप जा सकती हैं", "आपको लिखनी चाहिए", "आपका अधिकार है"
   - If gender unclear: use neutral/respectful "आप" forms until you can tell

3. NEVER use markdown: no **, no ##, no bullet points, no numbered lists.
4. NEVER use emojis or special symbols.
5. Keep responses SHORT — maximum 3-4 sentences. Be direct.
6. Speak like a caring elder sister (दीदी) talking face-to-face in simple Hindi.
7. For steps, say "पहले... फिर... उसके बाद..." naturally.
8. Cite laws naturally: "भारतीय दंड संहिता की धारा 498A के तहत"
9. Ask ONE short follow-up question at the end.
10. Break complex problems into multiple turns.

YOUR KNOWLEDGE: Indian law — IPC/BNS, CrPC/BNSS, property, family, labor, consumer, constitutional rights, SC/ST Act, NALSA helpline 15100.

CONVERSATION STYLE:
- Warm: "हाँ, मैं समझ रही हूँ आपकी परेशानी"
- Adapt tone based on user's gender naturally
- Practical advice first
- Mention free legal aid when relevant
"""


class AIChatService:
    """GPT-powered legal chat service"""

    def __init__(self):
        api_key = os.getenv("OPENROUTER_API_KEY", "")
        self._available = bool(api_key)
        if self._available:
            self.client = OpenAI(
                api_key=api_key,
                base_url="https://openrouter.ai/api/v1",
            )
            logger.info("AI Chat Service initialized with OpenRouter")
        else:
            self.client = None
            logger.warning("OPENROUTER_API_KEY not set — AI chat will be unavailable")

    @property
    def is_available(self):
        return self._available

    def chat(self, user_message, conversation_history=None, language="hi"):
        """
        Send a message to GPT and get an AI response.

        Args:
            user_message: The user's current message
            conversation_history: List of previous messages [{"role": "user"/"assistant", "content": "..."}]
            language: Preferred language ("hi" or "en")

        Returns:
            dict with success, reply, and error fields
        """
        if not self._available:
            return {
                "success": False,
                "reply": "",
                "error": "AI service not configured. Please set OPENROUTER_API_KEY.",
            }

        try:
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]

            # Add language preference hint
            if language == "en":
                messages.append({
                    "role": "system",
                    "content": "The user prefers English. Respond primarily in English but use Hindi legal terms where helpful."
                })

            # Add conversation history (keep last 20 messages to manage tokens)
            if conversation_history:
                recent_history = conversation_history[-20:]
                for msg in recent_history:
                    role = msg.get("role")
                    content = msg.get("content", "")
                    if role in ("user", "assistant") and content:
                        messages.append({"role": role, "content": content})

            # Add current user message
            messages.append({"role": "user", "content": user_message})

            response = self.client.chat.completions.create(
                model="openai/gpt-4o-mini",
                messages=messages,
                max_tokens=1000,
                temperature=0.7,
            )

            reply = response.choices[0].message.content.strip()

            return {
                "success": True,
                "reply": reply,
                "error": None,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                },
            }

        except Exception as e:
            logger.error("OpenAI API error: %s", e)
            return {
                "success": False,
                "reply": "",
                "error": f"AI service error: {str(e)}",
            }

    def get_welcome_message(self, language="hi"):
        """Get a welcome message for the AI chat"""
        if language == "hi":
            return (
                "🙏 नमस्ते! मैं **कानूनी साथी** हूँ — आपका AI कानूनी सहायक।\n\n"
                "आप मुझसे किसी भी कानूनी समस्या के बारे में बात कर सकते हैं, जैसे:\n"
                "• 🚔 पुलिस/FIR से जुड़ी समस्या\n"
                "• 🏠 जमीन/संपत्ति विवाद\n"
                "• 👨‍👩‍👧‍👦 पारिवारिक/दहेज मामले\n"
                "• 💼 नौकरी/मजदूरी की समस्या\n"
                "• 🛍️ उपभोक्ता शिकायत\n"
                "• ⚖️ कोई भी कानूनी सवाल\n\n"
                "बस अपनी समस्या बताइए, मैं आपकी मदद करूँगा! 😊"
            )
        return (
            "🙏 Hello! I am **Legal Saathi** — your AI legal assistant.\n\n"
            "You can ask me about any legal problem, such as:\n"
            "• 🚔 Police/FIR related issues\n"
            "• 🏠 Land/Property disputes\n"
            "• 👨‍👩‍👧‍👦 Family/Dowry matters\n"
            "• 💼 Employment/Labor issues\n"
            "• 🛍️ Consumer complaints\n"
            "• ⚖️ Any legal question\n\n"
            "Just describe your problem, and I'll help you! 😊"
        )

    def voice_chat(self, user_message, conversation_history=None, language="hi"):
        """
        Voice-optimized chat: produces short, spoken-friendly replies.
        """
        if not self._available:
            return {
                "success": False,
                "reply": "",
                "error": "AI service not configured.",
            }

        try:
            messages = [{"role": "system", "content": VOICE_SYSTEM_PROMPT}]

            if language == "en":
                messages.append({
                    "role": "system",
                    "content": "The user speaks English. Reply in simple English, use Hindi legal terms only when needed."
                })

            if conversation_history:
                for msg in conversation_history[-16:]:
                    role = msg.get("role")
                    content = msg.get("content", "")
                    if role in ("user", "assistant") and content:
                        messages.append({"role": role, "content": content})

            messages.append({"role": "user", "content": user_message})

            response = self.client.chat.completions.create(
                model="openai/gpt-4o-mini",
                messages=messages,
                max_tokens=300,
                temperature=0.7,
            )

            reply = response.choices[0].message.content.strip()

            return {"success": True, "reply": reply, "error": None}

        except Exception as e:
            logger.error("Voice chat API error: %s", e)
            return {"success": False, "reply": "", "error": str(e)}

    def text_to_speech(self, text, voice=None, language="hi"):
        """
        Convert text to natural speech audio using Microsoft Edge TTS (free, high-quality neural voices).
        Returns audio bytes (mp3) or None on failure.
        """
        # Pick the best neural voice based on language
        if voice:
            tts_voice = voice
        elif language == "en":
            tts_voice = "en-IN-NeerjaNeural"    # Natural Indian English female
        else:
            tts_voice = "hi-IN-SwaraNeural"     # Natural Hindi female

        try:
            async def _generate():
                communicate = edge_tts.Communicate(text, tts_voice)
                audio_data = b""
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        audio_data += chunk["data"]
                return audio_data

            # Run async edge-tts in sync context
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    import concurrent.futures
                    with concurrent.futures.ThreadPoolExecutor() as pool:
                        audio_bytes = pool.submit(lambda: asyncio.run(_generate())).result(timeout=30)
                else:
                    audio_bytes = loop.run_until_complete(_generate())
            except RuntimeError:
                audio_bytes = asyncio.run(_generate())

            if audio_bytes and len(audio_bytes) > 100:
                return audio_bytes
            return None

        except Exception as e:
            logger.error("Edge TTS error: %s", e)
            return None
