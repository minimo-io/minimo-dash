import kinea from '$lib/images/kinea-logo.png';
import btg from '$lib/images/btg-logo.png';
import patria from '$lib/images/patria-logo.png';
import xp from '$lib/images/xp-logo.png';
import capitania from '$lib/images/capitania-logo.png';
import genial from '$lib/images/genial-logo.png';
import alianza from '$lib/images/alianza-logo.png';

export enum Manager {
	Alianza,
	Kinea,
	Patria,
	XP,
	Capitania,
	BTG,
	Genial
}

interface ManagerDetails {
	name: string;
	image: string;
}

export const Managers: Map<Manager, ManagerDetails> = new Map([
	[Manager.Kinea, { name: 'Kinea', image: kinea }],
	[Manager.Patria, { name: 'Patria Investimentos', image: patria }],
	[Manager.BTG, { name: 'BTG Pactual', image: btg }],
	[Manager.XP, { name: 'XP Assets', image: xp }],
	[Manager.Capitania, { name: 'Capitania', image: capitania }],
	[Manager.Genial, { name: 'Genial', image: genial }],
	[Manager.Alianza, { name: 'Alianza', image: alianza }]
]);
