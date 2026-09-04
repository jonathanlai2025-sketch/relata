import { writeFileSync } from "node:fs";
import {
  interpretCalibration,
  interpretCandidate,
  runFrustratedCandidate,
  runLayer0Calibration,
} from "../src/lib/calibrate-zero";

const cal = runLayer0Calibration(27, { R: 5, horizon: 3, beta: 0.8, burn: 2, seed: 7 });
const read = interpretCalibration(cal);
const cand = runFrustratedCandidate(27, 20, { R: 5, horizon: 3, beta: 0.8, burn: 2, seed: 11 });
const candNotes = interpretCandidate(cand, cal);

const out = { cal, read, cand, candNotes, ticket: "NO PASS" };
writeFileSync("artifacts/layer0_calibration.json", JSON.stringify(out, null, 2));
console.log("=== CALIBRATION ===");
for (const r of cal) {
  console.log(
    `${r.id} n=${r.n} cl=${r.nClauses} sham=${r.sham.toFixed(3)} persist=${r.persist.toFixed(3)} giant=${r.giant.toFixed(3)} clust=${r.clustering.toFixed(3)} recall=${r.rankRecall.toFixed(3)} expander=${r.expanderLike} meanM=${r.meanM.toFixed(3)}`,
  );
}
console.log(read.notes.join("\n"));
console.log("=== CANDIDATE frustrated_uniform ===");
console.log(JSON.stringify(cand, null, 2));
console.log(candNotes.join("\n"));
console.log("TICKET: NO PASS");
