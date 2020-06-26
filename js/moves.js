define( ['move' ], function( Move ) {

    let NORTH = new Move( 0, -1 )
    let SOUTH = new Move( 0,  1 )
    NORTH.opposite = SOUTH
    SOUTH.opposite = NORTH

    let EAST  = new Move(  1, 0 )
    let WEST  = new Move( -1, 0 )
    EAST.opposite  = WEST
    WEST.opposite  = EAST

    let STILL = new Move(  0, 0 )
    STILL.opposite = STILL

    return {
        NORTH: NORTH,
        SOUTH: SOUTH,
        EAST: EAST,
        WEST: WEST,
        STILL: STILL
    }
})