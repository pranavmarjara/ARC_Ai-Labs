import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ClinicalTrials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const collaborations = [
    {
      title: 'Doctors & Clinicians',
      icon: '🏥',
      description: 'Partnering with medical professionals who understand the daily challenges faced by patients with speech disorders.',
      duration: '',
    },
    {
      title: 'Academic Researchers',
      icon: '🎓',
      description: 'Collaborating with national and international academia to ensure rigorous scientific methodology.',
      duration: '',
    },
    {
      title: 'Engineering Teams',
      icon: '⚙️',
      description: 'Working closely with engineers to rapidly iterate on patient feedback and technical improvements.',
      duration: '',
    },
  ];

  const methodology = [
    {
      step: '1',
      title: 'Patient Recruitment',
      description: 'Carefully select diverse patients with various speech challenges to ensure our models work for everyone.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      step: '2',
      title: 'Baseline Testing',
      description: 'Establish initial Word Error Rate (WER) and understand each patient\'s unique speech patterns.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      step: '3',
      title: 'Model Training',
      description: 'Use collected data to train and refine our speech recognition models with bespoke patient layers.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      step: '4',
      title: 'Validation & Iteration',
      description: 'Test on real patients every 10 days, measure accuracy, publish results, and iterate rapidly.',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/20 to-black"></div>
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
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
              Clinical Trials & Vision
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
              Patient-first research. Technology-uncompromised approach. Every trial serves a human purpose.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Philosophy</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We don't build technology and then find patients. We <span className="text-green-400 font-bold">listen to patients first</span>, 
              then build technology that adapts to them. Machines should serve people, not the other way around.
            </p>
          </motion.div>

          {/* Collaboration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20" ref={ref}>
            {collaborations.map((collab, idx) => (
              <motion.div
                key={collab.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 * idx }}
                className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all hover:shadow-2xl hover:shadow-green-900/20"
              >
                <div className="text-5xl mb-4">{collab.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{collab.title}</h3>
                <p className="text-gray-400 mb-4">{collab.description}</p>
                <div className="text-sm text-green-400 font-semibold">{collab.duration}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Timeline */}
      <section className="py-20 px-4 bg-gradient-to-b from-zinc-950 to-black">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-16 text-center"
          >
            Our Testing Methodology
          </motion.h2>

          <div className="space-y-8">
            {methodology.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1 * idx }}
                viewport={{ once: true }}
                className="flex items-start gap-6"
              >
                <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl font-bold shadow-lg`}>
                  {step.step}
                </div>
                <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Iteration Cycle */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Rapid Iteration Cycle</h2>
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-12 mb-8">
              <div className="text-6xl font-bold text-green-400 mb-4">Every 10 Days</div>
              <p className="text-xl text-gray-300 mb-6">
                We measure Word Error Rate (WER), publish our findings, and iterate based on patient feedback.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="font-semibold">Measure</div>
                  <div className="text-sm text-gray-400">Track accuracy metrics</div>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-3xl mb-2">📢</div>
                  <div className="font-semibold">Publish</div>
                  <div className="text-sm text-gray-400">Share results openly</div>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-3xl mb-2">🔄</div>
                  <div className="font-semibold">Iterate</div>
                  <div className="text-sm text-gray-400">Refine and improve</div>
                </div>
              </div>
            </div>
            <p className="text-lg text-gray-400">
              This isn't just research it's a <span className="text-green-400 font-bold">commitment</span> to the people we serve.
              We're building in public, learning in partnership, and improving with every cycle.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Join Our Vision</h2>
            <p className="text-xl text-gray-300 mb-8">
              Whether you're a patient, researcher, clinician, or just believe in our mission we want to hear from you.
            </p>
            <Link
              to="/get-involved"
              className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 rounded-full font-semibold text-lg transition-all transform hover:scale-105"
            >
              Get Involved
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
