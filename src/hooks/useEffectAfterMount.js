import { useLayoutEffect,useRef } from "react";

export default function useEffectAfterMount(
  cb=()=>{},
  dependencies=[]
) {
  const justMounted = useRef(true);
  
  useLayoutEffect(() => {
    if (!justMounted.current) {
      return cb();
    }
    justMounted.current = false;
  }, [dependencies]);
}
