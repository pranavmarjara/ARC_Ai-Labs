import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/95 backdrop-blur-md border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300">
          This website stores data in your browser to function. If you click Accept All, 
          we will store some additional data to improve the website by learning how visitors use it.
        </p>
        <div className="flex gap-4 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-6 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-6 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
