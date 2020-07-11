const express = require('express');
const fs = require('fs');
// const placeController = require('./../controllers/userController.js');
const {getAllUsers, addNewUser, getOneUser, deleteUser, updateUser} =  require('./../controllers/userController.js');

const router = express.Router();

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