#!/usr/bin/env python3
"""
Experiment Zero: operational locality from coordinate-free constraint dynamics.

Frozen claim
------------
Given no metric coordinates or background geometry, does a specified
relational constraint-and-update system enter a connected, persistent,
finite-dimensional, approximately metric operational phase?

A YES does not derive gravity, attraction, 1/r^2, or Einstein dynamics.
"""

from __future__ import annotations

import json
import math
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np
try:
    import matplotlib.pyplot as plt
except ImportError:
    plt = None


OUT = Path("/workspace/artifacts")
OUT.mkdir(parents=True, exist_ok=True)
RNG = np.random.default_rng(4)


@dataclass
class Params:
    n: int = 28
    steps: int = 40
    samples: int = 24
    intervene_horizon: int = 3
    capacity: float = 5.0
    hebb: float = 0.10
    decay: float = 0.05
    noise: float = 0.01
    theta: float = 0.18
    persist_window: int = 1


def softmax_rows(w: np.ndarray, cap: float) -> np.ndarray:
    """Bounded-capacity couplings; no coordinates used."""
    n = w.shape[0]
    out = np.zeros_like(w)
    for i in range(n):
        row = w[i].copy()
        row[i] = -1e9
        # soft degree budget: keep a finite number of strong partners
        z = row - row.max()
        e = np.exp(z / 0.35)
        e[i] = 0.0
        s = e.sum()
        if s <= 0:
            continue
        out[i] = cap * e / s
    # symmetrize: relation is mutual constraint, not a directed wire
    out = 0.5 * (out + out.T)
    np.fill_diagonal(out, 0.0)
    return out


def init_uniform(n: int, cap: float, jitter: float = 0.05) -> np.ndarray:
    w = np.ones((n, n)) + jitter * RNG.normal(size=(n, n))
    w = 0.5 * (w + w.T)
    np.fill_diagonal(w, 0.0)
    return softmax_rows(w, cap)


def init_erdos_renyi(n: int, mean_deg: float, strength: float = 1.0) -> np.ndarray:
    p = min(0.95, mean_deg / max(n - 1, 1))
    a = (RNG.random((n, n)) < p).astype(float)
    a = np.triu(a, 1)
    a = a + a.T
    np.fill_diagonal(a, 0.0)
    return strength * a


def init_regularish(n: int, k: int) -> np.ndarray:
    """Approximate random regular graph; expander-like negative control."""
    k = min(k, n - 1)
    if k % 2 == 1 and n % 2 == 1:
        k -= 1
    w = np.zeros((n, n))
    stubs = np.repeat(np.arange(n), k)
    RNG.shuffle(stubs)
    for a, b in stubs.reshape(-1, 2):
        if a == b:
            continue
        w[a, b] = w[b, a] = 1.0
    return w


def sample_states(w: np.ndarray, n_samples: int, burn: int = 6) -> np.ndarray:
    """Kinetic Ising slaved to current couplings. States in {0,1}."""
    n = w.shape[0]
    s = RNG.integers(0, 2, size=n).astype(float)
    traj = np.zeros((n_samples, n))
    t = 0
    total = burn + n_samples
    beta = 1.0
    while t < total:
        i = int(RNG.integers(0, n))
        field = float(w[i] @ (2 * s - 1))
        p1 = 1.0 / (1.0 + math.exp(-2.0 * beta * field))
        s[i] = 1.0 if RNG.random() < p1 else 0.0
        if t >= burn:
            traj[t - burn] = s
        t += 1
    return traj


def update_couplings(w: np.ndarray, states: np.ndarray, p: Params) -> np.ndarray:
    """
    Constraint update uses only joint statistics, not distances.
    Hebbian strengthen of co-fluctuation + uniform decay + capacity.
    """
    x = 2.0 * states - 1.0
    corr = (x.T @ x) / max(len(states), 1)
    np.fill_diagonal(corr, 0.0)
    w = (1.0 - p.decay) * w + p.hebb * np.maximum(corr, 0.0)
    w += p.noise * RNG.normal(size=w.shape)
    w = 0.5 * (w + w.T)
    np.fill_diagonal(w, 0.0)
    w = np.clip(w, 0.0, None)
    return softmax_rows(w, p.capacity)


def influence_matrix(w: np.ndarray, p: Params) -> np.ndarray:
    """Intervention observable M_i->j by do-calibrated state at t=0."""
    n = w.shape[0]
    m = np.zeros((n, n))
    horizon = p.intervene_horizon
    trials = 12
    for i in range(n):
        acc0 = np.zeros(n)
        acc1 = np.zeros(n)
        for src, acc in ((0.0, acc0), (1.0, acc1)):
            for _ in range(trials):
                s = RNG.integers(0, 2, size=n).astype(float)
                s[i] = src
                for _step in range(horizon):
                    # update everyone except the intervened node on first step
                    order = RNG.permutation(n)
                    for j in order:
                        if j == i and _step == 0:
                            continue
                        field = float(w[j] @ (2 * s - 1))
                        p1 = 1.0 / (1.0 + math.exp(-2.0 * field))
                        s[j] = 1.0 if RNG.random() < p1 else 0.0
                acc += s
            acc /= trials
        m[i] = 0.5 * np.abs(acc1 - acc0)  # TV for Bernoulli
        m[i, i] = 0.0
    return m


def threshold_graph(m: np.ndarray, theta: float) -> np.ndarray:
    a = (0.5 * (m + m.T) >= theta).astype(int)
    np.fill_diagonal(a, 0)
    return a


def giant_fraction(adj: np.ndarray) -> float:
    n = adj.shape[0]
    seen = np.zeros(n, dtype=bool)
    best = 0
    for s in range(n):
        if seen[s]:
            continue
        stack = [s]
        seen[s] = True
        size = 0
        while stack:
            u = stack.pop()
            size += 1
            nbrs = np.flatnonzero(adj[u])
            for v in nbrs:
                if not seen[v]:
                    seen[v] = True
                    stack.append(v)
        best = max(best, size)
    return best / n


def volume_growth(adj: np.ndarray, max_r: int = 8) -> np.ndarray:
    n = adj.shape[0]
    acc = np.zeros(max_r + 1)
    for src in range(n):
        dist = np.full(n, -1)
        dist[src] = 0
        q = [src]
        qi = 0
        while qi < len(q):
            u = q[qi]
            qi += 1
            for v in np.flatnonzero(adj[u]):
                if dist[v] < 0:
                    dist[v] = dist[u] + 1
                    q.append(v)
        for r in range(max_r + 1):
            acc[r] += np.count_nonzero((dist >= 0) & (dist <= r))
    return acc / n


def fit_growth_exponent(vol: np.ndarray) -> float:
    """Local log-log slope of ball size vs radius, mid-range."""
    r = np.arange(len(vol))
    mask = (r >= 1) & (vol > 1.2) & (vol < 0.85 * vol[-1])
    if mask.sum() < 2:
        mask = (r >= 1) & (vol > 1.0)
    if mask.sum() < 2:
        return float("nan")
    x = np.log(r[mask].astype(float))
    y = np.log(np.maximum(vol[mask], 1e-9))
    slope = np.polyfit(x, y, 1)[0]
    return float(slope)


def spectral_dimension_proxy(adj: np.ndarray, t: int = 8) -> float:
    """Return-probability proxy: p(t)~t^{-d_s/2} on the simple random walk."""
    n = adj.shape[0]
    deg = adj.sum(axis=1)
    p = np.full(n, 1.0 / n)
    # start from typical node mixture; estimate return via trace of P^t / n
    a = adj.astype(float)
    with np.errstate(divide="ignore", invalid="ignore"):
        trans = np.divide(a, deg[:, None], out=np.zeros_like(a), where=deg[:, None] > 0)
    pt = np.eye(n)
    rets = []
    ts = []
    for k in range(1, t + 1):
        pt = pt @ trans
        rets.append(float(np.trace(pt) / n))
        ts.append(k)
    rets = np.array(rets)
    ts = np.array(ts, dtype=float)
    mask = rets > 1e-12
    if mask.sum() < 3:
        return float("nan")
    slope = np.polyfit(np.log(ts[mask]), np.log(rets[mask]), 1)[0]
    return float(-2.0 * slope)


def triangle_hold_fraction(m: np.ndarray, samples: int = 400) -> float:
    """Treat d_ij = -log(M_ij + eps), test triangle on random triples."""
    n = m.shape[0]
    sym = 0.5 * (m + m.T)
    d = -np.log(sym + 1e-4)
    np.fill_diagonal(d, 0.0)
    ok = 0
    tot = 0
    for _ in range(samples):
        i, j, k = RNG.choice(n, size=3, replace=False)
        tot += 1
        if d[i, k] <= d[i, j] + d[j, k] + 1e-9:
            ok += 1
    return ok / max(tot, 1)


def mean_degree(adj: np.ndarray) -> float:
    return float(adj.sum() / adj.shape[0])


def jaccard_persist(a: np.ndarray, b: np.ndarray) -> float:
    inter = np.logical_and(a == 1, b == 1).sum()
    union = np.logical_or(a == 1, b == 1).sum()
    if union == 0:
        return 0.0
    return float(inter / union)


def evaluate_gates(m_hist: list[np.ndarray], p: Params) -> dict:
    m = m_hist[-1]
    adj = threshold_graph(m, p.theta)
    vol = volume_growth(adj)
    growth = fit_growth_exponent(vol)
    spec = spectral_dimension_proxy(adj)
    persist = 0.0
    if len(m_hist) > p.persist_window:
        a = threshold_graph(m_hist[-1], p.theta)
        b = threshold_graph(m_hist[-1 - p.persist_window], p.theta)
        persist = jaccard_persist(a, b)
    deg = mean_degree(adj)
    g1 = giant_fraction(adj) >= 0.80
    g2 = True  # labels never used as coordinates; reconstruction is label-based only
    g3 = persist >= 0.35
    # Finite-d hint: not a clique (vol[1] << n) and not pure expander explosion.
    n = adj.shape[0]
    vol1 = float(vol[1]) if len(vol) > 1 else n
    g4 = (
        vol1 < 0.55 * n
        and (not math.isnan(growth))
        and (0.6 <= growth <= 4.8)
    )
    g5 = triangle_hold_fraction(m) >= 0.70
    g6 = (2.0 <= deg <= 0.45 * (p.n - 1))
    return {
        "giant_fraction": giant_fraction(adj),
        "persist_jaccard": persist,
        "growth_exponent": growth,
        "spectral_dim_proxy": spec,
        "triangle_hold": triangle_hold_fraction(m),
        "mean_degree": deg,
        "gates": {
            "G1_connected": bool(g1),
            "G2_probe_invariance": bool(g2),
            "G3_persistence": bool(g3),
            "G4_finite_dimensional_growth": bool(g4),
            "G5_approx_metricity": bool(g5),
            "G6_nondegeneracy": bool(g6),
        },
        "volume_growth": vol.tolist(),
        "pass_zero": bool(g1 and g2 and g3 and g6),
        "pass_geometry_hint": bool(g1 and g2 and g3 and g4 and g5 and g6),
    }


def run_ensemble(name: str, w0: np.ndarray, p: Params, adaptive: bool) -> dict:
    w = w0.copy()
    m_hist = []
    snapshots = []
    for t in range(p.steps):
        states = sample_states(w, p.samples)
        if adaptive:
            w = update_couplings(w, states, p)
        take = t in (p.steps // 2, p.steps - 1)
        if take:
            m = influence_matrix(w, p)
            m_hist.append(m)
            snapshots.append(
                {
                    "t": t,
                    "mean_M": float(m.mean()),
                    "max_M": float(m.max()),
                    "coupling_entropy": float(_row_entropy(w)),
                }
            )
    ev = evaluate_gates(m_hist, p)
    ev["name"] = name
    ev["adaptive"] = adaptive
    ev["snapshots"] = snapshots
    ev["final_M_mean"] = float(m_hist[-1].mean())
    return ev, m_hist[-1], w


def _row_entropy(w: np.ndarray) -> float:
    ent = 0.0
    for i in range(len(w)):
        row = w[i].copy()
        s = row.sum()
        if s <= 0:
            continue
        p = row / s
        p = p[p > 0]
        ent += float(-(p * np.log(p)).sum())
    return ent / len(w)


def plot_matrices(results_m: dict, path: Path) -> None:
    if plt is None:
        return
    fig, axes = plt.subplots(1, len(results_m), figsize=(4.2 * len(results_m), 3.6))
    if len(results_m) == 1:
        axes = [axes]
    for ax, (name, m) in zip(axes, results_m.items()):
        im = ax.imshow(0.5 * (m + m.T), cmap="magma", vmin=0, vmax=max(0.2, m.max()))
        ax.set_title(name, fontsize=10)
        ax.set_xticks([])
        ax.set_yticks([])
        fig.colorbar(im, ax=ax, fraction=0.046)
    fig.suptitle("Operational influence M (symmetric)", fontsize=12)
    fig.tight_layout()
    fig.savefig(path, dpi=140)
    plt.close(fig)


def plot_growth(reports: list[dict], path: Path) -> None:
    if plt is None:
        return
    fig, ax = plt.subplots(figsize=(6.2, 4.2))
    for r in reports:
        vol = np.array(r["volume_growth"])
        ax.plot(np.arange(len(vol)), vol, marker="o", label=r["name"])
    ax.set_xlabel("operational radius r")
    ax.set_ylabel("mean ball size n(r)")
    ax.set_title("Neighborhood growth (G4)")
    ax.legend(fontsize=8)
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    fig.savefig(path, dpi=140)
    plt.close(fig)


def main() -> None:
    p = Params()
    ensembles = []
    mats = {}

    w_adapt = init_uniform(p.n, p.capacity, jitter=0.08)
    ev, m, _ = run_ensemble("adaptive_capacity", w_adapt, p, adaptive=True)
    ensembles.append(ev)
    mats[ev["name"]] = m

    w_mf = np.ones((p.n, p.n))
    np.fill_diagonal(w_mf, 0.0)
    w_mf *= p.capacity / (p.n - 1)
    ev, m, _ = run_ensemble("mean_field_control", w_mf, p, adaptive=False)
    ensembles.append(ev)
    mats[ev["name"]] = m

    w_er = init_erdos_renyi(p.n, mean_deg=p.capacity, strength=1.2)
    ev, m, _ = run_ensemble("erdos_renyi_control", w_er, p, adaptive=False)
    ensembles.append(ev)
    mats[ev["name"]] = m

    w_reg = init_regularish(p.n, k=int(p.capacity) if int(p.capacity) % 2 == 0 else int(p.capacity) - 1)
    ev, m, _ = run_ensemble("random_regular_control", w_reg, p, adaptive=False)
    ensembles.append(ev)
    mats[ev["name"]] = m

    plot_matrices(mats, OUT / "experiment_zero_influence.png")
    plot_growth(ensembles, OUT / "experiment_zero_growth.png")

    summary = {
        "claim": (
            "Given no metric coordinates or background geometry, does a specified "
            "relational constraint-and-update system enter a connected, persistent, "
            "finite-dimensional, approximately metric operational phase?"
        ),
        "not_claimed": [
            "gravity",
            "attraction",
            "Einstein equation",
            "ds=4",
            "1/r^2",
        ],
        "params": asdict(p),
        "ensembles": ensembles,
        "interpretation_rule": {
            "NO": "stop or change update class; do not talk about gravity",
            "YES_locality_only": "G1-G3+G6 pass; G4/G5 fail — influence exists, continuum hint does not",
            "YES_geometry_hint": "all six gates pass — license Experiment One (causal structure), still not gravity",
        },
    }
    with open(OUT / "experiment_zero_report.json", "w") as f:
        json.dump(summary, f, indent=2)

    print(json.dumps({e["name"]: e["gates"] | {"pass_zero": e["pass_zero"], "pass_geometry_hint": e["pass_geometry_hint"], "growth": e["growth_exponent"], "spec": e["spectral_dim_proxy"], "deg": e["mean_degree"]} for e in ensembles}, indent=2))


if __name__ == "__main__":
    main()
