'use strict'

var Par = require ('./SoundSource.js').Par;
var HUD = require ('./HUD.js');


var TEXT_SIZE = require ('./HUD.js').TEXT_SIZE;
var MARGEN = require ('./HUD.js').MARGEN;
var DEF_HIGHSCORE = require ('./HUD.js').DEFAULT_HIGHSCORE;


var DELAY_TIME = 1500; //1 segundo y medio

this._2player = false;
this._scene = null;

var Carga = 
{
    temporizador:null,
    hud:null,
    background:null,

    create: function()
    {
        var level, score, highscore;
        //Venimos del menú
        if(this._scene == null)
        {
            level = 1;
            score = 0;
            highscore = require ('./HUD.js').DEFAULT_HIGHSCORE;

        }
        //Venimos de un nivel
        else
        {
            level = this._scene.getLevel();
            score = this._scene.getScore(0);
            highscore = this._scene.getScore(1);
        }

        this.temporizador = 0;
        this.background = new Phaser.Sprite(this.game, 0, 0, 'black'); //Creamos
        this.game.world.addChild(this.background);

        var roundText = this.game.add.bitmapText(this.game.world.width / 2, this.game.world.height / 2, 'whiteFont','ROUND ' + level, TEXT_SIZE);
        roundText.x -= roundText.width / 2;

        var scoreText = this.game.add.bitmapText(this.game.world.width / 4, MARGEN, 'redFont','SCORE', TEXT_SIZE);
        var scoreNoText = this.game.add.bitmapText(this.game.world.width / 4, MARGEN + (scoreText.height + MARGEN), 'whiteFont', '  ' + score , TEXT_SIZE);
        var highScoreText = this.game.add.bitmapText(this.game.world.width / 2, MARGEN, 'redFont','HIGH SCORE', TEXT_SIZE);
        var highScoreNoText = this.game.add.bitmapText(this.game.world.width / 2, MARGEN + (highScoreText.height + MARGEN), 'whiteFont', '  ' + highscore , TEXT_SIZE);
    },

    update:function()
    {
        this.temporizador += (this.game.time.now - this.game.time.prevTime);
        if(this.temporizador > DELAY_TIME)
        {
            if(!this._2player)
             this.game.state.start('1player', true, false);
            else
             this.game.state.start('2player', true, false);
        }
    },
};

module.exports = Carga;