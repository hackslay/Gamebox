//JS based on phaser
var scaleRatio = window.devicePixelRatio / 3;
var game = new Phaser.Game(
      380, 640, 
      Phaser.AUTO, 'gameArea', 
      { preload: preload, create: create, update: update, render: render }
    );

var ballSprite;
var arrowSprite;
var platform;
var mouseDownPosition = {};
var mdragged = false;
var initialV = 0;

function preload(){
  game.stage.backgroundColor = '#85b5e1';
  game.load.image('analog', 'sprites/fusia.png');
  game.load.image('arrow', 'sprites/arrow.png');
  game.load.image('ball', 'sprites/ball.png');
  game.load.image('platform', 'sprites/table.png');
  game.load.image('crosshair', 'sprites/crosshair.png');
  game.load.image('cup', 'sprites/cup.png');

  //  Load our physics data exported from PhysicsEditor
  game.load.physics('physicsData', 'js/phaser/assets/sprites.json');
}

function create() {
    

    // Enable Box2D physics
    game.physics.startSystem(Phaser.Physics.BOX2D);
    //game.physics.box2d.setBoundsToWorld();
    game.physics.box2d.restitution = 0.5;
    game.physics.box2d.gravity.y = 500;

    getPlatform();
    
    getArrow();
    getBall();
    
    getCup();

    // Set up handlers for mouse events
    game.input.onDown.add(mouseDragStart, this);
    game.input.addMoveCallback(mouseDragMove, this);
    game.input.onUp.add(mouseDragEnd, this);
    

}

function mouseDragStart() {
	
    ballReset();
	ballSprite.body.gravityScale = 0;
	ballSprite.body.velocity.x = 0;
	ballSprite.body.velocity.y = 0;
	ballSprite.body.angularVelocity = 0;
	
    mouseDownPosition.x = game.input.mousePointer.position.x;
    mouseDownPosition.y = game.input.mousePointer.position.y;
	arrowSprite.alpha = 0.5;
    mdragged = true;
    initialV = 0;
    getCupClear();
    getPlatformClear();
	mouseDragMove();
    
}

function mouseDragMove() {
	
	if ( mouseDownPosition == null )
		return;  
    
    var mouseNowPosition = game.input.mousePointer.position;

    var dx = mouseNowPosition.x - mouseDownPosition.x;
    var dy = mouseNowPosition.y - mouseDownPosition.y;
    var length = Math.sqrt( dx*dx + dy*dy );
    
    arrowSprite.scale.set(length * 0.05, 0.5);
    arrowSprite.rotation = Math.atan2( -dy, -dx );
    
    
}

function mouseDragEnd() {

    //checks if mouse has been dragged
    if (mdragged){
        var mouseNowPosition = game.input.mousePointer.position;
        var dx = mouseNowPosition.x - mouseDownPosition.x;
        var dy = mouseNowPosition.y - mouseDownPosition.y;
        
        ballSprite.body.gravityScale = 1;
        ballSprite.body.velocity.x = -dx * 6;
        ballSprite.body.velocity.y = -dy * 6;

        
        
        initialV = dy * 7;
        if ( initialV > 650 ){
            tweenBall(initialV, 0.2);
        }
        else{
            tweenBall(initialV, 0.5);
            //add bounds to cup after a few seconds
            game.time.events.add(Phaser.Timer.SECOND * 1.4, getCupPolygon, this);
            
        }
        
        
    }

    mdragged = false;
	arrowSprite.alpha = 0;
	mouseDownPosition = {};
    
    
}
function getPlatform(){
    // Static platform 
    platform = game.add.sprite(game.world.centerX, 530 , 'platform');
    game.physics.box2d.enable(platform);
    platform.body.clearFixtures();
    platform.body.static = true;
    //platform.body.loadPolygon('physicsData', 'platform', platform);
}
function getPlatformPolygon(){
    
}
function getPlatformClear(){
    platform.body.clearFixtures();
}
function getBall(){
    ballSprite = game.add.sprite(game.world.centerX, 550, 'ball');
    
    game.physics.box2d.enable(ballSprite);
    ballSprite.body.collideWorldBounds = false;
    ballSprite.body.setCircle(ballSprite.width / 2);
    ballSprite.body.gravityScale = 0;
}
function getCup(){
    cup = game.add.sprite(game.world.centerX, 400, 'cup');
    game.physics.box2d.enable(cup);
    cup.body.static = true;
    cup.body.clearFixtures();
    
}

function getCupPolygon(){
    cup.body.loadPolygon('physicsData', 'cup', cup);
}
function getCupClear(){
    cup.body.clearFixtures();
}
function getArrow(){
    // Arrow sprite for aiming
	arrowSprite = game.add.sprite(game.world.centerX, 550, 'arrow');
	arrowSprite.anchor.set(0,0.5);
	arrowSprite.alpha = 0;
}

function tweenBall(initialV, tweenScale){
    game.add.tween(ballSprite.scale).to( { x: tweenScale, y: tweenScale }, 1200000/initialV, Phaser.Easing.Linear.None, true);
}

function update(){
    ballSprite.body.setCircle( ballSprite.width / 2 );
}

function ballReset(){
    ballSprite.destroy();
    getBall();
}


function render(){
    var Vy = ballSprite.body.velocity.y; 
    game.debug.box2dWorld();
    game.debug.text( "ShrinkBall Speed: " + 1200000/(Math.abs(initialV)) , 10, 10 );
    game.debug.text( "BallWidth: " + ballSprite.width , 10, 30 );
    game.debug.text( "Vy: " + Math.abs(Vy) , 10, 65 );
    game.debug.text( "Initial Velocity (Z): " + Math.abs(initialV) , 10, 50 );
    
    
}