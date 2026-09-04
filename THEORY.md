# The Relational Engagement Spine

A closed derivation architecture for the hypothesis that engagement is primitive and that distance, attraction, and geometry are derived descriptions.

This document is a working theory, not a paper claiming Einstein’s equations, and not established physics. Its contribution is methodological: it converts an ontological inversion into a sequence of gates a model can fail. RELATA is an independent laboratory; it is not part of AuthorityOS.

---

## Status of the claim

**Relational Engagement Hypothesis.** Physical systems are fundamentally defined by evolving channels of mutual constraint on joint histories. Spatial distance, geometry, and force are effective descriptions of the large-scale organization of those relations. What observers call gravitational attraction *may* be the geometric appearance of a universal, sign-definite sector of relational engagement.

Companion statement, which this document will not violate:

> This is a proposed research program, not a derivation, a theorem, or an established account of gravity.

The inversion

\[
\text{engagement/coupling is primitive; attraction is emergent}
\]

does **not** entail “all engagement is gravity,” and does not automatically entail that gravity must emerge from engagement. It says that *if* an engagement-first framework reproduces the empirically tested gravitational sector, then gravity could be interpreted as one universal, coarse-grained manifestation of relational dynamics.

Three propositions must stay unconflated:

| Proposition | Meaning | Status |
|---|---|---|
| Interactions create effective forces | Microscopic interactions can yield macroscopic force-like behavior | Ordinary physics |
| Gravity may be emergent | The gravitational field or spacetime geometry may arise from deeper degrees of freedom | Active research |
| Engagement is primitive | A relational/coupling rule is ontologically prior to force, geometry, and perhaps spacetime | Speculative hypothesis requiring a full mathematical theory |

---

## What “closed” means here

Closing the spine is not proving gravity. It is:

1. Every object is defined before it is used.
2. Every later claim names the gate it requires.
3. No metric, force, mass, inverse-square kernel, holographic screen, or Einstein–Hilbert term enters Layers 0–3.
4. Failure modes are stated before tuning.
5. Remaining gaps are named rather than narrated away.

The research ladder, each arrow earned independently:

\[
\text{relations}
\to
\text{locality}
\to
\text{dimension}
\to
\text{metric}
\to
\text{causal structure}
\to
\text{effective fields}
\to
\text{gravitational sector.}
\]

---

## Layer 0 — Bedrock: joint-history constraint

**Primitive data.** A finite set of unlabeled systems \(V=\{1,\ldots,N\}\), binary local states \(s_i(t)\in\{0,1\}\), and a discrete **update index** \(t\in\mathbb{N}\). At this stage \(t\) is not physical time.

Unconstrained histories:

\[
\Omega_{\mathrm{free}}=\{0,1\}^{N\times(T+1)}.
\]

A constraint clause \(C_\alpha\) acts on a finite subset \(e_\alpha\subseteq V\) over a temporal window \(w_\alpha\) and forbids a set of local history patterns \(\Pi_\alpha\). Allowed histories:

\[
\Omega_{\mathrm{allowed}}
=
\{
s\in\Omega_{\mathrm{free}}
\;\vert\;
s\restriction_{e_\alpha\times[t,t+w_\alpha]}\notin\Pi_\alpha
\;\;\forall\alpha,t
\}.
\]

**Engagement** is the presence, strength, topology, or dynamical consequence of a restriction on joint possibility:

\[
\Omega_{AB}^{\mathrm{independent}}=\Omega_A\times\Omega_B,
\qquad
\Omega_{AB}^{\mathrm{accessible}}\subseteq\Omega_A\times\Omega_B.
\]

This starting point does not assume spatial distance, a metric tensor, curvature, a force, entropy maximization, quantum entanglement specifically, or a continuous spacetime manifold.

**Honest caveat.** A fixed sparse hypergraph already supplies a primitive combinatorial locality. The claim is therefore not “all relation from a completely relation-free set of labels.” It is: whether a sparse, permutation-invariant constraint topology produces a stable continuum-like *operational* locality without coordinates or metric distances. A stronger theory lets \(C_t\) itself evolve, so adjacency is not permanently fundamental.

---

## Layer 1 — Dynamics, clock, and selection

### Constraint hypergraph versus influence relation

These are different objects and must not be identified.

- **Constraint hypergraph** \(C_t\): the *law* — which joint histories are forbidden.
- **Influence relation** \(M_{i\to j}\): an *observable* — which interventions at \(i\) later change the law at \(j\).

A clause can exist and be dynamically inert (always satisfied, no causal bite). Influence can exist through a chain of constraints without a direct clause. Experiment Zero neighborhoods are influence neighborhoods, not constraint-adjacency.

**Lemma (static, connected 2-section).** For zero-temperature-like local dynamics on a fixed hypergraph, \(\mathrm{supp}(M)\) is contained in paths of the 2-section. Influence cannot jump over absent constraint paths. Operational neighborhoods refine constraint-path balls and can be strictly smaller. Measuring \(M\) is not circularly measuring a metric.

### Operational clock

Let \(W\subset V\) be a finite clock window and \(\varphi:\{0,1\}^{|W|}\to\{0,1\}\) a local observable (e.g. parity). A tick occurs when \(\varphi\) returns to a reference value \(r\) after having left it:

\[
\theta_{n+1}
=
\inf\{
t>\theta_n
\;\vert\;
\varphi(s_W(t))=r
\text{ and }
\exists t'\in(\theta_n,t):\varphi(s_W(t'))\ne r
\}.
\]

The operational duration of \([t_a,t_b]\) relative to clock \(W\) is the tick count \(N_W(t_a,t_b)\). Ratios of tick counts are the first candidates for redshift at later layers. The update index \(t\) is never called time in Layers 0–1.

### Selection principle

No generic local flip rule will reliably create finite-dimensional locality from arbitrary random constraints. A finite-dimensional phase requires a nontrivial selection principle stated intrinsically, without an embedded target geometry.

\[
S_{\mathrm{rel}}
=
\alpha\,S_{\mathrm{constraint}}
+
\beta\,S_{\mathrm{transport}}
+
\gamma\,S_{\mathrm{redundancy}}
+
\delta\,S_{\mathrm{complexity}}.
\]

| Term | Metric-free purpose | Forbidden implementation |
|---|---|---|
| \(S_{\mathrm{constraint}}\) | Reward viable joint-history constraints | Physical edge length |
| \(S_{\mathrm{transport}}\) | Penalize unstable causal reachability | Euclidean distance |
| \(S_{\mathrm{redundancy}}\) | Reward overlapping local pathways | Forcing lattice motifs |
| \(S_{\mathrm{complexity}}\) | Penalize degree explosion | Hard-coding dimension |

Shortcutness via neighborhood overlap:

\[
\mathrm{Overlap}_{ij}(\tau)
=
\frac{|N_\varepsilon(i;\tau)\cap N_\varepsilon(j;\tau)|}
{|N_\varepsilon(i;\tau)\cup N_\varepsilon(j;\tau)|}.
\]

**A shortcut penalty is a model postulate, not a derivation of locality.** Acceptable if motivated as minimal relational complexity or stable redundant communication and tested across a phase diagram. Unacceptable if its sole rationale is “it yields approximately 4D behavior.”

### The expander trap (negative-control theorem-sketch)

For a random \(k\)-uniform hypergraph in the bounded-average-degree regime, the 2-section is locally tree-like with branching factor \(b=(k-1)(\bar d-1)>1\):

\[
|B(r)|\sim b^r=e^{r\ln b},
\qquad
\mathrm{diam}\sim\log N.
\]

That is incompatible with polynomial volume \(V(r)\sim r^{D_H}\). A raw random \(k\)-constraint ensemble is therefore a **negative control**, not a constructive mechanism. Reproducing expander growth validates the diagnostics.

Random \(k\)-SAT / \(k\)-XORSAT also have clustering/shattering transitions in clause density. Those are SAT-space transitions. The geometric phase sought here is a different transition: expander-like operational locality \(\to\) finite-dimensional operational locality under the selection action.

---

## Layer 2 — Influence

Unconditional correlation is not influence. Define matched counterfactual ensembles from the same distribution over allowed initial configurations:

\[
M_{i\to j}(t)
=
D_{\mathrm{TV}}
\bigl(
P(s_j(t)\mid \mathrm{do}[s_i(0)=0]),
\;
P(s_j(t)\mid \mathrm{do}[s_i(0)=1])
\bigr).
\]

For binary \(s_j\) this is an absolute difference of probabilities. Symmetric operational relation:

\[
M_{ij}^{\mathrm{sym}}(\tau)
=
\max_{0\le t\le\tau}
\frac{M_{i\to j}(t)+M_{j\to i}(t)}{2},
\qquad
N_\varepsilon(i;\tau)=\{j:M_{ij}^{\mathrm{sym}}(\tau)\ge\varepsilon\}.
\]

This is reachable influence within an update window. It is not distance.

First-arrival, recorded only as a later reconstruction candidate:

\[
\tau^*_{i\to j}(\varepsilon)=\inf\{t\ge 0:M_{i\to j}(t)\ge\varepsilon\}.
\]

---

## Layer 3 — Experiment Zero

The frozen protocol is [EXPERIMENT_ZERO.md](./EXPERIMENT_ZERO.md). The implemented substrate is `experiments/experiment_zero.py`.

**Objective.** Determine whether a permutation-invariant, unembedded constraint dynamics has a stable finite-dimensional local phase.

Not: derive gravity. Not: prove space is information. Not: show that mutual information contracts distance.

| Gate | Pass | Fail |
|---|---|---|
| G1 Connectedness | Giant component \(\ge 80\%\) | Fragmented or empty |
| G2 Probe invariance | Neighborhoods from \(M\), no chart | Neighborhoods exist only after an embedding |
| G3 Persistence | Jaccard overlap after burn-in | Topology scrambles; or estimator too noisy |
| G4 Finite-dimensional growth | \(n(r)\) closer to polynomial than exponential | Expander / log-diameter |
| G5 Approximate metricity | Triangle holds on a large fraction of triples | Distance-like reading inconsistent |
| G6 Non-degeneracy | Mean degree in \((k_{\min},k_{\max})\) | Complete (mean-field) or empty |

Do not fit \(d_s=4\).

**First-run result (not a discovery).** On the present tiny substrate (N=28, noisy intervention estimator), **no ensemble passed Experiment Zero**. Persistence failed on a *static* control, so \(M\) is still too noisy to trust neighborhood overlap. Adaptive Hebb + capacity did not produce a sparse, stable operational geometry distinct from the controls. Do not narrate it as emergent nearness.

That is a NO for this update class and this estimator, not a NO for the research question.

---

## Layer 4 — Metric reconstruction (after a pass)

\[
d_{ij}(\tau)=\tfrac12\bigl(\tau^*_{i\to j}+\tau^*_{j\to i}\bigr).
\]

Exact metricity is not required. Finite stochastic systems violate the triangle inequality. The target is \(\mathrm{median}_{ijk}\Delta_{ijk}\to 0\) as \(N\) increases over a coarse-graining range.

\(d=f[I]\) — whether \(1/I\), \(-\log I\), Fisher, or modular-correlation decay — is a **candidate reconstruction map**, not an emergent theorem. An increase in mutual information forces \(\Delta d\le 0\) only after choosing a monotone dictionary.

Observer embeddings (force layout, MDS) are sketches, not ontology. Independence from visualization is a gate of Experiment Zero.

---

## Layer 5 — Causal cone (unearned)

A Lieb–Robinson bound is a finite influence-speed diagnostic. It is not boost invariance, not Minkowski symmetry, and not evidence that local free-fall recovers special relativity. Those must be shown separately: symmetry restoration, composition-independent maximum speed, no preferred frame at observable scales.

---

## Layer 6 — Effective fields (unearned)

Two hard problems live here, not in Experiment Zero.

**Coordinate translation.** Coupled oscillators often synchronize without approaching. Why is a change in relational state encoded as displacement in an emergent manifold rather than as phase-locking, thermalization, or internal-state exchange?

**Invariant sign.** Electromagnetism is a coupling and is optional, bipolar, and composition-dependent. A gravity-like residual must be universal, tied to energy-momentum, and sign-definite in ordinary macroscopic regimes.

Positivity is not dynamics:

\[
I(A:B)\ge 0
\;\;\not\Rightarrow\;\;
\dot I(A:B)\ge 0
\;\;\not\Rightarrow\;\;
\ddot d(A,B)<0.
\]

Non-factorization \(H_{AB}\ne H_A\otimes\mathbb{I}+\mathbb{I}\otimes H_B\) establishes coupling, not gravity. Scattering, dissipation, entanglement generation, and synchronization all satisfy it.

Universality requirement, if this layer is ever reached:

\[
[E,U_{\mathrm{flavor}}]=0.
\]

The coupling must commute with internal symmetry operators and couple to the generator of translations in the emergent state parameter (mass-energy). Composition-dependent accelerations (\(\eta\neq 0\)) halt the program.

---

## Layer 7 — Gravity as last checkpoint (unearned)

Target condition:

\[
\text{relational microdynamics}
\Longrightarrow
g_{\mu\nu}^{\mathrm{eff}}
\Longrightarrow
\text{geodesic motion}
\Longrightarrow
\text{Einstein-like infrared dynamics.}
\]

If the theory needs to assume the metric, inverse-square law, holographic screen, causal cone, or Einstein–Hilbert action to recover these results, it is a reinterpretation of gravity, not a derivation of it.

The empirical checklist is not optional: Newtonian \(1/r\) in three large spatial dimensions; universality of free fall; redshift and time dilation; light deflection and Shapiro delay; shared geometry for massive and massless propagation; finite-speed tensor gravitational waves; conservation from symmetries; a viable causal structure; and at least one controlled, parameterized deviation from GR.

**Tripwire.**

> Under what non-geometric conditions on \(E(A,B)\) does an external description become indistinguishable from geodesic motion in a metric sourced by stress-energy?

Equivalently: can a discrete, background-independent update rule on an abstract state yield the attractive, spin-2, stress-energy-sourced Einstein tensor in the continuum limit without ever assuming a distance coordinate in the law?

---

## Circularity detector

| Expression | Legal as primitive? |
|---|---|
| \(\Omega_{AB}\subseteq\Omega_A\times\Omega_B\) | Yes |
| \(M\) from do-intervention | Yes |
| Overlap of influence neighborhoods | Yes |
| \(E=Gm_1m_2/r^2\) | No — renames Newton |
| \(E=f(r)\) | No — metric smuggling |
| \(d\sim 1/I\) as motion | No — dictionary, not dynamics |
| \(\delta S=\delta\langle K\rangle\Rightarrow\) Einstein | No — extra structure required |
| \(v_{LR}\Rightarrow\) Lorentz | No — finite speed is not boost symmetry |

---

## What this repository contains

- This spine (definitions, postulates, gates, forbidden moves).
- A finite 3-XORSAT laboratory implementing Experiment Zero on three ensembles.
- No claim that the laboratory has derived spacetime or gravity.

The correct next question after a genuine Experiment Zero pass:

> Can the finite-dimensional relational phase support a universal causal cone and effective fields?
