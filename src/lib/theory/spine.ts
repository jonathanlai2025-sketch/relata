export type LayerStatus = "defined" | "postulate" | "measured" | "unearned";

export type Block =
  | { type: "p"; text: string }
  | { type: "eq"; math: string }
  | { type: "ul"; items: string[] }
  | { type: "callout"; kind: "axiom" | "postulate" | "warning" | "earned" | "open"; title: string; body: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export type Layer = {
  id: string;
  index: number;
  title: string;
  kicker: string;
  status: LayerStatus;
  claim: string;
  blocks: Block[];
};

export const HYPOTHESIS = {
  title: "Relational-Geometry Hypothesis",
  boxed:
    "There exists a microscopic description whose dynamics can be specified without primitive spatial distance or spacetime metric, such that geometric structure may arise as an effective description of constraints on joint evolution. A relation is a restriction on jointly accessible states or histories. Engagement is only the informal name for mutual consequentiality produced by that restriction.",
  companion:
    "The primitive is not gravity, attraction, mutual information, or engagement-as-a-force. RELATA is independent of AuthorityOS.",
  inversion: "Constraint is primitive. Geometry is earned. Gravity is a later checkpoint.",
};

export const LAYERS: Layer[] = [
  {
    id: "L0",
    index: 0,
    title: "Bedrock",
    kicker: "Joint-history constraint",
    status: "defined",
    claim:
      "The primitive object is a restriction on joint histories of unlabeled systems. No manifold is given.",
    blocks: [
      {
        type: "callout",
        kind: "axiom",
        title: "Closed definition",
        body: "V is a finite set of abstract labels. t is an update index, not physical time. Each clause forbids a local history pattern on a finite subset of V. Engagement is the presence of that restriction: Ω_AB^accessible ⊆ Ω_A × Ω_B.",
      },
      {
        type: "p",
        text: "Write H_t = (V, C_t) with V = {1, …, N} and binary local states s_i(t) ∈ {0,1}. The unconstrained history set is Ω_free = {0,1}^{N × (T+1)}. Each clause C_α acts on a finite subset e_α ⊆ V over a temporal window w_α and forbids a set of local patterns Π_α.",
      },
      {
        type: "eq",
        math: "Ω_allowed = { s ∈ Ω_free  |  s ↾ (e_α × [t, t+w_α]) ∉ Π_α  for all α, t }",
      },
      {
        type: "p",
        text: "This is stronger than a static constraint-satisfaction problem: the primitive is a restriction on joint histories, not merely allowed simultaneous bit-strings. Nothing in the definition uses distance, mass, force, curvature, entropy maximization, or a background metric.",
      },
      {
        type: "callout",
        kind: "warning",
        title: "Honest caveat",
        body: "A fixed sparse hypergraph already supplies a primitive combinatorial locality. We are not deriving all relation from a completely relation-free set of labels. We are asking whether a sparse, permutation-invariant constraint topology produces a stable continuum-like operational locality without coordinates. A stronger theory lets C_t itself evolve, so adjacency is not permanently fundamental.",
      },
      {
        type: "ul",
        items: [
          "Labels are permutation-invariant. There is no embedding.",
          "t is an update index. Physical time, if it exists, is identified later from a clock process.",
          "Independent systems have Ω_AB = Ω_A × Ω_B. A relation is any proper restriction of that product.",
        ],
      },
    ],
  },
  {
    id: "L1",
    index: 1,
    title: "Dynamics",
    kicker: "Update, clock, selection",
    status: "postulate",
    claim:
      "The law is a metric-free action on node states and clauses. Time is an operational tick count, not a coordinate.",
    blocks: [
      {
        type: "p",
        text: "Constraint hypergraph versus influence relation are distinct. The hypergraph C_t is the law — which joint histories are forbidden. The influence tensor M is an observable — which interventions later change states. They need not coincide: a clause can be dynamically inert; influence can travel along a chain of clauses with no direct edge.",
      },
      {
        type: "eq",
        math: "S_rel = α S_constraint + β S_transport + γ S_redundancy + δ S_complexity",
      },
      {
        type: "table",
        headers: ["Term", "Metric-free purpose", "Forbidden implementation"],
        rows: [
          ["S_constraint", "Reward viable joint-history constraints", "Any term using physical edge length"],
          ["S_transport", "Penalize unstable causal reachability", "Penalty proportional to Euclidean distance"],
          ["S_redundancy", "Reward overlapping local pathways", "Forcing cubic or simplicial lattice motifs"],
          ["S_complexity", "Penalize degree explosion and unconstrained rewiring", "Hard-coding three spatial dimensions"],
        ],
      },
      {
        type: "p",
        text: "A concrete intrinsic candidate for shortcutness uses only operational neighborhoods. For an active relation i ↔ j, Overlap_ij(τ) = |N_ε(i;τ) ∩ N_ε(j;τ)| / |N_ε(i;τ) ∪ N_ε(j;τ)|. An edge joining nodes with very low shared local context is a candidate shortcut.",
      },
      {
        type: "callout",
        kind: "postulate",
        title: "A shortcut penalty is a model postulate",
        body: "It is acceptable if motivated as minimal relational complexity or stable redundant communication, and tested across a phase diagram. It is not acceptable if its sole rationale is that it yields approximately 4D behavior. Random k-constraint ensembles are the negative control, not the constructive mechanism.",
      },
      {
        type: "p",
        text: "Operational clock. Let W ⊂ V be a finite clock window and φ a local observable on s_W (for example, parity). A tick occurs when φ returns to a reference value r after having left it. The operational duration of [t_a, t_b] relative to clock W is the tick count N_W(t_a, t_b). Ratios of tick counts are the first candidates for redshift at later layers. The update index t is never called time in Layers 0–1.",
      },
      {
        type: "eq",
        math: "θ_{n+1} = inf { t > θ_n  :  φ(s_W(t)) = r  and  ∃ t' ∈ (θ_n, t) with φ(s_W(t')) ≠ r }",
      },
    ],
  },
  {
    id: "L2",
    index: 2,
    title: "Influence",
    kicker: "Interventional reachability",
    status: "defined",
    claim:
      "Neighborhoods are defined by do-interventions, not by a distance function and not by unconditional correlation.",
    blocks: [
      {
        type: "p",
        text: "An unconditional difference in probabilities can register common causes. Influence requires matched counterfactual ensembles. From the same distribution over allowed initial configurations, impose do[s_i(0)=a] and compare the later law at j.",
      },
      {
        type: "eq",
        math: "M_{i→j}(t) = | P(s_j(t)=1 | do[s_i(0)=1]) − P(s_j(t)=1 | do[s_i(0)=0]) |",
      },
      {
        type: "eq",
        math: "M_{ij}^{sym}(τ) = max_{0≤t≤τ}  (M_{i→j}(t) + M_{j→i}(t)) / 2",
      },
      {
        type: "eq",
        math: "N_ε(i;τ) = { j ∈ V  :  M_{ij}^{sym}(τ) ≥ ε }",
      },
      {
        type: "p",
        text: "This still does not define distance. It defines reachable influence within an update window. First-arrival τ*_{i→j}(ε) = inf { t ≥ 0 : M_{i→j}(t) ≥ ε } is recorded only as a later candidate for a metric reconstruction, and only after Experiment Zero passes.",
      },
      {
        type: "callout",
        kind: "earned",
        title: "Lemma (static, connected 2-section)",
        body: "Support of M is contained in paths of the constraint 2-section. Influence cannot jump over absent constraint paths. Operational neighborhoods therefore refine constraint-path balls, and can be strictly smaller when variables freeze. Measuring M is not circularly measuring a metric.",
      },
    ],
  },
  {
    id: "L3",
    index: 3,
    title: "Experiment Zero",
    kicker: "Finite-dimensional local phase",
    status: "measured",
    claim:
      "Determine whether a permutation-invariant, unembedded constraint dynamics has a stable finite-dimensional local phase.",
    blocks: [
      {
        type: "callout",
        kind: "axiom",
        title: "Objective",
        body: "Not: derive gravity. Not: prove space is information. Not: show that mutual information contracts distance. The experiment asks only whether the substrate enters — or fails to enter — a connected, persistent, finite-dimensional, approximately metric operational phase.",
      },
      {
        type: "table",
        headers: ["Gate", "Observable", "Pass", "Halt"],
        rows: [
          ["0.0 Connectedness", "Giant component f_giant", "f_giant → 1", "Persistent fragmentation"],
          ["0.1 Probe invariance", "Neighborhood overlap across probes", "High median overlap", "Near depends on the probe"],
          ["0.2 Persistence", "Time-window overlap", "Slow vs microscopic updates", "Scramble on update timescale"],
          ["0.3 Finite dimension", "V(τ) ~ τ^{D_H}, plus d_s", "Stable finite D_H, d_s", "V ~ e^{λτ} or no window"],
          ["0.4 Metric consistency", "Triangle residuals of first-arrival", "Median Δ → 0 in IR", "Order-one nonmetricity"],
          ["0.5 Non-degeneracy", "Degree, clustering, bottlenecks", "Neither complete nor chain", "Expander, dust, or 1-chain"],
        ],
      },
      {
        type: "p",
        text: "Dimension uses two independent estimators. Hausdorff-like D_H from influence-ball growth V_i(τ) = |N_ε(i;τ)| ~ τ^{D_H}. Spectral d_s = −2 d ln P_return(σ) / d ln σ from a walk on the reconstructed relational kernel. A continuum phase is credible only if both plateau on 1 ≪ τ,σ ≪ τ_finite(N). Do not impose D_H = 3 or d_s = 4 here.",
      },
      {
        type: "callout",
        kind: "warning",
        title: "The expander trap",
        body: "A random bounded-degree k-uniform hypergraph is locally tree-like with branching b > 1, so |N(r)| ~ b^r and diam ~ log N. That is incompatible with polynomial volume. Random ensembles are negative controls. Reproducing expander growth validates the diagnostics; it does not support the hypothesis.",
      },
      {
        type: "p",
        text: "The experimental matrix is a falsification matrix: random k-hypergraph; low-degree static constraints; dynamical hypergraph with only viability; degree penalty; overlap/transport pressure; ablations; finite-size scaling. The output is a phase diagram (α,β,γ,δ) ↦ (f_giant, D_H, d_s, Δ, persistence, probe overlap), not a preferred visualization.",
      },
    ],
  },
  {
    id: "L4",
    index: 4,
    title: "Dimension & metric",
    kicker: "Earned reconstruction",
    status: "unearned",
    claim:
      "A distance is allowed only after Experiment Zero passes, and only as a reconstruction of already-measured first-arrival.",
    blocks: [
      {
        type: "eq",
        math: "d_ij(τ) = ½ ( τ*_{i→j}(ε) + τ*_{j→i}(ε) )",
      },
      {
        type: "p",
        text: "Pass condition is not exact metricity. Finite stochastic systems will violate the triangle inequality. The target is median_{i,j,k} Δ_ijk → 0 over a macroscopic coarse-graining range as N increases. Different operational probes must converge on the same local neighborhood structure, and the inferred geometry must predict a propagation or response observable that was not used to construct it.",
      },
      {
        type: "callout",
        kind: "warning",
        title: "Not a theorem",
        body: "d(i,j) = f[I(i:j)] — whether 1/I, −log I, Fisher, or modular-correlation decay — is a candidate reconstruction map, not an emergent theorem. An increase in mutual information forces Δd ≤ 0 only after choosing a monotone dictionary. That dictionary is not dynamics.",
      },
      {
        type: "p",
        text: "Observer embeddings (force layouts, MDS of d_ij) are sketches. They are not the ontology. Independence from a convenient visualization is a pass criterion of Experiment Zero.",
      },
    ],
  },
  {
    id: "L5",
    index: 5,
    title: "Causal cone",
    kicker: "Finite influence speed",
    status: "unearned",
    claim:
      "A maximum update-propagation speed may emerge. That is not Lorentz invariance.",
    blocks: [
      {
        type: "p",
        text: "A Lieb–Robinson bound on a local update rule is a causality diagnostic: there is a finite v_LR beyond which influence is exponentially small. Boost invariance, light-cone structure for all local observers, and the absence of a preferred frame are separate claims and must be demonstrated, not narrated.",
      },
      {
        type: "callout",
        kind: "open",
        title: "Still required",
        body: "Symmetry restoration in the continuum, composition-independent maximum speed, and a shared causal structure for matter-like and radiation-like excitations. Failure: state-dependent propagation speed or a detectable preferred frame at observable scales.",
      },
    ],
  },
  {
    id: "L6",
    index: 6,
    title: "Effective fields",
    kicker: "Universal coupling",
    status: "unearned",
    claim:
      "Localized excitations must couple independently of internal flavor, or the equivalence principle is already lost.",
    blocks: [
      {
        type: "p",
        text: "The invariant-sign problem and the coordinate-translation problem live here, not in Experiment Zero. Coupling is common; gravity is a specific residue. Electromagnetism is a coupling and is optional, bipolar, and composition-dependent. A gravity-like sector needs a selection rule that makes the long-range residual universal, tied to energy-momentum, and sign-definite in ordinary macroscopic regimes.",
      },
      {
        type: "eq",
        math: "[ E , U_flavor ] = 0",
      },
      {
        type: "p",
        text: "Coordinate translation: coupled oscillators often synchronize without approaching. The model must derive why a change in relational state is encoded by an observer as displacement in an emergent manifold, rather than as phase-locking, thermalization, or internal-state exchange. Positivity of mutual information does not give Ï ≥ 0 and does not give d̈ < 0.",
      },
      {
        type: "callout",
        kind: "open",
        title: "Unearned on purpose",
        body: "Non-factorization of H_AB is a criterion for coupling, not a criterion for gravity. Scattering, dissipation, entanglement generation, and synchronization all satisfy it.",
      },
    ],
  },
  {
    id: "L7",
    index: 7,
    title: "Gravity",
    kicker: "Last checkpoint",
    status: "unearned",
    claim:
      "Gravity is the last checkpoint, not the starting assumption. It is earned only if a metric-free relational update produces a universal spin-2 sector sourced by the emergent stress-energy of its own excitations.",
    blocks: [
      {
        type: "eq",
        math: "relational microdynamics  ⇒  g_μν^eff  ⇒  geodesic motion  ⇒  Einstein-like infrared dynamics",
      },
      {
        type: "p",
        text: "If the theory needs to assume the metric, inverse-square law, holographic screen, causal cone, or Einstein–Hilbert action in order to recover these results, it is a reinterpretation of gravity, not a derivation of it.",
      },
      {
        type: "ul",
        items: [
          "Newtonian limit: 1/r potential and inverse-square acceleration in three large spatial dimensions.",
          "Universality of free fall to existing Eötvös bounds.",
          "Redshift, time dilation, light deflection, Shapiro delay, perihelion precession.",
          "Shared geometry for massive and massless propagation.",
          "Finite-speed tensor gravitational waves, conservation from symmetries, viable causal structure.",
          "At least one controlled, parameterized deviation from GR — otherwise it may be an interpretation rather than a distinct theory.",
        ],
      },
      {
        type: "callout",
        kind: "open",
        title: "The tripwire",
        body: "Under what non-geometric conditions on E(A,B) does an external description become indistinguishable from geodesic motion in a metric sourced by stress-energy? Can a discrete, background-independent update rule on an abstract state yield the attractive, spin-2, stress-energy-sourced Einstein tensor in the continuum limit without ever assuming a distance coordinate in the law?",
      },
    ],
  },
];

export const LADDER = [
  "relations",
  "locality",
  "dimension",
  "metric",
  "causal structure",
  "effective fields",
  "gravitational sector",
];
