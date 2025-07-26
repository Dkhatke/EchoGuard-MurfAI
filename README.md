🔐 EchoGuard: AI Voice Intercom Safety Tool Using MURF API
Specially Designed for SOLO Women.
EchoGuard is a safety-focused AI-powered intercom system designed for solo women. It simulates human presence and generates smart, voice-based replies to unknown or suspicious visitors using speech transcription, AI conversation, and text-to-speech.

🛡️ Key Features
🎙️ Real-time voice transcription using OpenAI Whisper (or fake transcript for testing)

🤖 AI-generated replies (via OpenRouter with models like Mistral)

🗣️ Voice synthesis using Murf AI (for natural, confident voice playback)

🏠 Solo Mode: Adds background voices to simulate other people at home

🚨 Emergency Mode: Generates assertive replies to threats

💬 Typed or Auto Modes: Manually type or let AI auto-generate the response

📦 Frontend UI built with HTML/JS, with mode selection and audio controls

🧠 Tech Stack
Tech	Purpose
Node.js	Backend server
Express	API routing
Murf API	Text-to-speech voice generation
OpenRouter	AI reply generation
Whisper	Audio transcription (or fake input for now)
FFmpeg	Audio format handling
HTML/JS	Frontend user interface

 
⚙️ Setup Instructions
1. Clone and Install
bash
Copy
Edit
git clone https://github.com/yourusername/EchoGuard
cd EchoGuard/Backend
npm install
2. Add .env file
In your Backend/ folder, create a .env file:

env
Copy
Edit
MURF_API_KEY=your_murf_api_key
OPENROUTER_API_KEY=your_openrouter_key
PORT=5000
3. Start the Server
bash
Copy
Edit
node server.js

4. Open the UI
Open index.html in your browser manually or use Live Server.

💡 Example Transcript Scenarios
Parcel Delivery
Input: “Hi, I have a delivery for you.”
AI Reply: “Thanks! Please leave the parcel near the door. I’ll get it shortly.”

Threatening Stranger
Input: “Open the door or I’ll break it!”
AI Reply: “You’re being recorded and police are on the way. Leave immediately.”

Solo Mode
Adds background whispers like: “Wait, I’ll get it,” simulating others inside.

🔐 Security Notes
Audio is not stored long-term unless needed.

TTS voices simulate presence and deter threats.

Emergency replies are generated assertively.

🧪 Testing Without Real Audio
You can simulate replies using fake transcripts in server.js:

js
Copy
Edit
const transcript = "Open the door right now or I’ll break it down!";
The system will then use AI to generate a defensive and confident reply.

📌 To Do / Ideas
Webcam-triggered replies

Real-time mic input

Whisper background mixing

Motion Detection 

Web deployment via Render/Vercel

🤝 Credits

OpenRouter

Murf AI

OpenAI Whisper

Designed for safety by and for women 

