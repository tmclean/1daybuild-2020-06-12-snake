/*
 * Snake game build on HTML5 canvas on pure JS
 *
 * To Do
 * - Ensure generating a sane stage conditions
 *    - Generate walls that allow for reaching some high % of map
 *       - Pick random block where we will place the snake
 *       - Generate random walls
 *       - Flood fill from that point
 *       - If < %, regenerate walls
 *    - Spawn food that is both reachable and escapable
 *       - The snake should always be able to the food
 *       - Once the snake eats the food, it must not be trapped
 *
 */

const canvas = document.getElementById( 'canvas' )
const ctx = canvas.getContext( '2d' )

let stage = undefined

let settings = {
    startingFrameDelay: 200,
    minFrameDelay: 50,
    frameDelayDelta: 5,
    screenWidth: 1000,
    screenHeight: 1000,
    snakeColor: 'orange',
    gridLineColor: 'white',
    cellWidth: 15,
    cellHeight: 15,
    gridLineWidth: 0.5,
    percentWalls: 0.05,
    wallColor: 'blue'
}

function Move( xOffset, yOffset ){
    this.xOffset = xOffset
    this.yOffset = yOffset
    this.opposite = undefined
}

let NORTH = new Move(  0,-1 )
let SOUTH = new Move(  0, 1 )
NORTH.opposite = SOUTH
SOUTH.opposite = NORTH

let EAST  = new Move(  1, 0 )
let WEST  = new Move( -1, 0 )
EAST.opposite  = WEST
WEST.opposite  = EAST

let STILL = new Move(  0, 0 )
STILL.opposite = STILL

function Block( x, y, color ) {
    this.x = x
    this.y = y
    this.color = color

    this.move = function( grid, move ){
        this.x += move.xOffset
        this.y += move.yOffset
    }

    this.clone = function() {
        return new Block( this.x, this.y, color )
    }

    this.collision = function( otherBlock ) {
        return otherBlock.x === this.x && otherBlock.y === this.y
    }
}

function Snake( x, y, color, direction, grid ){
    this.grid = grid
    this.direction = direction
    this.alive = true
    this.segments = [ new Block( x, y, color ) ]

    this.changeDirection = function( newDirection ) {
        if( newDirection !== this.direction.opposite ){
            this.direction = newDirection
        }
    }

    // Move the snake 1 block in the current direction. If grow
    // is true, make the make 1 block longer in the process
    this.move = function( grow ) {
        if( !this.alive ) {
            // ded sneks don't move
            return
        }

        // Make a new head 1 block in the current direction
        // This makes the snake 1 block longer
        let nextHead = this.getNextHead()
        this.segments.push( nextHead )

        if( !grow ){
            // If we are not growing, remove the tail block
            this.segments.shift()
        }

        if( this.bitSelf() ){
            // Ouch
            this.alive = false
        }
    }

    this.bitSelf = function() {
        // Check the head against all other body segments, if it overlaps
        // any of them, we bit ourself
        let head = this.getHead()
        for( let i=0; i<this.segments.length; i++ ) {
            let seg = this.segments[i]
            if (seg !== head && this.collision( seg ) ) {
                return true
            }
        }
        return false
    }

    // Generates a new block 1 block in the direction of the current head
    this.getNextHead = function() {
        let head = this.getHead().clone()
        head.move( this.grid, this.direction )
        return head
    }

    // Get a reference to the current head
    this.getHead = function() {
        return this.segments[this.segments.length-1]
    }

    // Draw all segments to the grid
    this.draw = function() {
        for (let i = 0; i < this.segments.length; i++) {
            this.grid.drawBlock(this.segments[i], this.alive ? this.segments[i].color : "gray" )
        }
    }

    // Check if the head overlaps a given block
    this.collision = function( block ){
        let head = this.getHead()
        return head.collision( block )
    }
}

function Grid( ctx, gridWidth, gridHeight, cellWidth, cellHeight, gridLineColor, gridLineWidth ) {

    this.ctx           = ctx
    this.cellWidth     = cellWidth
    this.cellHeight    = cellHeight
    this.gridWidth     = gridWidth
    this.gridHeight    = gridHeight
    this.gridLineColor = gridLineColor
    this.gridLineWidth = gridLineWidth

    this.maxBlockX = this.gridWidth/this.cellWidth
    this.maxBlockY = this.gridHeight/this.cellHeight

    // Draw the grid lines
    this.draw = function(){
        for( let x=0; x<this.gridWidth; x+=this.cellWidth ){
            this.drawGridLine( x, 0, x, this.gridHeight )
        }

        for( let y=0; y<this.gridHeight; y+=this.cellHeight) {
            this.drawGridLine( 0, y, this.gridWidth, y )
        }
    }

    // Draw a single grid line
    this.drawGridLine = function( x1, y1, x2, y2 ) {
        let oldWidth = this.ctx.lineWidth
        this.ctx.beginPath()
        this.ctx.lineWidth = this.gridLineWidth
        this.ctx.strokeStyle = this.gridLineColor
        this.ctx.moveTo( x1, y1 )
        this.ctx.lineTo( x2, y2 )
        this.ctx.stroke()
        this.ctx.lineWidth = oldWidth
    }

    // Fill a given block at the block coordinates (not pixel coordinates)
    // with the given color
    this.fillBlock = function( bX, bY, color ) {
        let oldFillStyle = this.ctx.fillStyle
        this.ctx.fillStyle = color
        this.ctx.fillRect( bX*this.cellWidth, bY*this.cellHeight, this.cellWidth, this.cellHeight )
        this.ctx.fillStyle = oldFillStyle
    }

    // Fill the given block on the grid.
    // Optionally override the color with the one given
    this.drawBlock = function( block, color ) {
        this.fillBlock( block.x, block.y, color === undefined ? block.color : color )
    }
}

function Stage( ctx, settings ) {

    this.settings = settings
    this.grid     = undefined
    this.snake    = undefined
    this.food     = undefined
    this.walls    = []

    this.init = function() {

        this.grid = new Grid(
            ctx,
            this.settings.screenWidth,
            this.settings.screenHeight,
            this.settings.cellWidth,
            this.settings.cellHeight,
            this.settings.gridLineColor,
            this.settings.gridLineWidth
        )

        // Build our walls/obstacles. For now, it's a random set of 5% of the total blocks
        let totalBlocks = this.grid.maxBlockX * this.grid.maxBlockY
        this.generateSnake()
        let totalWalls = Math.floor( totalBlocks * this.settings.percentWalls )
        for( let i=0; i<totalWalls; i++ ){
            let wall = undefined
            do {
                let x = Math.floor(Math.random() * this.grid.maxBlockX)
                let y = Math.floor(Math.random() * this.grid.maxBlockY)
                wall = new Block( x, y, this.settings.wallColor )
            }
            while( this.snake.collision( wall ) );
            this.walls.push( wall )
        }
        this.generateNextFood()
    }

    // Generate the snake
    this.generateSnake = function() {
        // Keep trying new snakes until we get one that doesn't spawn on a wall or food
        do{
            let x = Math.floor( Math.random() * this.grid.maxBlockX )
            let y = Math.floor( Math.random() * this.grid.maxBlockY )
            this.snake = new Snake( x, y, this.settings.snakeColor, STILL, this.grid )
        }
        while(
            this.isSnakeOnFood() ||
            !this.isBlockUsable( this.snake.getHead() )
        )
    }

    // Make the first food item
    this.generateNextFood = function() {
        let lastFood = this.food

        // Make sure it doesn't collide with a wall, the snake, or the last food item, if any
        do  {
            let x = Math.floor( Math.random() * this.grid.maxBlockX )
            let y = Math.floor( Math.random() * this.grid.maxBlockY )
            this.food = new Block( x, y, 'white' )
        }
        while(
            (lastFood !== undefined && this.food.collision( lastFood )) ||
            !this.isBlockUsable( this.food )
        )
    }

    this.isBlockUsable = function( f ) {

        if( this.isOnWall( f ) ) {
            return false
        }

        let foodN = f.clone()
        let foodS = f.clone()
        let foodE = f.clone()
        let foodW = f.clone()
        foodN.move( this.grid, NORTH )
        foodS.move( this.grid, SOUTH )
        foodE.move( this.grid, EAST  )
        foodW.move( this.grid, WEST  )

        let nInvalid = this.ringOut( foodN ) || this.isOnWall( foodN )
        let sInvalid = this.ringOut( foodS ) || this.isOnWall( foodS )
        let eInvalid = this.ringOut( foodE ) || this.isOnWall( foodE )
        let wInvalid = this.ringOut( foodW ) || this.isOnWall( foodW )

        let invalidBlocks = 0
        if( nInvalid ) {
            invalidBlocks++
        }
        if( sInvalid ){
            invalidBlocks++
        }
        if( eInvalid ){
            invalidBlocks++
        }
        if( wInvalid ){
            invalidBlocks++
        }

        return invalidBlocks <= 2
    }

    this.draw = function() {

        // Render the grid
        this.grid.draw()

        // Make the food, if there is any yet
        if( this.hasFood() ) {
            this.grid.drawBlock( this.food )
        }

        // Render the walls/obstacles
        for( let i=0; i<this.walls.length; i++ ){
            this.grid.drawBlock( this.walls[i] )
        }

        // Render the snake
        this.snake.draw()
    }

    this.move = function() {
        // Make a new head to check for collisions
        let nextHead = this.snake.getNextHead()

        // If we will hit a wall in the current move, the snake now dead
        if( this.ringOut( nextHead ) || this.isOnWall( nextHead ) ) {
            this.snake.alive = false
        }
        else {
            // The snake will be alive after applying this move

            let grow = false

            // If the current move ends with the snake on food,
            // it eats and grows 1 block
            if( this.isSnakeOnFood() ) {
                grow = true
                // Make new food now that it has been eaten
                this.generateNextFood()
            }

            // Apply the move to the snake
            this.snake.move( grow )
        }
    }

    // Detect if the snake is out of bounds, if so, it's now dead
    this.ringOut = function( destination ) {
        if( (destination.x < 0 || destination.x > this.grid.maxBlockX-1) ||
            (destination.y < 0 || destination.y > this.grid.maxBlockY-1)
        ){
            return true;
        }
    }

    // Check if the snake is on food
    this.isSnakeOnFood = function() {
        if( !this.snake ){
            // If there's no snake, it can't eat
            return false
        }
        else if( !this.food ){
            // if there's no food, there's nothing to eat
            return false;
        }
        else {
            // Check for collision with current food and snake
            return this.snake.collision( this.food )
        }
    }

    // Check if the given block is on any walls/obstacles
    this.isOnWall = function( block ) {
        for( let i=0; i<this.walls.length; i++ ){
            if( this.walls[i].collision( block ) ) {
                return true
            }
        }

        return false;
    }

    // Check if we have food set up
    this.hasFood = function() {
        return this.food !== undefined
    }
}

let start = false
let nextMove = STILL

// Event handler for key-down
function mapKeyDown( e ) {
    if (start) {
        switch (e.key) {
            case 'ArrowRight':
                nextMove = EAST
                return
            case 'ArrowLeft':
                nextMove = WEST
                return
            case 'ArrowUp':
                nextMove = NORTH
                return
            case 'ArrowDown':
                nextMove = SOUTH
                return
            case ' ':
                turbo = true
        }
    } else if (e.key) {
        start = true
    }
}

// Event handler for key-up
function mapKeyUp( e ) {
    if (start) {
        switch (e.key) {
            case ' ':
                turbo = false
                return
        }
    }
}

document.onkeydown = mapKeyDown
document.onkeyup   = mapKeyUp

// Clear and redraw the scene
function drawFrame( ctx ) {
    ctx.clearRect( 0, 0, settings.screenWidth, settings.screenHeight )
    stage.draw()
}

function loop() {
    // Delay decreases with length of snake
    let delay = settings.startingFrameDelay - (settings.frameDelayDelta * (stage.snake.segments.length - 1))
    if (delay < settings.minFrameDelay) {
        delay = settings.minFrameDelay
    }

    if( turbo ) {
        delay = Math.ceil( delay / 2 )
    }

    if( showSplash && !start ){
        ctx.clearRect( 0, 0, settings.screenWidth, settings.screenHeight )
        drawSplash( ctx )
    }

    // If the snake is dead, reset
    if( showSplash && !stage.snake.alive ) {
        score = stage.snake.segments.length
        init()
        start = false
    }
    else if( !showSplash || start ) {
        firstRun = false;
        stage.snake.changeDirection( nextMove )
        stage.move()
        drawFrame( ctx )
    }

    setTimeout( loop, delay )
}

function drawSplash( ctx ) {
    ctx.fillStyle = "white"
    ctx.font = "30px Monospace"
    ctx.fillText( "Controls:",                               25, 50,  1000 )
    ctx.fillText( "   Move:  \u2191, \u2192, \u2190, \u2192",25, 100, 1000 )
    ctx.fillText( "   TURBO: Space",                         25, 150, 1000 )
    ctx.fillText( "Press any key to continue...",            25, 250, 1000 )
    if( !firstRun ){
        ctx.fillText( "Score: " + score, 25, 400, 1000 )
    }
}

let firstRun = true
let score = 0
let showSplash = true
let turbo = false

function init() {
    stage = new Stage(ctx, settings)
    stage.init()
}

init()
loop()
