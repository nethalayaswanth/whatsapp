export const getDimensions = ({
  containerWidth,
  containerHeight,
  containerTop,
  containerLeft,
  aspectRatio,
  height: intrinsicHeight,
  width: intrinsicWidth,
  paddingLeft = 0,
  paddingTop = 0,
}) => {
  if (!containerWidth || !containerHeight) return { width: 0, height: 0 };

  const mobile = containerWidth <= 540;
  const maxHeight = containerHeight - 2 * paddingTop;
  const maxWidth = containerWidth - 2 * (mobile ? 0 : paddingLeft);
  const containerAspectRatio = containerWidth / containerHeight;

  const landscape = aspectRatio > 1;
  const screenInPotrait = containerAspectRatio <= 1;

  const clampedWidth = Math.min(intrinsicWidth, maxWidth);
  const clampedHeight = Math.min(intrinsicHeight, maxHeight);
  const reducedHeight = clampedWidth / aspectRatio;
  const reducedWidth = clampedHeight * aspectRatio;

  let width, height, top, left;

  if (screenInPotrait) {
    if (landscape) {
      width = clampedWidth;
      height = reducedHeight;
    } else {
      if (reducedWidth > maxWidth) {
        width = clampedWidth;
        height = reducedHeight;
      } else {
        width = reducedWidth;
        height = clampedHeight;
      }
    }
  } else {
    if (landscape) {
      if (reducedHeight > maxHeight) {
        width = reducedWidth;
        height = clampedHeight;
      } else {
        width = clampedWidth;
        height = reducedHeight;
      }
    } else {
      width = reducedWidth;
      height = clampedHeight;
    }
    top =
      containerTop !== undefined
        ? containerTop + containerHeight / 2 - height / 2
        : undefined;
    left =
      containerLeft !== undefined
        ? containerLeft + containerWidth / 2 - width / 2
        : undefined;
  }
 
  return { width, height, top, left };
};



export const getMiniStyles = ({
  container,
  collapsed,
  img,
  height,
  width,
  aspectRatio,
  paddingLeft=92,
}) => {
  if (!container || !collapsed || !img) {
    return {
      sx: 0,
      sy: 0,
      fx: 0,
      fy: 0,
      scale: 1,
      width: 100,
      height: 100,
    };
  }

  const {
    width: containerWidth,
    height: containerHeight,
    top: containerTop,
    left: containerLeft,
  } = container;

  const expanded = getDimensions({
    containerWidth: Math.floor(containerWidth),
    containerHeight: Math.floor(containerHeight),
    containerTop,
    containerLeft,
    height,
    width,
    aspectRatio,
    paddingLeft,
  });

  const sx = collapsed.left - expanded.width / 2 + collapsed.width /2 ;
  const sy = collapsed.top - expanded.height / 2 + collapsed.height / 2;
  const fx = expanded.left;
  const fy = expanded.top;
  const scaleX = collapsed.width / expanded.width;
  const scaleY = collapsed.height / expanded.height;
  const invScaleX = collapsed.width / img.width;
  const invScaleY = collapsed.height / img.height;

  const scale = sx;

  const min = Math.min(sx, sy);
  return {
    fx,
    fy,
    scale, 
    sx,
    sy,
    min,
    scaleX,
    scaleY,
    invScaleX,
    invScaleY,
    width: expanded.width,
    height: expanded.height,
  };
};