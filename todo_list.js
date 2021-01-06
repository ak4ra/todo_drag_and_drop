const storage = window.localStorage;
const TODO_LIST_ITEMS = "todoListItems";

const todoList = document.querySelector("#todo-list");
const listInput = document.querySelector("#todo-list_input");

const todoListItems = getTodoList() || [];
saveTodoList();

// create new list item when "Enter" is pressed
listInput.addEventListener("keydown", (event) => {
	if (event.keyCode !== 13) {
		return;
	}
	const newItemText = event.target.value.trim();
	event.target.value = "";
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
let draggingElement;
let draggingElementPlaceholder;
let draggingInProgress = false;
let mouseY = null;

function createListItem(item, i) {
	// create the list item container and h1 containing the todo text
	const listItem = document.createElement("div");
	listItem.id = `item_${i}`;
	listItem.classList.add("todo-list_item");
	const listItemText = document.createElement("h1");
	listItemText.classList.add("todo-list_item_text");
	const listItemTextNode = document.createTextNode(item);
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
	deleteButton.addEventListener("click", () => deleteListItem(listItem, item));
	deleteButton.appendChild(deleteButtonText);
	listItem.appendChild(deleteButton);

	// add the list item to the todo list
	todoList.appendChild(listItem);
}

function deleteListItem(listItem, listItemText) {
	const index = todoListItems.findIndex((td) => td === listItemText);
	if (index === -1) {
		return;
	}
	listItem.remove();
	todoListItems.splice(index, 1);
	saveTodoList();
}

function mouseDownHandler(event) {
	draggingElement = event.target;
	// return if the event comes from the delete button
	if (draggingElement.classList.contains("todo-list_item_delete-button")) return;
	while (!draggingElement.classList.contains("todo-list_item")) {
		// return if the event comes from the delete button
		if (draggingElement.classList.contains("todo-list_item_delete-button")) return;
		draggingElement = draggingElement.parentNode;
	}

	draggingElement.classList.add("todo-list_item--dragging");

	// calculate mouse position
	const elementDistanceFromPageTop = draggingElement.getBoundingClientRect().top + window.scrollY;
	mouseY = event.pageY - elementDistanceFromPageTop;

	// attach listeners to the document
	document.addEventListener("mousemove", mouseMoveHandler);
	document.addEventListener("mouseup", mouseUpHandler);
}

function mouseMoveHandler(event) {
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
	const position = event.pageY - mouseY;
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
	if (previousElement && isAbove(draggingElement, previousElement)) {
		// cancel if above element is the list input
		if (previousElement.id === "todo-list_input") {
			return;
		}
		swapNodes(previousElement, draggingElement);
		swapNodes(draggingElementPlaceholder, previousElement);
		swapItemsInList(previousElement, draggingElement);
	}

	// moving down
	if (nextElement && isAbove(nextElement, draggingElement)) {
		swapNodes(nextElement, draggingElementPlaceholder);
		swapNodes(nextElement, draggingElement);
		swapItemsInList(draggingElement, nextElement);
	}
}

function mouseUpHandler(event) {
	draggingInProgress = false;

	// remove placeholder
	if (draggingElementPlaceholder && draggingElementPlaceholder.parentNode) {
		draggingElementPlaceholder.parentNode.removeChild(draggingElementPlaceholder);
	}

	// remove position styles for dragging element
	draggingElement.style.removeProperty("position");
	draggingElement.style.removeProperty("top");
	draggingElement.style.removeProperty("bottom");
	draggingElement.classList.remove("todo-list_item--dragging");

	// clear drag & drop variables
	mouseY = null;
	draggingElement = null;

	// clear listeners
	document.removeEventListener("mousemove", mouseMoveHandler);
	document.removeEventListener("mouseup", mouseUpHandler);
}

function isAbove(nodeA, nodeB) {
	const rectA = nodeA.getBoundingClientRect();
	const rectB = nodeB.getBoundingClientRect();
	return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
}

function swapNodes(nodeA, nodeB) {
	const parentA = nodeA.parentNode;
	const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

	// move nodeA before nodeB
	nodeB.parentNode.insertBefore(nodeA, nodeB);

	// move nodeB before the sibling of nodeA
	parentA.insertBefore(nodeB, siblingA);
}

function swapItemsInList(nodeA, nodeB) {
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

function getTodoList() {
	return JSON.parse(storage.getItem(TODO_LIST_ITEMS));
}

function saveTodoList() {
	storage.setItem(TODO_LIST_ITEMS, JSON.stringify(todoListItems));
}

function createAllListItems() {
	todoListItems.forEach((item, i) => createListItem(item, i));
}

createAllListItems();
