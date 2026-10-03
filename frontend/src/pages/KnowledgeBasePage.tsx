import React, { useState, useEffect } from 'react';
import { BookOpen, Search, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { KnowledgeArticle } from '../types';

export const KnowledgeBasePage: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await api.getKnowledgeArticles();
      setArticles(data);
    } catch (e) {
      console.error("Failed to load KB articles:", e);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Network', 'Identity & Security', 'Collaboration', 'Hardware & Software', 'General IT'];

  const filteredArticles = articles.filter(a => {
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesQuery = !searchQuery.trim() || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>Approved IT Knowledge Base (RAG Source Documents)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Approved enterprise IT documentation used by FAISS vector index for grounded RAG Q&A.</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
            {articles.length} Knowledge Base Documents
          </span>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search knowledge articles, procedures, error codes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeArticle ? (
        /* Full Article View */
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <button
            onClick={() => setActiveArticle(null)}
            className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Knowledge Articles</span>
          </button>

          <div className="border-b border-slate-200 pb-4">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded border border-blue-200">
              {activeArticle.category}
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 mt-2">{activeArticle.title}</h1>
            <p className="text-xs text-slate-400 mt-1">Source document file: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">{activeArticle.filename}</code></p>
          </div>

          <div className="prose prose-slate max-w-none text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line bg-slate-50/50 p-6 rounded-xl border border-slate-200/80">
            {activeArticle.content}
          </div>
        </div>
      ) : (
        /* Article Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((art) => (
            <div 
              key={art.id}
              onClick={() => setActiveArticle(art)}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200">
                    {art.category}
                  </span>
                  <FileText className="h-4 w-4 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 leading-snug">{art.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{art.short_description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{art.filename}</span>
                <span className="font-bold text-blue-600 hover:underline">Read Article →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
