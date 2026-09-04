# RELATA

**Relational Engagement Laboratory**

Closed theory spine of the engagement-first hypothesis, from joint-history constraint through Experiment Zero.

> Engagement is primitive. Attraction is emergent. Gravity is a later checkpoint.

This is a research architecture and a finite laboratory — not a derivation of Einstein’s equations, and not established physics.

## Hypothesis

Physical systems are defined by evolving channels of mutual constraint on joint histories. Spatial distance, geometry, and force are effective descriptions of the large-scale organization of those relations. What observers call gravitational attraction may be the geometric appearance of a universal, sign-definite sector of relational engagement.

The full closed spine, including operational clocks, the constraint/influence split, the expander trap, Experiment Zero gates, and the explicit unearned status of gravity, is in [THEORY.md](./THEORY.md).

## Experiment Zero

The only implemented experiment asks a deliberately modest question:

> Can a permutation-invariant, unembedded constraint dynamics enter a connected, persistent, finite-dimensional, approximately metric operational phase?

Three ensembles:

| Ensemble | Role | Expected |
|---|---|---|
| Hidden 2-torus | Oracle control | Diagnostics recover \(D_H \approx 2\) |
| Random 3-XORSAT | Negative control | Expander / fail finite dimension |
| Overlap pressure | Constructive postulate | Test whether a metric-free shortcut penalty geometrizes |

Passing Experiment Zero does not derive gravity. It earns the right to ask the next question.

## Repository

- [`THEORY.md`](./THEORY.md) — closed spine, Layers 0–7
- [`src/lib/engine.ts`](./src/lib/engine.ts) — metric-free 3-XORSAT laboratory
- [`experiments/run-zero.ts`](./experiments/run-zero.ts) — CLI gate report
- Interactive lab: Spine / Lab / Ledger in the web app

```bash
node --experimental-strip-types experiments/run-zero.ts
```

No coordinates, mass, Newton constant, or inverse-square kernel enter the update law. Drawings of the graph are observer sketches, not ontology.

## Forbidden primitives

These are circular if used as the definition of engagement:

- \(E(A,B)=G m_A m_B / r^2\)
- \(E(A,B)=f(d(A,B))\)
- \(d \sim 1/I\) treated as motion
- Assuming a holographic screen, area law, or Einstein–Hilbert term in order to “recover” gravity

## License

MIT
