'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    validate: [v => {
      // validates to see if username is admin
      return v != 'admin';
    }, 'admin is a motherfucker']
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    // unique: true
  },
  phone: {
    type: String,
    // unique: true
  },
  reg_date: {
    type: Date
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  is_vip: {
    type: Boolean,
    default: false
  },
  is_online: {
    type: Boolean,
    default: false
  },
  is_available: {
    type: Boolean,
    default: false
  },
  gender: {
    type: Number,
    default: false,
    required: true
  },
  personal_question: {
    type: String
  },
  questions_picked: [{}],
  questions_answered: [{}],
  friend_requests: [{
    req_user_id: {
      type: String,
      required: true
    },
    req_msg: {
      type: String
    },
    req_date: {
      type: Date
    }
  }],
  chat_requests: [{
    req_user_id: {
      type: String,
      required: true
    },
    req_msg: {
      type: String
    },
    req_date: {
      type: Date
    }
  }],
  chat_id: {
    type: String
  },
  chat_room: {
    type: String
  },
  friend_list: [{}],
  is_active_user: {
    type: Boolean
  }
});

// salt and hash in pre hook
UserSchema.pre('save', function (next) {

  const user = this;

  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, (error, salt) => {
      if (error) return next(error);
      bcrypt.hash(user.password, salt, (error, hash) => {
        if (error) return next(error);
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

// functiont that comparies passwords
UserSchema.methods.comparePassword = function (password, callback) {
  bcrypt.compare(password, this.password, (error, matches) => {
    if (error) return callback(error);
    callback(null, matches);
  });
};

module.exports = mongoose.model('User', UserSchema);