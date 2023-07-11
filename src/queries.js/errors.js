
export class APIError extends Error {
  constructor(name, statusCode, message) {

    super(message);
    this.name = name ?? 'API Error';
    this.statusCode = statusCode;
  }
}

export const errorHandler = (error) => {


  if (error.response && error.response.data) {
   
    const response = error.response;
    const data = response.data;
    throw new APIError(data.name ?? "", response.statusCode, data.message);
  } else if (error.message) {
    throw new APIError(error.name ?? "", error.statusCode, error.message);
  } else if (error.request) {
    throw new APIError("BadRequest", null, "something went wrong");
  } else {
 
  }
};

