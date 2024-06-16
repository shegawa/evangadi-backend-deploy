// to verify the token

const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

// now we send token through header not like req.body

async function authMiddleware(req, res, next) {
  const authheader = req.headers.authorization;
  //   // If no authorization header is present or it doesn't start with 'Bearer ', respond with 401 Unauthorized
  if (!authheader || !authheader.startsWith("Bearer ")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "No token provided/Authentication: Invalid" });
  }

  //if the header starts with the Bearer keyword followed by a space and the token
  // Extract the token from the authorization header
  const token = authheader.split(" ")[1];
  try {
    // access palyload data by destructuring
    const { username, userid } = jwt.verify(token, process.env.JWT_SECRET);

    // send the data to the next controller
    req.user = { username, userid };
    // return res.status(StatusCodes.OK).json({ data });
    //If the token is successfully verified, the next() function is called.
    //next middleware function or route handler should be executed.
    //next() is a function that passes control to the next middleware function in the stack
    next(); // to reachout other page/ pass to next middleware
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication: Invalid" });
  }
}
module.exports = authMiddleware;
