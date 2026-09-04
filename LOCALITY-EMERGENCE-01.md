# LOCALITY-EMERGENCE-01

Frozen ticket. Do not optimize toward three dimensions, gravity, a lattice, or PASS.

**Level 1 is the prize. It is not in hand. Levels 3–5 are not entitled to comment yet.**

## Question

Does a robust finite-dimensional operational-locality phase exist in a system whose microscopic rules contain no metric coordinates or background geometry?

A pass earns the causal-structure question. It does not establish spacetime or gravity.

## Terminal outcomes (exactly one)

| Verdict | Meaning |
|---|---|
| `PASS` | Conjunction of all load-bearing predicates is true. |
| `FAIL` | Instrument was valid and the conjunction is false. |
| `INSTRUMENT_INVALID` | A static positive control failed a persistence/probe test. The run cannot adjudicate the hypothesis. |

No average score. One red load-bearing predicate means no promotion.

`PASS` is forbidden unless scaling and replication are in the same ticket. A single-\(N\) toy run cannot return `PASS`.

## Three ledgers (do not mix)

| Ledger | Content |
|---|---|
| CONJECTURE | relationship → locality → geometry → perhaps eventually gravity |
| EXPERIMENT | Can coordinate-free relational dynamics produce robust operational locality? |
| EVIDENCE | Currently `INSTRUMENT_INVALID`. Initial mechanisms failed or exposed instrumentation problems. Later successes do not reinterpret those failures. |

## Predicates (conjunction)

\[
\begin{aligned}
P ={}& N_{\mathrm{no\text{-}smuggling}} \land C_{\mathrm{connected}} \land Q_{\mathrm{probe}} \\
&\land T_{\mathrm{persistent}} \land D_{\mathrm{finite}} \land M_{\mathrm{metric}} \\
&\land X_{\mathrm{nondegenerate}} \land K_{\mathrm{controls}} \land A_{\mathrm{ablation}} \\
&\land S_{\mathrm{scaling}} \land R_{\mathrm{replication}}.
\end{aligned}
\]

| ID | Predicate | Pre-registered test |
|---|---|---|
| \(N\) | No smuggling | Audit: no coordinates, target \(D\), \(1/r\) kernel, planted lattice, or 2-hop proposal in the update. Layout is not ontology. |
| \(C\) | Connected | Giant component of thresholded \(M\) \(\ge 0.80\). |
| \(Q\) | Cross-probe agreement | Not “change which node is \(i\).” Agreement among **intervention \(M\)**, **equal-time correlation**, and **hitting/propagation**. Pairwise Jaccard of thresholded graphs \(\ge 0.40\). Homogeneity (reciprocity \(\ge 0.45\), growth-CV \(\le 0.55\)) is necessary and not sufficient. |
| \(T\) | Persistent | Jaccard of thresholded \(M\) at mid vs end \(\ge 0.35\) after burn-in. |
| \(D\) | Finite-dimensional | Mid-range ball growth \(D_H \in [0.6, 4.8]\), \(n(1) < 0.55 N\), and \(R^2_{\mathrm{poly}} > R^2_{\mathrm{exp}} + 0.04\). Do not fit \(d_s=4\). |
| \(M\) | Approximate metric | Triangle hold on \(d_{ij}=-\log(M_{ij}+\varepsilon)\) \(\ge 0.70\). |
| \(X\) | Non-degenerate | Mean operational degree \(\in (2,\,0.45(N-1))\). |
| \(K\) | Controls fail differently | Mean-field stays mean-field (\(X\) or \(C\) fail). Expander / random-regular do not fake \(D\). Frozen skeleton does not automatically supply \(T\) unless the instrument is valid — see instrument gate. |
| \(A\) | Ablations | Remove capacity, remove joint-statistic update, shuffle partners. A claimed phase must collapse. If it survives the load-bearing cut, misidentified cause. |
| \(S\) | Finite-size scaling | At least three \(N\) spanning a factor \(\ge 4\). \(D_H(N)\) and \(d_s(N)\) vary by \(< 0.5\) on the upper half of the range. Parameter-region area does not shrink to a point. |
| \(R\) | Replication | Different seed **and** independently implemented estimator. Same predicates, same polarity. |

Expander defense is one instance of \(K\) and \(D\), not a replacement for mean-field or frozen-skeleton controls.

## Instrument gate (before \(P\))

Static positive control: frozen random-regular (or frozen sparse skeleton) of comparable degree.

If \(T < 0.35\) on that control, verdict is `INSTRUMENT_INVALID`. Do not record `FAIL` against the physical hypothesis. Raise intervention trials until the static control passes \(T\), then reopen the ticket.

## Estimators

- \(M_{i\to j}(t) = D_{\mathrm{TV}}\big(P(s_j(t)\mid \mathrm{do}[s_i(0)=0]),\, P(s_j(t)\mid \mathrm{do}[s_i(0)=1])\big)\).
- Correlation: equal-time connected correlator of the same state samples, not a do-intervention.
- Hitting: mean first-passage of a random walk on the current coupling, converted to \(1/(1+h_{ij})\). Different operational probe, not a second copy of \(M\).
- Threshold \(\theta = 0.18\) unless a pre-registered robustness band is stated first.

## Current adjudication

First-run N=28, noisy \(M\): static random-regular failed \(T\). **Verdict: `INSTRUMENT_INVALID`.**

The hypothesis was not falsified. It was not tested.

## Forbidden optimizations

Do not tune toward \(D=3\), \(d_s=4\), inverse-square, a pretty lattice, or `PASS`.
