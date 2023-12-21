import { DarwinManager } from "../main/DarwinManager";
import { N } from "../main/NumericUtils";
import { Darwin } from "../main/Darwin";
import { setEstates, useEstate } from "../estate";
import { ITEM_PER_PAGE } from "../App";

export const DarwinsView = () => {
  const { page, setEstate } = useEstate("persist");
  const DM = DarwinManager.getInstance(0);
  return (
    <div className="grow flex flex-col overflow-hidden">
      <div className="flex z-0 shrink-0 m-2">
        <button
          className="ml-1 border-white"
          style={{ opacity: page > 0 ? 1 : 0.7 }}
          onClick={() => {
            page > 0 && setEstate({ page: (c) => c - 1 });
          }}
        >
          前
        </button>
        <button
          onClick={() => {
            DarwinManager.getPop() > (page + 1) * 20 && setEstate({ page: (c) => c + 1 });
          }}
          style={{
            opacity: DarwinManager.getPop() > (page + 1) * ITEM_PER_PAGE ? 1 : 0.7,
          }}
          className="ml-1 border-white"
        >
          次
        </button>
        <button
          className="w-[100px] ml-1 border-white p-2"
          onClick={() => {
            const n = Number(prompt("初期Pop数変更(Number)"));
            if (n > 0) {
              setEstates.main({ lastDMInstance: new DarwinManager(n) });
              setEstate({ initialDarwinCount: n });
            }
          }}
        >
          Pop: {DarwinManager.getPop()}
        </button>
        <div className="ml-1 border-l pl-1 w-[100px] text-center">
          Foods:
          <br />
          {N.formatNumber(DarwinManager.getFoods())}
        </div>
        <div className="ml-1 border-l pl-1 w-[90px] text-center">
          b/d:
          <br />
          {N.round(DarwinManager.getBirthRate(), 3)}
        </div>
        <div className="ml-1 border-l pl-1 w-[60px] text-center">
          rate:
          <br />
          {DM.ticker_rate}
        </div>
      </div>
      <div className="overflow-auto w-full grow flex flex-col h-0">
        {DM.darwins.map((dw, i) => {
          if (
            i < (page + 1) * ITEM_PER_PAGE &&
            i >= (page + 1) * ITEM_PER_PAGE - ITEM_PER_PAGE
          )
            return (
              <div
                key={i}
                className={
                  "min-h-[50px] border-b-4 flex items-center shrink-0 border-white" +
                  ` border-[${dw.color}] border-opacity-75`
                }
              >
                <div className="flex flex-wrap">
                  <div
                    className="w-[5px] h-[50px] shrink-0"
                    style={{
                      backgroundColor: dw.color,
                    }}
                  />
                  <Item color={dw.color} style={{ width: 50 }}>
                    <div className="leading-none">hp</div>
                    <div className="leading-none">{N.round(dw.hp)}</div>
                    <div className="leading-none">/{N.round(dw.default_hp)}</div>
                  </Item>
                  <Item color={dw.color} style={{ width: 50 }}>
                    <div className="leading-none">spwnct</div>
                    <div className="leading-none">{N.round(dw.rest_spawn_cooltime)}</div>
                    <div className="leading-none">
                      /{N.round(dw.default_spawn_cooltime)}
                    </div>
                  </Item>
                  <Item color={dw.color} style={{ width: 50 }}>
                    <div className="leading-none">spwna.</div>
                    <div className="leading-none">_times</div>
                    <div className="leading-none">
                      {N.round(dw.rest_spawnable_times)}/
                      {N.round(dw.default_spawnable_times)}
                    </div>
                  </Item>
                  <Item color={dw.color} style={{ width: 50 }}>
                    <div className="leading-none">life</div>
                    <div className="leading-none">{N.round(dw.frame)}</div>
                    <div className="leading-none">/{N.round(dw.lifetime)}</div>
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
                    <Item key={i} color={dw.color} style={{ minWidth: 40 }}>
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
const Item = (
  props: { color: string } & React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) => {
  const { color, className, ...others } = props;
  return (
    <div
      className={
        className +
        ` border-r border-t flex flex-col items-center overflow-hidden shrink-0 grow border-[${color}] border-opacity-75`
      }
      {...others}
    />
  );
};
