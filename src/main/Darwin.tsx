import { N } from "./NumericUtils";
import { DarwinManager } from "./DarwinManager";

export class Darwin {
  id: string;
  x = DarwinManager.width / 2;
  y = DarwinManager.height / 2;
  w = 10;
  h = 10;
  tall = 10;
  weight = 1;
  speed = 1;
  default_hp = 100;
  hp = 100;
  delta = 100; //ms
  frame = 0;
  sex = N.random(0, 1); //0=male,1=female,2=no-sex
  color = "white";
  lifetime = 100; //frame
  spawnbility = this.sex; //count of children able to spawn at the same time
  default_spawn_cooltime = 10;
  initial_spawn_cooltime = 30;
  rest_spawn_cooltime = this.sex ? 20 : 0;
  default_spawnable_times = 3;
  rest_spawnable_times = this.sex ? 3 : 0;
  child_count = 0;
  target_area = -1;
  constructor(initial?: {
    id?: string;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    tall?: number;
    weight?: number;
    speed?: number;
    default_hp?: number;
    delta?: number;
    lifetime?: number;
    sex?: number;
    spawnbility?: number;
    default_spawn_cooltime?: number;
    initial_spawn_cooltime?: number;
    default_spawnable_times?: number;
  }) {
    this.id = initial?.id || N.generateRandomID(20);
    this.x =
      initial?.x ||
      N.random(this.x - DarwinManager.width / 4, this.x + DarwinManager.width / 4);
    this.y =
      initial?.y ||
      N.random(this.y - DarwinManager.height / 4, this.y + DarwinManager.height / 4);
    this.formatPos(DarwinManager.width, DarwinManager.height);
    this.w = Math.max(1, initial?.w || N.random(this.w - 3, this.w + 3));
    this.h = Math.max(1, initial?.h || N.random(this.h - 3, this.h + 3));
    this.tall = Math.max(1, initial?.tall || N.random(this.tall - 3, this.tall + 3));
    this.weight = Math.max(
      1,
      initial?.weight || N.random(this.weight - 3, this.weight + 3)
    );
    this.speed = Math.max(1, initial?.speed || N.random(this.speed - 1, this.speed + 1));
    this.default_hp = Math.max(
      1,
      initial?.default_hp || N.random(this.default_hp - 5, this.default_hp + 5)
    );
    this.hp = this.default_hp;
    this.delta = Math.max(1, initial?.delta || N.random(this.delta - 5, this.delta + 5));
    this.lifetime = Math.max(
      1,
      initial?.lifetime || N.random(this.lifetime - 5, this.lifetime + 5)
    );
    this.sex = N.isNumber(initial?.sex) ? initial?.sex : N.random(0, 1);

    this.color = this.sex ? "red" : "white";
    this.spawnbility = N.isNumber(initial?.spawnbility) ? initial?.spawnbility : this.sex;
    this.default_spawn_cooltime = Math.max(
      0,
      initial?.default_spawn_cooltime || this.default_spawn_cooltime
    );
    this.initial_spawn_cooltime = Math.max(
      0,
      initial?.initial_spawn_cooltime || this.initial_spawn_cooltime
    );
    this.default_spawnable_times = Math.max(
      0,
      initial?.default_spawnable_times || this.default_spawnable_times
    );
    this.rest_spawn_cooltime = this.sex && this.default_spawn_cooltime;
    this.rest_spawnable_times = this.sex && this.default_spawnable_times;
    // console.log("Born:", this);

    this.tick();
  }
  tick() {
    if (DarwinManager.pause) return;
    this.frame++;
    //death
    if (this.frame >= this.lifetime) this.kill();
    if (this.hp <= 0) return;
    //
    const penalty = DarwinManager.eat(this);
    if (penalty > 0) {
      this.hp -= penalty;
    } else if (this.hp < this.default_hp) {
      this.hp = Math.min(this.default_hp, this.hp + this.default_hp / 1000);
    }
    this.target_area = DarwinManager.getPopDensity(this.hp <= this.default_hp / 2);
    const area_dif = this.target_area - this.getCurrentArea();

    const direction = (from: number, to: number) => {
      const t = to % 3 === 0 && (from === 1 || from === 2);
      const b = from % 3 === 0 && (to === 1 || to === 2);
      const l = to >= 2 && from <= 1;
      const r = from >= 2 && to <= 1;
      return { t, b, l, r };
    };
    const d = direction(this.getCurrentArea(), this.target_area);
    //(0,1,2,3)**2
    //=(0,1,4,9)
    if (area_dif) {
      this.x += N.random(-this.speed * (d.r ? 0 : 2), this.speed * (d.l ? 0 : 2));
      this.y += N.random(-this.speed * (d.b ? 0 : 2), this.speed * (d.t ? 0 : 2));
    } else {
      this.x += N.random(-this.speed, this.speed);
      this.y += N.random(-this.speed, this.speed);
    }

    this.rest_spawn_cooltime = Math.max(0, this.rest_spawn_cooltime - 1);
    const met = DarwinManager.getDarwinsFromArea(this).filter((dw) => dw.id !== this.id);
    if (!this.sex) {
      const females = met.filter((dw) => dw.sex === 1);
      const males = met.filter((dw) => dw.sex === 0);

      if (females.length) {
        const target = females[N.random(0, females.length - 1)];
        if (!target.rest_spawn_cooltime && target.rest_spawnable_times) {
          const sum = (dw: Darwin) =>
            dw.w +
            dw.h +
            dw.tall +
            dw.weight +
            ((dw.sex ? dw.hp / 3 : dw.hp) - dw.frame) / dw.hp;

          const min = sum(target) - sum(this) + (1 - this.hp / 100) + penalty;
          const result = N.random(min, Math.abs(min) + N.random(0, 5));
          if (result === 0) {
            for (let i = 0; i < N.random(1, Math.min(target.spawnbility)); i++) {
              DarwinManager.born(this, target);
            }
            target.child_count++;
            this.child_count++;
            target.rest_spawnable_times--;
            target.rest_spawn_cooltime = target.default_spawn_cooltime;
          }
        }
      }
      // console.log(
      //   "^_^ Log \n file: Darwin.tsx:138 \n males.length + 1 > females.length:",
      //   males.length + 1,
      //   females.length
      // );
      if (males.length && males.length + 1 > females.length) {
        const target = males[N.random(0, males.length - 1)];
        const sum = (dw: Darwin) =>
          dw.w + dw.h + dw.tall + dw.weight + dw.speed + (40 - dw.frame);
        const a = sum(this);
        const b = sum(target);
        const result = N.random(Math.min(a, b), Math.max(a, b));
        if (a - result <= b - result) {
          target.hp -= Math.max(0, b - result);
        } else {
          this.hp -= Math.max(0, a - result);
        }
      }
    }

    //
    this.formatPos(DarwinManager.width, DarwinManager.height);
    setTimeout(() => {
      this.tick();
    }, this.delta);
  }
  getCurrentArea() {
    //0:top-right,1:bottom-right,2:botttom-left,4:top-left
    const isRight = this.x > DarwinManager.width / 2;
    const isBottom = this.y > DarwinManager.height / 2;
    return (isRight ? 0 : 1) + (isBottom ? 1 : 0) + (!isRight && !isBottom ? 2 : 0);
  }
  formatPos(w: number, h: number) {
    this.x = Math.min(w, Math.max(0, this.x));
    this.y = Math.min(h, Math.max(0, this.y));
  }
  kill() {
    console.log("killed");
    this.hp = 0;
  }
}
