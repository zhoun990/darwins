import { GlobalStore, createEstate } from "@e-state/react";
export const { useEstate, clearEstate, setEstates, store } = createEstate(
  {
    // main: {},
    persist: {
      // autoRestart: true,
      // holdSeed: true,
      // tab:0,
      // page:0
      text:0
    },
  },
  {
    persist: ["persist"],
  }
);
