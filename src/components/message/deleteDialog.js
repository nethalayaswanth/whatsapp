import { Modal } from "../modal";


const deleteActions = ["Delete for everyone", "Delete for me", "Cancel"];

export default function DeleteDialog({
  showModal,
  isSenderUser,
  deleted,
  handleDeleteAction,
}) {
  return (
    <Modal show={showModal}>
      <div className="flex h-full w-full p-[24px] justify-center items-center ">
        <div className="px-[24px] pt-[22px] pb-[20px] bg-white rounded-[3px] shadow-lg flex  flex-col flex-1 basis-[100%] ">
          <div className="leading-[20px] text-[14.2px]">Delete message</div>
          <div className="text-right pt-[50px] px-[5px] flex justify-end overflow-hidden whitespace-nowrap  flex-wrap-reverse">
            <div className="flex flex-col">
              {deleteActions.map((label) => {
                if (
                  label === "Delete for everyone" &&
                  (!isSenderUser || (isSenderUser && deleted))
                ) {
                  return null;
                }
                return (
                  <div key={label} className="mt-[12px] first:mt-[0px]">
                    <div
                      onClick={() => {
                        handleDeleteAction(label);
                      }}
                      className="mb-[5px] rounded-[3px] cursor-pointer px-[24px] py-[10px] border border-solid inline-block whitespace-pre-wrap font-[500] border-border-list hover:shadow-sm"
                    >
                      <div className="flex min-w-0 min-h-0 justify-center items-center text-[14px] tracking-[1.25px]  leading-normal text-spa text-primary-teal ">
                        {label.toUpperCase()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
