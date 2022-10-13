import { forwardRef } from "react";
import useMediaFetch from "../../hooks/useMediaFetch";

export const SlideView = forwardRef(
  (
    {
      visible,
      video,
      preview,
      mobile,
      original,
      width,
      height,
      loading = true,
    },
    ref
  ) => {
    const refCb = (node) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
        return;
      }
      ref.current = node;
    };
    const aspectRatio = width / height;
    const potrait = aspectRatio <= 1;

    return (
      <div
        style={{ ...(mobile && { maxWidth: "100%", overflow: "visible" }) }}
        className="  swiper-zoom-container  flex flex-auto flex-shrink-0 flex-col  justify-center h-full   max-w-[calc(100%-184px)]  "
      >
        <div
          style={{
            overflow: mobile ? "visible" : " hidden",
          }}
          className="flex w-full h-full flex-grow-1 basis-auto items-center justify-center min-w-0 "
        >
          <div
            className={`relative  max-w-full max-h-full flex justify-center items-center`}
            style={{
              ...(mobile && { width: "100%", overflow: "visible" }),
              ...(!mobile && {
                height: potrait
                  ? `max(100%, ${height}px)`
                  : `max(75%, ${height}px)`,
                ...(aspectRatio && { aspectRatio }),
              }),
            }}
          >
            <div
              style={{
                ...(!mobile &&
                  (potrait
                    ? {
                        height: `100%`,
                        ...(aspectRatio && { aspectRatio }),
                      }
                    : { width: "100%" })),
                ...(mobile && { width: "100%", overflow: "visible" }),
              }}
            >
              <div
                style={{
                  visibility: visible ? "visible" : "hidden",
                  overflow: mobile ? "visible" : " hidden",
                }}
                className={` h-full w-full z-[2] flex  items-center justify-center`}
              >
                {video ? (
                  <div
                    ref={refCb}
                    className={`swiper-zoom-target relative h-full  justify-center items-center flex`}
                  >
                    <img
                      style={{
                        ...(loading && { filter: "blur(10px)" }),
                      }}
                      className={`h-full w-full`}
                      alt=""
                      src={preview}
                    />
                    {!loading && (
                      <video
                        className="absolute z-[1] top-0 left-0 h-full w-full "
                        controls={true}
                        src={original}
                      />
                    )}
                  </div>
                ) : (
                  <img
                    ref={refCb}
                    style={{
                      ...(loading && { filter: "blur(10px)" }),
                    }}
                    className={`h-full w-full swiper-zoom-target`}
                    alt=""
                    src={original || preview}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const SlideItem = forwardRef(({ visible = true, src, mobile }, ref) => {
  const width = src?.dimensions?.width;
  const height = src?.dimensions?.height;

  const aspectRatio = width / height;
  const potrait = aspectRatio <= 1;

  const [original, preview, loading] = useMediaFetch({ src });
  const video = src.type.includes("video");

  return (
    <SlideView
      {...{
        potrait,
        video,
        original,
        preview,
        width,
        height,
        loading,
        ref,
        visible,
        mobile,
      }}
    />
  );
});

export default SlideItem;
