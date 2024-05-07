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
  fighting_range = N.random(1, 5);
  tall = N.random(7, 13);
  weight = N.random(1, 40) / 10;
  speed = N.random(1, 20) / 10;
  default_hp = N.random(80, 120);
  lifetime = N.random(80, 220); //frame
  /**0=male,1=female,2=no-gender */
  gender = N.random(0, 1);
  spawnbility = this.gender; //count of children able to spawn at the same time
  default_spawn_cooltime = N.random(7, 13);
  initial_spawn_cooltime = N.random(20, 30);
  default_spawnable_times = N.random(2, 5);
  dsdt = 500; //different_species_determination_threshold
  body_temperature = N.random(5, 40);
  optimal_temperature = N.random(this.body_temperature - 20, this.body_temperature + 10);
  chunk_rating_threshold = N.random(-10, 10);
  /**chunk ratingが基準以下の場合の移動方向(deg)*/
  escape_direction = N.random(0, 360);
  delta = N.random(80, 120); //ms
  gen = 1;
  aggressiveness = N.random(0, 100);
  foolhardiness = N.random(0, 100);
  max_stamina = N.random(50, 100);
  stamina_preservation_threshold = N.random(0, this.max_stamina);

  //非遺伝変数
  win_count = 0;
  frame = 0;
  last_tick_timestamp = 0;
  child_count = 0;
  penalty = 0;
  rest_spawnable_times = this.gender ? this.default_spawnable_times : 0;
  rest_spawn_cooltime = this.gender ? this.initial_spawn_cooltime : 0;
  color = this.gender ? "red" : "white";
  hp = this.default_hp;
  movement_path = [];
  target_pos: { x: number; y: number } | undefined = undefined;
  stamina = this.max_stamina;
  state: "resting" | "moving" | "running" | "hunting" | "breeding" | "scouting" =
    "resting";
  hunting_target_id: string | undefined = undefined;
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
      return Darwin.isosexuality_score(prev) > Darwin.isosexuality_score(current)
        ? prev
        : current;
    });
    return highest_rated_male;
  }
  static isosexuality_score(dw: Darwin) {
    return (
      dw.w +
      dw.h +
      dw.tall +
      dw.weight +
      ((dw.gender ? dw.hp / 3 : dw.hp) - dw.frame) / Math.max(dw.hp, 1) +
      dw.win_count
    );
  }
  static attack_score(dw: Darwin) {
    //お互いにターゲットを取ってたらスピードが速いほうに先制ボーナス
    return (
      dw.w +
      dw.h +
      dw.tall +
      dw.weight +
      dw.speed +
      (dw.frame / dw.lifetime) * dw.win_count -
      (dw.frame / dw.lifetime) * 20
    );
  }
  tick() {
    if (DarwinManager.pause) return;
    if (this.last_tick_timestamp + this.delta > DarwinManager.last_ticker_timestamp)
      return;
    if (this.hp <= 0) return this.kill();

    this.last_tick_timestamp = DarwinManager.last_ticker_timestamp;
    this.frame++;
    //death
    if (this.frame >= this.lifetime) return this.kill();

    //

    switch (this.state) {
      case "moving":
        try {
          const start_pos = { x: this.x, y: this.y };
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
          const dx = start_pos.x - this.x;
          const dy = start_pos.y - this.y;
          this.stamina -= Math.sqrt(dx * dx + dy * dy);
        } catch (error) {
          console.log("Tick Error while moving", error);
        }
        break;
      case "resting":
        try {
          DarwinManager.getChunkFromPos(this)?.eat(this);
          if (this.penalty <= 0) {
            this.penalty = 0;
            if (this.hp < this.default_hp) {
              this.hp = Math.min(this.default_hp, this.hp + this.default_hp / 1000);
            }
            if (this.stamina < 0) {
              this.stamina = Math.min(this.max_stamina, this.stamina + 0.5);
            } else {
              this.stamina = Math.min(this.max_stamina, this.stamina + 1);
            }
          }
        } catch (error) {
          console.log("Tick Error while resting", error);
        }
        break;
      case "running":
        try {
          const start_pos = { x: this.x, y: this.y };

          const dx = start_pos.x - this.x;
          const dy = start_pos.y - this.y;
          this.stamina -= Math.sqrt(dx * dx + dy * dy);
        } catch (error) {
          console.log("Tick Error while running", error);
        }
        break;
      case "hunting":
        try {
          if (
            N.random(0, 99) >= this.aggressiveness &&
            N.random(N.random(0, 50), 99) >= this.foolhardiness
          )
            break;
          let target: Darwin | undefined = undefined;
          if (this.hunting_target_id) {
            target = DarwinManager.getDarwinFromId(this.hunting_target_id);
            if (!target) {
              this.hunting_target_id = undefined;
            }
          } else {
            const met = DarwinManager.getChunkFromPos(this)?.darwins.filter(
              (dw) => dw.id !== this.id
            );
            if (!met) break;
            const enemies = met.filter((dw) => !this.isSameSpecies(dw));
            if (!enemies.length) break;
            target = enemies[N.random(0, enemies.length - 1)];
          }
          if (!target) break;
          const distance = Math.sqrt(
            Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2)
          );
          if (distance > this.fighting_range) {
            // fighting_rangeより遠い場合はtargetに向かって移動
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            const moveDistance = Math.min(this.speed * 1.5, distance);
            this.x += Math.cos(angle) * moveDistance;
            this.y += Math.sin(angle) * moveDistance;
            this.stamina -= moveDistance * 1.5;
          }
          if (
            Math.sqrt(Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2)) >
            this.fighting_range
          )
            break;

          let a = Darwin.attack_score(this) + this.speed; //先制攻撃
          const b = Darwin.attack_score(target);
          const isStronger = b > a;
          if (isStronger && N.random(0, 99) < this.foolhardiness) {
            a -= this.foolhardiness;
          }
          const result = N.random(-a, b);
          const v = Math.abs(a - b);
          if (result <= 0) {
            target.hp -= Math.max(0, v);
            target.stamina -= 15;
            this.hp = Math.max(0, Math.min(this.default_hp, this.hp + v));
            this.stamina -= 10;
            this.win_count++;
          } else {
            this.hp -= Math.max(0, v);
            this.stamina -= 15;
            target.hp = Math.max(0, Math.min(target.default_hp, target.hp + v));
            target.stamina -= 10;
            target.win_count++;
          }
          target.hunting_target_id = undefined;
          this.hunting_target_id = undefined;
        } catch (error) {
          console.log("Tick Error while hunting", error);
        }
        break;
      case "scouting":
        try {
          const nearby_hostiles = DarwinManager.getDarwinsFromArea(
            this.getSightArea()
          ).filter((dw) => !this.isSameSpecies(dw) && dw.state === "hunting");
          let closest_target: null | Darwin = null;
          let min_distance = Infinity;
          let power_dif = 0;
          for (let i = 0; i < nearby_hostiles.length; i++) {
            const target = nearby_hostiles[i];
            const distance = Math.sqrt(
              Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2)
            );
            let a = Darwin.attack_score(this) + this.foolhardiness;
            const b = Darwin.attack_score(target);
            if (b > a) {
              this.state = "running";
              break; // 逃走する
            }
            if (distance < min_distance) {
              min_distance = distance;
              closest_target = target;
              power_dif = a - b;
            }
          }
          if (this.state === "scouting" && closest_target !== null) {
            if (power_dif > N.random(5, 15)) {
              this.hunting_target_id = closest_target.id;
              this.state = "hunting";
            }
          }
        } catch (error) {
          console.log("Tick Error while scouting", error);
        }
        break;
      case "breeding":
        try {
          const met = DarwinManager.getChunkFromPos(this)?.darwins.filter(
            (dw) => dw.id !== this.id
          );
          if (!met) break;
          //[ToDo]雄雌それぞれの処理を書く。オスはアピール、ライバル排除。メスはオスの選択、出産、育児。

          if (this.gender !== 0) break;
          const females = met.filter(
            (dw) =>
              dw.gender === 1 &&
              this.isSameSpecies(dw) &&
              dw.rest_spawnable_times >= 1 &&
              dw.rest_spawn_cooltime <= 0
          );
          const males = met.filter((dw) => dw.gender === 0);

          // if (females.length) {
          //   const target = females[N.random(0, females.length - 1)];
          //   // this.isSameSpecies(target);
          //   const min = Math.floor(
          //     Darwin.rate_isosexuality(target) -
          //       Darwin.rate_isosexuality(this) +
          //       this.penalty
          //   );
          //   const result = N.random(Math.floor(min / 10), Math.abs(min));

          //   if (result === 0) {
          //     console.log(
          //       "^_^ ::: file: Darwin.tsx:218 ::: min, Math.abs(min) + N.random(0, 5):\n",
          //       Math.floor(min / 10),
          //       Math.floor(Math.abs(min)),
          //       Math.floor(Math.abs(min)) - Math.floor(min / 10)
          //     );
          //     for (let i = 0; i < N.random(1, Math.min(target.spawnbility)); i++) {
          //       DarwinManager.born(this, target);
          //       target.hp = Math.max(
          //         0,
          //         target.hp - target.default_hp * (N.random(0, 10) / 50)
          //       );
          //     }
          //     target.child_count++;
          //     this.child_count++;
          //     target.rest_spawnable_times--;
          //     target.rest_spawn_cooltime = target.default_spawn_cooltime;
          //   }
          // }
          // if (males.length) {
          //   if (
          //     N.random(0, 99) < this.aggressiveness ||
          //     N.random(N.random(0, 50), 99) < this.foolhardiness
          //   ) {
          //     const target = males[N.random(0, males.length - 1)];
          //     const sum = (dw: Darwin) =>
          //       dw.w +
          //       dw.h +
          //       dw.tall +
          //       dw.weight +
          //       dw.speed +
          //       (dw.frame / dw.lifetime) * dw.win_count -
          //       (dw.frame / dw.lifetime) * 20;
          //     let a = sum(this);
          //     const b = sum(target);
          //     const isStronger = b > a;
          //     if (isStronger && N.random(0, 99) < this.foolhardiness) {
          //       a -= this.foolhardiness;
          //     }
          //     const result = N.random(-a, b);
          //     const v = Math.abs(a - b);
          //     if (result <= 0) {
          //       target.hp -= Math.max(0, v);
          //       this.hp = Math.max(0, Math.min(this.default_hp, this.hp + v));
          //       this.win_count++;
          //     } else {
          //       this.hp -= Math.max(0, v);
          //       target.hp = Math.max(0, Math.min(target.default_hp, target.hp + v));
          //       target.win_count++;
          //     }
          //   }
          // }
          // this.stamina -= Math.sqrt(dx * dx + dy * dy);
        } catch (error) {
          console.log("Tick Error while hunting", error);
        }
        break;
    }
    //[ToDo]状態移行を処理する
    try {
      if (this.penalty > 0) {
        this.hp -= this.penalty;
      }
      if (
        this.state !== "hunting" &&
        this.state !== "running" &&
        this.stamina < this.stamina_preservation_threshold
      ) {
        this.state = "resting";
      }
      if (this.stamina < 0) {
        this.hp += this.stamina / 2;
      }
      this.formatPos();
      if (this.hp <= 0) this.kill();
    } catch (error) {}
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
