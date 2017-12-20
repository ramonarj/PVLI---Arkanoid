'use strict'

var SoundSource = require ('./SoundSource.js').SoundSource;

var MAX_SPRITES = 6;
var NUM_ROWS = 2;

//2.1.CLASE HUD (Hud)
function HUD(game, position, sprite, sound)
{
  SoundSource.apply(this, [game, position, sprite, sound]);
  this._initialPos = position;
  this._lives = [];
  for(var i=0; i<NUM_ROWS; i++)
  {
    for(var j=0; j<MAX_SPRITES/NUM_ROWS; j++)
    {
      this._lives[i] = new Phaser.Image(this.game, position._x + j*this.width+10, position._y + i*20, "vidas");
      this.game.world.addChild(this._lives[i]);
    }
  }
}

HUD.prototype = Object.create(SoundSource.prototype);
HUD.prototype.constructor = HUD;


module.exports = HUD;