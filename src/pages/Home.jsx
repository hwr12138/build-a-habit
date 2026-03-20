import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { currentUser, logout } = useAuth();
  const [habits, setHabits] = useState([]);
  const [showIntro, setShowIntro] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHabits() {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'habits'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedHabits = [];
        querySnapshot.forEach((doc) => {
          fetchedHabits.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by startDate descending locally to avoid requiring a composite index
        fetchedHabits.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        
        setHabits(fetchedHabits);
      } catch (err) {
        console.error("Error fetching habits: ", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHabits();
  }, [currentUser]);

  const handleDelete = async (e, habitId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this habit?")) return;

    try {
      await deleteDoc(doc(db, 'habits', habitId));
      setHabits(prevHabits => prevHabits.filter(h => h.id !== habitId));
    } catch (err) {
      console.error("Error deleting habit:", err);
      alert("Failed to delete habit.");
    }
  };

  return (
    <div>
      <header className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">My Habits</h1>
        <div className="flex gap-4">
          <button onClick={() => setShowIntro(true)} className="bg-indigo-500 hover:bg-indigo-400 px-3 py-1 rounded">
            Introduction
          </button>
          <button onClick={() => navigate('/create')} className="bg-white text-indigo-600 p-1 rounded-full hover:bg-gray-100" title="Create Habit">
            <Plus size={24} />
          </button>
          <button onClick={logout} className="text-sm underline">Log Out</button>
        </div>
      </header>

      {showIntro && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <div className="text-gray-700">
              <p><em>Tomorrow, I'm waking up at 5 a.m. Make that 5:30 a.m. 7:30 a.m.</em></p>
              <p><em>I'll drink my green juice. Probably.</em></p>
              <p><em>And no screens after 10 p.m. I mean after midnight. No screens on Saturdays. No screens! Except to log my water intake. Speaking of water intake, have I had my 64 ounces today?</em></p>
              <p><em>Why can't I get it right?</em></p>
              <p>To exist in the world today is to be made to believe that your life must be a work in progress. We are not living—we are <em>optimizing</em>.</p>
              <p>We set daily goals, download the latest tracking app, and swear by our New Year's resolutions, all in pursuit of that one simple "hack" that will unlock the key to perfect skin, the fastest mile, and a fully actualized self.</p>
              <p>This drive for perfection can be insidious (perfection, after all, doesn't exist!), but at its core, it reflects one of our most beautiful human traits: the desire to build a life more aligned with our values. There is nothing wrong with wanting to improve, or desiring routines that provide a greater sense of satisfaction and purpose. The difficulty comes when we believe that this sort of self-improvement can be achieved by bullying ourselves into compliance—often through guilt and shame. Maybe you've set an ambitious goal, and then watched that goal vanish under a mountain of excuses, broken plans, and "<em>I'll do it tomorrow's</em>." What once seemed simple, achievable, and <em>necessary</em>, is suddenly insurmountable. But building habits doesn't have to be this way.</p>
              <h3>SUCCESS ≠ WILLPOWER</h3>
              <p>The implicit message behind this self-improvement vortex is that all you need to achieve lasting change is willpower. It's a brute-force, white-knuckle, "just-do-it!" approach that prizes self-control above all else. There's something appealing about this oversimplified attitude: <em>want to go on a run everyday? Just go! Cut out sugar? The only thing stopping you is your own weakness!</em></p>
              <p>The problem with willpower? It doesn't work.</p>
              <p>Study after study reveals that willpower alone is not enough to create meaningful change. One study, for example, tracked the daily lives of individuals who succeed at pursuing long-term goals (i.e. those who are thought of as having "self-control").<sup>1</sup> Researchers found that willpower was consistently unrelated to goal achievement. Individuals who met their goals actually used willpower less often than participants who didn't end up reaching their long-term goals.</p>
              <p>So what was the secret formula of these high-achievers? Another set of studies found that people who met long-term goals—consistently meditating, for example, or succeeding in academic pursuits—had stronger daily behaviors.<sup>2</sup> Study participants who succeeded didn't rely on sheer willpower to bully themselves into change. Instead, they leveraged consistent daily actions that they could complete automatically. In other words, they developed <em>habits</em>.</p>
              <p>What these studies teach us is that if you, like so many others, are struggling to implement your long-term goals, <em>it is not your fault</em>. The problem lies in the approach. When we try, over and over again, to strong-arm ourselves into change, believing this time—<em>this time!</em>—will be different, we are relying on—or attempting to activate, willpower—a far more fraught, complex, and inefficient tool than we believe it to be. Willpower is just one of many tools in our arsenal, and it is rarely the most effective. Instead, the key to lasting behavior change lies in habit-building.</p>
              <h3>HOW TO BUILD A HABIT</h3>
              <p>There's no shortage of buzzy books and blogs about habits full of catchy hooks and secret formulas to success. A simple Google search shows an intimidating laundry list of results on habit-building: "Seven Great Habits of the Most Successful People," "33 Daily Habits of Successful People," or "50 Habits of Successful People You Should Adopt Now!"</p>
              <p>Unfortunately, a lot of what pop culture says about habits isn't always evidence-based, rooted in what we know about human nature, or even realistic (after all, we only have 24 hours in a day). For example, the much-repeated idea that cementing a new habit takes 21 days is a myth. That number actually originates from a 1950s self-help book where a plastic surgeon claimed it takes people about 21 days after plastic surgery to get used to their new looks!<sup>3</sup> That said, a handful of evidence-based books <em>do</em> exist that give an overview of how habits are formed in the real world. While these books can be both informative and enjoyable, they don't guide you through <em>how</em> to put principles of habit formation to use. You'll end up with a strong theoretical understanding of habits, but few actual new habits of your own.</p>
              <p>This book is different. Yes, we'll show you the research on how to build good habits, but we'll <em>also</em> guide you through practical, easy-to-follow activities that let you put those principles to work. We'll pair guidance from experts with actionable tools; lead you through exercises informed by the latest science; and, finally, help you discover how to make meaningful, lasting change. While traditional approaches to behavior change operate with a 'one-size-fits-all' mindset, a much more effective method involves experimenting in order to figure out which strategies work best for you.<sup>4</sup> So we'll do just that—offer experiments that empower you to practice habit-building without pressure, and unlock what helps you to most effectively take action.</p>
              <h3>THE NEXT FOUR WEEKS</h3>
              <p>Over the next month, you'll develop the skills necessary for substantive behavior change. This process won't be simple, but it will be informative, valuable, and fun. After all—despite what other books might have you believe—changing your behavior rarely happens in a straight line or overnight. Building daily habits takes time, and—more crucially—experimentation. It's a process that requires patience, play, and a willingness to adjust. That's why this system asks you to be open to make mistakes, tweak as needed, try again, and, above all, to be kind to yourself along the way. This kind of improvisation is necessary in order to figure out what works best <em>for you</em>, which is key to making habits stick.</p>
              <p>But this work won't end when you turn the last page. The purpose of this guide is not just to help you form a <em>single</em> habit, but to teach you the ins and outs of habit-building, so that you can use them again and again throughout your life.</p>
              <p>In the next four weeks, we'll guide you through the three steps of our expert-backed habit system:</p>
              <ol>
                <li>CHOOSE YOUR HABIT:<br />
                Select a key habit to focus on.</li>
                <li>CREATE A HABIT PLAN:<br />
                Identify the cues you'll use to integrate your new habit into your daily life.</li>
                <li>REPEAT AND REFINE:<br />
                Put your Habit Plan to action and experiment with what works (and what doesn't).</li>
              </ol>
              <p>But wait, there's more! You'll also:</p>
              <ul>
                <li>Learn the blueprints for habit formation, based on the most cutting-edge scientific research.</li>
                <li>Understand how to apply core habit science principles to your life.</li>
                <li>Master skills such as "habit piggybacking" to leverage your existing habits to build new ones.</li>
                <li>Practice a series of steps to follow when your habit journey seems to veer off-track.</li>
                <li>Get simple and compassionate guidance free of shame, judgment, quick fixes, or scientific jargon.</li>
              </ul>
              <h3>WHY THIS WORK MATTERS</h3>
              <p>Let's be clear: this book doesn't hold the key to unlocking some singular version of your most "optimized" self—that person doesn't exist. Part of continual growth is accepting the evolving, unending nature of personal development. What this book <em>can</em> do is teach you how to form habits that can help you achieve your meaningful long-term goals. If you've struggled to follow through on past goals, know it isn't your fault. It's likely because you haven't been given the structure, know-how, and support to form the necessary building blocks of behavior changing habits that will stick around even when your motivation wanes.</p>
              <p>We can't wait to get started.</p>
            </div>
            <button
              onClick={() => setShowIntro(false)}
              className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <main className="p-4 max-w-3xl mx-auto">
        {loading ? (
          <div className="text-center mt-10 text-gray-500">Loading habits...</div>
        ) : habits.length === 0 ? (
          <div className="text-center mt-10 text-gray-500">
            <p>You haven't created any habits yet.</p>
            <p className="mt-2">Click the + button to start!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map(habit => (
              <div
                key={habit.id}
                onClick={() => navigate(`/habit/${habit.id}`)}
                className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow border border-gray-100 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900">{habit.name}</h3>
                  <p className="text-sm text-gray-500">Started on {new Date(habit.startDate).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, habit.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                  title="Delete Habit"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
