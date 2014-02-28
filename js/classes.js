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
		'ignoreSmallPlates',
		'warmupScheme',
	];
	
	for (var i = 0; i < requiredKeys.length; i++) {
		if (typeof(data[requiredKeys[i]]) == 'undefined') {
			throw new Error('required key ' + requiredKeys[i] + ' is missing');
		}
		
		this[requiredKeys[i]] = data[requiredKeys[i]];
	}
	
	this.warmupScheme.push({ percent:100, reps: 0 });
	
	//determine how much padding we need to position sets at bottom of div
	this.maxPlates = 0;
	
	this.calculateSets = function() {
		var sets = [];
		
		for (var i = 0; i < this.warmupScheme.length; i++) { 
			var set = new SetFactory(
				parseInt(this.weightToCalculate * this.warmupScheme[i].percent / 100),
				this.barbellWeight,
				this.plateWeightsAvailable.slice(0),
				this.ignoreSmallPlates && this.warmupScheme[i].percent != 100,
				{
					percent: this.warmupScheme[i].percent,
					reps:    this.warmupScheme[i].reps,
					units:   this.units
				}
			);
			
			//set = po.optimize(set);
			
			sets.push(set);
			
			this.maxPlates = set.plateConfiguration.length > this.maxPlates ? set.plateConfiguration.length : this.maxPlates;	
		}
		
		return sets;
	}
}

function SetFactory(weightToCalculate, barbellWeight, platesToUsePassed, ignoreSmallPlates, setDisplayData) {
	
	var platesToUse = platesToUsePassed.slice();
	platesToUse.sort(function(a, b) { return a - b; });
	
	//get rid of the 2 smallest plates during warmups
	if (ignoreSmallPlates) {
		platesToUse = this.removeSmallPlates(platesToUse.slice(0), setDisplayData['units']);
	}
	
	//make a copy to store on the set
	var setPlatesToUse = platesToUse.slice(0);

	var set = this.calculateSet(weightToCalculate, barbellWeight, platesToUse);

	set.barbellWeight     = barbellWeight;
	set.platesToUse       = setPlatesToUse; 
	set.ignoreSmallPlates = ignoreSmallPlates;
	
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

SetFactory.prototype.calculateSet = function(weightToCalculate, barbellWeight, platesToUse) {
	//console.log(weightToCalculate);
	var left = weightToCalculate - barbellWeight;
			
	var plateConfiguration = [];
	var plateCount = 0;

	while (left > 0 && platesToUse.length > 0) {
		//go from heaviest to lightest
		var plateSize = platesToUse[platesToUse.length - 1];
		
		//need a balanced bar
		var weightToSubtract =  plateSize * 2;
		
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
		
		if (1==2) {
			
			//what is the ideal weight we should calculate, using all plates available
			var targetSet = new SetFactory(
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
			
			var minThreshold = .9;
			var maxThreshold = 1 + ((100 - set.percent) / 4 / 100);
			
			console.log('max threshold ' + maxThreshold);
			
			//the smallest difference between the targetSet weight and the bestCandidate (so far)
			minWeightDifference = targetSet.displayWeight - bestCandidateSet.displayWeight;
			
			//start at bottom of threshold, lighter could use fewer (e.g., knock off the 2.5lb plates)
			var candidateWeight = parseInt(set.displayWeight * minThreshold); 
			var thresholdWeight = parseInt(set.displayWeight * maxThreshold);
			var minWeightToAdd  = set.units == 'LB' ? 5 : 2; 
			
			
			console.log('target set weight ' + targetSet.displayWeight);
			console.log(set.displayWeight + ' ' + candidateWeight + ' ' + thresholdWeight + ' ' + minWeightToAdd);
		
			ii = 0;
			while (candidateWeight <= thresholdWeight && ii++ < 100) {

				var newSet = new SetFactory(
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