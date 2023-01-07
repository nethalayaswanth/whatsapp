

import { SidebarProvider } from "../contexts/sidebarContext";
import QueryErrorBoundary from "../components/errorBoundary";

import Login from "../components/login";

const LoginPage = () => {



  return (
    <SidebarProvider>
      <div className="relative top-0 w-full h-full overflow-hidden flex xl:m-auto xl:shadow-lg xl:w-[calc(100%-30x)] max-w-[1356px] xl:h-[calc(100%-30px)] xl:top-[15px] bg-panel-bg-lighter  ">
        <div
          style={{
            transform: "translateZ(0px)",
          }}
          className={`sidebar flex-shrink-0 flex-grow-0 basis-[40%] lg:basis-[35%] xl:basis-[30%] mobile:basis-auto mobile:flex-grow mobile:z-1  `}
        >
          <QueryErrorBoundary>
            <div className="flex-col flex h-full ">
              <Login />
            </div>
          </QueryErrorBoundary>
        </div>

        <div
          style={{
            transform: "translateZ(0px)",
          }}
          className={`relative w-full  h-full overflow-hidden flex-grow z-2 mobile:absolute mobile:pointer-events-none mobile:basis-auto   `}
        >

        </div>

      </div>
    </SidebarProvider>
  );
};

export default LoginPage;
