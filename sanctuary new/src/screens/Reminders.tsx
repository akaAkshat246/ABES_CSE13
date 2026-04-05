import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Bell, CheckCircle2, Circle, Trash2, Calendar, Clock, AlertCircle, X } from 'lucide-react';
import { storage } from '../lib/storage';
import { Reminder } from '../types';
import { cn } from '../lib/utils';

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() => storage.getReminders());
  const [isAdding, setIsAdding] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
  });

  const sortedReminders = useMemo(() => {
    const now = new Date();
    return [...reminders].sort((a, b) => {
      // Completed last
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      const isOverdueA = !a.completed && dateA < now;
      const isOverdueB = !b.completed && dateB < now;

      // Overdue first
      if (isOverdueA !== isOverdueB) return isOverdueA ? -1 : 1;
      
      // Then by date ascending
      return dateA.getTime() - dateB.getTime();
    });
  }, [reminders]);

  const handleAdd = useCallback(() => {
    if (!newReminder.title.trim()) return;

    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title.trim(),
      date: newReminder.date,
      time: newReminder.time,
      completed: false,
    };

    const updated = [reminder, ...reminders];
    setReminders(updated);
    storage.setReminders(updated);
    setIsAdding(false);
    setNewReminder({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
    });
  }, [newReminder, reminders]);

  const toggleComplete = useCallback((id: string) => {
    const updated = reminders.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    setReminders(updated);
    storage.setReminders(updated);
  }, [reminders]);

  const deleteReminder = useCallback((id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    storage.setReminders(updated);
  }, [reminders]);

  const clearCompleted = useCallback(() => {
    const updated = reminders.filter(r => !r.completed);
    setReminders(updated);
    storage.setReminders(updated);
  }, [reminders]);

  const isOverdue = (reminder: Reminder) => {
    if (reminder.completed) return false;
    const due = new Date(`${reminder.date}T${reminder.time}`);
    return due < new Date();
  };

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const days = [];
    
    // Padding for start of month
    for (let i = 0; i < start.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= end.getDate(); i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }
    
    return days;
  }, [currentMonth]);

  const hasReminder = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return reminders.some(r => r.date === dateStr);
  }, [reminders]);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="screen-title">Reminders</h1>
          <p className="caption-text">Gentle nudges for your mindful journey.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {reminders.some(r => r.completed) && (
            <button 
              onClick={clearCompleted}
              className="btn-ghost text-red-500 hover:bg-red-500/10 text-xs uppercase tracking-widest font-bold"
            >
              Clear Done
            </button>
          )}
          <button 
            onClick={() => setIsAdding(true)}
            className="btn-primary"
          >
            <Plus size={20} />
            <span>Add New</span>
          </button>
        </div>
      </header>

      {/* Calendar View */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-sans font-bold text-lg">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              className="p-2 hover:bg-primary/10 rounded-full transition-colors"
            >
              <X size={16} className="rotate-45" />
            </button>
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              className="p-2 hover:bg-primary/10 rounded-full transition-colors"
            >
              <Plus size={16} className="rotate-45" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="text-[0.65rem] font-bold text-on-surface-variant/40 py-2">{d}</div>
          ))}
          {calendarDays.map((date, i) => (
            <div 
              key={i} 
              className={cn(
                "aspect-square flex items-center justify-center text-xs rounded-lg relative",
                !date && "opacity-0",
                date && date.toDateString() === new Date().toDateString() && "bg-primary text-on-primary font-bold",
                date && hasReminder(date) && ! (date.toDateString() === new Date().toDateString()) && "bg-primary/10 text-primary font-semibold"
              )}
            >
              {date?.getDate()}
              {date && hasReminder(date) && (
                <div className={cn(
                  "absolute bottom-1 w-1 h-1 rounded-full",
                  date.toDateString() === new Date().toDateString() ? "bg-white" : "bg-primary"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 scroll-container">
        <AnimatePresence mode="popLayout">
          {sortedReminders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-4"
            >
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center">
                <Bell size={32} className="text-primary/30" />
              </div>
              <div className="space-y-2">
                <h3 className="screen-title text-on-surface-variant opacity-50">No reminders set</h3>
                <p className="body-text opacity-50">Add a reminder to stay mindful of your goals.</p>
              </div>
            </motion.div>
          ) : (
            sortedReminders.map((reminder) => {
              const overdue = isOverdue(reminder);
              return (
                <motion.div
                  layout
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    "card flex items-center gap-4 p-4 transition-all",
                    reminder.completed ? "opacity-50 grayscale" : "",
                    overdue ? "bg-red-500/10 border-red-500/30" : ""
                  )}
                >
                  <button 
                    onClick={() => toggleComplete(reminder.id)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                      reminder.completed ? "text-primary bg-primary/10" : "text-on-surface-variant/40 hover:text-primary"
                    )}
                  >
                    {reminder.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        "font-sans font-semibold text-on-surface truncate",
                        reminder.completed && "line-through"
                      )}>
                        {reminder.title}
                      </h3>
                      {overdue && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-tighter">
                          Overdue
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 caption-text">
                        <Calendar size={12} />
                        <span>{new Date(reminder.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 caption-text">
                        <Clock size={12} />
                        <span>{reminder.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deleteReminder(reminder.id)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Add Reminder Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="card max-w-md w-full space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="screen-title">New Reminder</h3>
                <button onClick={() => setIsAdding(false)} className="btn-ghost p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="section-header">What to remember?</label>
                  <input 
                    type="text"
                    placeholder="e.g., Evening meditation"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                    className="input-field w-full"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="section-header">Date</label>
                    <input 
                      type="date"
                      value={newReminder.date}
                      onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="section-header">Time</label>
                    <input 
                      type="time"
                      value={newReminder.time}
                      onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdd}
                  disabled={!newReminder.title.trim()}
                  className="btn-primary flex-1"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reminders;
