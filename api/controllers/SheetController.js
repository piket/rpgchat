/**
 * SheetController
 *
 * @description :: Server-side logic for managing sheets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index: function(req,res) {
        if(req.query.systemId && req.query.systemId !== 'none') {
            Sheet.find({or: [{system: req.query.systemId},{system:null},{system:undefined}]}).exec(function(err,data) {
                if(err) {
                    res.send(err);
                } else {
                    res.send(data);
                }
            })
        } else {
            Sheet.find().populateAll().exec(function(err,data) {
                if(err) {
                    res.send(err);
                } else {
                    res.send(data);
                }
            })
        }
    }
};

