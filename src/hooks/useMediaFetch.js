import { useEffect, useMemo } from "react";
import { useImage } from "../contexts/imageFetchContext";

const fetchImage = async (url) => {
  return fetch(url).then((response) => {
    return response.blob();
  });

  // .then((rs) => {
  //   //console.log(rs);
  //   const reader = rs.getReader();

  //   return new ReadableStream({
  //     async start(controller) {
  //       while (true) {
  //         const { done, value } = await reader.read();
  //         if (done) {
  //           break;
  //         }
  //         controller.enqueue(value);
  //       }
  //       controller.close();
  //       reader.releaseLock();
  //     },
  //   });
  // })
  // .then((response) => response.blob())
  // .then((blob) => {
  //   return blob;
  // });
};

const convertToDataUrl = async (blob) => {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      res(reader.result);
    };
    reader.readAsDataURL(blob);
  });
};

const fetchGif = async (url) => {
  return fetch(url).then((response) => response.blob());
};

export default function useMediaFetch(props) {
  const image = props.type?.includes("image");
  const gif = props.type?.includes("gif");
  const video = props.type?.includes("video");
  const doc = props.type?.includes("doc");

  const { data: previewData, previewloading } = useImage({
    src: props.preview?.url,
    fetch: async () => {
      if (props.preview?.raw) return convertToDataUrl(props.preview.raw);
      let data;
      if (image || gif || video) {
        const blob = await fetchImage(props.preview.url);
        data = await convertToDataUrl(blob);
        props.cacheMedia({ type: "preview", data });
      }

      return data;
    },
  });

  const { data: originalData, loading } = useImage({
    src: props.original?.url,
    fetch: async () => {
      if (props.original?.raw) return props.original.raw;
      let data;
      if (image || gif) {
        data = await fetchImage(props.original.url);
        props.cacheMedia({ type: "original", data });
      }
      return data;
    },
  });

  const { original, preview } = useMemo(() => {
    let original, preview;

    if (!props.type) return { original, preview };

    try {
      const originalRaw = originalData ?? props.original?.raw;
      const previewRaw = previewData ?? props.preview?.raw;

      if (originalRaw) {
        original = URL.createObjectURL(originalRaw);
      } else {
        original = props.original?.url;
      }

      if (previewRaw) {
        preview = previewRaw;
      } else {
        preview = props.preview?.url;
      }
    } catch (e) {
      //console.log(e);
    }

    return {
      original,
      preview,
    };
  }, [
    originalData,
    previewData,
    props.original?.raw,
    props.original?.url,
    props.preview?.raw,
    props.preview?.url,
    props.type,
  ]);

  // useEffect(() => {
  //   if (props.getVideo && props.original.url && video) {
  //     const videoRef = props.getVideo();
  //      videoRef.src = props.original.url;

  //     // const mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';

  //     // //console.log(videoRef);
  //     // if (videoRef && MediaSource.isTypeSupported(mimeCodec)) {
  //     //   const myMediaSource = new MediaSource();
  //     //   const url = URL.createObjectURL(myMediaSource);

  //     //   videoRef.src = url;

  //     //   const sourceopen = async () => {
  //     //     if (myMediaSource.readyState !== "open") {
  //     //       videoRef.src = url;
  //     //       myMediaSource.addEventListener("sourceopen", sourceopen, {
  //     //         once: true,
  //     //       });
  //     //       return;
  //     //     }

  //     //     try {
  //     //       const sourceBuffer = myMediaSource.addSourceBuffer(mimeCodec);

  //     //       const response = await fetch(props.original.url);

  //     //       const body = response.body;
  //     //       //console.log(body);
  //     //       const reader = body.getReader();

  //     //       let streamNotDone = true;

  //     //       while (streamNotDone) {
  //     //         const { value, done } = await reader.read();

  //     //         //console.log(value, done);
  //     //         if (done) {
  //     //           streamNotDone = false;
  //     //           break;
  //     //         }

  //     //         await new Promise((resolve, reject) => {
  //     //           sourceBuffer.appendBuffer(value);

  //     //           sourceBuffer.onupdateend = () => {
  //     //             resolve(true);
  //     //           };
  //     //         });
  //     //       }
  //     //     } catch (e) {
  //     //       //console.log(e);
  //     //     }
  //     //   };
  //     //   myMediaSource.addEventListener("sourceopen", sourceopen, {
  //     //     once: true,
  //     //   });
  //     // }
  //   }

  //   return () => {};
  // }, [props, video]);

  useEffect(() => {
    const revoke = () => {
      if (original) {
        URL.revokeObjectURL(original);
      }
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
    return revoke;
  }, [original, preview]);

  return [original, preview, false];
}
