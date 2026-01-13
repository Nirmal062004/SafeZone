# 🛡️ SafeZone App

This is **SafeZone**, a personal safety app built using React Native (Expo) and Firebase — fully powered by **free tools** and designed for real-time emergency support. Now running on **Expo SDK 53** with enhanced security features.

## 🚨 What It Does

- **One-tap SOS alert** with real-time location sharing
- **Live location tracking** to trusted emergency contacts
- **Voice-activated trigger** (say a keyword to automatically send SOS)
- **Fake call feature** to help escape unsafe situations safely
- **Push notifications** for instant emergency alerts
- **Nearby safe places** search (hospitals, police stations via OpenStreetMap & Nominatim API)
- **Emergency contacts management** with quick-dial functionality
- **SMS emergency alerts** as backup communication

---

## 🧰 Tech Stack

### Core Technologies
- **React Native** with **Expo SDK 53** 
- **Firebase 11.6.0** (Authentication + Firestore Database)
- **React Navigation** for seamless screen transitions
- **Redux Toolkit** for state management
- **NativeWind** for styling (Tailwind CSS for React Native)

### Key Dependencies
- **Maps & Location**: `react-native-maps`, `expo-location`
- **Voice Recognition**: `@react-native-voice/voice`
- **Communication**: `expo-notifications`, `expo-sms`, `expo-speech`
- **Media**: `expo-av` for audio functionality
- **Storage**: `@react-native-async-storage/async-storage`
- **UI Libraries**: `react-native-vector-icons`, `react-native-gesture-handler`

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device (for testing)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd SafeZone
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Important**: The `.env.local` file is automatically ignored by git to keep your Firebase credentials secure.

### 4. Firebase Configuration
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Copy your Firebase config to the `.env.local` file
5. Your credentials are now securely stored and won't be pushed to version control

### 5. Run the App
```bash
npx expo start
```
- Scan the QR code with Expo Go (Android) or Camera app (iOS)
- Or press 'w' to run in web browser
- Press 'a' for Android simulator or 'i' for iOS simulator

---

## 📱 App Structure

```
SafeZone/
├── screens/
│   ├── HomeScreen.js          # Main dashboard
│   ├── LoginScreen.js         # User authentication
│   ├── SignUpScreen.js        # User registration
│   ├── MapScreen.js           # Interactive map with safe places
│   ├── EmergencyContacts.js   # Manage emergency contacts
│   ├── FakeCallScreen.js      # Fake call interface
│   └── VoiceTriggerScreen.js  # Voice command setup
├── firebaseConfig.js          # Firebase initialization
├── App.js                     # Main app component
├── .env.local                 # Environment variables (secure)
└── assets/                    # Icons and images
```

---

## 🛠️ Core Features

### 🆘 Emergency SOS System
- **One-tap activation** sends location and alert to all emergency contacts
- **Automatic SMS** with live location link
- **Push notifications** to emergency contacts
- **Background location tracking** during emergencies

### 🎙️ Voice Activation
- **Custom trigger words** for hands-free activation
- **Continuous listening** in background (when enabled)
- **Quick response** without unlocking device

### 📍 Location Services
- **Real-time GPS tracking** with high accuracy
- **Nearby safe places** finder (hospitals, police, government offices)
- **Interactive map** with custom markers
- **Location sharing** via SMS and notifications

### 📞 Communication Features
- **Emergency contacts** management
- **Fake call simulation** with realistic interface
- **SMS fallback** when internet is unavailable
- **Voice announcements** for hands-free operation

---

## 🔒 Security Features

- **Environment variables** protect Firebase credentials
- **Secure authentication** with Firebase Auth
- **Local storage encryption** for sensitive data
- **No hardcoded API keys** in source code
- **Git-ignored** environment files

---

## 🚀 Development

### Available Scripts
- `npm start` - Start development server
- `npm run android` - Run on Android device/simulator
- `npm run ios` - Run on iOS device/simulator  
- `npm run web` - Run in web browser

### Platform Support
- ✅ **Android** (Primary target)
- ✅ **iOS** (Full support)
- ✅ **Web** (Progressive Web App)

### Permissions Required
- **Location** (Always/When in use)
- **Microphone** (Voice activation)
- **Camera** (Future features)
- **Contacts** (Emergency contacts)
- **Phone** (Fake calls)
- **SMS** (Emergency messaging)

---

## 🛡️ Privacy & Safety

- **Local data storage** - sensitive information stays on device
- **Encrypted communications** via Firebase
- **No data tracking** or analytics
- **Open source** - transparent and auditable
- **Emergency-first design** - optimized for crisis situations

---

## 📋 Roadmap

### Planned Features
- [ ] **Real-time chat** with emergency contacts
- [ ] **Panic button widget** for home screen
- [ ] **Offline mode** with local storage
- [ ] **Multi-language support**
- [ ] **Integration with local emergency services**
- [ ] **Family safety groups**
- [ ] **Location geofencing** and safe zone alerts

### Technical Improvements
- [ ] **App store deployment** (Google Play & App Store)
- [ ] **Firebase Cloud Functions** for server-side logic
- [ ] **Push notification enhancements**
- [ ] **Background processing optimization**
- [ ] **UI/UX improvements** based on user feedback

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **0BSD License** - see the package.json for details.

---

## ⚠️ Disclaimer

SafeZone is designed as a supplementary safety tool. **Always contact local emergency services (911, 112, etc.) for immediate life-threatening emergencies**. This app should not be relied upon as the sole means of emergency communication.

---

## 📞 Support

For technical support or feature requests, please open an issue in the repository.

**Stay Safe! 🛡️**


