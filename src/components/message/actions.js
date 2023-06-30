import useHover from "../../hooks/useHover";
import HoverToolTip from "../tooltip/hoverToolTip";
import { callAll } from "../../utils";
import { MenuContainer } from "../Menu";
import { useMessageState } from "../../contexts/messageContext";

const messageActions = [
  "Message info",
  "Reply",
  "React to message",
  "Forward message",
  "Delete message",
];

const Actions = ({ reply, handleMessgeAction }) => {
  const {isHovering}=useMessageState()

  return (
    <span>
      <div
        className={`absolute z-[800] right-[3px] pointer top-[3px] w-[42px] max-w-[90%] h-[27px] overflow-hidden pointer-events-none text-bubble-icon ${
          isHovering && !reply && "down"
        }  `}
      >
        <div className="right-[5px] top-[5px]  cursor-pointer absolute  h-[18px] pointer-events-auto ">
          <HoverToolTip
            value={isHovering}
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              position: "relative",
              right: 0,
            }}
          >
            {({ closeToolTip }) => (
              <MenuContainer
                items={messageActions}
                onClick={callAll(handleMessgeAction, closeToolTip)}
              />
            )}
          </HoverToolTip>
        </div>
      </div>
    </span>
  );
};

export default Actions