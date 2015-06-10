RPGChat.controller('GameCtrl', ['$scope','$routeParams','$sce','$timeout','Game','UserService','AlertService','ChatService', function($scope,$routeParams,$sce,$timeout,Game,UserService,AlertService,ChatService){
    var rolls = [];
    var msgIdx = 0;
    var chatWindow = $('#chatWindow');
    var chatView = $('#chat-view');
    var limit = 30;
    var temp = '';
    // console.log('window',chatWindow)
    $scope.messages = [];
    $scope.previous = [];
    $scope.users = [];
    $scope.user = UserService.currentUser;
    $scope.user.langauges = [];
    $scope.to = [];
    $scope.loading = false;
    $scope.characters = {};
    $scope.characters[$scope.user.username] = {color:'default',player:true};
    $scope.view = {};
    $scope.values = {};

    io.socket.post('/api/chat/join',{gameId:$routeParams.id,userId:$scope.user.id},function(data, jwRes) {
        // console.log(data);
        if(data) {
            if(data.error) {
                if(data.error == 'no player') {
                    AlertService.add('red','You must be playing the game to join the chat.');
                    // location.href='/account';
                } else if(data.error = 'archived') {
                    AlertService.alert('yellow black-text','This game has been archived.');
                    // location.href='/game/'+data.id+'/archive';
                } else {
                    AlertService.alert('yellow black-text','Internal service error: '+data.error);
                }
                console.log(data)
            } // else {
                // $scope.users = data.current;
            // }

            if(!data.error && Array.isArray(data.messages)) {
                $scope.$evalAsync(function(){
                    $scope.as = $scope.user.username;
                    $scope.game = data;
                    $scope.sheet = data.sheetTemplate;
                    $scope.users = data.currentUsers;
                    $scope.game.characters.forEach(function(character) {
                        $scope.view[character.id] = false;
                        $scope.characters[character.name] = {color:character.color, player:(character.player == $scope.user.id)};
                        if(character.player == $scope.user.id) {
                            $scope.user.langauges = $scope.user.langauges.concat(character.langauges);
                            $scope.values['C'+character.id] = character.values;
                        }
                    });

                    data.messages.forEach(function(msg) {
                        if(msg.to.length === 0 || msg.from === $scope.user.id || contains(msg.to,$scope.characters)) {
                            // console.log('message recieved',$scope.user.id == $scope.game.gm.id);
                            $scope.messages.push(ChatService.parseChat(msg,$scope.user,$scope.user.id == $scope.game.gm.id));
                        }
                    });

                    if($scope.messages.length > limit-1) {
                        $scope.messages.slice($scope.messages.length - limit);
                    }
                    // $scope.messages = data.messages.filter(function(msg) {
                    //     if(msg.to.length === 0 || msg.from === user.id || contains(msg.to,$scope.characters)) {
                    //         return true;
                    //     }
                    //     return false;
                    // }).map(function(msg) {
                    //     // if(_.find(msg.flags, {type:'roll'})) {
                    //     //     rolls.push('#'+msg.id);
                    //     // }

                    //     console.log('message recieved',$scope.user.id == $scope.game.gm.id);
                    //     return ChatService.parseChat(msg,$scope.user,$scope.user.id == $scope.game.gm.id);
                    // });

                    $scope.messages.push({classes:'system',message:'Welcome to '+$scope.game.name+' chat.'});
                    $timeout(function(){
                        chatView.scrollTop(chatWindow.height());
                    }, 0);
                    // console.log('chat data',data);
                    // $scope.loading = false;

                    // console.log('room user',$scope.user);
                    // console.log('as',$scope.as)
                    // console.log('room game',$scope.game);
                });
            } else {
                console.log(data)
                // debugger;
                // location.href='/account';
            }
        }
    });

    $scope.sendChat = function() {
        var msgData = {
            msg: $scope.body,
            to: $scope.to,
            as: $scope.as,
            flags: [],
            from: $scope.user.id,
            gameId: $scope.game.id
        }
        var ooc = msgData.msg.indexOf('/ooc');
        if(ooc !== -1) {
            msgData.as = $scope.user.username;
            msgdata.msg = msg.splice(ooc,4);
        } else if($scope.characters[$scope.as] && $scope.characters[$scope.as].player && $scope.characters[$scope.as] !== 'default') {
            msgData.flags.push({type:'color',value:$scope.characters[$scope.as].color,priority:5});
        }

        msgIdx = $scope.previous.push($scope.body);
        $scope.$evalAsync(function() {
            $scope.body = '';
        });
        // console.log(msgData);
        if(msgData.msg !== '') {
            io.socket.post('/api/chat/message',msgData,function(data, jwRes) {
                // console.log('message data',data)
            });
        }
    }

    $scope.$on('$locationChangeStart', function() {
        io.socket.post('/api/chat/leave');
    });

    io.socket.on('userleave',removeUser);
    io.socket.on('userjoin',addUser);
    io.socket.on('newmessage',addItemToChat);

    function addUser(data) {
        $scope.$evalAsync(function() {
            $scope.users = data.users;
        });
    }

    function removeUser(data) {
        $scope.$evalAsync(function() {
            $scope.users = data.users;
        });
    }

    function addItemToChat(item) {
        // console.log('message recieved',$scope.user.id == $scope.game.gm.id)
        if(item.to.length === 0 || item.from === $scope.user.id || contains(item.to,$scope.characters)) {
            var msg = ChatService.parseChat(item,$scope.user,$scope.user.id == $scope.game.gm.id);
            $scope.$evalAsync(function() {
                $scope.messages.push(msg);
                if($scope.messages.length > limit) {
                    $scope.messages.shift();
                }
            // console.log('new msg',msg);
            // console.log('scroll:',chatWindow.scrollTop,chatWindow.scrollHeight);
            // if(_.find(item.flags, {type:'roll'})) {
            //     $('#'+item.id).tooltip({delay:50});
            // }
            });
            $timeout(function(){
                chatView.scrollTop(chatWindow.height());
            }, 0);
        }
    }

    $('#msg-body').on('keydown',function(e) {
        // console.log(e.which,e.shiftKey)
        if(e.which == 13 && !e.shiftKey) {
            // console.log('sending chat')
            $scope.sendChat();
        } else if(e.which == 13 && e.shiftKey) {
            $scope.$evalAsync(function() {
                $scope.body += '\n';
            });
        } else if(e.which == 38 && e.shiftKey && msgIdx > 0) {
            // console.log(msgIdx,'previous',$scope.previous);
            if(msgIdx = $scope.previous.length) {
                temp = $scope.body;
            }
            msgIdx--;
            $scope.$evalAsync(function() {
                $scope.body = $scope.previous[msgIdx];
            });
            // console.log($scope.body);
        } else if(e.which == 40 && e.shiftKey && msgIdx < $scope.previous.length) {
            // console.log(msgIdx,'previous',$scope.previous);
            msgIdx++;
            $scope.$evalAsync(function() {
                $scope.body = $scope.previous[msgIdx] || temp;
            });
            // console.log($scope.body);
        }
    });

    $scope.$watch('body', function(val) {
        if(val && val.trim() == '/ooc') {
            $scope.body = '';
            $scope.as = $scope.user.username;
        }
    });

    $scope.to = function(username) {
        if($scope.body) {
            $scope.body = '/whisper "' + username + '" ' + $scope.body;
        } else {
            $scope.body = '/whisper "'+ username + '" ';
        }
    }

    $scope.validSheets = function() {
        if(!$scope.game) return false;
        return $scope.game.characters.filter(function(c) {
            if($scope.user.id == $scope.game.gm.id) return true;
            return c.player == $scope.user.id;
        });
    }

    function contains(to,compare) {
        if(to.indexOf('gm') !== -1 && $scope.user.id == $scope.game.gm.id) return true;
        return _.intersection(to,compare).length > 0;
    }
}]);