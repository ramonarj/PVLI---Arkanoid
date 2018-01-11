'use strict'

var MARGEN = require ('./HUD.js').MARGEN;
var TEXT_SIZE = require ('./HUD.js').TEXT_SIZE;

var Menu = 
{
    fondoMenu:null,
    selector:null,
    eleccion:null,
    music:null,

    upKey:null,
    downKey:null,
    enterKey:null,

    create: function()
    {
        //Teclas
        this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.upKey.onDown.add(this.moveUp, this);

        this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.downKey.onDown.add(this.moveDown, this);

        this.enterKey = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
        this.enterKey.onDown.add(this.processEnterKey, this);

        //Música
        this.music = this.game.add.audio('remix');
        this.music.loop = true;
        //this.music.play();
        this.music.volume = 1;

       

        //Fondo y selector
        this.eleccion=0;
        this.fondoMenu = new Phaser.Image(this.game, 0, 0, 'menu');
        this.game.world.addChild(this.fondoMenu);
        this.selector = new Phaser.Image(this.game, 275, 320 , 'cursor');
        this.game.world.addChild(this.selector);

        var highscore = require ('./play_scene.js').getScore(1);
        var highScoreText = this.game.add.bitmapText(this.game.world.width / 2, MARGEN, 'redFont','HIGH SCORE', TEXT_SIZE);
        var highScoreNoText = this.game.add.bitmapText(this.game.world.width / 2, MARGEN + (highScoreText.height + MARGEN), 'whiteFont', '  ' + highscore , TEXT_SIZE);
    },

    moveDown:function()
    {
        if(this.eleccion < 2)
        {
            this.selector.y+=50;
            this.eleccion++;
        }
    },

    moveUp:function()
    {
        if(this.eleccion > 0)
        {
            this.selector.y-=50;
            this.eleccion--;
        }
    },

    processEnterKey:function()
    {
        if(this.eleccion == 0)
        {
            this.music.stop();
            this.game.state.start('play');
        }
    },
};

module.exports = Menu;