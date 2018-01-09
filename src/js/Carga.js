'use strict'

var Par = require ('./SoundSource.js').Par;
var HUD = require ('./HUD.js');

var DELAY_TIME = 100;
var MARGEN = 10; //Margen con la pantalla

var Carga = 
{
    temporizador:null,
    hud:null,
    background:null,
    level:null,

    create: function()
    {
        this.temporizador = 0;
        this.background = new Phaser.Sprite(this.game, 0, 0, 'black'); //Creamos
        this.game.world.addChild(this.background);

        this.level = require('./play_scene.js').score;

        var roundText = this.game.add.bitmapText(this.game.world.width / 2, this.game.world.height / 2, 'whiteFont','ROUND X', 20);

        var scoreText = this.game.add.bitmapText(this.game.world.width / 4, MARGEN, 'redFont','SCORE', 20);
        var scoreNoText = this.game.add.bitmapText(this.game.world.width / 4, MARGEN + (scoreText.height + MARGEN), 'whiteFont','0', 20);
        var highScoreText = this.game.add.bitmapText(this.game.world.width / 2, MARGEN, 'redFont','HIGH SCORE', 20);
        var highScoreNoText = this.game.add.bitmapText(this.game.world.width / 2, MARGEN + (highScoreText.height + MARGEN), 'whiteFont','5000', 20);
    },

    update:function()
    {
        this.temporizador+=1;
        if(this.temporizador > DELAY_TIME)
             this.game.state.start('play');
    },
};

module.exports = Carga;