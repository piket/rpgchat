RPGChat.controller('ArchiveCtrl', ['$scope','$routeParams','$sce','Game','UserService','AlertService','ChatService', function($scope,$routeParams,$sce,Game,UserService,AlertService,ChatService){
    var rolls = [];
    var msgIdx = 0;
    $scope.messages = [];
    $scope.previous = [];
    $scope.users = [];
    $scope.user = UserService.currentUser;
    $scope.to = [];
    $scope.loading = true;

    io.socket.post('/api/chat/join',{gameId:$routeParams.id,userId:$scope.user.id},function(data, jwRes) {
        if(data) {
            if(data.error && data.error !== 'archived') {
                if(data.error == 'no player') {
                    AlertService.add('red','You must be playing the game to join the chat.');
                    location.href='/account';
                } else {
                    AlertService.alert('yellow black-text','Internal service error: '+data.error);
                }
            } else if(Array.isArray(data.messages)) {
                $scope.$evalAsync(function(){
                    $scope.as = $scope.user.username;
                    $scope.game = data;
                    $scope.users = [];
                    $scope.characters = $scope.game.characters.filter(function(character) {
                        return character.user == $scope.user.id;
                    }).push(user.username);
                    $scope.messages = data.messages.filter(function(msg) {
                        if(msg.to.length === 0 || msg.from === user.id || contains(msg.to,$scope.characters)) {
                            return true;
                        }
                        return false;
                    }).map(function(msg) {
                        // if(_.find(msg.flags, {type:'roll'})) {
                        //     rolls.push('#'+msg.id);
                        // }

                        console.log('message recieved',$scope.user.id == $scope.game.gm.id);
                        return ChatService.parseChat(msg,$scope.user,$scope.user.id == $scope.game.gm.id);
                    });
                    $scope.messages.push({classes:'system',message:'Welcome to '+$scope.game.name+' chat.'});
                    console.log('chat data',data);
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
        console.log('message recieved',$scope.user.id == $scope.game.gm.id)
        $scope.$evalAsync(function() {
            var msg = ChatService.parseChat(item,$scope.user,$scope.user.id == $scope.game.gm.id);
            $scope.messages.push(msg);
            console.log('new msg',msg);
            // if(_.find(item.flags, {type:'roll'})) {
            //     $('#'+item.id).tooltip({delay:50});
            // }
        });
    }

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
    function contains(arr,compare) {
        return _.intersection(arr,compare).length > 0;
    }
}]);