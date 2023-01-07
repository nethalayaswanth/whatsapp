import {
  forwardRef,
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useMemo,
} from "react";

const fetchMedia = (url, cb) => {
  fetch(url)
    .then((response) => response.body)
    .then((rs) => {
      const reader = rs.getReader();

      return new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            controller.enqueue(value);
          }
          controller.close();
          reader.releaseLock();
        },
      });
    })
    .then((rs) => new Response(rs))
    .then((response) => response.blob())
    .then((blob) => {
      cb(blob);
    })
    .catch((err) => console.error(err));
};

export default function useMediaFetch(props) {
  const original = useRef();
  const preview = useRef();
  const loading = useRef();

  const [_, render] = useState();

  const revoke = useMemo(() => {
    const _original = original.current;
    const _preview = preview.current;

    if (!props.type) return;
    if (props.type === "video") {
      const video = document.createElement("video");
      video.src = _original;
      video.onloadedmetadata = (event) => {
        video.pause();
        // setLoading(false);
      };
    }

    if (props.type.includes("image") || props.type === "gif") {
      if (props.original.raw) {
         console.log("%cfrom raw", "color:green");
        original.current = URL.createObjectURL(props.original.raw);
      } else if (props.original.url) {
        console.log('%cfetching original','color:orange')
        loading.current = true;
        fetchMedia(props.original.url, (blob) => {
          original.current = URL.createObjectURL(blob);
           loading.current = false;
          props.cacheMedia({ original: blob });
        });
      }
      if (props.preview.raw) {
        preview.current = URL.createObjectURL(props.preview.raw);
      } else if (props.preview.url) {
         console.log("%cfetching preview", "color:blue");
        preview.current = props.preview.url;

        fetchMedia(props.preview.url, (blob) => {
          preview.current = URL.createObjectURL(blob);
          props.cacheMedia({ preview: blob });
        });
      }
    }

    return () => {
      if (original.current) {
        URL.revokeObjectURL(_original);
      }
      if (preview.current) {
        URL.revokeObjectURL(_preview);
      }
    };
  }, [props]);


  useEffect(() => {
    return () => {
      revoke();
    };
  }, [revoke]);

  return [original.current, preview.current, loading.current];
}
