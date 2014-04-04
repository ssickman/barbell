var barbellWeights = {
	"LB": [45, 35],
	"KG": [20, 15]
};

var plateWeights = {
	"LB": [2.5,   5, 10, 25, 35, 45],
	"KG": [  1, 2.5,  5, 10, 15, 20]
};

var plateWeightQuantities = {};

for (unit in plateWeights) {
	plateWeightQuantities[unit] = [];
	
	for (var i = 0, length = plateWeights[unit].length; i < length; i++) {
		plateWeightQuantities[unit].push({size: plateWeights[unit][i], total: 10});
	}
}

var warmupScheme = [
	{ reps: 5, percent: 40},
	{ reps: 3, percent: 67},
	{ reps: 2, percent: 80},
	{ reps: 1, percent: 90}
];

//start = 0; end = start + 1; warmupScheme = warmupScheme.slice(start, end);