import { useRef } from "react";
import { useCallback, useLayoutEffect, useState } from "react";

// export default function useMount(open) {
//   const [mount, setMount] = useState(open);

//   const unMount = useCallback(() => {
//     setMount(false);
//   }, []);

//    if (open && !mount) {
//      setMount(true);
//    }
  
//   // useLayoutEffect(() => {
//   //   if (open) {
//   //     setMount(true);
//   //   }
//   // }, [open]);

//   return [mount, unMount];
// }

export default function useMount(open) {
  const mount = useRef(open);
   const [_, forceRender] = useState();

  const unMount = useCallback(() => {
     mount.current=false
    forceRender()
  }, []);

  if (mount.current!== true && open ) {
    mount.current=true
  }

  // useLayoutEffect(() => {
  //   if (open) {
  //     setMount(true);
  //   }
  // }, [open]);

  return [mount.current, unMount];
}

