
const version = "1.0"

export function add(a, b) {
	return a + b;
}

/* also this syntax exists but it's used differently... idk for now */
// module.exports.add = function(a, b) {
//   return a + b;
// };

export function pow(a, b) {
	let p = a;
	for (let i = 1; i < b; ++i) {
		p = p * a;
	}
  	return p;
};

export const PI = 3.14159;

/* what is exported if nothing is specified */
export default function which() {
	console.log(`Math.js version ${version}`);
}
