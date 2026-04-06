import { describe, it, expect } from 'vitest'
import { runQualityGate } from '../src/agents/quality-gate'

describe('Quality Gate', () => {

  it('rejects when there are open critical issues', async () => {
    const report = {
      codeReviewer: { approved: false, issues: [{ severity: 'critical' }] },
      memoryKeeper: { consistent: true },
      errorHandler: { errors: [] }
    }
    const result = await runQualityGate(report)
    expect(result.approved).toBe(false)
    expect(result.blocking_issues.length).toBeGreaterThan(0)
  })

  it('approves when all checks pass', async () => {
    const report = {
      codeReviewer: { approved: true, issues: [] },
      memoryKeeper: { consistent: true, conflicts: [] },
      errorHandler: { errors: [] }
    }
    const result = await runQualityGate(report)
    expect(result.approved).toBe(true)
  })

  it('rejects when there is a consistency conflict', async () => {
    const report = {
      codeReviewer: { approved: true, issues: [] },
      memoryKeeper: { consistent: false, conflicts: [{ description: 'font mismatch' }] },
      errorHandler: { errors: [] }
    }
    const result = await runQualityGate(report)
    expect(result.approved).toBe(false)
  })

  it('rejects when there are open errors', async () => {
    const report = {
      codeReviewer: { approved: true, issues: [] },
      memoryKeeper: { consistent: true, conflicts: [] },
      errorHandler: { errors: [{ type: 'runtime', fixed: false }] }
    }
    const result = await runQualityGate(report)
    expect(result.approved).toBe(false)
  })

})