import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, MessageCircle, Mail, Shield, BookOpen, Image, Bell, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

const FAQS = [
  {
    id: 'privacy',
    question: 'Is my data safe?',
    answer: 'Absolutely. Sanctuary is designed with a "local-first" philosophy. All your journal entries, memories, and settings are stored directly on your device using browser storage. We never upload your data to any server, and we don\'t track your activity.',
    icon: Shield,
  },
  {
    id: 'journal',
    question: 'How do I use the journal?',
    answer: 'Simply tap the "Journal" icon in the navigation bar. You can create new entries, select your mood, add tags, and even save drafts. Your entries are automatically saved when you tap the "Save" button.',
    icon: BookOpen,
  },
  {
    id: 'vault',
    question: 'What can I store in the Memory Vault?',
    answer: 'The Memory Vault supports images, videos, and documents (PDF, Word). It\'s a safe space to keep digital keepsakes that are meaningful to you. You can search your vault by title or tags.',
    icon: Image,
  },
  {
    id: 'reminders',
    question: 'How do reminders work?',
    answer: 'Reminders are gentle nudges to help you stay mindful. You can set a title, date, and time for each reminder. Overdue reminders will be highlighted in red to help you stay on track.',
    icon: Bell,
  },
  {
    id: 'settings',
    question: 'Can I change the theme?',
    answer: 'Yes! Go to the "Settings" screen to toggle between Light and Dark themes. You can also adjust the font size to make the app more comfortable for your eyes.',
    icon: Settings,
  },
];

const Help: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20 scroll-container">
      <header className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <HelpCircle size={32} />
        </div>
        <h1 className="hero-text">How can we help?</h1>
        <p className="body-text">Find answers to common questions about Sanctuary.</p>
      </header>

      <div className="space-y-4">
        <h2 className="section-header px-2">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <div key={faq.id} className="card p-0 overflow-hidden">
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    openId === faq.id ? "bg-primary text-on-primary" : "bg-primary/10 text-primary"
                  )}>
                    <faq.icon size={20} />
                  </div>
                  <span className="font-sans font-bold text-on-surface">{faq.question}</span>
                </div>
                <motion.div
                  animate={{ rotate: openId === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={20} className="text-on-surface-variant/40" />
                </motion.div>
              </button>
              
              <AnimatePresence initial={false}>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <div className="px-5 pb-5 pt-0">
                      <div className="h-px bg-white/10 mb-4" />
                      <p className="body-text leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card text-center space-y-4 p-8">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <MessageCircle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-on-surface">Community Support</h3>
            <p className="caption-text">Join our peaceful community of explorers.</p>
          </div>
          <button className="btn-secondary w-full">Join Discord</button>
        </div>

        <div className="card text-center space-y-4 p-8">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Mail size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-on-surface">Contact Us</h3>
            <p className="caption-text">We're here to listen and help you.</p>
          </div>
          <button className="btn-secondary w-full">Send Email</button>
        </div>
      </div>

      <footer className="text-center py-10">
        <p className="caption-text">Sanctuary Version 1.2.0</p>
        <p className="caption-text mt-2 italic">Your peace is our priority.</p>
      </footer>
    </div>
  );
};

export default Help;
