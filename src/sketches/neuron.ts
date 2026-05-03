import type p5 from "p5";

interface Node { x: number; y: number; r: number; phase: number; }
interface Edge { a: number; b: number; }

export default function neuron(p: p5) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let pulses: { e: number; t: number }[] = [];

  function build() {
    nodes.length = 0; edges.length = 0;
    const N = 26;
    for (let i = 0; i < N; i++) {
      nodes.push({
        x: Math.random() * p.width,
        y: Math.random() * p.height,
        r: 2 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
      });
    }
    for (let i = 0; i < N; i++) {
      const dists = nodes.map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
        .filter(o => o.j !== i).sort((a, b) => a.d - b.d).slice(0, 3);
      for (const { j } of dists) {
        if (!edges.some(e => (e.a === i && e.b === j) || (e.a === j && e.b === i)))
          edges.push({ a: i, b: j });
      }
    }
  }

  p.setup = () => {
    const parent = (p as any)._userNode as HTMLElement | undefined;
    const w = parent?.clientWidth ?? p.windowWidth;
    const h = parent?.clientHeight ?? 360;
    p.createCanvas(w, h);
    build();
  };
  p.windowResized = () => {
    const parent = (p as any)._userNode as HTMLElement | undefined;
    const w = parent?.clientWidth ?? p.windowWidth;
    const h = parent?.clientHeight ?? 360;
    p.resizeCanvas(w, h);
    build();
  };

  p.mouseMoved = () => {
    const mx = p.mouseX, my = p.mouseY;
    let best = -1, bd = 40;
    nodes.forEach((n, i) => {
      const d = Math.hypot(n.x - mx, n.y - my);
      if (d < bd) { bd = d; best = i; }
    });
    if (best >= 0) {
      edges.forEach((e, i) => {
        if (e.a === best || e.b === best) pulses.push({ e: i, t: 0 });
      });
    }
  };

  p.draw = () => {
    p.clear();
    p.stroke(15, 15, 15, 35);
    p.strokeWeight(1);
    for (const e of edges) {
      const a = nodes[e.a], b = nodes[e.b];
      p.line(a.x, a.y, b.x, b.y);
    }

    pulses = pulses.filter(pl => {
      pl.t += 0.025;
      const e = edges[pl.e]; const a = nodes[e.a], b = nodes[e.b];
      const x = a.x + (b.x - a.x) * pl.t;
      const y = a.y + (b.y - a.y) * pl.t;
      p.noStroke();
      p.fill(31, 170, 89, 220);
      p.circle(x, y, 4);
      return pl.t < 1;
    });

    p.noStroke();
    for (const n of nodes) {
      n.phase += 0.02;
      const pulse = 0.5 + 0.5 * Math.sin(n.phase);
      p.fill(15, 15, 15, 120 + pulse * 60);
      p.circle(n.x, n.y, n.r * 2);
    }
  };
}
