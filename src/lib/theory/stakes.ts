export const CURRENT = {
  localityEmergence: "FAIL" as const,
  meaning:
    "Not a NO for the research question. A NO for this update class, this estimator, and any 2-hop-contaminated proposal.",
  lookFor: "LOCALITY_EMERGENCE = PASS",
  lookForNot: "We proved the gravity idea.",
  receipts: [
    "First-run Ising substrate: no ensemble passed G1–G6.",
    "G3 failed on a static control — the instrument is still too noisy.",
    "2-hop clause proposals insert locality at γ=0. Uniform triples did not license the action.",
    "A YES would still not derive gravity.",
  ],
};

export const BOXED = {
  deep: "relationship → locality → geometry",
  gravity: "geometry’s response to physical state → gravity",
  everyday:
    "You gave the system relationships, but you didn’t give it distance — and distance-like structure appeared anyway.",
};

export const LEVELS = [
  {
    id: 1,
    title: "Experiment Zero passes",
    status: "unearned" as const,
    body: "Persistent neighborhoods. Independent probes agree about who is near whom. A stable finite dimension. Approximate metricity improves with scale. The phenomenon occupies a region of parameter space, not one magical setting.",
    means: "Continuum-like operational locality can emerge from non-geometric relational dynamics.",
  },
  {
    id: 2,
    title: "It scales",
    status: "unearned" as const,
    body: "Increase N. Change initial conditions. Alter microscopic rules. Ablate. The macroscopic structure survives.",
    means: "Less a simulation artifact, more an emergent universality class.",
  },
  {
    id: 3,
    title: "Causal structure emerges",
    status: "unearned" as const,
    body: "Perturbations propagate through the emergent geometry in a consistent way. An effective causal cone develops.",
    means: "Beyond “something looks spatial.” Spacetime kinematics, still not gravity.",
  },
  {
    id: 4,
    title: "Effective physics lives on it",
    status: "unearned" as const,
    body: "Excitations propagate according to that structure. Different kinds of excitation agree about the geometry. Low-energy observers can use effective fields.",
    means: "A place where physics can happen. Gravity still unearned.",
  },
  {
    id: 5,
    title: "A universal gravitational sector",
    status: "unearned" as const,
    body: "Localized energy-like excitations modify the emergent geometry. Other excitations respond universally. A massless spin-2 sector. Weak-field inverse-square. Equivalence-principle behavior. Infrared equations approaching Gμν ≈ 8πG Tμν — without those ingredients in the microscopic rules.",
    means: "Only here does the original gravity thought return. Not a metaphor. A candidate microscopic explanation for why gravitational geometry exists.",
  },
];

export const CORRECTION = {
  tooHigh: "What if it’s just simply attraction through engagement?",
  deeper:
    "Directionally right, one layer too high. Gravity would not be engagement pulling things together. It would be a macroscopic property of a relational substrate reorganizing under physical state.",
};
