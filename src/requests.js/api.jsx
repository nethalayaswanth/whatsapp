import { data } from "autoprefixer";
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true,
});

export const MESSAGES_TO_LOAD = 30;

export const login = async ({input}) => {
  try {
    const x = await client.post("/login", {input });
    return x.data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
};

export const anotherAccount = async () => {
  try {
    console.log('another')
    const x = await client.post("/anotherAccount");
    return x.data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
};

export const signUp = async ({ username, email }) => {
  try {
    const x = await client.post("/signUp", { username, email });
    return x.data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
};

export const aboutUpdate = async (data) => {
  try {
    const { about } = data;

    const x = await client.post("/aboutUpdate", { about });

    return x.data?.payload;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
};

export const nameUpdate = async ({ name }) => {
  try {
    const x = await client.post("/nameUpdate", { name });

    return x.data?.payload;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
};

export const dpUpdate = async ({ files }) => {
  try {
    const urls = await getObjectUrls({ files, collection: "dp" });

    const x = await client.post("/dpUpdate", {
      dp: { url: urls[0], ...(urls[1] && { previewUrl: urls[1] }) },
    });

    return { dp: { url: urls[0], ...(urls[1] && { previewUrl: urls[1] }) } };
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
};

export const checkUsername = async ({ username }) => {
  try {
    console.log(username)
    const x = await client.post("/checkUsername", { username });
    return x.data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
};
export const checkUserEmail = async ({ email }) => {
  try {
   
    const x = await client.post("/checkUsername", { email });
    return x.data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
};

export const getOnlineUsers = async () => {
  return await client.get(`/users/online`).then((x) => {
    return x.data;
  });
};

export const getUser = async () => {
  try {
    const { data } = await client.get("/me");
    return data;
  } catch (e) {
    throw new Error(e.response && e.response.data && e.response.data.message);
  }
};

export const getRooms = async () => {
  const data = await client.get(`/rooms`).then((x) => x.data);

  const rooms = {};
  data
    .filter((x) => !!x)
    .forEach((room) => {
      rooms[`${room.roomId}`] = room;
    });

  return rooms;
};

function getErrorMessage(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export const getMessages = async (id, offset = 0, size = MESSAGES_TO_LOAD) => {
  const response = await client
    .get(`/room/${id}/messages`, {
      params: {
        offset,
        size,
      },
    })
    .then((x) => x.data);

const messages = response.reduce((prev, current) => {
       prev[current.id] = current;
       return prev;
     }, {});

  return messages;
};

export const getMedia = async (id, offset = 0, size = MESSAGES_TO_LOAD) => {

  const response = await client
    .get(`/room/${id}/media`, {
      params: {
        offset,
        size,
      },
    })
    .then((x) => x.data);

  return response;
};

export const getDocuments = async (id, offset = 0, size = MESSAGES_TO_LOAD) => {

  const response = await client
    .get(`/room/${id}/documents`, {
      params: {
        offset,
        size,
      },
    })
    .then((x) => x.data);

  return response;
};
export const clearUnread = async (roomId) => {


  const response = await client
    .post(`/room/${roomId}/clearUnread`)
    .then((x) => x.data);

  return response;
};
export const getUserById = async (userId) => {
  return await axios.get(`/user`, { params: { userId } }).then((x) => x.data);
};
export const getUsersbyIds = async (usersIds) => {
  return await axios
    .get(`/users`, { params: { usersIds } })
    .then((x) => x.data);
};

export const getObjectUrls = async ({ files, collection }) => {
  try {
    if (!files[0].type || !files[0].name) {
      throw new Error("invalid filetype");
    }
    const signedUrls = await client
      .get(`/requestSignedUrl`, {
        params: {
          types: files.map((file) => file.type),
          collection: "dp",
        },
      })
      .then((x) => x.data);
    const urls = await Promise.all(
      signedUrls.map(async (url, i) => {
        const data = await postTos3(files[i], url);

        return url.substring(0, url.indexOf("?"));
      })
    );

    return urls;
  } catch (e) {
    console.log(e);
  }
};

export const postTos3 = async (file, url) => {
  try {
    const res = await axios
      .put(url, file, {
        headers: { "Content-Type": `${file.type}` },
      })
      .then((x) => x);

    return res.data;
  } catch (e) {
    console.log(e);
  }
};

export const uploadTos3 = async ({ collection, ...data }) => {
  try {
    if (data.message && !data.message.hasOwnProperty("files")) {
      return { ...data };
    }

    const { files, ...restOfMessage } = data.message;

    const urls = await getObjectUrls({ files, collection });

    // if (!files[0].type || !files[0].name) {
    //   throw new Error("invalid filetype");
    // }
    // const signedUrls = await client
    //   .get(`/requestSignedUrl`, {
    //     params: {
    //       types: files.map((file) => file.type),
    //       collection,
    //     },
    //   })
    //   .then((x) => x.data);

    // const urls = await Promise.all(
    //   signedUrls.map(async (url, i) => {
    //     const data = await postTos3(files[i], url);

    //     return url.substring(0, url.indexOf("?"));
    //   })
    // );

    const response = {
      ...data,
      message: {
        ...restOfMessage,
        url: urls[0],
        ...(urls[1] && { previewUrl: urls[1] }),
      },
    };
    return response;
  } catch (e) {
    console.log(e);
  }
};
