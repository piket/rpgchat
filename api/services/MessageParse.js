var Roll = require('./DiceRoller.js');

var colorize = function(c) {
    c = c.toLowerCase();
    switch(c) {
        case 'red':
        case 'blue':
        case 'green':
        case 'purple':
        case 'teal':
        case 'pink':
        case 'yellow':
        case 'grey':
        case 'steel':
        case 'rust':
        case 'brown':
        case 'lime':
        case 'white':
            return 'chat-'+c+' msg-color';
        default:
            return 'chat-default msg-color';
    }
}

var sanitize = function(text) {
    for(var i = 0; i < text.length; i++) {
        if(text[i] == '<') {
            var endTag = text.indexOf('>');
            text = text.substring(0,i) + text.substr(endTag+1);
            i--;
        }
    }
    return text;
}

module.exports = {
    parseMsgCmd: function(msgData) {
        // console.log('starting msg parse')
        var msg = msgData.message.trim();
        var flags = msgData.flags || [];
        var as = msgData.as || '';
        var to = msgData.to || [];
        if(msg[0] == '/') {
            var endCmd = msg.indexOf(' ');
            var cmd = msg.substring(1,endCmd);
            var remaining = msg.substr(endCmd).trim()
            // console.log('remaining:'+remaining)

            switch(cmd) {
                // whipser to a player
                case 'w':
                case 'whisper':
                    var context = this.getCmdParams(remaining);
                    remaining = context.remaining;
                    param = context.param;
                    to.push(param);
                    flags.push({type:'whisper',priority:1});
                    break;
                // whisper to the gm
                case 'gm':
                case 'wg':
                    to = ['gm'];
                    flags.push({type:'whisper',priority:1});
                    break;
                // speak as a character
                case 'as':
                    var context = this.getCmdParams(remaining);
                    remaining = context.remaining;
                    param = context.param;
                    as = param;
                    break;
                // emote
                case 'em':
                    flags.push({type:'emote',priority:2});
                    break;
                // speak in a language
                case 'l':
                case 'lang':
                case 'language':
                    var context = this.getCmdParams(remaining);
                    remaining = context.remaining;
                    param = context.param;
                    flags.push({type:'lang',value:param,priority:1})
                    break;
                // think text
                case 't':
                case 'think':
                    flags.push({type:'think',priority:3});
                    break;
                // roll dice
                case 'r':
                case 'roll':
                    var context = this.getCmdParams(remaining);
                    // console.log('roll context',context)
                    remaining = context.remaining;
                    param = context.param;
                    flags.push({type:'roll',value:this.rollDice(param),priority:0});
                    break;
                // roll dice only to gm
                case 'gr':
                case 'gmr':
                case 'groll':
                case 'gmroll':
                    var context = this.getCmdParams(remaining);
                    remaining = context.remaining;
                    param = context.param;
                    to = ['gm'];
                    flags.push({type:'roll',value:this.rollDice(param),priority:0});
                    flags.push({type:'whisper',priority:1});
                    break;
                // chat a description
                case 'desc':
                case 'description':
                    flags.push({type:'desc',priority:4});
                    break;
                // emote as a character
                case 'emas':
                    var context = this.getCmdParams(remaining);
                    remaining = context.remaining;
                    param = context.param;
                    flags.push({type:'emote',priority:2});
                    as = param;
                    break;
                // think as a character
                case 'tas':
                case 'thinkas':
                    var context = this.getCmdParams(remaining);
                    remaining = context.remaining;
                    param = context.param;
                    flags.push({type:'think',priority:3});
                    as = param;
                    break;
                // color text
                case 'c':
                case 'color':
                    var context = this.getCmdParams(remaining);
                    remaining = context.remaining;
                    param = context.param;
                    flags.push({type:'color',value:param,priority:5});
                    break;
                // speak as a character in colored text
                case 'asc':
                case 'ascolor':
                    var context = this.getCmdParams(remaining);
                    remaining = context.remaining;
                    param = context.param;
                    var pipe = param.search(/[\\|=]/);
                    flags.push({type:'color',value:param.substr(pipe+1).trim(),priority:5});
                    as = param.substring(0,pipe).trim();
                    break;
                // invalid command
                default:
                    break;
            }
            var newData = {
                message: remaining,
                flags: flags,
                as: as,
                to: this.removeDupes(to),
                from: msgData.from,
                game: msgData.game
            }

            if(remaining[0] === '/') {
                newData = this.parseMsgCmd(newData);
            }
        } else {
            var newData = msgData;
        }
        // console.log('parsed msg data:',newData);
        return this.parseInlineCmd(newData);
    },
    getCmdParams: function(remaining) {
        var endParam, param;
        if(remaining[0] == '"' || remaining[0] == "'") {
            endParam = remaining.substr(1).indexOf(remaining[0]);
            if(endParam === -1) {
                endParam = remaining.substr(1).indexOf(' ');
            }
            endParam = endParam === -1 ? remaing.length : endParam + 1;
            param = remaining.substring(1,endParam);
        } else {
            endParam = remaining.indexOf(' ');
            if(endParam === -1) endParam = remaining.length;
            param = remaining.substring(0,endParam);
        }
        return {remaining:remaining.substr(endParam+1).trim(), param:param};
    },
    getInlineCmdParams: function(remaining,tag) {
        var endParam = remaining.indexOf(tag);
        var param = remaining.substring(tag.length,endParam);

        return {remaining:remaining.substr(endParam+tag.length).trim(), param:param};
    },
    removeDupes: function(arr) {
        if(arr.length < 2) return arr;

        var collect = {};
        for(var i = 0; i < arr.length; i++) {
            if(!collect[arr[i]]) {
                collect[arr[i]] = true;
            }
        }
        // console.log(collect);
        return Object.keys(collect);
    },
    rollDice: function(rollStr) {
        var conditional = rollStr.indexOf('?');

        if(conditional !== -1) {
            var thresIdx = rollStr.indexOf('(');
            var thresEnd = rollStr.indexOf(')');
            var pipe = rollStr.search(/[\\|=]/);

            var success = rollStr.substring(thresEnd+1,pipe);
            var failure = rollStr.substr(pipe+1);
            var threshold = parseInt(rollStr.substring(thresIdx+1,thresEnd));

            var roll = Roll.roll(rollStr.substring(0,conditional));
            if(roll.result >= threshold) {
                roll.text = success;
            } else {
                roll.text = failure;
            }
            return roll;
        } else {
            return Roll.roll(rollStr);
        }
    },
    parseInlineCmd: function(msgData) {
        var msg = msgData.message;
        var flags = msgData.flags || [];
        var tags = {};
        var tagsArr = [];
        var param = '', subMsg = '';
        var pipe;
        var endParam;
        var count = 1;

        for(var i = 0; i < msg.length; i++) {
            // console.log(i,msg.length);
            var context = {};
            switch(msg[i]) {
                case '(':
                    if(msg[i+1] === '('){
                        subMsg = msg.substr(i+2);
                        endParam = subMsg.indexOf('))');
                        if(endParam !== -1) {
                            msg = msg.substring(0,i) + '<span class="think">' + subMsg.substring(0,endParam) + '</span>';
                            if(endParam < msg.length) msg += subMsg.substr(endParam+2);
                            count++;
                        }
                    }
                    break;
                case '<':
                    if(msg[i+1] === '<'){
                        subMsg = msg.substr(i+2)
                        pipe = subMsg.search(/[\\|=]/);
                        if(pipe !== -1) {
                            param = subMsg.substring(0,pipe);
                            endParam = subMsg.indexOf('>>');
                            if(endParam !== -1) {
                                flags.push({type:'lang',inline:true,value:{lang:param,text:subMsg.substring(pipe+1,endParam),idx:count},priority:8});
                                msg = msg.substring(0,i) + '|' + subMsg.substr(endParam+2);
                                count++;
                            }
                        }
                    } else {
                        endParam = msg.indexOf('>');
                        msg = msg.substring(0,i) + msg.substr(endParamg+1);
                        i--;
                    }
                    break;
                case '*':
                    if(msg[i+1] === '*') {
                        subMsg = msg.substr(i+2);
                        // console.log(subMsg)
                        endParam = subMsg.indexOf('**');
                        if(endParam !== -1) {
                            if(subMsg[endParam+2] === '*') {
                                endParam += 1;
                            }
                            msg = msg.substring(0,i) + '<b>' + subMsg.substring(0,endParam) + '</b>';
                            if(endParam < msg.length) msg += subMsg.substr(endParam+2);
                            // console.log(msg)
                        }
                    } else {
                        subMsg = msg.substr(i+1);
                        endParam = subMsg.indexOf('*');
                        if(endParam !== -1) {
                            msg = msg.substring(0,i) + '<em>' + subMsg.substring(0,endParam) + '</em>';
                            if(endParam < msg.length) msg += subMsg.substr(endParam+1);
                        }
                    }
                    break;
                case '{':
                    if(msg[i+1] === '{'){
                        subMsg = msg.substr(i+2);
                        pipe = subMsg.search(/[\\|=]/);
                        if(pipe !== -1) {
                            param = subMsg.substring(0,pipe);
                            endParam = subMsg.indexOf('}}');
                            if(endParam !== -1) {
                                msg = msg.substring(0,i) + '<span class="' + colorize(param) + '">' + subMsg.substring(pipe+1,endParam) + '</span>';
                                if(endParam < msg.length) msg += subMsg.substr(endParam+2);
                            }
                        }
                    }
                    break;
                case '[':
                    if(msg[i+1] === '['){
                        subMsg = msg.substr(i+2);
                        endParam = subMsg.indexOf(']]');
                        if(endParam !== -1) {
                            param = subMsg.substring(0,endParam);
                            flags.push({type:'roll',inline:true,value:{roll:this.rollDice(param),idx:count},priority:6});
                            msg = msg.substring(0,i) + '|' + subMsg.substr(endParam+2);
                            count++;
                        }
                    }
                    break;
                case '|':
                    msg = msg.substring(0,i) + msg.substr(i+1);
                    i--;
                    break;
            }
        }
        // msgData.message = sanitize(msg);
        msgData.message = msg;
        msgData.flags = flags;
        return msgData;
    }
}