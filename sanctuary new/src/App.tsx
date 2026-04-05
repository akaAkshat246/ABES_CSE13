import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import MainLayout from './components/MainLayout';
import Onboarding from './screens/Onboarding';
import ProfileCreation from './screens/ProfileCreation';
import Home from './screens/Home';
import JournalList from './screens/JournalList';
import JournalEdit from './screens/JournalEdit';
import MemoryVault from './screens/MemoryVault';
import Reminders from './screens/Reminders';
import Settings from './screens/Settings';
import Help from './screens/Help';
import Tags from './screens/Tags';
import Journey from './screens/Journey';
import Privacy from './screens/Privacy';
import { storage } from './lib/storage';
import { UserProfile } from './types';

const AppRoutes = () => {
  const location = useLocation();
  const [profile, setProfile] = useState(() => storage.getProfile());
  const [isOnboarded, setIsOnboarded] = useState(() => {
    try {
      return localStorage.getItem('sanctuary_onboarded') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Apply theme and font scale on mount
    const settings = storage.getSettings();
    document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    const fontSize = settings.fontSize ?? 1.0;
    document.documentElement.style.setProperty('--font-scale', fontSize.toString());
  }, []);

  const handleOnboardingComplete = () => {
    try {
      localStorage.setItem('sanctuary_onboarded', 'true');
    } catch {
      // Ignore
    }
    setIsOnboarded(true);
  };

  const handleProfileComplete = () => {
    setProfile(storage.getProfile());
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    storage.setProfile(updatedProfile);
    setProfile(updatedProfile);
  };

  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!profile) {
    return <ProfileCreation onComplete={handleProfileComplete} />;
  }

  return (
    <MainLayout>
      <Routes location={location}>
        <Route path="/" element={<Home onProfileUpdate={handleProfileUpdate} />} />
        <Route path="/journal" element={<JournalList />} />
        <Route path="/journal/new" element={<JournalEdit />} />
        <Route path="/journal/edit/:id" element={<JournalEdit />} />
        <Route path="/vault" element={<MemoryVault />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
        <Route path="/tags" element={<Tags />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
