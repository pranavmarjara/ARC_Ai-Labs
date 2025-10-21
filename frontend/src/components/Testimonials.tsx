import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const pioneers = [
  {
    name: 'Pranav Marjara',
    condition: 'The Tech Head',
    quote: "Code.Create.Conquer",
    date: 'Oct,2025',
  },
  {
    name: 'Aditya Minhas',
    condition: 'The Buisness Head',
    quote: 'Take Where the Maps dont Take you',
    date: 'Oct,2025',
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="pioneers" className="py-32 bg-gradient-to-b from-black to-gray-900" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold mb-16 text-center"
        >
          Meet our pioneers
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pioneers.map((pioneer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/10 transition-all hover:scale-105"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full mb-4"></div>
              </div>
              <h3 className="text-2xl font-bold mb-2">{pioneer.name}</h3>
              <p className="text-gray-400 text-sm mb-4">
                {pioneer.condition}
                <br />
                {pioneer.date}
              </p>
              <p className="text-lg italic text-gray-300">"{pioneer.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
