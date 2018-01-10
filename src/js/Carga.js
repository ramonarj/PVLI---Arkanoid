'use strict'

var Par = require ('./SoundSource.js').Par;
var HUD = require ('./HUD.js');
var lives = require('./play_scene.js').lives;
var level = require('./play_scene.js').level;

var DELAY_TIME = 100;

var Carga = 
{
    temporizador:null,
    hud:null,
    background:null,

    create: function()
    {
        console.log(level);
        this.temporizador = 0;
        this.background = new Phaser.Sprite(this.game, 0, 0, 'black'); //Creamos
        this.game.world.addChild(this.background);


        var roundText = this.game.add.bitmapText(this.game.world.width / 2, this.game.world.height / 2, 'whiteFont','ROUND X', 20);
    },

    update:function()
    {
        this.temporizador+=1;
        if(this.temporizador > DELAY_TIME)
             this.game.state.start('play');
    },
};

module.exports = Carga;