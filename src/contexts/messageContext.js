import { useState, useContext, createContext, useCallback } from "react";

import createStore from "./exStore";
const MessageContext = createContext();

const initialState = {
  isHovering: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "set state":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

function MessageProvider({ children }) {
  const [store] = useState(() => createStore(initialState));

  return (
    <MessageContext.Provider value={store}>{children}</MessageContext.Provider>
  );
}

function useMessageState() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessageState must be used within a MessageProvider");
  }
  return context;
}

function useMessageDispatch() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessageDispatch must be used within a MessageProvider");
  }

  const dispatch = useCallback(
    (action) => {
      context((state) => reducer(state, action));
    },
    [context]
  );
  return dispatch;
}

export { MessageProvider, useMessageDispatch, useMessageState };
