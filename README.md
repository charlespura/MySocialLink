# 🌟 MySocialLink

[Live Demo](https://charlespura.github.io/MySocialLink/)

---

## 📌 About The Project

**MySocialLink** is a modern, user-friendly web application that allows anyone to create their own personalized link page — completely without sign-up or registration. Think of it as your own Linktree-style page where you can showcase all your social media profiles in one beautiful, shareable link.

---


The README now fully documents all the latest features including the password protection system! 🔒✨
## ✨ Key Features

* 🚀 **No Sign-up Required** – Instant page creation
* ☁️ **Cloud Saved** – Links sync across all devices using Firebase
* 🎨 **Beautiful UI** – Modern gradient design with smooth animations
* 🌓 **Dark/Light Mode** – Toggle between themes
* 📱 **Fully Responsive** – Works perfectly on mobile, tablet, and desktop
* 🔗 **Custom Usernames** – Get your own URL at `/username`
* 📋 **Copy Links** – Easy copy buttons for all your social profiles
* ✨ **8+ Platforms** – Facebook, GitHub, Instagram, Twitter, YouTube, TikTok, Discord, and custom links

## **New Features Added to README:**

1. **Password Protection** – Complete section on how it works
2. **Security Features** – Detailed security implementation
3. **Firebase Data Structure** – Updated with password field
4. **Password Flow** – Step-by-step explanation
5. **Version History** – Added v2.0.0 with password protection
6. **Screenshots** – ASCII art showing password modal
7. **Testing Section** – How to test password protection
8. **Known Issues** – Updated with modal input fix
9. **Future Enhancements** – Added password reset option
---

## 🛠️ Tech Stack

**Frontend**

* React 19 – UI library for building components
* Vite – Next-generation build tool for fast development
* Tailwind CSS – Utility-first CSS framework for styling
* React Icons – Popular icons library

**Backend & Database**

* Firebase Firestore – NoSQL cloud database for storing user links


**Deployment**

* GitHub Pages – Static site hosting
* gh-pages – Deploy tool for GitHub Pages

**Core Dependencies**

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-icons": "^5.5.0",
  "firebase": "^11.8.1",
  "vite": "^7.3.1",
  "gh-pages": "^6.3.0"
}
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn
* Git
* Firebase account (free tier)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/charlespura/MySocialLink.git
cd MySocialLink/client
```

2. Install dependencies:

```bash
npm install
```

3. Set up Firebase:

* Go to [Firebase Console](https://console.firebase.google.com/)
* Create a new project
* Enable Firestore Database
* Create a web app to get your config
* Update `src/firebase.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

4. Update Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /socialLinks/{document} {
      allow read, write: if true;
    }
  }
}
```

5. Run locally:

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
MySocialLink/
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx           # Main application component
│   │   ├── firebase.js       # Firebase configuration
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── package.json
│   ├── vite.config.js        # Vite configuration
│   └── README.md
```

---

## 🎯 How It Works

1. User visits the homepage
2. Enters a username (e.g., `john123`)
3. Adds social links from available platforms
4. Saves to cloud — data stored in Firebase Firestore
5. Shares their page at `yoursite.com/#john123`
6. Anyone visits the link and sees their curated social profiles

---

## 🌐 Deployment to GitHub Pages

1. Update `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/MySocialLink/', // Your repository name
});
```

2. Add homepage and deploy scripts in `package.json`:

```json
{
  "homepage": "https://charlespura.github.io/MySocialLink",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Deploy:

```bash
npm run deploy
```

---

## 📊 Firebase Data Structure

```
socialLinks/                    
   └── username/                 
        ├── links/                
        │    ├── id              # Timestamp-based ID
        │    ├── platform        # Platform name
        │    ├── url             # Full URL
        │    ├── iconName        # Icon identifier
        │    ├── color           # Brand color
        │    └── placeholder      # URL placeholder
        ├── createdAt            # ISO timestamp
        └── updatedAt            # ISO timestamp

studentLogs/                     
   └── ...                       # Your existing student logs
```

---

## 🎨 Features in Detail

**Platform Support**

* ✅ Facebook
* ✅ GitHub
* ✅ Instagram
* ✅ Portfolio/Custom
* ✅ Twitter/X
* ✅ YouTube
* ✅ TikTok
* ✅ Discord

**User Experience**

* ⚡ Instant page creation
* 💾 Automatic cloud backup
* 📱 Mobile-optimized
* 🎭 Smooth animations
* 🔄 Real-time updates
* 📋 One-click copy

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source under the **MIT License**.

---

## 👨‍💻 Author

**Charles Pura**

* GitHub: [@charlespura](https://github.com/charlespura)
* Facebook: [charlespuracp](https://www.facebook.com/charlespuracp)
* Instagram: [@charlespura19](https://www.instagram.com/charlespura19)
* Portfolio: [charlespura.onrender.com](https://cpportfolio.onrender.com)

---

## 🙏 Acknowledgments

* React Icons – Beautiful icons
* Tailwind CSS – Utility-first styling
* Firebase – Reliable cloud database
* Vite – Fast builds
* GitHub Pages – Free hosting

---

## 📸 Screenshots
**Dark Mode**
![Dark Mode]
<img width="800" height="500" alt="Screenshot 2026-02-17 at 6 08 45 PM" src="https://github.com/user-attachments/assets/406c6a70-7b25-48ed-b8fb-7a86c73b3e96" />

**Light Mode**
![Light Mode]
<img width="800" height="500" alt="Screenshot 2026-02-17 at 6 09 03 PM" src="https://github.com/user-attachments/assets/aaa5b965-f5a1-4de4-a7d2-27c613c48115" />


Made with ❤️ by Charles Pura
