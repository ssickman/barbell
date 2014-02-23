(function() {  if (!window.console) {    window.console = {};  }  var m = [    "log", "info", "warn", "error", "debug", "trace", "dir", "group",    "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",    "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"  ];  for (var i = 0; i < m.length; i++) {    if (!window.console[m[i]]) {      window.console[m[i]] = function() {};    }      } })();

var $ = jQuery.noConflict();
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
		
		thisWarmupScheme = warmupScheme.slice(0);
		thisWarmupScheme.push({ percent:100, reps: 0 });
		
		//determine how much padding we need to position sets at bottom of div
		maxPlates = 0;
		
		po = new PlateOptimizer();
		
		for (i = 0; i < thisWarmupScheme.length; i++) { 
			set = new SetFactory(
				parseInt(self.weightToCalculate() * thisWarmupScheme[i].percent / 100),
				self.barbellWeight(),
				self.plateWeightsAvailable().slice(0),
				self.ignoreSmallPlates() && i != thisWarmupScheme.length - 1,
				{
					percent: thisWarmupScheme[i].percent,
					reps:    thisWarmupScheme[i].reps,
					units:   self.weightUnit()
				}
			);
			
			set = po.optimize(set);
			
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

function PlateOptimizer()
{
	this.optimize = function(set) {
		if (!(set instanceof Set)) {
			throw new Error('PlateOptimizer.optimize accepts only Set() objects');
		}
		
		//don't optimize last set, we are firm on the weight used
		if (set.percent == 100) {
			return set;
		}
		
		bestCandidateSet = set;
		platesToUse = set.platesToUse.slice();
		
		if (1==2) {
			
			//what is the ideal weight we should calculate, using all plates available
			targetSet = new SetFactory(
				set.displayWeight,
				set.barbellWeight,
				set.platesToUse,
				false,
				{
					percent: set.percent,
					reps:    set.reps,
					units:   set.units
				}
			);
			
			minThreshold = .9;
			maxThreshold = 1 + ((100 - set.percent) / 4 / 100);
			
			console.log('max threshold ' + maxThreshold);
			
			//the smallest difference between the targetSet weight and the bestCandidate (so far)
			minWeightDifference = targetSet.displayWeight - bestCandidateSet.displayWeight;
			
			//start at bottom of threshold, lighter could use fewer (e.g., knock off the 2.5lb plates)
			candidateWeight = parseInt(set.displayWeight * minThreshold); 
			thresholdWeight = parseInt(set.displayWeight * maxThreshold);
			minWeightToAdd  = set.units == 'LB' ? 5 : 2; 
			
			
			console.log('target set weight ' + targetSet.displayWeight);
			console.log(set.displayWeight + ' ' + candidateWeight + ' ' + thresholdWeight + ' ' + minWeightToAdd);
		
			ii = 0;
			while (candidateWeight <= thresholdWeight && ii++ < 100) {

				newSet = new SetFactory(
					candidateWeight,
					set.barbellWeight,
					set.platesToUse,
					false,
					{
						percent: set.percent,
						reps:    set.reps,
						units:   set.units
					}
				);
				candidateWeight += minWeightToAdd;
								
				//if the newSet is closer to the target
				newSetDifference = Math.abs(newSet.displayWeight - targetSet.displayWeight);
				if (
					
					newSet.plateConfiguration.length < bestCandidateSet.plateConfiguration.length
					
				) {
					bestCandidateSet = newSet;
					minWeightDifference = newSetDifference;
				} else if (newSetDifference < minWeightDifference) {
					bestCandidateSet = newSet;
					minWeightDifference = newSetDifference;
				
				//or if it's the same with fewer plates
				} 
			}
		}

		return bestCandidateSet;
	}
}


function PlateConfiguration(size, count) {
	this.size  = size;
	this.count = count;
}

function Set(displayWeight, plateConfiguration) {	
	this.displayWeight      = displayWeight;
	this.plateConfiguration = plateConfiguration;
}


function SetFactory(weightToCalculate, barbellWeight, platesToUsePassed, ignoreSmallPlates, setDisplayData) {
	
	platesToUse = platesToUsePassed.slice();
	platesToUse.sort(function(a, b) { return a - b; });
	
	//get rid of the 2 smallest plates during warmups
	if (ignoreSmallPlates) {
		platesToUse.shift(); 
		platesToUse.shift()
	}
	
	//make a copy to store on the set
	setPlatesToUse = platesToUse.slice(0);
console.log(weightToCalculate);	
	set = this.calculateSet(weightToCalculate, barbellWeight, platesToUse);

	set.barbellWeight     = barbellWeight;
	set.platesToUse       = setPlatesToUse; 
	set.ignoreSmallPlates = ignoreSmallPlates;
	
	if (typeof(setDisplayData) == 'object') {
		for (key in setDisplayData) {
			set[key] = setDisplayData[key];
		}
	}
	
	return set;
}

SetFactory.prototype.calculateSet = function(weightToCalculate, barbellWeight, platesToUse) {
	//console.log(weightToCalculate);
	left = weightToCalculate - barbellWeight;
			
	plateConfiguration = [];
	plateCount = 0;

	while (left > 0 && platesToUse.length > 0) {
		//go from heaviest to lightest
		plateSize = platesToUse[platesToUse.length - 1];
		
		//need a balanced bar
		weightToSubtract =  plateSize * 2;
		
		//we can still use this plate
		if (left - weightToSubtract >= 0) {
			left -= weightToSubtract;
			plateCount++;
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
	
	return new Set(
		weightToCalculate - left,
		plateConfiguration
	);

};



function StorageHandler()
{
	this.isSupported = function()
	{
		return typeof(Storage) !== 'undefined';
	}
	
	this.getWithDefault = function(key, defaultValue, isArray)
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
	
	this.storageKeyExists = function(key) 
	{
		return typeof(localStorage[key]) !== 'undefined';
	}
	
	this.set = function(key, value, isArray)
	{
		
		if (this.isSupported()) {
			if (isArray) {
				value = JSON.stringify(value);
			}
		
			localStorage[key] = value;
		}
	}
}



ko.applyBindings(new BarbellView());