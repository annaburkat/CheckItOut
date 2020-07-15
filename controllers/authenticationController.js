const {promisify} = require('util');
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

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const jwtToken = generateJwtToken(newUser._id);

  //send response
  res.status(200).json({
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

  //Check if user exist and if password is findOne
  const user = await User.findOne({
    email: email
  }).select('+password');

  const isPassword = user ? await user.correctPassword(password, user.password) : null;

  if (!user) {
    return next(new AppError('Incorrect email', 401))
  }
  if (!isPassword) {
    return next(new AppError('Incorrect password', 401))
  }
  //Check if everything is ok, send token to client
  const token = generateJwtToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    message: 'All good user'
  });
});

exports.protectRoutes = catchAsync(async (req, res, next) => {
  //1 Get jwtToken and check if exists
  let jwtToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    jwtToken = req.headers.authorization.split(' ')[1];
  }

  if (!jwtToken) {
    return next(new AppError('You are not logged in. Log in to get access.', 401));
  }

  //2 Validate jwtToken
  // const decoded = await promisify(jwt.verify)(jwtToken, process.env.JWT_SECRET);
  // console.log(decoded);
  //3 Check if user exists
  //4 Check if user changed password after jwtToken was issued
  next();
});