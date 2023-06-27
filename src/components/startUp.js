


import { ReactComponent as StartUpIcon } from "../assets/startupIcon.svg";





export default function StartUp({children,className}){



    return (
      <div
        className={`flex flex-col items-center justify-center  leading-[16px] fixed top-0 text-icon-startup  left-0 w-full h-full bg-primary-background ${
          className ? className : ""
        }`}
      >
        <div className="start-up-icon relative flex justify-center ">
          <span className="block">
            <StartUpIcon />
          </span>
        </div>
        <div className="text-sm p-4 mt-10">{children}</div>
      </div>
    );
}