define( ['grid', 'snake', 'moves', 'block'], function( Grid, Snake, Moves, Block ) {

    return function Stage( canvasCtx, settings ) {

        let grid = new Grid(
            canvasCtx,
            settings.screenWidth,
            settings.screenHeight,
            settings.cellWidth,
            settings.cellHeight,
            settings.gridLineColor,
            settings.gridLineWidth,
            settings.gridBackgroundColor
        )

        return {
            settings: settings,
            grid: grid,
            snake: undefined,
            food: undefined,
            walls: [],

            init: function () {

                this.grid.draw()

                this.generateSnake()

                // Build our walls/obstacles. For now, it's a random set of 5% of the total blocks
                this.walls = []
                let totalBlocks = this.grid.getMaxBlockX() * this.grid.getMaxBlockY()
                let totalWalls = Math.floor(totalBlocks * this.settings.percentWalls)
                for (let i = 0; i < totalWalls; i++) {
                    let wall = undefined
                    do {
                        let x = Math.floor(Math.random() * this.grid.maxBlockX)
                        let y = Math.floor(Math.random() * this.grid.maxBlockY)
                        wall = new Block(x, y, this.settings.wallColor)
                    }
                    while (this.snake.collision(wall))

                    this.walls.push(wall)
                }
                this.generateNextFood()
            },

            // Generate the snake
            generateSnake: function () {
                // Keep trying new snakes until we get one that doesn't spawn on a wall or food
                do {
                    let x = Math.floor(Math.random() * this.grid.maxBlockX)
                    let y = Math.floor(Math.random() * this.grid.maxBlockY)
                    this.snake = new Snake(x, y, this.settings.snakeColor, Moves.STILL, this.grid )
                }
                while (
                    this.isSnakeOnFood() ||
                    !this.isBlockUsable(this.snake.getHead())
                )
            },

            // Make the first food item
            generateNextFood: function () {
                let lastFood = this.food

                // Make sure it doesn't collide with a wall, the snake, or the last food item, if any
                do {
                    let x = Math.floor(Math.random() * this.grid.maxBlockX)
                    let y = Math.floor(Math.random() * this.grid.maxBlockY)
                    this.food = new Block(x, y, this.settings.foodColor)
                }
                while (
                    (lastFood !== undefined && this.food.collision(lastFood)) ||
                    !this.isBlockUsable(this.food)
                )
            },

            isBlockUsable: function (f) {

                if (this.isOnWall(f)) {
                    return false
                }

                let foodN = f.clone()
                let foodS = f.clone()
                let foodE = f.clone()
                let foodW = f.clone()

                foodN.move(this.grid, Moves.NORTH)
                foodS.move(this.grid, Moves.SOUTH)
                foodE.move(this.grid, Moves.EAST)
                foodW.move(this.grid, Moves.WEST)

                let nInvalid = this.ringOut(foodN) || this.isOnWall(foodN)
                let sInvalid = this.ringOut(foodS) || this.isOnWall(foodS)
                let eInvalid = this.ringOut(foodE) || this.isOnWall(foodE)
                let wInvalid = this.ringOut(foodW) || this.isOnWall(foodW)

                let invalidBlocks = 0
                if (nInvalid) {
                    invalidBlocks++
                }
                if (sInvalid) {
                    invalidBlocks++
                }
                if (eInvalid) {
                    invalidBlocks++
                }
                if (wInvalid) {
                    invalidBlocks++
                }

                return invalidBlocks <= 2
            },

            draw: function () {

                // Render the grid
                //this.grid.draw()

                // Make the food, if there is any yet
                if (this.hasFood()) {
                    this.grid.drawBlock(this.food)
                }

                // Render the walls/obstacles
                for (let i = 0; i < this.walls.length; i++) {
                    this.grid.drawBlock(this.walls[i])
                }

                // Render the snake
                // this.snake.draw()
            },

            move: function () {
                // Make a new head to check for collisions
                let nextHead = this.snake.getNextHead()

                // If we will hit a wall in the current move, the snake now dead
                if (this.ringOut(nextHead) || this.isOnWall(nextHead)) {
                    this.snake.alive = false
                } else {
                    // The snake will be alive after applying this move

                    let grow = false

                    // If the current move ends with the snake on food,
                    // it eats and grows 1 block
                    if (this.isSnakeOnFood()) {
                        grow = true
                        // Make new food now that it has been eaten
                        this.generateNextFood()
                    }

                    // Apply the move to the snake
                    this.snake.move(grow)
                }
            },

            // Detect if the snake is out of bounds, if so, it's now dead
            ringOut: function (destination) {
                if ((destination.x < 0 || destination.x > this.grid.maxBlockX - 1) ||
                    (destination.y < 0 || destination.y > this.grid.maxBlockY - 1)
                ) {
                    return true;
                }
            },

            // Check if the snake is on food
            isSnakeOnFood: function () {
                if (!this.snake) {
                    // If there's no snake, it can't eat
                    return false
                } else if (!this.food) {
                    // if there's no food, there's nothing to eat
                    return false;
                } else {
                    // Check for collision with current food and snake
                    return this.snake.collision(this.food)
                }
            },

            // Check if the given block is on any walls/obstacles
            isOnWall: function (block) {
                for (let i = 0; i < this.walls.length; i++) {
                    if (this.walls[i].collision(block)) {
                        return true
                    }
                }

                return false;
            },

            // Check if we have food set up
            hasFood: function () {
                return this.food !== undefined
            }
        }
    }
})
