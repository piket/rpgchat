/**
* Character.js
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
    values: {
        type: 'json'
    },
    color: {
        type: 'string',
        defaultsTo: 'default'
    },
    langauges: {
        type: 'array',
        defaultsTo: []
    },

    ////// Associations //////

    sheetTemplate: {
        model: 'sheet'
    },
    player: {
        model: 'User'
    },
    game: {
        model: 'Game'
    }
  }
};

