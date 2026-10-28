const STORAGE_KEY = "manik_reading_list_books";

const initialSampleBooks = [
  {
    id: "1",
    title: "Clean Code",
    author: "Robert C. Martin",
    genre: "Software Engineering",
    status: "completed"
  },
  {
    id: "2",
    title: "Fluent Python",
    author: "Luciano Ramalho",
    genre: "Python Programming",
    status: "reading"
  },
  {
    id: "3",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    genre: "System Design",
    status: "wishlist"
  }
];

let books = [];
let currentFilter = "all";

function loadBooks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      books = JSON.parse(saved);
    } catch (e) {
      books = initialSampleBooks;
    }
  } else {
    books = initialSampleBooks;
    saveBooks();
  }
  updateStats();
  renderBooks();
}

function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function updateStats() {
  const total = books.length;
  const completed = books.filter(b => b.status === "completed").length;
  const reading = books.filter(b => b.status === "reading").length;
  const wishlist = books.filter(b => b.status === "wishlist").length;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-completed").textContent = completed;
  document.getElementById("stat-reading").textContent = reading;
  document.getElementById("stat-wishlist").textContent = wishlist;
}

function renderBooks() {
  const bookList = document.getElementById("book-list");
  bookList.innerHTML = "";

  const filtered = currentFilter === "all"
    ? books
    : books.filter(b => b.status === currentFilter);

  if (filtered.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "no-books";
    emptyMsg.textContent = "No books found in this category. Add your first book on the left!";
    bookList.appendChild(emptyMsg);
    return;
  }

  filtered.forEach(book => {
    const card = document.createElement("div");
    card.className = "book-card";

    const titleEl = document.createElement("h3");
    titleEl.className = "book-title";
    titleEl.textContent = book.title;

    const authorEl = document.createElement("p");
    authorEl.className = "book-author";
    authorEl.textContent = `by ${book.author}`;

    const metaEl = document.createElement("div");
    metaEl.className = "book-meta";

    const genreBadge = document.createElement("span");
    genreBadge.className = "badge-genre";
    genreBadge.textContent = book.genre;

    const statusBadge = document.createElement("span");
    statusBadge.className = `badge-status status-${book.status}`;
    statusBadge.textContent = getStatusLabel(book.status);

    metaEl.appendChild(genreBadge);
    metaEl.appendChild(statusBadge);

    const actionsEl = document.createElement("div");
    actionsEl.className = "card-actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "btn-status";
    toggleBtn.textContent = getNextStatusAction(book.status);
    toggleBtn.addEventListener("click", () => cycleStatus(book.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteBook(book.id));

    actionsEl.appendChild(toggleBtn);
    actionsEl.appendChild(deleteBtn);

    card.appendChild(titleEl);
    card.appendChild(authorEl);
    card.appendChild(metaEl);
    card.appendChild(actionsEl);

    bookList.appendChild(card);
  });
}

function getStatusLabel(status) {
  switch (status) {
    case "completed": return "Completed";
    case "reading": return "Reading";
    case "wishlist": return "Want to Read";
    default: return status;
  }
}

function getNextStatusAction(status) {
  switch (status) {
    case "wishlist": return "Mark as Reading";
    case "reading": return "Mark as Completed";
    case "completed": return "Move to Wishlist";
    default: return "Update Status";
  }
}

function cycleStatus(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  if (book.status === "wishlist") book.status = "reading";
  else if (book.status === "reading") book.status = "completed";
  else book.status = "wishlist";

  saveBooks();
  updateStats();
  renderBooks();
}

function deleteBook(id) {
  books = books.filter(b => b.id !== id);
  saveBooks();
  updateStats();
  renderBooks();
}

// Handle Form Submission
document.getElementById("book-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("book-title").value.trim();
  const author = document.getElementById("book-author").value.trim();
  const genre = document.getElementById("book-genre").value.trim();
  const status = document.getElementById("book-status").value;

  if (!title || !author) return;

  const newBook = {
    id: Date.now().toString(),
    title,
    author,
    genre: genre || "General",
    status
  };

  books.unshift(newBook);
  saveBooks();
  updateStats();
  renderBooks();

  // Reset form
  e.target.reset();
});

// Handle Filter Tabs
document.querySelectorAll(".filter-tab").forEach(tab => {
  tab.addEventListener("click", (e) => {
    document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
    e.target.classList.add("active");
    currentFilter = e.target.getAttribute("data-filter");
    renderBooks();
  });
});

// Initial load
loadBooks();
