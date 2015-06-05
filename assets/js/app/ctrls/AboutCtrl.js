RPGChat.controller('AboutCtrl', ['$scope','$sce', function($scope,$sce){
    $scope.commands = [
        {
            cmds: ['/w ','/whisper '],
            code: 'name',
            result: 'Whisper to the specified player or character (case sensitive). Only that player will see the message.'
        },
        {
            cmds: ['/gm ', '/wg ', '/whisper '],
            code: 'gm',
            result: 'Whisper to the GM, only they will see the message.'
        },
        {
            cmds: ['/em '],
            result: 'Your message becomes an emote.'
        },
        {
            cmds: ['/t ', '/think '],
            result: 'Your message is styled for thought. Combine this with a /gm so only the GM will see it.'
        },
        {
            cmds: ['/l ', '/lang ', '/language '],
            code: 'language',
            result: 'Your message will be spoken in the given language. Only the GM and other characters with that language will be able to see the normal text.'
        },
        {
            cmds: ['/r ', '/roll '],
            code: 'roll string',
            result: 'Preforms a dice roll based on the given roll string command.'
        },
        {
            cmds: ['/gr ', '/gmr ', '/groll ', '/gmroll '],
            code: 'roll string',
            result: 'Preforms a dice roll based on the given roll string command that only the GM will see.'
        },
        {
            cmds: ['/desc ', '/description '],
            result: 'Your message becomes a description.'
        },
        {
            cmds: ['/as '],
            code: 'name',
            result: 'Change the name of the entity preforming your message.'
        },
        {
            cmds: ['/emas '],
            code: 'name',
            result: 'Emote as the specified character.'
        },
        {
            cmds: ['/tas ', '/thinkas '],
            code: 'name',
            result: 'Think as the specified character.'
        },
        {
            cmds: ['/c ', '/color '],
            code: 'color',
            result: 'Override your default color with the specified color.'
        },
        {
            cmds: ['/asc ', '/ascolor ', $sce.trustAsHtml('<span class="code">"name <span style="font-style:normal">=</span> color"</span>')],
            result: 'Change the name of the entity preforming your message and override your default color with the specified character and color.'
        },
        {
            cmds: [$sce.trustAsHtml('[[ <span class="code">roll string</span> ]]')],
            result: 'Inline command: inserts a roll into the text of your message.'
        },
        {
            cmds: [$sce.trustAsHtml('[[ <span class="code">roll string</span> ? <span class="code">(threshold)</span> <span class="code">success string</span> = <span class="code">failure string</span> ]]')],
            result: 'Inline command: inserts a roll into the text of your message and allows you to set conditional text to follow the roll if the roll meets the given threshold. This command cannot contain any other inline commands within the success or failure text.'
        },
        {
            cmds: [$sce.trustAsHtml('<< <span class="code">language</span> = <span class="code">text</span> >>')],
            result: 'Inline command: flags the wrapped text as spoken in the specified language. This command cannot contain any other inline commands within the wrapped text.'
        },
        {
            cmds: [$sce.trustAsHtml('{{ <span class="code">color</span> = <span class="code">text</span> }}')],
            result: 'Inline command: the wrapped text will be colored by the specified color.'
        },
        {
            cmds: [$sce.trustAsHtml('(( <span class="code">text</span> ))')],
            result: 'Inline command: the wrapped text will be flagged as "think" text.'
        },
        {
            cmds: [$sce.trustAsHtml('* <span class="code">text</span> *')],
            result: 'Inline command: transform the wrapped text into italics.'
        },
        {
            cmds: [$sce.trustAsHtml('** <span class="code">text</span> **')],
            result: 'Inline command: transform the wrappend text into bold font.'
        },
        {
            cmds: [$sce.trustAsHtml('*** <span class="code">text</span> ***')],
            result: 'Inline command: transform the wrapped text into italic bold font.'
        }

    ]

    // console.log('About loaded')
}]);