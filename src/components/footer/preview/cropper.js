import { useState } from "react";

import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const Cropper = ({ onCropComplete, children, editMode, src }) => {
  const [crop, setCrop] = useState({
    unit: "%",
    width: 96,
    height: 96,
    x: 2,
    y: 2,
  });

  return (
    <>
      <div
        className={`edit flex flex-col items-center h-full max-h-full max-w-full justify-center ${
          editMode
            ? "absolute pointer-events-auto visible"
            : "pointer-events-none invisible"
        }`}
      >
        <div className="flex justify-center h-full relative">
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            keepSelection={true}
            onComplete={onCropComplete}
            style={{
              maxHeight: "100%",
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
            minHeight="220px"
            minWidth="220px"
          >
            <div className="w-full h-full flex justify-center">
              <img src={src} alt="" />
            </div>
          </ReactCrop>
        </div>
      </div>
    
    </>
  );
};

export default Cropper;
