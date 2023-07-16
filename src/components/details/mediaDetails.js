import { useState } from "react";
import { ReactComponent as Next } from "../../assets/next.svg";
import useTransition from "../../hooks/useTransition";
import { useDocumentsOfRoom, useMediaOfRoom } from "../../queries.js/messages";
import DrawerHeader from "../header/drawer";
import TabNavigation from "../tabNavigation";
import Documents from "./documents";
import Gallery from "./gallery";

const Media = ({ roomId }) => {
  const [openDrawer, setDrawer] = useState(false);

  const handleDrawerToggle = () => {
    setDrawer(true);
  };

  const { data: media } = useMediaOfRoom({ roomId });

  const { mount, getDisclosureProps, getParentProps } = useTransition({
    isExpanded: openDrawer,
    direction: "right",
  });

  const { data: documents } = useDocumentsOfRoom([roomId], {
    enabled: !!mount,
  });

  return (
    <>
      <div className="p-[30px] pt-[28px] mb-[10px] animate-land flex-shrink-0 flex-grow-0 bg-white  ">
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
          <Gallery roomId={roomId} media={media} length={6} />
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
                  <div className="w-full h-full   flex flex-col">
                    <div className="flex justify-center overflow-y-scroll">
                      <div className="flex flex-grow flex-wrap justify-center  p-[30px] pr-[20px] ">
                        <Gallery roomId={roomId} media={media} />
                      </div>
                    </div>
                  </div>
                  <Documents roomId={roomId} documents={documents}></Documents>
                </TabNavigation>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Media;
