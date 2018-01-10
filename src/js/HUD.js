'use strict'

var SoundSource = require ('./SoundSource.js').SoundSource;

//Para los sprites de las vidas
var MAX_SPRITES = 6;
var NUM_ROWS = 2;

var DIFFERENT_BACKGROUNDS = 4;

//2.1.CLASE HUD (Hud)
function HUD(game, position, sprite, sound, livesNo, level)
{
  SoundSource.apply(this, [game, position, sprite, sound]);
  this._initialPos = position;

   //1.Fondo(s)
   this._background = new Phaser.Image(this.game, 123, 20, 'fondos');
   var backgroundImageNo = (DIFFERENT_BACKGROUNDS + level - 1) % DIFFERENT_BACKGROUNDS;
   this._background.frame = backgroundImageNo;
   this.game.world.addChild(this._background);

   this._blackBackground = new Phaser.Image(this.game, 0, 0, 'black');
   this._blackBackground.visible = false;
   this.game.world.addChild(this._blackBackground);
  
  //2.Textos
  //2.1.Letras
  this._scoreText = this.game.add.bitmapText(position._x + 15, position._y - 165, 'redFont','1UP', 20);
  this._highScoreText = this.game.add.bitmapText(position._x + 15, position._y - 250, 'redFont','HIGHSCORE', 20);
  this._roundText = this.game.add.bitmapText(position._x + 15, 500, 'redFont','ROUND', 20);

  //2.2.Números   
  this._scoreNoText = this.game.add.bitmapText(this._scoreText.x + 15, this._scoreText.y + 25, 'whiteFont',0, 20); 
  this._highScoreNoText = this.game.add.bitmapText(this._scoreText.x + 10, this._highScoreText.y + 35, 'whiteFont', 5000, 20); 
  this._roundNoText = this.game.add.bitmapText(this._roundText.x + 10, this._roundText.y + 30, 'whiteFont',0, 20); 

  //3.Vidas
  this._initialLives = 3;
  this._actualLives = livesNo;
  this._livesSprites = [];
  var cont=0;
  for(var i=0; i<NUM_ROWS; i++)
  {
    for(var j=0; j<MAX_SPRITES/NUM_ROWS; j++)
    {
      this._livesSprites[cont] = new Phaser.Image(this.game, position._x + j*this.width+10, position._y + i*20, "vidas");
      this.game.world.addChild(this._livesSprites[cont]);
      if(cont >= this._actualLives)
         this._livesSprites[cont].kill();
      cont++;
    }
  }
}

HUD.prototype = Object.create(SoundSource.prototype);
HUD.prototype.constructor = HUD;


HUD.prototype.addLife = function() 
{
   if(this._actualLives < MAX_SPRITES)
      this._livesSprites[this._actualLives].revive();
   this._actualLives++;
}

HUD.prototype.takeLife = function() 
{
   if(this._actualLives > 0)
      this._livesSprites[this._actualLives - 1].kill();
   this._actualLives--;

   this._blackBackground.visible = true;
}

HUD.prototype.renderScore = function(score, highscore)
{
  this._scoreNoText.text = score;
  if(score > highscore)
      this._highScoreNoText.text = score;
  else
      this._highScoreNoText.text = highscore;
}

HUD.prototype.renderRound = function(round)
{
  this._roundNoText.text = round;
}

module.exports = HUD;