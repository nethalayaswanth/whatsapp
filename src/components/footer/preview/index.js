import { ErrorBoundary } from "react-error-boundary";
import PreviewDialog from "./dialog";
import PreviewModalWrapper from "./wrapper";

const Preview = () => {
  return (
    <PreviewDialog>
      <ErrorBoundary fallbackRender={()=> (<div></div>)}>
        <PreviewModalWrapper />
      </ErrorBoundary>
    </PreviewDialog>
  );
};

export default Preview;
