//Utils

//Polyfill to support in older browsers
//from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign

Math.sign = Math.sign || function(x) {
        x = +x; // convert to a number
        if (x === 0 || isNaN(x)) {
            return x;
        }
        return x > 0 ? 1 : -1;
    }

//used for partial anonymous functions in places
var curry = function(fn){
    var args = Array.prototype.slice.call(arguments, 1);

    return function(){
        return fn.apply(this, args.concat(Array.prototype.slice.call(arguments, 0)));
    };
};

function wrapIndex(i, div) {
    return ((i % div) + div) % div;
}

function isObject(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
}

Array.prototype.pushArray = function(arr) {
    this.push.apply(this, arr);
};

Array.prototype.removeElement = function(item) {
    for(var i = this.length; i--;) {
        if(this[i] === item) {
            this.splice(i, 1);
        }
    }
}

Array.prototype.difference = function(a) {
    return this.filter(function(i) { return !a.some(function (j) { return i.equals(j); }) });
};

Array.prototype.clear = function() {
    while (this.length) {
        this.pop();
    }
};

Array.prototype.inArray = function(comparator) {
    for(var i=0; i < this.length; i++) {
        if(comparator(this[i])) return true;
    }
    return false;
};

function approxEqual(a, b){
    return Math.abs(a-b) <= 0.000001;
}

//Maths

var Vector2 = function(x, y){
    this.x = x || 0;
    this.y = y || 0;
};

Vector2.prototype.getAngle = function() {
    return Math.atan2(this.x, this.y);
};

Vector2.prototype.equals = function(other){
    return other != undefined && this.x == other.x && this.y == other.y;
};

Vector2.prototype.hashCode = function(){
    var hash = 17;

    hash = hash * 23 + this.x;
    hash = hash * 23 + this.y;

    return hash;
};

Vector2.prototype.lessThanEqual = function(other){
    return other != undefined && ((approxEqual(this.x, other.x)) || (this.x <= other.x && this.y <= other.y));
};

Vector2.prototype.greaterThanEqual = function(other){
    return other != undefined && (((approxEqual(this.x, other.x)) || this.x >= other.x && this.y >= other.y));
};

Vector2.prototype.lessThan = function(other){
    return other != undefined && (this.x < other.x || this.y < other.y);
};

Vector2.prototype.greaterThan = function(other){
    return other != undefined && (this.x > other.x || this.y > other.y);
};

Vector2.prototype.toFixed = function(precision){

    //if (typeof this.x == "number") this.x = new Number(this.x).toFixed(precision);
    //this.y = parseFloat(this.y).toFixed(precision);

    //console.log(typeof this.x)

    return this;

};

Vector2.prototype.cross = function(other){
    return this.x * other.y - this.y * other.x;
};

Vector2.prototype.rotate = function (angle, centre) {
    var centrePoint = centre || new Vector2();
    var oldPos = this.clone();
    this.x = centrePoint.x + (oldPos.x-centrePoint.x) * Math.cos(angle) - (oldPos.y-centrePoint.y) * Math.sin(angle);
    this.y = centrePoint.y + (oldPos.x-centrePoint.x) * Math.sin(angle) + (oldPos.y-centrePoint.y) * Math.cos(angle);

    return this;
};

Vector2.prototype.copy = function(other) {
    this.x = other.x;
    this.y = other.y;
    return this;
};

Vector2.prototype.clone = function() {
    var newVec = new Vector2();
    newVec.copy(this);
    return newVec;
};

Vector2.prototype.max = function(other) {
    this.x = Math.min(this.x, other.x);
    this.y = Math.min(this.y, other.y);
    return this;
};

Vector2.prototype.maxPoint = function(other) {
    return new Vector2(Math.max(this.x, other.x), Math.max(this.y, other.y));
};

Vector2.prototype.minPoint = function(other) {
    return new Vector2(Math.min(this.x, other.x), Math.min(this.y, other.y));
};

Vector2.prototype.multiply = function(other) {
    this.x *= other.x;
    this.y *= other.y;
    return this;
};

Vector2.prototype.div = function(other) {
    this.x /= other.x;
    this.y /= other.y;
    return this;
};

Vector2.prototype.divScalar = function(other) {
    this.x /= other;
    this.y /= other;
    return this;
};

Vector2.prototype.add = function(other) {
    this.x += other.x;
    this.y += other.y;
    return this;
};

Vector2.prototype.addScalar = function(other) {
    this.x += other;
    this.y += other;
    return this;
};

Vector2.prototype.sub = function(other) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
};

Vector2.prototype.mod = function(other) {
    this.x %= other;
    this.y %= other;
    return this;
};

Vector2.prototype.wrap = function(other) {
    this.x = wrapIndex(this.x, other);
    this.y = wrapIndex(this.y, other);
    return this;
};

Vector2.prototype.floor = function() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
};

Vector2.prototype.ceil = function() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
};

Vector2.prototype.abs = function() {
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
    return this;
};

Vector2.prototype.perp = function() {
    var x = this.x;
    this.x = this.y;
    this.y = -x;
    return this;
};

Vector2.prototype.reverse = function() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
};

Vector2.prototype.swap = function() {
    var x = this.x;
    this.x = this.y;
    this.y = x;
    return this;
};

Vector2.prototype.scale = function(x, y) {
    this.x *= x;
    this.y *= y || x;
    return this;
}

Vector2.prototype.invScale = function(x, y) {
    this.x /= x;
    this.y /= y || x;
    return this;
}

Vector2.prototype.normalise = function() {
    var scalar = this.len();
    if(scalar > 0) {
        this.x = this.x / scalar;
        this.y = this.y / scalar;
    }
    return this;
};

Vector2.prototype.dot = function(other) {
    return this.x * other.x + this.y * other.y;
};

Vector2.prototype.lenSquare = function() {
    return this.dot(this);
};

Vector2.prototype.len = function() {
    return Math.sqrt(this.lenSquare());
};

Vector2.prototype.toArray = function(){
    return [this.x, this.y];
};

Vector2.prototype.print = function(){
    console.log("X: " + this.x + ", Y: " + this.y);
};

var Vector3 = function(x, y, z){
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
};

Vector3.prototype.equals = function(other){
    return other != undefined && this.x == other.x && this.y == other.y && this.z == other.z;
};

Vector3.prototype.hashCode = function(){
    var hash = 17;

    hash = hash * 23 + this.x;
    hash = hash * 23 + this.y;
    hash = hash * 23 + this.z;

    return hash;
};

Vector3.prototype.toArray = function(){
    return [this.x, this.y, this.z];
};

Vector3.prototype.cross = function(other){
    return new Vector3(
        this.y * other.z - this.z * other.y,
        this.z * other.x - this.x * other.z,
        this.x * other.z - this.z * other.x
    );
};

var Vector4 = function(x, y, z, w){
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.w = w || 0;
};

Vector4.prototype.equals = function(other){
    return other != undefined && this.x == other.x && this.y == other.y && this.z == other.z && this.w == other.w;
};

Vector4.prototype.hashCode = function(){
    var hash = 17;

    hash = hash * 23 + this.x;
    hash = hash * 23 + this.y;
    hash = hash * 23 + this.z;
    hash = hash * 23 + this.w;

    return hash;
};

Vector4.prototype.toArray = function(){
    return [this.x, this.y, this.z, this.w];
};

var Matrix2 = function(x1, y1, x2, y2){
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
};

Matrix2.prototype.equals = function(other){
    return other != undefined & this.x1 == other.x1 && this.x2 == other.x2 && this.y1 == other.y1 && this.y2 == other.y2;
};

Matrix2.prototype.toArray = function(){
    return [this.x1, this.y1, this.x2, this.y2];
};

var HashMap = function() { this.map = new Map(); };
HashMap.prototype.set = function(key, value) {
    var hash = key.hashCode();
    var list = this.map.get(hash);
    if (!list) { list = []; this.map.set(hash, list); }
    for (var i=0; i < list.length; i++) {
        if (list[i].key.equals(key)) {
            list[i].value = value;
            return;
        }
    }
    list.push({key: key, value: value });
};
HashMap.prototype.get = function(key) {
    var hash = key.hashCode();
    var list = this.map.get(hash);
    if (!list) return null;
    for (var i=0; i < list.length; i++) {
        if (list[i].key.equals(key)) {
            return list[i].value
        }
    }
    return null;
};

HashMap.prototype.remove = function(key) {
    var hash = key.hashCode();
    var list = this.map.get(hash);
    if (!list) return null;
    for (var i=0; i < list.length; i++) {
        if (list[i].key.equals(key)) {
            list.splice(i , 1);
        }
    }
};

HashMap.prototype.forEach = function(callback){
  this.map.forEach(function (bucket, hash) {
      bucket.forEach(callback);
  });
};
HashMap.prototype.keys = function(callback){
    var keys = []
    this.map.forEach(function (bucket, hash) {
        keys = keys.concat(bucket.map(function (i) { return i.key; }));
    });

    return keys;
};

HashMap.prototype.values = function(callback){
    var values = []
    this.map.forEach(function (bucket, hash) {
        values = values.concat(bucket.map(function (i) { return i.value; }));
    });

    return values;
};

HashMap.prototype.data = function(callback){
    var data = []
    this.map.forEach(function (bucket, hash) {
        data = data.concat(bucket.map(function (i) { return i; }));
    });

    return data;
};

HashMap.prototype.size = function(callback){
    var size = 0;
    this.map.forEach(function (bucket, hash) {
        size += bucket.length;
    });
    return size;
};

function toUVSpace(v1, dimentions){
    return new Vector2(v1.x * (1.0 / dimentions.x), v1.y * (1.0 / dimentions.y));
}

//Collision

var CollisionManifolds = function() {
    this.maximumDisplacement = 0;
    this.velocityDir = new Vector2();
    this.contactPointsA = new Array();
    this.contactPointsB = new Array();
}

var Polygon = function(position, points, centrePoint){
    this.position = position;
    this.offset = new Vector2(0, 0);
    this.centrePoint = centrePoint || new Vector2(0, 0);
    this.angle = 0;

    //Used to cache collision data
    this.computePoints = new Array();
    this.edges = new Array();
    this.normals = new Array();

    this.setPoints(points)

};

Polygon.prototype.setPoints = function(points) {
    // Only re-allocate if this is a new polygon or the number of points has changed.
    var lengthChanged = !this.points || this.points.length !== points.length;
    if (lengthChanged) {
        for (var i = 0; i < points.length; i++) {
            this.computePoints.push(new Vector2());
            this.edges.push(new Vector2());
            this.normals.push(new Vector2());
        }
    }
    this.points = points;
    this.calculate();
};

Polygon.prototype.setCentrePoint = function(centrePoint) {
    this.centrePoint = centrePoint;
    this.calculate();
};

Polygon.prototype.setAngle = function(angle) {
    this.angle = angle;
    this.calculate();
};

Polygon.prototype.calculateCentroid = function()
{
    var len = this.points.length;

    this.centroid = new Vector2(0, 0);
    var signedArea = 0.0;
    var x0 = 0; // Current vertex X
    var y0 = 0; // Current vertex Y
    var x1 = 0; // Next vertex X
    var y1 = 0; // Next vertex Y
    var area = 0;  // Partial signed area

    // For all vertices
    for (var i = 0; i < len-1; i++)
    {
        x0 = this.computePoints[i].x;
        y0 = this.computePoints[i].y;
        x1 = this.computePoints[(i+1) % len].x;
        y1 = this.computePoints[(i+1) % len].y;
        area = x0*y1 - x1*y0;
        signedArea += area;
        this.centroid.x += (x0 + x1)*area;
        this.centroid.y += (y0 + y1)*area;
    }

    signedArea *= 0.5;
    this.centroid.x /= (6 * signedArea);
    this.centroid.y /= (6 * signedArea);
};

Polygon.prototype.calculate = function() {
    //Calculate normal, edges for collision detection, with optional rotation support
    var len = this.points.length;
    var i;
    for (i = 0; i < len; i++) {
        var computePoint = this.computePoints[i].copy(this.points[i]);
        computePoint.x += this.offset.x;
        computePoint.y += this.offset.y;
        if (this.angle !== 0) {
            computePoint.rotate(this.angle, this.centrePoint);
        }
    }
    //Calculate normals and edges
    for (i = 0; i < len; i++) {
        var p1 = this.computePoints[i];
        var p2 = i < len - 1 ? this.computePoints[i + 1] : this.computePoints[0];
        var e = this.edges[i].copy(p2).sub(p1);
        this.normals[i].copy(e).perp().normalise();
    }

    this.calculateCentroid();

    /*for (i = 0; i < len; i++) {
        this.computePoints[i].add(this.position);
    }*/

    return this;
};

function projectPointsLine(position, points, normal, result, projectionPoint, checkDistance) {
    var fromPosition = fromPosition || new Vector2();
    var min = Number.MAX_VALUE;
    var max = -Number.MAX_VALUE;
    var minPoint = null;
    var maxPoint = null;
    var len = points.length;
    for (var i = 0; i < len; i++ ) {
        //Calculate magnitude range
        var currentPoint = points[i].clone().add(position);
        var dot = currentPoint.dot(normal);
        if (dot < min) {
            min = dot;
            minPoint = i;
        }else if (checkDistance && approxEqual(dot, min) && minimumDistance(currentPoint, projectionPoint, normal) > minimumDistance(points[minPoint].clone().add(position), projectionPoint, normal)){
            minPoint = i;
        }
        if (dot > max) {
            max = dot;
            maxPoint = i;
        }else if (checkDistance && approxEqual(dot, max) && minimumDistance(currentPoint, projectionPoint, normal) > minimumDistance(points[maxPoint].clone().add(position), projectionPoint, normal)){
            maxPoint = i;
        }
    }
    result[0] = min; result[1] = max;
    result[2] = minPoint; result[3] = maxPoint;
}


function isSeparatingAxis(aPos, bPos, aPoints, bPoints, axis) {
    var rangeA = new Array();
    var rangeB = new Array();

    //Project polygons onto axis being tested
    projectPointsLine(aPos, aPoints, axis, rangeA);
    projectPointsLine(bPos, bPoints, axis, rangeB);

    // Check if a gap exists. If it does then no collision
    if (rangeA[0] > rangeB[1] || rangeB[0] > rangeA[1]) return true;

    return false;
}

function minimumDistance(p, q, direction) {

    var normal = direction.clone().perp();

    return Math.abs(p.clone().sub(q).dot(normal)) / normal.len();
}

function isBetween(a, c, b){
    return a.clone().sub(c).len() + c.clone().sub(b).len() == a.clone().sub(b).len();
}

function lineLineIntersection(p, pNormal, q, qNormal) {

    var pDir = pNormal.clone().perp();
    var qDir = qNormal.clone().perp();

    var A = new Vector2(pDir.y, qDir.y);
    var B = new Vector2(-pDir.x, -qDir.x);

    var C = new Vector2(new Vector2(A.x, B.x).dot(p), new Vector2(A.y, B.y).dot(q));

    var determinant = A.cross(B);

    //parallel
    if(determinant == 0) return null;

    return new Vector2(B.clone().swap().cross(C.clone().swap()) / determinant, A.cross(C) / determinant);
}

function projectForwardPoint(leftPos, rightPos, vertex, poly, velocityNormal, aManifolds, bManifolds, currentDisplacement){

    var polyPos = null;
    var displacement = 0;

    var position = vertex.clone().add(leftPos);

    //Find edge.

    for (var i = 0; i < poly.edges.length; i++){
        var edgeNormal = poly.normals[i];
        if (velocityNormal.cross(edgeNormal) < 0) {

            var edgePos = poly.computePoints[i].clone().add(rightPos);

            //wrong normal
            var pointOnEdgeLine = lineLineIntersection(position, velocityNormal, edgePos, edgeNormal);
            if (pointOnEdgeLine == null) continue;

            var edgeEnd = edgePos.clone().add(poly.edges[i])
            if ((edgeEnd.greaterThanEqual(edgePos) && pointOnEdgeLine.greaterThanEqual(edgePos) && pointOnEdgeLine.lessThanEqual(edgeEnd)) ||
                (edgeEnd.lessThanEqual(edgePos) && pointOnEdgeLine.lessThanEqual(edgePos) && pointOnEdgeLine.greaterThanEqual(edgeEnd))){
                displacement = pointOnEdgeLine.clone().sub(position).len();
                polyPos = pointOnEdgeLine.clone().sub(rightPos);
                /*edgePos.print();
                edgeEnd.print();
                pointOnEdgeLine.print();*/
                /*console.log(position);
                console.log(polyPos);
                console.log("D: " + displacement);*/
                break;
            }


        }
    }
    if (polyPos == null) return currentDisplacement;

    if (displacement <= currentDisplacement){
        if (displacement != currentDisplacement){
            aManifolds.clear();
            bManifolds.clear();
        }

        position.sub(leftPos);

        if (!aManifolds.inArray(function(e) { return e.equals(vertex) })) aManifolds.push(vertex.clone());
        if (!bManifolds.inArray(function(e) { return e.equals(polyPos) })) bManifolds.push(polyPos);

        return displacement;
    }

    return currentDisplacement;
}

function projectForwardHull(leftPos, rightPos, minIndex, maxIndex, leftPoly, rightPoly, velocityNormal, minDistance, aManifolds, bManifolds){
    var currentDisplacement = minDistance;
    //if an issue in future, maybe dir need flipping
    if (leftPoly.normals[maxIndex].cross(velocityNormal) < 0){
        var startPos = 0;
        if (minIndex < maxIndex){
            for (var i = maxIndex; i < leftPoly.computePoints.length; i++){
                currentDisplacement = projectForwardPoint(leftPos, rightPos, leftPoly.computePoints[i], rightPoly, velocityNormal, aManifolds, bManifolds, currentDisplacement);
            }
        }else{
            startPos = maxIndex;
        }
        for (var i = startPos; i <= minIndex; i++){
            currentDisplacement = projectForwardPoint(leftPos, rightPos, leftPoly.computePoints[i], rightPoly, velocityNormal, aManifolds, bManifolds, currentDisplacement);
        }
    }
    else{
        var endPos = 0;
        if (minIndex > maxIndex){
            for (var i = minIndex; i < leftPoly.computePoints.length; i++){
                currentDisplacement = projectForwardPoint(leftPos, rightPos, leftPoly.computePoints[i], rightPoly, velocityNormal, aManifolds, bManifolds, currentDisplacement);
            }
        }else{
            endPos = minIndex;
        }
        for (var i = maxIndex; i >= endPos; i--){
            currentDisplacement = projectForwardPoint(leftPos, rightPos, leftPoly.computePoints[i], rightPoly, velocityNormal, aManifolds, bManifolds, currentDisplacement);
        }
    }
    return currentDisplacement;
}

function testPolygonsSAT(lastPosition, a, b, response) {
    var aPoints = a.computePoints;
    var aLen = aPoints.length;
    var bPoints = b.computePoints;
    var bLen = bPoints.length;
    //Check normals of A's edges for seperating axis - if no they are not intercepting
    for (var i = 0; i < aLen; i++) {
        if (isSeparatingAxis(a.position, b.position, aPoints, bPoints, a.normals[i])) {
            return false;
        }
    }
    //Check normals of B's edges for seperating axis - if no they are not intercepting
    for (var i = 0;i < bLen; i++) {
        if (isSeparatingAxis(a.position, b.position, aPoints, bPoints, b.normals[i])) {
            return false;
        }
    }
    //We are intercepting. Using the last position, lets work out the collision manifolds
    if (response) {
        var velocityDir = a.position.clone().sub(lastPosition).normalise();
        var velocityNormal = velocityDir.clone().perp();

        var centrePoint = a.centroid.clone().add(lastPosition).add(b.centroid).add(b.position).scale(0.5);

        //may work better?
        centrePoint = lastPosition.clone().add(b.position).scale(0.5);

        var rangeA = new Array();
        var rangeB = new Array();

        projectPointsLine(lastPosition, aPoints, velocityNormal, rangeA, centrePoint, true);
        projectPointsLine(b.position, bPoints, velocityNormal, rangeB, centrePoint, true);

        //console.log("Centre point");

        //centrePoint.print();

        //console.log("Min max A - should be top so lower y")

        //aPoints[rangeA[2]].print();
        //aPoints[rangeA[3]].print();

        //console.log("Min max B - should be bottom so higher y")

        //bPoints[rangeB[2]].print();
        //bPoints[rangeB[3]].print();

        var aManifolds = new Array();
        var bManifolds = new Array();

        var maxDistance = projectForwardHull(lastPosition, b.position, rangeA[2], rangeA[3], a, b, velocityNormal, Number.MAX_VALUE, aManifolds, bManifolds);

        var reverseVelocityNormal = velocityDir.clone().reverse().perp();
        maxDistance = projectForwardHull(b.position, lastPosition, rangeB[2], rangeB[3], b, a, reverseVelocityNormal, maxDistance, bManifolds, aManifolds);

        response.contactPointsA = aManifolds;
        response.contactPointsB = bManifolds;
        response.maximumDisplacement = maxDistance;
        response.velocityDir = velocityDir;
    }
    return true;
}