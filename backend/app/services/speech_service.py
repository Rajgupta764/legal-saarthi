"""
Speech-to-Text Service using OpenAI's Whisper API
Handles accurate voice transcription for multiple Indian languages
"""

import io
import os
from openai import OpenAI
from werkzeug.datastructures import FileStorage


class SpeechToTextService:
    """Service for converting audio to text using Whisper API"""
    
    def __init__(self):
        """Initialize OpenAI client with API key from environment"""
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        self.client = OpenAI(api_key=api_key)
        self.supported_languages = {
            'hi-IN': 'hindi',
            'en-IN': 'english',
            'ta-IN': 'tamil',
            'te-IN': 'telugu',
            'mr-IN': 'marathi',
            'bn-IN': 'bengali'
        }
    
    def transcribe_audio(self, audio_file, language_code='hi-IN'):
        """
        Transcribe audio file to text using Whisper API
        
        Args:
            audio_file: File object (werkzeug FileStorage or file-like object)
            language_code: Language code (e.g., 'hi-IN', 'en-IN')
        
        Returns:
            dict: {
                'success': bool,
                'transcript': str,
                'language': str,
                'error': str (if failed)
            }
        """
        try:
            # Get language hint for Whisper
            language = self.supported_languages.get(language_code, 'hindi')
            
            # Read audio file
            if isinstance(audio_file, FileStorage):
                audio_data = audio_file.read()
                filename = audio_file.filename
            else:
                audio_data = audio_file.read()
                filename = getattr(audio_file, 'name', 'audio.wav')
            
            # Create file-like object for OpenAI API
            audio_stream = io.BytesIO(audio_data)
            audio_stream.name = filename
            
            # Call Whisper API
            # Whisper works best with full audio, so we don't split
            transcript_response = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_stream,
                language=language,  # Language hint improves accuracy
                response_format="text"
            )
            
            transcript = transcript_response.strip()
            
            if not transcript:
                return {
                    'success': False,
                    'transcript': '',
                    'language': language_code,
                    'error': 'Speech not detected in audio'
                }
            
            return {
                'success': True,
                'transcript': transcript,
                'language': language_code,
                'error': None
            }
            
        except Exception as e:
            return {
                'success': False,
                'transcript': '',
                'language': language_code,
                'error': str(e)
            }
    
    def transcribe_audio_bytes(self, audio_bytes, language_code='hi-IN', filename='audio.wav'):
        """
        Transcribe raw audio bytes to text
        
        Args:
            audio_bytes: Raw audio bytes
            language_code: Language code (e.g., 'hi-IN', 'en-IN')
            filename: Name of the audio file
        
        Returns:
            dict: Transcription result
        """
        try:
            language = self.supported_languages.get(language_code, 'hindi')
            
            audio_stream = io.BytesIO(audio_bytes)
            audio_stream.name = filename
            
            transcript_response = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_stream,
                language=language,
                response_format="text"
            )
            
            transcript = transcript_response.strip()
            
            return {
                'success': True if transcript else False,
                'transcript': transcript,
                'language': language_code,
                'error': None if transcript else 'Speech not detected'
            }
            
        except Exception as e:
            return {
                'success': False,
                'transcript': '',
                'language': language_code,
                'error': str(e)
            }


# Global instance
_speech_service = None


def get_speech_service():
    """Get or create global speech service instance"""
    global _speech_service
    if _speech_service is None:
        _speech_service = SpeechToTextService()
    return _speech_service
