import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Mission() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" className="py-32 bg-black" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            Building brain interfaces
            <br />
            to restore autonomy_
          </h2>
          
          <div className="mt-12 text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl space-y-6">
            <p>
              Our brain-computer interface translates neural signals into actions. In our research trials, 
              participants are using ARC AI Labs devices to control computers and robotic systems with their thoughts.
            </p>
            <p>
              This technology will restore autonomy to those with unmet medical needs and unlock 
              new dimensions of human potential.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
