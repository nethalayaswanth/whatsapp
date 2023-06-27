
import { isEqual } from "lodash";


export const compareProps = (prevProps, nextProps) => {
  return isEqual(prevProps, nextProps);
};
