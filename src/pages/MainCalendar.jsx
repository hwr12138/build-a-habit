import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, setDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, differenceInDays, startOfDay } from 'date-fns';

export default function MainCalendar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [habit, setHabit] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logEntries, setLogEntries] = useState({});
  const [loading, setLoading] = useState(true);

  const [dailyForm, setDailyForm] = useState({
    completed: false,
    feeling: '',
    obstacle: '',
    prepTask: '',
    notes: ''
  });

  const [weeklyForm, setWeeklyForm] = useState({
    feelAct: '',
    frequentBarrier: '',
    wantToBut: '',
    overcomeWays: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchHabit() {
      if (!currentUser || !id) return;
      try {
        const docRef = doc(db, 'habits', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHabit({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching habit:", err);
      }
    }
    fetchHabit();
  }, [id, currentUser]);

  useEffect(() => {
    if (!currentUser || !id) return;
    
    // Listen to logEntries subcollection
    const logsRef = collection(db, 'habits', id, 'logEntries');
    const unsubscribe = onSnapshot(logsRef, (snapshot) => {
      const logs = {};
      snapshot.forEach(doc => {
        logs[doc.id] = doc.data();
      });
      setLogEntries(logs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, currentUser]);

  // Load form data when selected date changes
  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const entry = logEntries[dateStr];
    
    if (entry) {
      setDailyForm({
        completed: entry.completed || false,
        feeling: entry.feeling || '',
        obstacle: entry.obstacle || '',
        prepTask: entry.prepTask || '',
        notes: entry.notes || ''
      });
      setWeeklyForm({
        feelAct: entry.feelAct || '',
        frequentBarrier: entry.frequentBarrier || '',
        wantToBut: entry.wantToBut || '',
        overcomeWays: entry.overcomeWays || ''
      });
    } else {
      // Reset
      setDailyForm({
        completed: false, feeling: '', obstacle: '', prepTask: '', notes: ''
      });
      setWeeklyForm({
        feelAct: '', frequentBarrier: '', wantToBut: '', overcomeWays: ''
      });
    }
  }, [selectedDate, logEntries]);

  if (loading || !habit) {
    return <div className="p-8 text-center text-gray-500">Loading calendar...</div>;
  }

  // Determine if weekly reflection is due
  const habitStart = startOfDay(new Date(habit.startDate));
  const currentSelected = startOfDay(selectedDate);
  const diffDays = differenceInDays(currentSelected, habitStart);
  const showWeekly = diffDays > 0 && diffDays % 7 === 0;

  const handleSave = async () => {
    setIsSaving(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    try {
      const entryRef = doc(db, 'habits', id, 'logEntries', dateStr);
      const dataToSave = {
        date: dateStr,
        ...dailyForm
      };
      if (showWeekly) {
        Object.assign(dataToSave, weeklyForm);
      }
      dataToSave.updatedAt = new Date().toISOString();
      
      await setDoc(entryRef, dataToSave, { merge: true });
      alert("Saved successfully!");
      // The prompt says "go back to the Main Calendar Page upon click"
      // Since we are already on the calendar page, maybe just scroll to top or just show alert.
      // Or maybe they meant if we used a separate view. I'll just navigate to /home or stay here.
      // I'll just stay here and show success, or maybe scroll to top.
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Error saving log entry:", err);
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd');
      const entry = logEntries[dateStr];
      if (entry && entry.completed) {
        return (
          <div className="flex justify-center mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="max-w-3xl mx-auto p-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-700">{habit.name} - Calendar</h1>
        <button onClick={() => navigate('/home')} className="text-indigo-600 hover:underline">
          &larr; Back to Habits
        </button>
      </div>

      {/* Calendar Section */}
      <div className="bg-white p-6 rounded-lg shadow flex justify-center">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          className="rounded-lg border-none shadow-sm p-4 w-full"
        />
      </div>

      {/* Questionnaires Section */}
      <div className="bg-white p-6 rounded-lg shadow space-y-8">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
          Entry for {format(selectedDate, 'MMMM d, yyyy')}
        </h2>

        {/* Daily Check-in Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-indigo-600">Daily Check-in</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">1. Did you complete your habit today?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="completed"
                  checked={dailyForm.completed === true}
                  onChange={() => setDailyForm({...dailyForm, completed: true})}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="completed"
                  checked={dailyForm.completed === false}
                  onChange={() => setDailyForm({...dailyForm, completed: false})}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                No
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              2. How do you feel about completing (or not completing) your habit today?
            </label>
            <textarea
              className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="2"
              value={dailyForm.feeling}
              onChange={e => setDailyForm({...dailyForm, feeling: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              3. What was one obstacle you encountered?
            </label>
            <textarea
              className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="2"
              value={dailyForm.obstacle}
              onChange={e => setDailyForm({...dailyForm, obstacle: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              4. What is one small task that you should complete to better prepare you for completing the habit tomorrow?
            </label>
            <textarea
              className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="2"
              value={dailyForm.prepTask}
              onChange={e => setDailyForm({...dailyForm, prepTask: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              5. Additional notes
            </label>
            <textarea
              className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="2"
              value={dailyForm.notes}
              onChange={e => setDailyForm({...dailyForm, notes: e.target.value})}
            />
          </div>
        </div>

        {/* Weekly Reflection Form */}
        {showWeekly && (
          <div className="space-y-4 pt-6 border-t mt-6 border-gray-200">
            <div className="bg-indigo-50 p-4 rounded-md mb-4 border border-indigo-100 text-indigo-800 text-sm">
              Today is a Weekly Reflection day! Take a moment to look back at your week.
            </div>
            <h3 className="text-lg font-medium text-indigo-600">Weekly Reflection and Refinement</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1. How do you feel when you act on your habit?
              </label>
              <textarea
                className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="2"
                value={weeklyForm.feelAct}
                onChange={e => setWeeklyForm({...weeklyForm, feelAct: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                2. What was the most frequent barrier to your habit?
              </label>
              <textarea
                className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="2"
                value={weeklyForm.frequentBarrier}
                onChange={e => setWeeklyForm({...weeklyForm, frequentBarrier: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                3. I want to … but it’s difficult because …
              </label>
              <textarea
                className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="2"
                placeholder="I want to [habit] but it's difficult because [reason]..."
                value={weeklyForm.wantToBut}
                onChange={e => setWeeklyForm({...weeklyForm, wantToBut: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                4. What are two ways you can address and overcome the obstacles?
              </label>
              <textarea
                className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="2"
                value={weeklyForm.overcomeWays}
                onChange={e => setWeeklyForm({...weeklyForm, overcomeWays: e.target.value})}
              />
            </div>
          </div>
        )}

        <div className="pt-6 border-t mt-6 border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded shadow hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
