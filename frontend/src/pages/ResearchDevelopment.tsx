import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ResearchDevelopment() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const phases = [
    {
      title: 'Phase 1: Data Collection',
      subtitle: 'Building the Foundation',
      items: [
        { label: 'Protocol Development', duration: '1-3 days', status: 'complete' },
        { label: 'Torgo Dataset Experimentation', duration: '7-10 days', status: 'complete' },
        { label: 'Collection Zero (Pilot)', hours: '2 hours', duration: '3 days', status: 'complete' },
        { label: 'Collection One (English)', hours: '20 hours', duration: '1 week', status: 'in-progress' },
        { label: 'Collection Two (Multilingual)', hours: '50 hours', duration: '1 week', status: 'pending' },
        { label: 'Collection Three (Scale)', hours: '60 hours', duration: '1 week', status: 'pending' },
      ],
      color: 'from-blue-600 to-indigo-600',
    },
    {
      title: 'Phase 2: Model Training',
      subtitle: 'Teaching Machines to Listen',
      items: [
        { label: 'Model Alpha.1', detail: 'Initial training on collected data', status: 'in-progress' },
        { label: 'Patient Testing & Iteration', detail: 'Real-world validation loops', status: 'pending' },
        { label: 'Model Alpha.2', detail: 'Advanced with bespoke patient layers', duration: '2 months', status: 'pending' },
        { label: 'Fine Tuning', detail: 'Precision optimization for edge cases', status: 'pending' },
      ],
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Phase 3: Validation',
      subtitle: 'Proving It Works',
      items: [
        { label: 'Testing on Patients', detail: 'Iterate every 10 days', status: 'pending' },
        { label: 'Accuracy Measurement', detail: 'Word Error Rate (WER) tracking', status: 'pending' },
        { label: 'Publication', detail: 'Share results every 10 days', status: 'pending' },
        { label: 'Continuous Improvement', detail: '600-1000 hours data target', status: 'pending' },
      ],
      color: 'from-green-600 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-black"></div>
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
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Research & Development
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
              From fractured speech to crystal-clear understanding. Our data flywheel transforms silence into voice.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Pipeline Visualization */}
      <section className="py-20 px-4" ref={ref}>
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-center"
          >
            The Data Flywheel
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto"
          >
            Collect → Train → Validate → Iterate. Every cycle makes our models better at understanding those who struggle to be heard.
          </motion.p>

          {/* Flow Arrows */}
          <div className="flex justify-center items-center mb-16 gap-4 flex-wrap">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full font-semibold"
            >
              Data Collection
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl text-gray-600"
            >
              →
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold"
            >
              Model Training
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-3xl text-gray-600"
            >
              →
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-full font-semibold"
            >
              Validation
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-3xl text-gray-600"
            >
              ↺
            </motion.div>
          </div>

          {/* Phase Cards */}
          <div className="space-y-12">
            {phases.map((phase, idx) => (
              <motion.div
                key={phase.title}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 * idx }}
                className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-8 shadow-2xl"
              >
                <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${phase.color} text-white text-sm font-semibold mb-4`}>
                  Phase {idx + 1}
                </div>
                <h3 className="text-3xl font-bold mb-2">{phase.title}</h3>
                <p className="text-gray-400 mb-6 text-lg">{phase.subtitle}</p>
                
                <div className="space-y-4">
                  {phase.items.map((item, itemIdx) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.2 * idx + 0.1 * itemIdx }}
                      className="flex items-start justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors group"
                    >
                      <div className="flex items-start flex-1">
                        <div className={`mt-1 mr-3 w-3 h-3 rounded-full ${
                          item.status === 'complete' ? 'bg-green-500' :
                          item.status === 'in-progress' ? 'bg-blue-500 animate-pulse' :
                          'bg-gray-600'
                        }`}></div>
                        <div className="flex-1">
                          <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {item.label}
                          </div>
                          {'detail' in item && item.detail && (
                            <div className="text-sm text-gray-400 mt-1">{item.detail}</div>
                          )}
                          {'hours' in item && item.hours && (
                            <div className="text-sm text-gray-500 mt-1">Target: {item.hours}</div>
                          )}
                        </div>
                      </div>
                      {item.duration && (
                        <div className="text-sm text-gray-500 ml-4">{item.duration}</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Goal Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The Ambitious Goal</h2>
            <p className="text-xl text-gray-300 mb-8">
              Collect <span className="text-green-400 font-bold">600-1000 hours</span> of slurred speech data across multiple languages.
              Train models that don't just transcribe—they <span className="text-blue-400 font-bold">understand</span>.
            </p>
            <p className="text-lg text-gray-400">
              Every 10 days, we measure accuracy, publish results, and iterate with real patients.
              This isn't research in isolation—it's research in partnership with those we serve.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
