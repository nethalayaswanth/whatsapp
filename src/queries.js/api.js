import axios from "axios";



const endpoint =
  process.env.NODE_ENV !== "production"
    ? `${process.env.REACT_APP_ENDPOINT_LOCAL_URL}`
    : `${process.env.REACT_APP_ENDPOINT_URL}`;

    
    
export const client = axios.create({
  baseURL: process.env.REACT_APP_ENDPOINT_URL,
  withCredentials: true,
});

class APIError extends Error {
  constructor(name, statusCode, message) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
  }
}

export const errorHandler = (error) => {
  console.log(error);

  if (error.response) {
    if (error.response.data) {
      console.log(error.response.data);
      console.log(error.response.statusCode);
      console.log(error.response.headers);
      const response = error.response;
      const data = response.data;
      throw new APIError(data.name ?? "", response.statusCode, data.message);
    }
  } else if (error.request) {
    throw new APIError("BadRequest", null, "something went wrong");
  } else {
    console.log("Error", error.message);
  }
}; 

export const MESSAGES_TO_LOAD = 9;

export const login = async ({ input }) => {
  try {
    const x = await client.post("/login", { input });
    return x.data;
  } catch (e) {
    errorHandler(e);
  }
};

export const anotherAccount = async () => {
  try {
    const x = await client.post("/anotherAccount");
    return x.data;
  } catch (e) {
    errorHandler(e);
  }
};

export const signUp = async ({ username, email }) => {
  try {
    const x = await client.post("/signUp", { username, email });
    return x.data;
  } catch (e) {
    errorHandler(e);
  }
};

export const aboutUpdate = async (data) => {
  try {
    const { about } = data;

    const x = await client.post("/profileUpdate", { about });

    return x.data?.payload;
  } catch (e) {
    errorHandler(e);
  }
};

export const nameUpdate = async ({ name }) => {
  try {
    const x = await client.post("/profileUpdate", { name });

    return x.data?.payload;
  } catch (e) {
    errorHandler(e);
  }
};

export const pinRoom = async ({ roomId, pin }) => {
  try {
    const x = await client.post("/pin", { roomId, pin });

    return x.data;
  } catch (e) {
    errorHandler(e);
  }
};

export const dpUpdate = async ({ original, preview }) => {
  try {
    const [url, previewUrl] = await getObjectUrls({
      original,
      preview,
      collection: "dp",
    });

    const res = await client.post("/profileUpdate", {
      dp: { original, preview },
    });

    return { dp: { original, preview } };
  } catch (e) {
    errorHandler(e);
  }
};

export const createGroup = async ({
  original,
  preview,
  name,
  roomId,
  members,
  about,
  createdAt,
}) => {
  try {
    const urls = await getObjectUrls({ original, preview, collection: "dp" });

    const res = await client.post("/createGroup", {
      name,
      roomId,
      members,
      about,
      createdAt,
      dp: { url: urls[0], ...(urls[1] && { previewUrl: urls[1] }) },
    });

    return {
      name,
      roomId,
      members,
      about,
      createdAt,
      dp: { original: urls[0], ...(urls[1] && { preview: urls[1] }) },
    };
  } catch (e) {
    errorHandler(e);
  }
};

export const checkUsername = async ({ username }) => {
  try {
    const x = await client.post("/checkUsername", { username });
    return x.data;
  } catch (e) {
    errorHandler(e);
  }
};
export const checkUserEmail = async ({ email }) => {
  try {
    const x = await client.post("/checkUsername", { email });
    return x.data;
  } catch (e) {
    errorHandler(e);
  }
};

export const getOnlineUsers = async () => {
  try {
    return await client.get(`/users/online`).then((x) => {
      return x.data;
    });
  } catch (e) {
    errorHandler(e);
  }
};

export const getUser = async () => {
  try {
    const { data } = await client.get("/me");
    return data;
  } catch (error) {
    errorHandler(error)
  }
};

export const getMessage = async ({ roomId, messageId }) => {
  try {
    const { data } = await client.get(`/room/${roomId}/messages /${messageId}`);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const getRooms = async () => {
  try {
    const data = await client.get(`/rooms`).then((x) => x.data);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const getRoomById = async (id) => {
  try {
    const data = await client.get(`/room/${id}`).then((x) => x.data);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const search = async (query) => {
  try {
    const data = await client
      .get(`/search`, {
        params: {
          partial: query,
        },
      })
      .then((x) => x.data);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const getMessages = async ({ roomId, after }) => {
  try {
    const response = await client
      .get(`/room/${roomId}/messages`, {
        params: {
          after,
        },
      })
      .then((x) => x.data);
    return response;
  } catch (e) {
    errorHandler(e);
  }
};

export const getMedia = async ({ roomId }) => {
  try {
    const response = await client
      .get(`/room/${roomId}/media`)
      .then((x) => x.data);
    return response;
  } catch (e) {
    errorHandler(e);
  }
};

export const getDocuments = async (id, offset = 0, size = MESSAGES_TO_LOAD) => {
  try {
    const response = await client
      .get(`/room/${id}/documents`, {
        params: {
          offset,
          size,
        },
      })
      .then((x) => x.data);
    return response;
  } catch (e) {
    errorHandler(e);
  }
};
export const clearUnread = async (roomId) => {
  try {
    const response = await client
      .post(`/room/${roomId}/clearUnread`)
      .then((x) => x.data);

    return response;
  } catch (e) {
    errorHandler(e);
  }
};
export const getUserById = async (userId) => {
  try {
    if (!userId) return null;
    return await client.get(`/user/${userId}`).then((x) => x.data);
  } catch (e) {
    errorHandler(e);
  }
};
export const getUsersbyIds = async (usersIds) => {
  try {
    return await client
      .get(`/users`, { params: { usersIds } })
      .then((x) => x.data);
  } catch (e) {
    errorHandler(e);
  }
};

export const getObjectUrls = async ({
  original,
  preview,
  signal,
  progressCb,
  collection = "dp",
}) => {
  try {
    if (!original.type || !original.name) {
      throw new Error("invalid filetype");
    }

    const types = {
      original: original.type,
      ...(preview && { preview: preview?.type }),
    };
    const signedUrls = await client
      .post(`/requestSignedUrl`, {
        types,
        collection: collection,
      })
      .then((x) => x.data);

    return await Promise.all(
      signedUrls.map(async (url, i) => {
        const file = i === 0 ? original : preview;
        const data = await postTos3({
          file,
          url,
          signal,
          ...(i === 0 && { progressCb }),
        });

        return url.substring(0, url.indexOf("?"));
      })
    );
  } catch (e) {
    errorHandler(e);
  }
};

export const postTos3 = async ({ file, url, signal, progressCb }) => {
  try {
    const res = await axios
      .put(url, file, {
        signal,
        headers: { "Content-Type": `${file.type}` },
        onUploadProgress: (progressEvent) => {
          var percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          progressCb?.(percentCompleted);
        },
      })
      .then((x) => x);

    return res.data;
  } catch (e) {
    throw errorHandler(e);
  }
};

export const uploadMessage = async ({
  collection,
  progressCb,
  signal,
  ...data
}) => {
  try {
    if (
      (data.message && !data.message.hasOwnProperty("original")) ||
      typeof data.message.original !== "object" ||
      data.message.type === "gif"
    ) {
      return { ...data };
    }

    const [original, preview] = await getObjectUrls({
      original: data.message.original?.raw,
      preview: data.message.preview?.raw,
      collection,
      progressCb,
    });

    const response = {
      ...data,
      message: {
        ...data.message,
        original: { url: original, raw: data.message.original?.raw },
        preview: { url: preview, raw: data.message.preview?.raw },
      },
    };
    return response;
  } catch (e) {
    errorHandler(e);
  }
};
