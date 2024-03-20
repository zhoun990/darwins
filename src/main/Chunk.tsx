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
  temperature = 0;
  /**日照により得られる温度の最大値 */
  sunlight = N.random(0, N.random(0, 50));
  /**標高1地点における平均温度 */
  geothermal = N.random(N.random(-50, 0), N.random(0, 400));
  /**エリア体積に対する水分割合 */
  water = N.random(0, N.random(0, 100));
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
    if (!initial.temperature) {
      this.temperature = this.get_target_temperature();
    }
  }
  tick() {
    if (DarwinManager.pause) return;
    if (this.last_tick_timestamp + this.delta > DarwinManager.last_ticker_timestamp)
      return;
    this.last_tick_timestamp = DarwinManager.last_ticker_timestamp;
    try {
      this.frame++;
      this.darwins = DarwinManager.getDarwinsFromArea({
        x: this.x * Chunk.size,
        y: this.y * Chunk.size,
        w: Chunk.size,
        h: Chunk.size,
      });
      this.sunlight = mx(0, mn(100, this.sunlight + N.random(-100, 100) / 1000));
      this.temperature = (this.get_target_temperature() + this.temperature * 3) / 4;

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
        this.temperature = (this.temperature * 5 + target.temperature) / 6;
        // this.oxygen = (this.oxygen + target.oxygen) / 2;
        // this.carbon_dioxide = (this.carbon_dioxide + target.carbon_dioxide) / 2;
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
  get_target_temperature() {
    let temp = this.geothermal / Math.sqrt(this.elevation + 10);
    let season_effect = DarwinManager.getSeason();
    if (season_effect === 3) season_effect = 1;
    temp += this.sunlight / (3 - season_effect);
    temp -= temp * (this.water / 100);

    return temp;
  }
}
