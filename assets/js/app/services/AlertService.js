RPGChat.factory('AlertService', function(){
    var alerts = [];

    return {
        add: function(type,msg) {
            alerts.push({type:type,msg:msg});
        },
        clear: function() {
            alerts = [];
        },
        display: function() {
            if(alerts.length > 0) {
                alerts.forEach(function(alert) {
                    Materialize.toast(alert.msg,3000,alert.type);
                });

                this.clear();
            }
        },
        alert: function(type,msg) {
            Materialize.toast(msg,3000,type);
        }
    }
});