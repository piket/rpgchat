RPGChat.factory('ChatService', ['$sce','LangaugeService',function($sce,LangaugeService){
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
                    return c+'-text';
                default:
                    return 'black-text';
            }
        }
        var garble = function(textArr,lang) {
            var r = 0;
            lang = lang.toLowerCase();
            for(var i = 0; i < lang.length; i++) {
                r += lang.charCodeAt(i);
            }
            var langArr = Object.keys(LangaugeService);
            lang = langArr[r % langArr.length];

            var encode = LangaugeService[lang];
            return textArr.map(function(text) {
                if(encode.pattern === 'word') {
                    return text.split(' ').map(encode.transform).join(' ');
                } else {
                    var newText = "";
                    for(i = 0; i < text.length; i++) {
                        if(text[i].match(/[ \.,-\/#!%\^&\*;:{}=\-_`~()|'"]/g)) {
                            newText += text[i];
                        } else if(encode[text[i]]) {
                            newText += encode[text[i]];
                        } else {
                            newText += encode.default;
                        }
                    }
                    return newText;
                }
            });
        }
    return {
        parseChat: function(item,user,gm) {
            // var self = this;
            // console.log('ChatService',typeof self.colorize,typeof self.garble);
            var output = item.message.replace(/\n/g,'<br>').split('|');
            var classes = ['',''];
            var label = true;
            var text = "";
            var rollFlag = false;
            // Priority: cmd rolling = 0, cmd lang = 1, emote = 2, think = 3, desc = 4, cmd color = 5, inline roll = 6, inline lang = 7, inline color = 8
            var flags = item.flags.sort(function(a,b) {
                return a.priority - b.priority;
            });

            flags.forEach(function(flag) {
                switch(flag.type) {
                    case 'emote':
                        classes[0] = 'emote';
                        label = false;
                        break;
                    case 'lang':
                        if(flag.inline) {
                            if(!gm || ((user.character && user.character.langauges && user.character.langauges.indexOf(flag.value.lang) === -1) && user.id !== item.from)) {
                                output.splice(flag.value.idx,0,'<em>(in '+flag.value.lang+'):</em> ',garble(flag.value.text,flag.value.lang));
                            } else {
                                output.splice(flag.value.idx,0,'<em>(in '+flag.value.lang+'):</em> ',flag.value.text);
                            }
                        } else if(!gm || ((user.character && user.character.langauges && user.character.langauges.indexOf(flag.value) === -1) && user.id !== item.from)) {
                            output = ['<em>(in '+flag.value+'):</em> '].concat(garble(output,flag.value));
                        }
                        break;
                    case 'think':
                        classes[0] = 'think';
                        label = false;
                        break;
                    case 'desc':
                        classes[0] = 'desc';
                        label = false;
                        break;
                    case 'color':
                        if(flag.inline) {
                            text = '<span class="'+colorize(flag.value.color)+'">'+flag.value.text+'</span>';
                            output.splice(flag.value.idx,0,text);
                        } else {
                            classes[1] = colorize(flag.value);
                        }
                        break;
                    case 'roll':
                    // rollFlag = true;
                        if(flag.inline) {
                            // text = '<span class="roll tooltipped" id="'+item.id+'" data-position="bottom" data-delay="50" data-tooltip="['+flag.value.roll.rolls+']">'+flag.value.roll.result+'</span>';
                            text = '<span class="roll" title="['+flag.value.roll.rolls+']">'+flag.value.roll.result+'</span>';
                            if(flag.value.roll.text) text += ' '+flag.value.roll.text;
                            output.splice(flag.value.idx,0,text);
                        } else {
                            // text = '<span class="roll tooltipped" id="'+item.id+'" data-position="bottom" data-delay="50" data-tooltip="['+flag.value.rolls+']">'+flag.value.result+'</span>';
                            text = '<span class="roll" title="['+flag.value.rolls+']">'+flag.value.result+'</span>';
                            if(flag.value.text) text += ' '+flag.value.text;
                            output.unshift(text);
                        }
                        break;
                }
            });

console.log('chat output',output)

            if(label) {
                text = '<span class="as">'+item.as+':</span> '+output.join(' ');
            } else {
                text = item.as +' '+ output.join(' ');
            }

            console.log('parsed msg:',text)

            return {
                classes: classes.join(' '),
                message: $sce.trustAsHtml(text),
                roll: rollFlag,
                id: item.id
            }
        }
    };
}]);