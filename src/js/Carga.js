'use strict'

var Par = require ('./SoundSource.js').Par;
var HUD = require ('./HUD.js');
var TEXT_SIZE = require ('./HUD.js').TEXT_SIZE;

var DELAY_TIME = 1000; //1 segundo
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

        var roundText = this.game.add.bitmapText(this.game.world.width / 2, this.game.world.height / 2, 'whiteFont','ROUND X', TEXT_SIZE);

        var scoreText = this.game.add.bitmapText(this.game.world.width / 4, MARGEN, 'redFont','SCORE', TEXT_SIZE);
        var scoreNoText = this.game.add.bitmapText(this.game.world.width / 4, MARGEN + (scoreText.height + MARGEN), 'whiteFont','0', TEXT_SIZE);
        var highScoreText = this.game.add.bitmapText(this.game.world.width / 2, MARGEN, 'redFont','HIGH SCORE', TEXT_SIZE);
        var highScoreNoText = this.game.add.bitmapText(this.game.world.width / 2, MARGEN + (highScoreText.height + MARGEN), 'whiteFont','50000', TEXT_SIZE);
    },

    update:function()
    {
        this.temporizador+=(this.game.time.now - this.game.time.prevTime);
        if(this.temporizador > DELAY_TIME)
             this.game.state.start('play');
    },
};

module.exports = Carga;