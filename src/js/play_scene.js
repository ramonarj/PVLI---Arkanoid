'use strict';

var player; //No puedo ponerla local

//Variables globales (constantes)
var NUM_POWERUPS = 7;
var NUM_POWERUPS = 3;
var MAX_VELOCITY = 600;
var MAX_ENEMIES = 3;
var NUM_ROWS = 6;
var NUM_COLS = 11;

var PlayScene =
 {
     //Variables locales (de la escena)
     fondo:null,
     leftlimit:null, rightLimit:null,
     cursors:null,
     playerWeapon:null,
     enemigos: null,
     ball:null,
     bricks:null,
     walls:null,
     powerUps:null,
     AllPowerUps:null,

   //Función Create
  create: function () 
  {
    //Sistema de físicas
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    //Añadimos las variables
    //1.Fondo
    this.fondo = new Phaser.Image(this.game, 125, 20, 'background');
    this.game.world.addChild(this.fondo);

    //2.Pelota
    var playerPos = new Par(350, 525);
    var ballPos = new Par(playerPos._x, playerPos._y - 12);
    var ballVel = new Par(166,-250);
    this.ball=new Ball(this.game, ballPos, 'ball', 'sound', 1, ballVel);
    this.game.world.addChild(this.ball);

    //3.Paredes y techo (grupo walls)
    this.walls = this.game.add.physicsGroup();

    var techo = new Phaser.Sprite(this.game, 80, 0, 'techo'); //Creamos
    var pared1 = new Phaser.Sprite(this.game, 108, 35, 'pared');
    var pared2 = new Phaser.Sprite(this.game, 633, 35, 'pared');
    this.walls.add(techo);
    this.walls.add(pared1);
    this.walls.add(pared2);
    this.walls.setAll('body.immovable', true);
    this.walls.setAll('visible', false);

    //4.Límites de la pantalla
    this.leftLimit = pared1.x + pared1.width; 
    this.rightLimit = pared2.x - 2;

    //5.Ladrillos (grupo bricks)
    this.bricks = this.game.add.physicsGroup();
    this.bricks.classType = Destroyable;
    
    var width = (this.rightLimit-this.leftLimit) / NUM_COLS;
    for(var i = 0; i < NUM_ROWS; i++)
    {
        for(var j = 0; j < NUM_COLS; j++)
        {
            //Posición
            var pos= new Par(this.leftLimit + (j*width), 125 + (i*21));

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

            //Lo añadimos al grupo
            this.bricks.add(lad);
        }
    }
    this.bricks.setAll('body.immovable', true);

    //6.Cursores
    this.cursors = this.game.input.keyboard.createCursorKeys();

    //7.Balas
    this.playerWeapon = new Movable(this.game, playerPos, 'bullet', 'sound',3, playerVel);
    this.playerWeapon = this.game.add.weapon(8, 'bullet');
    this.playerWeapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    this.playerWeapon.bullets.forEach((b) => {
        b.body.updateBounds();
    }, this);
    this.playerWeapon.bulletAngleOffset = 90; //Ángulo
    this.playerWeapon.bulletSpeed = 600; //Velocidad
    this.playerWeapon.fireRate = 500; //FireRate

    //7.Jugador
    var playerVel = new Par(0,0);
    player = new Player(this.game, playerPos, 'player', 'sound', 3, playerVel, this.cursors, 
                                               this.playerWeapon, this.leftLimit, this.rightLimit, this.ball);
    this.game.world.addChild(player);
    this.game.physics.enable([player,this.ball], Phaser.Physics.ARCADE);
    player.body.immovable = true;

    //8.PowerUps
    this.powerUps = this.game.add.physicsGroup();
    this.powerUps.classType = PowerUp;
    this.AllPowerUps = [this.enableShot, this.gainLife, this.getWider];
    
    //9.Enemigos
    this.enemigos = this.game.add.physicsGroup();
    this.enemigos.classType = Enemy;

    
    var enemyPos = new Par(this.leftLimit + 40, 50);
    var enemyVel = new Par(0, 1);
    var enem1 = new Enemy(this.game, enemyPos, 'enemigo', 'sound', 1, enemyVel, this.leftLimit, this.rightLimit);
    this.enemigos.add(enem1);
    

    var enemyPos2 = new Par(this.rightLimit-90, 55); 
    var enemyVel2 = new Par(0, 1);
    var enem2 = new Enemy(this.game, enemyPos2, 'enemigo', 'sound', 1, enemyVel2, this.leftLimit, this.rightLimit);
    this.enemigos.add(enem2);

    this.enemigos.setAll('body.immovable', true);


    //Cosas de la pelota
    this.ball.body.velocity.setTo(this.ball._velocity._x, this.ball._velocity._y); //Físicas de la pelota
    this.ball.body.bounce.setTo(1, 1); //ESTO SIRVE PARA HACER QUE ACELERE
    this.ball.attach(); //La pegamos al jugador
  },
  

  //FUNCIÓN UPDATE
  update: function()
  {
    //Colisiones de la pelota
    this.game.physics.arcade.overlap(this.ball, this.walls, this.ballCollisions, null, this);
    this.game.physics.arcade.overlap(this.ball, this.bricks, this.ballCollisions, null, this);
    this.game.physics.arcade.overlap(this.ball, player, this.ballCollisions, null, this);
    this.game.physics.arcade.overlap(this.ball, this.enemigos, this.ballCollisions, null, this);

    //Colisiones de la bala
    this.game.physics.arcade.overlap(this.playerWeapon.bullets, this.walls, this.bulletCollisions, null, this);
    this.game.physics.arcade.overlap(this.playerWeapon.bullets, this.bricks, this.bulletCollisions, null, this);
    this.game.physics.arcade.overlap(this.playerWeapon.bullets, this.enemigos, this.bulletCollisions, null, this);

    //Colisiones del jugador
    this.game.physics.arcade.overlap(player, this.powerUps, this.playerCollisions, null, this);
    this.game.physics.arcade.overlap(player, this.enemigos, this.playerCollisions, null, this);

    //Colisiones del enemigo
    this.game.physics.arcade.overlap(this.enemigos, this.walls, this.enemyCollisions, null, this);
    this.game.physics.arcade.overlap(this.enemigos, this.bricks, this.enemyCollisions, null, this);
    this.game.physics.arcade.overlap(this.enemigos, this.enemigos, this.enemyCollisions, null, this);
  },

  // COLISIONES
  // A) Detecta las colisones con las balas
  bulletCollisions: function(bullet, obj)
  {
    //Si es un destruible, le quita vida
    if(obj.hasOwnProperty('_lives'))
        obj.takeDamage(this);

    bullet.kill(); //Destruimos la bala
  },

  // B) Detecta las colisones con la pelota
  ballCollisions: function(ball, obj)
  {
      //La pelota rebota en ese algo (siempre que no esté parada)
      if(!ball.isAttached())
         ball.bounce(obj, this);
  },

  // C) Detecta las colisones con el jugador
  playerCollisions: function(player, obj)
  {
      //Power-ups
      if(obj.hasOwnProperty('_powerUpNum'))
          this.takePowerUp(player, obj);
      //Enemigos    
      else if (obj.constructor === Enemy)
          obj.takeDamage(this);
  },

    // D) Detecta las colisones con el enemigo
    enemyCollisions: function(enemy, obj)
    {
        enemy.choca(obj);
    },
  
  // POWER-UPS

   // A) Crea un Power-Up
   createPowerUp: function(brick, nPowerUp)
   {
     var brickPosition = new Par(brick.x, brick.y)
     var powerUp = new PowerUp(this.game, brickPosition ,'powerUp' + nPowerUp, 'noSound', 1, new Par(0,2), nPowerUp);
 
 
      this.powerUps.add(powerUp);
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
    num = Math.floor(Math.random() * (NUM_POWERUPS));
   
    this.createPowerUp(brick, num);
     }
   },
 
   // C) Recoge un Power-Up y determina su función
   takePowerUp: function(player, powerUps)
   {
       this.AllPowerUps[powerUps.getPowerUpNum()]();
     
       powerUps.destroy();
   },

    // Power-Ups:
    // 1) Red:  grants the player the ability to shoot
   enableShot: function()
   {
      return player.enableShot();
   },

   // 2) Grey: gain a life
   gainLife: function()
   {
     return player.addLife();
   },

    // 3) Blue: get wider
    getWider: function()
    {
      return player.getWider();
    },

   // Usado para hacer debug
  render: function() 
   {
        // Player debug info
        this.game.debug.text('shot: '+ player._shotEnabled, 25, 32);
        this.game.debug.text('wider: '+ player._wider, 25, 45);
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
        this.destroy();
}


////////////////////////////////////////
//2.2.1.1.CLASE ENEMIGO
function Enemy(game, position, sprite, sound, lives, velocity, limiteIzda, limiteDcha)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
    this._dir = 3; //Derecha, izquierda, arriba, abajo (en ese orden)
    this._vel = this._velocity._y; //El módulo de la velocidad
    this._cicloHecho=false;
    
    //Dirección a la que irá al principio
    if(this.x - limiteIzda < limiteDcha - this.x)
       this._dirPreferente = 1;
    else
       this._dirPreferente = 0;
}

Enemy.prototype = Object.create(Movable.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.move = function() //Se mueve con "pathfinding"
{
    this.x+=this._velocity._x;
    this.y+=this._velocity._y;
}

Enemy.prototype.update = function() 
{
    Movable.prototype.update.call(this);
    this.move();
}

Enemy.prototype.choca = function(obj, limiteIzda, limiteDcha) 
{
    //console.log("Enemigo: {"+ this.x + ","+this.y+"}, Obstáculo: {"+ obj.x + ","+obj.y+"}");

   //1.Cambiamos la dirección actual
    //Iba hacia abajo   
    if(obj.y > this.y && this._dir == 3)
    {
        if(this._cicloHecho)
           this._dir = 0;
        else
           this._dir = this._dirPreferente;
        
        this.y-=3;
    }

   //Iba hacia la derecha
   else if(obj.x > this.x && this._dir == 0)
   {
      this._dir = 1;
      this.x-=3;
   }

   //Iba hacia la izquierda
   else if(obj.x < this.x && this._dir == 1)
   {
      this._dir = 2;
      this.x+=3;
   }

    //Iba hacia arriba  
    else if (obj.y < this.y && this._dir == 2)
    {
        this._dir=3;
        this.y+=3;
        this._cicloHecho=true;
    }


   //2.Cambiamos las velocidades
   this.updateSpeed();
}

Enemy.prototype.updateSpeed = function() 
{
    this._velocity._x=0;
    this._velocity._y=0;

    if(this._dir==0)
        this._velocity._x = this._vel;
    else if (this._dir==1)
        this._velocity._x = -this._vel;
    else if (this._dir==2)
        this._velocity._y = -this._vel;
    else
        this._velocity._y = this._vel;
}


/////////////////////////////////////////
//2.2.1.2.CLASE JUGADOR 
function Player(game, position, sprite, sound, lives, velocity, cursors, playerWeapon, leftLimit, rightLimit, ball)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
    

    // Constantes
    this._originalSize = this.width;

    this._powerUpActual = -1;
    this.anchor.setTo(0.5, 0); //Ancla del jugador

    this._cursors = cursors;
    this._fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    this._playerWeapon = playerWeapon;
    this._playerWeapon.trackSprite(this, 0, 0);
    this._leftLimit = leftLimit;
    this._rightLimit = rightLimit;
    this._ball = ball;

    // Variables de control
    this._shotEnabled = false;
    this._wider = false;
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

// Power-Ups
Player.prototype.getAnchor = function (i)
{
    if(i===0)
       return this.anchor.x;
    else
       return this.anchor.y;   
}

// 1) Rojo -> Disparo
Player.prototype.enableShot = function ()
{   
    this.disablePowerUps();
   this._shotEnabled = true;
}

// 2) Gris -> Ganar vida
Player.prototype.addLife = function ()
{   
   this._lives++;
}

// 3) Azul -> Ensanchar la pala 
Player.prototype.getWider = function ()
{   
    this.disablePowerUps();
    // Comprobamos que no se haya ensanchado ya (Posibles cambios. De momento, tal cual en el original)
    if(!this._wider)
    {
       this._wider = true;
       var widerPaddle = this.width *= 1.5;
       this.body.setSize(widerPaddle, this.height);
    }
}

// Deshabilita el resto de Power-Ups (Posibles cambios. De momento, solo un Power-Up al mismo tiempo)
Player.prototype.disablePowerUps = function ()
{   
    this._shotEnabled = false;
    this.getNarrow();
}

// FUNCIONES AUXILIARES
Player.prototype.getNarrow = function ()
{   
    if(this._wider)
    {
       this._wider = false;
       var narrowPaddle = this.width /= 1.5;
       this.body.setSize(narrowPaddle, this.height);
    }
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
    //Rebota
    this.game.physics.arcade.collide(this, obj);

    //Cogemos su velocidad y ángulo después de rebotar
    var angle = Math.atan(this.body.velocity.y / this.body.velocity.x); 
    var v = this.body.velocity.x / Math.cos(angle); 

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
        if(obj.hasOwnProperty('_lives'))
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