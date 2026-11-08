import { describe, expect, it } from 'vitest'
import { normalizeCustomTuiAgents } from './custom-tui-agents'

describe('normalizeCustomTuiAgents', () => {
  it('keeps complete entries with a one-line command and drops the rest', () => {
    expect(
      normalizeCustomTuiAgents([
        { id: 'axis', name: ' axis ', agent: 'claude', command: ' claude-axis ' },
        { id: 'aione', name: 'aione', agent: 'claude', command: 'aione launch\nclaude' },
        { id: 'axis', name: 'duplicate id', agent: 'claude', command: 'claude-other' },
        { id: 'nameless', name: '', agent: 'claude', command: 'claude-x' },
        { id: 'unknown', name: 'unknown', agent: 'not-an-agent', command: 'x' },
        { id: 'blank', name: 'blank', agent: 'claude', command: '  ' },
        'not an entry'
      ])
    ).toEqual([
      { id: 'axis', name: 'axis', agent: 'claude', command: 'claude-axis' },
      { id: 'aione', name: 'aione', agent: 'claude', command: 'aione launch claude' }
    ])
    expect(normalizeCustomTuiAgents(undefined)).toEqual([])
  })
})
