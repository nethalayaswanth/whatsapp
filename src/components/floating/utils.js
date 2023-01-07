

export const computePosition = ({
  reference,
  floating,
  container,
  offset = 5,
  placement,
}) => {
  const refRect = reference.currentgetBoundingClientRect();

  const floatRect = floating.current.getBoundingClientRect();


  let config = {};
  let bounds = {};
  let current = {};

  const containerRect = container.rect;

  [config.y, config.x] = placement.split("-");

  config.alignTop = config.y === "top";
  config.alignCenter = config.x === "center";
  config.alignLeft = config.x === "left";
  config.alignBottom = !config.alignTop;
  config.alignRight = !config.alignLeft;

  current.height = Math.min(
    floatRect.height,
    containerRect.height - 2 * offset
  );

  current.width = Math.min(floatRect.width, containerRect.width - 2 * offset);

  const minY = refRect.top - current.height - offset;
  const maxY = refRect.bottom + offset;
  const minX = refRect.right - current.width;
  const maxX = refRect.left;
  const centerY = refRect.top + refRect.height / 2 - current.height / 2;
  const centerX = refRect.left + refRect.width / 2 - current.width / 2;

  config.top = config.alignTop ? minY : maxY;
  config.left = config.left ? minX : maxX;

  bounds.top = containerRect.top;
  bounds.bottom = containerRect.bottom - floatRect.height - offset;
  bounds.left = containerRect.left;
  bounds.right = containerRect.right - floatRect.width;

  current.y = config.y;
  current.x = config.x;

  if (minY < bounds.top || maxY > bounds.bottom) {
    current.y = "center";
    current.top = Math.min(bounds.top, Math.min(centerY, bounds.bottom));
  } else if (minY < bounds.top) {
    current.y = "bottom";
    current.top = Math.min(maxY, bounds.bottom);
  } else if (maxY > bounds.bottom) {
    current.y = "top";
    current.top = Math.max(minY, bounds.top);
  }

  if (minX < bounds.left || maxX > bounds.right) {
    current.x = "center";
    current.left = Math.min(bounds.left, Math.min(centerX, bounds.right));
  } else if (minX < bounds.left) {
    current.x = "left";
    current.left = Math.min(maxX, bounds.right);
  } else if (maxX > bounds.right) {
    current.x = "left";
    current.left = Math.max(minX, bounds.left);
  }

  current.placement=`${current.y}-${current.x}`
  current.transformOrigin = `${current.y==='top'?'bottom':'top'}-${current.x==='right'?'right':'top'}`;

return {...current}
};
