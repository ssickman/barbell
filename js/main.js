(function() {  if (!window.console) {    window.console = {};  }  var m = [    "log", "info", "warn", "error", "debug", "trace", "dir", "group",    "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",    "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"  ];  for (var i = 0; i < m.length; i++) {    if (!window.console[m[i]]) {      window.console[m[i]] = function() {};    }      } })();

var $ = jQuery.noConflict();
var BarbellView = function(storageEnvironment)
{
	var self = this;

	if (typeof(storageEnvironment) == 'undefined') {
		storageEnvironment = 'production'
	}
	
	self.units = ko.observableArray([
        'LB', 'KG'
    ]);
	
	self.storageHandler = new StorageHandler(storageEnvironment);
	
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
		
			//alert('Whatcha gonna lift, bro?'); //comment out for now, use non alert later
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
		
		var sets = [];
		
		thisWarmupScheme = warmupScheme.slice(0);
		thisWarmupScheme.push({ percent:100, reps: 0 });
		
		//determine how much padding we need to position sets at bottom of div
		var maxPlates = 0;
		
		var po = new PlateOptimizer();
		
		for (var i = 0; i < thisWarmupScheme.length; i++) { 
			var set = new SetFactory(
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
			//e.className += ' slidedown';
			$(e).hide().slideDown();
		}
	}
	
	self.settingsVisible = ko.observable(false);
	self.toggleSettings = function(e) {
		self.settingsVisible(!self.settingsVisible());
	}
	
	
	
}