
import { StrokeSpinner } from "../spinner";
import { ReactComponent as Close } from "../../assets/close.svg";
export const Loading = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex justify-center pointer-events-none items-center z-[100]">
      <div className="h-[50px] w-[50px] inline-block relative pointer-events-auto">
        <div className="top-0 left-0 z-[2] absolute h-full w-full">
          <StrokeSpinner stroke="white" width="50" height="50" />
        </div>
        <div className="flex justify-center items-center h-[46px] w-[46px] left-[-1px] top-[-1px] rounded-[50%] border-[2px] text-[white] border-solid border-[rgba(255,255,255,0.1)] absolute ml-[3px] mt-[3px] bg-[rgba(11,20,26,0.7)]">
          <Close />
        </div>
      </div>
    </div>
  );
};