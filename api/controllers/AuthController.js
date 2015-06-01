/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bcrypt = require('bcrypt');

module.exports = {
    check: function(req,res) {
        res.send({
            user: req.session.user || false
        });
    },
    login: function(req,res) {
        // res.send('logging in...');
        User.findOne({username:req.body.username}).then(function(user){
            if(user) {
                bcrypt.compare(req.body.password,user.password,function(err, result) {
                    if(err) {
                        return res.send({
                            result: false,
                            error: err
                        });
                    }
                    if(result) {
                        req.session.user = user;
                        res.send({
                            result: true,
                            user: user
                        });
                    } else {
                        res.send({
                            result: false,
                            error: 'Invalid password'
                        });
                    }
                })
            } else {
                res.send({
                    result: false,
                    error: 'Unknown user'
                });
            }
        });
    },
    logout: function(req,res) {
        delete req.session.user;
        res.send({result:true});
    },
    signup: function(req,res) {
        User.create({username:req.body.username,email:req.body.email,password:req.body.password}).exec(function(err,user) {
            if(err) {
                return res.send({
                    result: false,
                    error: err
                });
            }
            if(user) {
                req.session.user = user;
                res.send({
                    result: true,
                    user: user
                });
            } else {
                res.send({
                    result: false,
                    error: 'Unknown error'
                });
            }
        });
    }
};
