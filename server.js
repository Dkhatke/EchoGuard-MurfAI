
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Static Home Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// API Keys
const apiKey = process.env.MURF_API_KEY;
const openrouterKey = process.env.OPENROUTER_API_KEY;
if (!apiKey || !openrouterKey) {
  console.error('❌ Missing API keys in .env');
  process.exit(1);
}

// FFmpeg Path

const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);


// Voice Config
const voiceMap = {
  us: {
    male: { normal: 'en-US-marcus', strong: 'en-US-cooper', calm: 'en-US-miles' },
    female: { normal: 'en-US-natalie', strong: 'en-US-alicia', calm: 'en-US-julia' },
  },
  uk: {
    male: { normal: 'en-UK-mason', strong: 'en-UK-finley', calm: 'en-UK-theo' },
    female: { normal: 'en-UK-hazel', strong: 'en-UK-ruby', calm: 'en-UK-ruby' },
  },
  in: {
    male: { normal: 'bn-IN-arnab', strong: 'bn-IN-arnab', calm: 'en-IN-aarav' },
    female: { normal: 'en-IN-alia', strong: 'es-ES-carla', calm: 'en-IN-arohi' },
  },
  au: {
    male: { normal: 'en-AU-jimm', strong: 'en-AU-leyton', calm: 'en-AU-leyton' },
    female: { normal: 'en-AU-evelyn', strong: 'en-AU-ivy', calm: 'en-AU-kylie' },
  },
};

const toneToStyle = {
  normal: 'Conversational',
  strong: 'Empowered',
  calm: 'Calm',
};

// Asset Paths
const ASSETS_DIR = path.join(__dirname, 'assets');
const backgroundAudioPath = path.join(ASSETS_DIR, 'background_solo_mode.mp3');
const emergencyPath = path.join(ASSETS_DIR, 'emergency_warning.mp3');
const crowdPath = path.join(ASSETS_DIR, 'background_crowd.mp3');

// Upload Config
const upload = multer({ dest: 'uploads/' });

/**
 * 🎤 Text-to-Speech API
 */
app.post('/generate-voice', async (req, res) => {
  const { message, country, gender, tone, soloMode } = req.body;
  const voiceId = voiceMap[country]?.[gender]?.[tone];
  const style = toneToStyle[tone] || 'Conversational';

  if (!voiceId) return res.status(400).json({ error: 'Invalid voice selection.' });

  try {
    const murfResp = await axios.post(
      'https://api.murf.ai/v1/speech/generate',
      { voice_id: voiceId, text: message, format: 'mp3', style },
      { headers: { 'api-key': apiKey, 'Content-Type': 'application/json' } }
    );

    const voiceUrl = murfResp.data.audioFile;
    const voiceResp = await axios.get(voiceUrl, { responseType: 'arraybuffer' });
    const voiceBuffer = Buffer.from(voiceResp.data);

    if (!soloMode) {
      res.setHeader('Content-Type', 'audio/mpeg');
      return res.send(voiceBuffer);
    }

    const tempVoicePath = 'temp_voice.mp3';
    fs.writeFileSync(tempVoicePath, voiceBuffer);

    ffmpeg()
      .input(tempVoicePath)
      .input(backgroundAudioPath)
       .complexFilter([
    '[1:a]volume=0.5[a1]',    
    '[0:a][a1]amix=inputs=2:duration=first:dropout_transition=2[a]' 
  ])
      .outputOptions(['-map [a]', '-ac 2', '-c:a libmp3lame', '-b:a 192k'])
      .format('mp3')
      .on('error', err => {
        console.error('FFmpeg error:', err.message);
        if (!res.headersSent) res.status(500).json({ error: 'Audio mixing failed' });
      })
      .on('end', () => fs.unlinkSync(tempVoicePath))
      .pipe(res, { end: true });

  } catch (err) {
    console.error('TTS Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to generate voice' });
  }
});

/**
 * 🚨 Emergency Mode API
 */
app.post('/trigger-emergency', (req, res) => {
  if (!fs.existsSync(emergencyPath)) return res.status(500).json({ error: 'Missing emergency audio' });

  res.setHeader('Content-Type', 'audio/mpeg');

  if (!fs.existsSync(crowdPath)) {
    return fs.createReadStream(emergencyPath).pipe(res);
  }

  ffmpeg()
    .input(emergencyPath)
    .input(crowdPath)
    .complexFilter([
      '[1:a]volume=0.4[a1]',
      '[0:a][a1]amix=inputs=2:duration=first:dropout_transition=3[a]'
    ])
    .outputOptions(['-map [a]', '-ac 2', '-c:a libmp3lame', '-b:a 192k'])
    .format('mp3')
    .on('error', err => {
      console.error('Emergency mix error:', err.message);
      if (!res.headersSent) res.status(500).json({ error: 'Mixing failed' });
    })
    .pipe(res, { end: true });
});

/**
 * 🎙️ Auto Flow: Transcribe (dummy), OpenRouter Reply, TTS Response
 */
// ... [everything above remains unchanged until the last route]

/**
 * 🎙️ Auto Flow: Transcribe (dummy), OpenRouter Reply, TTS Response
 */
app.post('/api/transcribe-and-reply', upload.single('audio'), async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) return res.status(400).json({ error: 'No audio uploaded' });

  try {
    // const transcript = "Hello, I have a parcel for you.";
    const transcript="Open the door right now! I know you're inside. If you don't open, I’ll break it down!"

     // Replace with real transcription

    const openRouterResp = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          { role: 'system', content: 'You are a firm and confident woman speaking from inside the house. Your voice should sound like someone who is calm, in control, and not intimidated. You want to scare off intruders while sounding smart and authoritative.' },
          { role: 'user', content: transcript }
        ]
      },
      {
        headers: {
  'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://yourwebsite.com/',  // Optional but sometimes required
  'X-Title': 'EchoGuard AI'                    // Optional identifier for your project
}

      }
    );

    const replyText = openRouterResp.data.choices[0].message.content;
    console.log("📝 Transcript:", transcript);
    console.log("🤖 AI Reply:", replyText);

    const voiceResp = await axios.post(
      'http://localhost:5000/generate-voice',
      {
        message: replyText,
        country: 'uk',
        gender: 'female',
        tone: 'strong',
        soloMode: true,
      },
      { responseType: 'arraybuffer' }
    );

    fs.unlinkSync(filePath);

    // ✅ Return base64 audio + text to frontend
    const audioBase64 = Buffer.from(voiceResp.data).toString('base64');
    res.json({
      audio: audioBase64,
      text: replyText
    });

  } catch (err) {
    console.error('Auto Flow Error:', err.response?.data || err.message);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: 'Auto voice reply failed.' });
  }
});


// Start Server
app.listen(port, () => {
  console.log(`✅ Server running: http://localhost:${port}`);
});
