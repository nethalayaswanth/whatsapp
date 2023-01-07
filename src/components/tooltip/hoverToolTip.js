

import { useState, useLayoutEffect } from "react";
import useHover from "../../hooks/useHover";
import useCollapse from "../../hooks/useCollapse";
import { ReactComponent as Down } from "../../assets/down.svg";
import ToolTip from "./index";


const HoverToolTip=({align='left',children,value,style})=>{

 const [mountChildren, setMountChildren] = useState(true);

 const { Toggle, getCollapseProps } = useCollapse({
   collapseWidth: true,
   isExpanded:value,
   onExpandStart() {
     setMountChildren(true);
   },
   onCollapseEnd() {
     setMountChildren(false);
   },
 });




    return (
      <span>
        <ToolTip
          align={align}
          Button={
            <div
              {...getCollapseProps({
                style: {
                  ...style,
                },
              })}
            >
              <Down />
            </div>
          }
        >
          {children && children}
        </ToolTip>
      </span>
    );
}


export default HoverToolTip