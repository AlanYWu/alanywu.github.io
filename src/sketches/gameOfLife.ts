import type p5 from "p5";

export default function gameOfLife(p: p5) {
  const CELL = 14;
  let cols = 0, rows = 0;
  let grid: Uint8Array, next: Uint8Array;
  let mouseCell = { x: -1, y: -1 };
  const stepEvery = 6;
  let frame = 0;

  const POP_WINDOW = 18;
  const popHistory: number[] = [];
  let stepsSinceInjection = 0;

  const idx = (x: number, y: number) => ((x + cols) % cols) + ((y + rows) % rows) * cols;

  function seed() {
    for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.18 ? 1 : 0;
    popHistory.length = 0;
    stepsSinceInjection = 0;
  }

  // 8 orientations of a glider, encoded as relative cells
  const GLIDERS: ReadonlyArray<ReadonlyArray<[number, number]>> = [
    [[1,0],[2,1],[0,2],[1,2],[2,2]],
    [[0,1],[1,2],[0,0],[1,0],[2,0]],
    [[1,2],[0,1],[2,0],[1,0],[0,0]],
    [[2,1],[1,0],[0,2],[1,2],[2,2]],
    [[0,0],[2,1],[0,1],[1,2],[2,2]],
    [[2,0],[0,1],[2,1],[1,2],[0,2]],
    [[2,2],[0,1],[2,1],[1,0],[0,0]],
    [[0,2],[2,1],[0,1],[1,0],[2,0]],
  ];

  function injectGlider() {
    const g = GLIDERS[Math.floor(Math.random() * GLIDERS.length)];
    const x0 = Math.floor(Math.random() * cols);
    const y0 = Math.floor(Math.random() * rows);
    for (const [dx, dy] of g) grid[idx(x0 + dx, y0 + dy)] = 1;
    stepsSinceInjection = 0;
  }

  function injectRandomCells(count: number) {
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      grid[idx(x, y)] = 1;
    }
    stepsSinceInjection = 0;
  }

  p.setup = () => {
    const parent = (p as any)._userNode as HTMLElement | undefined;
    const w = parent?.clientWidth ?? p.windowWidth;
    const h = parent?.clientHeight ?? 420;
    p.createCanvas(w, h);
    p.noStroke();
    cols = Math.ceil(w / CELL);
    rows = Math.ceil(h / CELL);
    grid = new Uint8Array(cols * rows);
    next = new Uint8Array(cols * rows);
    seed();
  };

  p.windowResized = () => {
    const parent = (p as any)._userNode as HTMLElement | undefined;
    const w = parent?.clientWidth ?? p.windowWidth;
    const h = parent?.clientHeight ?? 420;
    p.resizeCanvas(w, h);
    cols = Math.ceil(w / CELL);
    rows = Math.ceil(h / CELL);
    grid = new Uint8Array(cols * rows);
    next = new Uint8Array(cols * rows);
    seed();
  };

  p.mouseMoved = () => {
    mouseCell.x = Math.floor(p.mouseX / CELL);
    mouseCell.y = Math.floor(p.mouseY / CELL);
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++) {
        const i = idx(mouseCell.x + dx, mouseCell.y + dy);
        if (Math.random() < 0.4) grid[i] = 1;
      }
  };

  function step() {
    let pop = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let n = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            n += grid[idx(x + dx, y + dy)];
          }
        const i = idx(x, y);
        const alive = grid[i] ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
        next[i] = alive;
        pop += alive;
      }
    }
    [grid, next] = [next, grid];

    popHistory.push(pop);
    if (popHistory.length > POP_WINDOW) popHistory.shift();
    stepsSinceInjection++;

    if (popHistory.length === POP_WINDOW && stepsSinceInjection > POP_WINDOW) {
      let lo = popHistory[0], hi = popHistory[0];
      for (const v of popHistory) { if (v < lo) lo = v; if (v > hi) hi = v; }
      const stagnant = hi - lo <= 2;
      const sparse = pop < (cols * rows) * 0.02;
      if (stagnant) {
        injectGlider();
        if (sparse) injectRandomCells(Math.floor(cols * rows * 0.04));
      }
    }
  }

  p.draw = () => {
    p.clear();
    if (++frame % stepEvery === 0) step();

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (!grid[idx(x, y)]) continue;
        const dx = x - mouseCell.x, dy = y - mouseCell.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - dist / 8);
        const alpha = 30 + proximity * 110;
        if (proximity > 0.2) p.fill(31, 170, 89, alpha);
        else p.fill(15, 15, 15, alpha);
        p.rect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
      }
    }
  };
}
