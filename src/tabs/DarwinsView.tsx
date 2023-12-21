import { DarwinManager } from "../main/DarwinManager";
import { N } from "../main/NumericUtils";
import { Darwin } from "../main/Darwin";
import { useEstate } from "../estate";
import { ITEM_PER_PAGE } from "../App";

export const DarwinsView = () => {
  // const { page } = useEstate("persist");
  const DM = DarwinManager.getInstance(0);
  return (
    <div className="overflow-auto w-full grow">
      {/* {DM.darwins.map((dw, i) => {
        if (
          i < (page + 1) * ITEM_PER_PAGE &&
          i >= (page + 1) * ITEM_PER_PAGE - ITEM_PER_PAGE
        )
          return (
            <div key={i} className="h-[50px] border-b flex items-center">
              <div
                className="w-[5px] h-full shrink-0"
                style={{
                  backgroundColor: dw.color,
                }}
              />
              <div className="border-r flex flex-col items-center overflow-hidden shrink-0 grow w-[50px]">
                <div className="leading-none">hp</div>
                <div className="leading-none">{N.round(dw.hp)}</div>
                <div className="leading-none">/{N.round(dw.default_hp)}</div>
              </div>
              <div className="border-r flex flex-col items-center overflow-hidden shrink-0 grow w-[50px]">
                <div className="leading-none">spwnct</div>
                <div className="leading-none">{N.round(dw.rest_spawn_cooltime)}</div>
                <div className="leading-none">/{N.round(dw.default_spawn_cooltime)}</div>
              </div>
              <div className="border-r flex flex-col items-center overflow-hidden shrink-0 grow w-[50px]">
                <div className="leading-none">spwna.</div>
                <div className="leading-none">_times</div>
                <div className="leading-none">
                  {N.round(dw.rest_spawnable_times)}/{N.round(dw.default_spawnable_times)}
                </div>
              </div>
              <div className="border-r flex flex-col items-center overflow-hidden shrink-0 grow w-[50px]">
                <div className="leading-none">life</div>
                <div className="leading-none">{N.round(dw.frame)}</div>
                <div className="leading-none">/{N.round(dw.lifetime)}</div>
              </div>
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
                <div
                  key={i}
                  className="border-r flex flex-col items-center overflow-hidden shrink-0 grow min-w-[40px]"
                >
                  <div>{k}</div>
                  <div>
                    {N.isNumber(dw[k]) ? N.round(dw[k] as number) : (dw[k] as string)}
                  </div>
                </div>
              ))}
              <div className="border-r flex flex-col items-center overflow-hidden shrink-0 grow">
                <div>r-pos</div>
                <div>{dw.getCurrentArea()}</div>
              </div>
            </div>
          );
        return null;
      })} */}
    </div>
  );
};
