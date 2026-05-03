import type p5 from "p5";

interface Boid {
  x: number; y: number; vx: number; vy: number;
}

export default function boids(p: p5) {
  const N = 90;
  const boids: Boid[] = [];
  const MAX = 2.2;
  const PERCEPTION = 50;

  function init() {
    boids.length = 0;
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      boids.push({
        x: Math.random() * p.width,
        y: Math.random() * p.height,
        vx: Math.cos(a) * MAX,
        vy: Math.sin(a) * MAX,
      });
    }
  }

  p.setup = () => {
    const parent = (p as any)._userNode as HTMLElement | undefined;
    const w = parent?.clientWidth ?? p.windowWidth;
    const h = parent?.clientHeight ?? 460;
    p.createCanvas(w, h);
    init();
  };
  p.windowResized = () => {
    const parent = (p as any)._userNode as HTMLElement | undefined;
    const w = parent?.clientWidth ?? p.windowWidth;
    const h = parent?.clientHeight ?? 460;
    p.resizeCanvas(w, h);
    init();
  };

  function limit(b: Boid) {
    const sp = Math.hypot(b.vx, b.vy);
    if (sp > MAX) { b.vx = (b.vx / sp) * MAX; b.vy = (b.vy / sp) * MAX; }
  }

  p.draw = () => {
    p.clear();
    p.noStroke();
    const mx = p.mouseX, my = p.mouseY;
    const cursorOn = mx >= 0 && mx <= p.width && my >= 0 && my <= p.height;

    for (const b of boids) {
      let ax = 0, ay = 0;
      let cx = 0, cy = 0, cn = 0;
      let sx = 0, sy = 0;
      let avx = 0, avy = 0;

      for (const o of boids) {
        if (o === b) continue;
        const dx = o.x - b.x, dy = o.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < PERCEPTION && d > 0) {
          cx += o.x; cy += o.y;
          avx += o.vx; avy += o.vy;
          if (d < 22) { sx -= dx / d; sy -= dy / d; }
          cn++;
        }
      }
      if (cn > 0) {
        ax += ((cx / cn - b.x) * 0.0009);
        ay += ((cy / cn - b.y) * 0.0009);
        ax += ((avx / cn - b.vx) * 0.04);
        ay += ((avy / cn - b.vy) * 0.04);
        ax += sx * 0.05;
        ay += sy * 0.05;
      }

      if (cursorOn) {
        const dx = mx - b.x, dy = my - b.y;
        const d = Math.hypot(dx, dy);
        if (d < 180) {
          ax += (dx / d) * 0.06;
          ay += (dy / d) * 0.06;
        }
      }

      b.vx += ax; b.vy += ay;
      limit(b);
      b.x += b.vx; b.y += b.vy;
      if (b.x < 0) b.x += p.width; if (b.x > p.width) b.x -= p.width;
      if (b.y < 0) b.y += p.height; if (b.y > p.height) b.y -= p.height;

      const a = Math.atan2(b.vy, b.vx);
      p.push();
      p.translate(b.x, b.y);
      p.rotate(a);
      p.fill(15, 15, 15, 150);
      p.triangle(6, 0, -4, 3, -4, -3);
      p.pop();
    }

    if (cursorOn) {
      p.noFill();
      p.stroke(31, 170, 89, 90);
      p.circle(mx, my, 32);
    }
  };
}
