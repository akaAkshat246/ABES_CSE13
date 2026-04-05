import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  House, 
  BookOpen, 
  Archive, 
  Bell, 
  Grid2X2, 
  Tag, 
  Map, 
  Settings, 
  HelpCircle, 
  Shield, 
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { storage } from '../lib/storage';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const ALL_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: House, path: '/' },
  { id: 'journal', label: 'Journal', icon: BookOpen, path: '/journal' },
  { id: 'vault', label: 'Vault', icon: Archive, path: '/vault' },
  { id: 'reminders', label: 'Reminders', icon: Bell, path: '/reminders' },
  { id: 'tags', label: 'Tags', icon: Tag, path: '/tags' },
  { id: 'journey', label: 'Journey', icon: Map, path: '/journey' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  { id: 'help', label: 'Help', icon: HelpCircle, path: '/help' },
  { id: 'privacy', label: 'Privacy', icon: Shield, path: '/privacy' },
  { id: 'sync', label: 'Sync', icon: RefreshCw, path: '/sync' },
];

const SHEET_SPRING = { type: "spring", stiffness: 340, damping: 34 } as const;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = useCallback((path: string) => {
    navigate(path);
    setIsMoreOpen(false);
  }, [navigate]);

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <div className="app-container min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* Desktop Sidebar (Existing Style) */}
      {!isMobile && (
        <aside className="fixed left-0 top-0 bottom-0 w-[280px] glass border-r border-white/10 z-50 flex flex-col p-6">
          <div className="mb-12 px-2">
            <h1 className="screen-title text-primary">Sanctuary</h1>
          </div>

          <nav className="flex-1 space-y-2">
            {ALL_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                aria-label={item.label}
                title={item.label}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group nav-item cursor-pointer",
                  isActive(item.path)
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                    : "text-on-surface-variant hover:bg-white/10"
                )}
              >
                <item.icon 
                  size={20} 
                  className={cn(
                    "transition-colors",
                    isActive(item.path) ? "text-on-primary" : "text-on-surface-variant group-hover:text-primary"
                  )} 
                />
                <span className="font-sans font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto p-4 glass rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">
                  {storage.getProfile()?.name?.charAt(0) || 'S'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold truncate text-[var(--color-on-surface)]">
                  {storage.getProfile()?.name || 'User'}
                </p>
                <p className="caption-text truncate">Daily Explorer</p>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 min-h-screen transition-all duration-300",
          !isMobile ? "ml-[280px]" : "pb-[calc(100px+env(safe-area-inset-bottom))]"
        )}
      >
        <div className="max-w-[1280px] mx-auto p-6 md:p-8 lg:p-10 h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <nav 
          className="fixed bottom-[calc(16px+env(safe-area-inset-bottom))] left-1/2 w-[52px] h-[52px] z-[100] flex items-center justify-center rounded-full m-0 float-none"
          style={{
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid var(--nav-border)',
            boxShadow: 'var(--nav-shadow)',
            willChange: 'transform',
            transform: 'translateX(-50%) translateZ(0)',
          }}
        >
          <style>{`
            :root {
              --nav-bg: rgba(255, 255, 255, 0.45);
              --nav-border: rgba(255, 255, 255, 0.6);
              --nav-shadow: 0 8px 32px rgba(0,52,43,0.15), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8);
            }
            [data-theme="dark"] :root {
              --nav-bg: rgba(17, 25, 23, 0.72);
              --nav-border: rgba(255, 255, 255, 0.10);
              --nav-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
            }
          `}</style>
          
          {/* Single More Tab */}
          <motion.button
            whileTap={{ scale: 0.80 }}
            transition={{ duration: 0.1 }}
            onClick={() => setIsMoreOpen(true)}
            aria-label="Open navigation menu"
            title="Open menu"
            className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer"
          >
            <motion.div
              animate={{ 
                scale: isMoreOpen ? [1, 1.25, 1] : 1,
                color: isMoreOpen ? 'var(--color-primary)' : 'var(--color-on-surface-variant)'
              }}
              transition={{ 
                scale: { duration: 0.4, ease: "easeOut" },
                color: { duration: 0.2 }
              }}
              className={cn(
                "flex items-center justify-center",
                !isMoreOpen && "opacity-50"
              )}
            >
              <Grid2X2 
                size={28} 
                strokeWidth={isMoreOpen ? 2 : 1.5} 
              />
            </motion.div>
          </motion.button>
        </nav>
      )}

      {/* More Drawer */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 z-[150] bg-black/25 backdrop-blur-[4px]"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ 
                ...SHEET_SPRING,
                opacity: { duration: 0.25 }
              }}
              className="fixed bottom-0 left-0 w-full max-h-[60vh] z-[200] overflow-hidden flex flex-col bg-[rgba(255,255,255,0.75)] dark:bg-[rgba(15,25,22,0.85)] backdrop-blur-[32px] [WebkitBackdropFilter:blur(32px)]"
              style={{
                borderTop: '1px solid var(--nav-border, rgba(255,255,255,0.18))',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
              }}
            >
              {/* Drag Handle */}
              <div className="flex justify-center py-3">
                <div className="w-9 h-1 rounded-full bg-[rgba(0,0,0,0.15)] dark:bg-[rgba(255,255,255,0.25)]" />
              </div>

              <div className="px-6 pb-8 overflow-y-auto scroll-container">
                <div className="flex items-center justify-between mb-6 block w-full">
                  <h2 className="text-[0.75rem] font-bold uppercase font-sans tracking-[0.1em] text-[#3f4945] dark:text-[#c2d8d0]">
                    More
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {ALL_ITEMS.map((item) => (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleNavClick(item.path)}
                      aria-label={item.label}
                      title={item.label}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-2xl cursor-pointer border border-transparent transition-all duration-200 ease-in-out group",
                        "hover:bg-[rgba(0,52,43,0.08)] dark:hover:bg-[rgba(255,255,255,0.10)] dark:hover:border-[rgba(255,255,255,0.15)]",
                        isActive(item.path) ? "bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40" : ""
                      )}
                    >
                      <item.icon 
                        size={24} 
                        className={cn(
                          "transition-colors text-[var(--color-primary)]"
                        )} 
                      />
                      <span className={cn(
                        "text-[0.75rem] font-medium font-sans transition-colors text-[var(--color-on-surface)] group-hover:text-[#00342b] dark:group-hover:text-[#ffffff]",
                        isActive(item.path) ? "text-primary dark:text-[#7ebdac]" : ""
                      )}>
                        {item.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
