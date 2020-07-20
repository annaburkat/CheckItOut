const util = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const generateJwtToken = (id) => {
  return jwt.sign({
    id: id
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_DATE_EXPIRATION
  });
}

//signiup and automatically log in user
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });

  const jwtToken = generateJwtToken(newUser._id);

  //send response
  res.status(201).json({
    status: 'success',
    jwtToken,
    data: {
      user: newUser
    }
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  const {
    email,
    password
  } = req.body;

  //Check email, password - if exist
  if (!password) {
    return next(new AppError('Please provide password', 400))
  }
  if (!email) {
    return next(new AppError('Please provide email', 400))
  }

  //Check if user exist and if password is correct
  const user = await User.findOne({
    email: email
  }).select('+password');

  //correctPassword define in userModel
  const isPasswordCorrect = user ? await user.correctPassword(password, user.password) : null;

  if (!user || !isPasswordCorrect) {
    return next(new AppError('Incorrect email or password', 401))
  }

  //Check if everything is ok, send token to client
  const token = generateJwtToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    message: 'All good, you are logged in!'
  });
});

exports.protectRoutes = catchAsync(async (req, res, next) => {
  //1 Get jwtToken and check if exists
  let jwtToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    jwtToken = req.headers.authorization.split(' ')[1];
    console.log('jwtToken', jwtToken);
  }

  if (!jwtToken) {
    return next(new AppError('You are not logged in. Log in to get access.', 401));
  }

  //2 Validate jwtToken
  //verify is async function
  //and then it will call back function
  //we promisify this functi on
  //check if code wasn't manipulated
  const decoded = await util.promisify(jwt.verify)(jwtToken, process.env.JWT_SECRET);

  //3 Check if user exists - if user wasn't deleted meanwhile
  const userNow = await User.findById(decoded.id);
  if (!userNow) {
    return next(new AppError('The user belonging to this token does not exist. Please try log in again', 401));
  }

  //4 Check if user changed password after jwtToken was issued
  //instance method
  if (userNow.changedPasswordAfter(decoded.iat)) {
    return next(new AppError(`Password changed recenlty, please log in again`, 401));
  };

  //all good, serve website
  req.user = userNow;
  next();
});