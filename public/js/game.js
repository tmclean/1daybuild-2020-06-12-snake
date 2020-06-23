function Game( canvas, settings ) {

    this.canvasCtx = canvas.getContext('2d')
    this.settings = settings
    this.stage = new Stage( this.canvasCtx, this.settings )

    this.firstRun = true
    this.showSplash = true
    this.start = false

    this.score = 0
    this.nextMove = STILL
    this.turbo = false

    this.run = function() {
        this.reset()
        this.loop()
    }

    this.reset = function() {
        this.nextMove = STILL
        this.score = 0
        this.turbo = false
        this.canvasCtx.clearRect(0, 0, this.settings.screenWidth, this.settings.screenHeight)
        this.stage.init()
    }

    this.loop = function() {
        // Delay decreases with length of snake
        let delay = this.settings.startingFrameDelay -
            (this.settings.frameDelayDelta * (this.stage.snake.segments.length - 1))

        if (delay < this.settings.minFrameDelay) {
            delay = this.settings.minFrameDelay
        }

        if (this.turbo) {
            delay = Math.ceil(delay / 2)
        }

        if (this.showSplash && !this.start) {
            this.canvasCtx.clearRect(0, 0, this.settings.screenWidth, this.settings.screenHeight)
            this.drawSplash()
        }

        if (this.showSplash && !this.stage.snake.alive) {
            this.score = this.stage.snake.segments.length
            this.start = false
        }
        else if (!this.showSplash || this.start) {
            this.firstRun = false;
            this.stage.draw()
            this.stage.snake.changeDirection( this.nextMove )
            this.stage.move()
        }

        setTimeout( () => { this.loop() }, delay )
    }

    this.drawSplash = function() {
        let oldFillStyle = this.canvasCtx.fillStyle
        this.canvasCtx.fillStyle = this.settings.gridBackgroundColor
        this.canvasCtx.fillRect( 0, 0, this.settings.screenWidth, this.settings.screenHeight )
        this.canvasCtx.fillStyle = oldFillStyle

        this.canvasCtx.fillStyle = "white"
        this.canvasCtx.font = "30px Monospace"
        this.canvasCtx.fillText("Controls:", 25, 50, 1000)
        this.canvasCtx.fillText("   Move:  \u2191, \u2192, \u2190, \u2192", 25, 100, 1000)
        this.canvasCtx.fillText("   TURBO: Space", 25, 150, 1000)
        this.canvasCtx.fillText("Press any key to continue...", 25, 250, 1000)
        if (!this.firstRun) {
            this.canvasCtx.fillText("Score: " + this.score, 25, 400, 1000)
        }
        this.start = false
    }
}