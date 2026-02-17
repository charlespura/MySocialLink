import { useState, useEffect } from "react";
import {
  FaFacebook, FaGithub, FaInstagram, FaGlobe, FaMoon, FaSun,
  FaArrowRight, FaCopy, FaCheck, FaPlus, FaTrash, FaEdit,
  FaSave, FaLink, FaTwitter, FaYoutube, FaTiktok, FaDiscord,
  FaCloudUploadAlt, FaCloudDownloadAlt, FaLock, FaUnlock, FaKey
} from "react-icons/fa";
import { saveUserLinks, getUserLinks, verifyPassword } from './firebase';

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

const normalizeUrl = (value) => {
  if (!value) return "";
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
};

const getFacebookHandle = (value) => {
  try {
    const url = new URL(normalizeUrl(value));
    if (!url.hostname.includes("facebook.com")) return "";
    if (url.pathname.includes("profile.php")) {
      const id = url.searchParams.get("id");
      return id ? `ID ${id}` : "";
    }
    const segments = url.pathname.split("/").filter(Boolean);
    return segments[0] || "";
  } catch {
    return "";
  }
};

function App() {
  const [username, setUsername] = useState("");
  const [userLinks, setUserLinks] = useState([]);
  const [showCreator, setShowCreator] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedMode !== null ? JSON.parse(savedMode) : systemPrefersDark;
  });
  const [shareUrl, setShareUrl] = useState("");
  const [notification, setNotification] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Password related states
  const [password, setPassword] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const facebookLink = userLinks.find(
    (link) => link.platform === "Facebook" && link.url && link.url.trim() !== ""
  );
  const facebookHandle = facebookLink ? getFacebookHandle(facebookLink.url) : "";

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
      const data = await getUserLinks(user);
      if (data) {
        setUserLinks(data.links);
        setHasPassword(!!data.password);
        // If there's a password, lock the page
        if (data.password) {
          setIsLocked(true);
        } else {
          setIsLocked(false);
        }
        showNotification("Loaded from cloud! ☁️");
      } else {
        // New user - show creator
        setShowCreator(true);
      }
    } catch (error) {
      console.error("Error loading links:", error);
      showNotification("Error loading links.");
      setShowCreator(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Save user links to Firebase and localStorage
  const handleSaveUserLinks = async () => {
    if (!username.trim()) {
      showNotification("Please enter a username");
      return;
    }

    if (!password.trim() && !hasPassword) {
      showNotification("Please set a password to protect your page");
      return;
    }

    setIsSaving(true);
    const cleanUsername = username.toLowerCase().replace(/\s+/g, '');

    try {
      // Save to Firebase with password
      await saveUserLinks(cleanUsername, userLinks, password);

      // Save to localStorage as backup
      localStorage.setItem(`links_${cleanUsername}`, JSON.stringify(userLinks));

      // Update URL with hash
      window.location.hash = cleanUsername;

      setUsername(cleanUsername);
      setHasPassword(true);
      setIsLocked(false);
      setShowCreator(false);

      const shareableUrl = `${window.location.origin}${window.location.pathname}#${cleanUsername}`;
      setShareUrl(shareableUrl);

      showNotification("✅ Saved to cloud! Page is password protected.");
    } catch (error) {
      console.error("Error saving:", error);
      showNotification("⚠️ Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  // Verify password before editing
  const handleVerifyPassword = async () => {
    if (!enteredPassword.trim()) {
      showNotification("Please enter a password");
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await verifyPassword(username, enteredPassword);
      if (isValid) {
        setIsLocked(false);
        setShowPasswordModal(false);
        setEnteredPassword("");
        showNotification("✅ Access granted!");
      } else {
        showNotification("❌ Wrong password!");
      }
    } catch (error) {
      showNotification("Error verifying password");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle edit button click
  const handleEditClick = () => {
    if (hasPassword && isLocked) {
      setShowPasswordModal(true);
    } else {
      setShowCreator(true);
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

  // Handle dark mode with localStorage persistence
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const urlUsername = hash.replace('#', '');
      if (urlUsername && urlUsername !== "") {
        setUsername(urlUsername);
        loadUserLinks(urlUsername);
      } else {
        setShowCreator(true);
        setUserLinks([]);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Password Modal - FIXED VERSION with autoFocus and better mobile responsiveness
  const PasswordModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl transform transition-all ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              darkMode ? 'bg-purple-900/50' : 'bg-purple-100'
            }`}>
              <FaLock className={`text-4xl ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
            <h3 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Page Locked 🔒
            </h3>
            <p className={`mt-2 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              This page is password protected. Enter the password to edit.
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              placeholder="Enter password"
              className={`w-full px-4 py-4 rounded-xl border-2 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition text-base ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
              autoFocus
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setEnteredPassword("");
                }}
                className={`w-full sm:flex-1 px-4 py-4 rounded-xl font-semibold transition text-base ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPassword}
                disabled={isVerifying}
                className={`w-full sm:flex-1 px-4 py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-base ${
                  darkMode
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                } ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isVerifying ? (
                  <>
                    <FaCloudDownloadAlt className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <FaKey />
                    <span>Unlock</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // If showing creator page
  if (showCreator) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>

        {/* Theme Toggle - Mobile Responsive */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`fixed top-4 right-4 p-3 sm:p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-10 ${
            darkMode
              ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
              : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
          }`}
        >
          {darkMode ? <FaSun size={20} className="sm:w-6 sm:h-6" /> : <FaMoon size={20} className="sm:w-6 sm:h-6" />}
        </button>

        {/* Notification - Mobile Responsive */}
        {notification && (
          <div className="fixed top-20 right-2 sm:right-4 left-2 sm:left-auto bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-bounce text-sm sm:text-base">
            {notification}
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          {/* Creator Header */}
          <div className={`backdrop-blur-sm shadow-lg rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 ${
            darkMode ? 'bg-gray-800/80' : 'bg-white/80'
          }`}>
            <h1 className={`text-3xl sm:text-4xl font-bold text-center mb-3 sm:mb-4 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Create Your Link Page 🔗
            </h1>
            <p className={`text-center mb-4 sm:mb-6 text-sm sm:text-base ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Set a password to protect your page from unwanted edits.
            </p>

            {/* Username Input */}
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Choose your username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="john123"
                  className={`w-full px-4 py-3 sm:py-4 rounded-xl border-2 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition text-base ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Set a password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to protect your page"
                  className={`w-full px-4 py-3 sm:py-4 rounded-xl border-2 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition text-base ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <p className={`text-xs sm:text-sm mt-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  You'll need this password to edit your page later
                </p>
              </div>

              <button
                onClick={handleSaveUserLinks}
                disabled={isSaving || !password}
                className={`w-full px-6 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 text-base ${
                  (isSaving || !password) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? <FaCloudUploadAlt className="animate-pulse" /> : <FaSave />}
                {isSaving ? 'Creating...' : 'Create Protected Page'}
              </button>

              <p className={`text-xs sm:text-sm text-center break-all ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Your page will be at: {window.location.origin}{window.location.pathname}#{username || "username"}
              </p>
            </div>
          </div>

          {/* Link Builder */}
          <div className={`backdrop-blur-sm shadow-lg rounded-2xl p-6 sm:p-8 ${
            darkMode ? 'bg-gray-800/80' : 'bg-white/80'
          }`}>
            <h2 className={`text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Add Your Links
            </h2>

            {/* Available Platforms */}
            <div className="mb-6 sm:mb-8">
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
                    className={`${platform.color} text-white px-3 sm:px-4 py-2 rounded-lg hover:opacity-90 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm`}
                  >
                    <span className="text-sm sm:text-base">{getIcon(platform.iconName)}</span>
                    <span className="hidden xs:inline">{platform.name}</span>
                    <FaPlus size={10} className="sm:w-3 sm:h-3" />
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
                    className={`p-3 sm:p-4 rounded-xl ${
                      darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}
                  >
                    {link.isEditing ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className={`${link.color} text-white p-3 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto`}>
                          {getIcon(link.iconName)}
                          <span className="text-sm sm:hidden">{link.platform}</span>
                        </div>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                          placeholder={link.placeholder}
                          className={`flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm ${
                            darkMode
                              ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleLinkEdit(link.id)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            <FaCheck className="sm:hidden" />
                            <span className="hidden sm:inline">Save</span>
                          </button>
                          <button
                            onClick={() => deleteLink(link.id)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                          >
                            <FaTrash className="sm:hidden" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className={`${link.color} text-white p-2 rounded-lg`}>
                            {getIcon(link.iconName)}
                          </span>
                          <span className={`text-sm sm:text-base truncate max-w-[200px] sm:max-w-none ${
                            darkMode ? 'text-white' : 'text-gray-800'
                          }`}>
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
              <div className={`text-center py-8 sm:py-12 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <FaLink className="text-4xl sm:text-5xl mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">No links yet. Add some above!</p>
              </div>
            )}

            {/* Save Button */}
            {userLinks.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleSaveUserLinks}
                  disabled={isSaving}
                  className={`w-full sm:w-auto px-6 sm:px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-base ${
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
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <FaCloudDownloadAlt className="text-5xl sm:text-6xl text-purple-600 animate-bounce mx-auto mb-4" />
          <p className={`text-base sm:text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Loading links from cloud...
          </p>
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

      {/* Password Modal */}
      {showPasswordModal && <PasswordModal />}

      {/* Theme Toggle - Mobile Responsive */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-3 right-3 sm:top-4 sm:right-4 p-3 sm:p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-10 ${
          darkMode
            ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
            : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
        }`}
      >
        {darkMode ? <FaSun size={18} className="sm:w-5 sm:h-5" /> : <FaMoon size={18} className="sm:w-5 sm:h-5" />}
      </button>

      {/* Edit Button - Mobile Responsive */}
      <button
        onClick={handleEditClick}
        className={`fixed top-3 left-3 sm:top-4 sm:left-4 p-3 sm:p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-10 flex items-center gap-2 ${
          darkMode
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'bg-purple-500 text-white hover:bg-purple-600'
        }`}
      >
        {hasPassword && isLocked ? <FaLock size={18} className="sm:w-5 sm:h-5" /> : <FaUnlock size={18} className="sm:w-5 sm:h-5" />}
        <span className="text-xs sm:text-sm hidden sm:inline">
          {hasPassword && isLocked ? 'Locked' : 'Edit'}
        </span>
      </button>

      {/* Cloud Status Indicator - Mobile Responsive */}
      {userLinks.length > 0 && (
        <div className={`fixed top-3 left-16 sm:top-4 sm:left-24 p-2 rounded-full shadow-lg z-10 ${
          darkMode ? 'bg-green-600' : 'bg-green-500'
        } text-white text-xs flex items-center gap-1`}>
          <FaCloudUploadAlt size={12} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline text-xs">Cloud Saved</span>
        </div>
      )}

      {/* Share URL Display - Mobile Responsive */}
      {username && (
        <div className={`fixed bottom-3 left-1/2 transform -translate-x-1/2 z-10 w-[90%] sm:w-auto ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-full shadow-lg px-3 sm:px-4 py-2 flex items-center gap-2`}>
          <span className={`text-xs sm:text-sm hidden sm:inline ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Share:
          </span>
          <span className="text-purple-600 font-mono text-xs sm:text-sm truncate">
            {window.location.origin}{window.location.pathname}#{username}
          </span>
          <button
            onClick={() => copyToClipboard(`${window.location.origin}${window.location.pathname}#${username}`)}
            className="p-1 hover:bg-gray-100 rounded-full transition flex-shrink-0"
          >
            <FaCopy className={darkMode ? 'text-gray-400' : 'text-gray-600'} size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className={`backdrop-blur-sm shadow-lg transition-colors duration-300 ${
        darkMode ? 'bg-gray-800/80' : 'bg-white/80'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-2">
            <h1 className={`text-3xl sm:text-5xl font-bold text-center transition-colors duration-300 break-all ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {username}
            </h1>
            {hasPassword && (
              <FaLock className={`text-xl sm:text-2xl ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
            )}
            <span className="text-3xl sm:text-5xl animate-bounce inline-block">🔗</span>
          </div>
          <p className={`text-center mt-2 text-sm sm:text-base transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Connect with me on social media
          </p>

          {facebookLink && (
            <div className="mt-4 sm:mt-5 flex justify-center">
              <a
                href={facebookLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-md transition-all duration-200 ${
                  darkMode ? 'bg-blue-700/80 text-white' : 'bg-blue-600 text-white'
                } hover:opacity-90`}
              >
                <span className="text-xl sm:text-2xl">{getIcon("FaFacebook")}</span>
                <div className="text-left">
                  <div className="text-xs uppercase tracking-wider opacity-80">Facebook</div>
                  <div className="text-sm sm:text-base font-semibold">
                    {facebookHandle || "View profile"}
                  </div>
                </div>
              </a>
            </div>
          )}

          {/* Stats */}
          <div className="flex justify-center gap-6 sm:gap-8 mt-4 sm:mt-6">
            <div className="text-center">
              <div className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {userLinks.length}
              </div>
              <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Platforms</div>
            </div>
            <div className="text-center">
              <div className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>🌐</div>
              <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Links Container */}
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="space-y-3 sm:space-y-4">
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
                } text-white p-4 sm:p-5 rounded-xl hover:opacity-90 transform hover:scale-[1.02] sm:hover:scale-105 hover:shadow-2xl transition-all duration-300 block shadow-lg relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">{getIcon(link.iconName)}</span>
                    <span className="text-base sm:text-xl font-semibold">{link.platform}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        copyToClipboard(link.url, index);
                      }}
                      className="p-1 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
                    >
                      {copiedIndex === index ? <FaCheck size={14} className="sm:w-4 sm:h-4" /> : <FaCopy size={14} className="sm:w-4 sm:h-4" />}
                    </button>
                    <FaArrowRight className={`text-xl sm:text-2xl transform transition-transform duration-300 ${
                      hoveredIndex === index ? 'translate-x-1' : ''
                    }`} />
                  </div>
                </div>
              </a>

              {hoveredIndex === index && (
                <div className="absolute -top-8 sm:-top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs sm:text-sm py-1 px-2 sm:px-3 rounded-lg whitespace-nowrap">
                  Click to visit {link.platform}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`text-center mt-8 sm:mt-12 transition-colors duration-300 text-sm sm:text-base ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p>Create your own link page at <a
            href={window.location.pathname}
            className="text-purple-600 hover:underline"
          >MySocialLink</a></p>
          <div className="flex justify-center gap-4 mt-3 sm:mt-4">
            <span className="text-xs sm:text-sm opacity-75">✨ Password protected • Cloud saved</span>
          </div>
        </div>
      </div>

      {/* Notification - Mobile Responsive */}
      {notification && (
        <div className="fixed top-16 sm:top-20 right-2 sm:right-4 left-2 sm:left-auto bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-bounce text-sm sm:text-base">
          {notification}
        </div>
      )}
    </div>
  );
}

export default App;
