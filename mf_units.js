


/**************************************************
Unit
 **************************************************/
var Unit = (function () {

    var ct = 0;

    return function (obj) {

        var s = this;

        obj = obj || {};

        // may want id's for all units
        s.id = obj.id || ct + '_' + new Date().getTime();

        // step count
        ct += 1;
        if (ct > 1000) {
            ct = 0;
        }

        // position and size
        s.x = obj.x || -16;
        s.y = obj.y || -16;
        s.w = obj.w || 32;
        s.h = obj.h || 32;

        s.hw = 16;
        s.hh = 16;

        // angle
        s.a = obj.a || 0;
        s.delta = 1;

        // hit points
        s.maxHP = obj.maxHP || 20;
        s.hp = s.maxHP;

        // faction or owner of the unit
        s.faction = obj.faction || 'n'; // default to n for neutral

        // default formating
        s.s = '#ffffff'; // stroke style
        s.f = '#000000'; // fill style
        s.i = 3; // line size

    };

}
    ());

Unit.prototype.step = function () {

    var s = this;

    // normalize this.a
    s.a = _.an(s.a);

    // step x and y by current angle and delta
    s.x += Math.cos(s.a) * s.delta;
    s.y += Math.sin(s.a) * s.delta;

};

/**************************************************
Shot
 **************************************************/
var Shot = function (obj) {

    var s = this;

    Unit.call(s, obj);

    s.delta = 6;

    s.life = 100;
    s.dam = 1;

    // higher max hp
    s.maxHP = 50;
    s.hp = s.maxHP;

    s.w = 4;
    s.h = 4;

    s.fromShip = obj.fromShip || {};

};

Shot.prototype = new Unit();

/**************************************************
Ship
 **************************************************/
// Ship class used for ships of any faction
var Ship = function (obj) {

    var s = this;

    Unit.call(s, obj);

    s.delta = obj.delta || 3;
    s.shots = obj.shots || false;

    s.lastFire = new Date();
    s.fireRate = obj.firRate || 100;

    // false means no target
    s.target = false;
    s.dtt = 0; //distance to target
    s.aDir = 0; // angle direction ()
    s.adt = 0; // angle distance to target.

    s.toTarget = 0;
    s.turnPer = 0; // turn percent
    s.maxTurn = Math.PI / 180 * 10; // max turn per tick
    s.aDelta = 0; // angle delta rate

};

var p = Ship.prototype;

p = new Unit();

// select a random target from the given collection
p.findTarget = function (eShips) {

    // default to no target
    this.target = false;

    if (eShips.units.length > 0) {

        this.target = eShips.units[Math.floor(_.r(eShips.units.length))]

    }

};

p.updateTarget = function () {

    var toTarget;

    if (this.target) {

        this.toTarget = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        // distance to target
        this.dtt = _.d(this.x + this.w, this.y, this.target.x, this.target.y);

        // angle distance to target
        this.adt = _.ad(this.a, this.toTarget);

        // turn percent
        this.turnPer = this.adt / Math.PI;

        // angle delta
        this.aDelta = this.turnPer * this.maxTurn;

    }

};

p.followTarget = function () {

    this.aDir = _.asd(this.a, this.toTarget);

    if (this.aDir === 1) {

        this.a += this.aDelta;

    }

    if (this.aDir === -1) {

        this.a -= this.aDelta;

    }

};

// the ship shoots
p.shoot = function () {

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

    var s = this;

    // step units
    if (s.ai) {
        s.units.forEach(function (h) {

            var d;

            // current one and only AI Script

            // no target? try to get one
            if (!h.target) {

                h.findTarget(s.enemys);

            }

            // got a target? yeah
            if (h.target) {

                h.updateTarget();

                // far away? move to the target
                if (h.dtt > 200) {

                    h.followTarget();

                }

            }

            h.step();

        });

    }

    // step shots
    s.shots.step(function (sh) {

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
    s.purgeDead();

};
