# FinSense AI - Finance News Sentiment Analysis

A Flutter mobile application that provides real-time financial news with AI-powered sentiment analysis using a fine-tuned FinBERT model.

## 🚀 Features

- **Real-time Financial News**: Fetches latest financial news from MarketAux API
- **AI Sentiment Analysis**: Uses fine-tuned FinBERT model for accurate financial sentiment detection
- **Background Updates**: Automatic news fetching and analysis every 15 minutes
- **Local Notifications**: Get notified about important market sentiment changes
- **Offline Support**: Cached news articles available offline
- **Cross-Platform**: Runs on Android, iOS, Web, Windows, macOS, and Linux

## 🏗️ Architecture

The app consists of two main components:

1. **Flutter Mobile App**: The user-facing application
2. **FinBERT API Server**: Python Flask server hosting the fine-tuned FinBERT model

```
┌─────────────────────┐
│   Flutter Mobile    │
│       App           │
│  (Android/iOS/Web)  │
└──────────┬──────────┘
           │
           │ HTTP REST API
           │
┌──────────▼──────────┐
│   FinBERT API       │
│   Python Flask      │
│   Server            │
└──────────┬──────────┘
           │
           │ Loads Model
           │
┌──────────▼──────────┐
│  Fine-tuned FinBERT │
│  Model (PyTorch)    │
└─────────────────────┘
```

## 📋 Prerequisites

### For Flutter App
- Flutter SDK (3.0.0 or higher)
- Dart SDK (3.0.0 or higher)
- Android Studio / Xcode (for mobile development)
- VS Code or Android Studio

### For FinBERT API Server
- Python 3.10 or higher
- pip (Python package manager)
- 4GB+ RAM (for model loading)
- Optional: NVIDIA GPU with CUDA (for faster inference)

## 🔧 Setup Instructions

### Step 1: Setup FinBERT API Server

1. **Navigate to the API directory:**
   ```bash
   cd finbert_api
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the API server:**
   ```bash
   python app.py
   ```

   The server will start at `http://localhost:5000`

5. **Test the API:**
   ```bash
   curl -X POST http://localhost:5000/analyze -H "Content-Type: application/json" -d "{\"text\": \"Apple stock surges on strong earnings.\"}"
   ```

### Step 2: Setup Flutter App

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Install Flutter dependencies:**
   ```bash
   flutter pub get
   ```

3. **Configure API endpoint:**
   
   Edit `lib/tasks/services/sentiment_service.dart` and update `FINBERT_API_URL`:
   
   - **Android Emulator**: `http://10.0.2.2:5000`
   - **iOS Simulator**: `http://localhost:5000`
   - **Real Device**: Use ngrok or deploy API publicly
   - **Production**: Your deployed API URL

4. **Run the app:**
   ```bash
   flutter run
   ```

## 🐳 Docker Deployment

Deploy the FinBERT API using Docker:

```bash
cd finbert_api
docker-compose up --build
```

## ☁️ Cloud Deployment

See `finbert_api/README.md` for detailed deployment instructions for:
- Google Cloud Run
- AWS EC2
- Heroku
- Railway.app

## 🔑 API Keys

Update API key in `lib/tasks/services/news_service.dart`:
- Get your MarketAux API key from [marketaux.com](https://www.marketaux.com/)

## 🧪 Testing

```bash
# Flutter tests
flutter test

# API health check
curl http://localhost:5000/health
```

## 📊 Model Information

- **Model**: Fine-tuned FinBERT
- **Labels**: positive, negative, neutral
- **Accuracy**: ~95% on financial sentiment
- **Max Input**: 512 tokens

## 🛠️ Troubleshooting

**Can't connect to API?**
- Ensure API server is running on port 5000
- For Android emulator, use `10.0.2.2:5000` instead of `localhost:5000`
- For real devices, use ngrok or deploy API publicly

**Build errors?**
```bash
flutter clean && flutter pub get && flutter run
```

See full documentation in `finbert_api/README.md` for more details.

## 📝 License

MIT License

## 🙏 Acknowledgments

- FinBERT model by ProsusAI
- MarketAux for news API
- Flutter and Hugging Face teams
