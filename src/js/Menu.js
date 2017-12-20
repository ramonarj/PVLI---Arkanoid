'use strict'

var Menu = 
{
    fondoMenu:null,
    cursors:null,
    selector:null,
    enterButton:null,
    eleccion:null,

    create: function()
    {
        this.eleccion=0;
        this.fondoMenu = new Phaser.Image(this.game, 0, 0, 'menu');
        this.game.world.addChild(this.fondoMenu);
        this.selector = new Phaser.Image(this.game, 275, 320 , 'cursor');
        this.game.world.addChild(this.selector);

        this.enterButton = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
        this.cursors = this.game.input.keyboard.createCursorKeys();
    },

    update:function()
    {
        this.takeInput();
    },

    takeInput:function()
    {
        if(this.enterButton.isDown)
            this.game.state.start('play');
        else if (this.eleccion == 0 && this.cursors.down.isDown)
        {
            this.selector.y+=50;
            this.eleccion=1;
        }
        else if (this.eleccion == 1 && this.cursors.up.isDown)
        {
            this.selector.y-=50;
            this.eleccion=0;
        }
            
    }
};

module.exports = Menu;