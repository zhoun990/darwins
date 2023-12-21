import { DarwinManager } from "../main/DarwinManager";
import { N } from "../main/NumericUtils";
import { useEstate } from "../estate";
import { ITEM_PER_PAGE } from "../App";

export const Environment = () => {
  const darwinManagerInstance = DarwinManager.getInstance(0);
  const { setEstate: setMainEstate } = useEstate("main");
  const { initialDarwinCount, autoRestart, holdSeed, saves, savedData, page, setEstate } =
    useEstate("persist");
  return (
    <div className="flex flex-col">
      
      <div className="flex items-center shrink-0">
        <input
          type="checkbox"
          name="auto-restart"
          id="auto-restart"
          defaultChecked={autoRestart}
          onChange={() => {
            setEstate({ autoRestart: !autoRestart });
          }}
          className="ml-2"
        />
        <label htmlFor="auto-restart" className="ml-2">
          Auto Restart
        </label>
      </div>
      <div className="flex items-center shrink-0">
        <input
          type="checkbox"
          name="hold-seed"
          id="hold-seed"
          defaultChecked={holdSeed}
          onChange={() => {
            console.log("^_^ Log \n file: Environment.tsx:60 \n onChange:");
            setEstate({ holdSeed: !holdSeed });
          }}
          className="ml-2"
        />
        <label htmlFor="hold-seed" className="ml-2">
          Restart with same seed
        </label>
      </div>
    </div>
  );
};
