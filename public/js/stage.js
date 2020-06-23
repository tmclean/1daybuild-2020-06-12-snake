function Stage( canvasCtx, settings ) {

    this.settings = settings
    this.grid     = undefined
    this.snake    = undefined
    this.food     = undefined
    this.walls    = []

    this.init = function() {

        this.grid = new Grid(
            canvasCtx,
            this.settings.screenWidth,
            this.settings.screenHeight,
            this.settings.cellWidth,
            this.settings.cellHeight,
            this.settings.gridLineColor,
            this.settings.gridLineWidth,
            this.settings.gridBackgroundColor
        )

        this.grid.draw()

        // Build our walls/obstacles. For now, it's a random set of 5% of the total blocks
        let totalBlocks = this.grid.maxBlockX * this.grid.maxBlockY
        this.generateSnake()

        this.walls = []
        let totalWalls = Math.floor( totalBlocks * this.settings.percentWalls )
        for( let i=0; i<totalWalls; i++ ){
            let wall = undefined
            do {
                let x = Math.floor(Math.random() * this.grid.maxBlockX)
                let y = Math.floor(Math.random() * this.grid.maxBlockY)
                wall = new Block( x, y, this.settings.wallColor )
            }
            while( this.snake.collision( wall ) )

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
            this.food = new Block( x, y, this.settings.foodColor )
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
        //this.grid.draw()

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
