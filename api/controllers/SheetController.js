/**
 * SheetController
 *
 * @description :: Server-side logic for managing sheets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    // create: function(req,res) {
    //     return res.send('creating sheet');
    // },
    index: function(req,res) {
        console.log('sheet index hit',req.query)
        if(req.query.systemId && req.query.systemId !== 'none') {
            Sheet.find({or: [{system: req.query.systemId},{system:'any'},{system:undefined}]}).exec(function(err,data) {
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

