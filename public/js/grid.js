function Grid( canvasCtx, gridWidth, gridHeight, cellWidth, cellHeight, gridLineColor, gridLineWidth, gridBackgroundColor ) {

    this.canvasCtx     = canvasCtx
    this.cellWidth     = cellWidth
    this.cellHeight    = cellHeight
    this.gridWidth     = gridWidth
    this.gridHeight    = gridHeight
    this.gridLineColor = gridLineColor
    this.gridLineWidth = gridLineWidth
    this.gridBackgroundColor = gridBackgroundColor

    this.maxBlockX = this.gridWidth/this.cellWidth
    this.maxBlockY = this.gridHeight/this.cellHeight

    // Draw the grid lines
    this.draw = function(){
        let oldFillStyle = this.canvasCtx.fillStyle
        this.canvasCtx.fillStyle = this.gridBackgroundColor
        this.canvasCtx.fillRect( 0, 0, this.gridWidth, this.gridHeight )
        this.canvasCtx.fillStyle = oldFillStyle

        if( this.gridLineWidth > 0 ) {
            for (let x = 0; x < this.gridWidth; x += this.cellWidth) {
                this.drawGridLine(x, 0, x, this.gridHeight)
            }

            for (let y = 0; y < this.gridHeight; y += this.cellHeight) {
                this.drawGridLine(0, y, this.gridWidth, y)
            }
        }
    }

    // Draw a single grid line
    this.drawGridLine = function( x1, y1, x2, y2 ) {
        let oldWidth = this.canvasCtx.lineWidth
        this.canvasCtx.beginPath()
        this.canvasCtx.lineWidth = this.gridLineWidth
        this.canvasCtx.strokeStyle = this.gridLineColor
        this.canvasCtx.moveTo( x1, y1 )
        this.canvasCtx.lineTo( x2, y2 )
        this.canvasCtx.stroke()
        this.canvasCtx.lineWidth = oldWidth
    }

    // Fill a given block at the block coordinates (not pixel coordinates)
    // with the given color
    this.fillBlock = function( bX, bY, color ) {
        let oldFillStyle = this.canvasCtx.fillStyle
        this.canvasCtx.fillStyle = color

        this.canvasCtx.fillRect(
            Math.floor((bX*this.cellWidth)+this.gridLineWidth ),
            Math.floor((bY*this.cellHeight)+this.gridLineWidth ),
            Math.ceil(this.cellWidth-(this.gridLineWidth*2)),
            Math.ceil(this.cellHeight-(this.gridLineWidth*2))
        )

        this.canvasCtx.fillStyle = oldFillStyle
    }

    this.clearBlock = function( block ) {
        this.fillBlock( block.x, block.y, this.gridBackgroundColor )
    }

    // Fill the given block on the grid.
    // Optionally override the color with the one given
    this.drawBlock = function( block, color ) {
        this.fillBlock( block.x, block.y, color === undefined ? block.color : color )
    }
}
