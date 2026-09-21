import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layers, ArrowRight, Code, Cpu, Mic, Music, Terminal, BookOpen, Calendar } from 'lucide-react';
import { Tilt3D } from '../../components/Tilt3D';

export const CategoriesPage = ({ setTab }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  const categoryIcons = {
    code: <Code className="w-6 h-6" />,
    cpu: <Cpu className="w-6 h-6" />,
    mic: <Mic className="w-6 h-6" />,
    music: <Music className="w-6 h-6" />,
    terminal: <Terminal className="w-6 h-6" />,
    'book-open': <BookOpen className="w-6 h-6" />
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">
          <Layers className="w-4 h-4" />
          <span>Curated Disciplines</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
          Event Categories
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Explore campus opportunities curated across competitions, workshops, seminars, and fests.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Tilt3D key={cat._id} maxTilt={12} scale={1.03} className="h-full">
              <div
                onClick={() => setTab('explore', { category: cat.slug })}
                className="glass-panel glass-panel-hover rounded-3xl overflow-hidden p-6 cursor-pointer border border-slate-200/90 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 flex flex-col justify-between group transition-all h-full shadow-sm hover:shadow-xl dark:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: `${cat.color || '#6366F1'}25`,
                        color: cat.color || '#6366F1'
                      }}
                    >
                      {categoryIcons[cat.icon] || <Calendar className="w-6 h-6" />}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm">
                      {cat.eventCount || 0} Events
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {cat.description || 'Explore top collegiate events and activities.'}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:text-brand-500 dark:group-hover:text-brand-300">
                  <span>View Events</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Tilt3D>
          ))}
        </div>
      )}
    </div>
  );
};
