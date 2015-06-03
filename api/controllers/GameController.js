/**
 * GameController
 *
 * @description :: Server-side logic for managing games
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index: function(req,res) {
        // console.log('game queries:',req.query)
        if(req.query.q) {
            Game.find({name: {'contains':req.query.q}, active: true, public: true, limit:req.query.limit, sort:'createdAt DESC'})
                .populate('gm').populate('system').exec(function(err, games) {
                    // console.log('data',games)
                    if(err) {
                        res.send([]);
                    } else {
                        res.send(games);
                    }
                });
        } else if (req.query.p) {
            Game.find({active: true, public: true, skip:(parseInt(req.query.p)*parseInt(req.query.limit)), limit:req.query.limit, sort:'createdAt DESC'})
                .populate('gm').populate('system').exec(function(err, games) {
                    // console.log('data',games)
                    if(err) {
                        res.send([]);
                    } else {
                        res.send(games);
                    }
                });
        } else {
            Game.find().populateAll().exec(function(err, games) {
                    // console.log('data',games)
                if(err) {
                    res.send([]);
                } else {
                    res.send(games);
                }
            })
        }
    }
};

