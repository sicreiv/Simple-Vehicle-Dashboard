// 1. Event Module (Observer Pattern): Handles event subscription and publishing
const EventModule = (function() {
    const subscribers = {}; 

    return {
        subscribe: function(event, callback) {
            if (!subscribers[event]) {
                subscribers[event] = [];
            }
            subscribers[event].push(callback);
        },
        publish: function(event, data) {
            if (subscribers[event]) {
                subscribers[event].forEach(callback => callback(data));
            }
        }
    };
})();

// 2. Data Module: Manages data and calculations using composition
const DataModule = (function() {
    let speed = 0; 
    let rpm = 0; 
    let fuel = 100; 
    let temperature = 0; 
    let distance = 0; 

    const calculateFuelConsumption = speed => speed * 0.1; 
    const updateFuel = (currentFuel, consumption) => currentFuel - consumption; 
    const updateDistance = currentSpeed => distance + (currentSpeed / 10); 
    const updateRPM = currentSpeed => Math.min(currentSpeed * 50, 7000); 
    const updateTemperatureIncrease = currentTemp => Math.min(currentTemp + 5, 100);
    const updateTemperatureDecrease = currentTemp => Math.max(currentTemp - 5, 0); 

    const simulateTimePassage = () => {
        if (speed > 0) {
            fuel = updateFuel(fuel, calculateFuelConsumption(speed) * 0.1); 
            distance = updateDistance(speed); 
            rpm = updateRPM(speed); 
            temperature = updateTemperatureIncrease(temperature); 
        } else if (speed === 0 && temperature > 0) {
            temperature = updateTemperatureDecrease(temperature);
        }
        return { speed, rpm, fuel, temperature, distance }; 
    };

    return {
        getSpeed: () => speed,
        setSpeed: (newSpeed) => { speed = newSpeed; },
        getRPM: () => rpm,
        setRPM: (newRPM) => { rpm = newRPM; },
        getFuel: () => fuel,
        updateFuelComposed: () => fuel, 
        getTemperature: () => temperature,
        setTemperature: (newTemp) => { temperature = newTemp; },
        updateDistanceComposed: () => distance, 
        updateRPMComposed: () => rpm, 
        updateTemperatureComposed: () => temperature, 
        simulateTimePassage: simulateTimePassage, 
        reset: () => {
            speed = 0;
            rpm = 0;
            fuel = 100;
            temperature = 0;
            distance = 0;
        }
    };
})();

// 3. Factory Module: Creates Vehicle dashboard components
const FactoryModule = (function() {
    return {
        createVehicle: function() {
            return {
                accelerate: function() {
                    let currentSpeed = DataModule.getSpeed();
                    let currentFuel = DataModule.getFuel();  
                    
                    if (currentFuel <= 0) {
                        alert("Cannot accelerate: Fuel is empty!");  
                        return;  
                    }
                    
                    DataModule.setSpeed(currentSpeed + 10);  
                    DataModule.setRPM(DataModule.updateRPMComposed());  
                    DataModule.setTemperature(DataModule.updateTemperatureComposed());  
                    
                    EventModule.publish('update', {}); 
                },
                brake: function() {
                    let currentSpeed = DataModule.getSpeed();
                    DataModule.setSpeed(Math.max(currentSpeed - 10, 0));  
                    DataModule.setRPM(DataModule.updateRPMComposed());  
                    EventModule.publish('update', {});  
                },
                refuel: function() {
                    DataModule.reset(); 
                    EventModule.publish('update', {});  
                }
            };
        }
    };
})();

// 4. UI Module: Handles DOM updates and event listeners
const UIModule = (function() {
    const speedElement = document.getElementById('speed-value');
    const rpmElement = document.getElementById('rpm-value');
    const fuelElement = document.getElementById('fuel-value');
    const tempElement = document.getElementById('temp-value');
    const distanceElement = document.getElementById('distance-value');
    const accelerateBtn = document.getElementById('accelerate-btn');
    const brakeBtn = document.getElementById('brake-btn');
    const refuelBtn = document.getElementById('refuel-btn');

    let overspeedAlertShown = false; 
    let lowFuelAlertShown = false;   
    let emptyFuelAlertShown = false; 
    let overheatAlertShown = false;  

    EventModule.subscribe('update', updateDashboard);
  
    setInterval(() => {
        DataModule.simulateTimePassage(); 
        EventModule.publish('update', {}); 
    }, 1000);  

    function updateDashboard() {
        const speed = DataModule.getSpeed();
        const rpm = DataModule.updateRPMComposed();
        const fuel = DataModule.updateFuelComposed();
        const temperature = DataModule.updateTemperatureComposed();
        const distance = DataModule.updateDistanceComposed();

        speedElement.textContent = `${speed} km/h`;
        rpmElement.textContent = `${Math.round(rpm)} rpm`;
        fuelElement.textContent = `${Math.max(Math.round(fuel), 0)}%`;
        tempElement.textContent = `${Math.round(temperature)} °C`;
        distanceElement.textContent = `${Math.round(distance)} km`;

        if (speed > 80 && !overspeedAlertShown) {  
            alert("Speed limit exceeded! Reduce speed immediately.");
            overspeedAlertShown = true;
        } else if (speed <= 80) {
            overspeedAlertShown = false;  
        }

        if (fuel < 20 && !lowFuelAlertShown) {
            alert("Fuel is almost empty!");
            lowFuelAlertShown = true;
        } else if (fuel >= 20) {
            lowFuelAlertShown = false;  
        }

        if (fuel <= 0 && !emptyFuelAlertShown) {
            alert("Fuel is empty! Refuel now.");
            emptyFuelAlertShown = true;
        } else if (fuel > 0) {
            emptyFuelAlertShown = false;  
        }

        if (temperature > 90 && !overheatAlertShown) {
            alert("Engine is overheating! Stop and cool down.");
            overheatAlertShown = true;
        } else if (temperature <= 90) {
            overheatAlertShown = false;  
        }
    }

    accelerateBtn.addEventListener('click', () => {
        const vehicle = FactoryModule.createVehicle();
        vehicle.accelerate();
    });

    brakeBtn.addEventListener('click', () => {
        const vehicle = FactoryModule.createVehicle();
        vehicle.brake();
    });

    refuelBtn.addEventListener('click', () => {
        const vehicle = FactoryModule.createVehicle();
        vehicle.refuel();
    });
})();