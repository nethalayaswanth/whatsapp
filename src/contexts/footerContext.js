import { createContext, useCallback, useContext, useState } from "react";
import createStore from "./exStore";

const FooterContext = createContext();

const initialState = {
  bottomSheetOpened: false,
  bottomSheetMounted: false,
  attachmentDialogOpened: false,
  tabsOpened: false,
  activeTab: "emoji",
  previewDialogOpened: false,
  file: null,
  fileType: null,
  text: "",
};

function footerReducer(state, action) {
  switch (action.type) {
    case "set state": {
      return { ...state, ...action.payload };
    }
    case "close bottomSheet": {
      return { ...state, bottomSheetOpened: false };
    }
    case "set activeTab": {
      return {
        ...state,
        bottomSheetOpened: true,
        bottomSheetMounted: true,
        ...action.payload,
      };
    }
    case "toggle attachment": {
      return {
        ...state,
        bottomSheetOpened: false,
        attachmentDialogOpened: !state.attachmentDialogOpened,  
      };
    }

    case "reset attachment": {
      return {
        ...state,
        bottomSheetOpened: false,
        attachmentDialogOpened: false,
        file: null,
        fileType: null,
      };
    }
    case "toggle bottomSheetMount": {
      return {
        ...state,
        bottomSheetMounted: !state.bottomSheetMounted,
        ...action.payload,
      };
    }
    case "toggle previewDialog": {
      return {
        ...state,
        previewDialogOpened: !state.previewDialogOpened,
        ...action.payload,
      };
    }
    case "reset previewDialog": {
      return {
        ...state,
        file: null,
        fileType: null,
        previewDialogOpened: false,
        ...action.payload,
      };
    }

    case "reset": {
      return { ...initialState };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function FooterProvider({ children }) {
  const [store] = useState(() => createStore(initialState));
  return (
    <FooterContext.Provider value={store}>{children}</FooterContext.Provider>
  );
}

function useFooterState(selector) {
  const footerStore = useContext(FooterContext);
  if (footerStore === undefined) {
    throw new Error("useFooterState must be used within a FooterProvider");
  }

  return footerStore;
}

function useFooterDispatch() {
  const footerStore = useContext(FooterContext);
  if (footerStore === undefined) {
    throw new Error("useFooterDispatch must be used within a FooterProvider");
  }

  const dispatch = useCallback(
    (action) => {
      console.log(action.type);
      footerStore((state) => footerReducer(state, action));
    },
    [footerStore]
  );

  return dispatch;
}

export { FooterProvider, useFooterDispatch, useFooterState };
