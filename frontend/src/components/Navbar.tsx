import { useState, useEffect } from 'react';
import arcLogo from '../assets/arc-logo-new.png';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center">
            <img
              src={arcLogo}
              alt="ARC AI Labs"
              className="h-20 w-auto object-contain"
            />
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-white hover:text-gray-300 transition-colors">
              About
            </a>
            <a href="#technology" className="text-white hover:text-gray-300 transition-colors">
              Technology
            </a>
            <a href="#pioneers" className="text-white hover:text-gray-300 transition-colors">
              Pioneers
            </a>
            <a href="#contact" className="text-white hover:text-gray-300 transition-colors">
              Contact
            </a>
            <button className="bg-white text-black px-6 py-2 rounded-full hover:bg-gray-200 transition-colors font-medium">
              Get Involved
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
