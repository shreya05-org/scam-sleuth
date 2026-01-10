import { Shield, Github, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24" style={{
      backgroundColor: 'rgba(18, 18, 18, 0.95)'
    }}>
      <div className="max-w-[120rem] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="font-heading text-lg font-bold text-foreground">
                Unmasking Scams
              </h3>
            </div>
            <p className="font-paragraph text-sm text-foreground/70">
              AI-powered job scam detection to protect job seekers from fraudulent opportunities.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h4 className="font-heading text-base font-semibold text-foreground mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="font-paragraph text-sm text-foreground/70 hover:text-primary transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="font-paragraph text-sm text-foreground/70 hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="font-paragraph text-sm text-foreground/70 hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Social Section */}
          <div>
            <h4 className="font-heading text-base font-semibold text-foreground mb-4">
              Connect
            </h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-primary" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-primary" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="font-paragraph text-sm text-center text-foreground/60">
            © 2026 Unmasking Scams — Cybersecurity Awareness
          </p>
        </div>
      </div>
    </footer>
  );
}
