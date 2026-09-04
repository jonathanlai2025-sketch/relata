import { runProtocol, ENSEMBLE_META, verdictOf } from "../src/lib/experiment-zero.ts";

const reports = runProtocol();
for (const r of reports) {
  console.log("\n===", ENSEMBLE_META[r.name].name, "===");
  console.log(verdictOf(r));
  console.log(
    JSON.stringify(
      {
        G1: r.gates.G1_connected,
        G2: r.gates.G2_probe_invariance,
        G3: r.gates.G3_persistence,
        G4: r.gates.G4_finite_dimensional_growth,
        G5: r.gates.G5_approx_metricity,
        G6: r.gates.G6_nondegeneracy,
        pass_zero: r.passZero,
        pass_geometry_hint: r.passGeometryHint,
        growth: r.growthExponent,
        spec: r.spectralDim,
        deg: r.meanDegree,
        persist: r.persistJaccard,
        giant: r.giantFraction,
      },
      null,
      2,
    ),
  );
}
