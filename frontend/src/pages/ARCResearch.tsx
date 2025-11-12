import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ARCResearch() {
  const overviewRef = useRef(null);
  const findingsRef = useRef(null);
  const methodologyRef = useRef(null);
  const publicationsRef = useRef(null);
  const teamRef = useRef(null);
  const ctaRef = useRef(null);
  
  const overviewInView = useInView(overviewRef, { once: true, margin: '-100px' });
  const findingsInView = useInView(findingsRef, { once: true, margin: '-100px' });
  const methodologyInView = useInView(methodologyRef, { once: true, margin: '-100px' });
  const publicationsInView = useInView(publicationsRef, { once: true, margin: '-100px' });
  const teamInView = useInView(teamRef, { once: true, margin: '-100px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-100px' });

  const keyFindings = [
    {
      metric: '82%+',
      label: 'Word Accuracy',
      description: 'Achieved with bespoke patient-specific model layers on dysarthric speech',
      icon: '🎯',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      metric: '47%',
      label: 'WER Reduction',
      description: 'Word Error Rate improvement over baseline commercial systems',
      icon: '📊',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  const methodologySteps = [
    {
      number: '01',
      title: 'Ethical Data Collection',
      description: 'We work directly with patients who have speech disorders, collecting diverse speech samples with full consent and ethical oversight.',
      gradient: 'from-blue-600 to-indigo-600'
    },
    {
      number: '02',
      title: 'Model Architecture',
      description: 'Our AI uses state-of-the-art speech recognition with custom patient-specific adaptation layers.',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      number: '03',
      title: 'Validation & Testing',
      description: 'Rigorous testing with real patients ensures our models work in the real world, not just in the lab.',
      gradient: 'from-green-600 to-teal-600'
    }
  ];

  const publications = [
    {
      title: 'Bespoke Speech Recognition for Dysarthric Patients',
      authors: 'ARC AI Labs Research Team',
      venue: 'In Preparation',
      year: '2025',
      status: 'ongoing',
      description: 'Our foundational paper on patient-specific adaptation layers for severe speech disorders.'
    },
    {
      title: 'The Data Flywheel: Rapid Iteration in Clinical AI',
      authors: 'ARC AI Labs Research Team',
      venue: 'Planned',
      year: '2025',
      status: 'planned',
      description: 'Methodology for fast, ethical, patient-centered AI development cycles.'
    }
  ];

  const teamMembers = [
    {
      role: 'Speech Recognition Experts',
      icon: '🎙️',
      description: 'PhD-level researchers with deep expertise in ASR, NLP, and adaptive machine learning.'
    },
    {
      role: 'Clinical Partners',
      icon: '🏥',
      description: 'Doctors, speech therapists, and clinicians who work directly with patients daily.'
    },
    {
      role: 'Data Scientists',
      icon: '📈',
      description: 'Specialists in ethics, privacy, and responsible AI ensuring patient protection.'
    },
    {
      role: 'Patient Advocates',
      icon: '💬',
      description: 'Individuals with lived experience guiding our research priorities and approach.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 to-black"></div>
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              ARC × Research
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed">
              Science-backed technology that transforms fractured speech into clear communication. 
              Our research validates every claim, every model, every promise.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Research Overview */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-950" ref={overviewRef}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={overviewInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Research Matters</h2>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto">
              Speech recognition for people with speech disorders isn't a solved problem. 
              Commercial systems fail catastrophically. That's why we're building from the ground up, 
              with rigorous science and real patient validation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {['Patient-First Design', 'Rapid Validation'].map((principle, idx) => (
              <motion.div
                key={principle}
                initial={{ opacity: 0, y: 30 }}
                animate={overviewInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * idx }}
                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all"
              >
                <div className="text-4xl mb-4">
                  {idx === 0 ? '🫶' : '⚡'}
                </div>
                <h3 className="text-2xl font-bold mb-4">{principle}</h3>
                <p className="text-gray-400">
                  {idx === 0 && 'Every decision starts with "Will this help patients communicate better?"'}
                  {idx === 1 && 'Test with real patients every 10 days. Iterate relentlessly. No exceptions.'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Findings */}
      <section className="py-20 px-4" ref={findingsRef}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={findingsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Research Highlights</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Early results show our approach is working. These metrics represent real improvements in real patients' lives.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {keyFindings.map((finding, idx) => (
              <motion.div
                key={finding.label}
                initial={{ opacity: 0, y: 30 }}
                animate={findingsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * idx }}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 hover:scale-105 transition-transform"
              >
                <div className="text-5xl mb-4">{finding.icon}</div>
                <div className={`text-5xl font-bold mb-2 bg-gradient-to-r ${finding.gradient} bg-clip-text text-transparent`}>
                  {finding.metric}
                </div>
                <div className="text-xl font-semibold text-white mb-3">
                  {finding.label}
                </div>
                <p className="text-sm text-gray-400">
                  {finding.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-950" ref={methodologyRef}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={methodologyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Research Methodology</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Rigorous, ethical, and patient-centered. Here's exactly how we're building AI that actually works.
            </p>
          </motion.div>

          <div className="space-y-12">
            {methodologySteps.map((step, idx) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                animate={methodologyInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * idx }}
                className="relative"
              >
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12 hover:border-purple-500/30 transition-all">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className={`text-8xl font-bold bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent opacity-20 md:min-w-[120px]`}>
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold mb-4">{step.title}</h3>
                      <p className="text-gray-400 text-lg">{step.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Publications */}
      <section className="py-20 px-4" ref={publicationsRef}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={publicationsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Publications & Papers</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We're committed to sharing our findings with the scientific community through peer-reviewed research.
            </p>
          </motion.div>

          <div className="space-y-6">
            {publications.map((pub, idx) => (
              <motion.div
                key={pub.title}
                initial={{ opacity: 0, y: 30 }}
                animate={publicationsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * idx }}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{pub.title}</h3>
                    <p className="text-gray-400 mb-2">{pub.authors}</p>
                    <p className="text-sm text-gray-500">{pub.venue} • {pub.year}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    pub.status === 'ongoing' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {pub.status === 'ongoing' ? '🔬 Ongoing' : '📅 Planned'}
                  </div>
                </div>
                <p className="text-gray-400">{pub.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={publicationsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 text-center"
          >
            
          </motion.div>
        </div>
      </section>

      {/* Research Team */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-950" ref={teamRef}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={teamInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Who's Behind the Research</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              A multidisciplinary team combining technical excellence with deep empathy for patients.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <motion.div
                key={member.role}
                initial={{ opacity: 0, y: 30 }}
                animate={teamInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * idx }}
                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 text-center hover:border-purple-500/50 transition-all"
              >
                <div className="text-5xl mb-4">{member.icon}</div>
                <h3 className="text-xl font-bold mb-3">{member.role}</h3>
                <p className="text-sm text-gray-400">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4" ref={ctaRef}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-3xl p-12 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Join the Research Community</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Interested in collaborating, accessing our datasets, or reviewing our methodology? 
              We believe in open science and welcome researchers worldwide.
            </p>
            <Link to="/get-involved">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Get Involved!
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
