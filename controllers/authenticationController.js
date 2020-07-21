const util = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const generateJwtToken = (id) => {
  return jwt.sign({
    id: id
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_DATE_EXPIRATION
  });
};

const createAndSendToken = (user, statusCode, res) => {
  console.log('grazynka')
  const jwtToken = generateJwtToken(user._id);

  //send response
  res.status(statusCode).json({
    status: 'success',
    jwtToken,
    data: {
      user: user
    }
  });
};


//signiup and automatically log in user
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  createAndSendToken(newUser, 201, res);
  // const jwtToken = generateJwtToken(newUser._id);
  //
  // //send response
  // res.status(201).json({
  //   status: 'success',
  //   jwtToken,
  //   data: {
  //     user: newUser
  //   }
  // });
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
  createAndSendToken(user, 200, res);
  // const jwtToken = generateJwtToken(user._id);
  //
  // res.status(200).json({
  //   status: 'success',
  //   jwtToken,
  //   message: 'All good, you are logged in!'
  // });
});


//protect Routes so only logged in users can access them (might change name for this function)
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


exports.restrictRoutes = (...roles) => {
  return (req, res, next) => {
    //roles is an array
    //req.user.role from previous function
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Sorry, but you do not have enough permissions.`), 403)
    }
    next();
  }
};


exports.forgotPassword = catchAsync(async (req, res, next) => {
  //I. Get user based on email
  const user = await User.findOne({
    email: req.body.email
  });

  if (!user) {
    return next(new AppError('There is no user with this email address', 404))
  };

  //II. Generate random token
  const resetToken = user.createPasswordResetToken();
  //validateBeforeSave - cancel all validators we set in schema
  await user.save({
    validateBeforeSave: false
  });


  //III. Send email to the user
  //instant method
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const messageText = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  //send it back as an email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token',
      messageText
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({
      validateBeforeSave: false
    });

    return next(new AppError('There was an error sending the email. Try again later.', 500));
  };
});


exports.resetPassword = catchAsync(async (req, res, next) => {
  //I. Get user based on Token
  //twice the same code, might refactor to own funciton
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now()
    }
  });

  //II. Set a new password only if token has not expired and there is user
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  };

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //III. Update changed password at property for current users
  //IV. Log user in
  createAndSendToken(user, 200, res);
  // const jwtToken = generateJwtToken(user._id);
  //
  // res.status(200).json({
  //   status: 'success',
  //   jwtToken,
  //   message: 'All good, you are logged in!'
  // });


});


exports.changePassword = catchAsync(async (req, res, next) => {
  //I. Get user from db
  const user = await User.findById(req.user.id).select('+password');

  //II. Check if password is correct
  const isPasswordCorrect = user ? await user.correctPassword(req.body.passwordNow, user.password) : null;

  if(!isPasswordCorrect) {
    return next(new AppError('Incorrect Password, please try again.', 401));
  };

  //III. Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // //IV. Log user in again
  createAndSendToken(user, 200, res);
  // const jwtToken = generateJwtToken(user._id);
  //
  // res.status(200).json({
  //   status: 'success',
  //   jwtToken,
  //   message: 'All good, your password was changed.'
  // });
});