<script lang="ts">
	import {
		Button,
		Card,
		Checkbox,
		Dropdown,
		Heading,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Tooltip
	} from 'flowbite-svelte';
	import {
		CirclePlusOutline,
		ChevronDownOutline,
		ChevronRightOutline,
		ChartMixedDollarSolid
	} from 'flowbite-svelte-icons';
	import StatusBadge from './StatusBadge.svelte';
	import type { FundDataArray } from '$lib/types';
	import type { PageData } from '../../(sidebar)/$types';
	import { Managers } from '$lib/types';
	import FiisSummary from '../widgets/FiisSummary.svelte';

	export let dark: boolean = false;
	export let data: PageData;

	const headers = [
		'#',
		'Fundo',
		'Gestão',
		'Setor',
		'Preço',
		'P/VP',
		'DY mês (%)',
		'DY 10 anos (%)',
		'Alloc',
		'Atual',
		'Distrib Actual',
		'Distrib 375K',
		'Restam (para 375K)',
		'Distrib 500K',
		'Restam (para 500K)'
	];

	const usdToBrl = data.usdToBrl;
	const carteira: FundDataArray = data.carteira;
	const rowSize = 'px-3 py-2'; // configure the size of each row for each asset.

	// Calculate current allocation based on total invested
	let totalInvested = 0,
		dyMesProm = 0,
		dyPromHist = 0;

	for (let i = 0; i < carteira.length; i++) {
		totalInvested += carteira[i].shares * carteira[i].price;
		dyMesProm += carteira[i].dyMo;
		dyPromHist += carteira[i].dyAvgHist;
	}

	dyMesProm = (dyMesProm / carteira.length).toFixed(2);
	dyPromHist = (dyPromHist / carteira.length).toFixed(2);

	function formatCurrency(amount: number, currency?: string) {
		// Round the number to 2 decimal places (example for prices)
		let roundedAmount = Math.round(amount * 100) / 100;

		// Format the number with 1k separator (dot) and currency symbol (e.g., R$ for Brazil)
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: currency || 'BRL',
			minimumFractionDigits: 2, // Ensures two decimals are shown
			maximumFractionDigits: 2
		}).format(roundedAmount);
	}
</script>

<Card size="xl" class="max-w-none shadow-sm">
	<div class="items-center justify-between lg:flex">
		<div class="mb-4 mt-px lg:mb-0">
			<Heading tag="h3" class="-ml-0.25 mb-2 text-xl font-semibold dark:text-white">FIIs</Heading>
			<span class="text-base font-normal text-gray-500 dark:text-gray-400"> Road to freedom </span>
		</div>
		<div class="items-center justify-between gap-3 space-y-4 sm:flex sm:space-y-0">
			<div class="flex items-center">
				<Button color="alternative" class="mr-3 w-fit whitespace-nowrap px-4 py-2">
					<ChartMixedDollarSolid size="md" class="pr-1 text-yellow-500" />
					USD/BRL:&nbsp; <span class="font-bold">{formatCurrency(usdToBrl)}</span>
					<ChevronDownOutline size="lg" />
				</Button>
				<Button color="alternative" class="w-fit whitespace-nowrap px-4 py-2">
					Trocar cartera
					<ChevronDownOutline size="lg" />
				</Button>
				<Dropdown class="w-44 space-y-3 p-3 text-sm" placement="bottom-start">
					<li><Checkbox class="accent-primary-600">Completed (56)</Checkbox></li>
					<li><Checkbox checked>Cancelled (56)</Checkbox></li>
					<li><Checkbox class="accent-primary-600">In progress (56)</Checkbox></li>
					<li><Checkbox checked>In review (97)</Checkbox></li>
				</Dropdown>
			</div>
			<div class="flex items-center space-x-4">
				<Button color="primary" class="w-fit whitespace-nowrap px-4 py-2">
					<CirclePlusOutline size="sm" class="mr-1" />
					Criar cartera
				</Button>
				<!-- <Input placeholder="From" class="w-full">
					<CalendarMonthOutline slot="left" size="md" />
				</Input>
				<Input placeholder="To" class="w-full">
					<CalendarMonthOutline slot="left" size="md" />
				</Input> -->
			</div>
		</div>
	</div>
	<Table
		hoverable={true}
		noborder
		striped
		class="mt-6 min-w-full divide-y divide-gray-200 dark:divide-gray-600"
	>
		<TableHead class="bg-gray-50 dark:bg-gray-700">
			{#each headers as header}
				<TableHeadCell class="whitespace-nowrap p-3 font-normal">{header}</TableHeadCell>
			{/each}
		</TableHead>
		<TableBody>
			{#each carteira as fii, index}
				<TableBodyRow class="hover:cursor-pointer">
					<TableBodyCell class="w-fit {rowSize} font-normal">#{index + 1}</TableBodyCell>
					<TableBodyCell class="w-1 {rowSize} font-normal">
						<a
							href="https://www.fundamentus.com.br/detalhes.php?papel={fii.ticker}"
							target="_blank"
							class="font-bold"
							rel="nofollow noopener"
							id="fundo-{fii.ticker}"
							>{fii.ticker}
						</a>
						<Tooltip color="yellow" placement="left" triggeredBy="#fundo-{fii.ticker}">
							<strong>{fii.shares} cotas</strong>
							<br />
							Atualizado: {fii.date}
						</Tooltip>
						<span class="text-gray-400"> / {fii.shares}</span>
					</TableBodyCell>
					<TableBodyCell class="{rowSize} pr-8 font-normal">
						<img
							class="aspect-1 inline h-5 pr-1"
							src={Managers.get(fii.manager)?.image}
							alt={Managers.get(fii.manager)?.name}
						/>
						{Managers.get(fii.manager)?.name}
					</TableBodyCell>
					<TableBodyCell class="{rowSize} font-normal">
						<StatusBadge state={fii.sector} {dark} />
						<StatusBadge state={fii.subSector} {dark} />
					</TableBodyCell>
					<TableBodyCell class="w-1 {rowSize} font-normal">
						{formatCurrency(fii.price)}
					</TableBodyCell>
					<TableBodyCell class="w-1 {rowSize} font-normal">
						{fii.pvp.toFixed(2)}
					</TableBodyCell>
					<TableBodyCell class="w-1 {rowSize} font-normal">
						{fii.dyMo}
					</TableBodyCell>
					<TableBodyCell class="w-1 {rowSize} font-normal">
						{fii.dyAvgHist}
					</TableBodyCell>
					<TableBodyCell class="w-1 {rowSize} font-normal">
						{fii.alloc}%
					</TableBodyCell>
					<TableBodyCell class="w-1 {rowSize} font-normal">
						{(((fii.shares * fii.price) / totalInvested) * 100).toFixed(1)}%
					</TableBodyCell>
					<TableBodyCell
						class="w-1 {rowSize} font-normal"
						title="Devería ser R$ {((fii.alloc / 100) * totalInvested).toFixed(0)}"
					>
						{formatCurrency(fii.shares * fii.price)}
					</TableBodyCell>
					<TableBodyCell class="w-1 {rowSize} font-normal">
						{formatCurrency((fii.alloc / 100) * 375000)}
					</TableBodyCell>
					<TableBodyCell class="{rowSize} font-normal text-gray-500 dark:text-gray-400">
						{formatCurrency((fii.alloc / 100) * 375000 - fii.shares * fii.price)}
					</TableBodyCell>
					<TableBodyCell class="w-1 {rowSize} font-normal">
						{formatCurrency((fii.alloc / 100) * 500000)}
					</TableBodyCell>

					<TableBodyCell class="{rowSize} font-normal text-gray-500 dark:text-gray-400">
						{formatCurrency((fii.alloc / 100) * 500000 - fii.shares * fii.price)}
					</TableBodyCell>
				</TableBodyRow>
			{/each}
			<TableBodyRow>
				<TableBodyCell class="w-1 bg-gray-50 px-3 py-2 text-center dark:bg-gray-700"
				></TableBodyCell>
				<TableBodyCell class="w-1 bg-gray-50 px-3 py-2 dark:bg-gray-700"></TableBodyCell>
				<TableBodyCell class="w-1 bg-gray-50 px-3 py-2 dark:bg-gray-700"></TableBodyCell>
				<TableBodyCell class="w-1 bg-gray-50 px-3 py-2 dark:bg-gray-700"></TableBodyCell>
				<TableBodyCell class="w-1 bg-gray-50 px-3 py-2 dark:bg-gray-700"></TableBodyCell>
				<TableBodyCell class="w-1 bg-gray-50 px-3 py-2 dark:bg-gray-700"></TableBodyCell>
				<TableBodyCell class="w-1 bg-gray-50 px-3 py-2 font-bold dark:bg-gray-700"
					>{dyMesProm}%<br />Promédio</TableBodyCell
				>
				<TableBodyCell class="w-1 bg-gray-50 px-3 py-2 font-bold dark:bg-gray-700"
					>{dyPromHist}%<br />Promédio 10a</TableBodyCell
				>
				<TableBodyCell class="w-1 bg-gray-50 px-3 py-2 dark:bg-gray-700"></TableBodyCell>
				<TableBodyCell class="w-1 bg-gray-50 px-3 py-2 dark:bg-gray-700"></TableBodyCell>
				<TableBodyCell class="w-1 bg-gray-50 px-3 py-2 font-bold dark:bg-gray-700">
					{formatCurrency(totalInvested)}
					<br />
					{formatCurrency(totalInvested / usdToBrl, 'USD')}
				</TableBodyCell>
				<TableBodyCell class="w-1 bg-gray-50 px-3 py-2 font-bold dark:bg-gray-700"
					>3000 a 0,8% <br />(Dec 2024)</TableBodyCell
				>
				<TableBodyCell class="w-1 bg-gray-50 px-3 py-2 font-bold dark:bg-gray-700">
					{formatCurrency(375000 - totalInvested)}
					<br />
					{formatCurrency((375000 - totalInvested) / usdToBrl, 'USD')}
				</TableBodyCell>
				<TableBodyCell class="w-1 bg-gray-50 px-3 py-2 font-bold dark:bg-gray-700"
					>3000 a 0,6% <br />(Prom. 10 anos)</TableBodyCell
				>
				<TableBodyCell class="w-1 bg-gray-50 px-3 py-2 font-bold dark:bg-gray-700">
					{formatCurrency(500000 - totalInvested)}
					<br />
					{formatCurrency((500000 - totalInvested) / usdToBrl, 'USD')}
				</TableBodyCell>
			</TableBodyRow>
		</TableBody>
	</Table>
	<div class="-mb-1 flex items-center justify-between pt-3 sm:pt-6">
		<FiisSummary />
		<a
			href="#top"
			class="inline-flex items-center rounded-lg p-1 text-xs font-medium uppercase text-primary-700 hover:bg-gray-100 sm:text-sm dark:text-primary-500 dark:hover:bg-gray-700"
		>
			Atualizar dados <ChevronRightOutline size="lg" />
		</a>
	</div>
</Card>
