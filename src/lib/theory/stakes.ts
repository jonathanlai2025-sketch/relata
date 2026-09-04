export const CURRENT = {
  localityEmergence: "INSTRUMENT_INVALID" as const,
  meaning:
    "Static random-regular failed persistence. The instrument could not adjudicate the hypothesis. That is not FAIL of the physics, and it is not PASS.",
  lookFor: "LOCALITY-EMERGENCE-01",
  lookForNot: "We proved the gravity idea.",
  receipts: [
    "First-run: adaptive did not separate from mean-field.",
    "T failed on a static control → INSTRUMENT_INVALID.",
    "2-hop proposals insert locality. Uniform triples are the honest kernel.",
    "A, S, and R were not in the ticket. PASS is forbidden.",
  ],
};

export const VALVE =
  "A higher level cannot rewrite a lower one. Levels 3–5 are not entitled to comment until Level 1 is green.";

export const BOXED = {
  deep: "relationship → locality → geometry",
  gravity: "geometry’s response to physical state → gravity",
  everyday:
    "You gave the system relationships, but you didn’t give it distance — and distance-like structure appeared anyway.",
};

export const LEVELS = [
  {
    id: 1,
    title: "Operational locality",
    status: "unearned" as const,
    body: "Persistent neighborhoods. Independent probes agree about who is near whom. A stable finite dimension. Approximate metricity that improves with scale. A region of parameter space, not a single setting. Controls and ablations do not produce the same pattern for free.",
    means: "Continuum-like operational locality from non-geometric relational dynamics. Everything after this is optional.",
  },
  {
    id: 2,
    title: "Universality-class hint",
    status: "unearned" as const,
    body: "The phase survives N, initial conditions, and inessential microscopic changes.",
    means: "No longer a picture of one script. Still not gravity.",
  },
  {
    id: 3,
    title: "Kinematics",
    status: "unearned" as const,
    body: "Disturbances travel on that structure inside a stable effective cone.",
    means: "“Looks spatial” becomes “has causal form.”",
  },
  {
    id: 4,
    title: "Effective physics",
    status: "unearned" as const,
    body: "More than one species of excitation agrees about the same geometry. Low-energy bookkeeping can be field-like.",
    means: "A place where physics can happen. Gravity still unearned.",
  },
  {
    id: 5,
    title: "Gravitational sector",
    status: "unearned" as const,
    body: "Energy-like excitations deform the geometry. Other excitations respond universally. A massless spin-2 residue. Weak-field 1/r² and equivalence-principle behavior are outputs. Then G_μν^eff ?≈ 8π G_eff T_μν^eff is a scientific question rather than a slogan.",
    means: "Only here does the original thought return. Still unearned.",
  },
];

export const CORRECTION = {
  tooHigh: "What if it’s just simply attraction through engagement?",
  deeper:
    "Directionally right, one layer too high. Gravity would not be engagement pulling things together. It would be how a relational substrate reorganizes when its physical state changes.",
};
