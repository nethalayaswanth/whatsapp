import * as React from "react";

const FooterContext = React.createContext();

const initialState = {
  bottomSheetOpened: false,
  tabsOpened: false,
  activeTab: "emoji",
  gifDialogOpened: false,
  previewModalOpened: false,
  gifSelected: null,
  fileSelected: null,
  fileType:null,
  text: "",
  inputRef: null,
  propInputRef: null,
};
function FooterReducer(state, action) {
  switch (action.type) {
    case "set state": {
      return { ...state, ...action.payload };
    }
    case "set activeTab": {
      return { ...state, activeTab: action.activeTab, bottomSheetOpened: true };
    }
    case "close bottomSheet": {
      return { ...state, bottomSheetOpened: false };
    }
    case "open bottomSheet": {
      return { ...state, bottomSheetOpened: true };
    }
    case "toggle bottomSheet": {
      if (!state.bottomSheetOpened && state.activeTab === "attachment") {
        return {
          ...state,
          bottomSheetOpened: !state.bottomSheetOpened,
          activeTab: "emoji",
        };
      }
      return { ...state, bottomSheetOpened: !state.bottomSheetOpened };
    }
    case "toggle gifDialog": {
      return { ...state, gifDialogOpened: !state.gifDialogOpened };
    }
    case "toggle previewDialog": {
      return {
        ...state,
        previewModalOpened: !state.previewModalOpened,
      };
    }
    case "set gif": {
      return { ...state, gifSelected: action.gif };
    }
    case "set file": {
      return {
        ...state,
        fileSelected: action.file,
        fileType:action.fileType,
        previewModalOpened: !state.previewModalOpened,
      };
    }
    case "set text": {
      return { ...state, text: action.text };
    }
    case "reset": {
      return { ...initialState, activeTab: state.activeTab, ...action.payload };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function FooterProvider({ children, onSubmit = () => {} }) {
  const [state, dispatch] = React.useReducer(FooterReducer, initialState);

  const value = [state, dispatch, onSubmit];
  value.state = state;
  value.dispatch = dispatch;
  value.onSubmit = onSubmit;
  return (
    <FooterContext.Provider value={value}>{children}</FooterContext.Provider>
  );
}

function useFooter() {
  const context = React.useContext(FooterContext);
  if (context === undefined) {
    throw new Error("useFooter must be used within a FooterProvider");
  }
  return context;
}

export { FooterProvider, useFooter };
