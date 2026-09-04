# LOCALITY-EMERGENCE-01 — Frozen Record

Ticket status: **NO PASS** (open).
Governing sentence: **Level 1 is the prize. It is not in hand. Levels 3–5 are not entitled to comment yet.**

Record date: 2026-09-04. Source workspace: `/home/user/workspace/expzero/`.
This file is the RELATA copy of the frozen record. A higher ledger may not rewrite a lower one. Levels 2–5 are LOCKED.

## 1. Three isolated ledgers

| Ledger | Content | State |
|---|---|---|
| CONJECTURE | relationship → locality → geometry → perhaps eventually gravity | Unadjudicated |
| EXPERIMENT | Can coordinate-free relational dynamics produce robust operational locality? | Runnable in part; estimator thresholds not yet calibrated |
| EVIDENCE | §5 | **NO PASS** |

## 2. The gate

\[
P = N_{\mathrm{no\text{-}smuggling}} \land C_{\mathrm{connected}} \land Q_{\mathrm{probe}} \land T_{\mathrm{persistent}} \land D_{\mathrm{finite}} \land M_{\mathrm{metric}} \land X_{\mathrm{nondegenerate}} \land A_{\mathrm{ablation}} \land S_{\mathrm{scaling}} \land R_{\mathrm{replication}}
\]

Conjunction only. No weighted score, no majority vote, no “promising.” Terminal outcomes restricted to `PASS` | `FAIL` | `INSTRUMENT_INVALID`.

`INSTRUMENT_INVALID` is claimed whenever a predicate fails on a **known positive control** at the same measurement resolution. Such a run is not evidence against the conjecture.

**PASS iff every load-bearing predicate passes.**

## 3. Control matrix (merged; expander is one adversary, not the whole requirement)

| ID | Control | Must show |
|---|---|---|
| C0 | Mean-field / all-to-all | Stays mean-field; no finite \(D\) |
| C1 | Random \(k\)-uniform hypergraph / random-regular | Expander behavior; fails \(D_{\mathrm{finite}}\) |
| C2 | Frozen skeleton (constraints exist, do not update) | Does not supply operational persistence for free |
| C3 | Bounded capacity, no clustering bias | Degree bound alone does not manufacture locality |
| P1–P3 | Ring (1D), 2D lattice, 3D lattice — coordinates used **only** to build clauses, then discarded | Positive controls; define the calibration band |

## 4. Estimator pipeline (as implemented)

Layer 0 substrate: \(V=\{1,\ldots,N\}\), \(s_i\in\{0,1\}\), 3-uniform not-all-equal clauses on \(e_\alpha\subset V\). No \(x^\mu\), \(r\), \(g_{\mu\nu}\), \(G\), \(1/r^2\), no target dimension, no lattice template in the update generator.

Update generator \(\mathcal{L}\): soft-constraint Metropolis. \(E(s)=\#\{\text{monochromatic clauses}\}\); pick label \(i\) uniformly, propose \(s_i\to 1-s_i\), accept with \(\min(1,e^{-\beta\Delta E})\). \(\beta\) is a rigidity parameter with no geometric content; \(\Omega_{\mathrm{allowed}}\) is the \(\beta\to\infty\) ground-state manifold.

Primary observable, causal not correlational:

\[
M_{i\to j}(t)=D_{\mathrm{TV}}\bigl[P(s_j(t)\mid\mathrm{do}[s_i=0]),\,P(s_j(t)\mid\mathrm{do}[s_i=1])\bigr]
\]

estimated over \(R\) matched pairs under **common random numbers** — the label sequence and the acceptance uniforms are shared between the two counterfactual arms.

Consequence, verified in this program: the sham-intervention null is identically **0.000**. There are no false positives; the detection floor is set by ensemble resolution \(\approx 3/R\), not by statistical noise. Conservative thresholds of the form \(\varepsilon=6\sqrt{0.5/R}\) were rejected as unjustified.

Neighborhood is reconstructed from \(M\), never declared from the constraint skeleton.

Dimension is estimated two independent ways that are allowed to disagree: ball-growth \(V_i(r)\) fitted as power-law-with-free-origin-offset against exponential, and spectral return probability of a random walk on the influence kernel.

## 5. Evidence entered this session

### 5.1 Instrument corrections (verified in-session)

- 4-clique counter was wrong by a factor of 2. `_k4_full` double-counted; corrected to \(K_4=\frac14\sum_{(u,v)\in E} e(N(u)\cap N(v))\) and validated against networkx clique enumeration (both give 204 on an \(N=120\) instance where the old counter gave 102).
- Incremental \(K_4\)/triangle bookkeeping went negative because `_rem` toggled pair-edges in the same order as `_add` rather than the reverse. Fixed. Incremental vs full recomputation now agree exactly across three \((\gamma,\delta,\varepsilon)\) settings: T 1881/1881, 1342/1342, 2133/2133; K4 51/51, 77/77, 65/65.

**Any earlier structural number quoting \(K_4\) is retracted.**

### 5.2 Structural screen of the relational action

\[
S_{\mathrm{rel}}=-\gamma T+\delta\sum_i k_i^2/N+\varepsilon K_4
\]

where \(T\) = triangles in the projected pair graph. Proposals are **uniformly random triples** — the proposal distribution knows nothing about locality. \(N=1000\), density 3.0, 170 sweeps, 85-sweep anneal, identical seed and initial hypergraph throughout.

| γ | δ | ε | accept | giant | comps | clustering | deg cv | deg max | T | K4 | isolated |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.0 | 25 | 0.0 | 0.878 | 1.000 | 1 | 0.082 | 0.28 | 34 | 3867 | 17 | 0 |
| 1.0 | 25 | 0.0 | 0.016 | 0.863 | 136 | 0.529 | 1.80 | 171 | 50654 | 193400 | 134 |
| 1.0 | 25 | 0.5 | 0.078 | 0.775 | 216 | 0.350 | 1.35 | 93 | 23892 | 10052 | 212 |
| 1.0 | 25 | 1.0 | 0.226 | 0.979 | 22 | 0.239 | 0.96 | 82 | 11706 | 1448 | 21 |
| 1.0 | 25 | 2.0 | 0.424 | 1.000 | 1 | 0.123 | 0.45 | 48 | 5531 | 53 | 0 |

**Reading.** The \(K_4\) term does exactly what it was introduced to do — it dissolves the clique/shard collapse and restores a single giant component — but it does so by destroying the same redundancy that was the candidate signature of locality. Clustering falls monotonically from 0.529 to 0.123 as connectivity is restored, and the \(\varepsilon=2.0\) endpoint is statistically indistinguishable from the \(\gamma=0\) no-action baseline (clustering 0.123 vs 0.082, cv 0.45 vs 0.28).

There are two regimes and no third. No configuration in this screen is simultaneously connected, degree-homogeneous, and redundancy-rich, which is the prerequisite for \(C\land X\land D\). No point earned the cost of the full gate battery.

This is consistent with the structural objection already on record: maximizing triangles at fixed degree is optimized by disjoint \((d+1)\)-cliques, i.e. shards. Triangle reward plus degree penalty cannot produce extended geometry, and \(K_4\) suppression buys connectivity only by buying its way back to randomness.

### 5.3 Verdict for this mechanism family

\[
\boxed{S_{\mathrm{rel}}=-\gamma T+\delta\sum k_i^2/N+\varepsilon K_4 \;\Rightarrow\; \mathrm{FAIL}}
\]

Recorded as **FAIL**, not `INSTRUMENT_INVALID`: the diagnostics were validated against reference implementations and the positive controls do produce the qualitative distinction (ring/lattice power-law vs random exponential) at this resolution. The mechanism, not the instrument, is what failed here.

Note on a related implementation reviewed this session (RELATA, `src/lib/engine.ts` / `src/lib/rewire.ts`): overlap-pressure rewiring that draws candidate triples from a **2-hop neighborhood pool**, with fallback to global only when that pool is small, biases the proposal distribution toward locality. Locality recovered under it is partly inserted rather than derived. It fails \(N_{\mathrm{no\text{-}smuggling}}\) as written. Restricting proposals to uniformly random triples is the minimum fix.

### 5.4 Carried forward, unverified

The following are reported from earlier turns of this program and were **not re-derived** in this session; they are recorded as **claims, not receipts**: \(\beta\approx 0.7\)–\(1.0\) optimizes per-hop dynamic range (\(\approx 3.6\times\) decay per hop, so \(\hat R\ge 3.6^h\)); estimator E1 (first-arrival) is sensitivity-limited and pinned near \(D_H\approx 0.8\)–\(0.9\) on a 3D lattice; estimator E2 (response decay) returns the correct qualitative verdicts but biased-high exponents. **Re-verify before citing.**

### 5.5 RELATA Layer 0 executable (this build)

NAE 3-uniform Metropolis, CRN matched-pair \(M\), \(N=27\), \(R=5\), horizon 3, \(\beta=0.8\). Uniform triples only.

Sham-intervention max deviation = **0.000**.

| ID | persist | giant | 2-section clust. | M-rank recall | expander-like |
|---|---|---|---|---|---|
| P1 | 0.620 | 1.00 | 0.500 | 0.546 | yes |
| P2 | 0.330 | 1.00 | 0.400 | 0.393 | yes |
| P3 | 0.332 | 1.00 | 0.200 | 0.352 | yes |
| C0 | 0.459 | 1.00 | 0.470 | 0.486 | yes |
| C1 | 0.598 | 1.00 | 0.359 | 0.375 | yes |
| C2 | 0.535 | 0.96 | 0.376 | 0.431 | yes |
| C3 | 0.404 | 0.93 | 0.336 | 0.500 | yes |
| frustrated_uniform | 0.581 | 1.00 | 0.399 | 0.472 | yes |

At this \(N/R\), thresholded \(M\) is too dense for ball-growth \(D_H\). Rank-recall does not separate P1–P3 from C0–C3. Cutoffs stay **CALIBRATION-PENDING**. Frustrated-clause rewiring (uniform triples, not \(S_{\mathrm{rel}}\), not 2-hop) is indistinguishable from C1: **FAIL of this family at this \(N\)**. Ticket remains **NO PASS**. No numbers were frozen from this table.

## 6. What is deliberately NOT frozen

Numerical thresholds — probe-overlap minimum, persistence \(\sigma\), \(D_{\mathrm{eff}}\) drift tolerance, \(\varepsilon\) — remain **CALIBRATION-PENDING**. They must be fixed against P1–P3 and C0–C3 at a common measurement resolution and frozen **before** the candidate mechanism is measured. Selecting attractive numbers now would replace geometric smuggling with statistical smuggling.

This is the one remaining blocker on runnability of the full gate.

## 7. Standing instruction

Do not optimize toward three dimensions, toward gravity, toward a lattice, or toward PASS. Run the machinery against: *does a robust finite-dimensional operational-locality phase exist?* If NO after a serious search, record NO. If YES only at a razor-thin tuned point, record the weaker result.
