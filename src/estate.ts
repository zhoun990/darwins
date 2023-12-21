import { createEstate } from "@e-state/react";
import { DarwinManager } from "./main/DarwinManager";
export const { useEstate, clearEstate, setEstates, store } = createEstate(
  {
    main: {
      lastDMInstance: undefined as undefined | DarwinManager,
    },
    persist: {
      initialDarwinCount: 500,
      autoRestart: true,
      holdSeed: true,
      tab: 0,
      page: 0,
      saves: [] as string[],
      savedData: {} as Record<string, DarwinManager>,
    },
  },
  {
    persist: ["persist"],
  }
);
