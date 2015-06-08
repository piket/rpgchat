/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var bcrypt = require('bcrypt');

module.exports = {

  attributes: {
    username: {
        type: 'string',
        required: true,
        unique: true
    },
    email: {
        type: 'email',
        required: true,
        unique: true
    },
    password: {
        type: 'string',
        required: true
    },
    toJSON: function() {
        var obj = this.toObject();
        delete obj.password;
        delete obj.email;
        return obj;
    },

    ////// Associations //////

    chats: {
        collection: 'Chat',
        via: 'from'
    },
    characters: {
        collection: 'Character',
        via: 'player'
    },
    gmGames: {
        collection: 'Game',
        via: 'gm'
    },
    playingGames: {
        collection: 'Game',
        via: 'players'
    },
    pendingGames: {
        collection: 'Game',
        via: 'pending'
    }
  },
  beforeCreate: function(values, callback) {
    bcrypt.hash(values.password,10,function(err,hash) {
        if(err) return callback(err);

        values.password = hash;

        callback();
    });
  }
};

