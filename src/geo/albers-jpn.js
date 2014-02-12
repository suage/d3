d3.geo.albersJpn = function() {

    //Japan main
    var jpn46 =  d3.geo.conicEqualArea()
        .rotate([218, -2])
        .center([-8, 35.5])
        .parallels([50, 60]);

    //Okinawa Pref and AmamiOsima(Kagoshima)
    var okinawa = d3.geo.conicEqualArea()
        .rotate([215, -1])
        .center([-6, 35])
        .parallels([50, 60]);

    var point;
    var pointStream = {point: function(x, y) { point = [x, y]; }}, jpn46Point, okinawaPoint;

    function albersJpn(coordinates) {
        var x = coordinates[0], y = coordinates[1];
        point = null;
        (jpn46Point(x, y), point) || (okinawaPoint(x, y), point);
        return point;
    }

    albersJpn.invert = function(coordinates) {
        var k = jpn46.scale(),
        t = jpn46.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;

        return (y >= -.130 && y < .001 && x >= -.206 && x < -.010 ? okinawa : jpn46).invert(coordinates);
    };

    // A naïve multi-projection stream.
    // The projections must have mutually exclusive clip regions on the sphere,
    // as this will avoid emitting interleaving lines and polygons.
    albersJpn.stream = function(stream) {
        var jpn46Stream = jpn46.stream(stream);
        var okinawaStream = okinawa.stream(stream);

        return {
            point: function(x, y) {
                jpn46Stream.point(x, y);
                okinawaStream.point(x, y);
            },
            sphere: function() {
                jpn46Stream.sphere();
                okinawaStream.sphere();
            },
            lineStart: function() {
                jpn46Stream.lineStart();
                okinawaStream.lineStart();
            },
            lineEnd: function() {
                jpn46Stream.lineEnd();
                okinawaStream.lineEnd();
            },
            polygonStart: function() {
                jpn46Stream.polygonStart();
                okinawaStream.polygonStart();
            },
            polygonEnd: function() {
                jpn46Stream.polygonEnd();
                okinawaStream.polygonEnd();
            }
        };
    };

    albersJpn.precision = function(_) {
        if (!arguments.length) return jpn46.precision();
        jpn46.precision(_);
        okinawa.precision(_);
        return albersJpn;
    };


    albersJpn.scale = function(_) {
        if (!arguments.length) return jpn46.scale();
        jpn46.scale(_);
        okinawa.scale(_ * 1.5);//a bit bigger
        return albersJpn.translate(jpn46.translate());
    };

    albersJpn.translate = function(_) {
        if (!arguments.length) return jpn46.translate();
        var k = jpn46.scale(), x = +_[0], y=+_[1];

        //clipExtentで地道に領域を決めるの超めんどい
        //masking by clipExtent
        jpn46Point = jpn46.translate(_)
            .clipExtent([[x - .156 * k, y-.150 * k], [x + .270 * k, y + .120 * k]])
            .stream(pointStream).point;

        okinawaPoint = okinawa.translate(_)
            .translate([x + .22 * k, y-.28*k])
            .clipExtent([[x - .206 * k, y -.130 * k], [x - .010 * k, y+ .001 * k]])
            .stream(pointStream).point;

        return albersJpn;
    };

    return albersJpn;
}
