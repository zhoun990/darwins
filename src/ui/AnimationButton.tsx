import { JSX } from "solid-js/jsx-runtime";

export const AnimationButton = (props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { class: className, children, ...others } = props;
  return (
    <button
      class="bg-green-900 rounded-lg shadow-[-100px]  border-x-yellow-400 border-b-yellow-600 border-t-yellow-200 overflow-hidden border-2"
      {...others}
    >
      <div class="border-[2px] border-l-blue-500 border-r-blue-700 border-b-blue-900 border-t-blue-300  w-full h-full rounded bg-blue-500">
      <div class="w-full h-full rounded bg-green-600 ">
        {children}
      </div>
      </div>
    </button>
  );
};
