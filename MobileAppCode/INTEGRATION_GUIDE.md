# FinBERT Model Integration - Configuration Guide

## Quick Configuration for Development

### Option 1: Local Development with Android Emulator

**API Server:**
```bash
cd finbert_api
python app.py
# Server runs at http://localhost:5000
```

**Flutter App Configuration:**
Edit `lib/tasks/services/sentiment_service.dart`:
```dart
static const String FINBERT_API_URL = 'http://10.0.2.2:5000';
```

> **Note**: Android emulators use `10.0.2.2` to access host machine's localhost

### Option 2: Local Development with Real Device

**1. Start API Server:**
```bash
cd finbert_api
python app.py
```

**2. Expose API using ngrok:**
```bash
# Download ngrok from https://ngrok.com/download
ngrok http 5000
```

**3. Update Flutter Configuration:**
Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`) and update:
```dart
static const String FINBERT_API_URL = 'https://abc123.ngrok.io';
```

### Option 3: Production Deployment

**Deploy API to Cloud:**
- Google Cloud Run
- AWS EC2 / Elastic Beanstalk
- Heroku
- Railway.app
- DigitalOcean

**Update Flutter Configuration:**
```dart
static const String FINBERT_API_URL = 'https://your-deployed-api.com';
```

## Testing the Integration

### 1. Start API Server
```bash
cd finbert_api
python app.py
```

### 2. Test API Health
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "gpu_available": false
}
```

### 3. Test Sentiment Analysis
```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Apple stock surges on strong earnings."}'
```

Expected response:
```json
{
  "sentiment": "positive",
  "confidence": 0.95,
  "scores": {
    "positive": 0.95,
    "negative": 0.02,
    "neutral": 0.03
  }
}
```

### 4. Run Flutter App
```bash
flutter run
```

## Environment-Specific Configuration

### Development
```dart
// lib/config/api_config.dart
class ApiConfig {
  static const bool isDevelopment = true;
  static const String baseUrl = isDevelopment 
    ? 'http://10.0.2.2:5000'  // Android emulator
    : 'https://your-production-api.com';
}
```

### Production
```dart
class ApiConfig {
  static const bool isDevelopment = false;
  static const String baseUrl = 'https://your-production-api.com';
}
```

## Troubleshooting

### Issue: "Connection refused" error

**Android Emulator:**
- Use `http://10.0.2.2:5000` instead of `localhost:5000`

**iOS Simulator:**
- Use `http://localhost:5000`

**Real Device:**
- Ensure device is on same network as development machine
- Use ngrok for HTTPS tunnel
- Or use local IP: `http://192.168.1.x:5000`

### Issue: API returns 503 "Model not loaded"

**Solution:**
- Check API logs for model loading errors
- Ensure model files exist in `finbert_model_archive/`
- Verify sufficient RAM (4GB+)
- Check Python dependencies are installed

### Issue: Slow response times

**Solutions:**
- Use GPU acceleration if available
- Use batch analysis endpoint for multiple texts
- Deploy API closer to users (edge computing)
- Implement caching

## Performance Optimization

### For API Server
1. **Enable GPU**: Install CUDA-enabled PyTorch
2. **Use Gunicorn**: Multi-worker processing
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 app:app
   ```
3. **Add Caching**: Cache frequently analyzed texts
4. **Load Balancing**: Use multiple API instances

### For Flutter App
1. **Batch Processing**: Send multiple texts at once
2. **Request Timeout**: Set appropriate timeout (30s)
3. **Retry Logic**: Retry failed requests with exponential backoff
4. **Offline Cache**: Cache sentiment results locally

## Security Considerations

### For Production

1. **Use HTTPS**: Always use HTTPS in production
2. **API Authentication**: Add API key or JWT authentication
3. **Rate Limiting**: Implement rate limiting
4. **Input Validation**: Validate all inputs server-side
5. **CORS Configuration**: Restrict allowed origins

Example with API key:
```dart
final response = await http.post(
  Uri.parse('$FINBERT_API_URL/analyze'),
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key',
  },
  body: json.encode({'text': text}),
);
```

## Monitoring and Logging

### API Server Monitoring
- Log all requests and response times
- Monitor memory usage
- Track error rates
- Set up alerts for downtime

### Flutter App
- Log API call success/failure rates
- Monitor sentiment analysis accuracy
- Track user engagement metrics

## Next Steps

1. ✅ Set up local development environment
2. ✅ Test API integration
3. ⬜ Deploy API to cloud platform
4. ⬜ Update Flutter app with production URL
5. ⬜ Implement error handling and retry logic
6. ⬜ Add monitoring and analytics
7. ⬜ Performance optimization
8. ⬜ Security hardening for production
