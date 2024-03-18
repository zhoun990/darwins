import { DarwinManager } from "../main/DarwinManager";
import { N } from "../main/NumericUtils";
import { ITEM_PER_PAGE } from "../App";
import { Darwin } from "../main/Darwin";
import { createEstate, setEstates } from "../estate";
import { JSX } from "solid-js/jsx-runtime";
import { createEffect } from "solid-js";

export const DarwinsView = () => {
  const pop = DarwinManager.getPopSignal();
  const foods = DarwinManager.getFoodsSignal();
  const birthRate = DarwinManager.getBirthRateSignal();
  const { page, setEstate, initialDarwinCount } = createEstate("persist");
  createEffect(() => {
    if (page() > Math.floor(pop() / ITEM_PER_PAGE)) {
      setEstate({ page: Math.floor(pop() / ITEM_PER_PAGE) });
    }
  });
  return (
    <div class="grow flex flex-col overflow-hidden">
      <div class="flex z-0 shrink-0 m-2">
        <button
          class="ml-1 border-white"
          style={{ opacity: page() > 0 ? 1 : 0.7 }}
          onClick={() => {
            if (page() > 0) setEstate({ page: (c) => c - 1 });
          }}
        >
          前
        </button>
        <button
          onClick={() => {
            if (pop() > (page() + 1) * ITEM_PER_PAGE) setEstate({ page: (c) => c + 1 });
          }}
          style={{
            opacity: pop() > (page() + 1) * ITEM_PER_PAGE ? 1 : 0.7,
          }}
          class="ml-1 border-white"
        >
          次
        </button>
        <button
          class="w-[100px] ml-1 border-white p-2 py-0"
          onClick={() => {
            const n = Number(prompt("初期Pop数変更(Number)"));
            if (n > 0) {
              setEstates.main({
                lastDMInstance: JSON.parse(JSON.stringify(new DarwinManager(n))),
              });
              setEstate({ initialDarwinCount: n });
            }
          }}
        >
          Pop: {pop()}({initialDarwinCount()})
        </button>
        <div class="ml-1 border-l pl-1 w-[100px] text-center">
          Foods:
          <br />
          {N.formatNumber(foods())}
        </div>
        <div class="ml-1 border-l pl-1 w-[90px] text-center">
          b/d:
          <br />
          {N.round(birthRate(), 3)}
        </div>
        <div class="ml-1 border-l pl-1 w-[60px] text-center">
          rate:
          <br />
          {DarwinManager.signal().ticker_rate}
        </div>
      </div>
      <div class="overflow-auto w-full grow flex flex-col h-0">
        {DarwinManager.signal().darwins.map((dw, i) => {
          if (
            i < (page() + 1) * ITEM_PER_PAGE &&
            i >= (page() + 1) * ITEM_PER_PAGE - ITEM_PER_PAGE
          )
            return (
              <div
                class={
                  "min-h-[50px] border-b-4 flex items-center shrink-0 border-white" +
                  ` border-[${dw.color}] border-opacity-75`
                }
              >
                <div class="flex flex-wrap">
                  <div
                    class="w-[5px] h-[50px] shrink-0"
                    style={{
                      "background-color": dw.color,
                    }}
                  />
                  <Item color={dw.color} style={{ width: 50 + "px" }}>
                    <div class="leading-none">hp</div>
                    <div class="leading-none">{N.round(dw.hp)}</div>
                    <div class="leading-none">/{N.round(dw.default_hp)}</div>
                  </Item>
                  <Item color={dw.color} style={{ width: 50 + "px" }}>
                    <div class="leading-none">spwnct</div>
                    <div class="leading-none">{N.round(dw.rest_spawn_cooltime)}</div>
                    <div class="leading-none">/{N.round(dw.default_spawn_cooltime)}</div>
                  </Item>
                  <Item color={dw.color} style={{ width: 50 + "px" }}>
                    <div class="leading-none">spwna.</div>
                    <div class="leading-none">_times</div>
                    <div class="leading-none">
                      {N.round(dw.rest_spawnable_times)}/
                      {N.round(dw.default_spawnable_times)}
                    </div>
                  </Item>
                  <Item color={dw.color} style={{ width: 50 + "px" }}>
                    <div class="leading-none">life</div>
                    <div class="leading-none">{N.round(dw.frame)}</div>
                    <div class="leading-none">/{N.round(dw.lifetime)}</div>
                  </Item>
                  {(
                    [
                      "dsdt",
                      "delta",
                      "child_count",

                      "penalty",
                      "w",
                      "h",
                      "tall",
                      "weight",
                      "speed",
                      "optimal_temperature",
                      "body_temperature",
                      "spawnbility",
                      "initial_spawn_cooltime",
                      "target_area",
                    ] as (keyof Darwin)[]
                  ).map((k, i) => (
                    <Item color={dw.color} style={{ "min-width": 40 + "px" }}>
                      <div>{k}</div>
                      <div>
                        {N.isNumber(dw[k]) ? N.round(dw[k] as number) : (dw[k] as string)}
                      </div>
                    </Item>
                  ))}
                </div>
              </div>
            );
          return null;
        })}
      </div>
    </div>
  );
};
const Item = (props: { color: string } & JSX.HTMLAttributes<HTMLDivElement>) => {
  const { color, class: className, ...others } = props;
  return (
    <div
      class={
        className +
        ` border-r border-t flex flex-col items-center overflow-hidden shrink-0 grow border-[${color}] border-opacity-75`
      }
      {...others}
    />
  );
};
