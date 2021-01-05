const todoListItems = [
	"placeholder list item text 1",
	"placeholder list item text 2",
	"placeholder list item text 3",
	"placeholder list item text 4",
];


const todoList = document.querySelector("#todo-list");
const listInput = document.querySelector("#todo-list_input");

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
	if (todoListItems.findIndex(td => td === newItemText) > -1) {
		return;
	}
	todoListItems.push(newItemText);
	createListItem(newItemText, todoListItems.length - 1);
});
// drag & drop variables
let draggingElement;
let draggingElementPlaceholder;
let draggingInProgress = false;
let mouseY = null;

// let previouslyDraggedOverItem;

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
	const deleteTextNode = document.createTextNode("x");
	deleteButtonText.appendChild(deleteTextNode);
	deleteButton.addEventListener("click", () => listItem.remove());
	deleteButton.appendChild(deleteButtonText);
	listItem.appendChild(deleteButton);

	// add the list item to the todo list
	todoList.appendChild(listItem);
}

function mouseDownHandler(event) {
	draggingElement = event.target;
	while (!draggingElement.classList.contains("todo-list_item")) {
		draggingElement = draggingElement.parentNode;
	}

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
	draggingElement.style.top = `${event.pageY - mouseY}px`;

	// moving up
	if (previousElement && isAbove(draggingElement, previousElement)) {
		// cancel if above element is the list input
		if (previousElement.id === "todo-list_input") {
			return;
		}

		swapNodes(previousElement, draggingElement);
		swapNodes(draggingElementPlaceholder, previousElement);
	}

	// moving down
	if (nextElement && isAbove(nextElement, draggingElement)) {
		swapNodes(nextElement, draggingElementPlaceholder);
		swapNodes(nextElement, draggingElement);
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

	// clear drag & drop variables
	mouseY = null;
	draggingElement = null;

	// remove mousemove and mouseup listeners
	document.removeEventListener("mousemove", mouseMoveHandler);
	document.removeEventListener("mouseup", mouseUpHandler);

	// TODO list again in storage (if applicable) with the new order;
	// console.log(todoListItems);
}

function isAbove(nodeA, nodeB) {
	const rectA = nodeA.getBoundingClientRect();
	const rectB = nodeB.getBoundingClientRect();
	return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
}

function swapNodes(nodeA, nodeB) {
	// console.log("nodeA: ", nodeA);
	// console.log("nodeB: ", nodeB.querySelector(".todo-list_item_text").textContent);
	const parentA = nodeA.parentNode;
	const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

	// move nodeA before nodeB
	nodeB.parentNode.insertBefore(nodeA, nodeB);

	// move nodeB before the sibling of nodeA
	parentA.insertBefore(nodeB, siblingA);
}

function createAllListItems() {
	todoListItems.forEach((item, i) => createListItem(item, i));
}

createAllListItems();
