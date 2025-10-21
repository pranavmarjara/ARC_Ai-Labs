import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Mission() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" className="py-32 bg-gradient-to-b from-black via-zinc-950 to-black" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            Our Philosophy_
          </h2>
          
          <div className="mt-12 text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl space-y-6">
            <p>
              Built on code and defiance, our work challenges silence itself. We design speech recognition 
              systems that return agency, dignity, and freedom to those who fight to be heard.
            </p>
            <p>
              We believe the failure was never human: it was technological. The world has asked patients 
              to adapt to machines; <span className="text-white font-semibold">we build machines that adapt to people.</span>
            </p>
            <p>
              Our design has intention: every line of code, every model, every interface serves a human purpose. 
              We build not for scale alone, but for impact, empathy, and precision.
            </p>
            <p>
              Our focus is clear: <span className="text-white font-semibold">patient first, technology uncompromised.</span>
            </p>
            <p>
              Progress, for us, is not born of comfort but of perseverance, not from imitation, but from will. 
              Born of struggle, refined by innovation, and guided by purpose, we exist to push the boundaries 
              of what's possible.
            </p>
            <p className="text-2xl md:text-3xl font-bold text-white mt-8">
              Persevere and Pioneer.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
