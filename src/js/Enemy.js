'use strict'

var Movable = require ('./Movable.js');
var Destroyable = require ('./Destroyable.js');
var Par = require ('./SoundSource.js').Par;

var ENEMY_POINTS = 100;
var ENEMY_VEL = 1;
var SPIN_RADIUS = 60;
var MAX_ENEMIES = 3;
var DIFFERENT_ENEMIES = 4;
var UPPERLIMIT = 40;

//2.2.1.1.CLASE ENEMIGO
function Enemy(game, position, sprite, sound, lives,  walls, bricks, enemies, gate, playerY, level)
{
    var velocity = new Par(0, ENEMY_VEL);
    Movable.apply(this, [game, position, sprite, sound, lives, velocity, ENEMY_POINTS]);
    //Para el movimiento recto
    this._vel = this._velocity._y; //El módulo de la velocidad
    this._dir = 3;//0-Dcha, 1-Izda, 2-Arriba, 3-Abajo
    this._walls = walls;
    this._bricks = bricks;
    this._enemies = enemies;
    this._gate = gate;
    this._dead = false;

    //Para el movimiento circular
    this._lowerBrickY = this.findLowerBrick();
    this._playerY = playerY;
    this._circles = false;
    this._rotationDirection = 1; //-1 = clockwise 1 = counterclockwise
    this._spinAxis = new Par (0,0);
    this._initialTime = 0;
    this._outOfGate = false;

    //Para el respawn
    this._iniX = position._x;
    this._iniY = position._y;
    this.anchor.setTo(0.5, 0.5);

    //Animaciones de los enemigos
    var enemyType = (DIFFERENT_ENEMIES + level - 1) % DIFFERENT_ENEMIES;
    if(enemyType == 0)
        this.animations.add('move', [0, 1, 2, 3, 4, 5, 6, 7]);
    else if (enemyType == 1)
        this.animations.add('move', [8, 9, 10, 11, 12, 13, 14]);
    else if (enemyType == 2)
        this.animations.add('move', [16, 17, 18, 19, 20, 21]);
    else if (enemyType == 3)
        this.animations.add('move', [24, 25, 26, 27, 28, 29, 30, 31]);
    this.animations.add('explode', [32, 33, 34, 35]); //Explosión

    this.animations.play('move', 8, true);
    this.animations.currentAnim.speed = 6 * ENEMY_VEL;

    //Animaciones de las compuertas
    this._gate.animations.play('open', 9, false);
    this._gate.animations.currentAnim.speed = 6 * ENEMY_VEL;
}

Enemy.prototype = Object.create(Movable.prototype);
Enemy.prototype.constructor = Enemy;


Enemy.prototype.update = function() 
{
    //Si está muerto, no hace nada en el update
    if(!this._dead)
    {
      if(this._circles)
        this.moveCircles();
     else 
        this.moveStraight();
        
     Movable.prototype.update.call(this);
    }
}

Enemy.prototype.moveStraight = function() 
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

    //4.COMPROBAMOS SI HAY QUE MOVERSE EN CÍRCULOS
    if(this.y - this.height / 2 > this._lowerBrickY && this._spinAxis._y == 0)
    {
        this._circles = true;
        //El sentido de giro depende de su posición
        if(this.x > this.game.world.centerX)
            this._rotationDirection = -1;
        else
            this._rotationDirection = 1;
            
        //Queremos que empiece la órbita con 45º (PI/4)
        this._spinAxis = new Par(this.x + (Math.cos(Math.PI / 4) * SPIN_RADIUS) * this._rotationDirection, 
        this.y + (Math.sin(Math.PI / 4) * SPIN_RADIUS));
        this._initialTime = -Math.acos((Math.abs(this.x - this._spinAxis._x)) / SPIN_RADIUS);
    } 
    //Comprobamos si ya ha salido de la compuerta
    else if (!this._outOfGate && this.y - this.width/2 > UPPERLIMIT)
        this._outOfGate=true;
}

Enemy.prototype.choque = function(dirX, dirY) 
{
    //Enemigo auxiliar para comprobar la colisión
    var nx = this.x - this.width/2 + dirX;
    var ny = this.y - this.height/2 + dirY;
    var auxEnemy = new Phaser.Sprite(this.game, nx, ny, 'enemigos');
    this.game.physics.enable(auxEnemy);

    //Comprobamos colisiones de ese auxiliar con los 3 grupos que nos importan
    var choque = ((this.choqueGrupo(auxEnemy, this._bricks) || this.choqueGrupo(auxEnemy, this._walls) 
    || this.choqueGrupo(auxEnemy, this._enemies)) && this._outOfGate);

    return choque;
}

Enemy.prototype.choqueGrupo = function(obj1, grupo)
{
    var numElems = grupo.length;
    var i = 0;
    var choque = false;
    var enemigoGirando = false;
    //Choque con todos los elementos de ese grupo
    while(i < numElems && !choque)
    {
        var element = grupo.children[i];
        choque = (this.game.physics.arcade.overlap(obj1, element) && element != this);  
        i++;
    }
    //Los enemigos que giran no se chocan
    if(choque && grupo.children[i-1].hasOwnProperty("_circles") && grupo.children[i-1]._circles == true)
       choque = false;
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

Enemy.prototype.findLowerBrick = function() 
{
    var posY = 0; var i=0;
    for (i = 0; i < this._bricks.length; i++)
    {
        if(this._bricks.children[i].y >  posY)
           posY = this._bricks.children[i].y;
    } 
    posY += this._bricks.children[0].height;
    return posY;   
}

Enemy.prototype.moveCircles = function() 
{
    //1º vez que se llama:
    //x = this.x
    //y = this.y
    //MOVIMIENTO CIRCULAR
    var oldY = this.y;

    this.x = this._spinAxis._x + Math.cos(this._initialTime) * SPIN_RADIUS * -this._rotationDirection;
    this.y = this._spinAxis._y + Math.sin(this._initialTime) * SPIN_RADIUS;
    
    this._initialTime += (this.game.time.now - this.game.time.prevTime) * 0.001 * 1.5;
    //Si está yendo hacia arriba a partir del centro de rotación, bajamos el radio
    if(this.y < oldY && this.y < this._spinAxis._y) 
       this._spinAxis._y += 0.3;
    //Si sobrepasa la altura del jugador, deja de dar círculos
    else if(this.y + (this.height*2) > this._playerY)
    {
        this._dir = 3;
        this._circles=false;
    }  
}


Enemy.prototype.takeDamage = function(playscene) 
{
    this._dead = true;
    this.body.enable = false;
    this.animations.play('explode', 5, false);
    this._sound.play();

    this.animations.currentAnim.onComplete.add(function()
    {
        Destroyable.prototype.takeDamage.call(this, playscene);
        
        //Se respawnea a si mismo
        this.x = this._iniX;
        this.y = this._iniY;
        this._dir = 3;
        this._circles = false;
        this._spinAxis = new Par (0,0);
        this._outOfGate = false;
        this._gate.animations.play('open', 9, false);
        this.animations.play('move', 8, true);
    
        this.body.enable = true;
        this._dead = false;
        this.revive();
    }, this);
}

module.exports = Enemy;