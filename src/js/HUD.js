'use strict'

var SoundSource = require ('./SoundSource.js').SoundSource;

var MAX_SPRITES = 6;
var NUM_ROWS = 2;

//2.1.CLASE HUD (Hud)
function HUD(game, position, sprite, sound, livesNo)
{
  SoundSource.apply(this, [game, position, sprite, sound]);
  this._initialPos = position;
  
  //Ronda
  this._round = new Phaser.Image(this.game, position._x + 15, 500, "round");
  this.game.world.addChild(this._round);

  //Puntuación y highscore
  this._1up = new Phaser.Image(this.game, position._x + 15, position._y - 150, "1up");
  this.game.world.addChild(this._1up);
  this._highscore = new Phaser.Image(this.game, position._x + 15, position._y - 250, "highscore");
  this.game.world.addChild(this._highscore);

  //Texto
  this._scoreText = this.game.add.text(this._1up.x + 10, this._1up.y + 20, 0, // Anyadir al juego la puntuacion en la posicion x, y
    { font: '26px Arial', fill: '#fff' });
  this._highScoreText = this.game.add.text(this._scoreText.x, this._highscore.y + 40, 5000, // Anyadir al juego la puntuacion en la posicion x, y
    { font: '26px Arial', fill: '#fff' }); 
  this._roundText = this.game.add.text(this._1up.x + 10, this._round.y + 30, 0, // Anyadir al juego la puntuacion en la posicion x, y
      { font: '26px Arial', fill: '#fff' });

  //Vidas
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
}

HUD.prototype.renderScore = function(score, highscore)
{
  this._scoreText.text = score;
  if(score > highscore)
      this._highScoreText.text = score;
}

HUD.prototype.renderRound = function(round)
{
  this._roundText.text = round;
}

module.exports = HUD;