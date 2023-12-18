import { useEffect, useState } from "react";
import { DarwinManager } from "./main/DarwinManager";
import { N } from "./main/NumericUtils";
import { Darwin } from "./main/Darwin";
const DM = DarwinManager.getInstance(100);

function App() {
  const [_, setFrame] = useState(0);
  // console.log("^_^ Log \n file: App.tsx:52 \n frame:", frame);
  useEffect(() => {
    DM.onUpdate = () => setFrame(DM.frame);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        DM.setPause(!DarwinManager.pause);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // DM.terminate();
    };
  }, []);
  return (
    <div className="flex flex-col border h-screen w-full overflow-y-hidden">
      <div
        className="relative shrink-0"
        style={{
          width: DarwinManager.width,
          height: DarwinManager.height,
          backgroundColor: "black",
        }}
      >
        {DM.darwins.map((dw, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: dw.y,
              left: dw.x,
              width: dw.w,
              height: dw.h,
              backgroundColor: dw.color,
              borderRadius: dw.weight,
              opacity: dw.hp / dw.default_hp,
              borderWidth: dw.tall / 10,
            }}
            className="border-blue-500 border-opacity-50"
          ></div>
        ))}
      </div>
      <div className="flex">
        <div>Pop: {DarwinManager.getPop()}</div>
        <div className="ml-1 border-l pl-1">
          Foods: {N.round(DarwinManager.getFoods())}
        </div>
        <div className="ml-1 border-l pl-1">
          b/d: {N.round(DarwinManager.getBirthRate(), 3)}
        </div>
      </div>
      <div className="overflow-auto w-full grow">
        {DM.darwins.map((dw, i) => (
          <div key={i} className="h-[50px] border-b flex items-center">
            <div
              className="w-4 h-full"
              style={{
                backgroundColor: dw.color,
              }}
            />
            {(
              [
                "hp",
                "w",
                "h",
                "tall",
                "weight",
                "speed",
                "frame",
                "spawnbility",
                "default_spawn_cooltime",
                "rest_spawn_cooltime",
                "rest_spawnable_times",
                "child_count",
              ] as (keyof Darwin)[]
            ).map((k, i) => (
              <div
                key={i}
                className="border-r w-[50px] flex flex-col items-center overflow-hidden"
              >
                <div>{k.substring(0, 5)}</div>
                <div>
                  {N.isNumber(dw[k]) ? N.round(dw[k] as number) : (dw[k] as string)}
                </div>
              </div>
            ))}
            <div
              key={i}
              className="border-r w-[50px] flex flex-col items-center overflow-hidden"
            >
              <div>r-pos</div>
              <div>{dw.getCurrentArea()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
