


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

    // angle
    this.a = obj.a || 0;
    this.delta = 1;

    // hit points
    this.maxHP = obj.maxHP || 100;
    this.hp = this.maxHP;

    // faction or owner of the unit
    this.faction = obj.faction || 'n'; // default to n for neutral

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
    this.damage = 1;

};

Shot.prototype = new Unit();

/**************************************************
Ship
 **************************************************/
// Ship class used for ships of any faction
var Ship = function (obj) {

    Unit.call(this, obj);

    this.delta = 5;

};

Ship.prototype = new Unit();

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

ShotCollection.prototype.step = function () {

    var i = this.units.length,
    sh;
    while (i--) {

        sh = this.units[i];

        sh.step();

        sh.hp -= 1;

        if (sh.hp < 0) {

            sh.hp = 0;
        }

    }

    this.purgeDead();

};

/**************************************************
ShipCollection
 **************************************************/
var ShipCollection = function (obj) {

    obj = obj || {};

    UnitCollection.call(this, obj);

    // give a ref to the enemy ship collection, or else there will not be one
    this.enemys = obj.enemys || {
        units : [],
        max : 0
    };

    // each shipCollection also has a collection of there shots
    this.shots = new ShotCollection();

};
