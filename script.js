const bookForm = document.getElementById('book-form');
const formBtn = document.getElementById('btn-add');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const isbnInput = document.getElementById('isbn');
const bookList = document.getElementById('book-list');
const clearAllBtn = document.getElementById('btn-clear');

let editMode = false;

// Book Class: Represent a book
class Book {
	constructor(title, author, isbn) {
		this.title = title;
		this.author = author;
		this.isbn = isbn;
	}
}

// UI Class: Handing UI task
class UI {
	static showAlert(alertMsg) {
		alert(alertMsg);
	}

	static displayBooks() {
		const storedBooks = Storage.getBooksFromLocal();

		const books = storedBooks;
		books.forEach((book) => UI.addToTheList(book));

		UI.checkUI();
	}

	static addToTheList(book) {
		const tr = document.createElement('tr');
		for (const key in book) {
			const td = document.createElement('td');
			const element = document.createTextNode(book[key]);
			td.appendChild(element);
			tr.appendChild(td);
		}

		const removeBtn = this.createButton(
			'btn btn-remove btn-sm',
			'fa-solid fa-xmark',
			'red'
		);
		const tdBtn = document.createElement('td');
		tdBtn.style.textAlign = 'center';
		tdBtn.appendChild(removeBtn);
		tr.appendChild(tdBtn);

		bookList.appendChild(tr);
	}

	static createButton(buttonClasses, iconClasses, iconColor) {
		const button = document.createElement('button');
		button.className = buttonClasses;
		const icon = this.createIcon(iconClasses, iconColor);
		button.appendChild(icon);
		return button;
	}

	static createIcon(classList, color = null) {
		const icon = document.createElement('i');
		icon.className = classList;
		if (color) {
			icon.style.color = color;
		}
		return icon;
	}

	static normalMode(e) {
		const container = document.querySelector('.container');
		if (!container.contains(e.target) && editMode) {
			const editBook = document.querySelector('.edit-mode');
			editBook.style.textDecoration = 'none';
			editBook.style.color = 'black';
			editBook.classList.remove('edit-mode');
			UI.checkUI();
		}
	}

	static checkUI() {
		editMode = false;
		titleInput.value = '';
		authorInput.value = '';
		isbnInput.value = '';

		formBtn.value = 'Add Book';
		formBtn.classList.replace('btn-success', 'btn-primary');

		const bookList = document.querySelectorAll('#book-list tr');
		const table = document.querySelector('.table');
		const clearAllBtn = document.getElementById('btn-clear');

		if (bookList.length === 0) {
			table.style.display = 'none';
			clearAllBtn.style.display = 'none';
		} else {
			table.style.display = 'inline-table';
			clearAllBtn.style.display = 'block';
		}
	}
}

// Store Class: Handles Storage
class Storage {
	static addBookToLocal(book) {
		const savedBooks = this.getBooksFromLocal();
		savedBooks.push(book);
		localStorage.setItem('books', JSON.stringify(savedBooks));
	}

	static getBooksFromLocal() {
		let savedBooks;
		if (localStorage.getItem('books') == null) {
			savedBooks = [];
		} else {
			savedBooks = JSON.parse(localStorage.getItem('books'));
		}
		return savedBooks;
	}

	static removeBookFromLocal(book) {
		let savedBooks = this.getBooksFromLocal();
		savedBooks = savedBooks.filter((sBook) => sBook.isbn !== book.isbn);
		localStorage.setItem('books', JSON.stringify(savedBooks));
	}

	static removeAllFromLocal() {
		localStorage.removeItem('books');
	}

	static doesAlreadyExist(book) {
		let doesExist = false;
		const savedBooks = this.getBooksFromLocal();
		for (const sbook of savedBooks) {
			if (sbook.isbn === book.isbn) {
				doesExist = true;
			}
		}
		return doesExist;
	}
}

class Event {
	static addBookToDom(e) {
		e.preventDefault();

		const title = titleInput.value.trim();
		const author = authorInput.value.trim();
		const isbn = isbnInput.value.trim();

		if (!title || !author || !isbn) {
			UI.showAlert('Field(s) Empty');
			UI.checkUI();
			return;
		}

		const newBook = new Book(
			titleInput.value,
			authorInput.value,
			isbnInput.value
		);

		if (Storage.doesAlreadyExist(newBook)) {
			UI.showAlert('Book already exist');
			UI.normalMode();
			UI.checkUI();
			return;
		}

		if (editMode) {
			const editBook = document.querySelector('.edit-mode');

			const bookTitle = editBook.children[0].textContent;
			const bookAuthor = editBook.children[1].textContent;
			const bookISBN = editBook.children[2].textContent;
			const deleteBook = new Book(bookTitle, bookAuthor, bookISBN);
			Storage.removeBookFromLocal(deleteBook);

			editBook.classList.remove('edit-mode');
			editBook.remove();
			editMode = false;
		}

		Storage.addBookToLocal(newBook);
		UI.addToTheList(newBook);
		UI.checkUI();
	}

	static removeBookFromDom(e) {
		if (
			e.target.parentElement.classList.contains('btn-remove') ||
			e.target.classList.contains('btn-remove')
		) {
			const selectedBook = e.target.classList.contains('btn-remove')
				? e.target.parentElement.parentElement //clicks the button
				: e.target.parentElement.parentElement.parentElement; //clicks the icon

			const bookTitle = selectedBook.children[0].textContent;
			const bookAuthor = selectedBook.children[1].textContent;
			const bookISBN = selectedBook.children[2].textContent;
			const removeBook = new Book(bookTitle, bookAuthor, bookISBN);
			Storage.removeBookFromLocal(removeBook);

			selectedBook.remove();
			UI.checkUI();
		} else {
			Event.editItemInDom(e.target);
		}
	}

	static editItemInDom(book) {
		if (editMode) {
			const editBook = document.querySelector('.edit-mode');
			editBook.style.textDecoration = 'none';
			editBook.style.color = 'black';
			editBook.classList.remove('edit-mode');
		}

		editMode = true;
		book = book.parentElement;
		book.classList.add('edit-mode');
		book.style.textDecoration = 'line-through';
		book.style.color = 'grey';

		formBtn.value = 'Update Book';
		formBtn.classList.replace('btn-primary', 'btn-success');

		const bookTitle = book.children[0].textContent;
		const bookAuthor = book.children[1].textContent;
		const bookISBN = book.children[2].textContent;
		titleInput.value = bookTitle;
		authorInput.value = bookAuthor;
		isbnInput.value = bookISBN;
	}

	static removeAllFromDom(e) {
		while (bookList.firstChild) {
			bookList.firstChild.remove();
		}
		Storage.removeAllFromLocal();
		UI.checkUI();
	}
}

function init() {
	// Event: Display books
	document.addEventListener('DOMContentLoaded', UI.displayBooks);

	// Event: Add a book
	bookForm.addEventListener('submit', Event.addBookToDom);

	// Event: Remove a book
	bookList.addEventListener('click', Event.removeBookFromDom);

	// Event: Clear all
	clearAllBtn.addEventListener('click', Event.removeAllFromDom);

	//Event: Normal Mode
	document.addEventListener('click', UI.normalMode);
}

init();
