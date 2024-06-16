const dbconnection = require("../db/dbConfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes"); //HTTP Status Codes​​ Access the status codes you need, with the protocol being used

async function register(req, res) {
  const { username, firstname, lastname, email, password } = req.body;
  if (!username || !firstname || !lastname || !email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "All fields are required" });
  }
  try {
    //using array destructuring to get the first element of the array returned by the dbconnection.query method.
    // the query method returns an array where the first element is the result set (an array of rows) and the second element is metadata about the query.
    //index[0]
    const [user] = await dbconnection.query(
      "SELECT userid,username from users WHERE username = ? or email = ?",
      [username, email]
    );
    // return res.json({userinformation:user})
    if (user.length > 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "user already registered" });
    }
    if (password.length <= 8) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Password must be at least 8 characters long" });
    }
    // Best Practice
    const saltRounds = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await dbconnection.query(
      "INSERT INTO users (username, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)",
      [username, firstname, lastname, email, hashedPassword]
    );

    // Send a success response
    res
      .status(StatusCodes.CREATED)
      .json({ message: "User registered successfully" });
  } catch (error) {
    // // Handle errors
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong. Please try again later." });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "All fields are required" });
  }
  try {
    const [user] = await dbconnection.query(
      "SELECT userid,username,password from users WHERE email=?",
      [email]
    );
    // return res.json({ user: user });

    if (user.length == 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid credentials" });
    }
    // compare the actual password with decrypted one
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid credentialsp " });
    }

    // JWTs are often used for authentication. Once the user is logged in, each subsequent request will include the JWT, allowing the user to access routes, services, and resources that are permitted with that token. This token can be stored in local storage or cookies on the client side.
    // assign Toke for user
    // Payload: The data you want to include in the token (e.g., user information).
    // Secret or Private Key: The key used to sign the token for ensuring its integrity.
    // Options: Optional settings like the algorithm, expiration time, issuer, etc.

    // Define the payload
    const username = user[0].username;
    const userid = user[0].userid;
    // Define the secret key
    const secret = process.env.JWT_SECRET;
    // Define options
    const options = { expiresIn: "1d" };
    // Create the token
    const token = jwt.sign({ username, userid }, secret, options);

    return res
      .status(StatusCodes.OK)
      .json({ message: "User Logged In", token, username });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong. Please try again later." });
  }
}
async function checkUser(req, res) {
  const username = req.user.username;
  const userid = req.user.userid;

  res
    .status(StatusCodes.OK)
    .json({ message: "valid useres", username, userid });
}
module.exports = { register, login, checkUser };
