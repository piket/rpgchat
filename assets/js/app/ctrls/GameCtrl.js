RPGChat.controller('GameCtrl', ['$scope','$routeParams','$sce','Game','UserService','AlertService','ChatService', function($scope,$routeParams,$sce,Game,UserService,AlertService,ChatService){
    $scope.messages = [];
    $scope.users = [];
    $scope.user = UserService.currentUser;
    $scope.to = [];
    $scope.loading = true;

    io.socket.post('/api/chat/join',{gameId:$routeParams.id,userId:$scope.user.id},function(data, jwRes) {
        if(data) {
            if(data.error) {
                if(data.error == 'no player') {
                    AlertService.add('red','You must be playing the game to join the chat.');
                    location.href='/account';
                } else {
                    AlertService.alert('yellow black-text','Internal service error: '+data.error);
                }
            } else if(Array.isArray(data.messages)) {
                $scope.as = $scope.user.username;
                $scope.game = data;
                $scope.users = [];
                $scope.messages = data.messages.map(ChatService.parseChat);
                $scope.messages.push({classes:'system',message:'Welcome to '+$scope.game.name+' chat.'});
                console.log('chat data',data);
                $scope.loading = false;

                console.log('room user',$scope.user);
                console.log('as',$scope.as)
                console.log('room game',$scope.game);
                $scope.characters = $scope.game.characters.filter(function(character) {
                    return character.user == $scope.user.id;
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
        console.log(msgData);
        if(msgData.msg !== '') {
            io.socket.post('/api/chat/message',msgData,function(data, jwRes) {
                console.log('message data',data)
                $scope.body = '';
            });
        }
    }

    io.socket.on('userleave',removeUser);
    io.socket.on('userjoin',addUser);
    io.socket.on('newmessage',addItemToChat);

    function addUser(user) {
        // $scope.users.push(user);
    }

    function removeUser(user) {
        // $scope.users.splice($scope.users.indexOf(user),1);
    }

    function addItemToChat(item) {
        $scope.$evalAsync(function() {
            $scope.messages.push(ChatService.parseChat(item));
            // console.log('new msg',item);
        });
    }

    $('#msg-body').on('keypress',function(e) {
        // console.log(e.which,e.shiftKey)
        if(e.which == 13 && e.shiftKey) {
            console.log('sending chat')
            $scope.sendChat();
        }
    })
}]);