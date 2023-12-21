import { ReactNode, useEffect, useState } from "react";
import { useEstate } from "../estate";

export const Tabs = (
  props: { children: ReactNode[]; tabs: string[] } & Omit<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    "children"
  >
) => {
  const { children, style, tabs, ...others } = props;
  const { tab, setEstate } = useEstate("persist");
  // const [tab, setTab] = useState(0);
  useEffect(() => {
    console.log("^_^ Log \n file: App.tsx:249 \n tab:", tab);
  }, [tab]);
  return (
    <div style={{ flexDirection: "column", display: "flex", ...style,}} {...others}>
      <div className="flex">
        {tabs.map((title, i) => (
          <div
            key={i}
            style={{}}
            className={
              "rounded-[8px] border-[1px] border-solid border-[transparent] text-[1em] font-medium [font-family:inherit] bg-[#1a1a1a] cursor-pointer [transition:border-color_0.25s] hover:border-[#646cff] outline-[4px_auto_-webkit-focus-ring-color] p-2 ml-2 rounded-b-none border-b-0 select-none grow last:mr-3 text-center max-w-[200px]" +
              (i === tab ? " border-[#646cff]" : "")
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
      <div className="bg-[#1a1a1a] grow overflow-auto flex flex-col">{children[tab]}</div>
    </div>
  );
};
