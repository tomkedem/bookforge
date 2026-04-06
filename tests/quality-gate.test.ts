import { describe, it, expect } from 'vitest'

// TODO: chapter-9 - replace with real implementation
// import { runQualityGate } from '../src/agents/quality-gate'

interface QualityGateReport {
  codeReviewer: {
    approved: boolean
    issues: Array<{ severity: string }>
  }
  memoryKeeper: {
    consistent: boolean
    conflicts?: Array<{ description: string }>
  }
  errorHandler: {
    errors: Array<{ type: string; fixed: boolean }>
  }
}

interface QualityGateResult {
  approved: boolean
  reason: string
  blocking_issues: string[]
}

// Placeholder until chapter-9 implementation
const runQualityGate = async (report: QualityGateReport): Promise<QualityGateResult> => {
  const blocking_issues: string[] = []

  if (!report.codeReviewer.approved) {
    const critical = report.codeReviewer.issues.filter(i => i.severity === 'critical')
    if (critical.length > 0) {
      blocking_issues.push(`${critical.length} critical issues from code reviewer`)
    }
  }

  if (!report.memoryKeeper.consistent) {
    const conflicts = report.memoryKeeper.conflicts ?? []
    conflicts.forEach(c => blocking_issues.push(`Consistency conflict: ${c.description}`))
  }

  const openErrors = report.errorHandler.errors.filter(e => !e.fixed)
  if (openErrors.length > 0) {
    blocking_issues.push(`${openErrors.length} open errors from error handler`)
  }

  const approved = blocking_issues.length === 0

  return {
    approved,
    reason: approved ? 'All checks passed' : 'Blocking issues found',
    blocking_issues
  }
}

describe('Quality Gate', () => {

  it('rejects when there are open critical issues', async () => {
    const report: QualityGateReport = {
      codeReviewer: { approved: false, issues: [{ severity: 'critical' }] },
      memoryKeeper: { consistent: true, conflicts: [] },
      errorHandler: { errors: [] }
    }
    const result = await runQualityGate(report)
    expect(result.approved).toBe(false)
    expect(result.blocking_issues.length).toBeGreaterThan(0)
  })

  it('approves when all checks pass', async () => {
    const report: QualityGateReport = {
      codeReviewer: { approved: true, issues: [] },
      memoryKeeper: { consistent: true, conflicts: [] },
      errorHandler: { errors: [] }
    }
    const result = await runQualityGate(report)
    expect(result.approved).toBe(true)
  })

  it('rejects when there is a consistency conflict', async () => {
    const report: QualityGateReport = {
      codeReviewer: { approved: true, issues: [] },
      memoryKeeper: { consistent: false, conflicts: [{ description: 'font mismatch' }] },
      errorHandler: { errors: [] }
    }
    const result = await runQualityGate(report)
    expect(result.approved).toBe(false)
  })

  it('rejects when there are open errors', async () => {
    const report: QualityGateReport = {
      codeReviewer: { approved: true, issues: [] },
      memoryKeeper: { consistent: true, conflicts: [] },
      errorHandler: { errors: [{ type: 'runtime', fixed: false }] }
    }
    const result = await runQualityGate(report)
    expect(result.approved).toBe(false)
  })

})