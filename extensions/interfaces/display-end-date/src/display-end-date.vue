<template>
	<div class="display-end-date">
		<input
			:type="inputType"
			:value="formattedValue"
			:disabled="disabled"
			:readonly="readonly"
			:placeholder="placeholder"
			:min="minDate"
			@input="onInput"
			@blur="onBlur"
			class="input"
		/>
		<div v-if="showWarning" class="warning-message">
			<small>⚠️ This date has passed. Posts with expired end dates will not appear in API queries.</small>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
	modelValue?: string | null;
	disabled?: boolean;
	readonly?: boolean;
	placeholder?: string;
	includeTime?: boolean;
	minDate?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null,
	disabled: false,
	readonly: false,
	placeholder: 'Select display end date',
	includeTime: false,
	minDate: undefined
});

const emit = defineEmits<{
	'update:modelValue': [value: string | null];
	input: [event: Event];
}>();

const inputType = computed(() => (props.includeTime ? 'datetime-local' : 'date'));

const formattedValue = computed(() => {
	if (!props.modelValue) return '';

	try {
		const date = new Date(props.modelValue);
		if (isNaN(date.getTime())) return '';

		if (props.includeTime) {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');
			return `${year}-${month}-${day}T${hours}:${minutes}`;
		} else {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		}
	} catch {
		return '';
	}
});

const showWarning = computed(() => {
	if (!props.modelValue) return false;

	try {
		const endDate = new Date(props.modelValue);
		const now = new Date();
		return endDate < now;
	} catch {
		return false;
	}
});

function onInput(event: Event) {
	const target = event.target as HTMLInputElement;
	const value = target.value;

	if (!value) {
		emit('update:modelValue', null);
		emit('input', event);
		return;
	}

	try {
		const date = new Date(value);
		if (!isNaN(date.getTime())) {
			emit('update:modelValue', date.toISOString());
		}
	} catch {
		// ignore parse errors
	}

	emit('input', event);
}

function onBlur(event: Event) {
	emit('input', event);
}
</script>

<style scoped>
.display-end-date {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.input {
	width: 100%;
	padding: 8px 12px;
	border: 1px solid var(--theme--form--field--input--border-color);
	border-radius: var(--theme--border-radius);
	background-color: var(--theme--form--field--input--background);
	color: var(--theme--form--field--input--foreground);
	font-size: 14px;
	font-family: var(--theme--fonts--sans--font-family);
}

.input:focus {
	outline: 2px solid var(--theme--primary);
	outline-offset: 2px;
	border-color: var(--theme--primary);
}

.input:disabled,
.input:readonly {
	background-color: var(--theme--form--field--input--background-subdued);
	cursor: not-allowed;
}

.warning-message {
	padding: 6px 8px;
	background-color: var(--theme--warning-background, #fff4e6);
	border: 1px solid var(--theme--warning-accent, #ffb020);
	border-radius: var(--theme--border-radius);
	color: var(--theme--warning-foreground, #8a6914);
	font-size: 12px;
}
</style>

