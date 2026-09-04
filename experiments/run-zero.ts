import { Simulation, type EnsembleId } from "../src/lib/engine.ts";

const ensembles: EnsembleId[] = ["torus", "random", "overlap"];

for (const ensemble of ensembles) {
  const sim = new Simulation({
    ensemble,
    n: 81,
    seed: 7,
    alpha: ensemble === "torus" ? 1 : 1,
    beta: 1.4,
    gamma: 1.2,
    delta: 0.35,
  });
  sim.sweep(ensemble === "overlap" ? 40 : 12);
  const report = sim.runExperimentZero();
  console.log("\n===", ensemble, "===");
  for (const line of report.log) console.log(line);
  for (const g of report.gates) {
    console.log(`  [${g.pass ? "PASS" : "HALT"}] ${g.id} ${g.name}: ${g.value}`);
  }
}
