const todoList = document.querySelector("#todo-list");


const todoListItems = [
	"placeholder list item text 1",
	"placeholder list item text 2",
	"placeholder list item text 3",
	"placeholder list item text 4",
];

(function createListItem() {
	for (const item of todoListItems) {
		// create the list item container and h1 containing the todo text
		const listItem = document.createElement("div");
		listItem.classList.add("todo-list_item");
		const listItemText = document.createElement("h1");
		listItemText.classList.add("todo-list_item_text");
		const listItemTextNode = document.createTextNode(item);
		listItemText.appendChild(listItemTextNode);
		listItem.appendChild(listItemText);

		// create the delete button and append it to the list item
		const deleteButton = document.createElement("div");
		deleteButton.classList.add("todo-list_item_delete-button");
		const deleteButtonText = document.createElement("h1");
		const deleteTextNode = document.createTextNode("X");
		deleteButtonText.appendChild(deleteTextNode);
		deleteButton.appendChild(deleteButtonText);
		deleteButton.addEventListener("click", deleteListItem);
		listItem.appendChild(deleteButton);

		// add the list item to the todo list
		todoList.appendChild(listItem);
	}
})();

function deleteListItem(event) {
	console.log(event);
}
