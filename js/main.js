(function() {  if (!window.console) {  window.console = {};  }  var m = [    "log", "info", "warn", "error", "debug", "trace", "dir", "group",    "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",    "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"  ];  var dummy = function() {}; for (var i = 0; i < m.length; i++) {    if (!window.console[m[i]]) {      window.console[m[i]] = dummy;    }      } })();

var $ = jQuery.noConflict();

var BarbellView = function(storageEnvironment)
{
	var self = this;

	if (typeof(storageEnvironment) == 'undefined') {
		storageEnvironment = 'production';
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
		self.plateWeightQuantities(self.storageHandler.getWithDefault('plateWeightQuantities' + self.weightUnit(), plateWeightQuantities[self.weightUnit()], true));
		
		self.storageHandler.set('weightUnit', newValue);
	});
	
	//set barbell choices
	self.barbellWeights = ko.observableArray(barbellWeights[self.weightUnit()]);
	self.barbellWeight  = ko.observable(barbellWeights[self.weightUnit()][0]);
	self.barbellWeightDisplay = function(weight) {
		return weight + ' ' + self.weightUnit();
	};

	//set plate choices and check all initially
	self.plateWeights = ko.observableArray(plateWeights[self.weightUnit()]);
	self.plateWeightsAvailable = ko.observableArray(self.storageHandler.getWithDefault('plateWeightsAvailable' + self.weightUnit(), plateWeights[self.weightUnit()], true));
	self.plateWeightsAvailable.subscribe(function(newValue) {	
		
		currentPlatesAvailable = self.storageHandler.getWithDefault('plateWeightsAvailable' + self.weightUnit(), plateWeights[self.weightUnit()], true);
		
		//prevent not having any plates
		if (newValue.length === 0 && currentPlatesAvailable.length === 1) {
			self.plateWeightsAvailable(currentPlatesAvailable);
		
			//alert('Whatcha gonna lift, bro?'); //comment out for now, use non alert later
		} else {
			self.storageHandler.set('plateWeightsAvailable' + self.weightUnit(), newValue, true);
		}
	});
	
	//keep track of the quantities of ecah plate available (ex: home gym 225 = 45 + 35 + 10)
	self.plateWeightQuantities =  ko.observableArray(self.storageHandler.getWithDefault('plateWeightQuantities' + self.weightUnit(), plateWeightQuantities[self.weightUnit()], true));
	self.savePlateWeightQuantities = function() {
		self.storageHandler.set('plateWeightQuantities' + self.weightUnit(), self.plateWeightQuantities(), true);
		self.indexPlateWeightQuantities();
	};
	
	self.plateWeightQuantitiesIndex = {};
	self.indexPlateWeightQuantities = function() {
		self.plateWeightQuantitiesIndex = {};
		for (var i = 0, length = self.plateWeightQuantities().length; i < length; i++) {
			var weight = self.plateWeightQuantities()[i];
			self.plateWeightQuantitiesIndex[weight.size] = weight.total;
		}
	}; self.indexPlateWeightQuantities();
	
	
	
	self.showGhostLabel = ko.observable(true);
	
	self.weightToCalculate = ko.observable();
	//auto calc on 3 digits
	self.weightToCalculate.subscribe(function(newValue) {	
		self.showGhostLabel(false);
		
		weightLength = newValue === null ? 0 : newValue.length;
		
		if (weightLength == 3 && !self.multiWeightMode()) {
			self.isSelected(false);
		}
	});
	
	self.isSelected = ko.observable(true);
	self.isSelected.subscribe(function(newValue){
		
		if (!newValue) {
			self.calculateSets();
			setTimeout(self.resetInput, 500);
		}
	});
	
	self.resetInput = function() {
		self.weightToCalculate(null);
		self.showGhostLabel(true);
		//self.isSelected(true);
	};
	
	self.displayConfigurationsNumber = 3;
	
	self.allSetEntries = self.storageHandler.getWithDefault('setEntries', [], true);
	self.setEntries      = ko.observableArray(self.allSetEntries.slice(0, self.displayConfigurationsNumber));
	
	
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
	
	self.preferFewerPlates = ko.observable(self.storageHandler.getWithDefault('preferFewerPlates', 'false') != 'false');
	self.preferFewerPlates.subscribe(function(newValue){
		self.storageHandler.set('preferFewerPlates', newValue);
	});
	
	self.multiWeightMode = ko.observable(self.storageHandler.getWithDefault('multiWeightMode', 'false') != 'false');
	self.multiWeightMode.subscribe(function(newValue){
		self.storageHandler.set('multiWeightMode', newValue);
	});
	
	self.warmupScheme = ko.observableArray(self.storageHandler.getWithDefault('warmupScheme', warmupScheme, true));
	
	self.addWarmupSet = function() {
		self.warmupScheme.push({
			percent: null,
			reps:    null
		});
	};
	
	self.removeWarmupSet = function() {
		self.warmupScheme.pop();
	};
	
	self.serializeConfig = function() {
		var output = [];
		output.push('u: ' + self.weightUnit());
		output.push('bw: ' + self.barbellWeight());
		output.push('ig: ' + self.ignoreSmallPlates());
		output.push('op: ' + self.preferFewerPlates());
		output.push('mw: ' + self.multiWeightMode());
		
		for (var i = 0, j = self.warmupScheme().length; i < j;  i++) {
			output.push(self.warmupScheme()[i].reps + ' @ ' + self.warmupScheme()[i].percent + '%');
		}
		
		return output.join(' | ');
	};
	
	self.calculateSets = function() {
		
		
		if (self.weightToCalculate() === null || self.weightToCalculate() < self.barbellWeight() || (isNaN(self.weightToCalculate()) && !self.multiWeightMode())) {
			return false;
		}
		
		if (self.settingsVisible()) {
			self.toggleSettings();
		}

		var sc = new SetScheme({
			units:                 self.weightUnit(),
			barbellWeight:         self.barbellWeight(),
			weightToCalculate:     self.weightToCalculate(),
			plateWeightsAvailable: self.plateWeightsAvailable().slice(0),
			plateWeightQuantities: self.plateWeightQuantitiesIndex,
			ignoreSmallPlates:     self.ignoreSmallPlates(),
			warmupScheme:          self.warmupScheme().slice(0),
			optimize:              self.preferFewerPlates(),
			multiWeightMode:       self.multiWeightMode()
		});
		var sets = sc.calculateSets();
		
		
		var weightHeading = self.multiWeightMode() ? (sets.length > 0 ? sets[sets.length - 1].displayWeight : self.barbellWeight()) : self.weightToCalculate();
		
		//keep all plate configs (up to max amount constant)
		self.allSetEntries.unshift({
			unit:         self.weightUnit(),
			weight:       weightHeading,
			platePadding: sc.maxPlates,
			sets:         sets
		});
		self.allSetEntries.slice(0, 20);
		//but only display so many
		self.setEntries(self.allSetEntries.slice(0, self.displayConfigurationsNumber));
		
		
		self.storageHandler.set('setEntries', self.allSetEntries, true);
		
		ga('send', 'event', 'calculate', 'weight entered', self.weightToCalculate() + self.weightUnit());
		ga('send', 'event',  'calculate', 'config setings', self.serializeConfig());
		
	};
	
	
	
	self.slideDownConfig = function(e) {
		if (e.nodeType === 1) {
			//e.className += ' slidedown';
			$(e).hide().slideDown();
		}
	};
	
	self.settingsVisible = ko.observable(false);
	self.settingsVisible.subscribe(function(newValue) {	
		if (!newValue) {
			self.filterAndSaveWarmupScheme();
			self.savePlateWeightQuantities();
		}
		
	});
	
	self.filterAndSaveWarmupScheme = function(){
		self.warmupScheme(ko.utils.arrayFilter(self.warmupScheme(), function(warmup) {
			return warmup.reps > 0 && warmup.percent > 10;
		}));
		
		self.storageHandler.set('warmupScheme', self.warmupScheme(), true);
	};
	
	self.toggleSettings = function(e) {
		self.settingsVisible(!self.settingsVisible());
		
		var openClose = 'opened';
		if (!self.settingsVisible()) {
			openClose = 'closed';			
		} 

		ga('send', 'event', 'settings', 'toggled', openClose);
	};
};