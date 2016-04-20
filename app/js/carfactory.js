/**
 * This code was written by Ben Bancroft
 */

var CarType = {
    POLICE: 0, SPORTS: 1, MUSCLE: 2, TAXI: 3, TRUCK: 4, MINI_VAN: 5, MINI_TRUCK: 6, AMBULANCE: 7, SPORTS2: 8
};

function CarStats(name, mass, maxSpeed, turnSpeed, acceleration, boundingBox, spriteSheetUrl){
    this.name = name;
    this.mass = mass;
    this.maxSpeed = maxSpeed;
    this.turnSpeed = turnSpeed;
    this.acceleration = acceleration;
    this.boundingBox = boundingBox;
    this.spriteSheetUrl = spriteSheetUrl;
};

function CarFactory() {

    this.carStats = new Map();

    this.carStats.set(CarType.POLICE, new CarStats("Police Car", 200, 12, Math.PI/170, 0.04, new Vector2(49, 107), "assets/sprites/police"));
    this.carStats.set(CarType.SPORTS, new CarStats("Sports Car", 250, 16, Math.PI/180, 0.05, new Vector2(49, 107), "assets/sprites/sports"));
    this.carStats.set(CarType.MUSCLE, new CarStats("Muscle Car", 270, 15, Math.PI/190, 0.04, new Vector2(46, 109), "assets/sprites/muscle"));
    this.carStats.set(CarType.TAXI, new CarStats("Taxi", 200, 15, Math.PI/200, 0.05, new Vector2(63, 117), "assets/sprites/taxi"));
    this.carStats.set(CarType.TRUCK, new CarStats("Truck", 1500, 14, Math.PI/200, 0.03, new Vector2(45, 108), "assets/sprites/truck"));
    this.carStats.set(CarType.MINI_VAN, new CarStats("Mini Van", 500, 15, Math.PI/190, 0.04, new Vector2(47, 98), "assets/sprites/mini_van"));
    this.carStats.set(CarType.MINI_TRUCK, new CarStats("Mini Truck", 500, 15, Math.PI/190, 0.04, new Vector2(56, 125), "assets/sprites/mini_truck"));
    this.carStats.set(CarType.AMBULANCE, new CarStats("Ambulance", 500, 15, Math.PI/210, 0.03, new Vector2(51, 104), "assets/sprites/ambulance"));
    this.carStats.set(CarType.SPORTS2, new CarStats("Sports Car", 250, 16, Math.PI/180, 0.05, new Vector2(53, 110), "assets/sprites/sports2"));


    this.createCar = function (type, car) {
        car.setStats(type, this.carStats.get(type));

        return car;
    };

    this.createRandomCar = function(car){
        var keys = Array.from(this.carStats.keys());
        var index = Math.floor(Math.random() * keys.length);

        return this.createCar(keys[index], car);
    };

    this.getMaxStats = function(){
        var stats = new CarStats(0, 0, 0, 0, 0);

        this.carStats.forEach(function (v, k) {
            stats.mass = Math.max(stats.mass, v.mass);
            stats.maxSpeed = Math.max(stats.maxSpeed, v.maxSpeed);
            stats.turnSpeed = Math.max(stats.turnSpeed, v.turnSpeed);
            stats.acceleration = Math.max(stats.acceleration, v.acceleration);
        });

        return stats;
    }
}