const crypto = require('crypto');
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
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['user', 'redactor', 'admin'],
    default: 'user'
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});


//encription password - middlware
userSchema.pre('save', async function(next) {
  //only if password was changed - in other cases it's not needed to encrypt again
  if (!this.isModified('password')) {
    return next();
  }

  //hashing password with cost 12
  this.password = await bcryptjs.hash(this.password, 12);
  //after validation we don't need passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next){
  if(!this.isModified('password') || this.isNew){
    return next();
  };

  this.passwordChangedAt = Date.now() - 2000;
  next();

});

userSchema.pre(/^find/, function(next){
  // this points to the current query
  //when someone is looking for user, show only those with active status
  this.find({active: true});
  next();
});

//instance method - is a method which will be available every
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcryptjs.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);
    // console.log(changedTimestamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimestamp;
  }

  //FALSE mean not changed password
  return false;
};

userSchema.methods.createPasswordResetToken = function() {

  //using default package to create token
  //we will send this token to send to user and it's like a password
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  //adding extra time - for how long reset token will be valid
  this.passwordResetExpires = Date.now() + 300000;
  // console.log({resetToken},   this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;