'use strict'

var SoundSource = require ('./SoundSource.js').SoundSource;

//2.1.CLASE HUD (Hud)
function HUD(game, position, sprite, sound)
{
  SoundSource.apply(this, [game, position, sprite, sound]);
}

HUD.prototype = Object.create(SoundSource.prototype);
HUD.prototype.constructor = HUD;


module.exports = HUD;