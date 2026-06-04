# Atlas Invest Prompt

Prepare a Portfolio/DCA decision.

Rules:
- Use dashboard or portfolio_plan.json for allocation truth.
- Use freshly refreshed live market data for timing.
- Do not use memory as current portfolio truth.
- Holding cash is acceptable when signals are weak.

Output:
1. Market Snapshot
2. Allocation Snapshot
3. Candidate Table
4. Final Buy / Wait / Hold Cash Recommendation
5. Risk Note
6. Next Check Date
