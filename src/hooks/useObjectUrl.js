import { useEffect, useMemo } from "react";
import { useLayoutEffect, useState, useRef } from "react";
import { generateThumbNail } from "../utils";

const createImage = (url) => {
  return new Promise((res, rej) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const ascpectRatio = img.naturalWidth / img.naturalHeight;
      const height = 320;
      const width = height * ascpectRatio;

      res({
        url,
        width,
        height,
        ascpectRatio,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      });
    };
  });
};

export function useObjectUrl({ resources, revoke }) {
  

  const urls = useMemo(() => {
    return resources
      ? resources.map((file) => {
          if (typeof file === "object") {
            return URL.createObjectURL(file);
          } else {
            return file;
          }
        })
      : null;
  }, [resources]);

  useEffect(() => {
    return () => {
      if (urls) {
        urls.forEach((url) => {
           if (url.includes('blob')) {
             URL.revokeObjectURL(url);
           }
          
        });
      }
    };
  }, [urls]);

  return urls;
}


