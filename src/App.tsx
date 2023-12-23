import { CSSProperties, useEffect, useRef, useState } from "react";
import { DarwinManager } from "./main/DarwinManager";
import { N } from "./main/NumericUtils";
import { Chunk } from "./main/Chunk";
import { clearEstate, setEstates, useEstate } from "./estate";
import { DarwinsView } from "./tabs/DarwinsView";
import { Tabs } from "./tabs/Tabs";
import { Environment } from "./tabs/Environment";
import { SaveList } from "./tabs/Saves";
export const ITEM_PER_PAGE = 50;
function App() {
  const darwinManagerInstance = DarwinManager.getInstance(0);
  const { lastDMInstance, setEstate: setMainEstate } = useEstate("main");
  const { initialDarwinCount, autoRestart, holdSeed, saves, page, setEstate } =
    useEstate("persist");
  const [_, setFrame] = useState(0);
  useEffect(() => {
    darwinManagerInstance.onUpdate = () => setFrame(darwinManagerInstance.frame);
    darwinManagerInstance.onEnd = () => {
      setEstates.main({
        lastDMInstance: JSON.parse(
          JSON.stringify(
            new DarwinManager(
              initialDarwinCount,
              holdSeed ? lastDMInstance : undefined,
              autoRestart
            )
          )
        ),
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        darwinManagerInstance.setPause(!DarwinManager.pause);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [darwinManagerInstance, initialDarwinCount, autoRestart, holdSeed, lastDMInstance]);
  useEffect(() => {
    setEstates.main({
      lastDMInstance: JSON.parse(JSON.stringify(new DarwinManager(initialDarwinCount))),
    });
    return () => {
      darwinManagerInstance.terminate();
    };
  }, []);
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div
        className="relative shrink-0"
        style={{
          width: DarwinManager.width,
          height: DarwinManager.height,
          backgroundColor: "black",
        }}
        onClick={() => {
          darwinManagerInstance.setPause(!DarwinManager.pause);
        }}
      >
        {darwinManagerInstance.darwins.map((dw, i) => (
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
        {darwinManagerInstance.chunks.map((ch, i) => (
          <div
            key={"ch" + i}
            style={{
              position: "absolute",
              top: ch.y * Chunk.size,
              left: ch.x * Chunk.size,
            }}
            className={`hover:opacity-100 opacity-0 w-[${Chunk.size}px] h-[${
              Chunk.size
            }px] hover:w-[${Chunk.size * 2}px] hover:h-[${
              Chunk.size * 2
            }px] text-blue-100 z-10`}
          >
            <div
              className={`absolute  border border-gray-300`}
              style={{ width: Chunk.size, height: Chunk.size }}
            />
            <div className="bg-gray-500 bg-opacity-75 pointer-events-none absolute">
              <div> pop: {ch.darwins.length}</div>
              <div> foods: {N.round(ch.foods)}</div>
              <div> elevation: {N.round(ch.elevation)}</div>
              <div> temperature: {N.round(ch.temperature)}</div>
              <div> sunlight: {N.round(ch.sunlight)}</div>
              <div> water: {N.round(ch.water)}</div>
            </div>
          </div>
        ))}
      </div>
      <Tabs
        tabs={["Darwins", "Environment", "Saves"]}
        className="grow overflow-hidden mt-2"
      >
        <DarwinsView />
        <Environment />
        <SaveList />
      </Tabs>
    </div>
  );
}
export default App;
