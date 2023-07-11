import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ReactComponent as Done } from "../../assets/done.svg";
import { ReactComponent as Group } from "../../assets/group.svg";
import {
  useSidebarDispatch,
  useSidebarState,
} from "../../contexts/sidebarContext";
import DrawerHeader from "../header/drawer";

import { nanoid } from "nanoid";

import { DpUpload, ImageCropper } from "../dpUpload";

import { forwardRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import Textarea from "react-textarea-autosize";
import useSocket from "../../contexts/socketContext";
import { getObjectUrls } from "../../queries.js/api";
import { Modal } from "../modal";

const Input = forwardRef(
  ({ className, label, name, error, as, ...props }, ref) => {
    const Element = as ? Textarea : "input";

    return (
      <div
        className={`px-[30px] mb-[3px] outline-none   flex-shrink-0 flex-grow-0 bg-white basis-auto relative py-[10px] animate-land  ${className} `}
      >
        <div class="relative z-0  w-full group">
          <Element
            type="text"
            name={name}
            id={name}
            className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 ${
              error && `border-app-danger`
            }  appearance-none dark:text-white dark:border-gray-600 dark:focus:text-primary-default focus:outline-none focus:ring-0 focus:text-primary-default peer`}
            placeholder=" "
            required
            ref={ref}
            {...props}
          />
          <label
            for="group_subject"
            className={`absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary-teal peer-focus:dark:text-primary-teal  ${
              error && `text-app-danger`
            }  peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}
          >
            {label}
          </label>
        </div>
        {error && (
          <p className="text-[10px] mt-[2px] leading-[10px] text-app-danger">
            {error.message}
          </p>
        )}
      </div>
    );
  }
);

const CreateNewGroup = () => {
  const { selected: members } = useSidebarState();
  const dispatch = useSidebarDispatch();
  const aboutRef = useRef();
  const nameRef = useRef();

  const [socket, socketConnected] = useSocket();
  // const createGroupMutation = useCreateGroup();

  const [file, setFile] = useState();

  const [showModal, setShowModal] = useState();

  const {
    register,
    handleSubmit,

    formState: { errors, isValid },
  } = useForm();
  const onFileSelect = async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFile(file);
      setShowModal(true);
    }
  };

  const [croppedFiles, setCroppedFiles] = useState();
  const handleDpSubmit = useCallback(async (files) => {
    setCroppedFiles(files);
    setShowModal(false);
    setFile(null);
  }, []);

  //console.log(members)

  const onSubmit = useCallback(
    async (data) => {
      let dp = { url: null, previewUrl: null };
      if (croppedFiles) {
        const [url, previewUrl] = await getObjectUrls({
          ...croppedFiles,
          collection: "dp",
        });
        dp = { url, previewUrl };
      }

      socket.emit("createGroup", {
        dp,
        members: members.map((member) => member.id),
        name: data.name,
        about: data.about,
        roomId: nanoid(),
        createdAt: Date.now(),
      });

      dispatch({
        type: "reset",
      });
    },
    [croppedFiles, dispatch, members, socket]
  );

  const [dp, revoke] = useMemo(() => {
    let dp;
    if (!croppedFiles) return [null, null];
    if (croppedFiles.original) {
      dp = URL.createObjectURL(croppedFiles.original);
    }

    const revoke = () => {
      if (dp) {
        URL.revokeObjectURL(dp);
      }
    };
    return [dp, revoke];
  }, [croppedFiles]);

  useLayoutEffect(() => {
    return () => {
      revoke?.();
    };
  }, [revoke]);

  return (
    <span className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden  ">
      <div className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden pointer-events-auto bg-drawer-bg flex flex-col ">
        <DrawerHeader
          onClick={() => {
            dispatch({
              type: "set state",
              payload: {
                active: "new group",
                from: "create group",
              },
            });
          }}
          name={"Create Group"}
        />
        <form
          className="flex-grow flex flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex-grow bg-white flex flex-col z-[1] relative scrollbar">
            <div
              onClick={() => {}}
              className="w-full flex flex-col overflow-x-hidden overflow-y-auto z-[100] relative flex-1  "
            >
              <DpUpload
                src={dp}
                onFileSelect={onFileSelect}
                text="add Display Picture"
              >
                <Group
                  style={{ color: "#dfe5e7", height: "100%", width: "100%" }}
                />
              </DpUpload>
              <Modal animate={false} show={showModal}>
                <ImageCropper
                  file={file}
                  close={() => {
                    setShowModal(false);
                  }}
                  onSubmit={handleDpSubmit}
                />
              </Modal>

              <Input
                label="Group subject"
                error={errors.name}
                type="text"
                {...register("name", {
                  required: "You must enter name",
                  minLength: {
                    value: 1,
                    message: "name must have at least 1 characters",
                  },
                })}
              />

              <Input
                label="About"
                error={errors.about}
                as="Textarea"
                {...register("about", {
                  required: "You must enter about",
                  minLength: {
                    value: 1,
                    message: "about must have at least 1 characters",
                  },
                })}
                cols={10}
                rows={2}
                style={{
                  maxWidth: "100%",
                  resize: "none",
                  overflowY: "visible",
                }}
              />
            </div>
          </div>
          <span className="pb-[40px] pt-[24px] flex flex-grow-0 basis-auto flex-col justify-center items-center">
            <button
              type="submit"
              className="rounded-full cursor-pointer h-[46px] w-[46px] flex justify-center items-center bg-panel-header-coloured shadow-lg text-white"
            >
              <span>
                <Done />
              </span>
            </button>
          </span>
        </form>
      </div>
    </span>
  );
};

export default CreateNewGroup;
