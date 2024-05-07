import { N } from "./NumericUtils";
import { Darwin } from "./Darwin";
import { Chunk } from "./Chunk";
import { getObjectKeys } from "./utils";
import { Accessor, Signal, createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
export class DarwinManager {
  private static instance: DarwinManager;
  static tickerId: number; //NodeJS.Timeout;
  chunks: Chunk[] = [];
  static width = 500;
  static height = 500;
  static max_pop = 1000;
  private static cache: Record<string, any> = {};
  chunk_size = { w: 10, h: 10 };
  darwins: Darwin[] = [];
  frame = 0;
  pop = 0;
  birth_rate = 1;
  birth = [0];
  death = [0];
  delta = 100; //ms
  last_tick_timestamp = 0;
  static last_ticker_timestamp = 0;
  ticker_rate = 0;
  started_at = Date.now();

  static get pause() {
    return this.signal().pause;
  }
  static set pause(bool: boolean) {
    if (this.instance) {
      this.instance.pause = bool;
      this.instance.onUpdate();
      // const [getter, setter] = DarwinManager._signal;
      // setter((pv) => ({ ...pv, pause: bool } as Exclude<DarwinManager, Function>));
    }
  }
  pause = true;
  static _signal: Signal<Exclude<DarwinManager, Function>>;
  static get signal() {
    return this._signal?.[0];
  }
  private onUpdate(msg?: string) {
    const [getter, setter] = DarwinManager._signal;
    // console.log(
    //   "^_^ ::: file: DarwinManager.tsx:51 ::: msg:\n",
    //   msg,
    //   this.darwins.length
    // );
    performance.mark("onUpdate-1-" + this.frame);
    const instance = { ...this };
    performance.mark("onUpdate-2-" + this.frame);

    // if (this.darwins.length === 1000) {
    //   console.log(this);
    // }
    setTimeout(() => {
      setter(instance as Exclude<this, Function>);
    }, 0);
    performance.mark("onUpdate-3-" + this.frame);

    performance.measure(
      "pfm-onUpdate-measure-" + this.frame,
      "onUpdate-1-" + this.frame,
      "onUpdate-2-" + this.frame
    );
    performance.measure(
      "pfm-onUpdate-measure-" + this.frame,
      "onUpdate-2-" + this.frame,
      "onUpdate-3-" + this.frame
    );
    const results = performance.getEntriesByName("pfm-onUpdate-measure-" + this.frame);
    // console.log(
    //   "処理時間 : " + results[0].duration + "ミリ秒,onUpdate-" + this.frame,
    //   "\n処理時間 : " + results[1].duration + "ミリ秒,onUpdate-" + this.frame
    // );
  }
  static onEnd = () => {};
  static onInstanceReplace = (self: DarwinManager) => {};
  constructor(
    public initial_darwin_count: number,
    load?: DarwinManager,
    auto_start?: boolean
  ) {
    console.log("^_^ ::: file: DarwinManager.tsx:40 ::: load:\n", load);
    cancelAnimationFrame(DarwinManager.tickerId);
    // clearTimeout(DarwinManager.tickerId);
    DarwinManager.instance = this;
    if (DarwinManager._signal) {
    } else
      DarwinManager._signal = createSignal({ ...this } as Exclude<
        DarwinManager,
        Function
      >);
    DarwinManager.onInstanceReplace(this);
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
    this.started_at = Date.now();
    this.onUpdate("2");
    console.log(
      "^_^ ::: file: DarwinManager.tsx:116 ::: getter().darwins.length:\n",
      DarwinManager._signal[0]().darwins.length
    );
    if (auto_start) {
      this.pause = false;
      this.ticker();
    }
  }
  ticker() {
    if (this.pause) return;
    const f = this.frame;
    DarwinManager.last_ticker_timestamp = Date.now();

    // performance.mark("ticker-" + f);
    this.tick(f);
    this.darwins.forEach((dw) => dw.tick());
    this.chunks.forEach((ch) => ch.tick());
    this.ticker_rate = Date.now() - DarwinManager.last_ticker_timestamp;
    // performance.measure(
    //   //
    //   "pfm-ticker-measure-" + f, // バッファの名前を指定してあげる
    //   "ticker-" + f // 開始点（１）
    // );
    // const results = performance.getEntriesByName("pfm-ticker-measure-" + f); // バッファの名前から結果を取得（１）～（２）
    // console.log("処理時間 : " + results[0].duration + "ミリ秒,ticker-" + f); // （１）～（２）
    DarwinManager.tickerId = requestAnimationFrame(() => {
      this.ticker();
    });
    // requestAnimationFrame(self.ticker);
  }
  tick(f?: number) {
    if (this.pause) return false;
    if (this.last_tick_timestamp + this.delta > DarwinManager.last_ticker_timestamp)
      return false;
    // performance.mark("tick-p1-" + this.frame);

    this.last_tick_timestamp = Date.now();

    try {
      // performance.mark("tick-p2-" + this.frame);

      const pop = this.darwins.length;
      this.darwins = this.darwins.filter((dw) => dw.hp > 0);
      this.pop = this.darwins.length;
      this.death.push(pop - this.pop);
      this.birth.push(0);
      this.birth_rate =
        Math.max(
          1,
          this.birth.reduce((pv, v) => pv + v, 0)
        ) /
        Math.max(
          1,
          this.death.reduce((pv, v) => pv + v, 0)
        );
      // performance.mark("tick-p3-" + this.frame);

      if (this.birth.length > 10) {
        this.birth.shift();
        // console.log("^_^ ::: file: DarwinManager.tsx:191 ::: this.birth:\n", this.birth);
      }
      if (this.death.length > 10) {
        this.death.shift();
        // console.log("^_^ ::: file: DarwinManager.tsx:195 ::: this.death:\n", this.death);
      }
      if (this.pop === 0) {
        this.pause = true;
        // console.log("^_^ ::: file: DarwinManager.tsx:114 ::: this.pause :\n", this.pause);
        setTimeout(DarwinManager.onEnd, 100);
      }
    } catch (error) {
      console.error("^_^ Log \n file: DarwinManager.tsx:70 \n error:", error);
    }
    // performance.mark("tick-p4-" + this.frame);
    this.onUpdate(
      (f === this.frame ? "true" : "false") + " f1:" + this.frame + " f2:" + f
    );
    // performance.mark("tick-p5-" + this.frame);

    // performance.measure("pfm-measure-" + this.frame, "tick-p1-" + this.frame);
    // performance.measure(
    //   "pfm-measure-" + this.frame,
    //   "tick-p1-" + this.frame,
    //   "tick-p2-" + this.frame
    // );
    // performance.measure(
    //   //
    //   "pfm-measure-" + this.frame,
    //   "tick-p2-" + this.frame,
    //   "tick-p3-" + this.frame
    // );
    // performance.measure(
    //   //
    //   "pfm-measure-" + this.frame,
    //   "tick-p3-" + this.frame,
    //   "tick-p4-" + this.frame
    // );
    // performance.measure(
    //   //
    //   "pfm-measure-" + this.frame,
    //   "tick-p4-" + this.frame,
    //   "tick-p5-" + this.frame
    // );
    // performance.measure(
    //   //
    //   "pfm-measure-" + this.frame,
    //   "tick-p5-" + this.frame
    // );
    // const results = performance.getEntriesByName("pfm-measure-" + this.frame);
    // console.log(
    //   "処理時間 : " + results[0].duration + "ミリ秒,tick-" + this.frame,
    //   "\n処理時間 : " + results[1].duration + "ミリ秒,tick-" + this.frame,
    //   "\n処理時間 : " + results[2].duration + "ミリ秒,tick-" + this.frame,
    //   "\n処理時間 : " + results[3].duration + "ミリ秒,tick-" + this.frame,
    //   "\n処理時間 : " + results[4].duration + "ミリ秒,tick-" + this.frame,
    //   "\n処理時間 : " + results[5].duration + "ミリ秒,tick-" + this.frame
    // );
    this.frame++;
    return true;
  }
  /**0=>冬
   * 1=>春
   * 2=>夏
   * 3=>秋
   */
  static getSeason() {
    return Math.floor(this.instance.frame / 100) % 4;
  }
  static getSeasonSignal() {
    return createMemo(() => Math.floor(this.signal?.()?.frame / 100) % 4);
  }
  static born(a: Darwin, b: Darwin) {
    if (a.gender === b.gender || this.instance.darwins.length >= this.max_pop) return;
    const gender = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1][N.random(0, 10)];
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
        gen: Math.max(a.gen, b.gen) + 1,
        gender,
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        w: mixer(a.w, b.w),
        h: mixer(a.h, b.h),
        sight: mixer(a.sight, b.sight),
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
        spawnbility: gender
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
        escape_direction: mixer(a.escape_direction, b.escape_direction),
        chunk_rating_threshold: mixer(a.chunk_rating_threshold, b.chunk_rating_threshold),
        aggressiveness: mixer(a.aggressiveness, b.aggressiveness),
        foolhardiness: mixer(a.foolhardiness, b.foolhardiness),
        max_stamina: mixer(a.max_stamina, b.max_stamina),
        win_count: 0,
      })
    );
    this.instance.birth[this.instance.birth.length - 1]++;
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
  static getPopSignal() {
    return createMemo(() => this.signal().darwins.length);
    // return createMemo(() => this.instance.signal().darwins.length)();
  }
  static getFoodsSignal() {
    return createMemo(() =>
      this.signal?.()?.chunks.reduce((sum, ch) => sum + ch.foods, 0)
    );
  }
  static getBirthRateSignal() {
    return createMemo(() => this.signal().birth_rate);
  }
  getDarwinFromId(id: string) {
    return this.darwins.find((dw) => dw.id === id);
  }
  static getDarwinFromId(id: string) {
    return this.instance.getDarwinFromId(id);
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
  static setPause(bool: boolean) {
    // console.log("^_^ ::: file: DarwinManager.tsx:259 ::: bool:\n", bool);
    DarwinManager.pause = bool;
    if (!bool) this.instance.ticker();
    // if (!bool) {
    //   this.tick();
    //   this.darwins.forEach((dw) => dw.tick());
    //   this.chunks.forEach((ch) => ch.tick());
    // }
  }
}
