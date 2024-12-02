export const apiError = (
    res,
    statusCode,
    status,
    message,
    length = false
  ) => {
    if (length) {
      return res.status(statusCode).json({
        status,
        message,
       
        
      });
    }
    return res.status(statusCode).json({
      status,
      message,
    });
  };