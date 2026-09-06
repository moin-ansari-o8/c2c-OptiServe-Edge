export type AgentRole = 'planner' | 'coder' | 'debugger' | 'reviewer';

export type AgentStatus = 'idle' | 'queued' | 'running' | 'waiting' | 'complete' | 'error';

export interface Agent {
  id: string;
  role: AgentRole;
  label: string;
  status: AgentStatus;
  prompt: string;
  response: string;
  tokens: number;
  startTime: number | null;
  endTime: number | null;
}

export interface AgentFlowStep {
  from: AgentRole;
  to: AgentRole;
  label?: string;
}

export const AGENT_FLOW: AgentFlowStep[] = [
  { from: 'planner', to: 'coder', label: 'plan' },
  { from: 'coder', to: 'debugger', label: 'code' },
  { from: 'debugger', to: 'reviewer', label: 'fixes' },
];

export const AGENT_DEFINITIONS: Record<AgentRole, { label: string; prompt: string }> = {
  planner: {
    label: 'PLANNER',
    prompt: 'You are a planning agent. Break down this task into clear steps: Build a simple REST API for a todo list application. List 3-4 implementation steps.',
  },
  coder: {
    label: 'CODER',
    prompt: 'You are a coding agent. Write a concise Python function that creates a basic in-memory todo list with add, remove, and list operations. Keep it under 30 lines.',
  },
  debugger: {
    label: 'DEBUGGER',
    prompt: 'You are a debugging agent. Review this code concept for a todo list API and identify 2-3 potential issues or edge cases that should be handled.',
  },
  reviewer: {
    label: 'REVIEWER',
    prompt: 'You are a code review agent. Provide a brief final review summary of a todo list API implementation. Rate it and suggest one improvement.',
  },
};
