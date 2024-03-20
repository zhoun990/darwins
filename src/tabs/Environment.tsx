import { createEstate } from "../estate";
import { DarwinManager } from "../main/DarwinManager";

export const Environment = () => {
  const season = DarwinManager.getSeasonSignal();
  const { autoRestart, holdSeed, max_pop, setEstate } = createEstate("persist");

  return (
    <div class="flex flex-col">
      <div class="flex items-center shrink-0">Season:{season()}</div>
      <div class="flex items-center shrink-0">
        <input
          type="number"
          name="max-population"
          id="max-population"
          value={max_pop()}
          onChange={(e) => {
            setEstate({ max_pop: Number(e.target.value) });
          }}
          class="ml-2"
        />
        <label for="max-population" class="ml-2">
          Max Population
        </label>
      </div>
      <div class="flex items-center shrink-0">
        <input
          type="checkbox"
          name="auto-restart"
          id="auto-restart"
          checked={autoRestart()}
          onChange={() => {
            setEstate({ autoRestart: !autoRestart });
          }}
          class="ml-2"
        />
        <label for="auto-restart" class="ml-2">
          Auto Restart
        </label>
      </div>
      <div class="flex items-center shrink-0">
        <input
          type="checkbox"
          name="hold-seed"
          id="hold-seed"
          checked={holdSeed()}
          onChange={() => {
            console.log("^_^ Log \n file: Environment.tsx:60 \n onChange:");
            setEstate({ holdSeed: !holdSeed() });
          }}
          class="ml-2"
        />
        <label for="hold-seed" class="ml-2">
          Restart with same seed
        </label>
      </div>
    </div>
  );
};
