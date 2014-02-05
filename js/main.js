var barbellWeights = {
	"LB": [45, 35],
	"KG": [20, 15]
};

var plateWeights = {
	"LB": [2.5,   5, 10, 25, 35, 45],
	"KG": [  1, 2.5,  5, 10, 15, 20]
};

var warmupScheme = [
	{ reps: 5, percent: 40},
	{ reps: 5, percent: 50},
	{ reps: 3, percent: 67},
	{ reps: 2, percent: 80},
];

var BarbellView = function()
{
	var self = this;
	
	self.units = ko.observableArray([
        'LB', 'KG'
    ]);
	
	self.storageHandler = new StorageHandler();
	
	self.weightUnit = ko.observable(self.storageHandler.getWithDefault('weightUnit', 'LB'));
	
	self.weightUnit.subscribe(function(newValue) {	
		//change barbell and plates to appropriate units
		self.barbellWeights(barbellWeights[newValue]);
		self.plateWeights(plateWeights[newValue]);
		
		//restore available plates

		self.plateWeightsAvailable(self.storageHandler.getWithDefault('plateWeightsAvailable' + self.weightUnit(), plateWeights[self.weightUnit()], true));

		self.storageHandler.set('weightUnit', newValue);
	});
	
	//set barbell choices
	self.barbellWeights = ko.observableArray(barbellWeights[self.weightUnit()]);
	self.barbellWeight  = ko.observable();
	
	//set plate choices and check all initially
	self.plateWeights = ko.observableArray(plateWeights[self.weightUnit()]);
	self.plateWeightsAvailable = ko.observableArray(self.storageHandler.getWithDefault('plateWeightsAvailable' + self.weightUnit(), plateWeights[self.weightUnit()], true));
	
	self.plateWeightsAvailable.subscribe(function(newValue) {	
		
		currentPlatesAvailable = self.storageHandler.getWithDefault('plateWeightsAvailable' + self.weightUnit(), plateWeights[self.weightUnit()], true)
		
		//prevent not having any plates
		if (newValue.length == 0 && currentPlatesAvailable.length == 1) {
			self.plateWeightsAvailable(currentPlatesAvailable);
		
			alert('Whatcha gonna lift, bro?');
		} else {
			self.storageHandler.set('plateWeightsAvailable' + self.weightUnit(), newValue, true);
		}
	});
	
	self.weightToCalculate = ko.observable();
	
	self.displayConfigurationsNumber = 3;
	self.showMoreConfigurations = function() { console.log()
		self.displayConfigurationsNumber = 10;
		self.plateConfigurations(self.totalPlateConfigurations.slice(0, self.displayConfigurationsNumber));
	}
	
	self.totalPlateConfigurations = self.storageHandler.getWithDefault('plateConfigurations', [], true);
	self.plateConfigurations      = ko.observableArray(self.totalPlateConfigurations.slice(0, self.displayConfigurationsNumber));
	
	//console.log(self.plateConfigurations());
	
	self.calculateSets = function() {
		//first calculate 100%
		sets = [];
		
		//getSets()
		thisWarmupScheme = warmupScheme.slice(0);
		thisWarmupScheme.push({ percent:100, reps: 0 });
		//getSets()
		
		for (i = 0; i < thisWarmupScheme.length; i++) { 
			weight = parseInt(self.weightToCalculate() * thisWarmupScheme[i].percent / 100);
			
			console.log(thisWarmupScheme[i].percent + ' ' + weight);
			
			plateConfiguration = self.calculateWeight(weight);
			
			console.log(plateConfiguration[plateConfiguration.length -1].left);
			

			
			sets.push({
				weight: weight - plateConfiguration[plateConfiguration.length -1].left,
				reps: thisWarmupScheme[i].reps,
				percent: thisWarmupScheme[i].percent, 
				plateConfiguration: plateConfiguration
			});
		}
		
		
		
		//keep all plate configs (up to max amount constant)
		self.totalPlateConfigurations.unshift({
			unit:       self.weightUnit(),
			weight:     self.weightToCalculate(),
			additional: left,
			sets: sets
		});
		self.totalPlateConfigurations.slice(0, 20);
		//but only display so many
		self.plateConfigurations(self.totalPlateConfigurations.slice(0, self.displayConfigurationsNumber));
		
		
		self.storageHandler.set('plateConfigurations', self.totalPlateConfigurations, true);
		
		if (left > 0) {
			console.log('sorry bro, add some chainz for that extra ' + left + self.weightUnit());
		}
		
		
		
	};
	
	self.calculateWeight = function(weightToCalculate) {
		//console.log(weightToCalculate);
		left = weightToCalculate - self.barbellWeight();
		
		platesToUse = self.plateWeightsAvailable().slice(0);
		platesToUse.sort(function(a, b) { return a - b; });

		plateConfiguration = [];
		plateCount = 0;
		
		while (left > 0 && platesToUse.length > 0) {
			//go from heaviest to lightest
			plateSize = platesToUse[platesToUse.length - 1];
			//need a balanced bar
			weightToSubtract =  plateSize * 2;
			
			
			if (left - weightToSubtract >= 0) {
				left -= weightToSubtract;
			
				plateCount++;
				//console.log(plateCount + ' ' + plateSize);
			} else {
				platesToUse.pop();
			}
			
			if (plateCount > 0 && left - weightToSubtract < 0) {
				plateConfiguration.push({
					size: plateSize,
					count: plateCount,		
					left: left,
				});
				
				plateCount = 0;
				
			}
			
		}
		
		return plateConfiguration;
	
	};
	
	self.formatConfigurations = function(saveFirst){}
	
	
	
}

function StorageHandler()
{
	//this.	
}

StorageHandler.prototype.isSupported = function()
{
	return typeof(Storage) !== 'undefined';
}

StorageHandler.prototype.getWithDefault = function(key, defaultValue, isArray)
{


	if (this.isSupported() && this.storageKeyExists(key)) {
		
		if (isArray) {
			return JSON.parse(localStorage[key]);
		} else {
			return localStorage[key];
		}
	} else {
		return defaultValue;
	}
}

StorageHandler.prototype.storageKeyExists = function(key) 
{
	return typeof(localStorage[key]) !== 'undefined';
}

StorageHandler.prototype.set = function(key, value, isArray)
{
	
	if (this.isSupported()) {
		if (isArray) {
			value = JSON.stringify(value);
		}
	
		localStorage[key] = value;
	}
}

ko.applyBindings(new BarbellView());

//BarbellView.weightUnit('KG');
