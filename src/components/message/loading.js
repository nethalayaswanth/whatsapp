
import { StrokeSpinner } from "../spinner";
export const Loading = ({ id, width = 50, strokeWidth = 2, children }) => {
  return (
    <div
      className={`absolute [--width:${width}] [--stroke-width:${strokeWidth}] top-0 left-0 w-full h-full flex justify-center pointer-events-none items-center z-[100]`}
    >
      <div className="h-[var(--width)] w-[var(--width)] inline-block relative pointer-events-auto">
        <div
          id={`${id}-progress`}
          className="top-0 left-0 z-[2] absolute h-full w-full"
        >
          <StrokeSpinner stroke="white" width="50" height="50" />
        </div>
        <div className="flex justify-center items-center h-[var(--stroke-width)] w-[var(--stroke-width)] left-[-1px] top-[-1px] rounded-[50%] border-[2px] text-[white] border-solid border-[rgba(255,255,255,0.1)] absolute ml-[3px] mt-[3px] bg-[rgba(11,20,26,0.7)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Progress = ({
  id,
  width = 50,
  strokeWidth = 3,
  children,
  fill,
  stroke = "#00a884",
  strokeTrack = "rgba(255,255,255,0.1)",
  bg='rgba(11,20,26,0.7)',
  onClick
}) => {
  const center = width / 2;

  const childWidth = width - 2 * strokeWidth;
  const radius = (width - strokeWidth) / 2;

  return (
    <div
      onClick={onClick}
      className={`absolute [--width:${width}px] [--stroke-width:${strokeWidth}px] top-0 left-0 w-full h-full flex justify-center pointer-events-none items-center z-[100]`}
    >
      <div
        className={`h-[${width}px] w-[${width}px] inline-block relative pointer-events-auto`}
      >
        <div
          id={`${id}-progress`}
          className="top-0 left-0 z-[2] absolute h-full w-full"
        >
          <svg
            className={``}
            viewBox={`0 0 ${width} ${width}`}
            width={width}
            height={width}
            style={{}}
            role="status"
          >
            <circle
              style={{ stroke: strokeTrack }}
              cx={center}
              cy={center}
              r={radius}
              fill={`${fill ? fill : "transparent"}`}
              stroke-width={strokeWidth}
            ></circle>
            <circle
              id={`${id}-progress-circle`}
              style={{
                stroke,
                transition: "stroke-dashoffset 0.35s",
                transform: "rotate(-90deg)",
                transformOrigin: "50% 50%",
                strokeDasharray: radius * Math.PI * 2,
                strokeDashoffset: radius * Math.PI * 2,
              }}
              className={``}
              cx={center}
              cy={center}
              r={radius}
              fill={`${fill ? fill : "transparent"}`}
              stroke-width={strokeWidth}
            ></circle>
          </svg>
        </div>
        <div className="h-full w-full absolute top-0 left-0 justify-center items-center flex">
          <div
            style={{
              height: `${childWidth}px`,
              width: `${childWidth}px`,
            }}
            className={`flex justify-center items-center  rounded-[50%] border-[2px] text-[white] border-solid border-[rgba(255,255,255,0.1)] box-border  absolute bg-[${bg}]`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};