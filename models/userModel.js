const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, 'Please enter an email'],
    validate: [validator.isEmail, 'Please enter valid email']
  },
  photo: {
    type: String
  },
  //Implement password validation special characters etc
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    //change to something bigger later
    minlength: 3,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm a password'],
    validate: {
      validator: function(el) {
        return el === this.password
      },
      message: 'Passwords don\'t match'
    }
  },
  passwordChangedAt: Date
});

//encription password - middlware
userSchema.pre('save', async function(next) {
  //only if password was changed - in other cases it's not needed to encrypt again
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcryptjs.hash(this.password, 12);
  //after validation we don't need passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

//instance method - is a method which will be available every
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcryptjs.compare(candidatePassword, userPassword);
};



userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
  if(this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000);
    console.log(changedTimestamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimestamp;
  }

  //FALSE mean not changed password
  return false;
};
// userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
//   if (this.passwordChangedAt) {
//     console.log('dupcia');
//     // console.log(this.passwordChangedAt, JWTTimeStamp);
//   }
//
//   return false;
// }

const User = mongoose.model('User', userSchema);

module.exports = User;