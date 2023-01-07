
import { ErrorBoundary as Boundary } from "react-error-boundary";

import { QueryErrorResetBoundary } from "@tanstack/react-query";


export  function ErrorBoundary({ onReset,children }) {
  return (
    <Boundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="bg-danger-lighter h-full w-full p-[20px] flex justify-center items-center">
          <div className="basis-auto flex-grow-1 flex-shrink-0 border border-dotted border-danger p-[10px]  ">
            <div className="basis-auto flex-grow-0 flex-shrink-0  p-[10px]  ">
              There was an error!{" "}
              <span>
                <button
                  className="text-danger"
                  onClick={() => resetErrorBoundary()}
                >
                  Try again
                </button>
              </span>
              <div className="whitespace-normal"></div>
            </div>
          </div>
        </div>
      )}
      onReset={onReset}
    >
      {children}
    </Boundary>
  );
}


export default function QueryErrorBoundary({children}){



    return (
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary onReset={reset}>{children}</ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    );


}

