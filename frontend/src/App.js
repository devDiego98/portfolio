import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Import components (we'll create these next)
import Scene3D from './components/Scene3D';
import LoadingScreen from './components/LoadingScreen';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import SkillsSection from './components/SkillsSection';
import ProjectsSection from './components/ProjectsSection';
import ContactSection from './components/ContactSection';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollProgress, setShowScrollProgress] = useState(false);

  useEffect(() => {
    // Simulate loading time for 3D assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Enhanced scroll spy for navigation
    const sections = ['home', 'about', 'skills', 'projects', 'contact'];

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
    };

    const observer = new IntersectionObserver((entries) => {
      // Find the entry with the highest intersection ratio
      let maxRatio = 0;
      let activeEntry = null;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          activeEntry = entry;
        }
      });

      if (activeEntry) {
        setActiveSection(activeEntry.target.id);
      } else {
        // Fallback: check which section is currently in view based on scroll position
        const scrollPosition = window.scrollY + window.innerHeight / 2;

        for (const sectionId of sections) {
          const element = document.getElementById(sectionId);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + window.scrollY;
            const elementBottom = elementTop + rect.height;

            if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
              setActiveSection(sectionId);
              break;
            }
          }
        }
      }
    }, observerOptions);

    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Scroll progress tracking and backup active section detection
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTop / docHeight;

      setScrollProgress(progress);
      setShowScrollProgress(scrollTop > 100);

      // Backup method to set active section based on scroll position
      const sections = ['home', 'about', 'skills', 'projects', 'contact'];
      const viewportMiddle = scrollTop + window.innerHeight / 2;

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollTop;

          if (viewportMiddle >= elementTop) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Initial call to set the correct section on load
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      {/* Background 3D Scene */}
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Scene3D />
          </Suspense>
        </Canvas>
      </div>

      {/* Content overlay */}
      <div className="relative z-10">
        <Navigation activeSection={activeSection} />

        {/* Floating navigation dots - fixed positioning */}
        <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40 hidden lg:flex flex-col space-y-4">
          {['home', 'about', 'skills', 'projects', 'contact'].map((sectionId) => {
            const scrollToSection = (id) => {
              const element = document.getElementById(id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            };

            const isActive = activeSection === sectionId;

            return (
              <motion.button
                key={sectionId}
                className={`w-3 h-3 rounded-full border-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 border-primary-500 scale-125'
                    : 'border-gray-400 hover:border-primary-400 hover:scale-110'
                }`}
                onClick={() => scrollToSection(sectionId)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                title={sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
              />
            );
          })}
        </div>

        <main>
          <section id="home">
            <HeroSection />
          </section>

          <section id="about">
            <AboutSection />
          </section>

          <section id="skills">
            <SkillsSection />
          </section>

          <section id="projects">
            <ProjectsSection />
          </section>

          <section id="contact">
            <ContactSection />
          </section>
        </main>
      </div>

      {/* Scroll progress indicator - only show when scrolling */}
      <motion.div
        className="fixed bottom-8 left-8 z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: showScrollProgress ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-1 h-20 bg-gradient-to-t from-primary-500/30 via-primary-400/30 to-transparent rounded-full">
          <motion.div
            className="w-full bg-primary-500 rounded-full origin-top"
            style={{ scaleY: scrollProgress }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default App;