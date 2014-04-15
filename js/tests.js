QUnit.done(function() {
  clearTestItems();
});

var ga = function(){};
var testplateWeightQuantities = {
	"LB": {'2.5': 10, '5': 10, '10': 10, '25': 10, '35': 10, '45': 10},
	"KG": {'1': 10, '2.5': 10, '5': 10, '10': 10, '15': 10, '20': 10}
};

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
		
		var pWeights = plateWeights.LB.slice(0);
		var set = new SetFactory(
			135,
			barbellWeight,
			pWeights,
			testplateWeightQuantities.LB,
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
			var pWeights = plateWeights.LB.slice(0);
			return  new SetFactory(
				weightToCalculate,
				barbellWeight,
				pWeights,
				testplateWeightQuantities.LB,
				false,
				{
					percent: percentToCalculate,
					reps:    1,
					units:   'LB'
				}
			);
		};
		
		var testPlateConfiguration1 = [
			new PlateConfiguration(45, 1)
		];
		var set1 = simpleSetFactory(135, 100);
		equal(set1.displayWeight, 135);
		deepEqual(set1.plateConfiguration, testPlateConfiguration1, '1x45');
		
		var testPlateConfiguration2 = [
			new PlateConfiguration(45, 1),
			new PlateConfiguration(10, 1)
		];
		var set2 = simpleSetFactory(155, 100);
		equal(set2.displayWeight, 155);
		deepEqual(set2.plateConfiguration, testPlateConfiguration2, '1x45 + 1x10');
		
	});
	
	test('Set Factory Calculation Limited Plate Quantities', function(){	
		var simpleSetFactory = function(weightToCalculate, percentToCalculate) {
			var pWeights = plateWeights.LB.slice(0);
			return  new SetFactory(
				weightToCalculate,
				barbellWeight,
				pWeights,
				{'2.5': 10, '5': 10, '10': 10, '25': 10, '35': 10, '45': 1},
				false,
				{
					percent: percentToCalculate,
					reps:    1,
					units:   'LB'
				}
			);
		};
		
		var testPlateConfiguration1 = [
			new PlateConfiguration(45, 1),
			new PlateConfiguration(35, 1),
			new PlateConfiguration(10, 1)
		];
		var set1 = simpleSetFactory(225, 100);
		equal(set1.displayWeight, 225);
		deepEqual(set1.plateConfiguration, testPlateConfiguration1, '1x45 1x35 1x10');
	});

	
	
	test('Set Factory Calculation Ignore Small Plates', function(){	
		var simpleSetFactory = function(weightToCalculate, percentToCalculate) {
			var pWeights = plateWeights.LB.slice(0);
			return  new SetFactory(
				weightToCalculate,
				barbellWeight,
				pWeights,
				testplateWeightQuantities.LB,
				true,
				{
					percent: percentToCalculate,
					reps:    1,
					units:   'LB'
				}
			);
		};
		
		var testPlateConfiguration1 = [
			new PlateConfiguration(45, 1)
		];
		var set1 = simpleSetFactory(140, 100);
		equal( set1.displayWeight, 135);
		deepEqual(set1.plateConfiguration, testPlateConfiguration1, '140lb no small plates');
		
		var testPlateConfiguration2 = [
			new PlateConfiguration(45, 1)
		];
		var set2 = simpleSetFactory(145, 100);
		equal(set1.displayWeight, 135);
		deepEqual(set2.plateConfiguration, testPlateConfiguration2, '145 no small plates');
		
	});
	
	test('Set Factory Calculation Include Small Plates', function(){	
		var simpleSetFactory = function(weightToCalculate, percentToCalculate) {
			var pWeights = plateWeights.LB.slice(0);
			return  new SetFactory(
				weightToCalculate,
				barbellWeight,
				pWeights,
				testplateWeightQuantities.LB,
				false,
				{
					percent: percentToCalculate,
					reps:    1,
					units:   'LB'
				}
			);
		};
		
		var testPlateConfiguration1 = [
			new PlateConfiguration(45 , 1),
			new PlateConfiguration(2.5, 1)
		];
		var set1 = simpleSetFactory(140, 100);
		equal(set1.displayWeight, 140);
		deepEqual(set1.plateConfiguration, testPlateConfiguration1, '140lb with small plates');
		
		var testPlateConfiguration2 = [
			new PlateConfiguration(45, 1),
			new PlateConfiguration(5,  1)
		];
		var set2 = simpleSetFactory(145, 100);
		equal(set2.displayWeight, 145);
		deepEqual(set2.plateConfiguration, testPlateConfiguration2, '145 small plates');
		
		var testPlateConfiguration3 = [
			new PlateConfiguration(45 , 1),
			new PlateConfiguration(5  , 1),
			new PlateConfiguration(2.5, 1)
		];
		var set3 = simpleSetFactory(150, 100);
		equal(set3.displayWeight, 150);
		deepEqual(set3.plateConfiguration, testPlateConfiguration3, '150 small plates');
		
	});
	
	test('Set Factory Calculation Unavailable Plates', function(){	
		var simpleSetFactory = function(weightToCalculate, percentToCalculate) {
			var pWeights = [5,10,25,35,45];
			return  new SetFactory(
				weightToCalculate,
				barbellWeight,
				pWeights,
				testplateWeightQuantities.LB,
				true,
				{
					percent: percentToCalculate,
					reps:    1,
					units:   'LB'
				}
			);
		};
		
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
			var pWeights = plateWeights.LB.slice(0);
			return  new SetFactory(
				weightToCalculate,
				20,
				pWeights2,
				testplateWeightQuantities.KG,
				false,
				{
					percent: percentToCalculate,
					reps:    1,
					units:   'KG'
				}
			);
		};
		
		var testPlateConfiguration1 = [
			new PlateConfiguration(20, 1)
		];
		var set1 = simpleSetFactory(60, 100);
		equal(set1.displayWeight, 60);
		deepEqual(set1.plateConfiguration, testPlateConfiguration1, '1x20');
		
		var testPlateConfiguration2 = [
			new PlateConfiguration(20, 1),
			new PlateConfiguration(15, 1)
		];
		var set2 = simpleSetFactory(90, 100);
		equal(set2.displayWeight, 90);
		deepEqual(set2.plateConfiguration, testPlateConfiguration2, '1x20 + 1x15');
		
	});
	
	
	test('Set Factory Calculation Basics KG', function(){	
		var pWeights2 = plateWeights.KG.slice(0);
		var simpleSetFactory = function(weightToCalculate, percentToCalculate) {
			var pWeights = plateWeights.LB.slice(0);
			return  new SetFactory(
				weightToCalculate,
				20,
				pWeights2,
				testplateWeightQuantities.KG,
				true,
				{
					percent: percentToCalculate,
					reps:    1,
					units:   'KG'
				}
			);
		};
		
		var testPlateConfiguration1 = [
			new PlateConfiguration(20, 1)
		];
		var set1 = simpleSetFactory(62, 100);
		equal(set1.displayWeight, 60);
		deepEqual(set1.plateConfiguration, testPlateConfiguration1, '140lb no small plates');
		
		var testPlateConfiguration2 = [
			new PlateConfiguration(20, 1)
		];
		var set2 = simpleSetFactory(65, 100);
		equal(set1.displayWeight, 60);
		deepEqual(set2.plateConfiguration, testPlateConfiguration2, '145 no small plates');
		
	});
	
module('Set Scheme');
	test('Set Scheme set weights match expected: ignore small plates', function(){
		var sc = new SetScheme({
			units:                 'LB',
			barbellWeight:         45,
			weightToCalculate:     315,
			plateWeightsAvailable: plateWeights.LB,
			plateWeightQuantities: testplateWeightQuantities.LB,
			ignoreSmallPlates:     true,
			warmupScheme:          warmupScheme.slice(0)
		});
		
		var expectedWeights = [
			{percent: 40 , weight: 115},
			{percent: 67 , weight: 205},
			{percent: 80 , weight: 245},
			{percent: 90 , weight: 275},
			{percent: 100, weight: 315},
		];
		
		var sets = sc.calculateSets();
		
		for (var i = 0; i < sets.length; i++) {
		
			equal(sets[i].percent,  expectedWeights[i].percent, 'percent ok');
			equal(sets[i].displayWeight, expectedWeights[i].weight , 'weight ok');
		}

	});
	
	test('Set Scheme set weights match expected: include small plates', function(){
		var sc = new SetScheme({
			units:                 'LB',
			barbellWeight:         45,
			weightToCalculate:     315,
			plateWeightsAvailable: plateWeights.LB,
			plateWeightQuantities: testplateWeightQuantities.LB,
			ignoreSmallPlates:     false,
			warmupScheme:          warmupScheme.slice(0)
		});
		
		var expectedWeights = [
			{percent: 40 , weight: 125},
			{percent: 67 , weight: 210},
			{percent: 80 , weight: 250},
			{percent: 90 , weight: 280},
			{percent: 100, weight: 315},
		];
		
		var sets = sc.calculateSets();
		
		for (var i = 0; i < sets.length; i++) {
		
			equal(sets[i].percent, expectedWeights[i].percent, 'percent ok');
			equal(sets[i].displayWeight, expectedWeights[i].weight , 'weight ok');
		}

	});
	
	test('Set Scheme include optimize path', function(){
		var sc = new SetScheme({
			units:                 'LB',
			barbellWeight:         45,
			weightToCalculate:     315,
			plateWeightsAvailable: plateWeights.LB,
			plateWeightQuantities: testplateWeightQuantities.LB,
			ignoreSmallPlates:     false,
			warmupScheme:          warmupScheme.slice(0),
			optimize:              true
		});

		var expectedWeights = [
			{percent: 40 , weight: 125},
			{percent: 67 , weight: 210},
			{percent: 80 , weight: 250},
			{percent: 90 , weight: 280},
			{percent: 100, weight: 315},
		];
		
		var sets = sc.calculateSets();
		//sc.optimize(sets[4]);
		
		ok(sc.optimize, 'optimizer enabled');

	});

	
	test('Set Scheme missing required key', function(){
		throws(
			function() { 
				new SetScheme({
					units:                 'LB',
					barbellWeight:         45,
					weightToCalculate:     315,
					plateWeightsAvailable: plateWeights.LB,
					plateWeightQuantities: testplateWeightQuantities.LB,
					ignoreSmallPlates:     true,
				});
			},
			'Error(\'required key \' + requiredKeys[i] + \' is missing\');'	
		);
	});

module('Multiweight Mode');
	test('Basic multiweight', function(){
		var sc = new SetScheme({
			units:                 'LB',
			barbellWeight:         45,
			weightToCalculate:     '100*200,300+400#500;600',
			multiWeightMode:       true,
			plateWeightsAvailable: plateWeights.LB,
			plateWeightQuantities: testplateWeightQuantities.LB,
			ignoreSmallPlates:     true,
			warmupScheme:          warmupScheme.slice(0)
		});
		
		var expectedWeights = [
			{percent: 100, weight: 100},
			{percent: 100, weight: 200},
			{percent: 100, weight: 300},
			{percent: 100, weight: 400},
			{percent: 100, weight: 500},
			{percent: 100, weight: 600},
		];
		
		var sets = sc.calculateSets();
		
		for (var i = 0; i < sets.length; i++) {
		
			equal(sets[i].percent, expectedWeights[i].percent, '100 percent ok');
			equal(sets[i].displayWeight, expectedWeights[i].weight, expectedWeights[i].weight + ' weight ok');
		}

	});


module('Plate Optimizer');
	test('Plate Optimizer Instantiation', function(){
		var po = new PlateOptimizer();
		
		throws(function() { po.optimize(''); }, 'Error("PlateOptimizer.optimize accepts only Set() objects")');
	});
	
	test('Optimze to 1 plate from below 135', function(){
		var sc = new SetScheme({
			units:                 'LB',
			barbellWeight:         45,
			weightToCalculate:     260,
			plateWeightsAvailable: plateWeights.LB,
			plateWeightQuantities: testplateWeightQuantities.LB,
			ignoreSmallPlates:     false,
			warmupScheme:          [{reps: 1, percent: 50}]
		});

		var set = sc.calculateSets()[0];
		
		equal(set.percent, 50);
		
		var po = new PlateOptimizer();
		var optimized = po.optimize(set);
		
		equal(optimized.displayWeight, 135);
	});
	
	test('Trigger Overage', function(){
		var sc = new SetScheme({
			units:                 'LB',
			barbellWeight:         45,
			weightToCalculate:     810,
			plateWeightsAvailable: plateWeights.LB,
			plateWeightQuantities: testplateWeightQuantities.LB,
			ignoreSmallPlates:     false,
			warmupScheme:          [{reps: 1, percent: 50}]
		});

		var set = sc.calculateSets()[0];
				
		var po = new PlateOptimizer();
		var optimized = po.optimize(set);
		
		equal(optimized.displayWeight, 405);
	});

	
module('Storage Handler');	
	test('Storage Handler', function(){
		
		throws(function() { new StorageHandler(); }, 'Error(\'Environment (production/testing) must be set\')');
		
		var st = new StorageHandler('test');
		
		equal(st.isSupported(), true, 'storage supported');
		
		var stringContent1 = 'blah';
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
		
		unbindKo();
	});
	
	test('Hit non test branch of BarbellView', function(){
		expect(0);
		unbindKo();
		var bv = new BarbellView();
		unbindKo();
	});
	
	test('reset weight input', function(){
		unbindKo();
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		
		ok(bv.showGhostLabel());
		bv.weightToCalculate(135);
		
		equal(bv.weightToCalculate(), 135);
		ok(!bv.showGhostLabel());
		
		bv.resetInput();
		
		equal(bv.weightToCalculate(), null);
		ok(bv.showGhostLabel());
		
		unbindKo();
	});
	
	test('toggle settings', function(){
		unbindKo();
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		
		ok(!bv.settingsVisible());
		
		bv.toggleSettings();
		
		ok(bv.settingsVisible());
		
		bv.toggleSettings();
		
		ok(!bv.settingsVisible());

		
		unbindKo();
	});
	
	test('remove warmup', function(){
		unbindKo();
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		
		var warmupScheme = bv.warmupScheme().slice(0);
		
		deepEqual(bv.warmupScheme(), warmupScheme);
		equal(bv.warmupScheme().length, warmupScheme.length);
		
		bv.removeWarmupSet();
		
		notDeepEqual(bv.warmupScheme().length, warmupScheme.length);
		notEqual(bv.warmupScheme().length, warmupScheme.length);
		equal(bv.warmupScheme().length, warmupScheme.length - 1);
		
		unbindKo();
	});
	
	test('serialize config', function(){
		unbindKo();
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		bv.barbellWeight(45);
		bv.ignoreSmallPlates(true);
		bv.preferFewerPlates(false);
		bv.multiWeightMode(false);
		bv.warmupScheme([
			{ reps: 5, percent: 40},
			{ reps: 3, percent: 67},
			{ reps: 2, percent: 80},
			{ reps: 1, percent: 90}
		]);
		
		equal(bv.serializeConfig(), 'u: LB | bw: 45 | ig: true | op: false | mw: false | 5 @ 40% | 3 @ 67% | 2 @ 80% | 1 @ 90%');
		
		unbindKo();
	});
	
	test('filter and save warmup scheme', function(){
		unbindKo();
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		bv.warmupScheme([
			{ reps: 5, percent: 40},
			{ reps: 0, percent: 50}
		]);
		
		bv.filterAndSaveWarmupScheme();
		
		deepEqual(bv.warmupScheme(), [{ reps: 5, percent: 40 }]);
		
		bv.warmupScheme([
			{ reps: 5, percent: 40},
			{ reps: 10, percent: 5}
		]);
		
		bv.filterAndSaveWarmupScheme();
		
		deepEqual(bv.warmupScheme(), [{ reps: 5, percent: 40 }]);
		
		unbindKo();
	});
	
	test('index plate quantities', function(){
		unbindKo();
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		
		bv.plateWeightQuantities([
			{size: 1, total: 1},
			{size: 2, total: 2},
			{size: 3, total: 3},
			{size: 4, total: 4},
		]);

		bv.indexPlateWeightQuantities();
		console.log(bv.plateWeightQuantitiesIndex);
		for (var i = 1; i <= 4; i++) {
			equal(bv.plateWeightQuantitiesIndex[i], i);
		}
		
		unbindKo();
	});
	
	test('slide down config', function(){
		unbindKo();
		expect(0);
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		jQuery.noConflict();
		
		$ = function(){  return $; };
		$.hide = $.slideDown = function(){ return this; };
		
		bv.slideDownConfig({ nodeType: 1 });
		
		unbindKo();
	});
	
	test('add warmup set', function(){
		unbindKo();
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		
		bv.addWarmupSet();
		
		deepEqual(bv.warmupScheme().slice(0).pop(), { reps: null, percent: null });
		
		unbindKo();
	});
	
	asyncTest('is selected subscribe', function(){
		unbindKo();
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		
		bv.isSelected(true);
		bv.weightToCalculate(10);
		equal(bv.weightToCalculate(), 10);
		
		bv.isSelected(false);
		
		setTimeout(function(){
			equal(bv.weightToCalculate(), null);
			
			start();
				
		}, 600);
		
		unbindKo();
	});
	
	asyncTest('is selected timeout too fast', function(){
		unbindKo();
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		
		bv.isSelected(true);
		bv.weightToCalculate(10);
		equal(bv.weightToCalculate(), 10);
		
		bv.isSelected(false);
		
		setTimeout(function(){
			notEqual(bv.weightToCalculate(), null);
			
			start();
				
		}, 100);
		
		unbindKo();
	});
	
	test('config toggles', function(){
		unbindKo();
		expect(0);
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		
		bv.ignoreSmallPlates(false);
		bv.preferFewerPlates(false);
		bv.multiWeightMode(false);
		
		bv.ignoreSmallPlates(true);
		bv.preferFewerPlates(true);
		bv.multiWeightMode(true);
		
		unbindKo();
	});
	
	test('plate class', function(){
		unbindKo();
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		
		equal(bv.plateClass(45,  'LB', 1), 'plate-45LB plate-count-1');
		equal(bv.plateClass(2.5, 'LB', 1), 'plate-2--5LB plate-count-1');
		
		unbindKo();
	});
	
	test('pad and reverse', function(){
		unbindKo();
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		
		var inputPlateArray = [
			{ size: 45, count: 1 },
			{ size: 35, count: 1 }
		];
		
		var paddedPlateArray = inputPlateArray.slice(0);
		paddedPlateArray.push({ size: 0, count: 0 });
		paddedPlateArray = paddedPlateArray.reverse();
		
		deepEqual(bv.padAndReverse(inputPlateArray.slice(), 3), paddedPlateArray);
		
		unbindKo();
	});
	
	test('calculate sets', function(){
		unbindKo();
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		
		bv.weightToCalculate(null);
		equal(bv.calculateSets(), false);
		
		bv.barbellWeight(45);
		bv.weightToCalculate(40);
		equal(bv.calculateSets(), false);
		
		bv.multiWeightMode(false);
		bv.weightToCalculate('blah');
		equal(bv.calculateSets(), false);
		
		var warmupScheme = [
			{ reps: 5, percent: 40},
			{ reps: 3, percent: 67},
			{ reps: 2, percent: 80},
			{ reps: 1, percent: 90}
		];

		bv.warmupScheme(warmupScheme);
		bv.barbellWeight(45);
		bv.weightToCalculate(225);
		bv.settingsVisible(true);
		bv.calculateSets();
		var topSet = JSON.parse('{"unit":"LB","weight":225,"platePadding":2,"sets":[{"displayWeight":85,"plateConfiguration":[{"size":10,"count":2}],"barbellWeight":45,"platesToUse":[10,25,35,45],"ignoreSmallPlates":true,"percent":40,"reps":5,"units":"LB"},{"displayWeight":135,"plateConfiguration":[{"size":45,"count":1}],"barbellWeight":45,"platesToUse":[10,25,35,45],"ignoreSmallPlates":true,"percent":67,"reps":3,"units":"LB"},{"displayWeight":175,"plateConfiguration":[{"size":45,"count":1},{"size":10,"count":2}],"barbellWeight":45,"platesToUse":[10,25,35,45],"ignoreSmallPlates":true,"percent":80,"reps":2,"units":"LB"},{"displayWeight":185,"plateConfiguration":[{"size":45,"count":1},{"size":25,"count":1}],"barbellWeight":45,"platesToUse":[10,25,35,45],"ignoreSmallPlates":true,"percent":90,"reps":1,"units":"LB"},{"displayWeight":225,"plateConfiguration":[{"size":45,"count":2}],"barbellWeight":45,"platesToUse":[2.5,5,10,25,35,45],"ignoreSmallPlates":false,"percent":100,"reps":0,"units":"LB"}]}');
		
		//equal(bv.allSetEntries[0].platePadding, topSet.platePadding);
		equal(bv.allSetEntries[0].unit, topSet.unit);
		equal(bv.allSetEntries[0].weight, topSet.weight);
		equal(bv.allSetEntries[0].sets.length, topSet.sets.length);
		//deepEqual(bv.allSetEntries[0].sets, topSet.sets);
		
		//deepEqual(bv.allSetEntries[0], topSet);
		
		unbindKo();
	});
	
	test('weight to calculate ui', function(){
		unbindKo();
		
		var bv = new BarbellView('test');
		ko.applyBindings(bv);
		bv.weightUnit('LB');
		
		ok(bv.showGhostLabel());
		ok(bv.isSelected());
		
		bv.weightToCalculate(1);
		ok(!bv.showGhostLabel());
		ok(bv.isSelected());
		
		bv.multiWeightMode(false);
		bv.weightToCalculate('155');
		ok(!bv.showGhostLabel());
		ok(!bv.isSelected());
		
		
		
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