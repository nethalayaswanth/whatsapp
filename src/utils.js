import moment from "moment";

import { monotonicFactory } from "ulid";

import { format } from "date-fns";
import formatRelative from "date-fns/formatRelative";
import enUS from "date-fns/locale/en-US";
import { customAlphabet } from "nanoid";

const ALPHABETS =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const nanoid = (num = 10) => {
  return customAlphabet(ALPHABETS, num)();
};

export const ulid = monotonicFactory();

export const pascalFormat = (str) => {
  const formatted = str.split(" ").map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toUpperCase();
  });

  return formatted;
};

export const formatFileSize = (size) => {
  let i = Math.floor(Math.log(size) / Math.log(1024));

  return `${(size / Math.pow(1024, i)).toFixed(1)} ${
    ["B", "KB", "MB", "GB", "TB"][i]
  }`;
};

export const timeFormat = (duration) => {
  var hrs = ~~(duration / 3600);
  var mins = ~~((duration % 3600) / 60);
  var secs = ~~duration % 60;

  var ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
};

export function assignRef(ref, value) {
  if (ref == null) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    try {
      ref.current = value;
    } catch (error) {
      throw new Error(`Cannot assign value "${value}" to ref "${ref}"`);
    }
  }
}

export function mergeRefs(...refs) {
  if (refs.every((ref) => ref == null)) {
    return null;
  }
  return (node) => {
    refs.forEach((ref) => {
      assignRef(ref, node);
    });
  };
}

export const callAll =
  (...fns) =>
  (...args) =>
    fns.forEach((fn) => fn && fn(...args));

export const splitLinkFromMessage = (message) => {
  const URL_REGEX =
    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/gm;

  const result = message.split(" ").reduce((acc, item) => {
    const isURL = URL_REGEX.test(item);
    if (isURL) acc.push({ link: item });
    else {
      if (typeof acc.slice(-1)[0] === "string") {
        acc = [...acc.slice(0, -1), `${acc.slice(-1)[0]} ${item}`];
      } else {
        acc.push(item);
      }
    }

    return acc;
  }, []);

  return result;
};

export function createRoomId(strings) {
  if (typeof strings === "object" && Array.isArray(strings)) {
    return strings.sort().join("-");
  }
  return null;
}

export const getOtherUserFromRoomId = (roomId, userId) => {
  if (!roomId) return null;
  const userIds = roomId.split("-");

  const anotherUser = userIds[0] === userId ? userIds[1] : userIds[0];
  return anotherUser;
};

export const formatDat = (unixTime, day) => {
  if (!unixTime) return null;
  const formatRelativeLocale = {
    lastWeek: "EEEE",
    yesterday: "'Yesterday'",
    today: day ? "'Today'" : "h:mm aa",
    tomorrow: "'Tomorrow'",
    nextWeek: "'Next' EEEE",
    other: "d/M/yyyy",
  };

  const locale = {
    ...enUS,
    formatRelative: (token) => {
      return formatRelativeLocale[token];
    },
  };

  const date = formatRelative(unixTime, new Date(), { locale });
  const time = format(unixTime, "h:mm aa");

  return { date, time };
};

export const formatDate = (unixTime, calenderDay) => {
  if (!unixTime) return null;
  const day = moment.unix(unixTime).calendar({
    sameDay: calenderDay ? "[Today]" : "h:mm a",
    nextDay: "[Tomorrow]",
    nextWeek: "dddd",
    lastDay: "[Yesterday]",
    lastWeek: "dddd",
    sameElse: "DD/MM/YYYY",
  });

  const time = moment.unix(unixTime).format("h:mm a");
  const date = moment.unix(unixTime).format("D/M/YYYY");
  const dateWithTime = moment.unix(unixTime).format("D/M/YYYY [at] h:mm a ");
  return { day, time, date, dateWithTime };
};

export const createImage = (url) => {
  return new Promise((res, rej) => {
    const image = new Image();
    image.src = url;
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      const aspectRatio = width / height;

      res({
        image,
        url,
        aspectRatio,
        width,
        height,
      });
    };
  });
};
const generateImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (error) => reject(error));
    img.src = url;
  });

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

export function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}
export default async function getCroppedImg({
  src,
  crop,
  blur,
  rotation = 0,
  maxResolution,
  minResolution,
}) {
  const {
    image,
    aspectRatio,
    width: naturalWidth,
    height: naturalHeight,
  } = await createImage(src);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    naturalWidth,
    naturalHeight,
    rotation
  );

  // canvas.width = bBoxWidth;
  // canvas.height = bBoxHeight;

  // ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  // ctx.rotate(getRadianAngle(rotation));
  // ctx.translate(-naturalWidth / 2, -(naturalHeight / 2));

  const croppedX = (crop.x * naturalWidth) / 100;
  const croppedY = (crop.y * naturalHeight) / 100;
  const croppedWidth = (crop.width * naturalWidth) / 100;
  const croppedHeight = (crop.height * naturalHeight) / 100;

  const getClampedWidth = () => {
    const aspectRatio = croppedWidth / croppedHeight;
    if (aspectRatio > 1) {
      const width = Math.max(
        minResolution,
        Math.min(croppedWidth, maxResolution)
      );

      const height = croppedWidth < width ? croppedHeight : width / aspectRatio;

      return { width, height };
    } else {
      const height = Math.max(
        minResolution,
        Math.min(croppedHeight, maxResolution)
      );

      const width =
        croppedHeight < height ? croppedWidth : height * aspectRatio;

      return { width, height };
    }
  };

  const { width: clampedWidth, height: clampedHeight } = getClampedWidth();

  
  canvas.width = clampedWidth;
  canvas.height = clampedHeight;

  ctx.filter = `blur(${blur}px)`;

  ctx.drawImage(
    image,
    croppedX,
    croppedY,
    croppedWidth,
    croppedHeight,
    0,
    0,
    clampedWidth,
    clampedHeight
  );

  // const data = ctx.getImageData(
  //   (crop.x * naturalWidth) / 100,
  //   (crop.y * naturalHeight) / 100,
  //   croppedWidth,
  //   croppedHeight
  // );

  // ctx.putImageData(data, 0, 0, 0, 0,clampedWidth,clampedHeight);

  return canvas;
}

const croppedFile = ({
  src,
  crop,
  minResolution,
  maxResolution,
  quality,
  blur,
  rotation,
}) => {
  return new Promise(async (res, rej) => {
    if (!crop || !src) {
      rej("something went wrong");
    }

    try {
      const canvas = await getCroppedImg({
        src,
        crop,
        maxResolution,
        blur,
        rotation,
        minResolution,
      });

      canvas.toBlob(
        (blob) => {
          if (!blob) rej("something went wrong");
          const file = new File([blob], "image.jpeg", {
            type: blob.type,
          });

          res(file);
        },
        "image/jpeg",
        quality
      );
    } catch (e) {
      console.error(e);
    }
  });
};

export const generatecroppedImage = async ({
  src,
  crop,
  quality = 0.33,
  blur = 0,
  rotation = 0,
  dp,
}) => {
  return Promise.all([
    croppedFile({
      src,
      crop,
      maxResolution: dp ? 640 : 1280,
      minResolution: dp ? 640 : 200,
      quality: 0.66,
      blur: 0,
      rotation,
    }),
    croppedFile({
      src,
      crop,
      minResolution: 0,
      maxResolution: dp ? 96 : 36,
      quality:dp ?1/3:1/6,
      blur,
      rotation,
    }),
  ]).catch((e) => {
   throw e
  });
};

export const generateThumbNail = (video) => {
  return new Promise((res, rej) => {
    const snapImage = () => {
      var canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            rej("something went wrong");
            video.removeEventListener("timeupdate", snapImage);
          }
          const file = new File([blob], "image.jpeg", {
            type: blob.type,
          });

          res(file);
          video.removeEventListener("timeupdate", snapImage);
        },
        "image/jpeg",
        0.66
      );
    };
    video.play();
    video.addEventListener("timeupdate", snapImage);
  });
};

export const createVideo = (url) => {
  return new Promise((res, rej) => {
    var video = document.createElement("video");
    video.src = url;

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.play();
    video.onloadedmetadata = async (event) => {
      const aspectRatio = video.videoWidth / video.videoHeight;

      const thumbnail = await generateThumbNail(video);

      video.pause();

      res({
        aspectRatio,
        height: video.videoHeight,
        width: video.videoWidth,
        url,
        thumbnail,
        duration: video.duration,
      });
    };
  });
};

export const calculateBoundingBoxes = (children) => {
  const boundingBoxes = {};

  children.forEach((child) => {
    const domNode = child;
    const nodeBoundingBox = domNode.getBoundingClientRect();

    boundingBoxes[child.id] = nodeBoundingBox;
  });

  return boundingBoxes;
};

export const wrapPromise = (promise) => {
  let status = "pending";
  let result;
  let suspend = promise().then(
    (res) => {
      status = "success";
      result = res;
    },
    (err) => {
      status = "error";
      result = err;
    }
  );
  return {
    read() {
      if (status === "pending") {
        throw suspend;
      } else if (status === "error") {
        throw result;
      } else if (status === "success") {
        return result;
      }
    },
  };
};