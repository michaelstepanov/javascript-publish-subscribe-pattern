/**
 * EventsManager
 */
var EventsManager = (function () {
    var events = {};

    function on(eventName, callback, context) {
        events[eventName] = events[eventName] || [];
        // If context passed
        if (context) {
            events[eventName].push(callback.bind(context));
            // If context not passed
        } else {
            events[eventName].push(callback);
        }
    }

    function off(eventName, callbackToRemove) {
        // If callback passed
        if (callbackToRemove) {
            if (events[eventName]) {
                events[eventName].forEach(function (callback, index) {
                    if (callback === callbackToRemove) {
                        events[eventName].splice(index, 1);
                    }
                });
            }
            // If callback not passed
        } else {
            delete events[eventName];
        }
    }

    function trigger(eventName, data) {
        if (events[eventName]) {
            // Handle multiple arguments
            if (typeof(data) !== 'object') {
                // Cast arguments object to array
                data = Object.values(arguments);
                // Remove eventName from the list of arguments
                data.splice(0, 1);
            }

            events[eventName].forEach(function (callback) {
                callback(data);
            });
        }
    }

    return {
        on: on,
        off: off,
        trigger: trigger
    }
});

/**
 * Person
 */
var Person = function(name, eventManager) {
    this.name = name;
    this.foods = [];
    this.eventManager = eventManager;
};

Person.prototype.waitToEat = function() {
    this.eventManager.on('breakfast:ready', this.eat, this);
};

Person.prototype.eat = function(foods) {
    printRow("I'm", this.name, "and I'm eating", foods.join(", "));
    this.foods.length = 0;
    this.foods = foods;
    this.eventManager.trigger('eat:done', this);
};

Person.prototype.finishEat = function(time) {
    printRow("I'm", this.name, "and I finished eating at", time);
    this.eventManager.off("breakfast:ready", this.finishEat);
};

Person.prototype.logFood = function() {
    var self = this;
    this.foods.forEach(function(item){
        printRow("I'm " + self.name + " and I ate " + item);
    });
    // Or instead
    /*
     var logFoodItem = function(item){
     printRow("I'm " + this.name + " and I ate " + item);
     };

     this.foods.forEach(logFoodItem.bind(this));
     */
};

/**
 * Prints passed arguments on the console and on the screen
 */
function printRow() {
    var output = '';
    var div = document.getElementById("content");
    // Cast object to array to use forEach loop
    var argumentsArray = Object.values(arguments);
    argumentsArray.forEach(function (argument, key) {
        if (key !== 0) {
            output += ' ';
        }
        output += argument;
    });

    console.log(output);
    div.innerHTML += output + "<br>";
}

/**
 * Start the app
 */
var MyEventsManager = EventsManager();

MyEventsManager.on('eat:done', function(person){
    printRow(person.name, "finished eating");
});

MyEventsManager.on('breakfast:ready', function(menu){
    printRow("Breakfast is ready with:", menu.join(", "));
});

var john = new Person('John', MyEventsManager);
john.waitToEat();

MyEventsManager.on('eat:done', function(person){
    person.finishEat(new Date());
});

var breakfast = ["scrambled eggs", "tomatoes", "bread", "butter"];
MyEventsManager.trigger('breakfast:ready', breakfast);

// Multiple arguments are supported as well
// MyEventsManager.trigger('breakfast:ready', ...breakfast);

john.logFood();