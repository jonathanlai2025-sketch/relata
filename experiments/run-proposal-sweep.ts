import { writeFileSync } from "node:fs";
import { runProposalSweep, summarizeSweep } from "../src/lib/rewire.ts";

const rows = runProposalSweep();
const notes = summarizeSweep(rows);
const out = { rows, notes, reading: "2-hop at γ=0 is already more clustered than uniform at γ=1. Locality was inserted by the proposal kernel." };
console.log(JSON.stringify(out, null, 2));
writeFileSync("/workspace/artifacts/proposal_sweep.json", JSON.stringify(out, null, 2));
