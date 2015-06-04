module.exports = {
    roll_xda: function(x,a) {
        var rolls = [];
        for(var n = 0; n < x; n++) {
            r = parseInt((Math.random()*a)+1);
            rolls.push(r);
        }
        return rolls;
    },
    roll_xda_s: function(x,a,s,f) {
        var rolls = [];
        var state;
        s = s ? s : 0;
        f = f || 0;

        for(var n = 0; n < x; n++) {
            r = parseInt((Math.random()*a)+1);
            if(r <= f) {
                state = -1;
            } else if(r >= s) {
                state = 1;
            } else {
                state = 0;
            }
            rolls.push([r, state]);
        }
        return rolls;
    },
    roll_xda_e: function(x,a,e) {
        var rolls = [];
        var times = x;
        e = e ? e : a;

        while(times > 0) {
            var newRoll = this.roll_xda(x,a);
            times = newRoll.reduce(function(sum,r) {
                return sum + (r >= e ? 1 : 0);
            }, 0);
            rolls = rolls.concat(newRoll);
        }
        return rolls;
    },
    roll_xda_s_e: function(x,a,s,f,e) {
        var rolls = [];
        var times = x;
        s = s ? s : 0;
        e = e ? e : a;
        f = f || 0;

        while(times > 0) {
            var newRoll = this.roll_xda_s(times, a, s, f);
            times = newRoll.reduce(function(sum, r) {
                return sum + (r[0] >= e ? 1 : 0);
            },0);
            rolls = rolls.concat(newRoll);
        }
        return rolls;
    },
    parseRoll: function(str) {
        var dChar = str.indexOf('d');
        var sChar = str.indexOf('s');
        var fChar = str.indexOf('f');
        var eChar = str.indexOf('e');
        var pChar = str.search(/[+-]/);

        var xNum = parseInt(str.substring(0,dChar));
        var aNum = parseInt(str.substring(dChar+1, (sChar === -1 ? (eChar === -1 ? (pChar === -1 ? str.length : pChar) : eChar) : sChar)));

        var endIdx = str.length;

        var sNum = null, fNum = null, eNum = null, pNum = 0;

        if(sChar !== -1) {
            sNum = str.substring(sChar+1, (fChar === -1 ? (eChar === -1 ? (pChar === -1 ? str.length : pChar) : eChar) : fChar));
            endIdx = sChar + sNum.length + 1;
            sNum = parseInt(sNum);
        }
        if(fChar !== -1) {
            fNum = str.substring(fChar+1, (eChar === -1 ? (pChar === -1 ? str.length : pChar) : eChar));
            endIdx = fChar + fNum.length + 1;
            fNum = parseInt(fNum);
        }
        if(eChar !== -1) {
            eNum = str.substring(eChar+1, (pChar === -1 ? str.length : pChar));
            endIdx = eChar + eNum.length + 1;
            eNum = parseInt(eNum);
        }
        if(pChar !== -1) {
            pNum = str.substring(pChar+1);
            endIdx = pChar;
            if(pNum.indexOf('d') !== -1) {
                pNum = this.roll(pNum).reduce(function(sum,p) {
                    return sum + p;
                },0);
            } else {
                pNum = parseInt(pNum);
            }

            if(str[pChar] == '-') {
                pNum *= -1;
            }
        }
        return {x:xNum,a:aNum,s:sNum,f:fNum,e:eNum,p:pNum,str:str.substr(endIdx)};
    },
    roll: function(string) {
        var roll = this.parseRoll(string);
        var rollArr = [];
        var result = 0;
        console.log('roll string',roll)
        if(roll.s === null && roll.f === null && roll.e === null) {
            rollArr = this.roll_xda(roll.x,roll.a);
            result = rollArr.reduce(function(sum, r) {return sum + r},0);
        } else if(roll.s === null && roll.f === null) {
            rollArr = this.roll_xda_e(roll.x,roll.a,roll.e);
            result = rollArr.reduce(function(sum,r) {return sum + r},0);
        } else if(roll.e === null) {
            rollArr = this.roll_xda_s(roll.x,roll.a,roll.s,roll.f);
            result = rollArr.reduce(function(sum,r) {return sum + r[1]}, 0);
            rollArr = rollArr.map(function(r) {return r[0]});
        } else {
            rollArr = this.roll_xda_s_e(roll.x,roll.a,roll.s,roll.f,roll.e);
            result = rollArr.reduce(function(sum,r) {return sum + r[1]}, 0);
            rollArr = rollArr.map(function(r) {return r[0]});
        }
        result += roll.p || 0;
        console.log('result',{rolls:rollArr, result:result})
        return {rolls:rollArr, result:result};
    }
};