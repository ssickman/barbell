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