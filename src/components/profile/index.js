import { useCallback, useRef, useState } from "react";
import Textarea from "react-textarea-autosize";
import { ReactComponent as Done } from "../../assets/done.svg";
import { ReactComponent as Edit } from "../../assets/edit.svg";
import { useSidebarDispatch } from "../../contexts/sidebarContext";
import DrawerHeader from "../header/drawer";

import { useUser } from "../../queries.js/user";
import { DpUpload, ImageCropper } from "../dpUpload";

import { Modal } from "../modal";

import { forwardRef, useLayoutEffect } from "react";
import { useUpdateProfile } from "../../queries.js/users";

export const Input = forwardRef(
  (
    {
      error,
      name,
      edit,
      children,
      label,
      value,
      onToggle,
      as,
      refCb,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      onToggle?.(name);
    };

    const Element = as ? Textarea : "input";
    return (
      <div className="px-[30px] mb-[10px] outline-none   flex-shrink-0 flex-grow-0 bg-white basis-auto relative py-[14px] animate-land pointer-events-auto ">
        <div
          className={`relative flex items-center z-0 pt-[24px]  w-full group  ${
            edit
              ? "focus-within:border-primary-teal focus-within:border-b-2"
              : ""
          }  ${error ? `focus-within:border-app-danger` : ""} `}
        >
          <Element
            type="text"
            name={name}
            id={name}
            className={`block py-[8px] px-0 w-full text-[17px] leading-[20px] text-gray-900 bg-transparent border-0  ${
              error ? `border-app-danger ` : ""
            }  appearance-none dark:text-white dark:border-gray-600 dark:focus:text-primary-default focus:outline-none focus:ring-0 focus:text-primary-default peer`}
            placeholder=" "
            required
            readOnly={!edit}
            ref={refCb}
            {...props}
          />
          <label
            htmlFor={name}
            className={`absolute text-[17px] top-0 leading-[20px] text-primary-teal dark:text-gray-400 duration-300 transform -translate-y-[0px] scale-85  z-10 origin-[0] peer-focus:left-0  peer-placeholder-shown:text-gray-500  peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-[32px] peer-focus:text-primary-teal peer-focus:translate-y-[0px] peer-focus:scale-85 ${
              error
                ? `peer-focus:text-app-danger text-app-danger peer-placeholder-shown:text-app-danger `
                : ""
            }`}
          >
            {label}
          </label>
          <div className=" flex justify-center items-center pointer-events-auto ">
            <span className="w-[24px] h-[24px]  relative  ">
              <button onClick={handleClick}>
                <span className="text-panel-header-icon">
                  {edit ? <Done /> : <Edit />}
                </span>
              </button>
            </span>
          </div>
        </div>
        {error && (
          <p className="text-[10px] mt-[4px] leading-[10px] text-app-danger">
            {error.message}
          </p>
        )}
      </div>
    );
  }
);

const Profile = () => {
  const dispatch = useSidebarDispatch();
  const { data: user } = useUser();

  const updateProfile = useUpdateProfile();

  const nameEmpty = !user.name || user.name.trim().length === 0;

  const aboutEmpty = !user.about || user.about.trim().length === 0;

  const backDisabled = nameEmpty || aboutEmpty;

  const [editMode, setEditMode] = useState({
    name: nameEmpty,
    about: aboutEmpty,
  });

  const [errors, setErrors] = useState({});
  const inputRefs = useRef({});

  const register = useCallback(
    ({ name, label, required }) => {
      const onChange = (e) => {
        if (
          (!e.target.value || e.target.value.trim().length === 0) &&
          required
        ) {
          setErrors((old) => ({
            ...old,
            [name]: { message: `${name} shouldn't be empty` },
          }));

          inputRefs.current[name].focus();
        } else if (e.target.value.trim().length <= 1) {
          setErrors((old) => ({
            ...old,
            [name]: null,
          }));
        }
      };

      const onToggle = async (id) => {
        if (!editMode[name]) {
          setEditMode((old) => ({ ...old, [id]: true }));
          inputRefs.current[name].focus();
          return;
        }
        const value = inputRefs.current[id].value;

        if ((!value || value.trim().length === 0) && required) {
          setErrors((old) => ({
            ...old,
            [name]: { message: `${name} shouldn't be empty` },
          }));

          inputRefs.current[name].focus();
          return;
        }

        await updateProfile({ [id]: value });

        setEditMode((old) => ({ ...old, [id]: false }));

        return;
      };

      return {
        refCb: (node) => {
          if (!node) return;
          inputRefs.current[name] = node;
        },
        onChange,
        name,
        onToggle,
        error: errors[name],
        label,
        edit: editMode[name],
        required,
      };
    },
    [editMode, errors, updateProfile]
  );

  useLayoutEffect(() => {
    if (nameEmpty && aboutEmpty) {
      setTimeout(() => {
        inputRefs.current["name"].focus();
      }, 0);
    }
  }, [aboutEmpty, nameEmpty]);

  const [file, setFile] = useState();

  const [showModal, setShowModal] = useState();

  const onFileSelect = async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFile(file);
      setShowModal(true);
    }
  };
  const handleDpSubmit = useCallback(
    async (files) => {
      await updateProfile({ ...files });

      setShowModal(false);
      setFile(null);
    },
    [updateProfile]
  );

  const dp = user?.dp?.url || user?.dp?.previewUrl;

  return (
    <span className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden  ">
      <div className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden pointer-events-auto bg-drawer-bg flex flex-col ">
        <DrawerHeader
          onClick={() => {
            for (const [input, notFilled] of Object.entries({
              name: nameEmpty,
              about: aboutEmpty,
            })) {
              if (notFilled) {
                setEditMode((old) => ({ ...old, [input]: true }));
                inputRefs.current[input].focus();
                break;
              }
            }
            if (!backDisabled) dispatch({ type: "toggle" });
          }}
          name={"Profile"}
        />
        <div
          onClick={() => {}}
          className="w-full flex flex-col overflow-x-hidden overflow-y-auto z-[100] relative flex-1  "
        >
          <DpUpload src={dp} onFileSelect={onFileSelect} />
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
            defaultValue={user.name}
            type="text"
            required={true}
            {...register({ name: "name", label: "Your name", required: true })}
          />
          <Input
            as="Textarea"
            maxRows={3}
            style={{
              resize: "none",
              border: 0,
              boxSizing: "border-box",
            }}
            {...register({ name: "about", label: "About", required: true })}
            defaultValue={user.about}
          />
        </div>
      </div>
    </span>
  );
};

export default Profile;
