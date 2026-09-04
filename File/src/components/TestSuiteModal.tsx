import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  RotateCcw,
  Zap,
  Activity,
  Layers,
  Cpu
} from 'lucide-react';
import { TestResult } from '../types';
import { TestLogEntry, TestSuiteRunner } from '../services/testSuite';
import confetti from 'canvas-confetti';

interface TestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestSuiteModal: React.FC<TestSuiteModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      id: 'test_concurrency',
      title: 'Upload Concurrency (Max 3)',
      category: 'concurrency',
      status: 'idle',
      details: 'Tests that the queue strictly runs at most 3 simultaneous uploads and handles FIFO transitions.',
    },
    {
      id: 'test_chunk_resume',
      title: 'Chunk Upload & Resumption',
      category: 'chunking',
      status: 'idle',
      details: 'Tests multi-part chunking, injects a simulated network drop at chunk 2, and asserts resume starts from chunk offset.',
    },
    {
      id: 'test_rxjs_promises',
      title: 'RxJS Streams & Async Promises',
      category: 'rxjs',
      status: 'idle',
      details: 'Tests BehaviorSubject queue state, Subject progress events, and asynchronous Promise non-blocking loop.',
    },
    {
      id: 'test_performance',
      title: 'Performance & Queue Latency',
      category: 'performance',
      status: 'idle',
      details: 'Benchmarks queue dispatch latency, high-frequency state emissions, and instant batch cancellation.',
    },
  ]);
  const [logs, setLogs] = useState<TestLogEntry[]>([]);

  if (!isOpen) return null;

  const runAllTests = async () => {
    setIsRunning(true);
    setLogs([]);

    // Reset status to running
    setTestResults((prev) =>
      prev.map((t) => ({ ...t, status: 'running', durationMs: undefined, metrics: undefined }))
    );

    const runner = new TestSuiteRunner((log) => {
      setLogs((prev) => [...prev, log]);
    });

    try {
      const results = await runner.runAllTests((singleResult) => {
        setTestResults((prev) =>
          prev.map((t) => (t.id === singleResult.id ? singleResult : t))
        );
      });

      const allPassed = results.every((r) => r.status === 'passed');
      if (allPassed) {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore if canvas unavailable
        }
      }
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-rose-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-300" />;
    }
  };

  const allPassed = testResults.length > 0 && testResults.every((t) => t.status === 'passed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="flex flex-col w-full max-w-3xl max-h-[92vh] rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Verification & Architecture Test Suite
              </h2>
              <p className="text-xs text-slate-500">
                Automated tests for Async handling, RxJS/Promises, Concurrency limits & Resumption
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Controls bar */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Test Engine Status:</span>
              {isRunning ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  <Activity className="h-3 w-3 animate-spin" /> Executing assertions...
                </span>
              ) : allPassed ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> All 4 Test Suites Passed
                </span>
              ) : (
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  Ready to run
                </span>
              )}
            </div>

            <button
              onClick={runAllTests}
              disabled={isRunning}
              id="run-all-tests-btn"
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95"
            >
              {isRunning ? (
                <>
                  <Activity className="h-3.5 w-3.5 animate-spin" /> Running...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" /> Run All Tests
                </>
              )}
            </button>
          </div>

          {/* Test Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {testResults.map((test) => (
              <div
                key={test.id}
                className={`rounded-2xl border p-4 transition-all duration-200 ${
                  test.status === 'passed'
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : test.status === 'failed'
                    ? 'border-rose-200 bg-rose-50/30'
                    : test.status === 'running'
                    ? 'border-blue-200 bg-blue-50/30 ring-2 ring-blue-500/10'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                    {getStatusIcon(test.status)}
                    <span>{test.title}</span>
                  </div>
                  {test.durationMs !== undefined && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {test.durationMs} ms
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                  {test.details}
                </p>

                {/* Test Metrics list */}
                {test.metrics && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[10px]">
                    {Object.entries(test.metrics).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-slate-400 uppercase font-medium">{key}</span>
                        <span className="font-semibold text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Live Assertion & Execution Logs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-slate-500" />
                Live Assertion Console
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {logs.length} entries
              </span>
            </div>

            <div className="h-44 rounded-2xl bg-slate-950 p-3.5 font-mono text-[11px] text-slate-200 overflow-y-auto space-y-1">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 italic">
                  Press "Run All Tests" to view live engine stream emissions, chunk assertions, and concurrency checks.
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-500 flex-shrink-0">[{log.timestamp}]</span>
                    <span
                      className={
                        log.level === 'success'
                          ? 'text-emerald-400 font-semibold'
                          : log.level === 'error'
                          ? 'text-rose-400 font-semibold'
                          : log.level === 'warn'
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/80">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
