import { Button } from "../Button.js";
import { ReactComponent as Arrow } from "../../assets/arrow.svg";
import { useCallback } from "react";

const DrawerHeader = ({ name,className,style, onClick }) => {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <header style={style} className={`flex flex-col justify-end h-[108px] pr-[20px] pl-[23px] flex-none bg-panel-header-coloured ${className}`}>
      <div className="flex items-center w-[full] p-0 bg-inherit h-[59px] text-white">
        <div className="w-[53px] flex items-center justify-start">
          <button
            className="m-0 p-0 outline-none border-0 cursor-pointer "
            onClick={handleClick}
          >
            <Arrow />
          </button>
        </div>
        <div className="mt-[-3px] font-medium flex flex-grow max-h-[46px] text-left leading-[23px] break-words text-[19px] overflow-hidden line-clamp-2">
          <h1 className="text-[inherit]">{name}</h1>
        </div>
      </div>
    </header>
  );
};

export default DrawerHeader;
