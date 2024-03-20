import { N } from "./NumericUtils";
import { DarwinManager } from "./DarwinManager";
import { getObjectKeys } from "./utils";
import { createSignal } from "solid-js";
import { Chunk } from "./Chunk";
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
  sight = N.random(10, 20);
  tall = N.random(7, 13);
  weight = N.random(1, 40) / 10;
  speed = N.random(1, 20) / 10;
  default_hp = N.random(80, 120);
  hp = this.default_hp;
  lifetime = N.random(80, 220); //frame
  /**0=male,1=female,2=no-gender */
  gender = N.random(0, 1);
  spawnbility = this.gender; //count of children able to spawn at the same time
  color = this.gender ? "red" : "white";
  default_spawn_cooltime = N.random(7, 13);
  initial_spawn_cooltime = N.random(20, 30);
  rest_spawn_cooltime = this.gender ? this.initial_spawn_cooltime : 0;
  default_spawnable_times = N.random(2, 5);
  rest_spawnable_times = this.gender ? this.default_spawnable_times : 0;
  child_count = 0;
  penalty = 0;
  dsdt = 500; //different_species_determination_threshold
  body_temperature = N.random(5, 40);
  optimal_temperature = N.random(this.body_temperature - 20, this.body_temperature + 10);
  chunk_rating_threshold = N.random(-10, 10);
  /**chunk ratingが基準以下の場合の移動方向(deg)*/
  escape_direction = N.random(0, 360);
  delta = N.random(80, 120); //ms
  frame = 0;
  last_tick_timestamp = 0;

  movement_path = [];
  target_pos: { x: number; y: number } | undefined = undefined;
  win_count = 0;
  gen = 1;
  aggressiveness = N.random(0, 100);
  foolhardiness = N.random(0, 100);
  max_stamina = N.random(50, 100);
  stamina = this.max_stamina;
  constructor(initial?: {
    [key in keyof Darwin]?: Darwin[key];
  }) {
    this.id = initial?.id || N.generateRandomID(20);
    if (initial) {
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
    } else {
      this.target_pos = undefined;
    }
    this.formatPos();
  }
  get_chunk_rating() {
    const ch = DarwinManager.getChunkFromPos(this);
    let rate = 0;
    if (!ch) return rate;
    rate += 10 - Math.abs(ch.temperature - this.optimal_temperature);
    return rate;
  }
  find_good_isosexuality() {
    if (this.gender > 1) return;
    const darwins = DarwinManager.getDarwinsFromArea(this.getSightArea());
    const good_males = darwins.filter(
      (dw) => dw.gender !== this.gender && this.isSameSpecies(dw)
    );
    if (!good_males.length) return;
    const highest_rated_male = good_males.reduce((prev, current) => {
      return Darwin.rate_isosexuality(prev) > Darwin.rate_isosexuality(current)
        ? prev
        : current;
    });
    return highest_rated_male;
  }
  static rate_isosexuality(dw: Darwin) {
    return (
      dw.w +
      dw.h +
      dw.tall +
      dw.weight +
      ((dw.gender ? dw.hp / 3 : dw.hp) - dw.frame) / Math.max(dw.hp, 1) +
      dw.win_count
    );
  }
  tick() {
    if (DarwinManager.pause) return;
    if (this.last_tick_timestamp + this.delta > DarwinManager.last_ticker_timestamp)
      return;
    this.last_tick_timestamp = DarwinManager.last_ticker_timestamp;
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
      this.rest_spawn_cooltime = Math.max(0, this.rest_spawn_cooltime - 1);

      if (
        !this.target_pos ||
        (this.x === this.target_pos.x && this.y === this.target_pos.y)
      ) {
        this.target_pos = {
          x: N.random(
            Math.max(0, this.x - Chunk.size / 3),
            Math.min(DarwinManager.width - this.w, this.x + Chunk.size / 3)
          ),
          y: N.random(
            Math.max(0, this.y - Chunk.size / 3),
            Math.min(DarwinManager.height - this.h, this.y + Chunk.size / 3)
          ),
        };
        const chunk_rating = this.get_chunk_rating();
        if (
          this.gender === 1 &&
          this.rest_spawn_cooltime === 0 &&
          this.rest_spawnable_times >= 1
        ) {
          const target = this.find_good_isosexuality();
          if (target) {
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            this.target_pos = { x: target.x, y: target.y };
            if (distance > s) {
              const rad = Math.atan2(dy, dx);
              this.target_pos.x += Math.cos(rad) * s;
              this.target_pos.y += Math.sin(rad) * s;
            }
          }
        } else if (chunk_rating < this.chunk_rating_threshold) {
          const range = Chunk.size;
          let targetX = this.x + Math.cos(this.escape_direction) * range;
          let targetY = this.y + Math.sin(this.escape_direction) * range;

          while (
            targetX < 0 ||
            targetX > DarwinManager.width - this.w ||
            targetY < 0 ||
            targetY > DarwinManager.height - this.h
          ) {
            this.escape_direction = N.random(0, 360);
            targetX = this.x + Math.cos(this.escape_direction) * range;
            targetY = this.y + Math.sin(this.escape_direction) * range;
          }

          this.target_pos = { x: targetX, y: targetY };
        }
      } else {
        const dx = this.target_pos.x - this.x;
        const dy = this.target_pos.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const rad = Math.atan2(dy, dx);
        if (distance > s) {
          this.x += Math.cos(rad) * s;
          this.y += Math.sin(rad) * s;
        } else {
          this.x = this.target_pos.x;
          this.y = this.target_pos.y;
        }
      }

      const met = DarwinManager.getChunkFromPos(this)?.darwins.filter(
        (dw) => dw.id !== this.id
      );
      // const foods = met.filter((dw) => !this.isSameSpecies(dw));
      if (met && this.gender === 0) {
        const females = met.filter(
          (dw) =>
            dw.gender === 1 &&
            this.isSameSpecies(dw) &&
            dw.rest_spawnable_times >= 1 &&
            dw.rest_spawn_cooltime <= 0
        );
        const males = met.filter((dw) => dw.gender === 0);

        if (females.length) {
          const target = females[N.random(0, females.length - 1)];
          // this.isSameSpecies(target);
          const min = Math.floor(
            Darwin.rate_isosexuality(target) -
              Darwin.rate_isosexuality(this) +
              this.penalty
          );
          const result = N.random(Math.floor(min / 10), Math.abs(min));

          if (result === 0) {
            console.log(
              "^_^ ::: file: Darwin.tsx:218 ::: min, Math.abs(min) + N.random(0, 5):\n",
              Math.floor(min / 10),
              Math.floor(Math.abs(min)),
              Math.floor(Math.abs(min)) - Math.floor(min / 10)
            );
            for (let i = 0; i < N.random(1, Math.min(target.spawnbility)); i++) {
              DarwinManager.born(this, target);
              target.hp = Math.max(
                0,
                target.hp - target.default_hp * (N.random(0, 10) / 50)
              );
            }
            target.child_count++;
            this.child_count++;
            target.rest_spawnable_times--;
            target.rest_spawn_cooltime = target.default_spawn_cooltime;
          }
        }
        if (males.length) {
          if (
            N.random(0, 99) < this.aggressiveness ||
            N.random(N.random(0, 50), 99) < this.foolhardiness
          ) {
            const target = males[N.random(0, males.length - 1)];
            const sum = (dw: Darwin) =>
              dw.w +
              dw.h +
              dw.tall +
              dw.weight +
              dw.speed +
              (dw.frame / dw.lifetime) * dw.win_count -
              (dw.frame / dw.lifetime) * 20;
            let a = sum(this);
            const b = sum(target);
            const isStronger = b > a;
            if (isStronger && N.random(0, 99) < this.foolhardiness) {
              a -= this.foolhardiness;
            }
            const result = N.random(-a, b);
            const v = Math.abs(a - b);
            if (result <= 0) {
              target.hp -= Math.max(0, v);
              this.hp = Math.max(0, Math.min(this.default_hp, this.hp + v));
              this.win_count++;
            } else {
              this.hp -= Math.max(0, v);
              target.hp = Math.max(0, Math.min(target.default_hp, target.hp + v));
              target.win_count++;
            }
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
  // getCurrentArea() {
  //   //0:top-right,1:bottom-right,2:botttom-left,4:top-left
  //   const isRight = this.x > DarwinManager.width / 2;
  //   const isBottom = this.y > DarwinManager.height / 2;
  //   return (isRight ? 0 : 1) + (isBottom ? 1 : 0) + (!isRight && !isBottom ? 2 : 0);
  // }
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
    // console.log("killed");
    this.hp = 0;
  }
}
