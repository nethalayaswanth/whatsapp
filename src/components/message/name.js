const Name = ({ name, color }) => {
  return (
    <div className={`pl-[9px] pb-[5px] pt-[3px]`}>
      <div
        className={`inline-flex max-w-full text-[12.8px] font-[500] leading-[22px] `}
      >
        <span
          style={{
            ...(color && { color: color }),
          }}
          className={`pl-[2px] ml-[-2px] flex-grow-0 flex-shrink-1 basis-auto overflow-hidden text-ellipses cursor-pointer whitespace-nowrap `}
        >
          {name}
        </span>
      </div>
    </div>
  );
};


export default Name