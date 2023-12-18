import { N } from "./NumericUtils";
import { Darwin } from "./Darwin";

export class DarwinManager {
  private static instance: DarwinManager;
  static width = 500;
  static height = 500;
  static max_pop = 500;
  foods = 100;
  darwins: Darwin[] = [];
  frame = 0;
  pop = 0;
  birth_rate = 1;
  birth = 0;
  death = 0;
  private static mixer_cache: Record<string, number> = {};
  static pause = false;
  onUpdate = () => {};
  private constructor(initial_darwin_count: number) {
    DarwinManager.instance = this;

    for (let index = 0; index < initial_darwin_count; index++) {
      this.darwins.push(new Darwin());
    }
    this.tick();
  }
  static getInstance(initial_darwin_count: number) {
    if (DarwinManager.instance) return DarwinManager.instance;
    return new DarwinManager(initial_darwin_count);
  }
  static getPop() {
    return this.instance.darwins.length;
  }
  static getFoods() {
    return this.instance.foods;
  }
  static getBirthRate() {
    return this.instance.birth_rate;
  }
  getDarwinFromId(id: string): Darwin | undefined {
    return this.darwins.filter((dw) => dw.id === id)[0];
  }
  static getDarwinsFromArea(a: { x: number; y: number; w: number; h: number }): Darwin[] {
    function isOverlap(
      a: { x: number; y: number; w: number; h: number },
      b: { x: number; y: number; w: number; h: number }
    ): boolean {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }
    return this.instance.darwins.filter((dw) => isOverlap(a, dw));
  }
  private static getMixerCache(v1: number, v2: number) {
    const name = `${Math.min(v1, v2)}-${Math.max(v1, v2)}`;

    return this.mixer_cache[name];
  }
  private static setMixerCache(v1: number, v2: number, value: number) {
    const name = `${Math.min(v1, v2)}-${Math.max(v1, v2)}`;

    this.mixer_cache[name] = value;
  }
  static born(a: Darwin, b: Darwin) {
    if (a.sex === b.sex || this.getPop() >= this.max_pop) return;
    const mixer = (v1: number, v2: number, difficulty = 100) => {
      const cached = this.getMixerCache(v1, v2);
      if (cached) return cached;
      const dif = Math.abs(v1 - v2);
      const base = N.random(Math.min(v1, v2), Math.max(v1, v2));
      const unit_value = base / difficulty;
      const eff1 = N.random(0, Math.max(2, 5 - dif / difficulty) * 100) / 100;
      const eff2 = N.random(0, Math.max(2, 5 - dif / difficulty) * 100) / 100;
      const effDif = eff1 - eff2;

      const avg = (v1 + v2) / 2;
      const min = avg - avg * 0.1;
      const max = avg + avg * 0.1;
      const result = Math.max(min, Math.min(max, base + unit_value * effDif));
      this.setMixerCache(v1, v2, result);
      return result;
    };
    this.instance.darwins.push(
      new Darwin({
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        w: mixer(a.w, b.w),
        h: mixer(a.h, b.h),
        tall: mixer(a.tall, b.tall),
        weight: mixer(a.weight, b.weight),
        speed: mixer(a.speed, b.speed),
        default_hp: mixer(a.default_hp, b.default_hp),
        delta: mixer(a.delta, b.delta),
        lifetime: mixer(a.lifetime, b.lifetime),
        default_spawn_cooltime: mixer(a.default_spawn_cooltime, b.default_spawn_cooltime),
        initial_spawn_cooltime: mixer(a.initial_spawn_cooltime, b.initial_spawn_cooltime),
        default_spawnable_times: mixer(
          a.default_spawnable_times,
          b.default_spawnable_times
        ),
      })
    );
    this.instance.birth++;
  }
  //return penalty value
  static eat(dw: Darwin) {
    const s = (dw.w * dw.h * dw.tall * (dw.speed / dw.weight)) / 1000;
    this.instance.foods -= s;
    if (this.instance.foods < 0) {
      const p = this.instance.foods;
      this.instance.foods = 0;
      return Math.abs(p);
    }
    return 0;
  }
  tick() {
    if (DarwinManager.pause) return;
    this.frame++;
    const pop = this.darwins.length;
    this.foods += Math.max(0, N.random(90 - pop / 3, 150 - pop));
    this.onUpdate();
    const before = this.darwins.length;
    this.darwins = this.darwins.filter((dw) => dw.hp > 0);
    this.pop = this.darwins.length;
    this.death += before - this.pop;
    this.birth_rate = (this.birth + 1) / (this.death + 1);
    // this.birth = 0;
    if (this.frame % 100 === 0) {
      this.birth /= 2;
      this.death /= 2;
    }
    setTimeout(() => {
      this.tick();
    }, 100);
  }
  static getPopDensity(lowest?: boolean) {
    const distribution = [0, 0, 0, 0];
    this.instance.darwins.forEach((dw, i) => {
      if (i % 2) {
        distribution[dw.getCurrentArea()]++;
      }
    });
    return distribution.indexOf(
      lowest ? Math.min(...distribution) : Math.max(...distribution)
    );
  }
  terminate() {
    console.log("terminated");
    this.darwins.forEach((dw) => dw.kill());
    this.darwins = [];
    this.onUpdate = () => {};
    this.frame = 0;
  }
  setPause(bool: boolean) {
    DarwinManager.pause = bool;
    if (!bool) {
      this.tick();
      this.darwins.forEach((dw) => dw.tick());
    }
  }
}
