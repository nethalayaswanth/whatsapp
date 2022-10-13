import { useCallback, useState, memo, useMemo, useRef } from "react";
import DrawerHeader from "../header/drawer";
import { useSidebar } from "../../contexts/sidebarContext";
import { ReactComponent as Edit } from "../../assets/edit.svg";
import { ReactComponent as Done } from "../../assets/done.svg";
import { ReactComponent as Close } from "../../assets/close.svg";

import {
  useNameUpdate,
  useUser,
  useAboutUpdate,
} from "../../requests.js/useRequests";
import useHover from "../../hooks/useHover";

import { useDpUpdate } from "../../requests.js/useRequests";

import { Modal } from "../modal";

import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { generatecroppedImage, createImage } from "../../utils";
import Spinner from "../spinner";
import { useEffect } from "react";

const Input = memo(({ name, label, value, onSave, as, ...props }) => {
  const [edit, setEdit] = useState(false);

  const ref = useRef();
  const handleEdit = () => {
    if (edit) {
      onSave?.(name, ref.current.value);
    }
    setEdit(!edit);
  };

  const refCb = (node) => {
    node && edit && node.focus();
    ref.current = node;
  };

  const Element = as || "input";
  return (
    <div className="px-[30px] mb-[10px] outline-none   flex-shrink-0 flex-grow-0 bg-white basis-auto relative py-[10px] animate-land ">
      <div className="p-0 mb-[14px]">
        <div className="flex items-center">
          <span className="align-left text-primary-teal font-normal leading-normal text-[14px]">
            {label}
          </span>
        </div>
      </div>
      <div
        className={`relative break-words flex items-start outline-none ${
          edit &&
          `focus-within:border-b-[2px] focus-within:border-border-input-active`
        } `}
      >
        <div className="flex justify-start w-[80%] min-w-0 flex-1 relative z-[2]">
          <div className="p-0 cursor-text relative flex flex-1 overflow-hidden align-top">
            <Element
              readOnly={!edit}
              ref={refCb}
              name={name}
              {...props}
              className="my-[8px] cursor-text align-middle border-none outline-none bg-transparent p-0 min-w-[5px] relative w-full min-h-[20px] leading-[22px] text-[17px] break-words whitespace-pre-wrap text-select text-primary-default  "
            />
          </div>
        </div>
        <span className="w-[24px] h-[24px] pt-[8px] relative  ">
          <button onClick={handleEdit}>
            <span className="text-panel-header-icon">
              {edit ? <Done /> : <Edit />}
            </span>
          </button>
        </span>
      </div>
    </div>
  );
});

const ImageCropper = memo(({ file, close }) => {
  const [blobUrl] = useState(() => URL.createObjectURL(file));

  const [crop, setCrop] = useState({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });

  const [croppedAreaPixels, setCroppedAreaPixels] = useState({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });

  const [uploading, setUploading] = useState(false);

  const onCropComplete = useCallback((crop, percentCrop) => {
    setCroppedAreaPixels(percentCrop);
  }, []);

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;

    const x = width > height ? height / 2 : width / 2;

    console.log(x / 2, width / 2, height / 2);

    setCrop({
      unit: "px",
      width: x,
      height: x,
      x: width / 2 - x / 2,
      y: height / 2 - x / 2,
    });
  }

  const [croppedImage, setCroppedImage] = useState();

  const dpUpdate = useDpUpdate();

  const handleSubmit = async (event) => {
    try {
      setUploading(true);
      const image = await createImage(blobUrl);

      console.log(croppedAreaPixels);

      const files = await generatecroppedImage({
        imageSrc: image,
        crop: croppedAreaPixels,
        resize: 0.5,
        quality: 0.66,
      });

      dpUpdate.mutate({ files });

      setUploading(false);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full flex flex-col justify-center bg-panel-bg-deeper">
      <header className="py-0 pr-[20px] pl-[25px] flex flex-none items-center h-[49px] text-white bg-primary-green">
        <button
          onClick={() => {
            close();
          }}
        >
          <Close />
        </button>
      </header>
      <div className="flex justify-center h-full relative">
        <ReactCrop
          crop={crop}
          onChange={setCrop}
          onComplete={onCropComplete}
          keepSelection={true}
          aspect={1}
          circularCrop={true}
          style={{
            maxHeight: "100%",
            position: "relative",
            display: "flex",
          }}
        >
          <div className="w-full h-full flex justify-center">
            {" "}
            <img
              style={{
                height: "100%",
              }}
              src={blobUrl}
              alt=""
              onLoad={onImageLoad}
            />
          </div>
        </ReactCrop>
      </div>
      <div className="pt-0 px-[20px] pb-[6px] relative justify-center items-center z-[3] flex min-h-[90px]">
        <span>
          <div className=" top-0 left-[auto] right-[40px] mt-[-30px] absolute">
            <button
              onClick={handleSubmit}
              className="w-[60px] h-[60px] rounded-full p-0 flex items-center justify-center text-[14px] font-normal text-[white] bg-primary-green"
            >
              <span className="flex justify-center items-center ">
                {uploading ? <Spinner /> : <Done />}
              </span>
            </button>
          </div>
        </span>
      </div>
    </div>
  );
});
const Dpupload = ({ src }) => {
  const [ref, isHovering] = useHover();

  const inputRef = useRef();
  const handleClick = () => {
    inputRef.current.click();
  };

  const [file, setFile] = useState();

  const [showModal, setShowModal] = useState();

  const onSelectFile = async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      setFile(file);
      setShowModal(true);
    }
  };

  return (
    <div className="flex-none my-[28px] flex justify-center ">
      <div
        ref={ref}
        className="mx-[auto] animate-pop  w-[200px] h-[200px] relative "
      >
        <div className="cursor-pointer mx-[auto] bg-center rounded-full relative overflow-hidden h-full w-full">
          <div className="absolute z-[500] flex justify-center items-center top-0 left-0 h-full w-full">
            {src && <img src={src} alt="" />}
          </div>
          <span>
            {isHovering && (
              <div
                onClick={handleClick}
                className="absolute t-0 l-0 w-full h-full flex uppercase flex-col justify-center items-center pt-[15px] rounded-full leading-[1.2] text-[0.8125rem] bg-[rgba(84,101,111,0.7)] text-[rgba(255,255,255,0.8)] z-[1000]"
              >
                <div className="w-[100px] break-words text-center">
                  Change Profile Picture
                </div>
              </div>
            )}
          </span>
          <input
            ref={inputRef}
            onChange={onSelectFile}
            type="file"
            className="hidden"
          />
          <Modal animate={false} show={showModal}>
            <ImageCropper
              file={file}
              close={() => {
                setShowModal(false);
              }}
            />
          </Modal>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const [sideBar, dispatch] = useSidebar();

  const { data: {user} } = useUser();
  const [height, setHeight] = useState(1);

  const aboutRef = useRef(null);
  const nameRef = useRef(null);

  const mutateName = useNameUpdate();
  const mutateAbout = useAboutUpdate();

  const handleSave = useCallback(
    (name, value) => {
      if (value.length !== 0) {
        if (name === "name") {
          mutateName.mutate({ name: value });
          return;
        }

        mutateAbout.mutate({ about: value });
      }
    },
    [mutateAbout, mutateName]
  );

  console.log(user?.dp);
  const dp = user?.dp?.url || user?.dp?.previewUrl;
  return (
    <span className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden  ">
      <div className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden pointer-events-auto bg-drawer-bg flex flex-col ">
        <DrawerHeader
          onClick={() => {
            dispatch({ type: "toggle" });
          }}
          name={"Profile"}
        />
        <div
          onClick={() => {}}
          className="w-full flex flex-col overflow-x-hidden overflow-y-auto z-[100] relative flex-1  "
        >
          <Dpupload src={dp} />
          <Input
            label="Your name"
            name="name"
            onSave={handleSave}
            defaultValue={user.name}
            type="text"
            placeholder="type your name"
          />
          <Input
            label="About"
            name="about"
            value="Mony nethala"
            as="textarea"
            cols={10}
            rows={2}
            onSave={handleSave}
            defaultValue={user.about}
            style={{
              maxWidth: "100%",
              resize: "none",
              overflowY: "visible",
            }}
          />
        </div>
      </div>
    </span>
  );
};

export default Profile;
