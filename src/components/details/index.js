import useDisclosure from "../../hooks/useDisclosure";
import { ReactComponent as Close } from "../../assets/close.svg";
import { ReactComponent as Next } from "../../assets/next.svg";
import { ReactComponent as DefaultAvatar } from "../../assets/avatar.svg";
import { FormatEmoji } from "../../shared";
import TabNavigation from "../tabNavigation";
import useTransition from "../../hooks/useTransition";
import { useState } from "react";
import DrawerHeader from "../header/drawer";
import Gallery from "./gallery";
import Documents from "./documents";
import {
  useDocumentsOfRoom,
  useMediaOfRoom,
} from "../../requests.js/useRequests";
import { useMemo } from "react";

export function Details({ roomId }) {
  const [openDrawer, setDrawer] = useState(false);

  const handleDrawerToggle = () => {
    setDrawer(true);
  };

  const { data: mediaData } = useMediaOfRoom([roomId]);

  const media = useMemo(() => {
    if (Object.keys(mediaData).length === 0) return [];
    return Object.keys(mediaData)
      .reverse()
      .map((messageId, i) => {
        return mediaData[messageId];
      });
  }, [mediaData]);



  const { mount, getDisclosureProps, getParentProps } = useTransition({
    isExpanded: openDrawer,
    direction: "right",
  });

  const { data: documents } = useDocumentsOfRoom([roomId], {
    enabled: !!mount,
  });

  return (
    <>
      <div className="flex flex-col h-full w-full">
        <div className="header z-[1000] justify-start pr-[20px] pl-[25px] ">
          <div className="flex  justify-start">
            <div className="w-[56px] flex items-center">
              <button>
                <Close />
              </button>
            </div>
            <div className="max-h-[46px] text-[16px] leading-normal flex-grow-1 ">
              <h1>Account Info</h1>
            </div>
          </div>
        </div>
        <div className="flex flex-1 overflow-y-scroll flex-col  justify-start">
          <div className="p-[30px] pt-[28px] mb-[10px] animate-pop flex-shrink-0 flex-grow-0 bg-white  ">
            <div className="flex-none  flex flex-col justify-center ">
              <div className="flex justify-center items-center">
                <div
                  //ref={ref}
                  className="mb-[15px] w-[200px] h-[200px] relative "
                >
                  <div className="cursor-pointer mb-[10px] bg-center rounded-full relative overflow-hidden h-full w-full">
                    <div className="absolute z-[500] flex justify-center items-center top-0 left-0 h-full w-full">
                      <DefaultAvatar />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-start items-center ">
                <h2 className="text-[24px] font-normal align-center">Mony</h2>
                <div className="mt-[4px] leading-[1.5] ">
                  <span className="text-[16px]">@MOnyNaethala</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-[30px] pt-[28px] mb-[10px] animate-pop flex-shrink-0 flex-grow-0 bg-white  ">
            <div className="mb-[8px]">
              <span className="text-[14px] leading-normal text-text-secondary ">
                About
              </span>
            </div>
            <span></span>
          </div>
          <div className="p-[30px] pt-[28px] mb-[10px] animate-pop flex-shrink-0 flex-grow-0 bg-white  ">
            <div
              className="mb-[8px] flex items-center text-text-secondary cursor-pointer p-0"
              onClick={handleDrawerToggle}
            >
              <span className="text-[14px] flex-1 leading-normal  ">
                Media and Docs
              </span>
              <div className="flex-none ml-[10px] flex items-center">
                <div>
                  <Next />
                </div>
              </div>
            </div>
            <div className="flex flex-grow flex-wrap justify-center  pt-[6px]  overflow-y-scroll">
              <Gallery media={media?.slice(0,6)} />
            </div>
          </div>

          {mount && (
            <div className="absolute z-[1002]  left-0 top-0 w-full h-full">
              <div
                {...getParentProps({
                  style: {
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                  },
                })}
              >
                <div
                  {...getDisclosureProps()}
                  className="bg-panel-header h-full w-full"
                >
                  <div className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden pointer-events-auto bg-drawer-bg flex flex-col ">
                    <DrawerHeader
                      style={{ height: "59px" }}
                      className={"h-[59px] "}
                      onClick={() => {
                        setDrawer(false);
                      }}
                      name={" "}
                    />

                    <TabNavigation
                      className="text-white border-0  bg-panel-header-coloured"
                      activeBar="#25d366"
                      activetext="white"
                    >
                      <div className="w-full  flex flex-col">
                        <div className="flex flex-grow flex-wrap justify-center  p-[30px] pr-[20px] overflow-y-scroll">
                          <Gallery media={media} />
                        </div>
                      </div>

                      <Documents documents={documents}></Documents>
                    </TabNavigation>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
