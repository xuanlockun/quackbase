export interface OrderedRecord {
	order?: number;
}

type RowMapper<T> = (row: HTMLElement, index: number) => T | null;

export function normalizePayloadOrder<T extends OrderedRecord>(items: T[]): (T & { order: number })[] {
	return items.map((item, index) => ({
		...item,
		order: index + 1,
	}));
}

export function collectOrderedRowPayload<T>(rows: Iterable<Element>, mapper: RowMapper<T>): (T & { order: number })[] {
	const payload: (T & { order: number })[] = [];
	let index = 0;

	for (const node of rows) {
		if (!(node instanceof HTMLElement)) {
			continue;
		}

		const mapped = mapper(node, index);
		if (mapped) {
			payload.push({
				...mapped,
				order: index + 1,
			});
			index += 1;
		}
	}

	return payload;
}

export interface DragSortingOptions {
	container: HTMLElement;
	rowSelector: string;
	handleSelector?: string;
	onReorder?: () => void;
}

export function enableDragSorting(options: DragSortingOptions): void {
	const { container, rowSelector, handleSelector, onReorder } = options;
	let draggedRow: HTMLElement | null = null;

	const getRow = (target: EventTarget | null): HTMLElement | null => {
		if (!(target instanceof Element)) {
			return null;
		}
		if (target.matches(rowSelector)) {
			return target;
		}
		return target.closest(rowSelector);
	};

	const isValidHandle = (target: EventTarget | null): boolean => {
		if (!handleSelector) {
			return true;
		}
		if (!(target instanceof Element)) {
			return false;
		}
		return Boolean(target.closest(handleSelector));
	};

	container.addEventListener("dragstart", (event) => {
		const row = getRow(event.target);
		if (!row || !isValidHandle(event.target)) {
			return;
		}

		draggedRow = row;
		row.classList.add("is-dragging");
		event.dataTransfer?.setData("text/plain", "");
		event.dataTransfer?.setDragImage(row, 0, 0);
	});

	container.addEventListener("dragend", () => {
		if (draggedRow) {
			draggedRow.classList.remove("is-dragging");
		}
		draggedRow = null;
	});

	container.addEventListener("dragover", (event) => {
		if (!draggedRow) {
			return;
		}

		event.preventDefault();
		const overRow = getRow(event.target);
		if (!overRow || overRow === draggedRow) {
			return;
		}

		const bounding = overRow.getBoundingClientRect();
		const insertBefore = event.clientY < bounding.top + bounding.height / 2;
		container.insertBefore(draggedRow, insertBefore ? overRow : overRow.nextElementSibling);
	});

	container.addEventListener("drop", (event) => {
		event.preventDefault();
		if (draggedRow) {
			draggedRow.classList.remove("is-dragging");
			draggedRow = null;
			onReorder?.();
		}
	});
}
