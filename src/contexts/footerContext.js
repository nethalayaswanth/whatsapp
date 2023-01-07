import * as React from "react";

const FooterContext = React.createContext();

const reset = {
  gifDialogOpened: false,
  previewModalOpened: false,
  gifSelected: null,
  fileSelected: null,
  fileType: null,
};

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
  inputRef: null,
  propInputRef: null,
};
function FooterReducer(state, action) {


  // console.log(action,state)

  switch (action.type) {
    case "set state": {
      return { ...state, ...action.payload };
    }
    case "set activeTab": {
     

        if(action.active==='attachment'){
       return { ...state, bottomSheetOpened: false, attachmentDialogOpened:true };
        }


      return { ...state, activeTab: action.active , bottomSheetOpened: true };
    }
    case "close bottomSheet": {
      return {
        ...state,
        bottomSheetOpened: false,
        attachmentDialogOpened:false,
      };
    }
    case "open bottomSheet": {
      return {
        ...state,
        bottomSheetOpened: true,
      };
    }

    case "toggle bottomSheetMount": {
      return { ...state, bottomSheetMounted: !state.bottomSheetMounted };
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
      return { ...state, previewDialogOpened: !state.previewDialogOpened };
    }
    case "toggle previewDialog": {
      return {
        ...state,
        previewDialogOpened: !state.previewDialogOpened,
      };
    }
    case "set gif": {
      return { ...state, gifSelected: action.gif };
    }
    case "set file": {
      return {
        ...state,
        file: action.file,
        fileType: action.fileType,
        previewDialogOpened: !state.previewDialogOpened,
      };
    }
    case "set inputRef": {
      return {
        ...state,
        inputRef: action.inputRef,
      };
    }
    case "set propInputRef": {
      if (state.inputRef && action.propInputRef) {
        action.propInputRef.value = state.inputRef?.value;
      }

    

      return {
        ...state,
        propInputRef: action.propInputRef,
      };
    }

    case "set text": {
      return { ...state, text: action.text };
    }
    case "reset": {
      return { ...state,...reset,...action.payload };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function FooterProvider({ children, onSubmit = () => {}, onKeyPress=()=>{} }) {
  const [state, dispatch] = React.useReducer(FooterReducer, initialState);

  const value = [state, dispatch, onSubmit, onKeyPress];
  value.state = state;
  value.dispatch = dispatch;
  value.onSubmit = onSubmit;
  value.onKeyPress = onKeyPress;
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
