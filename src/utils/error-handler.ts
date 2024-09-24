const errorHandler = (err: Error) => {
  const errorMessage = err.message ? err.message : "Internal Server Error";

  return errorMessage;
};

export { errorHandler };
