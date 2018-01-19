'use strict'

var Par = require ('./SoundSource.js').Par;
var Destroyable = require ('./Destroyable.js');

var BASE_VELOCITY = 350;
var BASE_ANGLE =  Math.PI / 3; //Está en radianes (60º)
var MAX_VELOCITY = 650;

var MAX_ANGLE = 4 * Math.PI / 9; //80º
var MIN_ANGLE = 5 * Math.PI / 36; //25º


var Movable = require ('./Movable.js');

//2.2.1.2.CLASE PELOTA
function Ball(game, position, sprite, sound, lives, scene)
{
    var velocity = new Par(BASE_VELOCITY * Math.cos(BASE_ANGLE), -BASE_VELOCITY *  Math.sin(BASE_ANGLE));
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
    this._attached = false; 
    this._attachEnabled = false;

    this._vel = BASE_VELOCITY;
    this._angle = BASE_ANGLE;

    this._scene = scene;
}

Ball.prototype = Object.create(Movable.prototype);
Ball.prototype.constructor = Ball;

//Funciones de pelota

Ball.prototype.takeDamage = function() 
{
    Destroyable.prototype.takeDamage.call(this);
    this._scene.checkGameOver();
}

Ball.prototype.bounce = function(obj, playscene) //Rebota en un objeto "obj2"
{
    //Rebota
    this.game.physics.arcade.collide(this, obj); 
    
     //Cogemos su velocidad y ángulo después de rebotar
     this._angle = Math.atan(this.body.velocity.y / this.body.velocity.x); 
     this._vel = this.body.velocity.x / Math.cos(this._angle);

    //a)Jugador 
    if(Object.getPrototypeOf(obj).hasOwnProperty('readInput'))
    {
         this.bounceInPlayer(obj);
         this._sound[0].play();
    }

    //b)Ladrillos o paredes
    else if (obj.hasOwnProperty('_sound'))
    {
        //Aceleramos la pelota
        if(Math.max(this._vel, -this._vel) < MAX_VELOCITY)
        {
          if(this._vel < 0)
             this._vel -= 10;
          else
             this._vel += 10;

          this.body.velocity.x = this._vel * Math.cos(this._angle);
          this.body.velocity.y = this._vel * Math.sin(this._angle);
        }

        //Para los ladrillos destruibles
        if(obj.hasOwnProperty('_lives'))
        {
            if(obj.getLives() > 1) //Si tiene más de una vida (plateados)
                this._sound[2].play();
            else //Si es plateado con una vida / de color
                this._sound[1].play();

            obj.takeDamage(playscene); 
        }
        //Para los dorados
        else
        {
            this._sound[2].play();
            obj.playAnimation();
        }
    }
}

Ball.prototype.bounceInPlayer = function(player)
{
    //Delta es la distancia (abs) que hay del centro del jugador al de la pelota
    var delta = Math.abs(player.x - (this.x + this.width/2)); 
    if (delta > player.width / 2)
       delta = player.width / 2;
    var razon = delta / (player.width / 2); //Esto siempre está entre 0 y 1
    this._angle = MAX_ANGLE - razon * (MAX_ANGLE - MIN_ANGLE); //Actualizamos el ángulo (siempre está entre el máximo y el mínimo)


    //Actualizamos la velocidad en función del punto en que rebote del jugador
    this.body.velocity.x = this._vel * Math.cos(this._angle);
    this.body.velocity.y = -Math.abs(this._vel * Math.sin(this._angle));

    //Esto es para el rebote en lado contrario al que se mueve la pelota
    if((this.x > player.x && this.body.velocity.x < 0) || (this.x < player.x && this.body.velocity.x > 0))
        this.body.velocity.x = -this.body.velocity.x;


    if(this.y > player.y + player.height / 2)
        this.y = player.y - this.height / 2;

     //Actualizamos la velocidad de nuestra jerarquía
     this._velocity._x = this.body.velocity.x;
     this._velocity._y = this.body.velocity.y;
     

     // Si se puede enganchar a la pala, ésta se quedará pegada (teniendo cuidado de que no esté demasiado al borde ni atravesándolo)
     if(this._attachEnabled && !this._attached)
        this.attach(player); 
}


// FUNCIONES AUXILIARES 
Ball.prototype.getPosX = function()
{
     return this.body.x;
}

Ball.prototype.getPosY = function()
{
     return this.body.y;
}
Ball.prototype.setPosX = function(posX)
{
      this.x = posX;

}

Ball.prototype.setPosY = function(posY)
{
    this.y = posY;
}

Ball.prototype.getVelX = function()
{
     return this._velocity._x;
}
Ball.prototype.getVelY = function()
{
     return this._velocity._y;
}

Ball.prototype.getVel = function()
{
     return this._vel;
}

Ball.prototype.getAngle = function()
{
     return this._angle;
}

Ball.prototype.enableAttach = function()
{
     this._attachEnabled = true;
}

Ball.prototype.isAttached = function()
{
    return this._attached;
}

Ball.prototype.throw = function()
{
    this._attached = false;
    this.body.velocity.x = this._velocity._x;
    this.body.velocity.y = this._velocity._y;
}

Ball.prototype.attach = function(player)
{
    this._attached = true;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;

    if(this.x < player.x - player.width / 2)
        this.x = player.x - player.width / 2;
         
    else if(this.x > player.x + player.width / 2)
        this.x = player.x + player.width / 2 - this.width / 2;  
         
    if(this.y > player.y - this.height)
        this.y = player.y - this.height; 
}

Ball.prototype.slowDown = function()
{
    //Ángulo actual de la pelota (puede ser positivo o negativo)
    var angle = Math.atan(this.body.velocity.y / this.body.velocity.x); 
    var v = this.body.velocity.x / Math.cos(angle);

    //Reducimos la velocidad a la base
    //Eje X 
    if(this.body.velocity.x > 0)
        this.body.velocity.x = BASE_VELOCITY * Math.cos(angle); //El coseno va a ser positivo siempre
    else
        this.body.velocity.x = -BASE_VELOCITY * Math.cos(angle);

    //Eje Y
    if(this.body.velocity.y > 0)
       this.body.velocity.y = BASE_VELOCITY * Math.abs(Math.sin(angle)); //El seno, por el contrario, puede ser > 0 o < 0
    else
       this.body.velocity.y = -BASE_VELOCITY * Math.abs(Math.sin(angle));
}

Ball.prototype.disableEffects = function()
{
    if(this._attachEnabled)
    {
      this._attachEnabled = false;
      if(this._attached)
          this.throw();
    }
}

module.exports = 
{
    Ball,
    BASE_VELOCITY,
    BASE_ANGLE,
};

    