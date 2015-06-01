/**
 * ChatController
 *
 * @description :: Server-side logic for managing chats
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Msg = require('../services/MessageParse.js');
// console.log('Msg:',Msg);

module.exports = {
	join: function(req,res) {
        var gameId = req.body.gameId;
        console.log(gameId);
        Game.findOne(gameId).populateAll().then(function(game) {
            console.log('game found');
            user = null;
            for(var i = 0; i < game.players.length; i++) {
                if(game.players[i].id == req.body.userId) {
                    user = game.players[i];
                    break;
                }
            }
            if(!user) {
                user = game.gm.id == req.body.userId ? game.gm : false;
            }

            if(user) {
                console.log('correct user')
                sails.sockets.broadcast('chat_'+gameId,'userjoin',user);
                sails.sockets.join(req.socket,'chat_'+game.id);

                req.socket.on('disconnect', function() {
                    sails.sockets.broadcast('chat_'+gameId,'userleave',user)
                    // idx = game.currentUsers.indexOf(user);
                    // game.currentUsers.splice(idx,1);
                });
                // console.log('about to push new current user...')
                // if(Array.isArray(game.currentUser)) {
                //     game.currentUsers.push(user);
                // } else {
                //     game.currentUsers = [user];
                // }

                // console.log('...pushing complete')
                res.send(game);
            } else {
                console.log('no user');
                res.send({error:'no player'});
            }
        }).catch(function(err) {
            res.send({error:'no game'});
        });
    },
    message: function(req,res) {
        var gameId = req.body.gameId;
        Game.findOne(gameId).populate('gm').populate('players').populate('characters').then(function(game) {
            console.log('game found');
            user = _.find(game.players,{id:req.body.from});
            console.log('found user in players',user);
            if(!user) {
                console.log('gm id',game.gm.id,'user id',req.body.from)
                user = game.gm.id == req.body.from ? game.gm : false;
                console.log('found user in gm',user)
            }
            if(user) {
                console.log('correct user');
                var msgData = {
                    message: req.body.msg,
                    to: req.body.to,
                    as: req.body.as,
                    flags: req.body.flags,
                    from: req.body.from,
                    game: gameId
                }

                msgData = Msg.parseMsgCmd(msgData);
                console.log('return msgData:',msgData);

                console.log('attempting to create new message');
                Chat.create(msgData).then(function(message) {
                    console.log('created message');
                    sails.sockets.broadcast('chat_'+gameId,'newmessage',message);
                    res.send(message);
                }).catch(function(err){
                    sails.log.error(err);
                    res.send(400,err);
                });
            }
        }).catch(function(err){
            sails.log.error(err);
            res.send(400,err);
        });
    }
};

