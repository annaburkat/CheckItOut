const express = require('express');
const fs = require('fs');

const {
  getAllUsers,
  addNewUser,
  getOneUser,
  updateUser,
  updateLoggedInUser,
  deleteLoggedUser
} = require('./../controllers/userController.js');

const {
  signUp,
  logIn,
  resetPassword,
  forgotPassword,
  changePassword,
  protectRoutes
} = require('./../controllers/authenticationController.js');


const router = express.Router();

router
  .post('/signup', signUp);
router
  .post('/login', logIn);

router
  .post('/forgotPassword', forgotPassword);
router
  .patch('/resetPassword/:token', resetPassword);
router
  .patch('/changePassword', protectRoutes, changePassword);
router
  .patch('/updateProfile', protectRoutes, updateLoggedInUser);
router
  .delete('/deleteProfile', protectRoutes, deleteLoggedUser);

router
  .route('/')
  .get(getAllUsers)
  .post(addNewUser);

router
  .route('/:userID')
  .get(getOneUser)
  .patch(updateUser);


module.exports = router;