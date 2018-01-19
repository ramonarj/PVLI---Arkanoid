'use strict'

var MARGEN = require ('./HUD.js').MARGEN;
var TEXT_SIZE = require ('./HUD.js').TEXT_SIZE;
var CREDITS_SIZE = TEXT_SIZE;
var NUM_CHOICES = 3;
var CHOICES_SEPARATION = 50;
var CREDITS_NAMES = "Raul Guardia Fernandez\n\n\n\n\n\n\n\n\nRamon Arjona Quiniones\n\n\n\n\n\n\n\n\nBoth"
var CREDITS_TEXT = "\n\n  - Player logic\n  - PowerUps logic\n  - 2 Player Mode\n  - File reading  \n  - Game sounds \n\n\n\n\n  - Ball logic\n  - Enemies logic\n  - HUD & Menu  \n  - Level dynamics\n  - Menu music \n\n\n\n\n  - Animations\n  - Level building\n  - Collisions\n  - Heritage architecture\n  - And many more spaghetti code!"
var CONTROLS_TEXT = "          Move - - \n\nThrow - -            Select - -"
var CONTROLS1 = "                   ARROW KEYS [P1]\n\n          SPACE                  ENTER"
var CONTROLS2 = "                   A / D [P2]\n\n          SPACE                  ENTER"
var Menu = 
{

    create: function()
    {
        this.contador = 0;
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
        this.backText = this.game.add.bitmapText(MARGEN, this.game.world.height - MARGEN*3, 'whiteFont','Press Esc to go back to menu', CREDITS_SIZE);
        this.creditsText = this.game.add.bitmapText(MARGEN * 2, MARGEN * 2, 'whiteFont',CREDITS_TEXT, CREDITS_SIZE);
        this.creditsNames = this.game.add.bitmapText(MARGEN * 2, MARGEN * 2, 'redFont',CREDITS_NAMES, CREDITS_SIZE);
        this.controlsText = this.game.add.bitmapText(MARGEN * 2, this.game.world.height - MARGEN*7, 'whiteFont',CONTROLS_TEXT, TEXT_SIZE);
        this.controlsTextRed = this.game.add.bitmapText(this.controlsText.x, this.controlsText.y, 'redFont',CONTROLS1, TEXT_SIZE);
        this.backText.visible = this.creditsText.visible = this.creditsNames.visible = false;
    },

    update:function()
    {
        this.contador+= (this.game.time.now - this.game.time.prevTime);
        if(this.contador > 1500)
        {
            if(this.controlsTextRed.text == CONTROLS1) this.controlsTextRed.text = CONTROLS2;
            else this.controlsTextRed.text = CONTROLS1;
            this.contador = 0;
        }
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
            this.game.state.states['carga']._2player = false;
            this.game.state.start('carga', true, false);
        }
      
        //Modo 2 jugadores
        else if(this.eleccion == 2) 
         {
            this.music.stop();
            this.game.state.states['carga']._2player = true;
            this.game.state.start('carga', true, false);
         }

         //Créditos
         else if(this.eleccion == 3) 
         {
             this.credits = true;
             this.fondoMenu.visible =  this.highScoreText.visible = this.highScoreNoText.visible = false;
             this.selector.visible = this.controlsText.visible = this.controlsTextRed.visible = false;
             this.backText.visible = this.creditsText.visible = this.creditsNames.visible = true;
               
         }
        
        }  
    },

    processScapeKey:function()
    {
        if(this.credits)
        {
            this.fondoMenu.visible =  this.highScoreText.visible = this.highScoreNoText.visible = true;
            this.selector.visible = this.controlsText.visible = this.controlsTextRed.visible = true;
            this.backText.visible = this.creditsText.visible = this.creditsNames.visible = false;
            this.credits = false;
        }  
    },
};

module.exports = Menu;