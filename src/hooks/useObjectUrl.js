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

export function useObjectUrl({ files, revoke }) {
  

  const urls = useMemo(() => {
    return files ? files.map((file) => URL.createObjectURL(file)) : null;
  }, [files]);

  useEffect(() => {
    return () => {
      if (urls) {
        urls.forEach((url) => {
          URL.revokeObjectURL(url);
        });
      }
    };
  }, [urls]);

  return urls;
}


