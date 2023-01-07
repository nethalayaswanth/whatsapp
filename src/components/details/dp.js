import { useMemo } from "react";
import { useState } from "react";
import { useRef } from "react";
import { ReactComponent as DefaultAvatar } from "../../assets/avatar.svg";
import useMount from "../../hooks/useMount";
import { MainView } from "../carousel";
import { DpModalHeader } from "../mediaModal/Header";
import ModalWrapper from "../mediaModal/modalWrapper";

const Dp=({dp,name})=>{

  const [modalState, setModalState] = useState({});

  const mediaRectRef = useRef()
  const root = document.getElementById("image-overlay");

  const [mount, unMount] = useMount(modalState.opened);
  

  const open = () => {
    setModalState({
      opened: true,
      preview: dp,
      aspectRatio: 1,
      width: 640,
      height: 640,
      mediaRect: mediaRectRef.current,
    });
  };
  const close=()=>{
     setModalState((old)=>({...old,
       opened: false,
     }));
  }

    return (
      <>
        <div
          onClick={open}
          className="m-auto w-[200px] h-[200px] relative"
        >
          <div
            ref={mediaRectRef}
            className="rounded-full h-full w-full overflow-hidden"
          >
            {dp ? (
              <img src={dp} className="h-full w-full" alt="" />
            ) : (
              <DefaultAvatar />
            )}
          </div>
        </div>

        {mount && (
          <ModalWrapper {...{ modalState, root, unMount }}>
            <DpModalHeader dp={dp} name={name} close={close} />
            <MainView
              {...{
                original: dp,
                preview: dp,
                mediaWidth: modalState.width,
                mediaHeight: modalState.height,
                aspectRatio: modalState.aspectRatio,
                onOutSideClick: close,
              }}
            />
          </ModalWrapper>
        )}
      </>
    );
}


export default Dp