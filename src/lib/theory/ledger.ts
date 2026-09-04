export type LedgerItem = {
  id: string;
  title: string;
  body: string;
};

export const LEDGER = {
  earned: [
    {
      id: "e1",
      title: "Joint-history restriction as primitive",
      body: "Ω_AB^accessible ⊆ Ω_A × Ω_B is a gravity-free, metric-free definition of engagement. It does not use distance, mass, or force.",
    },
    {
      id: "e2",
      title: "Update index is not physical time",
      body: "t is a discrete generator index. Operational duration is a tick count of a local clock process. Redshift, if it exists, is a later ratio of tick counts.",
    },
    {
      id: "e3",
      title: "Constraint hypergraph ≠ influence relation",
      body: "C_t is the law. M is an interventional observable. Influence support is contained in 2-section paths for static constraints, and can be strictly smaller.",
    },
    {
      id: "e4",
      title: "Expander trap as negative-control theorem-sketch",
      body: "Random bounded-degree k-uniform hypergraphs have |B(r)| ~ b^r and diam ~ log N. Experiment Zero must reproduce that failure. Doing so validates the gates.",
    },
    {
      id: "e5",
      title: "Architecture of the ladder",
      body: "Each arrow — relations → locality → dimension → metric → causal structure → fields → gravity — is a separate earning. Closing the spine means no missing definitions and no smuggled metrics, not that Einstein dynamics have been derived.",
    },
  ] as LedgerItem[],
  postulates: [
    {
      id: "p1",
      title: "Overlap-pressure / shortcut penalty",
      body: "A selection principle that penalizes low-context links using only combinatorial overlap. Stated intrinsically, tested on a phase diagram, never justified by target dimension.",
    },
    {
      id: "p2",
      title: "Sparse k-local clauses",
      body: "The substrate is a sparse constraint hypergraph, so some combinatorial locality is assumed. Adjacency is allowed to evolve; it is not declared to be spacetime.",
    },
    {
      id: "p3",
      title: "Binary local states and 3-XORSAT toy dynamics",
      body: "The laboratory uses 3-XORSAT Glauber dynamics as a finite, inspectable micro-law. It is a model of constraint, not a claim about the true Hilbert space of the world.",
    },
  ] as LedgerItem[],
  open: [
    {
      id: "o1",
      title: "Coordinate translation",
      body: "Why a change in relational state is reported as Δx → 0 rather than phase-locking, thermalization, or internal-state exchange.",
    },
    {
      id: "o2",
      title: "Invariant sign",
      body: "Why the universal residual is macroscopically attractive, unlike electromagnetism. Positivity of mutual information does not imply Ḋ ≥ 0 or d̈ < 0.",
    },
    {
      id: "o3",
      title: "Lorentz emergence",
      body: "A Lieb–Robinson speed is not boost invariance. Preferred-frame absence must be shown in the continuum.",
    },
    {
      id: "o4",
      title: "Einstein infrared limit",
      body: "Universal spin-2 sector sourced by emergent stress-energy, with the GR checklist, plus one controlled deviation.",
    },
    {
      id: "o5",
      title: "Why three large dimensions",
      body: "Experiment Zero forbids imposing D_H = 3. The spatial dimensionality of a relativistic infrared, if any, is a later model-selection question.",
    },
  ] as LedgerItem[],
  forbidden: [
    {
      id: "f1",
      title: "E(A,B) = G m_A m_B / r²",
      body: "Renames Newtonian gravity. Nothing is derived.",
    },
    {
      id: "f2",
      title: "E(A,B) = f(d(A,B))",
      body: "Puts the metric in the definition of engagement. Circularity.",
    },
    {
      id: "f3",
      title: "d ~ 1/I as a dynamical law",
      body: "A chosen coordinate dictionary. Increase of I does not move objects unless the dictionary is smuggled in as ontology.",
    },
    {
      id: "f4",
      title: "Assuming a holographic screen, area law, or Einstein–Hilbert term",
      body: "Inserts the gravitational sector that was supposed to be earned.",
    },
    {
      id: "f5",
      title: "I(A:B) ≥ 0  ⇒  attraction",
      body: "Positivity constrains values, not the direction of time evolution and not the sign of an emergent acceleration.",
    },
    {
      id: "f6",
      title: "Treating a visualization layout as geometry",
      body: "Force-directed drawings and MDS embeddings are observer sketches. Independence from layout is a gate.",
    },
  ] as LedgerItem[],
};

export const CIRCULARITY = [
  { expr: "Ω_AB ⊆ Ω_A × Ω_B", legal: true, note: "Joint-history restriction. Legal primitive." },
  { expr: "M from do-intervention", legal: true, note: "Operational influence. Legal observable." },
  { expr: "Overlap of influence neighborhoods", legal: true, note: "Combinatorial, metric-free." },
  { expr: "E = G m1 m2 / r²", legal: false, note: "Newtonian gravity under a new name." },
  { expr: "E = f(r)", legal: false, note: "Metric smuggled into the coupling." },
  { expr: "d = 1/I as motion", legal: false, note: "Dictionary, not dynamics." },
  { expr: "δS = δ⟨K⟩ ⇒ Einstein", legal: false, note: "Needs extra structure; not a universal bridge." },
  { expr: "v_LR ⇒ Lorentz", legal: false, note: "Finite speed is not boost symmetry." },
];
