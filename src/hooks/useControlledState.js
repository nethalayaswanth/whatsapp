import { useRef,useState,useCallback } from "react"

export default function useControlledState(
  isExpanded,
  defaultExpanded
) {
  const [stateExpanded, setStateExpanded] = useState(defaultExpanded || false)
  const initiallyControlled = useRef(isExpanded !== null)
  const expanded = initiallyControlled.current
    ? (isExpanded )
    : stateExpanded
  const setExpanded = useCallback((n) => {
    if (!initiallyControlled.current) {
      setStateExpanded(n)
    }
  }, [])
 
  return [expanded,setExpanded];

}