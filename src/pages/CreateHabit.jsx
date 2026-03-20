import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function CreateHabit() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    brainstorm: '',
    name: '',
    before: '',
    steps: '',
    after: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    try {
      const newHabit = {
        userId: currentUser.uid,
        ...formData,
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'habits'), newHabit);
      navigate(`/habit/${docRef.id}`);
    } catch (err) {
      console.error("Error creating habit:", err);
      alert("Failed to create habit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <h1 className="text-2xl font-bold text-indigo-700 mb-6">Create a New Habit</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            1. Brainstorm your habit
          </label>
          <textarea
            required
            name="brainstorm"
            value={formData.brainstorm}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows="3"
            placeholder="Write down some ideas..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            2. Choose a name for your habit — this will be the display name on the home page
          </label>
          <input
            required
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. Morning Stretch"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            3. What happens right before you perform your habit?
          </label>
          <textarea
            required
            name="before"
            value={formData.before}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows="3"
            placeholder="e.g. I turn off my alarm and sit up in bed..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            4. Describe all steps that need to happen for you to successfully perform your habit, including preparatory steps and performance steps
          </label>
          <textarea
            required
            name="steps"
            value={formData.steps}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows="4"
            placeholder="List each step..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            5. What happens right after you perform your habit?
          </label>
          <textarea
            required
            name="after"
            value={formData.after}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows="3"
            placeholder="e.g. I drink a glass of water and feel refreshed..."
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Done'}
          </button>
        </div>
      </form>
    </div>
  );
}
