import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Mission from '../components/Mission';
import Testimonials from '../components/Testimonials';
import CTASection from '../components/CTASection';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';
import CookieConsent from '../components/CookieConsent';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <Mission />
      <Testimonials />
      <CTASection />
      <ContactForm />
      <Footer />
      <CookieConsent />
    </div>
  );
}
