const todoList = document.querySelector("#todo-list");
const listInput = document.querySelector("#todo-list_input");

listInput.addEventListener("keydown", (event) => {
	if (event.keyCode !== 13) {
		return;
	}
	const newItemText = event.target.value.trim();
	event.target.value = "";
	if (Boolean(newItemText)) {
		createListItem(newItemText);
	}
});

const todoListItems = [
	"placeholder list item text 1",
	"placeholder list item text 2",
	"placeholder list item text 3",
	"placeholder list item text 4",
];

function createListItem(item) {
	// create the list item container and h1 containing the todo text
	const listItem = document.createElement("div");
	listItem.classList.add("todo-list_item");
	const listItemText = document.createElement("h1");
	listItemText.classList.add("todo-list_item_text");
	const listItemTextNode = document.createTextNode(item);
	listItemText.appendChild(listItemTextNode);
	listItem.appendChild(listItemText);

	// drag and drop
	// listItem.setAttribute("draggable", "true");
	// listItem.addEventListener("drop", () => console.log("drop"));
	// listItem.addEventListener("dragstart", () => console.log("dragstart"));
	// listItem.addEventListener("drag", () => console.log("drag"));
	// listItem.addEventListener("dragend", () => console.log("dragend"));

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

// create list items for all current items
for (const item of todoListItems) {
	createListItem(item);
}
