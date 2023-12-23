import { DarwinManager } from "../main/DarwinManager";
import { N } from "../main/NumericUtils";
import { useEstate } from "../estate";
import { ITEM_PER_PAGE } from "../App";
import { memo } from "react";

export const SaveList = memo(() => {
  const darwinManagerInstance = DarwinManager.getInstance(0);
  const { setEstate: setMainEstate } = useEstate("main");
  const { initialDarwinCount, autoRestart, holdSeed, saves, savedData, page, setEstate } =
    useEstate("persist");

  const onSave = (title = "") => {
    if (!title) {
      const t = prompt("データの名前");
      if (typeof t === "string") {
        title = t;
      } else return;
    }
    title = "__saves__" + title;
    if (saves.includes(title)) {
      const overwrite = confirm("同じデータ名が存在します。上書きしてもよろしいですか？");
      if (!overwrite) return;
    }
    setEstate({
      page: (c) => c - 1,
      saves: (cv) => [...cv, title],
      savedData: (cv) => ({
        ...cv,
        [title]: JSON.parse(JSON.stringify(darwinManagerInstance)),
      }),
    });
  };
  return (
    <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
      <div className="m-2">
        <button onClick={() => onSave()} className="ml-1 border-white">
          新しいセーブデータを作成
        </button>
      </div>
      {saves.map((save, i) => (
        <div key={i} className="button relative flex flex-col p-2">
          {save.substring(9)}
          <div className="flex z-0">
            <button onClick={() => onSave(save.substring(9))} className="ml-1">
              上書き保存
            </button>
            <button
              className="ml-1 relative"
              onClick={() => {
                if (savedData[save]?.initial_darwin_count) {
                  setMainEstate({
                    lastDMInstance: new DarwinManager(0, savedData[save]),
                  });
                }
              }}
            >
              読込
            </button>
            <div
              className="ml-auto mr-2 button top-0 py-2 px-1"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(save.substring(9) + "を削除しますか？")) return;
                setEstate({
                  saves: (cv) => cv.filter((v) => v !== save),
                  savedData: (cv) => {
                    delete cv[save];
                    return cv;
                  },
                });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="red"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
