RPGChat.factory('UserService', ['$http', function($http){
    return {
        login: function(username,password,callback) {
            if(username == "" || password == "") {
                return callback(false);
            }

            var self = this;

            $http.post('/api/auth',{username:username,password:password}).success(function(data) {
                if(data && data.result && data.user) {
                    self.currentUser = data.user
                } else {
                    self.currentUser = false;
                }
                callback(null,data);
            }).error(function(err) {
                callback(err);
            });
        },
        check: function(callback) {
            var self = this;

            $http.get('/api/auth').success(function(data) {
                if(data && data.user) {
                    self.currentUser = data.user;
                } else {
                    self.currentUser = false;
                }
                callback(null,data);
            }).error(function(err) {
                callback(err);
            });
        },
        logout: function(callback) {
            this.currentUser = false;
            $http.delete('/api/auth').success(function(data) {
                callback(null,data);
            }).error(function(err) {
                callback(err);
            });
        },
        signup: function(username,email,password,confirm,callback) {
            err = [];

            if(username == '') err.push('name');
            if(email == '') err.push('email');
            if(password == '') err.push('password');
            if(confirm == '') {
                err.push('confirm');
            } else if(password !== confirm) {
                err.push('confirm');
            }

            if(err.length > 0) return callback(err);

            var self = this;
            var userInfo = {username:username,email:email,password:password};

            $http.post('/api/signup',userInfo).success(function(data) {
                if(data && data.result && data.user) {
                    self.currentUser = data.user
                    callback(null,data);
                } else {
                    self.currentUser = false;
                    callback(data.error,data);
                }
            }).error(function(err) {
                callback('unknown');
            });
        },
        info: function(callback) {
            $http.get('/api/user/'+this.currentUser.id).success(function(data) {
                if(data.error) {
                    callback(data.error);
                } else {
                    callback(null,data);
                }
            }).error(function(err) {
                callback(err);
            });
        }
    };
}]);