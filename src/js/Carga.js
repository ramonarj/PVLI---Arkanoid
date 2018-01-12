'use strict'

var Par = require ('./SoundSource.js').Par;
var HUD = require ('./HUD.js');
var lives = require('./1player.js').lives;
var level = require('./1player.js').level;

var DELAY_TIME = 100;

this._2player = false;

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
        this.temporizador += 1;
        if(this.temporizador > DELAY_TIME)
        {
            if(!this._2player)
             this.game.state.start('1player');
             else
             this.game.state.start('2player');
        }
    },
};

module.exports = Carga;