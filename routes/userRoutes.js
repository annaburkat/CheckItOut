const express = require('express');
const fs = require('fs');

const {
  getAllUsers,
  addNewUser,
  getOneUser,
  updateUser,
  updateLoggedInUser,
  deleteLoggedUser,
  getMe
} = require('./../controllers/userController.js');

const {
  signUp,
  logIn,
  resetPassword,
  forgotPassword,
  changePassword,
  protectRoutes,
  restrictRoutes
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


//Protect All routes below
router.use(protectRoutes);

router
  .patch('/changePassword', changePassword);
router
  .patch('/updateProfile', updateLoggedInUser);
router
  .delete('/deleteProfile', deleteLoggedUser);
router
  .get('/me', getMe, getOneUser);

router
  .route('/')
  .get(getAllUsers)
  .post(
    restrictRoutes('admin', 'redactor'),
    addNewUser
  );

router
  .route('/:id')
  .get(getOneUser)
  .delete(
    restrictRoutes('admin', 'redactor'),
    deleteLoggedUser
  )
  .patch(
    restrictRoutes('admin', 'redactor'),
    updateUser
  );

module.exports = router;