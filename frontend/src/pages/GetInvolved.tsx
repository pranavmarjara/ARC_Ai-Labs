import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function GetInvolved() {
  const heroRef = useRef(null);
  const whyJoinRef = useRef(null);
  const opportunitiesRef = useRef(null);
  const ctaRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true });
  const whyJoinInView = useInView(whyJoinRef, { once: true, margin: '-100px' });
  const opportunitiesInView = useInView(opportunitiesRef, { once: true, margin: '-100px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-100px' });

  const opportunities = [
    {
      icon: "🔬",
      title: "Research & Innovation",
      description: "Contribute to groundbreaking AI research that's reshaping how we understand communication and consciousness."
    },
    {
      icon: "💻",
      title: "Software Development",
      description: "Build cutting-edge applications that translate fractured words into coherent voices using advanced AI technology."
    },
    {
      icon: "🧪",
      title: "Clinical Trials",
      description: "Help validate our technology through rigorous testing and bring hope to those who need their voice heard."
    },
    {
      icon: "📊",
      title: "Data Science",
      description: "Analyze complex datasets to improve our models and make our AI more accurate and empathetic."
    },
    {
      icon: "🎨",
      title: "Design & UX",
      description: "Create intuitive interfaces that make our technology accessible and meaningful to everyone."
    },
    {
      icon: "📢",
      title: "Community Outreach",
      description: "Share our mission with the world and connect with communities who can benefit from our work."
    }
  ];

  const values = [
    {
      title: "Make Real Impact",
      description: "Your work directly helps people find their voice and communicate their truth."
    },
    {
      title: "Learn & Grow",
      description: "Work alongside experts in AI, neuroscience, and linguistics on the frontier of technology."
    },
    {
      title: "Shape the Future",
      description: "Be part of a movement that's redefining human-AI interaction and accessibility."
    },
    {
      title: "Collaborative Culture",
      description: "Join a diverse team of passionate individuals united by a common mission."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-slate-950 to-zinc-950">
      <Navbar />
      
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-teal-900/20"></div>
        
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
              Join the Revolution
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl md:text-3xl text-gray-300 mb-8 max-w-4xl mx-auto"
          >
            Be part of something extraordinary. Help us transform fractured words into powerful voices.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto"
          >
            We're looking for passionate researchers, developers, designers, and visionaries 
            who want to make a real difference in people's lives through AI innovation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <a
              href="https://forms.gle/UWVjRFVK4foqz3Lv9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block group"
            >
              <button className="relative px-12 py-6 text-xl font-bold text-white overflow-hidden rounded-full">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 group-hover:from-purple-500 group-hover:via-blue-500 group-hover:to-teal-500 transition-all duration-300"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 blur-xl"></div>
                <span className="relative flex items-center gap-3">
                  Join Us!
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16"
          >
            <div className="flex justify-center">
              <svg className="w-8 h-8 text-gray-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      <section ref={whyJoinRef} className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={whyJoinInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Why Join ARC AI Labs?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We're not just building technology — we're giving voice to those who struggle to be heard.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={whyJoinInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-slate-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={opportunitiesRef} className="py-32 bg-gradient-to-b from-zinc-950 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={opportunitiesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
              Opportunities to Contribute
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Find your place in our mission. We welcome contributors from all backgrounds and skill levels.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {opportunities.map((opportunity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={opportunitiesInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-slate-900/80 border border-zinc-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-teal-500/0 group-hover:from-blue-500/5 group-hover:to-teal-500/5 rounded-2xl transition-all duration-300"></div>
                <div className="relative">
                  <div className="text-6xl mb-6">{opportunity.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-300 transition-colors">
                    {opportunity.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {opportunity.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={ctaRef} className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-teal-900/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
              Ready to Make a Difference?
            </h2>
            <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Your skills, passion, and dedication can help transform lives. Join us in building a future 
              where everyone's voice can be heard.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <a
              href="https://forms.gle/UWVjRFVK4foqz3Lv9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block group"
            >
              <button className="relative px-16 py-8 text-2xl font-bold text-white overflow-hidden rounded-full shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 group-hover:from-purple-500 group-hover:via-blue-500 group-hover:to-teal-500 transition-all duration-300"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 blur-2xl"></div>
                <span className="relative flex items-center gap-4">
                  Join Us!
                  <svg className="w-8 h-8 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </a>
            <p className="mt-6 text-gray-400 text-sm">
              Fill out our contributor application and we'll be in touch soon
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
