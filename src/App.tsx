import { DarwinManager } from "./main/DarwinManager";
import { DarwinsView } from "./tabs/DarwinsView";
import { Tabs } from "./tabs/Tabs";
import { Environment } from "./tabs/Environment";
import { SaveList } from "./tabs/Saves";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { createEstate, setEstates } from "./estate";
import { Chunks } from "./ui/Chunks";
import { Darwins } from "./ui/Darwins";
export const ITEM_PER_PAGE = 50;
const { lastDMInstance } = createEstate("main");
const { initialDarwinCount, autoRestart, holdSeed, saves, page, setEstate } =
  createEstate("persist");
const [DM, setDM] = createSignal(DarwinManager.getInstance(0));
function App() {
  DarwinManager.onEnd = () => {
    setEstates.main({
      lastDMInstance: JSON.parse(
        JSON.stringify(
          new DarwinManager(
            initialDarwinCount(),
            holdSeed() ? lastDMInstance() : undefined,
            autoRestart()
          )
        )
      ),
    });
  };
  DarwinManager.onInstanceReplace = (instance) => {
    setDM(instance);
  };
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === " ") {
      DarwinManager.setPause(!DarwinManager.pause);
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });
  setEstates.main({
    lastDMInstance: JSON.parse(JSON.stringify(new DarwinManager(initialDarwinCount()))),
  });
  const pause = () => {
    DarwinManager.setPause(!DarwinManager.pause);
  };

  return (
    <div class="flex flex-col h-screen w-full overflow-hidden">
      <div
        class="relative shrink-0"
        style={{
          width: DarwinManager.width + "px",
          height: DarwinManager.height + "px",
          "background-color": "black",
        }}
        onClick={pause}
      >
        <Darwins />
        <Chunks />
      </div>
      {DarwinManager.signal().pop}
      <Tabs tabs={["Darwins", "Environment", "Saves"]} class="grow overflow-hidden mt-2">
        <DarwinsView />
        <Environment />
        <SaveList />
      </Tabs>
    </div>
  );
}
export default App;
