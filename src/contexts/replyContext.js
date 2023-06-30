import * as React from "react";

const State = React.createContext();
const Dispatch = React.createContext();

const initialState = {
  opened:false
};
function Reducer(state, action) {
  switch (action.type) {
    case "open": {
      return { ...state, opened: true, ...action.payload };
    }
    case "close": {
      return { ...state, opened: false };
    }
    case "reset": {
      return { ...initialState };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function ReplyProvider({ children, props }) {
  const [state, dispatch] = React.useReducer(Reducer, initialState);

  return (
    <State.Provider value={state}>
      <Dispatch.Provider value={dispatch}>
        {children}
      </Dispatch.Provider>
    </State.Provider>
  );
}

function useReplyState() {
  const context = React.useContext(State);
  if (context === undefined) {
    throw new Error("useReplyState must be used within a ReplyProvider");
  }
  return context;
}

function useReplyDispatch() {
  const context = React.useContext(Dispatch);
  if (context === undefined) {
    throw new Error("useReplyDispatch must be used within a ReplyProvider");
  }
  return context;
}
export { ReplyProvider, useReplyState, useReplyDispatch };
