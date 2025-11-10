import type { NextApiRequest, NextApiResponse } from "next";
import { solveDerivative } from "../../lib/solvers/analysis";
import { solveLinearSystem } from "../../lib/solvers/linearAlgebra";
import { solveOde } from "../../lib/solvers/ode";

type ApiResponse = {
  ok: boolean;
  result?: any;
  steps?: string[];
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { type, action, payload } = req.body || {};

  try {
    if (type === "analysis") {
      if (action === "differentiate") {
        const { expression, variable = "x" } = payload;
        const { derivative, steps } = solveDerivative(expression, variable);
        return res.json({ ok: true, result: derivative, steps });
      }
      return res.status(400).json({ ok: false, error: "Unknown analysis action" });
    } else if (type === "linear") {
      if (action === "solve") {
        const { A, b } = payload; // A: number[][], b: number[]
        const { solution } = solveLinearSystem(A, b);
        return res.json({ ok: true, result: solution });
      }
      return res.status(400).json({ ok: false, error: "Unknown linear action" });
    } else if (type === "ode") {
      if (action === "solve_ivp") {
        const { f, t0 = 0, y0 = 0, t1 = 1, dt = 0.01 } = payload;
        const solution = solveOde(f, t0, y0, t1, dt);
        return res.json({ ok: true, result: solution });
      }
      return res.status(400).json({ ok: false, error: "Unknown ode action" });
    } else {
      return res.status(400).json({ ok: false, error: "Unknown type" });
    }
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
}