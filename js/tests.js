QUnit.done(function() {
  clearTestItems();
});

module('Class Construction');
	var pcSize  = 1;
	var pcCount = 1;
	var sDisplayWeight      = 135;
	var sPlateConfiguration = [new PlateConfiguration(pcSize, pcCount)];
		
	var barbellWeight = 45;
	var weightToCalculate = 135;	
		
	
	test('plate configurtaion', function(){
		
		var pc = new PlateConfiguration(pcSize, pcCount);
		
		equal(pc.size,  pcSize,  'size');
		equal(pc.count, pcCount, 'count');
	});
	
	test('set', function(){	
		var s = new Set(sDisplayWeight, sPlateConfiguration);  
		
		equal(s.displayWeight,      sDisplayWeight);
		equal(s.plateConfiguration, sPlateConfiguration);
	});

	
	test('Set Factory Basics', function(){	
		
		var pWeights = plateWeights.LB.slice(0)
		var set = new SetFactory(
			135,
			barbellWeight,
			pWeights,
			false,
			{
				percent: 100,
				reps:    1,
				units:   'LB'
			}
		);
		
		equal(set.percent, 100);
		equal(set.reps, 1);
		equal(set.units, 'LB');
	});
	
module('Class Functionality');
	test('Set Factory Calculation Basics', function(){	
		var simpleSetFactory = function(weightToCalculate, percentToCalculate) {
			var pWeights = plateWeights.LB.slice(0)
			return  new SetFactory(
				weightToCalculate,
				barbellWeight,
				pWeights,
				false,
				{
					percent: percentToCalculate,
					reps:    1,
					units:   'LB'
				}
			);
		}
		
		var testPlateConfiguration1 = [
			new PlateConfiguration(45, 1)
		];
		var set1 = simpleSetFactory(135, 100);
		equal(135, set1.displayWeight);
		deepEqual(set1.plateConfiguration, testPlateConfiguration1, '1x45');
		
		var testPlateConfiguration2 = [
			new PlateConfiguration(45, 1),
			new PlateConfiguration(10, 1)
		];
		var set2 = simpleSetFactory(155, 100);
		equal(155, set2.displayWeight);
		deepEqual(set2.plateConfiguration, testPlateConfiguration2, '1x45 + 1x10');
		
	});
	
	
	test('Set Factory Calculation Ignore Small Plates', function(){	
		var simpleSetFactory = function(weightToCalculate, percentToCalculate) {
			var pWeights = plateWeights.LB.slice(0)
			return  new SetFactory(
				weightToCalculate,
				barbellWeight,
				pWeights,
				true,
				{
					percent: percentToCalculate,
					reps:    1,
					units:   'LB'
				}
			);
		}
		
		var testPlateConfiguration1 = [
			new PlateConfiguration(45, 1)
		];
		var set1 = simpleSetFactory(140, 100);
		equal(135, set1.displayWeight);
		deepEqual(set1.plateConfiguration, testPlateConfiguration1, '140lb no small plates');
		
		var testPlateConfiguration2 = [
			new PlateConfiguration(45, 1)
		];
		var set2 = simpleSetFactory(145, 100);
		equal(135, set1.displayWeight);
		deepEqual(set2.plateConfiguration, testPlateConfiguration2, '145 no small plates');
		
	});
	
	test('Set Factory Calculation Include Small Plates', function(){	
		var simpleSetFactory = function(weightToCalculate, percentToCalculate) {
			var pWeights = plateWeights.LB.slice(0)
			return  new SetFactory(
				weightToCalculate,
				barbellWeight,
				pWeights,
				false,
				{
					percent: percentToCalculate,
					reps:    1,
					units:   'LB'
				}
			);
		}
		
		var testPlateConfiguration1 = [
			new PlateConfiguration(45 , 1),
			new PlateConfiguration(2.5, 1)
		];
		var set1 = simpleSetFactory(140, 100);
		equal(140, set1.displayWeight);
		deepEqual(set1.plateConfiguration, testPlateConfiguration1, '140lb with small plates');
		
		var testPlateConfiguration2 = [
			new PlateConfiguration(45, 1),
			new PlateConfiguration(5,  1)
		];
		var set2 = simpleSetFactory(145, 100);
		equal(145, set2.displayWeight);
		deepEqual(set2.plateConfiguration, testPlateConfiguration2, '145 small plates');
		
		var testPlateConfiguration3 = [
			new PlateConfiguration(45 , 1),
			new PlateConfiguration(5  , 1),
			new PlateConfiguration(2.5, 1)
		];
		var set3 = simpleSetFactory(150, 100);
		equal(150, set3.displayWeight);
		deepEqual(set3.plateConfiguration, testPlateConfiguration3, '150 small plates');
		
	});
	
	test('Set Factory Calculation Unavailable Plates', function(){	
		var simpleSetFactory = function(weightToCalculate, percentToCalculate) {
			var pWeights = [5,10,25,35,45];
			return  new SetFactory(
				weightToCalculate,
				barbellWeight,
				pWeights,
				true,
				{
					percent: percentToCalculate,
					reps:    1,
					units:   'LB'
				}
			);
		}
		
		var testPlateConfiguration1 = [
			new PlateConfiguration(45, 1),
			new PlateConfiguration(10, 1)
		];
		var set1 = simpleSetFactory(155, 100);
		deepEqual(set1.plateConfiguration, testPlateConfiguration1, '155lb only remove small plates even when one is not available');
				
	});
	
	test('Set Factory Calculation Basics KG', function(){	
		var pWeights2 = plateWeights.KG.slice(0);
		var simpleSetFactory = function(weightToCalculate, percentToCalculate) {
			var pWeights = plateWeights.LB.slice(0)
			return  new SetFactory(
				weightToCalculate,
				20,
				pWeights2,
				false,
				{
					percent: percentToCalculate,
					reps:    1,
					units:   'KG'
				}
			);
		}
		
		var testPlateConfiguration1 = [
			new PlateConfiguration(20, 1)
		];
		var set1 = simpleSetFactory(60, 100);
		equal(60, set1.displayWeight);
		deepEqual(set1.plateConfiguration, testPlateConfiguration1, '1x20');
		
		var testPlateConfiguration2 = [
			new PlateConfiguration(20, 1),
			new PlateConfiguration(15, 1)
		];
		var set2 = simpleSetFactory(90, 100);
		equal(90, set2.displayWeight);
		deepEqual(set2.plateConfiguration, testPlateConfiguration2, '1x20 + 1x15');
		
	});
	
	
	test('Set Factory Calculation Basics KG', function(){	
		var pWeights2 = plateWeights.KG.slice(0);
		var simpleSetFactory = function(weightToCalculate, percentToCalculate) {
			var pWeights = plateWeights.LB.slice(0)
			return  new SetFactory(
				weightToCalculate,
				20,
				pWeights2,
				true,
				{
					percent: percentToCalculate,
					reps:    1,
					units:   'KG'
				}
			);
		}
		
		var testPlateConfiguration1 = [
			new PlateConfiguration(20, 1)
		];
		var set1 = simpleSetFactory(62, 100);
		equal(60, set1.displayWeight);
		deepEqual(set1.plateConfiguration, testPlateConfiguration1, '140lb no small plates');
		
		var testPlateConfiguration2 = [
			new PlateConfiguration(20, 1)
		];
		var set2 = simpleSetFactory(65, 100);
		equal(60, set1.displayWeight);
		deepEqual(set2.plateConfiguration, testPlateConfiguration2, '145 no small plates');
		
	});
	
	test('Plate Optimizer', function(){
		var po = new PlateOptimizer();
		
		throws(function() { po.optimize(''); }, 'Error("PlateOptimizer.optimize accepts only Set() objects")');
	});
	
module('Set Scheme');
	test('Set Scheme set weights match expected: ignore small plates', function(){
		var sc = new SetScheme({
			units:                 'LB',
			barbellWeight:         45,
			weightToCalculate:     315,
			plateWeightsAvailable: plateWeights.LB,
			ignoreSmallPlates:     true,
			warmupScheme:          warmupScheme.slice(0)
		});
		
		var expectedWeights = [
			{percent: 40 , weight: 115},
			{percent: 67 , weight: 205},
			{percent: 80 , weight: 245},
			{percent: 90 , weight: 275},
			{percent: 100, weight: 315},
		]
		
		var sets = sc.calculateSets();
		
		for (var i = 0; i < sets.length; i++) {
		
			equal(expectedWeights[i].percent, sets[i].percent, 'percent ok');
			equal(expectedWeights[i].weight , sets[i].displayWeight, 'weight ok');
		}

	});
	
	test('Set Scheme set weights match expected: include small plates', function(){
		var sc = new SetScheme({
			units:                 'LB',
			barbellWeight:         45,
			weightToCalculate:     315,
			plateWeightsAvailable: plateWeights.LB,
			ignoreSmallPlates:     false,
			warmupScheme:          warmupScheme.slice(0)
		});
		
		var expectedWeights = [
			{percent: 40 , weight: 125},
			{percent: 67 , weight: 210},
			{percent: 80 , weight: 250},
			{percent: 90 , weight: 280},
			{percent: 100, weight: 315},
		]
		
		var sets = sc.calculateSets();
		
		for (var i = 0; i < sets.length; i++) {
		
			equal(expectedWeights[i].percent, sets[i].percent, 'percent ok');
			equal(expectedWeights[i].weight , sets[i].displayWeight, 'weight ok');
		}

	});
	
	test('Set Scheme missing required key', function(){
		throws(
			function() { 
				new SetScheme({
					units:                 'LB',
					barbellWeight:         45,
					weightToCalculate:     315,
					plateWeightsAvailable: plateWeights.LB,
					ignoreSmallPlates:     true,
				});
			},
			'Error(\'required key \' + requiredKeys[i] + \' is missing\');'	
		);
	});

	
module('Storage Handler');	
	test('Storage Handler', function(){
		
		throws(function() { new StorageHandler(); }, 'Error(\'Environment (production/testing) must be set\')');
		
		var st = new StorageHandler('test');
		
		equal(st.isSupported(), true, 'storage supported');
		
		var stringContent1 = 'blah'
		var stringContent2 = 'wow';
		var stringKey      = 'test1';
		
		equal(st.getWithDefault(stringKey, stringContent1), stringContent1, 'returns default passed in');
		
		notEqual(st.storageKeyExists(stringKey), true, 'key does not exist');
		
		st.set(stringKey, stringContent2);
		
		equal(st.storageKeyExists(stringKey), true, 'key exists');
		
		equal(st.getWithDefault(stringKey, stringContent1), stringContent2, 'equals what was set');
		notEqual(st.getWithDefault(stringKey, stringContent1), stringContent1, 'does not equal default passed in');
		
		
		var arrayContent1 = ['blah', 'wow'];
		var arrayContent2 = ['wow', 'blah'];
		var arrayKey      = 'test2';
		
		equal(st.getWithDefault(arrayKey, arrayContent1, true), arrayContent1, 'returns default passed in');
		
		notEqual(st.storageKeyExists(arrayKey), true, 'key does not exist');
		
		st.set(arrayKey, arrayContent2, true);
		
		equal(st.storageKeyExists(arrayKey), true, 'key exists');
		
		deepEqual(st.getWithDefault(arrayKey, arrayContent1, true), arrayContent2, 'equals what was set');
		notEqual(st.getWithDefault(arrayKey, arrayContent1), arrayContent1, 'does not equal default passed in');
	});
	
module('BarbellView');
	test('Initialization', function(){
		unbindKo();
		
		var defaultUnit = 'LB';
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		
		ok(bv instanceof BarbellView, 'correct type');
		
		
		equal(bv.weightUnit(), defaultUnit, 'default unit: LB');
		
		equal(bv.barbellWeightDisplay(100), '100 LB');
		
		ok(bv.storageHandler instanceof StorageHandler, 'correct type');
		
		deepEqual(bv.barbellWeights(), barbellWeights[defaultUnit], 'barbell weights loaded');
	
		deepEqual(bv.plateWeights(), plateWeights[defaultUnit], 'plate weights loaded');
		deepEqual(bv.plateWeightsAvailable(), plateWeights[defaultUnit], 'weights available equals all weights for given units');
		deepEqual(bv.plateWeights(), bv.plateWeightsAvailable() , 'weights available equals BarbellView copy of default');

		ok(bv.showGhostLabel(), 'weight label on by default');
		
		
		defaultUnit = 'KG';
		bv.weightUnit(defaultUnit);
		
		equal(bv.weightUnit(), defaultUnit, 'changed to metric');
		deepEqual(bv.barbellWeights(), barbellWeights[defaultUnit], 'barbell weights loaded');
	
		equal(bv.barbellWeightDisplay(100), '100 KG');
		
		deepEqual(bv.plateWeights(), plateWeights[defaultUnit], 'plate weights loaded');
		deepEqual(bv.plateWeightsAvailable(), plateWeights[defaultUnit], 'weights available equals all weights for given units');
		deepEqual(bv.plateWeights(), bv.plateWeightsAvailable() , 'weights available equals BarbellView copy of default');
		
		
	});	
	
	test('Select available plates', function(){
		unbindKo();
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		
		var plateWeightsTest = plateWeights.LB.slice(0);
		bv.plateWeightsAvailable(plateWeightsTest.slice(2));
		
		notDeepEqual(plateWeightsTest, bv.plateWeightsAvailable(), 'bv copy no longer equal to default available plates');
		
		bv.plateWeightsAvailable(plateWeights.LB.slice(0, 1));
		equal(bv.plateWeightsAvailable().length, 1, 'number of plates set correctly');
		
		bv.plateWeightsAvailable([]);
		
		notEqual(bv.plateWeightsAvailable().length, 0, 'prevent no plates available');

	});
	
	test('Hit non test branch of BarbellView', function(){
		expect(0);
		unbindKo();
		var bv = new BarbellView();
		unbindKo();
	});




QUnit.done(function(details) {
  clearTestItems();
  console.log( "Total: ", details.total, " | Failed: ", details.failed, " Passed: ", details.passed, " Runtime: ", details.runtime );
});	

	
function clearTestItems()
{
	if (typeof(Storage) == 'undefined') {
		return false;
	}
	
	for (var key in localStorage) {
		if (key.indexOf('test-') === 0) {
			localStorage.removeItem(key);
		}
	}
}	

function unbindKo(){
	ko.cleanNode(document);
}