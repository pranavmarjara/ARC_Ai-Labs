import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="technology" className="py-32 bg-gradient-to-b from-gray-900 to-black" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold mb-16 text-center"
        >
          Pioneers Wanted
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.a
            href="#contact"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-2xl h-96 block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50 group-hover:from-blue-800/50 group-hover:to-purple-800/50 transition-all"></div>
            <div className="relative h-full flex flex-col justify-end p-8 text-white">
              <div className="mb-4">
                <span className="text-sm font-semibold tracking-wider uppercase opacity-80">
                  Patients & Caregivers
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-2">Learn about research trials</h3>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm flex items-center">
                  Learn more
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </motion.a>
          
          <motion.a
            href="#technology"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-2xl h-96 block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/50 to-teal-900/50 group-hover:from-green-800/50 group-hover:to-teal-800/50 transition-all"></div>
            <div className="relative h-full flex flex-col justify-end p-8 text-white">
              <div className="mb-4">
                <span className="text-sm font-semibold tracking-wider uppercase opacity-80">
                  Engineers & Researchers
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-2">Explore our technology</h3>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm flex items-center">
                  Learn more
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
