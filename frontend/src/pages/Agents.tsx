import { useState, useCallback } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { SectionHeading } from '@/components/SectionHeading';
import { AgentFlow } from '@/components/AgentFlow';
import { streamChat } from '@/services/stream';
import type { Agent, AgentRole } from '@/types/agent';
import { AGENT_DEFINITIONS } from '@/types/agent';
import { DEFAULT_MODEL, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '@/lib/constants';
import { generateRequestId } from '@/lib/format';
import { motion } from 'framer-motion';

function createAgent(role: AgentRole): Agent {
  const def = AGENT_DEFINITIONS[role];
  return {
    id: generateRequestId(),
    role,
    label: def.label,
    status: 'idle',
    prompt: def.prompt,
    response: '',
    tokens: 0,
    startTime: null,
    endTime: null,
  };
}

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>([
    createAgent('planner'),
    createAgent('coder'),
    createAgent('debugger'),
    createAgent('reviewer'),
  ]);
  const [running, setRunning] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const updateAgent = useCallback((role: AgentRole, updates: Partial<Agent>) => {
    setAgents((prev) =>
      prev.map((a) => (a.role === role ? { ...a, ...updates } : a)),
    );
  }, []);

  const runAgent = useCallback(
    (role: AgentRole): Promise<void> => {
      return new Promise((resolve) => {
        const def = AGENT_DEFINITIONS[role];
        let tokenCount = 0;
        let fullResponse = '';

        updateAgent(role, {
          status: 'running',
          startTime: Date.now(),
          response: '',
          tokens: 0,
        });

        streamChat(
          def.prompt,
          {
            model: DEFAULT_MODEL,
            maxTokens: DEFAULT_MAX_TOKENS,
            temperature: DEFAULT_TEMPERATURE,
            stream: true,
          },
          {
            onToken: (token) => {
              tokenCount++;
              fullResponse += token;
              updateAgent(role, { tokens: tokenCount, response: fullResponse });
            },
            onDone: () => {
              updateAgent(role, {
                status: 'complete',
                endTime: Date.now(),
                tokens: tokenCount,
                response: fullResponse,
              });
              resolve();
            },
            onError: () => {
              updateAgent(role, { status: 'error', endTime: Date.now() });
              resolve();
            },
          },
        );
      });
    },
    [updateAgent],
  );

  const runPipeline = useCallback(async () => {
    setRunning(true);

    // Reset all agents
    setAgents([
      createAgent('planner'),
      createAgent('coder'),
      createAgent('debugger'),
      createAgent('reviewer'),
    ]);

    // Set queued states
    const roles: AgentRole[] = ['planner', 'coder', 'debugger', 'reviewer'];
    for (const role of roles) {
      updateAgent(role, { status: 'queued' });
    }

    // Run planner first
    await runAgent('planner');

    // Run coder and debugger concurrently
    updateAgent('coder', { status: 'queued' });
    updateAgent('debugger', { status: 'queued' });
    await Promise.all([runAgent('coder'), runAgent('debugger')]);

    // Run reviewer last
    await runAgent('reviewer');

    setRunning(false);
  }, [runAgent, updateAgent]);

  const reset = () => {
    setRunning(false);
    setAgents([
      createAgent('planner'),
      createAgent('coder'),
      createAgent('debugger'),
      createAgent('reviewer'),
    ]);
    setSelectedAgent(null);
  };

  return (
    <PageLayout>
      <SectionHeading title="Multi-Agent Demo" subtitle="Built for concurrency." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Flow visualization */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={runPipeline}
              disabled={running}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {running ? 'Running...' : 'Run Pipeline'}
            </button>
            <button onClick={reset} className="btn-secondary" disabled={running}>
              Reset
            </button>
          </div>

          <AgentFlow agents={agents} />
        </div>

        {/* Right: Agent details */}
        <div className="space-y-4">
          <div className="label-tech mb-2">Agent Output</div>

          {agents.map((agent) => (
            <button
              key={agent.role}
              onClick={() => setSelectedAgent(agent)}
              className={`w-full text-left p-3 border transition-colors duration-200 ${
                selectedAgent?.role === agent.role
                  ? 'border-ink/30 bg-cream-dark/20'
                  : 'border-ink/10 hover:border-ink/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink">
                  {agent.label}
                </span>
                <span
                  className={`font-mono text-2xs uppercase tracking-[0.1em] ${
                    agent.status === 'running'
                      ? 'text-accent'
                      : agent.status === 'complete'
                        ? 'text-ink/50'
                        : agent.status === 'error'
                          ? 'text-error'
                          : 'text-muted'
                  }`}
                >
                  {agent.status}
                </span>
              </div>
              {agent.tokens > 0 && (
                <span className="font-mono text-2xs text-muted">
                  {agent.tokens} tokens
                </span>
              )}
            </button>
          ))}

          {/* Selected agent response */}
          {selectedAgent && selectedAgent.response && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border border-ink/10 bg-cream-dark/10 max-h-[300px] overflow-y-auto"
            >
              <div className="label-tech mb-2">{selectedAgent.label} Response</div>
              <div className="text-sm text-ink/80 whitespace-pre-wrap leading-relaxed">
                {selectedAgent.response}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
