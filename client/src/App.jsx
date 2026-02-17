import { useState, useEffect } from "react";
import { FaFacebook, FaGithub, FaInstagram, FaGlobe, FaMoon, FaSun, FaArrowRight, FaCopy, FaCheck } from "react-icons/fa";

function App() {
  const [links] = useState([
    { name: "Facebook", url: "https://web.facebook.com/charlespuracp", icon: <FaFacebook />, color: "bg-blue-600", darkColor: "bg-blue-700", lightColor: "bg-blue-500" },
    { name: "GitHub", url: "https://github.com/charlespura", icon: <FaGithub />, color: "bg-gray-800", darkColor: "bg-gray-900", lightColor: "bg-gray-700" },
    { name: "Portfolio", url: "https://cpportfolio.onrender.com/", icon: <FaGlobe />, color: "bg-purple-600", darkColor: "bg-purple-700", lightColor: "bg-purple-500" },
    { name: "Instagram", url: "https://www.instagram.com/charlespura19/", icon: <FaInstagram />, color: "bg-pink-600", darkColor: "bg-pink-700", lightColor: "bg-pink-500" },
  ]);

  const [darkMode, setDarkMode] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const copyToClipboard = (url, index) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      
      {/* Theme Toggle Button */}
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

      {/* Header */}
      <div className={`backdrop-blur-sm shadow-lg transition-colors duration-300 ${
        darkMode ? 'bg-gray-800/80' : 'bg-white/80'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className={`text-5xl font-bold text-center transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Charles Pura <span className="text-5xl animate-bounce inline-block">🔗</span>
          </h1>
          <p className={`text-center mt-2 transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Connect with me on social media
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>4</div>
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
          {links.map((link, index) => (
            <div
              key={index}
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
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{link.icon}</span>
                    <span className="text-xl font-semibold">{link.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Copy button */}
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
              
              {/* Tooltip */}
              {hoveredIndex === index && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm py-1 px-3 rounded-lg whitespace-nowrap">
                  Click to visit {link.name}
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
          <p>© 2024 Charles Pura • Built with React & Tailwind</p>
          <div className="flex justify-center gap-4 mt-4">
            <span className="text-sm opacity-75">✨ Always open to connect</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;