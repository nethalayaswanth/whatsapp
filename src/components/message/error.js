import { ReactComponent as ErrorIcon } from "../../assets/error.svg";

export default function Failed() {
  return (
    <div className="absolute top-0 right-[-15px]  h-full flex items-center">
      <div className="bg-danger border-white border-solid rounded-full z-[1000] text-white w-[24px] h-[24px] flex justify-center items-center">
        <span>
          <ErrorIcon />
        </span>
      </div>
    </div>
  );
}
