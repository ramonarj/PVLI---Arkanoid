'use strict'

var MARGEN = require ('./HUD.js').MARGEN;
var TEXT_SIZE = require ('./HUD.js').TEXT_SIZE;
var CREDITS_SIZE = TEXT_SIZE * 0.75;
var NUM_CHOICES = 3;
var CHOICES_SEPARATION = 50;
var CREDITS_TEXT = "Raul Guardia Fernandez"

var Menu = 
{

    create: function()
    {
        //Teclas
        this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.upKey.onDown.add(this.moveUp, this);

        this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.downKey.onDown.add(this.moveDown, this);

        this.enterKey = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
        this.enterKey.onDown.add(this.processEnterKey, this);

        this.scapeKey = this.game.input.keyboard.addKey(Phaser.KeyCode.ESC);
        this.scapeKey.onDown.add(this.processScapeKey, this);

        //Música
        this.music = this.game.add.audio('remix');
        this.music.loop = true;
        this.music.play();
        this.music.volume = 0.8;

       

        //Fondo y selector
        this.eleccion=1;
        this.credits = false;
        this.fondoMenu = new Phaser.Image(this.game, 0, 0, 'menu');
        this.game.world.addChild(this.fondoMenu);
        this.selector = new Phaser.Image(this.game, 275, 320 , 'cursor');
        this.game.world.addChild(this.selector);

        var highscore = require ('./1player.js').getScore(1);
        this.highScoreText = this.game.add.bitmapText(this.game.world.width / 2, MARGEN, 'redFont','HIGH SCORE', TEXT_SIZE);
        this.highScoreNoText = this.game.add.bitmapText(this.game.world.width / 2, MARGEN + (this.highScoreText.height + MARGEN), 'whiteFont', '  ' + highscore , TEXT_SIZE);
        this.backText = this.game.add.bitmapText(MARGEN, this.game.world.height - MARGEN*2, 'whiteFont','Press Esc to go back to menu', CREDITS_SIZE);
        this.creditsText = this.game.add.bitmapText(MARGEN * 2, MARGEN * 2, 'whiteFont',CREDITS_TEXT, CREDITS_SIZE);
        this.backText.visible = this.creditsText.visible = false;
    },
  
  moveDown:function()
    {
        if(this.eleccion < NUM_CHOICES && !this.credits)
        {
            this.selector.y+=CHOICES_SEPARATION;
            this.eleccion++;
        }
    },

    moveUp:function()
    {
        if(this.eleccion > 1 && !this.credits)
        {
            this.selector.y-=CHOICES_SEPARATION;
            this.eleccion--;
        }
    },

    processEnterKey:function()
    {
        if(!this.credits)
        {
            //Modo 1 jugador
        if(this.eleccion == 1)
        {
            this.music.stop();
            this.game.state.start('1player');
        }
      
        //Modo 2 jugadores
        else if(this.eleccion == 2) 
         {
            this.music.stop();
            this.game.state.start('2player');
         }

         //Créditos
         else if(this.eleccion == 3) 
         {
             this.credits = true;
             this.fondoMenu.visible =  this.highScoreText.visible = this.highScoreNoText.visible = false;
             this.selector.visible = false;
             this.backText.visible = this.creditsText.visible = true;
               
         }
        }  
    },

    processScapeKey:function()
    {
        if(this.credits)
        {
            this.fondoMenu.visible =  this.highScoreText.visible = this.highScoreNoText.visible = true;
            this.selector.visible = true;
            this.backText.visible = this.creditsText.visible = false;
            this.credits = false;
        }  
    },
};

module.exports = Menu;