

var du = new Unit(); // default unit

_.l(du); // a default unit has certain default values

// set initial values for a unit


var pl = new Unit({

        faction : 'p', // owned by faction 'p'
        x : 220,
        y : 140,
        w : 64,
        h : 64

    });

_.l(pl); // looking good


var someUnits = new UnitCollection({

        units : [

            new Unit({
                x : 100,
                y : 230
            }),
            new Unit({
                x : 220,
                y : 140
            })

        ],
        max : 50

    });

 // returns the unit in the collection that collides with the given unit
console.log(someUnits.collidesWith(pl));
