import { N } from "./NumericUtils";
import { Darwin } from "./Darwin";
import { Chunk } from "./Chunk";
import { getObjectKeys } from "./utils";
export class DarwinManager {
  private static instance: DarwinManager;
  chunks: Chunk[] = [];
  static width = 500;
  static height = 500;
  static max_pop = 1000;
  chunk_size = { w: 10, h: 10 };
  // foods = 100;
  darwins: Darwin[] = [];
  frame = 0;
  pop = 0;
  birth_rate = 1;
  birth = 0;
  death = 0;
  delta = 100; //ms
  last_tick_timestamp = 0;
  last_ticker_timestamp = 0;
  ticker_rate = 0;
  private static cache: Record<string, any> = {};
  static get pause() {
    return this.instance?.pause;
  }
  static set pause(bool: boolean) {
    console.log("^_^ Log \n file: DarwinManager.tsx:28 \n bool:", bool);
    if (this.instance) this.instance.pause = bool;
  }
  pause = true;

  onUpdate = () => {};
  onEnd = () => {};
  constructor(
    public initial_darwin_count: number,
    load?: DarwinManager,
    auto_start?: boolean
  ) {
    DarwinManager.pause = true;
    DarwinManager.instance = this;
    if (load) {
      getObjectKeys(load).forEach((key) => {
        if (
          Object.prototype.hasOwnProperty.call(this, key) &&
          Object.prototype.hasOwnProperty.call(load, key)
        ) {
          if (key === "darwins") {
            load[key].forEach((dw) => {
              this.darwins.push(new Darwin(dw));
            });
          } else if (key === "chunks") {
            load[key].forEach((ch) => {
              this.chunks.push(new Chunk(ch));
            });
          } else if (typeof load[key] !== "function") {
            //@ts-expect-error
            this[key] = load[key];
          }
        }
      });
    } else {
      for (let y = 0; y < this.chunk_size.h; y++) {
        for (let x = 0; x < this.chunk_size.w; x++) {
          this.chunks.push(new Chunk({ x, y }));
        }
      }
      DarwinManager.width = this.chunk_size.w * Chunk.size;
      DarwinManager.height = this.chunk_size.h * Chunk.size;
      for (let index = 0; index < initial_darwin_count; index++) {
        this.darwins.push(new Darwin());
      }
    }
    if (auto_start) {
      this.pause = false;
      this.ticker();
    }
  }
  ticker() {
    if (this.pause ) return;
    this.last_ticker_timestamp = Date.now();
    this.tick();
    this.darwins.forEach((dw) => dw.tick());
    this.chunks.forEach((ch) => ch.tick());
    this.ticker_rate = Date.now() - this.last_ticker_timestamp;
    setTimeout(() => {
      this.ticker();
    }, 0);
  }
  tick() {
    if (DarwinManager.pause) return;
    if (this.last_tick_timestamp + this.delta > Date.now()) return;
    this.last_tick_timestamp = Date.now();
    this.frame++;
    try {
      const pop = this.darwins.length;
      // this.foods += Math.max(0, N.random(90 - pop / 3, 150 - pop));
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
      if (this.darwins.length === 0) {
        DarwinManager.pause = true;
        this.onEnd();
      }
    } catch (error) {
      console.error("^_^ Log \n file: DarwinManager.tsx:70 \n error:", error);
    }
    this.onUpdate();
  }
  static born(a: Darwin, b: Darwin) {
    if (a.sex === b.sex || this.getPop() >= this.max_pop) return;
    const sex = N.random(0, 1);
    const mixer = (v1: number, v2: number, difficulty = 100) => {
      // const cached = this.getMixerCache(v1, v2);
      // if (cached) return cached;
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
      // this.setMixerCache(v1, v2, result);
      return result;
    };
    this.instance.darwins.push(
      new Darwin({
        sex,
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
        dsdt: mixer(a.dsdt, b.dsdt),
        optimal_temperature: mixer(a.optimal_temperature, b.optimal_temperature),
        body_temperature: mixer(a.body_temperature, b.body_temperature),
        spawnbility: sex
          ? [
              a.spawnbility + 1,
              b.spawnbility + 1,
              a.spawnbility,
              b.spawnbility,
              1,
              1,
              1,
              1,
              1,
              1,
            ][N.random(0, 9)]
          : 0,
      })
    );
    this.instance.birth++;
  }
  static eat(dw: Darwin) {
    const ch = this.getChunkFromPos(dw);
    ch?.eat(dw);
  }
  static getChunk(x: number, y: number) {
    return this.instance.chunks.find((ch) => ch.x === x && ch.y === y);
  }
  static getChunkFromPos({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
    return this.getChunk(
      Math.round((x + w / 2) / Chunk.size),
      Math.round((y + h / 2) / Chunk.size)
    );
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
  static getPop() {
    return this.instance.darwins.length;
  }
  static getFoods() {
    return this.instance.chunks.reduce((sum, ch) => sum + ch.foods, 0);
  }
  static getBirthRate() {
    return this.instance.birth_rate;
  }
  getDarwinFromId(id: string): Darwin | undefined {
    return this.darwins.filter((dw) => dw.id === id)[0];
  }
  static getDarwinsFromArea(a: { x: number; y: number; w: number; h: number }): Darwin[] {
    const isOverlap = (
      a: { x: number; y: number; w: number; h: number },
      b: { x: number; y: number; w: number; h: number }
    ): boolean => {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    };
    const result = this.instance.darwins.filter((dw) => isOverlap(a, dw) && dw.hp > 0);
    return result;
  }
  private static getMixerCache(v1: number, v2: number) {
    const name = `mixer-${Math.min(v1, v2)}-${Math.max(v1, v2)}`;

    return this.cache[name];
  }
  private static setMixerCache(v1: number, v2: number, value: number) {
    const name = `mixer-${Math.min(v1, v2)}-${Math.max(v1, v2)}`;

    this.cache[name] = value;
  }

  static getInstance(initial_darwin_count: number) {
    if (DarwinManager.instance) return DarwinManager.instance;
    return new DarwinManager(initial_darwin_count);
  }
  terminate() {
    console.log("terminated");
    // this.darwins.forEach((dw) => dw.kill());
    // this.darwins = [];
    // this.onUpdate = () => {};
    // this.frame = 0;
    DarwinManager.pause = true;
  }
  setPause(bool: boolean) {
    DarwinManager.pause = bool;
    this.ticker();
    // if (!bool) {
    //   this.tick();
    //   this.darwins.forEach((dw) => dw.tick());
    //   this.chunks.forEach((ch) => ch.tick());
    // }
  }
}
