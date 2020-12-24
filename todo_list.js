const todoList = document.querySelector("#todo-list");

(function createListItem() {
	for (let i = 0; i < 10; i++) {
		// create the list item container and h1 containing the todo text
		const listItem = document.createElement("div");
		listItem.classList.add("todo-list_item")
		const listItemText = document.createElement("h1");
		listItemText.classList.add("todo-list_item_text")
		const listItemTextNode = document.createTextNode("placeholder list item text " + i);
		listItemText.appendChild(listItemTextNode);
		listItem.appendChild(listItemText);
		
		// create the delete button and append it to the list item
		const deleteButton = document.createElement("div");
		deleteButton.classList.add("todo-list_item_delete-button");
		const deleteButtonText = document.createElement("h1");
		const deleteTextNode = document.createTextNode("X");
		deleteButtonText.appendChild(deleteTextNode);
		deleteButton.appendChild(deleteButtonText);
		listItem.appendChild(deleteButton);

		// add the list item to the todo list
		todoList.appendChild(listItem);
	}
})();
