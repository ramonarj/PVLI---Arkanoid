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

var PlayScene =
 {
   //Función Create
  create: function () 
  {
    //Sistema de físicas
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    //Añadimos las variables
    //1.Fondo
    fondo = new Phaser.Image(this.game, 150, 20, 'background');
    fondo.scale.setTo(2.5,2.5);
    this.game.world.addChild(fondo);

    //2.Pelota
    var playerPos = new Par(350, 520);
    var ballVel = new Par(-200,-200);
    ball=new Ball(this.game, playerPos, 'ball', 'sound', 1, ballVel);
    ball.scale.setTo(2,2);
    this.game.world.addChild(ball);

    //3.Paredes y techo (grupo walls)
    walls = this.game.add.physicsGroup();

    var techo = new Phaser.Sprite(this.game, 80, 0, 'techo'); //Creamos
    var pared1 = new Phaser.Sprite(this.game, 131, 35, 'pared');
    var pared2 = new Phaser.Sprite(this.game, 612, 35, 'pared');
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
    
    for(var i = leftLimit + 15; i < rightLimit - 30; i+=60)
    {
        for(var j = 100; j < 250; j+=30)
        {
            //Posición
            var pos= new Par(i, j);

            //Tipo de ladrillo
            var lad;
            var rnd = Math.random();
            var silverChance= 1/4;
            var goldChance = 1/8;

            if(rnd<goldChance)
              lad = new SoundSource(this.game, pos, 'ladrilloOro', 'sound'); 
            else if (rnd<(goldChance +silverChance))
              lad = new Destroyable(this.game, pos, 'ladrilloPlata', 'sound', 3); 
            else
              lad = new Destroyable(this.game, pos, 'ladrilloBueno', 'sound', 1); 

            //Lo escalamos y añadimos al grupo
            lad.scale.setTo(3.5,3.5);
            bricks.add(lad);
        }
    }
    bricks.setAll('body.immovable', true);

    //6.Cursores
    cursors = this.game.input.keyboard.createCursorKeys();

    //7.Balas
    playerWeapon = new Movable(this.game, playerPos, 'bullet', 'sound',3, playerVel);
    playerWeapon = this.game.add.weapon(30, 'bullet');
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
    player = new Player(this.game, playerPos, 'player', 'sound', 3, playerVel, cursors, playerWeapon, leftLimit, rightLimit);
    player.scale.setTo(2.5, 2.5);
    this.game.world.addChild(player);
    this.game.physics.enable([player,ball], Phaser.Physics.ARCADE);
    player.body.immovable = true;


    //PowerUps
    powerUps = this.game.add.physicsGroup();
    powerUps.classType = PowerUp;
    

    //Cosas de la pelota
    ball.body.velocity.setTo(ball._velocity._x, ball._velocity._y); //Físicas de la pelota
    ball.body.bounce.setTo(1, 1); //ESTO SIRVE PARA HACER QUE ACELERE
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
    this.game.physics.arcade.overlap(player, powerUps, takePowerUp, null, this);

  },

  //FUNCIONES AUXILIARES
  //Crea un powerUp
  createPowerUp: function(brick, nPowerUp)
  {
    var brickPosition = new Par(brick.x, brick.y)
    var powerUp = new PowerUp(this.game, brickPosition ,'powerUp' + nPowerUp, 'noSund', 1,new Par(0,2), nPowerUp);
    
     //game.world.addChild(powerUp);
     powerUps.add(powerUp);
     powerUp.scale.setTo(2.5, 2.5);
     this.game.physics.enable([powerUp, player], Phaser.Physics.ARCADE);
     powerUp.body.immovable = true;
     powerUp.body.velocity.y = 2;
  },

  //Dropea un powerUp
  dropPowerUp: function(brick)
  {
    var num = Math.random();
    var drop = false;

    var dropChance = 1/3;
    if(num<dropChance)
    drop = true;

    if(drop)
    {
    // this. num = Math.floor(Math.random() * (max - min)) + min;
    drop = false;
    // Seleccionamos así una powerUp random de entre los que hay
   //this.num = Math.floor(Math.random() * (NUM_POWERUPS + 1 - 1)) + 1;
  
   //this.createPowerUp(this.player.x, this.player.y, this.num);
   this.createPowerUp(brick, 1);
    }
  },

  //Detecta las colisones con las balas
  bulletCollisions: function(bullet,obj)
  {
    //Si es un destruible, le quita vida
    if(Object.getPrototypeOf(obj).hasOwnProperty('takeDamage'))
       obj.takeDamage(this);


   bullet.kill();
  },

  //Detecta las colisones con la pelota
  ballCollisions: function(ball, obj)
  {
    this.game.physics.arcade.collide(ball, obj);
      
    //La pelota rebota en algo
     ball.bounce(obj, this);
  }
};


module.exports = PlayScene;


var takePowerUp = function(player, powerUps)
{
  powerUps.destroy();

}


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
function Player(game, position, sprite, sound, lives, velocity, cursors, playerWeapon, leftLimit, rightLimit)
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
}

Player.prototype = Object.create(Movable.prototype);
Player.prototype.constructor = Player;

//Funciones de jugador
Player.prototype.readInput = function() //Mueve el jugador a la izquierda
{
    //Comprobación de cursores de Phaser
    if (this._cursors.left.isDown && this.x >  this._leftLimit + this.offsetX)
    {
        this.x -= 5;
    }
    
    else if (this._cursors.right.isDown && this.x < this._rightLimit - this.offsetX)
    {
        this.x += 5;
    }

    if(this._fireButton.isDown)
    {
        this._playerWeapon.fire();
    }
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

//////////////////////////////////////
//2.2.1.2.CLASE PELOTA
function Ball(game, position, sprite, sound, lives, velocity)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
}

Ball.prototype = Object.create(Movable.prototype);
Ball.prototype.constructor = Ball;

//Funciones de pelota
Ball.prototype.bounce = function(obj, playscene) //Rebota en un objeto "obj2"
{

    //Jugador (rebota)
    if(Object.getPrototypeOf(obj).hasOwnProperty('readInput'))
    {
        //Cambio ligero de dirección
        var angulo = this.game.rnd.integerInRange(-20, 20);
        if(this.body.velocity.y + angulo > 0)
        this.body.velocity.y += angulo;
        if(this.body.velocity.x < 0)
           this.body.velocity.x -= angulo;
        else
          this.body.velocity.x += angulo;

        //Rebote en lado contrario al que se mueve la pelota
        if((this.x > obj.x && this.body.velocity.x < 0) || (this.x < obj.x && this.body.velocity.x > 0))
            this.body.velocity.x = -this.body.velocity.x;
    }

    //Ladrillos (les quita vida)
    else if(obj.constructor === Destroyable)
        obj.takeDamage(playscene);
}

/////////////////////////////////////////
//2.2.1.2.CLASE POWER-UP
function PowerUp(game, position, sprite, sound, lives, velocity, powerUpNo)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
    this._powerUpNo = powerUpNo;
}

PowerUp.prototype = Object.create(Movable.prototype);

PowerUp.prototype.constructor = PowerUp;

PowerUp.prototype.update = function()
{
    //this.x+=this.body.velocity.x;
    this.y+=this.body.velocity.y;

}

