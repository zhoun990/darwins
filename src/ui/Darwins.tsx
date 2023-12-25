import { DarwinManager } from "../main/DarwinManager";

export const Darwins = () => {
  return (
    <>
      {DarwinManager.signal().darwins.map((dw, i) => (
        <div
          style={{
            position: "absolute",
            top: dw.y + "px",
            left: dw.x + "px",
            width: dw.w + "px",
            height: dw.h + "px",
            "background-color": dw.color,
            "border-radius": dw.weight + "px",
            opacity: dw.hp / dw.default_hp,
            "border-width": dw.tall / 10 + "px",
          }}
          class="border-blue-500 border-opacity-50"
        ></div>
      ))}
    </>
  );
};
