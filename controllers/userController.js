const fs = require('fs');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const functionsHandler = require('./functionsHandler');

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev/data/users.json`)
);

const filterObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  })
  return newObj;
};

//update logged in user as an user
exports.updateLoggedInUser = catchAsync(async (req, res, next) => {
  //I. Create an error if user tries to update password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Action forbiden! To change password go to www.checkitout.io/changePassword'));
  };

  //II. Filter out not wanted elements
  const fillteredBody = filterObject(req.body, 'name', 'email');
  //III. Update the user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, fillteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.addNewUser = (req, res) => {
  const newId = users[users.length - 1].id + 1;
  const newUser = Object.assign({
    id: newId
  }, req.body);

  users.push(newUser);
  fs.writeFile(
    `${__dirname}/dev/data/users.json`,
    JSON.stringify(users), err => {
      res.status(201).json({
        status: 'success',
        data: {
          user: newUser
        }
      })
    });
};

//Users
exports.getAllUsers = functionsHandler.getAll(User);
exports.getOneUser = functionsHandler.getOne(User);
exports.deleteLoggedUser = functionsHandler.deleteOne(User);
exports.updateUser = functionsHandler.updateOne(User);
exports.createOne = (req, res) => {
  res.status(500).json({
    status: 'success',
    message: 'This route does not exist! Please use sign up'
  });
};