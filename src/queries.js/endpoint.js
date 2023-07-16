// export const endpoint = process.env.REACT_APP_ENDPOINT_URL;
 export const endpoint =
   process.env.NODE_ENV !== "production"
     ? `${process.env.REACT_APP_ENDPOINT_LOCAL_URL}`
     : `${process.env.REACT_APP_ENDPOINT_URL}`;
