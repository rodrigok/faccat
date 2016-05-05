import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
import cities from './cities.js';
import Cv from './cv.js';

Template.hello.onCreated(function() {
	this.distance = new ReactiveVar();
	this.path = new ReactiveVar();
});

Template.hello.helpers({
	cities() {
		return cities;
	},

	distance() {
		return Template.instance().distance.get();
	},

	path() {
		return Template.instance().path.get();
	}
});

Template.hello.events({
	'click button'(event, template) {
		const origin = document.querySelector('[name=origin]').value;
		const population = document.querySelector('[name=population]').value;
		const ages = document.querySelector('[name=ages]').value;
		const recombinationRangeStart = document.querySelector('[name=recombinationRangeStart]').value;
		const recombinationRangeEnd = document.querySelector('[name=recombinationRangeEnd]').value;
		const mutation = document.querySelector('[name=mutation]').value;
		const mutationRangeStart = document.querySelector('[name=mutationRangeStart]').value;
		const mutationRangeEnd = document.querySelector('[name=mutationRangeEnd]').value;

		const cv = new Cv({
			origin: origin,
			population: parseInt(population),
			ages: parseInt(ages),
			recombinationRange: [parseInt(recombinationRangeStart), parseInt(recombinationRangeEnd)],
			mutation: Boolean(mutation),
			mutationRange: [parseInt(mutationRangeStart), parseInt(mutationRangeEnd)]
		});

		const {distance, path} = cv.start();
		template.distance.set(distance);
		template.path.set(path);
	}
});
