import { QueryErrorResetBoundary, useIsRestoring } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import StartUp from "./components/startUp";
import { ImagesClient, ImagesProvider } from "./contexts/imageFetchContext";
import LoginPage from "./pages/login";
import Messenger from "./pages/messenger";
import { useUser } from "./queries.js/useRequests";

function App() {
  const { data,status } = useUser();

  return ( data?
    <>
      {
        <div id="app" className="App w-full ">
          <div className="relative w-full h-full  overflow-hidden z-[100] flex flex-col items-center ">
            {data.verification ? <Messenger /> : <LoginPage />}

            <div className=" z-[-1] w-full h-[127px] fixed top-0 left-0 bg-app-stripe"></div>
          </div>
        </div>
      }
    </>:null
  );
}

const imagesClient = new ImagesClient();
function Index() {
  const isRestoring = useIsRestoring();
  
  console.log(isRestoring);
  return (
    <>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => {
             
              return (
                <StartUp>
                  <div className=" flex flex-col text-text-primary">
                    {error.message}
                    <button
                      className="text-danger"
                      onClick={() => {
                        resetErrorBoundary();
                      }}
                    >
                      Try again
                    </button>
                  </div>
                </StartUp>
              );
            }}
            onReset={reset}
          >
            {/* <Suspense fallback={<StartUp />}>
              <ImagesProvider client={imagesClient}>
                <App />
              </ImagesProvider>
            </Suspense> */}
            {isRestoring ? (
              <div
                style={{
                  height: "100%",
                  width: "100%",
                  position: "absolute",
                  background: "white",
                }}
              >
                <StartUp />
              </div>
            ) : (
              <Suspense fallback={<StartUp />}>
                <ImagesProvider client={imagesClient}>
                  <App />
                </ImagesProvider>
              </Suspense>
            )}
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
      <ReactQueryDevtools initialIsOpen />
    </>
  );
}

export default Index;
