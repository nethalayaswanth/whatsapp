{/* <div
  className={`swiper-zoom-container flex   flex-shrink-0  justify-center max-h-full  max-w-full overflow-visible  tablet:max-w-[calc(100%-184px)] `}
>
  <div className="flex   basis-auto overflow-hidden justify-center items-center min-w-0 object-contain ">
    <div
      style={{ aspectRatio, visibility: visible ? "visible" : "hidden" }}
      className={`${
        potrait
          ? ` min-h-[85%] max-h-full  h-[max(100%,${height}px)] mobile:w-auto `
          : ` max-h-full mobile:w-auto `
      }
            flex justify-center items-center items object-contain`}
    >
      {video ? (
        <div
          ref={refCb}
          className={`swiper-zoom-target relative justify-center items-center flex`}
        >
          <img
            style={{
              ...(loading && { filter: "blur(10px)" }),
            }}
            className={`block`}
            alt=""
            src={preview}
          />
          {!loading && (
            <video
              className="absolute z-[1] top-0 left-0 "
              controls={true}
              src={original}
            />
          )}
        </div>
      ) : (
        <img
          ref={refCb}
          // style={{
          //   ...(loading && { filter: "blur(10px)" }),
          // }}
          className={` swiper-zoom-target w-full h-full `}
          alt=""
          src={current}
        />
      )}
    </div>
  </div>
</div>; */}
