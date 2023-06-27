import { useCallback, useLayoutEffect, useState } from "react";

export default function useMount(open) {
  const [mount, setMount] = useState(open);

  const unMount = useCallback(() => {
    setMount(false);
  }, []);

   if (open && !mount) {
     setMount(true);
   }
  
  // useLayoutEffect(() => {
  //   if (open) {
  //     setMount(true);
  //   }
  // }, [open]);

  return [mount, unMount];
}
