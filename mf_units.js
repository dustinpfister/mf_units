


/**************************************************
Unit
 **************************************************/
var Unit = function (obj) {

    obj = obj || {};

    // position and size
    this.x = obj.x || -16;
    this.y = obj.y || -16;
    this.w = obj.w || 32;
    this.h = obj.h || 32;

    this.hw = 16;
    this.hh = 16;

    // angle
    this.a = obj.a || 0;
    this.delta = 1;

    // hit points
    this.maxHP = obj.maxHP || 20;
    this.hp = this.maxHP;

    // faction or owner of the unit
    this.faction = obj.faction || 'n'; // default to n for neutral

    // default formating
    this.s = '#ffffff'; // stroke style
    this.f = '#000000'; // fill style
    this.i = 3; //

};

Unit.prototype.step = function () {

    this.x += Math.cos(this.a) * this.delta;
    this.y += Math.sin(this.a) * this.delta;

};

/**************************************************
Shot
 **************************************************/
var Shot = function (obj) {

    Unit.call(this, obj);

    this.delta = 6;

    this.life = 100;
    this.dam = 1;

    // higher max hp
    this.maxHP = 50;
    this.hp = this.maxHP;

    this.w = 4;
    this.h = 4;

    this.fromShip = obj.fromShip || {};

};

Shot.prototype = new Unit();

/**************************************************
Ship
 **************************************************/
// Ship class used for ships of any faction
var Ship = function (obj) {

    Unit.call(this, obj);

    this.delta = 3;
    this.shots = obj.shots || false;

    this.lastFire = new Date();
    this.fireRate = obj.firRate || 100;

    // false means no target
    this.target = false;
    this.dtt = 0; //distance to target
    this.aDir = 0; // angle direction ()
    this.adt = 0; // angle distance to target.

    this.turnPer = 0; // turn percent
    this.maxTurn = Math.PI / 180 * 30; // max turn per tick
    this.aDelta = 0; // angle delta rate

};

Ship.prototype = new Unit();

// select a random target from the given collection
Ship.prototype.findTarget = function (eShips) {

    // default to no target
    this.target = false;

    if (eShips.units.length > 0) {

        this.target = eShips.units[Math.floor(_.r(eShips.units.length))]

    }

};

// the ship shoots
Ship.prototype.shoot = function () {

    var now = new Date();

    if (this.shots) {

        if (now - this.lastFire >= this.fireRate) {

            this.shots.add(new Shot({

                    x : this.x + this.w / 2,
                    y : this.y + this.h / 2,
                    a : this.a,
                    fromShip : this
                }));

            this.lastFire = now;

        }

    }

};

/**************************************************
UnitCollection
 **************************************************/
var UnitCollection = function (obj) {

    obj = obj || {};

    this.units = obj.units || [];
    this.max = 10;

};

// check if the given unit collides with any unit in the collection, if so return that
// unit from the collection
UnitCollection.prototype.collidesWith = function (unit) {

    var i = this.units.length;
    while (i--) {

        if (_.b(this.units[i], unit)) {

            return this.units[i];

        }

    }

    return false;
};

// purge all units that have an hp value of 0 or lower
UnitCollection.prototype.purgeDead = function () {

    var i = this.units.length;
    while (i--) {

        if (this.units[i].hp <= 0) {

            // purge
            this.units.splice(i, 1);

        }

    }

};

// push in a new unit if we have not reached the max
UnitCollection.prototype.add = function (unit) {

    unit = unit || new Unit();

    if (this.units.length < this.max) {

        this.units.push(unit);

    }

};

/**************************************************
ShotCollection
 **************************************************/
// Shot Collection
var ShotCollection = function (obj) {

    obj = obj || {};

    UnitCollection.call(this, obj);
    this.max = 50;

};

ShotCollection.prototype = new UnitCollection();

ShotCollection.prototype.step = function (fe) {

    var i = this.units.length,
    sh;

    fe = fe || function () {};
    while (i--) {

        sh = this.units[i];

        sh.step();

        sh.hp -= 1;

        if (sh.hp < 0) {

            sh.hp = 0;
        }

        fe(sh);

    }

    this.purgeDead();

};

/**************************************************
ShipCollection
 **************************************************/
var ShipCollection = function (obj) {

    obj = obj || {};

    UnitCollection.call(this, obj);

    this.faction = obj.faction || 'n';

    this.ai = obj.ai || false;

    // give a ref to the enemy ship collection, or else there will not be one
    this.enemys = obj.enemys || {
        units : [],
        max : 0
    };

    // each shipCollection also has a collection of there shots
    this.shots = new ShotCollection();

};

ShipCollection.prototype = new UnitCollection();

ShipCollection.prototype.addShip = function (obj) {

    obj = obj || {}

    // always set ship faction to the collection
    obj.faction = this.faction;

    // ref to this collections shot array
    obj.shots = this.shots;

    // make sure the unit being added is a Ship, and not just a plain old Unit
    this.add(new Ship(obj));

};

ShipCollection.prototype.update = function (obj) {

    var self = this;

    // step units
    if (this.ai) {
        this.units.forEach(function (ship) {

            var d;

            // current one and only AI Script

            ship.delta = 2;

            //ship.a += _.r( - .1, .1)
            //ship.a = Math.PI*1.5;

            // no target? try to get one
            if (!ship.target) {

                ship.findTarget(self.enemys);

            }

            // got a target? yeah
            if (ship.target) {

                var toTarget = Math.atan2(ship.target.y - ship.y, ship.target.x - ship.x);
                // distance to target
                ship.dtt = _.d(ship.x + ship.w, ship.y, ship.target.x, ship.target.y);

                // angle distance to target
                ship.adt = _.ad(ship.a, toTarget);

                // turn percent
                ship.turnPer = ship.adt / Math.PI;

                // angle delta
                ship.aDelta = ship.turnPer * ship.maxTurn;

                // far away? move to the target
                if (ship.dtt > 100) {

                    // -1 or 1
                    ship.aDir = _.asd(ship.a, toTarget);

                    if (ship.aDir === 1) {

                        //ship.a += Math.PI / 100;
                        //ship.a += ship.adt;
                        ship.a += ship.aDelta;

                    }

                    if (ship.aDir === -1) {

                        //ship.a -= Math.PI / 100;
                        //ship.a -= ship.adt;
                        ship.a -= ship.aDelta;

                    }

                }

            }

            ship.step();

        });

    }

    // step shots
    this.shots.step(function (sh) {

        var es = self.enemys,
        i = es.units.length,
        e;

        // check to see if we hit any enemys
        if (i > 0) {
            while (i--) {

                e = es.units[i];

                if (_.b(sh, e)) {

                    sh.hp = 0;

                    e.hp -= sh.dam;

                    // if the enemy has been killed
                    if (e.hp <= 0) {

                        // set target back to false.
                        sh.fromShip.target = false;

                    }

                }

            }

        }

    });

    // purge dead units
    this.purgeDead();

};
