const storage = window.localStorage;
const TODO_LIST_ITEMS = "todoListItems";

const todoList: HTMLDivElement = document.querySelector("#todo-list");
const listInput: HTMLInputElement = document.querySelector("#todo-list_input");

const todoListItems: string[] = getTodoList() || [];
saveTodoList();

// create new list item when "Enter" is pressed
listInput.addEventListener("keydown", (event: KeyboardEvent) => {
	if (event.key !== "Enter") {
		return;
	}
	const target = <HTMLInputElement>event.target;
	const newItemText = target.value.trim();
	target.value = "";
	if (!Boolean(newItemText)) {
		return;
	}
	// do not allow duplicate items
	if (todoListItems.findIndex((td) => td === newItemText) > -1) {
		return;
	}
	todoListItems.push(newItemText);
	createListItem(newItemText, todoListItems.length - 1);
	saveTodoList();
});

// drag & drop variables
let draggingElement: HTMLDivElement;
let draggingElementPlaceholder: HTMLDivElement;
let draggingInProgress = false;
let mouseDistanceFromDraggingElementTop: number = null;

function createListItem(itemText: string, i: number): void {
	// create the list item container and h1 containing the todo text
	const listItem = document.createElement("div");
	listItem.id = `item_${i}`;
	listItem.classList.add("todo-list_item");
	const listItemText = document.createElement("h1");
	listItemText.classList.add("todo-list_item_text");
	const listItemTextNode = document.createTextNode(itemText);
	listItemText.appendChild(listItemTextNode);
	listItem.appendChild(listItemText);

	// drag and drop
	listItem.addEventListener("mousedown", mouseDownHandler);

	// create the delete button and append it to the list item
	const deleteButton = document.createElement("div");
	deleteButton.classList.add("todo-list_item_delete-button");
	const deleteButtonText = document.createElement("h1");
	const deleteTextNode = document.createTextNode("\u2A2F");
	deleteButtonText.appendChild(deleteTextNode);
	deleteButton.addEventListener("click", () => deleteListItem(listItem, itemText));
	deleteButton.appendChild(deleteButtonText);
	listItem.appendChild(deleteButton);

	// add the list item to the todo list
	todoList.appendChild(listItem);
}

function deleteListItem(listItem: HTMLDivElement, listItemText: string): void {
	const index = todoListItems.findIndex((td) => td === listItemText);
	if (index === -1) {
		return;
	}
	listItem.remove();
	todoListItems.splice(index, 1);
	saveTodoList();
}

function mouseDownHandler(event: MouseEvent): void {
	draggingElement = <HTMLDivElement>event.target;
	// return if the event comes from the delete button
	// move up until todo-list_item is selected, if the event comes from a child
	if (draggingElement.classList.contains("todo-list_item_delete-button")) return;
	while (!draggingElement.classList.contains("todo-list_item")) {
		// return if the event comes from the delete button
		if (draggingElement.classList.contains("todo-list_item_delete-button")) return;
		draggingElement = <HTMLDivElement>draggingElement.parentNode;
	}

	draggingElement.classList.add("todo-list_item--dragging");

	const elementDistanceFromPageTop = draggingElement.getBoundingClientRect().top + window.scrollY;
	mouseDistanceFromDraggingElementTop = event.pageY - elementDistanceFromPageTop;

	// attach listeners to the document
	document.addEventListener("mousemove", mouseMoveHandler);
	document.addEventListener("mouseup", mouseUpHandler);
}

function mouseMoveHandler(event: MouseEvent): void {
	const previousElement = draggingElement.previousElementSibling;
	const nextElement = draggingElement.nextElementSibling;
	const draggingRect = draggingElement.getBoundingClientRect();

	if (!draggingInProgress) {
		draggingInProgress = true;

		// create placeholder
		draggingElementPlaceholder = document.createElement("div");
		draggingElementPlaceholder.classList.add("todo-list_item");
		draggingElementPlaceholder.style.visibility = "hidden";
		draggingElement.parentNode.insertBefore(draggingElementPlaceholder, draggingElement.nextSibling);
		draggingElementPlaceholder.style.height = `${draggingRect.height}px`;
	}

	// set position styles for dragging element
	draggingElement.style.position = "absolute";
	const position = event.pageY - mouseDistanceFromDraggingElementTop; // current potential position of element top
	const topLimit = todoList.getBoundingClientRect().top + listInput.getBoundingClientRect().height / 1.01;
	const bottomLimit =
		todoList.getBoundingClientRect().bottom - draggingElement.getBoundingClientRect().height + window.scrollY;
	switch (true) {
		case position < topLimit:
			draggingElement.style.top = `${topLimit}px`;
			break;
		case position > bottomLimit:
			draggingElement.style.top = `${bottomLimit}px`;
			break;
		default:
			draggingElement.style.top = `${position}px`;
			break;
	}

	// moving up
	if (previousElement && draggingElement.getBoundingClientRect().top < previousElement.getBoundingClientRect().top) {
		// cancel if above element is the list input
		if (previousElement.id === "todo-list_input") {
			return;
		}
		previousElement.parentNode.insertBefore(draggingElementPlaceholder, previousElement);
		previousElement.parentNode.insertBefore(draggingElement, previousElement);
		swapItemsInList(previousElement, draggingElement);
	}

	// moving down
	if (nextElement && nextElement.getBoundingClientRect().top < draggingElement.getBoundingClientRect().top) {
		nextElement.parentNode.insertBefore(nextElement, draggingElementPlaceholder);
		nextElement.parentNode.insertBefore(draggingElement, nextElement.nextSibling);
		swapItemsInList(draggingElement, nextElement);
	}
}

function mouseUpHandler(): void {
	draggingInProgress = false;

	// remove placeholder
	if (draggingElementPlaceholder && draggingElementPlaceholder.parentNode) {
		draggingElementPlaceholder.parentNode.removeChild(draggingElementPlaceholder);
	}

	// remove position styles for dragging element
	draggingElement.style.removeProperty("position");
	draggingElement.style.removeProperty("top");
	draggingElement.classList.remove("todo-list_item--dragging");

	// clear drag & drop variables
	mouseDistanceFromDraggingElementTop = null;
	draggingElement = null;

	// clear listeners
	document.removeEventListener("mousemove", mouseMoveHandler);
	document.removeEventListener("mouseup", mouseUpHandler);
}

function swapItemsInList(nodeA: ParentNode, nodeB: ParentNode): void {
	const textA = nodeA.querySelector("h1") ? nodeA.querySelector("h1").textContent : "";
	const textB = nodeB.querySelector("h1") ? nodeB.querySelector("h1").textContent : "";

	if (!textA || !textB) {
		return;
	}
	const indexA = todoListItems.findIndex((td) => td === textA);
	const indexB = todoListItems.findIndex((td) => td === textB);
	if (indexA === -1 || indexB === -1) {
		return;
	}
	if (indexA !== indexB - 1) {
		return;
	}
	todoListItems.splice(indexA, 1, textB);
	todoListItems.splice(indexB, 1, textA);
	saveTodoList();
}

function getTodoList(): string[] {
	return JSON.parse(storage.getItem(TODO_LIST_ITEMS));
}

function saveTodoList(): void {
	storage.setItem(TODO_LIST_ITEMS, JSON.stringify(todoListItems));
}

(function createAllListItems(): void {
	todoListItems.forEach((item, i) => createListItem(item, i));
})();
