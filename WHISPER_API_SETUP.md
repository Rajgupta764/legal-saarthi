# Whisper API Integration Guide

## Overview
This guide explains how to integrate OpenAI's Whisper API for high-accuracy speech-to-text transcription in Hindi and other Indian languages.

## Why Whisper API?
- **Accuracy**: 95%+ accuracy for Hindi speech recognition
- **No Duplicates**: Professional API properly handles overlapping speech chunks
- **Multiple Languages**: Supports Hindi, English, Tamil, Telugu, Marathi, Bengali
- **Reliability**: No browser limitations, handles background noise better

## Setup Steps

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. **Keep it safe** - never commit it to git

**Pricing**: OpenAI charges ~$0.02 per minute of audio for Whisper API

### 2. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- `openai==1.28.1` - OpenAI Python client
- `pydub==0.25.1` - Audio handling

### 3. Set Environment Variable

Create or update `.env` in the backend root directory:

```env
# OpenAI API Key
OPENAI_API_KEY=sk-your-actual-api-key-here

# Other existing variables
MONGO_URI=mongodb://localhost:27017/rural_legal_saathi
JWT_SECRET_KEY=your-secret-key
```

### 4. Restart Backend Server

```bash
cd backend
python app.py
```

The server will initialize the Whisper service on first request.

## API Endpoints

### Endpoint 1: Multipart Form Upload
**POST** `/api/speech/transcribe`

For traditional file upload:
```javascript
const formData = new FormData()
formData.append('audio_file', audioBlob, 'recording.webm')
formData.append('language', 'hi-IN')

const response = await fetch('/api/speech/transcribe', {
  method: 'POST',
  body: formData
})
```

Supported languages:
- `hi-IN` - Hindi
- `en-IN` - English
- `ta-IN` - Tamil
- `te-IN` - Telugu
- `mr-IN` - Marathi
- `bn-IN` - Bengali

**Response:**
```json
{
  "success": true,
  "data": {
    "transcript": "मैं आज आया हूँ",
    "language": "hi-IN"
  }
}
```

### Endpoint 2: Raw Audio Stream
**POST** `/api/speech/transcribe-stream?language=hi-IN`

For streaming audio data directly:
```javascript
const response = await fetch('/api/speech/transcribe-stream?language=hi-IN', {
  method: 'POST',
  headers: {
    'Content-Type': 'audio/webm'
  },
  body: audioBlob
})
```

## Using the Whisper Voice Component

### Option 1: Replace Existing Component

The new `VoiceComplaintWhisper.jsx` is a drop-in replacement for the old Web Speech API version:

```javascript
// In your page/component:
import VoiceComplaintWhisper from '../components/features/VoiceComplaintWhisper'

// Usage:
<VoiceComplaintWhisper />
```

### Option 2: Add a New Voice Route

In your router, add a new route:
```javascript
{
  path: '/voice-complaint-new',
  element: <VoiceComplaintWhisper />
}
```

## Features

- ✅ **Real-time Recording Timer**: Shows how long you've been recording
- ✅ **Multiple Languages**: Switch between 6 Indian languages
- ✅ **Noise Cancellation**: Browser-level audio processing
- ✅ **No Duplicates**: Professional speech recognition
- ✅ **Error Handling**: Clear error messages in Hindi/English
- ✅ **Accessibility**: Works on all modern browsers

## Advanced Usage

### Custom Audio Processing

To use Whisper with your own VoiceAssistant component:

```javascript
import api from '../../services/api'

// In your recording stop handler:
const stopRecording = async () => {
  const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
  
  const formData = new FormData()
  formData.append('audio_file', audioBlob, 'recording.webm')
  formData.append('language', selectedLanguage)

  try {
    const response = await api.post('/speech/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    if (response.data.success) {
      const transcript = response.data.data.transcript
      // Use transcript...
    }
  } catch (error) {
    console.error('Transcription failed:', error)
  }
}
```

## Troubleshooting

### Issue: "OPENAI_API_KEY not set"
**Solution**: 
1. Check `.env` file exists in backend root
2. Restart the server after setting the key
3. Verify key format starts with `sk-`

### Issue: "API key is invalid"
**Solution**:
1. Go to https://platform.openai.com/api-keys
2. Delete the old key
3. Create a new one and update `.env`
4. Restart backend

### Issue: "Audio file too large"
**Solution**: 
- Whisper works best with <25MB files
- Compress audio or split into chunks
- Frontend recorder already uses WebM codec (compressed)

### Issue: Recording button not working
**Solution**:
1. Check browser supports MediaRecorder API (Chrome, Edge, Firefox)
2. Ensure HTTPS or localhost (browser security requirement)
3. Check microphone permissions

## Performance Notes

- **Cost**: ~$0.02 per minute of audio
- **Speed**: 30-second audio takes ~2-3 seconds to transcribe
- **Accuracy**: 95%+ for clear Hindi speech
- **Best for**: Complaint descriptions, documents, lengthy input

## Testing

Test the endpoint with curl:

```bash
# Create a test audio file first (e.g., record yourself saying "नमस्ते")
# Then:

curl -X POST http://localhost:5000/api/speech/transcribe \
  -F "audio_file=@recording.webm" \
  -F "language=hi-IN"

# Expected response:
# {"success": true, "data": {"transcript": "नमस्ते", "language": "hi-IN"}}
```

## Migration from Web Speech API

### Old Component:
- Browser-based speech recognition
- Free but unreliable
- Duplicate words issue
- Limited language support

### New Component (Whisper):
- Cloud-based via OpenAI
- Professional accuracy
- No duplicates
- Full Indian language support

### Gradual Migration:
1. Keep both components available
2. Users can choose which to use
3. Monitor which works better
4. Eventually deprecate old one

## Future Enhancements

- [ ] Real-time transcription streaming
- [ ] Batch processing for multiple languages
- [ ] Speaker identification
- [ ] Confidence scores
- [ ] Custom vocabulary/terminology

## Support

For issues:
1. Check OpenAI API status: https://status.openai.com
2. Review API documentation: https://platform.openai.com/docs/guides/speech-to-text
3. Check backend logs for detailed errors
