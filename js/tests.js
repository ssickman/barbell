existingLocalStorage = {};
for (key in localStorage) {
	existingLocalStorage[key] = localStorage[key].replace('', '');
}
localStorage.clear();


module('class construction');
	pcSize  = 1;
	pcCount = 1;
	sDisplayWeight      = 135;
	sPlateConfiguration = [new PlateConfiguration(pcSize, pcCount)];
		
	barbellWeight = 45;
	weightToCalculate = 135;	
		
	
	test('plate configurtaion', function(){
		
		pc = new PlateConfiguration(pcSize, pcCount);
		
		equal(pc.size,  pcSize,  'size');
		equal(pc.count, pcCount, 'count');
	});
	
	test('set', function(){	
		s = new Set(sDisplayWeight, sPlateConfiguration);  
		
		equal(s.displayWeight,      sDisplayWeight);
		equal(s.plateConfiguration, sPlateConfiguration);
	});

	
	test('set factory', function(){	
		
		pWeights = plateWeights.LB.slice(0)
		set = new SetFactory(
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
	
	test('storage handler', function(){
		localStorage.clear();
		st = new StorageHandler();
		
		equal(st.isSupported(), true, 'storage supported');
		
		stringContent1 = 'blah'
		stringContent2 = 'wow';
		stringKey      = 'test1';
		
		equal(st.getWithDefault(stringKey, stringContent1), stringContent1, 'returns default passed in');
		
		notEqual(st.storageKeyExists(stringKey), true, 'key does not exist');
		
		st.set(stringKey, stringContent2);
		
		equal(st.storageKeyExists(stringKey), true, 'key exists');
		
		equal(st.getWithDefault(stringKey, stringContent1), stringContent2, 'equals what was set');
		notEqual(st.getWithDefault(stringKey, stringContent1), stringContent1, 'does not equal default passed in');
		
		
		arrayContent1 = ['blah', 'wow'];
		arrayContent2 = ['wow', 'blah'];
		arrayKey      = 'test2';
		
		equal(st.getWithDefault(arrayKey, arrayContent1, true), arrayContent1, 'returns default passed in');
		
		notEqual(st.storageKeyExists(arrayKey), true, 'key does not exist');
		
		st.set(arrayKey, arrayContent2, true);
		
		equal(st.storageKeyExists(arrayKey), true, 'key exists');
		
		deepEqual(st.getWithDefault(arrayKey, arrayContent1, true), arrayContent2, 'equals what was set');
		notEqual(st.getWithDefault(arrayKey, arrayContent1), arrayContent1, 'does not equal default passed in');
	});
	
	test('plate optimizer', function(){
		po = new PlateOptimizer();
		
		try {
			po.optimize('');	
		} catch (error) {
			equal(error.message, 'PlateOptimizer.optimize accepts only Set() objects', 'type checking');
		}
	});
	

localStorage.clear();
for (key in existingLocalStorage) {
	localStorage[key] = existingLocalStorage[key].replace('', '');
}

