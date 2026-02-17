import { useState, useEffect } from "react";
import { 
  FaFacebook, FaGithub, FaInstagram, FaGlobe, FaMoon, FaSun, 
  FaArrowRight, FaCopy, FaCheck, FaPlus, FaTrash, FaEdit, 
  FaSave, FaLink, FaTwitter, FaYoutube, FaTiktok, FaDiscord,
  FaCloudUploadAlt, FaCloudDownloadAlt
} from "react-icons/fa";
import { db, saveUserLinks, getUserLinks } from './firebase';
import { ref, set } from 'firebase/database';

// Available platforms for users to choose from
const AVAILABLE_PLATFORMS = [
  { name: "Facebook", iconName: "FaFacebook", color: "bg-blue-600", darkColor: "bg-blue-700", placeholder: "https://facebook.com/yourusername" },
  { name: "GitHub", iconName: "FaGithub", color: "bg-gray-800", darkColor: "bg-gray-900", placeholder: "https://github.com/yourusername" },
  { name: "Instagram", iconName: "FaInstagram", color: "bg-pink-600", darkColor: "bg-pink-700", placeholder: "https://instagram.com/yourusername" },
  { name: "Portfolio", iconName: "FaGlobe", color: "bg-purple-600", darkColor: "bg-purple-700", placeholder: "https://yourportfolio.com" },
  { name: "Twitter", iconName: "FaTwitter", color: "bg-blue-400", darkColor: "bg-blue-500", placeholder: "https://twitter.com/yourusername" },
  { name: "YouTube", iconName: "FaYoutube", color: "bg-red-600", darkColor: "bg-red-700", placeholder: "https://youtube.com/@yourchannel" },
  { name: "TikTok", iconName: "FaTiktok", color: "bg-black", darkColor: "bg-gray-900", placeholder: "https://tiktok.com/@yourusername" },
  { name: "Discord", iconName: "FaDiscord", color: "bg-indigo-600", darkColor: "bg-indigo-700", placeholder: "https://discord.gg/yourserver" },
];

// Icon mapping function
const getIcon = (iconName) => {
  switch(iconName) {
    case "FaFacebook": return <FaFacebook />;
    case "FaGithub": return <FaGithub />;
    case "FaInstagram": return <FaInstagram />;
    case "FaGlobe": return <FaGlobe />;
    case "FaTwitter": return <FaTwitter />;
    case "FaYoutube": return <FaYoutube />;
    case "FaTiktok": return <FaTiktok />;
    case "FaDiscord": return <FaDiscord />;
    default: return <FaLink />;
  }
};

function App() {
  const [username, setUsername] = useState("");
  const [userLinks, setUserLinks] = useState([]);
  const [showCreator, setShowCreator] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [notification, setNotification] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get username from URL hash on load
  useEffect(() => {
    const hash = window.location.hash;
    const urlUsername = hash.replace('#', '');
    if (urlUsername && urlUsername !== "") {
      setUsername(urlUsername);
      loadUserLinks(urlUsername);
    } else {
      setShowCreator(true);
    }
  }, []);

  // Load user links from Firebase
  const loadUserLinks = async (user) => {
    setIsLoading(true);
    try {
      // Try Firebase first
      const firebaseLinks = await getUserLinks(user);
      if (firebaseLinks) {
        setUserLinks(firebaseLinks);
        showNotification("Loaded from cloud! ☁️");
      } else {
        // Fallback to localStorage
        const localLinks = localStorage.getItem(`links_${user}`);
        if (localLinks) {
          setUserLinks(JSON.parse(localLinks));
          showNotification("Loaded from local storage 💾");
        } else {
          setShowCreator(true);
        }
      }
    } catch (error) {
      console.error("Error loading links:", error);
      showNotification("Error loading links. Using local backup.");
      
      // Fallback to localStorage
      const localLinks = localStorage.getItem(`links_${user}`);
      if (localLinks) {
        setUserLinks(JSON.parse(localLinks));
      } else {
        setShowCreator(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save user links to Firebase and localStorage
  const saveUserLinks = async () => {
    if (!username.trim()) {
      showNotification("Please enter a username");
      return;
    }

    setIsSaving(true);
    const cleanUsername = username.toLowerCase().replace(/\s+/g, '');
    
    try {
      // Save to Firebase (preserves your studentLogs data)
      await saveUserLinks(cleanUsername, userLinks);
      
      // Save to localStorage as backup
      localStorage.setItem(`links_${cleanUsername}`, JSON.stringify(userLinks));
      
      // Update URL with hash
      window.location.hash = cleanUsername;
      
      setUsername(cleanUsername);
      setShowCreator(false);
      
      const shareableUrl = `${window.location.origin}${window.location.pathname}#${cleanUsername}`;
      setShareUrl(shareableUrl);
      
      showNotification("✅ Saved to cloud! Available on all devices.");
    } catch (error) {
      console.error("Error saving:", error);
      showNotification("⚠️ Saved locally only. Cloud save failed.");
      
      // Still save locally
      localStorage.setItem(`links_${cleanUsername}`, JSON.stringify(userLinks));
      window.location.hash = cleanUsername;
      setUsername(cleanUsername);
      setShowCreator(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Add new link
  const addLink = (platform) => {
    const newLink = {
      id: Date.now(),
      platform: platform.name,
      url: "",
      iconName: platform.iconName,
      color: platform.color,
      darkColor: platform.darkColor,
      placeholder: platform.placeholder,
      isEditing: true
    };
    setUserLinks([...userLinks, newLink]);
  };

  // Update link
  const updateLink = (id, field, value) => {
    setUserLinks(userLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  // Delete link
  const deleteLink = (id) => {
    setUserLinks(userLinks.filter(link => link.id !== id));
  };

  // Toggle link edit mode
  const toggleLinkEdit = (id) => {
    setUserLinks(userLinks.map(link => 
      link.id === id ? { ...link, isEditing: !link.isEditing } : link
    ));
  };

  // Copy to clipboard
  const copyToClipboard = (text, index = null) => {
    navigator.clipboard.writeText(text);
    if (index !== null) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      showNotification("Copied to clipboard! 📋");
    }
  };

  // Show notification
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  // Handle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const urlUsername = hash.replace('#', '');
      if (urlUsername && urlUsername !== "") {
        setUsername(urlUsername);
        loadUserLinks(urlUsername);
        setShowCreator(false);
      } else {
        setShowCreator(true);
        setUserLinks([]);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // If showing creator page
  if (showCreator) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        
        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`fixed top-4 right-4 p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-10 ${
            darkMode 
              ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' 
              : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
          }`}
        >
          {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>

        {/* Notification */}
        {notification && (
          <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
            {notification}
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Creator Header */}
          <div className={`backdrop-blur-sm shadow-lg rounded-2xl p-8 mb-8 ${
            darkMode ? 'bg-gray-800/80' : 'bg-white/80'
          }`}>
            <h1 className={`text-4xl font-bold text-center mb-4 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Create Your Link Page 🔗
            </h1>
            <p className={`text-center mb-6 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              No sign-up required! Links save to cloud automatically.
            </p>

            {/* Username Input */}
            <div className="max-w-md mx-auto">
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Choose your username
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="john123"
                  className={`flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  onClick={saveUserLinks}
                  disabled={isSaving}
                  className={`px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? <FaCloudUploadAlt className="animate-pulse" /> : <FaSave />}
                  {isSaving ? 'Saving...' : 'Create'}
                </button>
              </div>
              <p className={`text-sm mt-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Your page will be at: {window.location.origin}{window.location.pathname}#{username || "username"}
              </p>
            </div>
          </div>

          {/* Link Builder */}
          <div className={`backdrop-blur-sm shadow-lg rounded-2xl p-8 ${
            darkMode ? 'bg-gray-800/80' : 'bg-white/80'
          }`}>
            <h2 className={`text-2xl font-semibold mb-6 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Add Your Links
            </h2>

            {/* Available Platforms */}
            <div className="mb-8">
              <h3 className={`text-sm font-medium mb-3 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Choose platforms to add:
              </h3>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_PLATFORMS.map((platform, index) => (
                  <button
                    key={index}
                    onClick={() => addLink(platform)}
                    className={`${platform.color} text-white px-4 py-2 rounded-lg hover:opacity-90 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm`}
                  >
                    {getIcon(platform.iconName)}
                    {platform.name}
                    <FaPlus size={12} />
                  </button>
                ))}
              </div>
            </div>

            {/* Links List */}
            {userLinks.length > 0 ? (
              <div className="space-y-3">
                {userLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`p-4 rounded-xl ${
                      darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}
                  >
                    {link.isEditing ? (
                      <div className="flex gap-2">
                        <div className={`${link.color} text-white p-3 rounded-lg flex items-center gap-2`}>
                          {getIcon(link.iconName)}
                        </div>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                          placeholder={link.placeholder}
                          className={`flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition ${
                            darkMode 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <button
                          onClick={() => toggleLinkEdit(link.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => deleteLink(link.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`${link.color} text-white p-2 rounded-lg`}>
                            {getIcon(link.iconName)}
                          </span>
                          <span className={darkMode ? 'text-white' : 'text-gray-800'}>
                            {link.url || "No URL set"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleLinkEdit(link.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => deleteLink(link.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <FaLink className="text-5xl mx-auto mb-4 opacity-50" />
                <p>No links yet. Add some above!</p>
              </div>
            )}

            {/* Save Button */}
            {userLinks.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={saveUserLinks}
                  disabled={isSaving}
                  className={`px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? <FaCloudUploadAlt className="animate-pulse" /> : <FaCloudUploadAlt />}
                  {isSaving ? 'Saving to Cloud...' : 'Save & Publish to Cloud'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main view - showing user's links
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <FaCloudDownloadAlt className="text-6xl text-purple-600 animate-bounce mx-auto mb-4" />
          <p className={darkMode ? 'text-white' : 'text-gray-800'}>Loading links from cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      
      {/* Theme Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-4 right-4 p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-10 ${
          darkMode 
            ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' 
            : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
        }`}
      >
        {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
      </button>

      {/* Edit Button */}
      <button
        onClick={() => setShowCreator(true)}
        className={`fixed top-4 left-4 p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-10 ${
          darkMode 
            ? 'bg-purple-600 text-white hover:bg-purple-700' 
            : 'bg-purple-500 text-white hover:bg-purple-600'
        }`}
      >
        <FaEdit size={20} />
      </button>

      {/* Cloud Status Indicator */}
      <div className={`fixed top-4 left-20 p-2 rounded-full shadow-lg z-10 ${
        darkMode ? 'bg-green-600' : 'bg-green-500'
      } text-white text-xs`}>
        <FaCloudUploadAlt className="inline mr-1" /> Cloud Saved
      </div>

      {/* Share URL Display */}
      <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } rounded-full shadow-lg px-4 py-2 flex items-center gap-2`}>
        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Share:</span>
        <span className="text-purple-600 font-mono text-sm">
          {window.location.origin}{window.location.pathname}#{username}
        </span>
        <button
          onClick={() => copyToClipboard(`${window.location.origin}${window.location.pathname}#${username}`)}
          className="p-1 hover:bg-gray-100 rounded-full transition"
        >
          <FaCopy className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
        </button>
      </div>

      {/* Header */}
      <div className={`backdrop-blur-sm shadow-lg transition-colors duration-300 ${
        darkMode ? 'bg-gray-800/80' : 'bg-white/80'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className={`text-5xl font-bold text-center transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {username} <span className="text-5xl animate-bounce inline-block">🔗</span>
          </h1>
          <p className={`text-center mt-2 transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Connect with me on social media
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {userLinks.length}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Platforms</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>🌐</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Links Container */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {userLinks.map((link, index) => (
            <div
              key={link.id}
              className="relative group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${
                  darkMode ? link.darkColor : link.color
                } text-white p-5 rounded-xl hover:opacity-90 transform hover:scale-105 hover:shadow-2xl transition-all duration-300 block shadow-lg relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getIcon(link.iconName)}</span>
                    <span className="text-xl font-semibold">{link.platform}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        copyToClipboard(link.url, index);
                      }}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
                    >
                      {copiedIndex === index ? <FaCheck size={16} /> : <FaCopy size={16} />}
                    </button>
                    <FaArrowRight className={`text-2xl transform transition-transform duration-300 ${
                      hoveredIndex === index ? 'translate-x-1' : ''
                    }`} />
                  </div>
                </div>
              </a>
              
              {hoveredIndex === index && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm py-1 px-3 rounded-lg whitespace-nowrap">
                  Click to visit {link.platform}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`text-center mt-12 transition-colors duration-300 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p>Create your own link page at <a 
            href={window.location.pathname}
            className="text-purple-600 hover:underline"
          >MySocialLink</a></p>
          <div className="flex justify-center gap-4 mt-4">
            <span className="text-sm opacity-75">✨ Cloud saved • Access anywhere</span>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
          {notification}
        </div>
      )}
    </div>
  );
}

export default App;