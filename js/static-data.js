var barbellWeights = {
	"LB": [45, 35],
	"KG": [20, 15]
};

var plateWeights = {
	"LB": [2.5,   5, 10, 25, 35, 45],
	"KG": [  1, 2.5,  5, 10, 15, 20]
};


var defaultPlates = {
	LB: [
		{ size: 2.5, total: 10, available: true },
		{ size: 5,   total: 10, available: true },
		{ size: 10,  total: 10, available: true },
		{ size: 25,  total: 10, available: true },
		{ size: 35,  total: 10, available: true },
		{ size: 45,  total: 10, available: true },
	],
	KG: [
		{ size: 1,   total: 10, available: true },
		{ size: 2.5, total: 10, available: true },
		{ size: 5,   total: 10, available: true },
		{ size: 10,  total: 10, available: true },
		{ size: 15,  total: 10, available: true },
		{ size: 20,  total: 10, available: true },
	]
};

var warmupScheme = [
	{ reps: 5, percent: 40},
	{ reps: 3, percent: 67},
	{ reps: 2, percent: 80},
	{ reps: 1, percent: 90}
];

//start = 0; end = start + 1; warmupScheme = warmupScheme.slice(start, end);