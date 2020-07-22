const fs = require('fs');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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

//Users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  // const places = await finalQuery;

  //send response
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getOneUser = (req, res) => {
  const userId = parseInt(req.params.userID);
  //check if such a user exist (user with given id)
  if (userId > users.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'no such a user'
    });
  };

  const user = users.find(el => el.id === userId);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
};

exports.deleteLoggedUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {active: false});

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.updateUser = (req, res) => {
  //check if such a user exist (users with given id)
  if (parseInt(req.params.userID) > users.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'no such a user'
    });
  };

  res.status(200).json({
    status: 'success',
    data: {
      user: 'updated user'
    }
  });
};

//update user as an user
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
  // console.log(req.body);
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