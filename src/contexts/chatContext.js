import { useState, useContext, createContext, useCallback } from "react";

import createStore from "./exStore";
const ChatContext = createContext();

const initialState = {
  open: false,
  reply: null,
  imageModalOpened: false,
  imageModal: null,
  detailsOpened: false,
};
function reducer(state, action) {
  switch (action.type) {
    case "set state": {
      return { ...state, ...action.payload };
    }
    case "toggle": {
      return { ...state, open: !state.open };
    }
    case "reply": {
      return { ...state, ...action.payload };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function ChatProvider({ children }) {

  const [store] = useState(() => createStore(initialState));

  return (
    <ChatContext.Provider value={store}>
     {children}
    </ChatContext.Provider>
  );
}

function useChatState() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

function useChatDispatch() {
  const chatStore = useContext(ChatContext);

  if (chatStore === undefined) {
    throw new Error("useChatDispatch must be used within a ChatProvider");
  }
  
  const dispatch = useCallback(
    (action) => {
      chatStore((state) => reducer(state, action));
    },
    [chatStore]
  );
  return dispatch;
}


export { ChatProvider, useChatDispatch, useChatState };

