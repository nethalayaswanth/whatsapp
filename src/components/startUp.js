


import { ReactComponent as StartUpIcon } from "../assets/startupIcon.svg";





export default function StartUp(){



    return (
      <div className="flex flex-col items-center justify-center  leading-[16px] fixed top-0 left-0 w-full h-full bg-primary-background ">
        <div className="start-up-icon text-icon-startup relative flex justify-center ">
          <span className="block">
            <StartUpIcon />
          </span>
        </div>
      </div>
    );
}