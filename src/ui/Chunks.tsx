import { DarwinManager } from "../main/DarwinManager";
import { N } from "../main/NumericUtils";
import { Chunk } from "../main/Chunk";

export const Chunks = () => {
  return (
    <>
      {DarwinManager.signal().chunks.map((ch, i) => (
        <div
          style={{
            position: "absolute",
            top: ch.y * Chunk.size + "px",
            left: ch.x * Chunk.size + "px",
          }}
          class={`hover:opacity-100 opacity-0 w-[${Chunk.size}px] h-[${
            Chunk.size
          }px] hover:w-[${Chunk.size * 2}px] hover:h-[${
            Chunk.size * 2
          }px] text-blue-100 z-10`}
        >
          <div
            class="absolute border border-gray-300 pointer-events-none"
            style={{ width: Chunk.size + "px", height: Chunk.size + "px" }}
          />
          <div class="bg-gray-500 bg-opacity-75 pointer-events-none absolute">
            <div> pop: {ch.darwins.length}</div>
            <div> foods: {N.round(ch.foods)}</div>
            <div> elevation: {N.round(ch.elevation)}</div>
            <div> temperature: {N.round(ch.temperature)}</div>
            <div> sunlight: {N.round(ch.sunlight)}</div>
            <div> water: {N.round(ch.water)}</div>
          </div>
        </div>
      ))}
    </>
  );
};
