import {
  forwardRef,
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
} from "react";

export default function useMediaFetch({src}) {


  // if(src.type.includes('video')){

  //   console.log(src?.previewUrl, src?.url);
  // }
        
  const preview = src?.previewUrl || src?.url;
  const [original, setOriginal] = useState();
   

  const blobUrl = useRef();

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if(!src || src.type==='doc') return

    const fetchMedia = async () => {
      if (blobUrl.current) {
        URL.revokeObjectURL(blobUrl.current);
      }
      try {
        const blob = await fetch(src.url).then(function (response) {
          return response.blob();
        });

        blobUrl.current = URL.createObjectURL(blob);

        if (src.type.includes("video")) {
          setOriginal(blobUrl.current);
          setLoading(false);
          return;
        }
        setOriginal(blobUrl.current);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    };

    if (src.url) {
      fetchMedia();
    }

    return () => {
      if (blobUrl.current) {
        URL.revokeObjectURL(blobUrl.current);
      }
    };
  }, []);


  return [original, preview, loading];
}
