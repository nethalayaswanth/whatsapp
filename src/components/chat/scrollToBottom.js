import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRefs } from "./refProvider";

const StateContext = createContext();
const DispatchContext = createContext();

function ScrollToBottom({ children }) {
  const [i, render] = useState(0);
  const { scroller } = useRefs();

  const scrollToBottom = useCallback(() => {
    render((i) => i + 1);
  }, []);

  useEffect(() => {

    const scrollerContainer = scroller.current;
    if (!scrollerContainer) return;
    console.log(scrollerContainer,
      scrollerContainer.scrollHeight - scrollerContainer.clientHeight
    );
    scrollerContainer.scrollTop =
      scrollerContainer.scrollHeight - scrollerContainer.clientHeight;
  }, [i, scroller]);

  return (
    <DispatchContext.Provider value={scrollToBottom}>
      {children}
    </DispatchContext.Provider>
  );
}

function useScrollToBottomState() {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error(
      "useScrollToBottomState must be used within a ScrollToBottom"
    );
  }
  return context;
}

function useScrollToBottomDispatch() {
  const context = useContext(DispatchContext);
  if (context === undefined) {
    throw new Error(
      "useScrollToBottomDispatch must be used within a ScrollToBottom"
    );
  }
  return context;
}
export { ScrollToBottom, useScrollToBottomDispatch, useScrollToBottomState };
