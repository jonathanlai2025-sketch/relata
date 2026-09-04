# Experiment Zero — Frozen Protocol

## Trunk (frozen)

**Relational-Geometry Hypothesis.** There exists a microscopic description whose dynamics can be specified without primitive spatial distance or spacetime metric, such that geometric structure *may* arise as an effective description of constraints on joint evolution.

The primitive is not gravity, attraction, mutual information, or engagement-as-a-force.

\[
\Omega_A\times\Omega_B \;\longrightarrow\; \Omega_{AB}^{R}\subseteq\Omega_A\times\Omega_B
\]

A relation is a restriction on jointly accessible states or histories. “Engagement” is only the informal name for mutual consequentiality produced by that restriction.

## Not on the trunk

Do not treat any of the following as established by the hypothesis:

- DPI / relative-entropy positivity \(\Rightarrow\) attraction
- \(d_{ij}=1/I(i:j)\) or \(d\sim-\ln I\)
- systems maximize mutual correlation
- area-law preference \(\Rightarrow d_s=4\)
- informational flux \(\Rightarrow 1/r^2\)
- \(\delta S=\delta\langle K\rangle\Rightarrow G_{\mu\nu}=8\pi G T_{\mu\nu}\)
- BEC extra curvature, GRB dispersion, quantum EP violation

Those are optional later branches. They are not predictions until a model derives them.

## Ladder (every arrow may fail)

```
joint possibility
        ↓
relational constraint
        ↓
persistent operational locality?     ← Experiment Zero stops here
        ↓
finite effective dimension?
        ↓
reconstructible metric?
        ↓
causal structure?
        ↓
universal geometric response?
        ↓
gravitational sector?
```

A YES at Experiment Zero does not derive gravity. It only earns the right to ask the next question.

## Honest limitation

A fixed sparse constraint hypergraph already contains combinatorial adjacency. Experiment Zero therefore does **not** claim to derive locality from a structureless void. The defensible target is:

> Can a permutation-invariant, coordinate-free constraint-and-update dynamics generate a *stable operational* locality — measured by interventions — that is not an expander / small-world artifact and was not inserted as graph distance?

Constraint adjacency and operational influence are different objects. Only the second is the observable.

## Observable

For nodes \(i,j\) and time \(t\),

\[
M_{i\to j}(t)
=
D_{\mathrm{TV}}
\bigl[
P(s_j(t)\mid \mathrm{do}[s_i(0)=0]),\;
P(s_j(t)\mid \mathrm{do}[s_i(0)=1])
\bigr].
\]

Neighborhood is reconstructed from \(M\), not declared from the constraint skeleton.

## Pre-registered gates (all must be stated before looking)

| Gate | Pass | Fail |
|---|---|---|
| G1 Connectedness | Influence graph above threshold \(\theta\) has a giant component \(\ge 80\%\) of nodes | Fragmented or empty |
| G2 Probe invariance | Reconstructed neighborhoods stable under node relabeling; no coordinate chart used | Neighborhoods exist only after an embedding is chosen |
| G3 Persistence | Overlap of neighborhoods at \(t\) and \(t+\Delta\) exceeds \(\sigma\) after burn-in | Topology continually scrambles |
| G4 Finite-dimensional growth | Ball volume \(n(r)\) is closer to polynomial than exponential on the operational metric | Expander / logarithmic-diameter growth |
| G5 Approximate metricity | Reconstructed \(d\) from influence decay satisfies triangle inequality on a large fraction of triples | Distance-like reading is inconsistent |
| G6 Non-degeneracy | Mean operational degree in \((k_{\min},k_{\max})\), not complete and not empty | Mean-field or vacuum |

## Controls (required)

- C0 Mean-field: uniform all-to-all couplings, permutation invariant
- C1 Static Erdős–Rényi / random regular graph of comparable mean degree (expander / small-world negative control)
- C2 Frozen sparse skeleton: constraints exist but do not update
- C3 Dynamics with bounded node capacity but no clustering bias

C1 is a *negative control*, not evidence for the hypothesis. Random sparse graphs are expected to fail G4.

## Pass / fail policy

- All of G1–G3 and G6 fail → stop. No geometry program.
- G1–G3, G6 pass and G4 fails → operational influence exists but is not continuum-like. Report and stop or change the update class.
- G1–G6 pass → Experiment One is licensed: does operational locality support an emergent causal cone?

Do not fit \(d_s=4\). Ask only whether some stable finite \(D_{\mathrm{eff}}\) appears, measured two ways (ball-growth and spectral) that are allowed to disagree.

## Implementation

See `experiment_zero.py`. It runs the substrate, the three controls, the six gates, and writes `experiment_zero_report.json` plus figures.

## First-run result (not a discovery)

On the present tiny substrate (N=28, noisy intervention estimator), **no ensemble passed Experiment Zero**.

| Ensemble | G1 | G3 | G4 | G6 | Verdict |
|---|---|---|---|---|---|
| adaptive capacity + Hebb | fail | fail | fail | pass | NO |
| mean-field control | fail | fail | fail | pass | NO |
| Erdős–Rényi control | fail | fail | pass | fail | NO (expected as control) |
| random-regular control | pass | fail | pass | pass | NO; G3 fail is likely estimator noise on a static graph |

Read this correctly:

- This is a **NO for this update class and this estimator**, not a NO for the research question.
- Persistence failing on a *static* control means \(M\) is still too noisy to trust neighborhood overlap. Fix the instrument before claiming a dynamical phase.
- Adaptive Hebb + capacity did **not** produce a sparse, stable operational geometry distinct from the controls. Do not narrate it as emergent nearness.

That is Experiment Zero working as designed: it can return NO.

## What to do next if continuing

1. Raise intervention trials until static controls pass G3.
2. Only then compare adaptive dynamics against those controls.
3. If adaptive still matches mean-field, abandon this update rule.
4. If adaptive passes G1–G6 and controls do not pass the same pattern, license Experiment One (causal cone). Still not gravity.
