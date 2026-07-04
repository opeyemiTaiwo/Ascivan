// src/components/AIRecommendations.jsx
// "Recommended for you" - AI-matched projects and Foundations courses based on
// the member's profile (background, roles, skills, badges, interests).
// Individuals only; fails quietly (renders nothing) if the AI is unavailable.

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAIRecommendations } from '../utils/aiRecommendations';

const Spark = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const AIRecommendations = ({ currentUser }) => {
  const navigate = useNavigate();
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async (force = false) => {
    if (!currentUser) return;
    try {
      force ? setRefreshing(true) : setLoading(true);
      const r = await getAIRecommendations(currentUser, { force });
      setRecs(r);
      setFailed(false);
    } catch (e) {
      console.error('AI recommendations failed:', e);
      setFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useEffect(() => { load(false); }, [load]);

  // Nothing to show: stay out of the way (no error boxes on the dashboard).
  if (failed && !recs) return null;
  if (!loading && (!recs || (recs.projects.length === 0 && recs.courses.length === 0))) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-orange-400 text-white flex items-center justify-center"><Spark /></span>
          Recommended for you
        </h2>
        <button
          onClick={() => load(true)}
          disabled={refreshing || loading}
          className="text-blue-600 hover:text-blue-700 text-xs font-semibold px-2 py-1 rounded-lg transition-all disabled:opacity-50"
          title="Refresh recommendations"
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <p className="text-gray-400 text-xs mb-4">Matched to your background, skills, badges, and interests by AI.</p>

      {loading ? (
        <div className="space-y-2.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Projects */}
          {recs.projects.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-2">Projects to join</p>
              <div className="flex flex-col gap-2.5">
                {recs.projects.map(p => (
                  <div key={p.id} className="border border-gray-200 rounded-xl p-3.5 hover:border-blue-300 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/projects/${p.id}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 leading-snug">
                        {p.title}
                      </Link>
                      <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                        {p.match}% match
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {p.paid && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Paid</span>}
                      {p.industry && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{p.industry}</span>}
                    </div>
                    <p className="text-gray-600 text-xs mt-2 leading-relaxed">
                      <Spark className="w-3 h-3 inline text-orange-400 mr-1 -mt-0.5" />{p.reason}
                    </p>
                    <button
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="mt-2.5 text-blue-600 hover:text-blue-700 text-xs font-semibold"
                    >
                      View & apply →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courses */}
          {recs.courses.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-2">Foundations courses for you</p>
              <div className="flex flex-col gap-2.5">
                {recs.courses.map(c => (
                  <div key={`${c.track}/${c.slug}`} className="border border-gray-200 rounded-xl p-3.5 hover:border-orange-300 transition-all">
                    <Link to="/foundations" className="text-sm font-bold text-gray-900 hover:text-blue-600 leading-snug">
                      {c.title}
                    </Link>
                    <div className="mt-1.5">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">{c.trackLabel}</span>
                    </div>
                    <p className="text-gray-600 text-xs mt-2 leading-relaxed">
                      <Spark className="w-3 h-3 inline text-orange-400 mr-1 -mt-0.5" />{c.reason}
                    </p>
                    <button
                      onClick={() => navigate('/foundations')}
                      className="mt-2.5 text-blue-600 hover:text-blue-700 text-xs font-semibold"
                    >
                      Start learning →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
