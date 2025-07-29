import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';

const SkillsSection = () => {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true
  });

  const [skills, setSkills] = useState({
    frontend: [],
    tools: [],
    mobile: []
  });

  const [activeCategory, setActiveCategory] = useState('frontend');

  useEffect(() => {
    // Fetch skills data from API
    const fetchSkills = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/skills`);
        setSkills(response.data.skills);
      } catch (error) {
        console.error('Error fetching skills:', error);
        // Fallback data
        setSkills({
          frontend: [
            { name: 'React', level: 95, years: 7 },
            { name: 'JavaScript', level: 98, years: 7 },
            { name: 'TypeScript', level: 90, years: 5 },
            { name: 'Next.js', level: 92, years: 4 },
            { name: 'Svelte', level: 85, years: 3 },
            { name: 'HTML/CSS', level: 96, years: 7 },
            { name: 'Tailwind CSS', level: 88, years: 3 }
          ],
          tools: [
            { name: 'Git', level: 90, years: 7 },
            { name: 'Webpack', level: 85, years: 5 },
            { name: 'Vite', level: 80, years: 2 },
            { name: 'Docker', level: 75, years: 3 },
            { name: 'AWS', level: 70, years: 2 }
          ],
          mobile: [
            { name: 'React Native', level: 80, years: 3 },
            { name: 'Flutter', level: 65, years: 2 }
          ]
        });
      }
    };

    fetchSkills();
  }, []);

  const categories = [
    { id: 'frontend', label: 'Frontend', icon: '🎨', color: 'primary' },
    { id: 'tools', label: 'Tools & Build', icon: '🔧', color: 'green' },
    { id: 'mobile', label: 'Mobile', icon: '📱', color: 'purple' }
  ];

  const getColorClass = (color, type = 'text') => {
    const colors = {
      primary: type === 'text' ? 'text-primary-400' : 'bg-primary-500',
      green: type === 'text' ? 'text-green-400' : 'bg-green-500',
      purple: type === 'text' ? 'text-purple-400' : 'bg-purple-500'
    };
    return colors[color] || colors.primary;
  };

  return (
    <section className="min-h-screen flex items-center section-padding bg-gradient-to-b from-dark-900/20 to-transparent">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-8">
            My <span className="gradient-text">Skills</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Technologies and tools I've mastered over 7+ years of frontend development
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div 
          className="flex justify-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="glass-card p-2 flex space-x-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeCategory === category.id
                    ? `${getColorClass(category.color, 'bg')} text-white`
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setActiveCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Skills Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {skills[activeCategory]?.map((skill, index) => (
            <motion.div
              key={skill.name}
              className="glass-card p-6 hover:bg-white/8 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              {/* Skill Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
                <span className="text-sm text-gray-400">{skill.years} years</span>
              </div>

              {/* Skill Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Proficiency</span>
                  <span className="text-sm font-medium text-primary-400">{skill.level}%</span>
                </div>
                <div className="skill-bar">
                  <motion.div
                    className="skill-progress"
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${skill.level}%` } : {}}
                    transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                  />
                </div>
              </div>

              {/* Experience Indicator */}
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < Math.floor(skill.years / 2) + 1
                        ? 'bg-primary-500'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-2">Experience</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Technologies I Love */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <h3 className="text-2xl font-bold mb-8 text-white">Technologies I Love Working With</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'React', 'Next.js', 'Svelte', 'TypeScript', 'Tailwind CSS',
              'Framer Motion', 'Three.js', 'GraphQL', 'Node.js', 'MongoDB'
            ].map((tech, index) => (
              <motion.span
                key={tech}
                className="glass-card px-4 py-2 text-sm font-medium text-gray-300 hover:text-primary-400 hover:border-primary-400/30 transition-all duration-200"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.05 }}
                whileHover={{ scale: 1.1, y: -2 }}
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SkillsSection;