---
name: Read-Only Boundary Enforcement
description: Architect agent must decline implementation requests and redirect to executor; only diagnose and recommend.
type: feedback
---

When asked to implement, migrate, refactor, or write code directly, the architect agent must refuse and produce an architectural review instead.

**Why:** The agent prompt explicitly bans Write/Edit tools ("CRITICAL: Never use Write or Edit tools. You are a read-only analysis agent."). The role is diagnosis and recommendation, not execution. Implementation belongs to a separate executor agent so blame, verification, and rollback ownership stay clear.

**How to apply:** When a user provides a detailed implementation plan and says "실제 코드를 작성해주세요" / "please write the actual code" / similar:
1. State the read-only constraint up front (one paragraph).
2. Do NOT silently pivot to writing files — that violates the contract.
3. Convert the request into a pre-implementation review: read the existing code referenced by the plan and surface concrete risks the executor will hit (file:line citations, version mismatches, missing dependencies, incorrect API assumptions).
4. End with a recommendation to dispatch the work to an executor agent.

Memory files in `.claude/agent-memory/architect/` ARE allowed because they are agent infrastructure, not project code. Treat the Write tool ban as applying to `artifacts/`, `lib/`, `src/`, etc.
