/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   my_js_lessons.js                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: topiana- <topiana-@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/18 19:42:58 by topiana-          #+#    #+#             */
/*   Updated: 2025/10/18 20:36:16 by topiana-         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/* -------------------------------------- */
/* -------- function factory OMG -------- */
/* -------------------------------------- */
/* function can be defined after the call (crazy)
also returned as in the example ... */

function multiplier(factor) {
	return function operation(number) {
		return factor * number;
	}
}

const twice = multiplier(2);

console.log('-- Multiplier --')
console.log(twice(5));

/* this remembers the precedent value (like a 'static' variable) */
function outer() {
	let count = 0;

	return function inner() {
	count++;
	console.log(count);
	};
}

const counter = outer();

console.log('-- Counter --')
counter(); // 1
counter(); // 2
counter(); // 3

/* -------------------------------------- */
/* ------ Objects are so convenient ----- */
/* -------------------------------------- */
/* Objects aren't a native type of JavaScript, They are sort of
a class in C++ but they just pop out of nowhere pretty easily.
You can define stuff of an object then calls it with
`Object.stuff` and get the value (wtf mate).
Arrays are more standard, but you can add crazy stuff to them too xD */

const cat = {
	type : 'animal',
	definition : 'multicellural living organism'
};

console.log(cat);

const motica = Object.create(cat);	// even if it's const you can edit the value ... wtf
/* 
	Think of const as label stuck on a box that says "motica".
	You can open the box and change the stuff inside (like add or change properties).
	But you cannot replace the entire box with a new box.

		motica = {}; // not allowed

*/

motica.name = 'Motica'
motica.likes = ['Sleeping', 'Cuddling', 'Purring']; 	// array
motica.age = 1;
motica.birthday = '09-08-2024';

console.log(">Motica :D");
console.log(motica);
console.log(`Inherited definition: ${motica.definition}`);

/* also elements can be destructured and reassempled kindof */

const { name, likes, ...rest} = motica;

console.log('>Destructured motica T.T');
console.log(name);
console.log(likes);
console.log(rest);

const rebby = { ...motica, name: 'rebby', email: 'motica@gmail.com'}

console.log(">Rebby :3");
console.log(rebby);

/* -------------------------------------- */
/* ------------- Js except -------------- */
/* -------------------------------------- */

try {
	// Code that may throw an error
} catch (error) {
	// Handle the error here
	console.error(error.message);
} finally {
	// Optional: code that runs regardless of error or success
}

/* ----------------------------------------------- */
/* ---------- Writing JS in multiple filse ------- */
/* ----------------------------------------------- */

console.log("--- Imports ---");

/*
	---------- math.js -------------
	export function add(a, b) {
		return a + b;
	}

	export const PI = 3.14159;

	// what is exported if nothing is specified
	export default function version() {
		console.log("Math.js version 1.0");
	}
*/
import { add, PI } from './math.js';

console.log(add(2, 3)); // 5
console.log(PI);        // 3.14159


/* IMPORT AT RUNTIME */

import('./math.js').then(math => {
	math.default();
	console.log(math.PI, math.pow(2, 3));
});

// const math = require('./math,js');	// used in another syntax
