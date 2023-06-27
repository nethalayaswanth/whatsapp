import { useLayoutEffect, useRef } from "react";
import { ReactComponent as DefaultAvatar } from "../../assets/avatar.svg";
import { useImage } from "../../contexts/imageFetchContext";
import usePrevious from "../../hooks/usePrevious";

export const Avatar = ({ src, children, width = 40 }) => {
  const { data, isLoading } = useImage({ src });

  const imageRef = useRef();
  const prevData = usePrevious(data);
  useLayoutEffect(() => {
    if (!imageRef.current) return;
    if (data && data !== prevData) {
      let image = imageRef.current;
      let parent = image.parentNode;
      let current = image.cloneNode();
      current.setAttribute("src", prevData);

      const style = {
        position: "absolute",
        top: "0px",
        left: "0px",
        bottom: "0px",
        right: "0px",
      };

      Object.entries(style).forEach(([key, value]) => {
        current.style[key] = value;
      });

      requestAnimationFrame(() => {
        parent.appendChild(current);

        image.style.opacity = 0.2;
        current.style.opacity = 1;
        image.style.transition = "";
        current.style.transition = "";
        image.ontransitionend = () => {
          parent.removeChild(current);
          current=null
        };

        requestAnimationFrame(() => {
          image.style.opacity = 1;
          current.style.opacity = 0.2;
          image.style.transition = "opacity 250ms ease";
          current.style.transition = "opacity 250ms ease";
        });
      });

      return () => {
       if (current && parent.contains(current)) {
         parent.removeChild(current);
       }
      };
    }
  }, [data, prevData]);

  return (
    <div className=" z-0 h-full w-full rounded-full border border-solid  overflow-hidden ">
      {data ? (
        <img ref={imageRef} className='h-full w-full' src={data} alt="" />
      ) : children ? (
        children
      ) : (
        <DefaultAvatar ref={imageRef} />
      )}
    </div>
  );
};
