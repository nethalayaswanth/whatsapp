import { Fragment, forwardRef } from "react";
import Card from ".";

const CardView = forwardRef(
  ({ avatar, title, top, main, bottom, onClick }, ref) => {
    return (
      <Card>
        <Card.Container ref={ref} onClick={onClick}>
          <div className="h-full cursor-pointer flex relative flex-row pointer-events-auto ">
            <Card.Avatar>{avatar}</Card.Avatar>
            <div
              className={`pr-[15px] border-b-[1px] group-last:border-b-[0px]
          
             border-solid border-border-list flex flex-col basis-auto  justify-center min-w-0 flex-grow `}
            >
              <div className="flex items-center leading-normal text-left ">
                <Card.Title>{title}</Card.Title>
                {top}
              </div>
              <div className="font-normal flex items-center min-h-[20px]   ">
                {main}
                <div className="flex-none flex justify-center ml-[6px] items-center max-w-full text-[12px] text-bubble-icon leading-[20px]   font-semibold">
                  {bottom &&
                    bottom.map((item, index) => (
                      <Fragment key={index}>{item}</Fragment>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </Card.Container>
      </Card>
    );
  }
);

export default CardView;
