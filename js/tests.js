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
	
	
	test('Set Factory Calculation Basics', function(){	
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
		//expect(0);
		
		var defaultUnit = 'LB';
		
		var bv = new BarbellView();
		ko.applyBindings(bv);
		
		ok(bv instanceof BarbellView, 'correct type');
		
		deepEqual(bv.weightUnit(), defaultUnit, 'default unit: LB');
		
		ok(bv.storageHandler instanceof StorageHandler, 'correct type');
		
		deepEqual(bv.barbellWeights(), barbellWeights[defaultUnit], 'barbell weights loaded');
	
		deepEqual(bv.plateWeights(), plateWeights[defaultUnit], 'plate weights loaded');
		deepEqual(bv.plateWeightsAvailable(), plateWeights[defaultUnit], 'weights available equals all weights for given units');
		deepEqual(bv.plateWeights(), bv.plateWeightsAvailable() , 'weights available equals BarbellView copy of default');

		ok(bv.showGhostLabel(), 'weight label on by default');
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