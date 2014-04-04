function PlateConfiguration(size, count) {
	this.size  = size;
	this.count = count;
}

function Set(displayWeight, plateConfiguration) {	
	this.displayWeight      = displayWeight;
	this.plateConfiguration = plateConfiguration;
}

function SetScheme(data) {
	var requiredKeys = [
		'units',
		'barbellWeight',
		'weightToCalculate',
		'plateWeightsAvailable',
		'plateWeightQuantities',
		'ignoreSmallPlates',
		'warmupScheme'
	];
	
	var additionalKeys = [
		'optimize',
		'multiWeightMode'
	];
	
	for (var i = 0; i < requiredKeys.length; i++) {
		if (typeof(data[requiredKeys[i]]) == 'undefined') {
			throw new Error('required key ' + requiredKeys[i] + ' is missing');
		}
		
		this[requiredKeys[i]] = data[requiredKeys[i]];
	}
	
	for (var i = 0; i < additionalKeys.length; i++) {
		if (typeof(data[additionalKeys[i]]) != 'undefined') {
			this[additionalKeys[i]] = data[additionalKeys[i]];
		} else {
			this[additionalKeys[i]] = false;
		}
	}
	
	
	this.warmupScheme.push({ percent:100, reps: 0 });
	
	
	//determine how much padding we need to position sets at bottom of div
	this.maxPlates = 0;
	
	this.calculateSets = function() {
		
		if (this.multiWeightMode) {
			var multiWeights = this.weightToCalculate.split(/[\s*,+#;]+/);
			this.warmupScheme = [];
			var weightsToCalculate = []
			for (var i = 0, j = multiWeights.length; i < j; i++) {
				if (!isNaN(multiWeights[i]) && multiWeights[i] > 0) {
					this.warmupScheme.push({ percent:100, reps: 0 });
					weightsToCalculate.push(multiWeights[i]);
				}
			}
		}
		
		var sets = [];
		var po = new PlateOptimizer();
		for (var i = 0; i < this.warmupScheme.length; i++) { 
			var weightToCalculate = this.multiWeightMode
								  ? weightsToCalculate[i]
								  : parseInt(this.weightToCalculate * this.warmupScheme[i].percent / 100)
			;

			var set = new SetFactory(
				weightToCalculate,
				this.barbellWeight,
				this.plateWeightsAvailable.slice(0),
				this.plateWeightQuantities,
				this.ignoreSmallPlates && this.warmupScheme[i].percent != 100,
				{
					percent: this.warmupScheme[i].percent,
					reps:    this.warmupScheme[i].reps,
					units:   this.units
				}
			);
			
			if (this.optimize) {
				set = po.optimize(set);
			}
			
			sets.push(set);
			
			this.maxPlates = set.plateConfiguration.length > this.maxPlates ? set.plateConfiguration.length : this.maxPlates;	
		}
		
		return sets;
	}
}

function SetFactory(weightToCalculate, barbellWeight, platesToUsePassed, plateWeightQuantities, ignoreSmallPlates, setDisplayData) {
	
	var platesToUse = platesToUsePassed.slice();
	platesToUse.sort(function(a, b) { return a - b; });
	
	//get rid of the 2 smallest plates during warmups
	if (ignoreSmallPlates) {
		platesToUse = this.removeSmallPlates(platesToUse.slice(0), setDisplayData['units']);
	}
	
	//make a copy to store on the set
	var setPlatesToUse = platesToUse.slice(0);
	
	var set = this.calculateSet(weightToCalculate, barbellWeight, platesToUse, plateWeightQuantities);

	set.barbellWeight     = barbellWeight;
	set.platesToUse       = setPlatesToUse; 
	set.ignoreSmallPlates = ignoreSmallPlates;
	
	set.plateWeightQuantities = plateWeightQuantities;
	
	if (typeof(setDisplayData) == 'object') {
		for (var key in setDisplayData) {
			set[key] = setDisplayData[key];
		}
	}
	
	return set;
}
SetFactory.prototype.removeSmallPlates = function(platesToUse, units) {
	var smallPlates = [];
	smallPlates.push(
		platesToUse.shift(), 
		platesToUse.shift()
	);
	
	if (units == 'LB') {
		plateThreshold = 5;
	} else {
		plateThreshold = 2.5;
	}
	
	for (var i = 0; i < smallPlates.length; i++) {
		if (smallPlates[i] > plateThreshold) {
			platesToUse.unshift(smallPlates[i]);
		}
	}
	
	return platesToUse;
}

SetFactory.prototype.calculateSet = function(weightToCalculate, barbellWeight, platesToUse, plateWeightQuantities) {
	//console.log(weightToCalculate);
	var left = weightToCalculate - barbellWeight;
			
	var plateConfiguration = [];
	var plateCount = 0;
	
	while (left > 0 && platesToUse.length > 0) {
		//go from heaviest to lightest
		var plateSize = platesToUse[platesToUse.length - 1];
		var platesLeft = parseInt(plateWeightQuantities[plateSize]) - plateCount;
		
		//need a balanced bar
		var weightToSubtract =  plateSize * 2;
		
		//we can still use this plate
		if (left - weightToSubtract >= 0 && platesLeft > 0) {
			left -= weightToSubtract;
			plateCount++;
		} else {
			platesToUse.pop();
		}
		
		if (plateCount > 0 && (platesLeft == 0 || left - weightToSubtract < 0)) {
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
		
		var bestCandidateSet = set;
		var platesToUse = set.platesToUse.slice();
		
		if (1==1) {
			//console.log(set.plateWeightQuantities);
			//what is the ideal weight we should calculate, using all plates available
			var targetSet = new SetFactory(
				set.displayWeight,
				set.barbellWeight,
				set.platesToUse,
				set.plateWeightQuantities,
				false,
				{
					percent: set.percent,
					reps:    set.reps,
					units:   set.units
				}
			);
			
			
			var minThreshold = .9;
			var maxThreshold = 1 + ((100 - set.percent) / 2.5 / 100);
			
			var maxConcreteShortage = set.units == 'LB' ? 15 : 8;
			var maxConcreteOverage  = set.units == 'LB' ? 20 : 10; 
			/*
			var minThreshold = 20;
			var maxThreshold = 20;
			*/

			//console.log('max threshold ' + maxThreshold);
			
			//the smallest difference between the targetSet weight and the bestCandidate (so far)
			var minWeightDifference = targetSet.displayWeight - bestCandidateSet.displayWeight;
			var minWeightToAdd  = set.units == 'LB' ? 5 : 2; 
			
			//start at bottom of threshold, lighter could use fewer (e.g., knock off the 2.5lb plates)
			var candidateWeight = minWeightToAdd * Math.round(parseInt(set.displayWeight * minThreshold) / minWeightToAdd); 
			var thresholdWeight = minWeightToAdd * Math.round(parseInt(set.displayWeight * maxThreshold) / minWeightToAdd);
			
			
			if (candidateWeight < set.displayWeight - maxConcreteShortage) {
				candidateWeight = set.displayWeight - maxConcreteShortage;
			}
			
			if (thresholdWeight > set.displayWeight + maxConcreteOverage) {
				thresholdWeight = set.displayWeight + maxConcreteOverage;
			}
			
			//console.log('target set weight ' + targetSet.displayWeight);
			//console.log(set.displayWeight + ' ' + candidateWeight + ' ' + thresholdWeight + ' ' + minWeightToAdd);
		
			var j = 0;
			while (candidateWeight <= thresholdWeight && j++ < 10) {

				var newSet = new SetFactory(
					candidateWeight,
					set.barbellWeight,
					set.platesToUse,
					set.plateWeightQuantities,
					false,
					{
						percent: set.percent,
						reps:    set.reps,
						units:   set.units
					}
				);
				
				//console.log('candidate: ' + candidateWeight);
				
				candidateWeight += minWeightToAdd;
								
				//if the newSet is smaller to the target
				newSetDifference = Math.abs(newSet.displayWeight - targetSet.displayWeight);
				
				
				if (newSet.plateConfiguration.length <= bestCandidateSet.plateConfiguration.length) {
					bestCandidateSet = newSet;
					minWeightDifference = newSetDifference;
				} 
				/*
				else if (newSetDifference < minWeightDifference) {
					bestCandidateSet = newSet;
					minWeightDifference = newSetDifference;
				
				//or if it's the same with fewer plates
				} 
				*/
			}
		}

		return bestCandidateSet;
	}
}


function StorageHandler(environment)
{
	if (typeof(environment) != 'string' || environment.length == 0) {
		throw new Error('Environment (production/testing) must be set');
	}
	
	this.environment = environment;
	
	this.isSupported = function()
	{
		return typeof(Storage) !== 'undefined';
	}
	
	this.getKey = function(key)
	{
		return this.environment + '-' + key;
	}
	
	this.getWithDefault = function(key, defaultValue, isArray)
	{
	
	
		if (this.isSupported() && this.storageKeyExists(key)) {
			
			if (isArray) {
				return JSON.parse(localStorage[this.getKey(key)]);
			} else {
				return localStorage[this.getKey(key)];
			}
		} else {
			return defaultValue;
		}
	}
	
	this.storageKeyExists = function(key) 
	{
		return typeof(localStorage[this.getKey(key)]) !== 'undefined';
	}
	
	this.set = function(key, value, isArray)
	{
		
		if (this.isSupported()) {
			if (isArray) {
				value = JSON.stringify(value);
			}
		
			localStorage[this.getKey(key)] = value;
		}
	}
}