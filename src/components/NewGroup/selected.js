import { ReactComponent as Close } from "../../assets/close.svg";

const Selected = ({ name, dp, id, onClick }) => {
  return (
    <div className="inline">
      <div className="mr-[6px] text-primary-default bg-panel-bg-lighter mb-[6px] rounded-[16px] align-top inline-flex w-[100%-6px] ">
        <div className="flex">
          <div className="flex-none flex items-center rounded-full overflow-hidden justify-center mr-[8px]">
            <div className="h-[26px] w-[26px]">
              <img alt="" src={dp} />
            </div>
          </div>
          <div className="basis-auto flex-grow flex-col flex  justify-center mr-[8px]">
            <div className="flex items-center justify-center">
              <div className="text-[13.5px] font-normal flex flex-grow break-words overflow-hidden text-ellipsis">
                <div className="text-ellipses overflow-hidden whitespace-nowrap flex-grow">
                  {name}
                </div>
              </div>
            </div>
          </div>
          <div
            onClick={onClick}
            className=" flex-auto text-text-secondary flex justify-center items-center
          "
          >
            <div className="flex items-center text-[13.5px] justify-center  m-[2px]  cursor-pointer rounded-full hover:bg-white ">
              <span>
                <Close width={16} height={16} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Selected;
