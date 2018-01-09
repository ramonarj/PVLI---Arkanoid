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

        this._roundText = this.game.add.text(this.game.world.width / 2, 500, 'ROUND', 
        { font: '26px Arial', fill: '#f00' });

        this._roundNoText = this.game.add.text(this._roundText.x + this._roundText.width, this._roundText.y, 'X', 
            { font: '26px Arial', fill: '#fff' });

    },

    update:function()
    {
        this.temporizador+=1;
        if(this.temporizador > DELAY_TIME)
             this.game.state.start('play');
    },
};

module.exports = Carga;