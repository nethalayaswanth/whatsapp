import { forwardRef } from "react";
import { createPortal } from "react-dom";

import {
  useFooterDispatch,
  useFooterState,
} from "../../../contexts/footerContext";

import { useMemo } from "react";
import "react-image-crop/dist/ReactCrop.css";
import useTransition from "../../../hooks/useTransition";

const PreviewDialog = forwardRef(({ children, ...props }, ref) => {
  const gifOverlay = useMemo(() => document.getElementById("main-overlay"), []);
  const footer = useFooterState();
  const setFooterState = useFooterDispatch();

  const open = footer.previewDialogOpened;

  const { mount, getDisclosureProps, getParentProps } = useTransition({
    isExpanded: open,
    direction: "bottom",
    onCollapseEnd: () => {
      //console.log("collapsing");
      setFooterState({ type: "reset previewDialog" });
    },
  });

  console.log(open)
  return (
    <>
      {mount &&
        createPortal(
          <div className="w-full h-full overflow-hidden pointer-events-auto border-l  border-solid border-border-header absolute top-0 left-0 ">
            <div
              {...getParentProps({
                style: { width: "100%", height: "100%", overflow: "hidden" },
              })}
            >
              <div
                {...getDisclosureProps()}
                className="h-[calc(100%-var(--panel-header))] flex flex-grow flex-col  bg-white w-full"
              >
                {children}
              </div>
            </div>
          </div>,
          gifOverlay
        )}
    </>
  );
});

export default PreviewDialog;
