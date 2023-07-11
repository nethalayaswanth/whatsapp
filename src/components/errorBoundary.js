
import { ErrorBoundary as Boundary } from "react-error-boundary";

import { QueryErrorResetBoundary } from "@tanstack/react-query";


export function ErrorBoundary({ onReset, reset, children }) {
  return (
    <Boundary
      fallbackRender={({ error, resetErrorBoundary }) => {
        //console.log(error);
        return (
          <div className="bg-danger-lighter h-full w-full p-[20px] flex justify-center items-center">
            <div className="flex-grow-1  border border-dotted border-danger p-[20px] m-[20px] ">
              <div className="flex-grow-0 flex-shrink-0  p-[10px]  ">
                {error.message}
                <span>
                  <button
                    className="text-danger"
                    onClick={() => {
                      reset?.();
                      resetErrorBoundary();
                    }}
                  >
                    Try again
                  </button>
                </span>
                <div className="whitespace-normal"></div>
              </div>
            </div>
          </div>
        );
      }}
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

