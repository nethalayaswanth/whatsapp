import * as React from "react";

const ModalState = React.createContext();
const ModalDispatch = React.createContext();

const initialState = {
  galleryModal: false,
  imageModal:false,
  opened:false

};
function ModalReducer(state, action) {
  switch (action.type) {
    case "set state": {
      return { ...state, ...action.payload };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function ModalProvider({ children, props }) {
  const [state, dispatch] = React.useReducer(ModalReducer, initialState);

 
  return (
    <ModalState.Provider value={state}>
      <ModalDispatch.Provider value={dispatch}>{children}</ModalDispatch.Provider>
    </ModalState.Provider>
  );
}

function useModalState() {
  const context = React.useContext(ModalState);
  if (context === undefined) {
    throw new Error("useModalState must be used within a ModalProvider");
  }
  return context;
}

function useModalDispatch() { 
  const context = React.useContext(ModalDispatch);
  if (context === undefined) {
    throw new Error("useModalDispatch must be used within a ModalProvider");
  }
  return context;
}
export { ModalProvider, useModalState, useModalDispatch };
