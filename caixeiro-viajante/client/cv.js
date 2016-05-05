// Load array of cities and distances
import cities from './cities';
import distances from './distances';

export default class Cv {
	constructor({
			origin='Aracajú',
			population=2000,
			ages=100,
			recombinationRange=[1, 25],
			mutation=true,
			mutationRange=[5, 7]
		} = {}) {

		// Define default settings
		this.origin = origin;
		this.population = population;
		this.ages = ages;
		this.recombinationRange = recombinationRange;
		this.mutation = mutation;
		this.mutationRange = mutationRange;

		// Init empty array of chromosomes
		this.chromosomes = [];
	}

	// Run the program
	start() {
		// Execute each age
		for (var i = 0; i < this.ages; i++) {
			this.doAge();
		}
		// Log the best solution with path
		this.showBestSolution(true);

		return {
			distance: this.chromosomes[0].totalDistance,
			path: this.chromosomes[0].cities.join(', ')
		};
	}

	doAge() {
		// If is the first round, generate the chromosomes
		// If not, remove exedent and generate childs
		if (this.chromosomes.length === 0) {
			this.generateChromosomes();
		} else {
			this.killWeak();
			this.recombination();
		}

		// Calculate all distances for each chromosome
		this.calculateFitness();
		// Sort chromosomes by distance
		this.sortByFitness();
		// Log the best distance
		this.showBestSolution();
	}

	showBestSolution(showPath) {
		console.log(this.chromosomes[0].totalDistance);
		if (showPath) {
			console.log(this.chromosomes[0].cities.join('\n'));
		}
	}

	generateChromosomes() {
		// Clear the array
		this.chromosomes = [];

		// Populate
		for (let i = 0; i < this.population; i++) {
			// Each chromosome will have a random list of cities
			let scities = _.shuffle(cities);

			// Remove the origin city and add as first record
			scities.splice(scities.indexOf(this.origin), 1);
			scities.unshift(this.origin);

			// Add the chromosome with cities
			this.chromosomes.push({
				cities: scities
			});
		}
	}

	calculateFitnessForChromosome(chromosome) {
		// Prevent to recalculate records
		if (chromosome.totalDistance !== undefined) {
			return;
		}

		// Init distance as 0
		chromosome.totalDistance = 0;

		// Show error if we have more or less cities than expected
		if (chromosome.cities.length !== 26) {
			console.error('Imperfect chromosome', chromosome.cities);
		}

		chromosome.cities.forEach((city, index) => {
			let path;

			// If is the last city, compare with the origin
			// If not, compare with next city
			if (!chromosome.cities[index+1]) {
				path = `${chromosome.cities[index]}:${this.origin}`;
			} else {
				path = `${chromosome.cities[index]}:${chromosome.cities[index+1]}`;
			}

			// Get the distance from our object of distances
			const distance = distances[path];

			// Show error if the distance doesn't make sense
			if (distance <= 0) {
				console.error('Wrong distance', path);
			}

			// Add the distance to the total distance
			chromosome.totalDistance += distance;
		});
	}

	calculateFitness() {
		this.chromosomes.forEach((chromosome) => {
			this.calculateFitnessForChromosome(chromosome);
		});
	}

	// Keep chromosomes in order of distance
	sortByFitness() {
		this.chromosomes = _.sortBy(this.chromosomes, 'totalDistance');
	}

	// Keep the population, removing the weak excedent
	killWeak() {
		this.chromosomes = this.chromosomes.slice(0, this.population);
	}

	// Change a part of the end of the chromosome
	mutateChromosomeCities(cities) {
		// Only if that option is enabled
		if (this.mutation !== true) {
			return cities;
		}

		// Clone the array to keep orinals untouched
		cities = cities.slice();

		// Get the last N itens (random of a range) and shuffle
		const mutatedCitites = _.shuffle(cities.splice(-_.random(...this.mutationRange)));

		// Put the tail back
		return cities.concat(mutatedCitites);
	}

	recombination() {
		const children = [];

		// Random the chromosomes to generate different couples each time
		const chromosomes = _.shuffle(this.chromosomes);

		// For each couple
		for (let i = 0; i < chromosomes.length; i += 2) {
			// Get the dad and mom muted if enabled
			const dad = this.mutateChromosomeCities(chromosomes[i].cities);
			const mom = this.mutateChromosomeCities(chromosomes[i+1].cities);

			// Get a random number of cities from the begining of the dad list
			const child = dad.slice(0, _.random(...this.recombinationRange));

			// And with the mom cities removing the previous selected dad cities
			children.push({
				cities: child.concat(_.difference(mom, child))
			});
		}

		// Add the generated children to the list
		this.chromosomes = this.chromosomes.concat(children);
	}
}
