import { DarwinManager } from "../main/DarwinManager";
import { N } from "../main/NumericUtils";
import { Chunk } from "../main/Chunk";
import { createEffect, createMemo } from "solid-js";

export const Chunks = () => {
  const size = Chunk.size;
  return (
    <>
      {DarwinManager.getInstance(0).chunks.map((ch, i) => (
        <Item i={i} />
      ))}
    </>
  );
};
const Item = ({ i }: { i: number }) => {
  const ch = createMemo(() => ({ ...DarwinManager.signal().chunks[i] }), undefined, {
    equals: (a, b) => a.frame === b.frame,
  });
  createEffect(() => {
    console.log("^_^ ::: file: Chunks.tsx:18 ::: ch:\n", ch());
  });
  const size = Chunk.size;

  return (
    <div
      style={{
        position: "absolute",
        top: ch().y * size + "px",
        left: ch().x * size + "px",
        width: size + "px",
        height: size + "px",
      }}
      class={`hover:opacity-100 opacity-0 w-[${size}px] h-[${size}px] hover:w-[${
        size * 2
      }px] hover:h-[${size * 2}px] text-blue-100 z-10`}
    >
      <div
        class="absolute border border-gray-300 pointer-events-none"
        style={{ width: size + "px", height: size + "px" }}
      />
      <div class="bg-gray-500 bg-opacity-75 pointer-events-none absolute">
        <div> pop: {ch().darwins.length}</div>
        <div> foods: {N.round(ch().foods)}</div>
        <div> elevation: {N.round(ch().elevation)}</div>
        <div> temperature: {N.round(ch().temperature)}</div>
        <div> sunlight: {N.round(ch().sunlight)}</div>
        <div> water: {N.round(ch().water)}</div>
      </div>
    </div>
  );
};
