var $ = jQuery.noConflict();

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
	{ reps: 3, percent: 67},
	{ reps: 2, percent: 80},
	{ reps: 1, percent: 90}
];


//warmupScheme = [ { reps: 1, percent: 90} ];

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
		self.barbellWeight(barbellWeights[newValue][0]);
		self.plateWeights(plateWeights[newValue]);
		
		//restore available plates

		self.plateWeightsAvailable(self.storageHandler.getWithDefault('plateWeightsAvailable' + self.weightUnit(), plateWeights[self.weightUnit()], true));

		self.storageHandler.set('weightUnit', newValue);
	});
	
	//set barbell choices
	self.barbellWeights = ko.observableArray(barbellWeights[self.weightUnit()]);
	self.barbellWeight  = ko.observable(barbellWeights[self.weightUnit()][0]);
	self.barbellWeightDisplay = function(weight) {
		return weight + ' ' + self.weightUnit();
	}

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
	
	
	self.showGhostLabel = ko.observable(true);
	
	self.weightToCalculate = ko.observable();
	//auto calc on 3 digits
	self.weightToCalculate.subscribe(function(newValue) {	
		self.showGhostLabel(false);
		
		weightLength = newValue == null ? 0 : newValue.length;
		
		if (weightLength == 3) {
			self.isSelected(false);
		}
	});
	
	self.isSelected = ko.observable(true);
	self.isSelected.subscribe(function(newValue){
		
		if (!newValue) {
			self.calculateSets();
			setTimeout(self.resetInput, 500)
		}
	});
	
	self.resetInput = function() {
		self.weightToCalculate(null);
		self.showGhostLabel(true);
		//self.isSelected(true);
	}
	
	self.displayConfigurationsNumber = 3;
	self.showMoreConfigurations = function() {
		self.displayConfigurationsNumber = 10;
		self.weightConfigs(self.allWeightConfigs.slice(0, self.displayConfigurationsNumber));
	}
	
	self.allWeightConfigs = self.storageHandler.getWithDefault('weightConfigs', [], true);
	self.weightConfigs      = ko.observableArray(self.allWeightConfigs.slice(0, self.displayConfigurationsNumber));
	
	
	//for fractional plates
	self.plateClass = function(plateSize, unit, count) {
		return 'plate-' + String(plateSize).replace('.', '--') + unit + ' plate-count-' + count;
	};
	
	self.padAndReverse = function(plateArray, platePadding) {
		
		for (i = plateArray.length; i < platePadding; i++) {
			plateArray.push({
				size:  0,
				count: 0
			});
		}
		
		return plateArray.reverse();
	};
	
	//don't use the 2.5, 5lb/1, 2.5kg plates on warmup sets if this option is checked, causes fewer plate loadings when it doesn't matter
	self.ignoreSmallPlates = ko.observable(self.storageHandler.getWithDefault('ignoreSmallPlates', true) != 'false');
	self.ignoreSmallPlates.subscribe(function(newValue){
		self.storageHandler.set('ignoreSmallPlates', newValue);
	});
	
	
	self.calculateSets = function() {
		
		
		if (self.weightToCalculate() == null || self.weightToCalculate() < self.barbellWeight() || isNaN(self.weightToCalculate())) {
			return false;
		}
		
		if (self.settingsVisible()) {
			self.toggleSettings();
		}
		
		sets = [];
		
		//getSets()
		thisWarmupScheme = warmupScheme.slice(0);
		thisWarmupScheme.push({ percent:100, reps: 0 });
		//getSets()
		
		//determine how much padding we need to get sets at bottom of div
		maxPlates = 0;
		
		for (i = 0; i < thisWarmupScheme.length; i++) { 
			weight = parseInt(self.weightToCalculate() * thisWarmupScheme[i].percent / 100);

			set         = self.calculateSet(weight, self.ignoreSmallPlates() && i != thisWarmupScheme.length - 1);
			set.percent = thisWarmupScheme[i].percent
			set.reps    = thisWarmupScheme[i].reps,
			sets.push(set);
			
			maxPlates = set.plateConfiguration.length > maxPlates ? set.plateConfiguration.length : maxPlates;
			
		}
		
		
		
		//keep all plate configs (up to max amount constant)
		self.allWeightConfigs.unshift({
			unit:         self.weightUnit(),
			weight:       self.weightToCalculate(),
			platePadding: maxPlates,
			sets:         sets
		});
		self.allWeightConfigs.slice(0, 20);
		//but only display so many
		self.weightConfigs(self.allWeightConfigs.slice(0, self.displayConfigurationsNumber));
		
		
		self.storageHandler.set('weightConfigs', self.allWeightConfigs, true);
		
		//return focus to input
		//self.isSelected(true);
		
	};
	
	self.calculateSet = function(weightToCalculate, ignoreSmallPlates, noRecursion) {
		//console.log(weightToCalculate);
		left = weightToCalculate - self.barbellWeight();
		
		platesToUse = self.plateWeightsAvailable().slice(0);
		platesToUse.sort(function(a, b) { return a - b; });
		
		if (ignoreSmallPlates) {
			platesToUse.shift(); platesToUse.shift()
		}
		
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
				plateConfiguration.push(new PlateConfiguration(
					plateSize,
					plateCount		
				));
				
				plateCount = 0;
				
			}
			
		}
		
		originalSet = new Set(
			weightToCalculate - left,
			left,
			plateConfiguration
		);
		bestCandidateSet = originalSet;
		
		
		if (1==2 && ignoreSmallPlates && !noRecursion) {
			//what is the ideal weight we should calculate, using all plates available
			targetSet = self.calculateSet(weightToCalculate, false);
			//the smallest difference between the targetSet weight and the bestCandidate (so far)
			minWeightDifference = targetSet.displayWeight - bestCandidateSet.displayWeight;
			
			//start at bottom of threshold, lighter could use fewer (e.g., knock off the 2.5lb plates)
			candidateWeight = parseInt(weightToCalculate * .8); 
			thresholdWeight = parseInt(weightToCalculate * 1.05);
			minWeightToAdd  = self.weightUnit() == 'LB' ? 5 : 2; 
			
			
			console.log('target set weight ' + targetSet.displayWeight);
			console.log(weightToCalculate + ' ' + candidateWeight + ' ' + thresholdWeight + ' ' + minWeightToAdd);
		
			ii =0;
			while (candidateWeight <= thresholdWeight && ii++ < 100) {
				newSet = self.calculateSet(candidateWeight, true, true);
				candidateWeight += minWeightToAdd;
				
				console.log('candidate: ' + candidateWeight);
				console.log('new display: ' + newSet.displayWeight);
				
				//if we need less plates, make that the new warmup weight, but keep going until we are out of tolerance (80% ?)
				//if (newSet.plateConfiguration.length < bestCandidateSet.plateConfiguration.length) {
					//bestCandidateSet = newSet;
				//}
				
				//if the newSet is closer to the target
				newSetDifference = Math.abs(newSet.displayWeight - targetSet.displayWeight);
				if (newSetDifference < minWeightDifference) {
					bestCandidateSet = newSet;
					minWeightDifference = newSetDifference;
				
				//or if it's the same with fewer plates
				} else if (
					newSetDifference == minWeightDifference && 
					newSet.plateConfiguration.length < bestCandidateSet.plateConfiguration.length
				) {
					bestCandidateSet = newSet;
				}
			}
		}
		
		return bestCandidateSet;
	
	};
	
	self.slideDownConfig = function(e) {
		if (e.nodeType === 1) {
			$(e).hide().slideDown();
		}
	}
	
	self.settingsVisible = ko.observable(false);
	self.toggleSettings = function(e) {
		self.settingsVisible(!self.settingsVisible());
	}
	
	
	
}

function PlateConfiguration(size, count) {
	this.size  = size;
	this.count = count;
}

function Set(displayWeight, additional, plateConfiguration) {
	this.displayWeight      = displayWeight;
	this.additional         = additional;
	this.plateConfiguration = plateConfiguration;
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
