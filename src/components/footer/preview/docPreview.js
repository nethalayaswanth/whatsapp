

import { ReactComponent as Document } from "../../../assets/page.svg";




const Doc = ({ size, extension }) => {
  return (
    <div className="relative justify-center px-[20px] py-[20px] flex-1 items-center flex max-h-full max-w-full">
      <div className="w-[80%] aspect-[1] max-w-[280px] flex justify-center flex-col items-center p-[30px] rounded-[10px] bg-panel-header ">
        <div className="mb-[10px]">
          <Document />
        </div>
        <div className="my-[10px]">
          <span>No Preview Available</span>
        </div>
        <div className="text-[0.875rem]">
          {`${size} - ${extension.toUpperCase()}`}
        </div>
      </div>
    </div>
  );
};



export default Doc