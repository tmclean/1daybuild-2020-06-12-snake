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
define( ['game', 'moves'], function( Game, Moves ) {

    let numCells = 30
    let screenHeight = window.innerHeight
    let screenWidth = 1000

    let aspectRatio = screenHeight / screenWidth
    let numWCells = Math.ceil(numCells / aspectRatio)
    let wCellWidth = screenWidth / numWCells

    let cellDim = Math.ceil(screenHeight / numCells)

    let settings = {
        startingFrameDelay: 200,
        minFrameDelay: 50,
        frameDelayDelta: 5,
        screenWidth: screenWidth,
        screenHeight: screenHeight,
        snakeColor: 'green',
        gridLineColor: '#545454',
        gridBackgroundColor: '#121212',
        cellWidth: wCellWidth,
        cellHeight: cellDim,
        gridLineWidth: 0,
        percentWalls: 0.05,
        wallColor: 'blue',
        foodColor: 'lightgray'
    }
    let canvasEl = document.getElementById("canvas")
    canvasEl.setAttribute("height", "" + screenHeight)
    canvasEl.setAttribute("width", "" + screenWidth)

    window.game = new Game(canvasEl, settings)

    // Event handler for key-down
    this.mapKeyDown = (e) => {
        if (window.game.start) {
            switch (e.key) {
                case 'ArrowRight':
                    window.game.nextMove = Moves.EAST
                    return
                case 'ArrowLeft':
                    window.game.nextMove = Moves.WEST
                    return
                case 'ArrowUp':
                    window.game.nextMove = Moves.NORTH
                    return
                case 'ArrowDown':
                    window.game.nextMove = Moves.SOUTH
                    return
                case ' ':
                    window.game.turbo = true
            }
        } else if (e.key) {
            window.game.reset()
            window.game.start = true
        }
    }

    // Event handler for key-up
    this.mapKeyUp = (e) => {
        if (game.start) {
            switch (e.key) {
                case ' ':
                    game.turbo = false
                    return
            }
        }
    }

    document.onkeydown = mapKeyDown
    document.onkeyup = mapKeyUp

    window.game.run()
})