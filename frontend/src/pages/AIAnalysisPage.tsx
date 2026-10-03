import React, { useState } from 'react';
import { 
  BrainCircuit, 
  ArrowRight, 
  Search, 
  FileText, 
  Zap, 
  CheckCircle2, 
  Server,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { ConfidenceMeter } from '../components/common/ConfidenceMeter';

export const AIAnalysisPage: React.FC = () => {
  const [sampleQuery, setSampleQuery] = useState('My password has expired.');
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    if (!sampleQuery.trim()) return;
    setLoading(true);
    try {
      const data = await api.analyzeRequest(sampleQuery);
      setAnalysis(data);
    } catch (e) {
      console.error("Analysis API error:", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    runAnalysis();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-blue-600" />
              <span>AI Decision Pipeline Trace</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Step-by-step technical breakdown of intent classification, vector search grounding, decision logic, and ServiceNow integration.</p>
          </div>
          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
            Pipeline Trace Mode
          </span>
        </div>

        {/* Input bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={sampleQuery}
            onChange={(e) => setSampleQuery(e.target.value)}
            placeholder="Type any query to trace pipeline execution..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-md shadow-blue-600/20"
          >
            <Cpu className="h-4 w-4" />
            <span>{loading ? 'Tracing...' : 'Run Pipeline Trace'}</span>
          </button>
        </div>
      </div>

      {/* Visual Pipeline Flow Sequence */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
          Pipeline Flow Architecture: Request → Intent → Classification → RAG → Decision → Automation → ServiceNow → Resolution
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-[11px] font-semibold">
          {['1. Request', '2. Intent', '3. Classification', '4. RAG Retrieval', '5. Decision', '6. Automation', '7. ServiceNow', '8. Resolution'].map((step, idx) => (
            <div key={idx} className="p-2.5 bg-blue-50/70 border border-blue-200 text-blue-800 rounded-lg shadow-sm">
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Trace Analysis Breakdown Cards */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Intent & Classification */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Cpu className="h-4 w-4 text-blue-600" />
              <span>1. Intent & Metadata Classification</span>
            </h3>

            <div className="space-y-3 text-xs">
              <ConfidenceMeter score={analysis.decision.confidence} />

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Intent:</span>
                  <span className="font-bold text-slate-800">{analysis.classification.intent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Workflow Type:</span>
                  <span className="font-bold text-blue-600">{analysis.classification.workflow_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Category:</span>
                  <span className="font-semibold text-slate-800">{analysis.classification.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Subcategory:</span>
                  <span className="font-semibold text-slate-700">{analysis.classification.subcategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Priority:</span>
                  <span className="font-bold text-rose-600">{analysis.classification.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Assignment Group:</span>
                  <span className="font-semibold text-slate-800">{analysis.classification.assignment_group}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: RAG Vector Retrieval */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="h-4 w-4 text-emerald-600" />
              <span>2. RAG Semantic Retrieval & Similarity</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium">Sufficient Context Found:</span>
                <span className={`font-bold px-2 py-0.5 rounded ${analysis.rag_retrieval.has_sufficient_context ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {analysis.rag_retrieval.has_sufficient_context ? 'YES (Threshold Passed)' : 'NO (Low Confidence)'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium">Max Cosine Score:</span>
                <span className="font-mono font-bold text-blue-600">{analysis.rag_retrieval.max_similarity_score}</span>
              </div>

              <p className="text-[11px] text-slate-400 font-medium">Matching Knowledge Chunks Count: {analysis.rag_retrieval.chunks_count}</p>
            </div>
          </div>

          {/* Card 3: Decision & Automation */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Zap className="h-4 w-4 text-cyan-600" />
              <span>3. Automation Decision & Self-Healing</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Automation Eligible:</span>
                <span className="font-bold text-emerald-600">{analysis.automation.eligible ? 'Approved (Self-Heal)' : 'Not Eligible'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Target Automation Action:</span>
                <span className="font-mono font-semibold text-slate-800">{analysis.automation.action || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Execution Mode:</span>
                <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">{analysis.automation.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Recommended Action:</span>
                <span className="font-bold text-blue-600">{analysis.decision.action_recommended}</span>
              </div>
            </div>
          </div>

          {/* Card 4: ServiceNow & Resolution */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Server className="h-4 w-4 text-purple-600" />
              <span>4. ServiceNow & Audit Sync</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100 space-y-1">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">ServiceNow Table Sync</span>
                <p className="text-xs text-purple-900 font-mono font-bold">sys_id: mock_sys_inc001001 | number: INC001001</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                All decisions, RAG similarity scores, and execution events are committed to MongoDB <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">audit_logs</code>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
