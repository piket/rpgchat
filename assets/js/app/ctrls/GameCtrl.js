RPGChat.controller('GameCtrl', ['$scope','$routeParams','$sce','Game','UserService','AlertService','ChatService', function($scope,$routeParams,$sce,Game,UserService,AlertService,ChatService){
    var rolls = [];
    var msgIdx = 0;
    var chatWindow = $('#chatWindow');
    var chatView = $('#chat-view');
    console.log('window',chatWindow)
    $scope.messages = [];
    $scope.previous = [];
    $scope.users = [];
    $scope.user = UserService.currentUser;
    $scope.user.langauges = [];
    $scope.to = [];
    $scope.loading = true;
    $scope.characters = {};
    $scope.characters[$scope.user.username] = {color:'default',player:true};
    $scope.view = {};
    $scope.values = {};

    io.socket.post('/api/chat/join',{gameId:$routeParams.id,userId:$scope.user.id},function(data, jwRes) {
        if(data) {
            if(data.error) {
                if(data.error == 'no player') {
                    AlertService.add('red','You must be playing the game to join the chat.');
                    location.href='/account';
                } else if(data.error = 'archived') {
                    AlertService.alert('yellow black-text','This game has been archived.');
                    location.href='/game/'+data.id+'/archive';
                } else {
                    AlertService.alert('yellow black-text','Internal service error: '+data.error);
                }
            } else {
                $scope.users.push($scope.user.username);
            }

            if(!data.error && Array.isArray(data.messages)) {
                $scope.$evalAsync(function(){
                    $scope.as = $scope.user.username;
                    $scope.game = data;
                    $scope.sheet = data.sheetTemplate;
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
                    console.log('chat data',data);
                    chatView.scrollTop(chatWindow.height());
                    $scope.loading = false;

                    console.log('room user',$scope.user);
                    console.log('as',$scope.as)
                    console.log('room game',$scope.game);
                });
            } else {
                location.href='/account';
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
        if($scope.characters[$scope.as] && $scope.characters[$scope.as].player && $scope.characters[$scope.as] !== 'default') {
            msgData.flags.push({type:'color',value:$scope.characters[$scope.as].color,priority:5});
        }
        msgIdx = $scope.previous.push($scope.body);
        $scope.$evalAsync(function() {
            $scope.body = '';
        });
        console.log(msgData);
        if(msgData.msg !== '') {
            io.socket.post('/api/chat/message',msgData,function(data, jwRes) {
                console.log('message data',data)
            });
        }
    }

    io.socket.on('userleave',removeUser);
    io.socket.on('userjoin',addUser);
    io.socket.on('newmessage',addItemToChat);

    function addUser(user) {
        $scope.users.push(user);
    }

    function removeUser(user) {
        $scope.users.splice($scope.users.indexOf(user),1);
    }

    function addItemToChat(item) {
        console.log('message recieved',$scope.user.id == $scope.game.gm.id)
        $scope.$evalAsync(function() {
            var msg = ChatService.parseChat(item,$scope.user,$scope.user.id == $scope.game.gm.id);
            $scope.messages.push(msg);
            console.log('new msg',msg);
            console.log('scroll:',chatWindow.scrollTop,chatWindow.scrollHeight);
            chatView.scrollTop(chatWindow.height());
            // if(_.find(item.flags, {type:'roll'})) {
            //     $('#'+item.id).tooltip({delay:50});
            // }
        });
    }

    $('#msg-body').on('keydown',function(e) {
        // console.log(e.which,e.shiftKey)
        if(e.which == 13 && !e.shiftKey) {
            console.log('sending chat')
            $scope.sendChat();
        } else if(e.which == 13 && e.shiftKey) {
            $scope.$evalAsync(function() {
                $scope.body += '\n';
            });
        } else if(e.which == 38 && e.shiftKey && msgIdx > 0) {
            console.log(msgIdx,'previous',$scope.previous);
            msgIdx--;
            $scope.$evalAsync(function() {
                $scope.body = $scope.previous[msgIdx];
            });
            console.log($scope.body);
        } else if(e.which == 40 && e.shiftKey && msgIdx < $scope.previous.length - 1) {
            console.log(msgIdx,'previous',$scope.previous);
            msgIdx++;
            $scope.$evalAsync(function() {
                $scope.body = $scope.previous[msgIdx];
            });
            console.log($scope.body);
        }
    });

    // $(document).on('keypress', function(e) {
    //     console.log(e.which);
    // });

    // $scope.$watchCollection('messages', function(newArr) {
    //     // console.log('new message item:',newArr)
    //     newArr.forEach(function(msg) {
    //         if(msg.roll && rolls.indexOf(msg.id) === -1) {
    //             console.log('loading tooltip',msg.id)
    //             $('#'+msg.id).tooltip({delay:50});
    //             rolls.push(msg.id);
    //         }
    //     })
    // });
    $scope.validSheets = function() {
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