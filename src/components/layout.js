import React from "react";

export class GetSnapshotBeforeUpdate extends React.Component {
  getSnapshotBeforeUpdate = () => {
    this.props.callback?.();
    return null;
  };

  componentDidUpdate = () => {};

  render = () => this.props.children;
}

export default function Layout({ children, duration = 300, easing = "ease" }) {
  const dom = React.useRef();
  const prevDom = React.useRef();
  const rectBeforeUpdate = React.useRef();

  React.useLayoutEffect(() => {
    const el = dom.current;
    prevDom.current = el;
    const prevRect = rectBeforeUpdate.current;
    if (!el || !prevRect) return;
    const rect = el.getBoundingClientRect();
    const animation = el.animate(
      [
        {
          transform: `translate(${prevRect.x - rect.x}px, ${
            prevRect.y - rect.y
          }px) scale(${prevRect.width / rect.width}, ${
            prevRect.height / rect.height
          })`,
        },
        { transform: `translate(0, 0) scale(1, 1)` },
      ],
      { duration, easing }
    );
    return () => animation.cancel();
  });

  const child = React.Children.only(children);
  if (!React.isValidElement(child)) return null;

  return (
    <>
      <GetSnapshotBeforeUpdate
        callback={() => {
          rectBeforeUpdate.current = dom.current?.getBoundingClientRect();
          return null;
        }}
      >
        {/* {React.cloneElement(
        child ,
        {
          ref: (node) => {
            if (!node) {
              return;
            }
            dom.current = node;
            const { ref } = child ;
            if (typeof ref === "function") ref(node);
          }
        }
        
      )} */}
        <div
          ref={(node) => {
            if (!node) {
              return null;
            }
            dom.current = node;
            const { ref } = child;
            if (typeof ref === "function") ref(node);
          }}
        >
          {child}
        </div>
      </GetSnapshotBeforeUpdate>
    </>
  );
}
