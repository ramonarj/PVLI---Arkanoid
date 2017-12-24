'use strict'

var SoundSource = require ('./SoundSource.js').SoundSource;

var MAX_SPRITES = 6;
var NUM_ROWS = 2;

//2.1.CLASE HUD (Hud)
function HUD(game, position, sprite, sound)
{
  SoundSource.apply(this, [game, position, sprite, sound]);
  this._initialPos = position;
  this._initialLives = 3;
  this._actualLives = this._initialLives;
  this._livesSprites = [];
  this._1up = new Phaser.Image(this.game, position._x + 15, position._y - 150, "1up");
  this.game.world.addChild(this._1up);
  this._highscore = new Phaser.Image(this.game, position._x + 15, position._y - 250, "highscore");
  this.game.world.addChild(this._highscore);
  this._round = new Phaser.Image(this.game, position._x + 15, 500, "round");
  this.game.world.addChild(this._round);
  
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
}


module.exports = HUD;