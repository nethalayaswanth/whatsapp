import { forwardRef, useCallback, useMemo, useRef } from "react";

import { ReactComponent as Pin } from "../../assets/pin.svg";
import useHover from "../../hooks/useHover";

import { callAll, mergeRefs } from "../../utils";
import { MenuContainer } from "../Menu";

import { Avatar as Dp } from "../Avatar";
import HoverToolTip from "../tooltip/hoverToolTip";

const Actions = ({
  getNode,
  handleActions,
  actions,
  __TYPE = "Actions",
} = {}) => {
  const [_, isHovering] = useHover(getNode);
  
  return (
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
          items={actions}
          onClick={callAll(handleActions, closeToolTip)}
        />
      )}
    </HoverToolTip>
  );
};

const Online = ({ className, __TYPE = "Online" } = {}) => {
 
  return (
    <div className="ml-[2px] flex justify-center items-center align-top ">
      <span
        className={` h-[8px] w-[8px]  rounded-[4px] font-semibold text-center text-white bg-unread-timestamp   `}
      ></span>
    </div>
  );
};

const Unread = ({ unread, className, __TYPE = "Unread" } = {}) => {
  return (
    <span>
      <div className="mr-[0px] inline-block align-top ">
        <span
          className={`px-[0.4em] pt-[0.3em] inline-block pb-[0.4em] text-[0.75rem] leading-[1] min-h-[1em] min-w-[1.7em] rounded-[1.1em] font-semibold text-center text-white bg-unread-timestamp   `}
        >
          {unread}
        </span>
      </div>
    </span>
  );
};

const Time = ({ children, time, unread, __TYPE = "Time" } = {}) => {
  return (
    <div
      className={`ml-[6px] mt-[3px] text-[12px] text-ellipsis whitespace-nowrap overflow-hidden leading-[14px] flex-none ${
        !unread ? `` : `text-unread-timestamp`
      } max-w-full`}
    >
      {children ? children : time ? time : null}
    </div>
  );
};

const Details = ({ className, children, text, __TYPE = "Details" } = {}) => {
  return (
    <div
      className={` overflow-hidden text-[13px] leading-[20px] flex-grow text-ellipsis whitespace-nowrap text-left   ${
        className ? className : ``
      }`}
    >
      <span>{children ? children : text ? text : null}</span>
    </div>
  );
};

const Title = ({ children, text, className, __TYPE = "Title" } = {}) => {
  return (
    <div
      className={`flex leading-normal text-left text-[17px] text-primary-strongest flex-grow overflow-hidden break-words`}
    >
      <span
        className={`inline-block overflow-hidden text-ellipsis whitespace-nowrap flex-grow relative ${
          className ? className : ``
        }`}
      >
        {children ? children : text}
      </span>
    </div>
  );
};

const Avatar = ({ src, className, width } = {}) => {
  return (
    <div
      style={{ width }}
      className={`h-[49px] w-[49px] relative overflow-hidden rounded-full ${
        className ? className : ``
      }`}
    >
      <Dp src={src} />
    </div>
  );
};

const Container = forwardRef(
  (
    {
      onClick,
      selected,
      dp,
      online,
      pinned,
      unread,
      typing,
      handleActions,
      title,
      details,
      time,
      className,
      children,
      tooltip = true,
    },
    ref
  ) => {
    const actions = useMemo(
      () => [pinned ? "unpin" : "pin", "clear chat", "delete chat"],
      [pinned]
    );

    const containerRef = useRef();

    const getNode = useCallback(() => {
      return containerRef.current;
    }, []);

    return (
      <div
        ref={mergeRefs(ref, containerRef)}
        onClick={onClick}
        className={`w-full group   h-[72px]  first:border-t-[1px]
             border-solid border-border-list last:border-b-[1px]    ${
               selected ? `bg-panel-header` : `bg-white hover:bg-panel-bg-hover`
             } ${className ? className : ""}`}
      >
        <div className="h-full cursor-pointer flex relative flex-row pointer-events-auto ">
          <div className="flex">
            <div className="flex items-center pl-[15px] pr-[13px]">
              <div className="h-[49px] w-[49px] relative overflow-hidden rounded-full">
                <Avatar src={dp} />
              </div>
            </div>
          </div>
          <div
            className={`pr-[15px] border-b-[1px] group-last:border-b-[0px]
          
             border-solid border-border-list flex flex-col basis-auto  justify-center min-w-0 flex-grow `}
          >
            <div className="flex items-center leading-normal text-left ">
              <div
                className={`flex leading-normal ${
                  !unread ? `font-regular` : `font-medium`
                } text-left text-[17px] text-primary-strongest flex-grow overflow-hidden break-words`}
              >
                <span className="inline-block overflow-hidden text-ellipsis whitespace-nowrap flex-grow relative ">
                  {title}
                </span>
              </div>

              {!online && (
                <div
                  className={`ml-[6px] mt-[3px] text-[12px] text-ellipsis whitespace-nowrap overflow-hidden leading-[14px] flex-none ${
                    !unread ? `` : `text-unread-timestamp`
                  } max-w-full`}
                >
                  {time && time}
                </div>
              )}
              {online && (
                <div className="ml-[2px] flex justify-center items-center align-top ">
                  <span
                    className={` h-[8px] w-[8px]  rounded-[4px] font-semibold text-center text-white bg-unread-timestamp   `}
                  >
                    {unread}
                  </span>
                </div>
              )}
            </div>
            <div className="font-normal flex items-center min-h-[20px]   ">
              <div
                className={`${
                  !unread ? `font-regular` : `font-medium`
                } overflow-hidden text-[13px] leading-[20px] flex-grow text-ellipsis whitespace-nowrap text-left ${
                  typing
                    ? `text-unread-timestamp  font-medium `
                    : `text-secondary-stronger`
                }`}
              >
                <span>{typing ? typing : details ? details : null}</span>
              </div>
              <div className="flex-none flex justify-center ml-[6px] items-center max-w-full text-[12px] text-bubble-icon leading-[20px]   font-semibold">
                {pinned && (
                  <span>
                    <div className="mr-[0px] inline-block align-top ">
                      <span>
                        <Pin />
                      </span>
                    </div>
                  </span>
                )}
                {unread !== 0 && unread && (
                  <span>
                    <div className="mr-[0px] inline-block align-top ">
                      <span
                        className={`px-[0.4em] pt-[0.3em] inline-block pb-[0.4em] text-[0.75rem] leading-[1] min-h-[1em] min-w-[1.7em] rounded-[1.1em] font-semibold text-center text-white bg-unread-timestamp   `}
                      >
                        {unread}
                      </span>
                    </div>
                  </span>
                )}
                {tooltip && ( 
                  <Actions {...{ getNode, handleActions, actions }} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
 
//const Card={Container,Avatar,Actions,Time,Title,Details,Online,Unread}

export default Container;
