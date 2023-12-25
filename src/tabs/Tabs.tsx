import { JSX } from "solid-js/jsx-runtime";
import { createEstate } from "../estate";
const { tab, setEstate } = createEstate("persist");
export const Tabs = (
  props: { children: JSX.Element[]; tabs: string[]; style?: JSX.CSSProperties } & Omit<
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "style">,
    "children"
  >
) => {
  const { children, style, tabs, ...others } = props;
  return (
    <div style={{ "flex-direction": "column", display: "flex", ...style }} {...others}>
      <div class="flex">
        {tabs.map((title, i) => (
          <div
            style={{}}
            class={
              "rounded-[8px] border-[1px] border-solid text-[1em] font-medium [font-family:inherit] bg-[#1a1a1a] cursor-pointer [transition:border-color_0.25s] hover:border-[#646cff] outline-[4px_auto_-webkit-focus-ring-color] p-2 ml-2 rounded-b-none border-b-0 select-none grow last:mr-3 text-center max-w-[200px]" +
              (i === tab() ? " border-[#646cff]" : " border-[transparent] ")
            }
            onClick={() => {
              setEstate({ tab: i });
              // setTab(i);
            }}
          >
            {title}
          </div>
        ))}
      </div>
      <div class="bg-[#1a1a1a] grow overflow-auto flex flex-col">{children[tab()]}</div>
    </div>
  );
};
