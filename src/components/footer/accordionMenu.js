import { useRef, useState, cloneElement, useCallback, useEffect } from "react";
import { ReactComponent as Gif } from "../../assets/gif.svg";
import { ReactComponent as Emoji } from "../../assets/emoji.svg";
import { ReactComponent as Sticker } from "../../assets/sticker.svg";
import { ReactComponent as Close } from "../../assets/close.svg";
import { ReactComponent as AttachmentIcon } from "../../assets/attachment.svg";
import { useFooter } from "../../contexts/footerContext";

const Menu = {
  close: <Close />,
  emoji: <Emoji />,
  gif: <Gif />,
  sticker: <Sticker />,
};

export const Button = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="mr-[8px] last:mr-0 p-0 outline-none border-0 cursor-pointer h-full absolute top-0 left-0 transition-all duration-300"
    >
      {children}
    </button>
  );
};

const AccordionMenu = () => {

  const [footer, setFooterState] = useFooter();

  const handleClose = useCallback(() => {
   
    setFooterState({ type: "toggle bottomSheet" });
  }, [setFooterState]);

  const handleNavigation = useCallback(
    (active) => {
      
      setFooterState({
        type: "set activeTab",
        activeTab: active ,
      });
    },
    [setFooterState]
  );

  const open = footer.bottomSheetOpened;
  return (
    
      <>
        <div
          style={{ ...(open && { width: "152px", margin: "0px" }) }}
          className=" flex mr-[8px] relative w-[26px] h-full transition-all duration-300"
        >
          {Object.entries(Menu).map(([key, Icon], i) => {
            const opacity = key === "emoji" ? 1 : open ? 1 : 0;
            const close = key === "close";
            const visibility =
              key === "emoji" || key === "close"
                ? "visible"
                : open
                ? "visible"
                : "hidden";

            const x = i * 26 + i * (152 / 4 - 26);

            const transform = `translate(${x}px,0px)`;

            return (
              <Button
                onClick={
                  close
                    ? handleClose
                    : open
                    ? () => {
                        handleNavigation(key);
                      }
                    : undefined
                }
                style={{
                  opacity: opacity,
                  visibility,
                  ...(open && { transform }),
                  ...(close && { zIndex: 2 }),
                }}
                key={key}
                name={key}
              >
                {Icon}
              </Button>
            );
          })}
        </div>
        <button
          onClick={() => {
            handleNavigation("attachment");
          }}
          className="mr-[8px]"
        >
          <AttachmentIcon />
        </button>
      </>
   
  );
};

export default AccordionMenu;
