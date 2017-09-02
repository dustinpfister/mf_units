/*
 *
 *    mf_shell.js
 *    "It all starts with a nice shell."
 *
 */

var _ = (function () {

    // PI*2
    var tau = Math.PI * 2,

    // used for log once _.lo
    log = true;

    // public api
    return {

        // random number wrap
        r : function (l, h) {

            l = l || 1;

            if (h === undefined) {

                return Math.random() * l;

            }

            //return Math.random() * (h - l) + l;
            return this.r(h - l) + l;

        },

        // why mathematical modulo?
        // http://javascript.about.com/od/problemsolving/a/modulobug.htm
        // https://stackoverflow.com/questions/4467539/javascript-modulo-not-behaving
        m : function (x, m) {

            return (x % m + m) % m;

        },

        tau : tau,

        // angel scale: set scale when working with angles (pi*2 or 360)
        as : tau,

        // angle normalize : normalize an angle from 0 to PI * 2 ( or 0 to 360 for scale = 360 )
        an : function (n) {

            return this.m(n, this.as);

        },

        // angle short distance: -1 for counter clockwise, 1 for clockwise for shorest distnace
        asd : function (f, t) {

            if (this.anh(f - t) < 0) {

                return 1; // Right

            }
            return -1; // Left

        },

        // angle normalize half: normalize an angle to -PI to PI (or -180 to 180 for scale = 360)
        anh : function (n) {

            var h = this.as / 2;

            return this.m(n + h, this.as) - h;
        },

        // console.log wrap
        l : function (m) {

            console.log(m);

        },

        // log once
        lo : function (m, r) {

            // if log, log once
            if (log) {

                log = false;
                this.l(m);

            }

            // reset
            if (r) {

                log = true;

            }

        },

        // distance formula (a = x1, b = y1, c=x2, d=y2)
        d : function (a, b, c, d) {

            //return Math.sqrt(Math.pow(a - b, 2) + Math.pow(b - d, 2));

            var e = a - c,
            f = b - d;
            return Math.sqrt(e * e + f * f);

        },

        // bounding box collision detection
        b : function (a, b) {

            return !(
                ((a.y + a.h) < (b.y)) ||
                (a.y > (b.y + b.h)) ||
                ((a.x + a.w) < b.x) ||
                (a.x > (b.x + b.w)));

        },

        // getDocumentById wrap
        g : function (id) {

            return document.getElementById(id);

        },

        // shallow clone of an object
        c : function (obj) {

            var n = {};

            for (var prop in obj) {

                if (typeof prop != 'object') {

                    n[prop] = obj[prop];

                }

            }

            return n;

        }

    };

}
    ());
