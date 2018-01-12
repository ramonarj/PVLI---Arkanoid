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
//Quita una vida al destruible
Destroyable.prototype.takeDamage = function (playscene, player) //NOTA: solo da puntos cuando playscene != null
{
    this._lives--;
    if(this._lives <= 0)
    {
        //Si es un ladrillo, se destruye
        if(this.constructor === Destroyable)
        {
            playscene.breakableBricks--;
          //Si es de color, puede dropear Power-Ups
          if (this._maxLives == 1)
          {
            playscene.dropPowerUp(this, player);
          }
        }
        this.kill();
        
        //Se destruye (y suma puntos) en caso de que no llamemos desde el update de movable 
        if(playscene != null)
        {
          playscene.addScore(this._numPoints);
          playscene.checkWin();
        }
    }
    //Ladrillos plateados
    else if(this.constructor === Destroyable && this._maxLives > 1)
         this.animations.play('shine', 15, false);
}

Destroyable.prototype.getLives = function()
{
    return this._lives;
}

module.exports = Destroyable;