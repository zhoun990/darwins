import { N } from "./NumericUtils";
import { DarwinManager } from "./DarwinManager";
import { getObjectKeys } from "./utils";
import { createSignal } from "solid-js";
const direction = (from: number, to: number) => {
  const t = to % 3 === 0 && (from === 1 || from === 2);
  const b = from % 3 === 0 && (to === 1 || to === 2);
  const l = to >= 2 && from <= 1;
  const r = from >= 2 && to <= 1;
  return { t, b, l, r };
};
export class Darwin {
  id = N.generateRandomID(20);

  x = N.random(0, DarwinManager.width);
  y = N.random(0, DarwinManager.height);
  w = N.random(7, 13);
  h = N.random(7, 13);
  sight = N.random(7, 13);
  tall = N.random(7, 13);
  weight = N.random(1, 40) / 10;
  speed = N.random(1, 20) / 10;
  default_hp = N.random(80, 120);
  hp = this.default_hp;
  lifetime = N.random(80, 120); //frame

  sex = N.random(0, 1); //0=male,1=female,2=no-sex
  spawnbility = this.sex; //count of children able to spawn at the same time
  color = this.sex ? "red" : "white";
  default_spawn_cooltime = N.random(7, 13);
  initial_spawn_cooltime = N.random(20, 40);
  rest_spawn_cooltime = this.sex ? this.initial_spawn_cooltime : 0;
  default_spawnable_times = N.random(1, 5);
  rest_spawnable_times = this.sex ? this.default_spawnable_times : 0;
  child_count = 0;
  penalty = 0;
  dsdt = 500; //different_species_determination_threshold
  body_temperature = N.random(10, 40);
  optimal_temperature = N.random(this.body_temperature - 20, this.body_temperature + 10);

  delta = N.random(80, 120); //ms
  frame = 0;
  last_tick_timestamp = 0;

  movement_path = [];
  // signal = createSignal(this);
  // get props() {
  //   return this.signal[0]();
  // }
  // private onUpdate() {
  //   const [getter, setter] = this.signal;
  //   const instance = this;
  //   setter(() => instance);
  // }
  constructor(initial?: {
    [key in keyof Darwin]?: Darwin[key];
  }) {
    this.id = initial?.id || N.generateRandomID(20);
    if (initial)
      getObjectKeys(initial).forEach((key) => {
        if (
          Object.prototype.hasOwnProperty.call(this, key) &&
          Object.prototype.hasOwnProperty.call(initial, key) &&
          typeof initial[key] !== "function"
        ) {
          //@ts-expect-error
          this[key] = initial[key];
        }
      });

    this.formatPos();
  }
  tick() {
    if (DarwinManager.pause) return;
    if (this.last_tick_timestamp + this.delta > Date.now()) return;
    this.last_tick_timestamp = Date.now();
    this.frame++;
    //death
    if (this.frame >= this.lifetime) this.kill();
    if (this.hp <= 0) return;
    //
    try {
      DarwinManager.eat(this);
      if (this.penalty > 0) {
        this.hp -= this.penalty;
      } else {
        this.penalty = 0;
        if (this.hp < this.default_hp) {
          this.hp = Math.min(this.default_hp, this.hp + this.default_hp / 1000);
        }
      }
      // if (this.frame % 10 === 0)
      //   this.target_area = DarwinManager.getPopDensity(this.hp <= this.default_hp / 2);
      const area_dif = 0; // this.target_area - this.getCurrentArea();
      // const d = direction(this.getCurrentArea(), this.target_area);

      const s = this.speed * 10;
      // if (area_dif) {
      //   this.x += N.random(-s * (d.r ? 0 : 2), s * (d.l ? 0 : 2)) / 10;
      //   this.y += N.random(-s * (d.b ? 0 : 2), s * (d.t ? 0 : 2)) / 10;
      // } else {
      this.x += N.random(-s, s) / 10;
      this.y += N.random(-s, s) / 10;
      // }

      this.rest_spawn_cooltime = Math.max(0, this.rest_spawn_cooltime - 1);
      const met = DarwinManager.getChunkFromPos(this)?.darwins.filter(
        (dw) => dw.id !== this.id
      );
      // const foods = met.filter((dw) => !this.isSameSpecies(dw));
      if (met && !this.sex) {
        const females = met.filter((dw) => dw.sex === 1 && this.isSameSpecies(dw));
        const males = met.filter((dw) => dw.sex === 0 && this.isSameSpecies(dw));

        if (females.length) {
          const target = females[N.random(0, females.length - 1)];
          this.isSameSpecies(target);
          if (target.rest_spawn_cooltime <= 0 && target.rest_spawnable_times >= 1) {
            const sum = (dw: Darwin) =>
              dw.w +
              dw.h +
              dw.tall +
              dw.weight +
              ((dw.sex ? dw.hp / 3 : dw.hp) - dw.frame) / dw.hp;

            const min = sum(target) - sum(this) + (1 - this.hp / 100) + this.penalty;
            const result = N.random(min, Math.abs(min) + N.random(0, 5));
            if (result === 0) {
              for (let i = 0; i < N.random(1, Math.min(target.spawnbility)); i++) {
                DarwinManager.born(this, target);
                target.hp = Math.max(
                  0,
                  target.hp - target.default_hp * (N.random(0, 10) / 10)
                );
              }
              target.child_count++;
              this.child_count++;
              target.rest_spawnable_times--;
              target.rest_spawn_cooltime = target.default_spawn_cooltime;
            }
          }
        }
        if (males.length && males.length + 1 > females.length) {
          const target = males[N.random(0, males.length - 1)];
          const sum = (dw: Darwin) =>
            dw.w + dw.h + dw.tall + dw.weight + dw.speed + (40 - dw.frame);
          const a = sum(this);
          const b = sum(target);
          const result = N.random(-a, b);
          const v = Math.abs(a - b);
          if (result <= 0) {
            target.hp -= Math.max(0, v);
            this.hp = Math.max(0, Math.min(this.default_hp, this.hp + v));
          } else {
            this.hp -= Math.max(0, v);
            target.hp = Math.max(0, Math.min(target.default_hp, target.hp + v));
          }
        }
      }

      //
      this.formatPos();
    } catch (error) {
      console.error("^_^ Log \n file: Darwin.tsx:131 \n error:", error);
    }
  }
  getSightArea() {
    return {
      x: Math.max(0, this.x - this.sight / 2),
      w: Math.min(DarwinManager.width, this.w + this.sight / 2),
      y: Math.max(0, this.y - this.sight / 2),
      h: Math.min(DarwinManager.height, this.h + this.sight / 2),
    };
  }
  getCurrentArea() {
    //0:top-right,1:bottom-right,2:botttom-left,4:top-left
    const isRight = this.x > DarwinManager.width / 2;
    const isBottom = this.y > DarwinManager.height / 2;
    return (isRight ? 0 : 1) + (isBottom ? 1 : 0) + (!isRight && !isBottom ? 2 : 0);
  }
  formatPos() {
    this.x = Math.min(DarwinManager.width - this.w, Math.max(0, this.x));
    this.y = Math.min(DarwinManager.height - this.h, Math.max(0, this.y));
  }
  getSpeciesSpecifier() {
    let n = 0;
    n += (this.w + this.h + this.tall) ** 2 * (this.w / this.h);
    n += this.spawnbility ** 10;
    n +=
      ((this.optimal_temperature + this.body_temperature) ** 2 *
        (this.optimal_temperature / this.body_temperature)) /
      10;
    return n;
  }
  isSameSpecies(target: Darwin) {
    // const result = Math.abs(this.getSpeciesSpecifier() - target.getSpeciesSpecifier());
    // console.log(result <= this.dsdt);
    // return result <= this.dsdt;
    return true;
  }
  kill() {
    console.log("killed");
    this.hp = 0;
  }
}
