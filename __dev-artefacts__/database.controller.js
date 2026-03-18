
const StrategyA = {
	id:'string',
	title:'string',
	description:'string',
}

class DataBaseController {
		
	add (data) {
		const errors = [];
		for (const [strategyKey, strategyPropertyModel] of Object.entries(this.#strategy)) {
			try {
				const providedPropertyValue = data[strategyKey];
				if(!providedPropertyValue) throw new Error(`providedPropertyValue; ${strategyKey}: undefined`);
			}
			catch (err) {
				console.log(err.message)
				errors.push(err.message);
			}
		}
		if(errors.length) {
			throw new Error(`invalid data`);
		}
		
		/* call database methods */
		console.log('done');
	}
	
	#strategy;
	#errors;
	
	constructor (validateStrategy) {
		this.#strategy = validateStrategy;
		this.#errors = new Map();
	}
}

const controller = new DataBaseController(StrategyA);

const data = {
	id:'123',
	_title:2,
	description:'string',
} ;

try {
	controller.add(data);
}
catch (e) {
	console.log(e.message);
}

