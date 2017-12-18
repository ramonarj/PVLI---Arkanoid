'use strict'

var Movable = require ('./Movable.js');
var Destroyable = require ('./Destroyable.js');
var Par = require ('./SoundSource.js').Par;

var ENEMY_POINTS = 100;
var ENEMY_VEL = 1;

//2.2.1.1.CLASE ENEMIGO
function Enemy(game, position, sprite, sound, lives, velocity, walls, bricks, enemies)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity, ENEMY_POINTS]);
    this._vel = this._velocity._y; //El módulo de la velocidad
    this._dir = 3;//0-Dcha, 1-Izda, 2-Arriba, 3-Abajo
    this._walls = walls;
    this._bricks = bricks;
    this._enemies = enemies;

    this._iniX = position._x;
    this._iniY = position._y;
    this.anchor.setTo(0.5, 0.5);

    //Animación
    this.animations.add('move');
    this.animations.play('move', 8, true);
    this.animations.currentAnim.speed = 6 * ENEMY_VEL;
}

Enemy.prototype = Object.create(Movable.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() 
{
    this.move();
    Movable.prototype.update.call(this);
}

Enemy.prototype.move = function() 
{
    //1.ACTUALIZAMOS LA DIRECCIÓN ACTUAL
    //Direcciones ordenadas por prioridad
    //1.Va hacia la derecha
    if (this._dir == 0)
    {
        //Intenta ir hacia abajo
        if(!this.choque(0, 1))
            this._dir = 3;

        //Si no, si se choca yendo a la derecha, va a la izquierda 
        else if(this.choque(1, 0))
            this._dir = 1;
        //Y si no, sigue hacia la derecha
    }

    //2.Va hacia la izquierda
    else if (this._dir == 1)
    {
        //Intenta ir hacia abajo
        if(!this.choque(0,1))
            this._dir = 3;
        //Si no, si se choca yendo a la izquierda, va arriba
        else if(this.choque(-1,0))
            this._dir = 2;
            
        //Y si no, sigue hacia la izquierda
    }

    //3.Va hacia arriba
    else if (this._dir == 2)
    {
        //Si se choca, va hacia abajo
        if(this.choque(0, -1))
            this._dir = 3;
        //Y si no, sigue hacia arriba
    }

    //4.Va hacia abajo
    else
    {
        //Si se choca, va hacia la derecha
        if(this.choque(0, 1))
            this._dir = 0;   
        //Y si no, sigue hacia abajo
    }

    //2.ACTUALIZAMOS LAS VELOCIDADES
    this.updateSpeed();
    
    //3.MOVEMOS AL ENEMIGO
    this.x+=this._velocity._x;
    this.y+=this._velocity._y;
}

Enemy.prototype.choque = function(dirX, dirY) 
{
    //Enemigo auxiliar para comprobar la colisión
    var nx = this.x - this.width/2 + dirX;
    var ny = this.y - this.height/2 + dirY;
    var auxEnemy = new Phaser.Sprite(this.game, nx, ny, 'enemigos');
    this.game.physics.enable(auxEnemy);

    //Comprobamos colisiones de ese auxiliar con los 3 grupos que nos importan
    var choque = (this.choqueGrupo(auxEnemy, this._bricks) || this.choqueGrupo(auxEnemy, this._walls) 
    || this.choqueGrupo(auxEnemy, this._enemies));

    return choque;
}

Enemy.prototype.choqueGrupo = function(obj1, grupo)
{
    var numElems = grupo.length;
    var i = 0;
    var choque = false;
    //Choque con todos los elementos de ese grupo
    while(i < numElems && !choque)
    {
        var element = grupo.children[i];
        choque = (this.game.physics.arcade.overlap(obj1, element) && element != this);  
        i++;
    }
    return choque;
}


Enemy.prototype.updateSpeed = function() 
{
    this._velocity._x=0;
    this._velocity._y=0;

    if(this._dir == 0)
        this._velocity._x = this._vel;
    else if (this._dir == 1)
        this._velocity._x = -this._vel;
    else if (this._dir == 2)
        this._velocity._y = -this._vel;
    else
        this._velocity._y = this._vel;
}


Enemy.prototype.takeDamage = function(playscene) 
{
    Destroyable.prototype.takeDamage.call(this, playscene);

    //Se respawnea a si mismo
    this.x = this._iniX;
    this.y = this._iniY;
    this._dir = 3;

    this.revive();
}

module.exports = 
{
    Enemy,
    ENEMY_POINTS,
    ENEMY_VEL
};