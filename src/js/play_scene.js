'use strict';


var player;
var fondo;
var cursors;
var ball;
var bricks;
var playerWeapon;
var leftLimit, rightLimit;
var walls;
var powerUps;
var powerUp;
var NUM_POWERUPS = 7;
var AllPowerUps;
var MAX_VELOCITY = 600;
var NUM_ROWS = 6;
var NUM_COLS = 11;


var PlayScene =
 {
   //Función Create
  create: function () 
  {
    //Sistema de físicas
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    //Añadimos las variables
    //1.Fondo
    fondo = new Phaser.Image(this.game, 125, 20, 'background');
    fondo.scale.setTo(2.75,2.5);
    this.game.world.addChild(fondo);

    //2.Pelota
    var playerPos = new Par(350, 525);
    var ballPos = new Par(playerPos._x, playerPos._y - 12);
    var ballVel = new Par(166,-250);
    ball=new Ball(this.game, ballPos, 'ball', 'sound', 1, ballVel);
    ball.scale.setTo(1.7,1.7);
    this.game.world.addChild(ball);

    //3.Paredes y techo (grupo walls)
    walls = this.game.add.physicsGroup();

    var techo = new Phaser.Sprite(this.game, 80, 0, 'techo'); //Creamos
    var pared1 = new Phaser.Sprite(this.game, 108, 35, 'pared');
    var pared2 = new Phaser.Sprite(this.game, 633, 35, 'pared');
    techo.scale.setTo(0.8,0.2); //Escalamos
    pared1.scale.setTo(0.2,0.8);
    pared2.scale.setTo(0.2,0.8);
    walls.add(techo);
    walls.add(pared1);
    walls.add(pared2);
    walls.setAll('body.immovable', true);
    walls.setAll('visible', false);

    //4.Límites de la pantalla
    leftLimit = pared1.x + pared1.width; 
    rightLimit = pared2.x;

    //5.Ladrillos (grupo bricks)
    bricks = this.game.add.physicsGroup();
    bricks.classType = Destroyable;
    
    var width = (rightLimit-leftLimit) / NUM_COLS;
    for(var i = 0; i < NUM_ROWS; i++)
    {
        for(var j = 0; j < NUM_COLS; j++)
        {
            //Posición
            var pos= new Par(leftLimit + (j*width), 100 + (i*21));

            //Tipo de ladrillo
            var lad;
            var rnd = Math.random();
            var silverChance= 1/5;
            var goldChance = 1/10;

            if(rnd<goldChance)
              lad = new SoundSource(this.game, pos, 'ladrilloOro', 'sound'); 
            else if (rnd<(goldChance +silverChance))
              lad = new Destroyable(this.game, pos, 'ladrilloPlata', 'sound', 3); 
            else
              lad = new Destroyable(this.game, pos, 'ladrilloBueno', 'sound', 1); 

            //Lo escalamos y añadimos al grupo
            lad.scale.setTo(2.77,2.7);
            bricks.add(lad);
        }
    }
    bricks.setAll('body.immovable', true);

    //6.Cursores
    cursors = this.game.input.keyboard.createCursorKeys();

    //7.Balas
    playerWeapon = new Movable(this.game, playerPos, 'bullet', 'sound',3, playerVel);
    playerWeapon = this.game.add.weapon(8, 'bullet');
    playerWeapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    playerWeapon.bullets.forEach((b) => {
        b.scale.setTo(3, 3);
        b.body.updateBounds();
    }, this);
    playerWeapon.bulletAngleOffset = 90; //Ángulo
    playerWeapon.bulletSpeed = 600; //Velocidad
    playerWeapon.fireRate = 500; //FireRate



    //Jugador
    var playerVel = new Par(0,0);
    player = new Player(this.game, playerPos, 'player', 'sound', 3, playerVel, cursors, playerWeapon, leftLimit, rightLimit, ball);
    player.scale.setTo(2.5, 2.5);
    this.game.world.addChild(player);
    this.game.physics.enable([player,ball], Phaser.Physics.ARCADE);
    player.body.immovable = true;

    //PowerUps
    powerUps = this.game.add.physicsGroup();
    powerUps.classType = PowerUp;


    AllPowerUps = [this.enableShot];
    
    //Cosas de la pelota
    ball.body.velocity.setTo(ball._velocity._x, ball._velocity._y); //Físicas de la pelota
    ball.body.bounce.setTo(1, 1); //ESTO SIRVE PARA HACER QUE ACELERE
    ball.attach(); //La pegamos al jugador
  },
  

  //FUNCIÓN UPDATE
  update: function()
  {
    //Colisiones de la pelota
    this.game.physics.arcade.overlap(ball, walls, this.ballCollisions, null, this);
    this.game.physics.arcade.overlap(ball, bricks, this.ballCollisions, null, this);
    this.game.physics.arcade.overlap(ball, player, this.ballCollisions, null, this);

    //Colisiones de la bala
    this.game.physics.arcade.overlap(playerWeapon.bullets, walls, this.bulletCollisions, null, this);
    this.game.physics.arcade.overlap(playerWeapon.bullets, bricks, this.bulletCollisions, null, this);

    //Colisiones del jugador
    this.game.physics.arcade.overlap(player, powerUps, this.takePowerUp, null, this);
    //console.log("{" + ball._velocity._x + ", " + ball._velocity._y+"}" );

  },

  // COLISIONES


  // A) Detecta las colisones con las balas
  bulletCollisions: function(bullet, obj)
  {
    //Si es un destruible, le quita vida
    if(Object.getPrototypeOf(obj).hasOwnProperty('takeDamage'))
       obj.takeDamage(this);

   bullet.kill(); //Destruimos la bala
  },

  // B) Detecta las colisones con la pelota
  ballCollisions: function(ball, obj)
  {
      if(!ball.isAttached())
      {
        this.game.physics.arcade.collide(ball, obj);
        
       //La pelota rebota en algo
       ball.bounce(obj, this);
      }
  },
  
  // POWER-UPS

   // A) Crea un Power-Up
   createPowerUp: function(brick, nPowerUp)
   {
     var brickPosition = new Par(brick.x, brick.y)
     var powerUp = new PowerUp(this.game, brickPosition ,'powerUp' + nPowerUp, 'noSound', 1, new Par(0,2), nPowerUp);
 
    // powerUp.frame = 0;
     // this.animations.add('rotate');
     // this.animations.play('rotate', 30, true);
 
      powerUps.add(powerUp);
      powerUp.scale.setTo(2.5, 2.5);
      this.game.physics.enable([powerUp, player], Phaser.Physics.ARCADE);
      powerUp.body.immovable = true;
      powerUp.body.velocity.y = 2;
     
   },
 
   // B) Dropea un Power-Up según una probabilidad
   dropPowerUp: function(brick)
   {
     var num = Math.random();
     var drop = false;
 
     var dropChance = 1;
     if(num<dropChance)
     drop = true;
 
     if(drop)
     {
     // this. num = Math.floor(Math.random() * (max - min)) + min;
     // Seleccionamos así una powerUp random de entre los que hay
    //this.num = Math.floor(Math.random() * (NUM_POWERUPS));
   
    this.createPowerUp(brick, 0);
     }
   },
 
      // C) Recoge un Power-Up y determina su función
   takePowerUp: function(player, powerUps)
   {
      AllPowerUps[powerUps.getPowerUpNum()]();
     
       powerUps.destroy();
   },

    // Power-Ups:
    // 1) Red:  grants the player the ability to shoot
   enableShot: function()
   {
      return player.enableShot();
   },

   // Usado para hacer debug
  render: function() 
  {
        // Player debug info
        this.game.debug.text(player._shotEnabled, 32, 32);

    }


};

module.exports = PlayScene;

//////////////////////////////////////
//////ARQUITECTURA DE HERENCIA////////
//////////////////////////////////////
//Estructura auxiliares
function Par(x, y)
{
    this._x=x;
    this._y=y;
}

///////////////////////////////////////////////
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

/////////////////////////////////////////////
//2.1.CLASE HUD (Hud)
function HUD(game, position, sprite, sound)
{
  SoundSource.apply(this, [game, position, sprite, sound]);
}

HUD.prototype = Object.create(SoundSource.prototype);
HUD.prototype.constructor = HUD;

///////////////////////////////////////////////
//2.2.CLASE DESTRUIBLE (Ladrillos) -> tienen número de vidas y método para quitarse vida
function Destroyable(game, position, sprite, sound, lives)
{
    SoundSource.apply(this, [game, position, sprite, sound]);
    this._lives = lives;
}

Destroyable.prototype = Object.create(SoundSource.prototype);
Destroyable.prototype.constructor = Destroyable;

//Funciones de destruible
Destroyable.prototype.takeDamage = function (playscene) //Quita una vida
{
    this._lives--;
    if(this._lives <=0)
    {
        //Si es un ladrillo, puede dropear power-ups
        if(this.constructor === Destroyable)
            playscene.dropPowerUp(this);
            
        //Se destruye
        this.destroy();
    }
}
Destroyable.prototype.getLives = function()
{
    return this._lives;
}

/////////////////////////////////////////
//2.2.1.CLASE MÓVIL (Bala) -> tienen velocidad en x e y
function Movable(game, position, sprite, sound, lives, velocity)
{
    Destroyable.apply(this, [game, position, sprite, sound, lives]);
    this._velocity = velocity;
}

Movable.prototype = Object.create(Destroyable.prototype);
Movable.prototype.constructor = Movable;


//Funciones de moviles
Movable.prototype.setVelocity = function(velocity) //Cambia la velocidad
{
    this._velocity._x = velocity._x;
    this._velocity._y = velocity._y;
}

Movable.prototype.update = function() //Para la DeadZone
{
    if(this.y>this.game.height - 20)
        this.takeDamage();
}


////////////////////////////////////////
//2.2.1.1.CLASE ENEMIGO
function Enemy(game, position, sprite, sound, lives, velocity)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
}

Enemy.prototype = Object.create(Movable.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.pathfinding = function() //Se mueve con "pathfinding"
{

}

/////////////////////////////////////////
//2.2.1.2.CLASE JUGADOR 
function Player(game, position, sprite, sound, lives, velocity, cursors, playerWeapon, leftLimit, rightLimit, ball)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
    
    this._powerUpActual=0;
    this.anchor.setTo(0.5, 0); //Ancla del jugador

    this._cursors = cursors;
    this._fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    this._playerWeapon = playerWeapon;
    this._playerWeapon.trackSprite(this, 0, 0);
    this._leftLimit = leftLimit;
    this._rightLimit = rightLimit;
    this._shotEnabled = false;
    this._ball = ball;
}

Player.prototype = Object.create(Movable.prototype);
Player.prototype.constructor = Player;

//Funciones de jugador
Player.prototype.readInput = function() //Mueve el jugador a la izquierda
{
    var delta = this.x;
    //Comprobación de cursores de Phaser
    if (this._cursors.left.isDown && this.x >  this._leftLimit + this.offsetX)
    {
        this.x -= 6.5;
    }
    
    else if (this._cursors.right.isDown && this.x < this._rightLimit - this.offsetX)
    {
        this.x += 6.5;
    }

    if(this._fireButton.isDown)
    {
        if(this._shotEnabled)
           this._playerWeapon.fire();
        else if(this._ball.isAttached())
           this._ball.throw();
    }

    //La pelota es hija por programación
    delta-=this.x;
    if(this._ball.isAttached())
        this._ball.x-=delta;
}

Player.prototype.update = function() //Update
{
  this.readInput();
}

Player.prototype.getAnchor = function (i)
{
    if(i===0)
       return this.anchor.x;
    else
       return this.anchor.y;   
}

Player.prototype.enableShot = function ()
{   
this._shotEnabled = true;
}


//////////////////////////////////////
//2.2.1.2.CLASE PELOTA
function Ball(game, position, sprite, sound, lives, velocity)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
    this._attached = true; 
}

Ball.prototype = Object.create(Movable.prototype);
Ball.prototype.constructor = Ball;

//Funciones de pelota
Ball.prototype.bounce = function(obj, playscene) //Rebota en un objeto "obj2"
{
    var angle = Math.atan(this.body.velocity.y / this.body.velocity.x); //Ángulo después de rebotar
    var v = this.body.velocity.x / Math.cos(angle); //Velocidad absoluta

    //Jugador (rebota)
    if(Object.getPrototypeOf(obj).hasOwnProperty('readInput'))
    {
        //Rebote en lado contrario al que se mueve la pelota
        if((this.x > obj.x && this.body.velocity.x < 0) || (this.x < obj.x && this.body.velocity.x > 0))
            this.body.velocity.x = -this.body.velocity.x;
    }

    //Ladrillos o paredes
    else if (obj.hasOwnProperty('_sound'))
    {
        //Aceleramos la pelota
        if(Math.max(v, -v) < MAX_VELOCITY)
        {
          if(v<0)
             v-=10;
          else
             v+=10;
          this.body.velocity.x = v * Math.cos(angle);
          this.body.velocity.y = v * Math.sin(angle);
        }

        //Para los ladrillos destruibles
        if(Object.getPrototypeOf(obj).hasOwnProperty('takeDamage'))
            obj.takeDamage(playscene);
    }

    //Actualizamos la velocidad de nuestra jerarquía
    this._velocity._x = this.body.velocity.x;
    this._velocity._y = this.body.velocity.y;
}

Ball.prototype.isAttached = function()
{
    return this._attached;
}

Ball.prototype.throw = function()
{
    this._attached=false;
    this.body.velocity.x = this._velocity._x;
    this.body.velocity.y = this._velocity._y;
}

Ball.prototype.attach= function()
{
    this._attached = true;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
}

/////////////////////////////////////////
//2.2.1.2.CLASE POWER-UP
function PowerUp(game, position, sprite, sound, lives, velocity, powerUpNum)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
    this._powerUpNum = powerUpNum;

   // Para elegir un frame en concreto -> this.frame = x;
    this.animations.add('rotate');
    // Comienza la animación: a 5 frames, y 'true' para repetirla en bucle
    this.animations.play('rotate', 6, true);

}

PowerUp.prototype = Object.create(Movable.prototype);
PowerUp.prototype.constructor = PowerUp;

PowerUp.prototype.update = function()
{
    this.y += this.body.velocity.y;
}

PowerUp.prototype.getPowerUpNum = function()
{
    return this._powerUpNum;
}
