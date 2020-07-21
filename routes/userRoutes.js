const express = require('express');
const fs = require('fs');
// const placeController = require('./../controllers/userController.js');
const {
  getAllUsers,
  addNewUser,
  getOneUser,
  deleteUser,
  updateUser
} = require('./../controllers/userController.js');

const {
  signUp,
  logIn,
  changePassword,
  forgotPassword
} = require('./../controllers/authenticationController.js');

const router = express.Router();

router
  .post('/signup', signUp)
router
  .post('/login', logIn)

router
  .post('/forgotPassword', forgotPassword)
router
  .patch('/changePassword/:token', changePassword)

router
  .route('/')
  .get(getAllUsers)
  .post(addNewUser);

router
  .route('/:userID')
  .get(getOneUser)
  .delete(deleteUser)
  .patch(updateUser);

module.exports = router;