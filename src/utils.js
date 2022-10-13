import moment from "moment";

import { customAlphabet } from "nanoid";

const ALPHABETS =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const nanoid = (num = 10) => {
  return customAlphabet(ALPHABETS, num)();
};

export const pascalFormat=(str)=>{

  const formatted= str.split(' ').map((word)=>{
    return word.charAt(0).toUpperCase() + word.slice(1).toUpperCase();
  })

  return formatted;
}

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
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const ascpectRatio = img.naturalWidth / img.naturalHeight;

      res({
        url,
        ascpectRatio,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      });
    };
  });
};
const generateImage = (url, width, height) =>
  new Promise((resolve, reject) => {
    const image = new Image(width, height);
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
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
export default async function getCroppedImg(
  imageSrc,
  pixelCrop,
  resize,
  blur,
  rotation = 0
) {
  const image = await generateImage(
    imageSrc.url,
    imageSrc.naturalWidth * resize,
    imageSrc.naturalHeight * resize
  );

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;
  const width = (pixelCrop.width * image.width) / 100;
  const height = (pixelCrop.height * image.height) / 100;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-image.width / 2, -(image.height / 2));

  ctx.drawImage(image, 0, 0, image.width, image.height);

  const data = ctx.getImageData(
    (pixelCrop.x * image.width) / 100,
    (pixelCrop.y * image.height) / 100,
    width,
    height
  );

  canvas.width = width;
  canvas.height = height;

  ctx.putImageData(data, 0, 0);

  ctx.filter = `blur(${blur}px)`;

  return canvas;
}

const croppedFile = (imageSrc, crop, resize, quality, blur, rotation) => {
  return new Promise(async (res, rej) => {
    if (!crop || !imageSrc) {
      rej("something went wrong");
    }

    const canvas = await getCroppedImg(imageSrc, crop, resize, blur, rotation);

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
  });
};

export const generatecroppedImage = ({
  imageSrc,
  crop,
  resize = 0.125,
  quality = 0.25,
  blur = 100,
  rotation = 0,
}) => {
  return Promise.all([
    croppedFile(imageSrc, crop, 1, 0.66, 0, rotation),
    croppedFile(imageSrc, crop, resize, quality, blur, rotation),
  ]).catch((e) => {
    console.log(e);
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
