import { createSignal } from "solid-js";
import { Darwin } from "./Darwin";
import { DarwinManager } from "./DarwinManager";
import { N } from "./NumericUtils";
const mx = Math.max;
const mn = Math.min;
export class Chunk {
  static size = 50;
  frame = 0;
  x = 0;
  y = 0;
  w = Chunk.size;
  h = Chunk.size;
  elevation = N.random(1, N.random(1, 50));
  temperature = N.random(N.random(-40, 0), N.random(0, 40));
  sunlight = N.random(0, N.random(0, 100));
  water = N.random(0, N.random(0, 100));
  oxygen = N.random(0, N.random(0, 100));
  carbon_dioxide = N.random(0, N.random(0, 100));
  foods = N.random(500, 1500);
  darwins: Darwin[] = [];
  delta = 1000; //ms
  last_tick_timestamp = 0;
  // signal = createSignal(this);
  // get props() {
  //   return this.signal[0]();
  // }
  // private onUpdate() {
  //   const [getter, setter] = this.signal;
  //   const instance = this;
  //   setter(() => instance);
  // }
  constructor(initial: {
    x: number;
    y: number;
    temperature?: number;
    sunlight?: number;
    water?: number;
    oxygen?: number;
    carbon_dioxide?: number;
    elevation?: number;
  }) {
    for (const key in initial) {
      if (
        Object.prototype.hasOwnProperty.call(this, key) &&
        Object.prototype.hasOwnProperty.call(initial, key)
      ) {
        //@ts-expect-error
        this[key] = initial[key];
      }
    }
  }
  tick() {
    if (DarwinManager.pause) return;
    if (this.last_tick_timestamp + this.delta > Date.now()) return;
    this.last_tick_timestamp = Date.now();
    try {
      this.frame++;
      this.darwins = DarwinManager.getDarwinsFromArea({
        x: this.x * Chunk.size,
        y: this.y * Chunk.size,
        w: Chunk.size,
        h: Chunk.size,
      });
      this.sunlight += N.random(-100, 100) / 100;
      this.temperature = mx(
        -40,
        mn(40, (this.temperature + this.sunlight * (this.sunlight / this.water)) / 4)
      );

      const addFoods =
        (this.sunlight *
          (mx(1, mn(this.sunlight, this.water)) / mx(1, this.sunlight, this.water)) *
          this.temperature *
          10) /
        mx(1, Math.floor(this.elevation / 10));
      this.foods += addFoods / Math.max(1, this.foods - addFoods);
      const connectedChunks = [
        DarwinManager.getChunk(this.x - 1, this.y)!,
        DarwinManager.getChunk(this.x + 1, this.y)!,
        DarwinManager.getChunk(this.x, this.y - 1)!,
        DarwinManager.getChunk(this.x, this.y + 1)!,
      ].filter((ch) => ch);
      connectedChunks.forEach((target) => {
        this.temperature = (this.temperature + target.temperature) / 2;
        this.oxygen = (this.oxygen + target.oxygen) / 2;
        this.carbon_dioxide = (this.carbon_dioxide + target.carbon_dioxide) / 2;
      });
    } catch (error) {
      console.error("^_^ Log \n file: Chunk.tsx:77 \n error:", error);
    }
  }
  eat(dw: Darwin) {
    const s = (dw.w * dw.h * dw.tall * (dw.speed / dw.weight)) / 1000;
    this.foods -= s;
    if (this.foods < 0) {
      const p = this.foods;
      this.foods = 0;
      dw.penalty = Math.abs(p) * (this.darwins.length / 2);
    }
  }
}
