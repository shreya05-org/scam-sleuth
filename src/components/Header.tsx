import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Always start with dark mode as per brand book
    document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10" style={{
      backgroundColor: 'rgba(18, 18, 18, 0.8)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="max-w-[120rem] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center font-heading text-xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #64FFDA 0%, #BB86FC 100%)',
                color: '#000000'
              }}>
              US
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">
                Unmasking Scams
              </h1>
              <p className="font-paragraph text-xs text-foreground/60">
                AI Risk Intelligence
              </p>
            </div>
          </Link>

          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-primary" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
