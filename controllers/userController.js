import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { apiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asynchandler.js';
import { apiResponse } from "../utils/apiResponse.js";
// Array to hold the connected users
let users = [];




const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // add the value to the object
    user.accessToken = refreshToken;
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    apiError(
      res,
      500,
      false,
      "something wnet wrong while generating refresh and access token"
    );
    return;
  }
};

// Get all connected users
const getUsers = (req, res) => {
  try {
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// Login user
// const loginUser = async (req, res) => {
//     try {
//         const { username, password } = req.body;

//         const user = await User.findOne({ username });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Verify password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: 'Invalid credentials' });
//         }

//         // Create JWT token
//         const token = jwt.sign({ userId: user._id, username: user.username }, 'secret_key', {
//             expiresIn: '1h',
//         });

//         // Set user as online
//         user.isOnline = true;
//         await user.save();

//         res.json({ token, message: 'Login successful', user });
//     } catch (error) {
//         res.status(500).json({ message: 'Error logging in user', error: error.message });
//     }
// };


const loginUser = asyncHandler(async (req, res) => {


  const { username, password } = req.body;


  if (!username) {
    apiError(res, 400, false, " email is required");
    return;
  }


  const user = await User.findOne({
    $or: [{ username }],
  });
  if (!user) {
    apiError(res, 404, false, "user doesn't exist");
    return;
  }

  //4.password check
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    apiError(res, 401, false, "password incorrect or invalid user credentials")
    return;
  }

  //5.generate access and refresh token

  //there can be a time taking situation to generate these two.
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //it's a optional step to get the token generation and call the db
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //6.send cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});










// List all users
const listUser = async (req, res) => {
  try {
    const users = await User.find({}, 'username email isOnline');
    return res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

// Update a user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    if (!updateData) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,  // Return the updated document
      runValidators: true,  // Ensure validation is applied
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const users = await User.find({}, 'username email isOnline');
    return res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Add user to the list of connected users
const addUser = (socket, data) => {
  users.push({
    socketId: socket.id,
    username: data.username,
    room: data.room,
  });
};

// Remove user when they disconnect
const removeUser = (socketId) => {
  users = users.filter(user => user.socketId !== socketId);
};

export default { getUsers, addUser, removeUser, createUser, loginUser, listUser, updateUser };  // Export the controller as default
