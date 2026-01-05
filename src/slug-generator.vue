<template>
	<div class="slug-generator">
		<div class="slug-generator-input">
			<input
				:value="value"
				:disabled="disabled"
				:readonly="readonly"
				:placeholder="placeholder"
				@input="onInput"
				@blur="onBlur"
				class="input"
			/>
			<button
				v-if="!disabled && !readonly"
				type="button"
				@click="formatCurrentValue"
				class="format-button"
				title="Format as slug"
			>
				Format
			</button>
		</div>
		<div v-if="showHint" class="slug-hint">
			<small>Auto-formats on blur • Use Format button to convert text to slug</small>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
	value?: string | null;
	disabled?: boolean;
	readonly?: boolean;
	placeholder?: string;
	separator?: string;
	lowercase?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	value: null,
	disabled: false,
	readonly: false,
	placeholder: 'Enter text to generate URL-friendly slug',
	separator: '-',
	lowercase: true
});

const emit = defineEmits<{
	'update:value': [value: string | null];
	input: [event: Event];
}>();

const showHint = computed(() => !props.disabled && !props.readonly);

function slugify(text: string): string {
	let slug = text
		.trim()
		.replace(/[^\w\s-]/g, '') // Remove special characters
		.replace(/[\s_]+/g, props.separator) // Replace spaces and underscores with separator
		.replace(/--+/g, props.separator) // Replace multiple separators with single
		.replace(/^-+|-+$/g, ''); // Remove leading/trailing separators

	if (props.lowercase) {
		slug = slug.toLowerCase();
	}

	return slug;
}

function formatCurrentValue() {
	if (!props.value) return;
	
	const formatted = slugify(props.value);
	emit('update:value', formatted);
}

function onInput(event: Event) {
	const target = event.target as HTMLInputElement;
	emit('update:value', target.value || null);
	emit('input', event);
}

function onBlur(event: Event) {
	const target = event.target as HTMLInputElement;
	let value = target.value || null;
	
	// Auto-slugify on blur if the value contains spaces or special chars
	if (value && (value.includes(' ') || /[^\w-]/.test(value))) {
		value = slugify(value);
		emit('update:value', value);
	}
	
	emit('input', event);
}
</script>

<style scoped>
.slug-generator {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.slug-generator-input {
	display: flex;
	gap: 8px;
	align-items: center;
}

.input {
	flex: 1;
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

.format-button {
	padding: 8px 16px;
	border: 1px solid var(--theme--primary);
	border-radius: var(--theme--border-radius);
	background-color: var(--theme--primary);
	color: var(--theme--primary-accent);
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;
}

.format-button:hover:not(:disabled) {
	background-color: var(--theme--primary-accent);
	border-color: var(--theme--primary-accent);
	color: var(--theme--primary);
}

.format-button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.slug-hint {
	padding: 4px 8px;
	color: var(--theme--foreground-subdued);
	font-size: 12px;
}
</script>
