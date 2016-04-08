QUnit.test("rotation", function( assert ) {

    var rotated = new Vector2(50,0).rotate(Math.PI/2, new Vector2(25,20));

    assert.equal(rotated.x, 45);
    assert.equal(rotated.y, 45);
});

QUnit.test("line line intersection", function( assert ) {
    //square
    var pos1 = new Vector2(15,10);
    var normal1 = new Vector2(25,15).sub(pos1).normalise().perp();

    var pos2 = new Vector2(20,7);
    var normal2 = new Vector2(15,10).sub(pos2).normalise().perp();

    var intersectAt = lineLineIntersection(pos1, normal1, pos2, normal2);

    assert.equal(intersectAt.x.toFixed(2), 15);
    assert.equal(intersectAt.y.toFixed(2), 10);
});

QUnit.test("collision", function( assert ) {
    //square
    var polygon1 = new Polygon(new Vector2(0,0), [
        new Vector2(0,0), new Vector2(40,0), new Vector2(40,40), new Vector2(0,40)
    ]);
    //triangle
    var polygon2 = new Polygon(new Vector2(30,0), [
        new Vector2(0,0), new Vector2(30, 0), new Vector2(0, 30)
    ]);

    assert.ok(testPolygonsSAT(new Vector2(0,0), polygon1, polygon2));
});

/*QUnit.test("collision manifolds", function( assert ) {
    var polygon1 = new Polygon(new Vector2(20,30), [
        new Vector2(0,0), new Vector2(40,0), new Vector2(45,20), new Vector2(40,40), new Vector2(0,40)
    ], new Vector2(0,0));

    var polygon2 = new Polygon(new Vector2(50,50), [
        new Vector2(0,0), new Vector2(50,0), new Vector2(50,40), new Vector2(0,40)
    ], new Vector2(0,0));

    var response = new CollisionManifolds();
    var isCollision = testPolygonsSAT(new Vector2(0,30), polygon1, polygon2, response);

    console.log(response.contactPointsA);
    console.log(response.contactPointsB);
    console.log("D: " + response.maximumDisplacement);
    response.velocityDir.print();

    assert.ok(isCollision);

    assert.equal(response.contactPointsA.length, 1);

    assert.equal(response.contactPointsA[0].x, 45);
    assert.equal(response.contactPointsA[0].y, 20);

    assert.equal(response.contactPointsB[0].x, 0);
    assert.equal(response.contactPointsB[0].y, 0);

    assert.equal(response.maximumDisplacement, 5);

    assert.equal(response.velocityDir.x, 1);
    assert.equal(response.velocityDir.y, 0);
});*/

QUnit.test("collision manifolds diagonal velocity", function( assert ) {
    var polygon1 = new Polygon(new Vector2(5,0), [
        new Vector2(0,0), new Vector2(40,0), new Vector2(45,20), new Vector2(40,40), new Vector2(0,40)
    ], new Vector2(0,0));

    var polygon2 = new Polygon(new Vector2(50,0), [
        new Vector2(0,0), new Vector2(50,0), new Vector2(50,40), new Vector2(0,40)
    ], new Vector2(0,0));

    var response = new CollisionManifolds();
    var isCollision = testPolygonsSAT(new Vector2(-5,-10), polygon1, polygon2, response);

    console.log(response.contactPointsA);
    console.log(response.contactPointsB);
    console.log("D: " + response.maximumDisplacement);
    response.velocityDir.print();

    assert.ok(isCollision);
});


QUnit.test("collision manifolds diagonal corner case velocity based on car bb", function( assert ) {
    var other = {};
    other.bbWidth = this.bbWidth = 49;
    other.bbHeight = this.bbHeight = 107;
    //other.direction = this.direction = -Math.PI;
    other.direction = this.direction = 0;

    var polygon1 = new Polygon(new Vector2(40, 60), [
        new Vector2(-this.bbWidth / 2, -this.bbHeight / 2), new Vector2(this.bbWidth / 2, -this.bbHeight / 2), new Vector2(this.bbWidth / 2, this.bbHeight / 2), new Vector2(-this.bbWidth / 2, this.bbHeight / 2)
    ], new Vector2(0, 0));
    polygon1.setAngle(this.direction);

    var polygon2 = new Polygon(new Vector2(40, 25), [
        new Vector2(-other.bbWidth / 2, -other.bbHeight / 2), new Vector2(other.bbWidth / 2, -other.bbHeight / 2), new Vector2(other.bbWidth / 2, other.bbHeight / 2), new Vector2(-other.bbWidth / 2, other.bbHeight / 2)
    ], new Vector2(0, 0));
    polygon2.setAngle(other.direction);

    var response = new CollisionManifolds();
    var isCollision = testPolygonsSAT(new Vector2(40,140), polygon1, polygon2, response);

    console.log(response.contactPointsA);
    console.log(response.contactPointsB);
    console.log("D: " + response.maximumDisplacement);
    response.velocityDir.print();

    assert.ok(isCollision);
});

QUnit.test("collision manifolds diagonal corner case velocity", function( assert ) {
    //about 2/3 along object or so is destination
    var polygon1 = new Polygon(new Vector2(70,30), [
        new Vector2(-25 / 2, -50 / 2), new Vector2(25 / 2, -50 / 2), new Vector2(25 / 2, 50 / 2), new Vector2(-25 / 2, 50 / 2)
    ], new Vector2(0,0));
    //polygon1.setAngle(-Math.PI);
    //10m penetration

    var polygon2 = new Polygon(new Vector2(40,12), [
        new Vector2(-25 / 2, -50 / 2), new Vector2(25 / 2, -50 / 2), new Vector2(25 / 2, 50 / 2), new Vector2(-25 / 2, 50 / 2)
    ], new Vector2(0,0));
    polygon2.setAngle(Math.PI/4);
    //37.5 is lower boundry on y

    var response = new CollisionManifolds();
    var isCollision = testPolygonsSAT(new Vector2(70,70), polygon1, polygon2, response);

    console.log(response.contactPointsA);
    console.log(response.contactPointsB);
    console.log("D: " + response.maximumDisplacement);
    response.velocityDir.print();

    assert.ok(isCollision);
});