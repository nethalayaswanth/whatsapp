
import { isEqual } from "lodash";


export const compareProps = (prevProps, nextProps) => {
  return isEqual(prevProps, nextProps);
};


export const getMediaData = (message) => {
  const original = message?.original;
  const preview = message?.preview;
  const dimensions = message?.dimensions;
  const fileName = message?.fileName;
  const fileSize = message?.fileSize;
  const fileType = message?.fileType;
  const fileDuration = message?.fileDuration;

  return {
    original,
    preview,
    dimensions,
    fileDuration,
    fileName,
    fileSize,
    fileType,
  };
};

export const getMessageType=(type)=>{

    const deleted = type?.includes("deleted");
    const image = type?.includes("image");
    const gif = type?.includes("gif");
    const video = type?.includes("video");
    const doc = type?.includes("doc");
    const createdGroup = type?.includes("createdGroup");
    const addedToGroup = type?.includes("addedToGroup");

    return { deleted ,image,gif,video,doc,createdGroup,addedToGroup};
}