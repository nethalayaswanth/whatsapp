
import { ReactComponent as Timer } from "../../assets/clock.svg";
import { ReactComponent as Tick } from "../../assets/tick.svg";
const Footer = ({ time, text, incoming, seen, sending, containMedia }) => {
  return (
    <div className="absolute bottom-[3px] right-[5px] mt-[-12px] mr-0 ml-[4px]  z-[10] ">
      <div
        className={`cursor-pointer whitespace-nowrap text-[0.6875rem] h-[15px] leading-[15px]  ${
          containMedia && !text
            ? "text-white text-opacity-[0.9]"
            : "text-message-timestamp-read"
        }`}
      >
        <span className="inline-block text-center align-top">{time}</span>
        {!incoming && (
          <div className="ml-[3px] inline-block text-message-icon">
            <span
              className={` ${
                !seen ? " text-message-timestamp-read" : "text-bubble-read"
              }`}
            >
              {sending ? <Timer /> : <Tick />}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};


export default Footer