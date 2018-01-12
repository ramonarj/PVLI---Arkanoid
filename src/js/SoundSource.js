'use strict';

//1.CLASE EMISOR DE SONIDOS (Ladrillos dorados) -> pueden emitir sonido
function SoundSource(game, position, sprite, sound)
{
    Phaser.Sprite.apply(this, [game ,position._x, position._y, sprite]);
    this._sound = sound;
}

SoundSource.prototype = Object.create(Phaser.Sprite.prototype);
SoundSource.prototype.constructor = SoundSource;

//Funciones de destruible
SoundSource.prototype.playSound = function () 
{
    //Suena el sonido
}

//Funciones de destruible
SoundSource.prototype.playAnimation = function () 
{
    this.animations.play('shine', 15, false);
}

//Estructura auxiliares : PAR
function Par(x, y)
{
    this._x=x;
    this._y=y;
}


module.exports = 
{
    SoundSource, 
    Par
};