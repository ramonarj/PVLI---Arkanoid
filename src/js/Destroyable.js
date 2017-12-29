'use strict'

var SoundSource = require ('./SoundSource.js').SoundSource;

//2.2.CLASE DESTRUIBLE (Ladrillos) -> tienen número de vidas y método para quitarse vida
function Destroyable(game, position, sprite, sound, lives, numPoints)
{
    SoundSource.apply(this, [game, position, sprite, sound]);
    this._lives = lives;
    this._maxLives = lives;

    if(numPoints == null)
       this._numPoints = 0;
    else
       this._numPoints = numPoints;
}

Destroyable.prototype = Object.create(SoundSource.prototype);
Destroyable.prototype.constructor = Destroyable;

//Funciones de destruible
Destroyable.prototype.takeDamage = function (playscene) //Quita una vida
{
    this._lives--;
    if(this._lives <= 0)
    {
        
        //Si es un ladrillo de color, puede dropear Power-Ups
        if(this.constructor === Destroyable)
        {
            playscene.breakableBricks--;
          if (this._maxLives == 1)
          {
            playscene.dropPowerUp(this);
          }
        }
        this.kill();
        
        //Se destruye (y suma puntos) en caso de que no llamemos desde el update de movable
        if(playscene != null)
        {
          playscene.addScore(this._numPoints);
        }
    }
}

Destroyable.prototype.getLives = function()
{
    return this._lives;
}

Destroyable.prototype.addLife = function()
{
    this._lives++;
}

module.exports = Destroyable;