import * as React from "react";

const ChatContext = React.createContext();

const initialState = {
  open: false,
  reply: null,
  imageModalOpened: false,
  imageModal: null,
  detailsOpened: false,
};
function ChatReducer(state, action) {
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
  const [state, dispatch] = React.useReducer(ChatReducer, initialState);

  const value = [state, dispatch];
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

function useChat() {
  const context = React.useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

export { ChatProvider, useChat };
