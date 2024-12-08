<script lang="ts">
	import { Badge } from 'flowbite-svelte';
	import type { BadgeProps } from 'flowbite-svelte/Badge.svelte';

	export let state: keyof typeof states;
	export let dark: boolean = false;

	const states = {
		tijolo: 'Tijolo',
		logistica: 'Logística',
		shopping: 'Shopping',
		papel: 'Papel',
		ipca: 'IPCA',
		cdi: 'CDI',
		hibrido: 'Híbrido',
		rendaurbana: 'Renda Urbana'
	};

	const colors: Record<string, BadgeProps['color']> = {
		tijolo: 'green',
		shopping: 'green',
		logistica: 'green',
		ipca: 'red',
		cdi: 'red',
		papel: 'red',
		hibrido: 'yellow',
		rendaurbana: 'purple'
	};
</script>

<Badge color={colors[state] ?? 'dark'} border={dark}>{states[state] ?? 'Unknown'}</Badge>
