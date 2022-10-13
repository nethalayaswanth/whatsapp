import document from "../../assets/document.png";
import { ReactComponent as Download } from "../../assets/download.svg";

export default function DocMessage({ url, size, type, name,className }) {
  return (
    <div className={`z-[1] rounded-[6px] overflow-hidden  relative  max-w-full ${className && className}`}>
      <div className=" cursor-pointer overflow-hidden   w-full  m-0 flex flex-col justify-center">
        <div className=" w-full flex-col relative flex overflow-hidden">
          <div className="bg-[color:var(--deeper)] rounded-[7.5px]  py-[13px] px-[19px]  flex flex-1 flex-col justify-center min-h-0 min-w-0">
            <div className="h-[34px]  flex  items-center">
              <div className="min-w-0 flex-grow-0 flex-shrink-0 basis-auto ">
                <div
                  style={{
                    backgroundImage: `url(${document})`,
                  }}
                  className="h-[30px] w-[26px] bg-cover "
                ></div>
              </div>
              <div className="mx-[10px] flex-1 text-ellipsis overflow-hidden whitespace-nowrap top-[-2px] relative ">
                <span>{name && name}</span>
              </div>
              <div className="min-w-0 min-h-0 flex-0  text-panel-header-icon  text-opacity-[0.5] ">
                <div className="h-[34px] w-[34px] flex justify-center items-center relative">
                  <a
                    href={url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>
                      <Download />
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="cursor-pointer whitespace-nowrap text-[0.6875rem] h-[15px] text-message-timestamp-read leading-[15px]  pl-[6px] pr-[4px]">
            {" "}
            <span>{size && size}</span>
            <span className=" mx-[4px] text-opacity-[0.5] text-message-timestamp-read">
              •
            </span>
            <span> {type && type.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
