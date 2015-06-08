/**
* Game.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name: {
        type: 'string',
        required: true
    },
    description: {
        type: 'text'
    },
    active: {
        type: 'boolean',
        defaultsTo: true
    },
    public: {
        type: 'boolean',
        defaultsTo: true
    },
    currentUsers: {
        type: 'array'
    },

    ////// Associations //////

    gm: {
        model: 'User'
    },
    players: {
        collection: 'User',
        via: 'playingGames'
    },
    pending: {
        collection: 'User',
        via: 'pendingGames'
    },
    system: {
        model: 'System'
    },
    sheetTemplate: {
        model: 'Sheet'
    },
    characters: {
        collection: 'Character',
        via: 'game'
    },
    messages: {
        collection: 'Chat',
        via: 'game'
    }
  }
};

