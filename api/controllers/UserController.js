/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	show: function(req,res) {
        User.findOne(req.params.id).populate('gmGames').populate('playingGames').populate('characters').then(function(user) {
            res.send(user);
        }).catch(function(err) {
            res.send({error:err});
        });
    }
};

