import { createEffect, createMemo } from "solid-js";
import { DarwinManager } from "../main/DarwinManager";

export const Darwins = () => {
  const darwins = createMemo(() => DarwinManager.signal().darwins.length);
  createEffect(() => {
    // console.log("^_^ ::: file: Darwins.tsx:6 ::: darwins:\n", darwins());
  });
  return <>{Array(darwins()).fill(0).map(Item)}</>;
};

const Item = (_: any, i: number) => {
  const dw = createMemo(() => ({ ...DarwinManager.signal().darwins[i] }), undefined, {
    equals: (a, b) => a.frame === b.frame,
  });

  return (
    <div
      style={{
        position: "absolute",
        top: dw().y + "px",
        left: dw().x + "px",
        width: dw().w + "px",
        height: dw().h + "px",
        "background-color": dw().color,
        "border-radius": dw().weight + "px",
        opacity: dw().hp / dw().default_hp,
        "border-width": dw().tall / 10 + "px",
      }}
      class="border-blue-500 border-opacity-50"
    ></div>
  );
};
