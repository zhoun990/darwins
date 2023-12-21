// import { CSSProperties, useEffect, useRef, useState } from "react";
// import { DarwinManager } from "./main/DarwinManager";
// import { N } from "./main/NumericUtils";
// import { Chunk } from "./main/Chunk";
import { useEstate } from "./estate";
// import { DarwinsView } from "./tabs/DarwinsView";
// import { Tabs } from "./tabs/Tabs";
export const ITEM_PER_PAGE = 50;
// const getSaves = (): string[] => JSON.parse(localStorage.getItem("saves") || "[]");
function App() {
  const { text, setEstate } = useEstate("persist");
  console.log("^_^ Log \n file: App.tsx:12 \n text:", text);

  // const { autoRestart, holdSeed, setEstate } = useEstate("persist");
  // const [initialDarwinCount, setInitialDarwinCount] = useState(500);
  // const [page, setPage] = useState(0);
  // const [_, setFrame] = useState(0);
  // const [DM, setDM] = useState(DarwinManager.getInstance(initialDarwinCount));
  // const [saves, setSaves] = useState<string[]>([]);
  // const lastDMInstance = useRef<DarwinManager>(JSON.parse(JSON.stringify(DM)));
  // const setLastDMInstance = (DM: DarwinManager) =>
  //   (lastDMInstance.current = JSON.parse(JSON.stringify(DM)));

  // useEffect(() => {
  //   DM.onUpdate = () => setFrame(DM.frame);
  //   DM.onEnd = () =>
  //     setDM(
  //       new DarwinManager(
  //         initialDarwinCount,
  //         holdSeed ? lastDMInstance.current : undefined,
  //         autoRestart
  //       )
  //     );
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === " ") {
  //       DM.setPause(!DarwinManager.pause);
  //     }
  //   };
  //   document.addEventListener("keydown", handleKeyDown);
  //   return () => {
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [DM, initialDarwinCount, autoRestart, holdSeed]);
  // useEffect(() => {
  //   setSaves(getSaves());
  //   return () => {
  //     DM.terminate();
  //   };
  // }, []);
  return (
    <div className="flex flex-col border h-screen w-full overflow-y-hidden">
      {/* <div
        className="relative shrink-0"
        style={{
          width: DarwinManager.width,
          height: DarwinManager.height,
          backgroundColor: "black",
        }}
        onClick={() => {
          DM.setPause(!DarwinManager.pause);
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
        {DM.chunks.map((ch, i) => (
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
              className={`absolute w-[${Chunk.size}px] h-[${Chunk.size}px] border border-gray-300`}
            />
            <div
              className={`bg-gray-500 w-[${
                Chunk.size * 2
              }px] bg-opacity-75 pointer-events-none`}
            >
              <div> pop: {ch.darwins.length}</div>
              <div> foods: {N.round(ch.foods)}</div>
              <div> elevation: {N.round(ch.elevation)}</div>
              <div> temperature: {N.round(ch.temperature)}</div>
              <div> sunlight: {N.round(ch.sunlight)}</div>
              <div> water: {N.round(ch.water)}</div>
            </div>
          </div>
        ))}
      </div> */}

      <div
        onClick={() => {
          setEstate({ text: (cv) => cv + 1 }, true);
        }}
      >
        {text}
      </div>
      {/* <Tabs tabs={["Darwins", "settings"]}>
        <DarwinsView />
        <div className="flex items-center overflow-x-scroll shrink-0">
          <div
            className="button w-[80px] p-2 px-1 ml-1"
            onClick={() => {
              const n = Number(prompt("初期Pop数変更(Number)"));
              if (n > 0) {
                console.log("^_^ Log \n file: App.tsx:105 \n n:", n);
                setDM(new DarwinManager(n));
                setLastDMInstance(DarwinManager.getInstance(0));
                setInitialDarwinCount(n);
              }
            }}
          >
            Pop: {DarwinManager.getPop()}
          </div>
          <div className="ml-1 border-l pl-1 w-[100px]">
            Foods: {N.formatNumber(DarwinManager.getFoods())}
          </div>
          <div className="ml-1 border-l pl-1 w-[90px]">
            b/d: {N.round(DarwinManager.getBirthRate(), 3)}
          </div>
          <div className="ml-1 border-l pl-1 w-[60px]">rate:{DM.ticker_rate}</div>
          <div className="flex z-0">
            <button
              className="ml-1"
              style={{ opacity: page > 0 ? 1 : 0.7 }}
              onClick={() => {
                page > 0 && setPage((c) => c - 1);
              }}
            >
              前
            </button>
            <button
              onClick={() => {
                DarwinManager.getPop() > (page + 1) * 20 && setPage((c) => c + 1);
              }}
              style={{
                opacity: DarwinManager.getPop() > (page + 1) * ITEM_PER_PAGE ? 1 : 0.7,
              }}
              className="ml-1"
            >
              次
            </button>
            <button
              onClick={() => {
                let title = prompt("データの名前");
                if (!title) return;
                title = "__saves__" + title;
                const saves = getSaves();
                if (saves.includes(title)) {
                  const overwrite = confirm(
                    "同じデータ名が存在します。上書きしてもよろしいですか？"
                  );
                  if (!overwrite) return;
                }
                localStorage.setItem("saves", JSON.stringify([...saves, title]));
                localStorage.setItem(title, JSON.stringify(DM));
                setSaves(getSaves());
              }}
              className="ml-1"
            >
              保存
            </button>
            <button
              className="ml-1 relative"
              onClick={() => {
                setSaves(getSaves());
              }}
            >
              読込
              <div className="opacity-0 hover:opacity-100 absolute w-full h-full border top-0 left-0">
                <div className="absolute right-0 bottom-full w-[200px] flex flex-col items-end pb-2">
                  {saves.map((save, i) => (
                    <div
                      key={i}
                      className="button relative flex p-2"
                      onClick={() => {
                        const saveData = JSON.parse(
                          localStorage.getItem(save) || "{}"
                        ) as DarwinManager;
                        if (saveData?.initial_darwin_count) {
                          setDM(new DarwinManager(0, saveData));
                          setLastDMInstance(DarwinManager.getInstance(0));
                        }
                        console.log(
                          "^_^ Log \n file: App.tsx:162 \n saveData:",
                          saveData
                        );
                      }}
                    >
                      {save.substring(9)}
                      <div
                        className="absolute left-full button top-0 py-2 px-1 ml-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(save.substring(9) + "を削除しますか？")) return;
                          localStorage.setItem(
                            "saves",
                            JSON.stringify(getSaves().filter((v) => v !== save))
                          );
                          localStorage.removeItem(save);
                          setSaves(getSaves());
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="red"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          </div>
        </div>
      </Tabs> */}
    </div>
  );
}
export default App;
