
const API = "/api/books";

const formPanel = document.getElementById("formPanel");
const bookForm = document.getElementById("bookForm");
const booksTable = document.getElementById("booksTable");
const formMessage = document.getElementById("formMessage");
const listMessage = document.getElementById("listMessage");
const searchInput = document.getElementById("searchInput");

let books = [];

function showMessage(element, message, type = "") {
  element.textContent = message;
  element.className = type;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Request failed");
  }

  return result;
}

async function loadBooks() {
  try {
    showMessage(listMessage, "Loading inventory...");
    const result = await request(API);
    books = result.data;
    renderBooks();
    showMessage(listMessage, "");
  } catch (error) {
    showMessage(listMessage, error.message, "error");
    booksTable.innerHTML =
      '<tr><td colspan="6" class="empty">Unable to load books.</td></tr>';
  }
}

function renderBooks() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = books.filter(book =>
    [book.title, book.author, book.isbn, book.category]
      .some(value => String(value || "").toLowerCase().includes(query))
  );

  document.getElementById("totalTitles").textContent = books.length;
  document.getElementById("totalCopies").textContent =
    books.reduce((sum, book) => sum + book.quantity, 0);
  document.getElementById("totalCategories").textContent =
    new Set(books.map(book => book.category)).size;

  if (!filtered.length) {
    booksTable.innerHTML =
      '<tr><td colspan="6" class="empty">No books found. Add your first book.</td></tr>';
    return;
  }

  booksTable.innerHTML = filtered.map(book => `
    <tr>
      <td>
        <div class="book-title">${escapeHTML(book.title)}</div>
        <div class="book-author">by ${escapeHTML(book.author)}</div>
      </td>
      <td>${escapeHTML(book.isbn)}</td>
      <td>${escapeHTML(book.category)}</td>
      <td>${book.publicationYear ?? "—"}</td>
      <td>${book.quantity}</td>
      <td>
        <button class="action-btn" data-action="edit"
          data-id="${escapeHTML(book._id)}">Edit</button>
        <button class="action-btn delete" data-action="delete"
          data-id="${escapeHTML(book._id)}">Delete</button>
      </td>
    </tr>
  `).join("");
}

function openForm(book = null) {
  bookForm.reset();
  showMessage(formMessage, "");

  document.getElementById("bookId").value = book?._id || "";
  document.getElementById("formTitle").textContent =
    book ? "Edit Book" : "Add a New Book";

  if (book) {
    document.getElementById("title").value = book.title;
    document.getElementById("author").value = book.author;
    document.getElementById("isbn").value = book.isbn;
    document.getElementById("category").value = book.category;
    document.getElementById("quantity").value = book.quantity;
    document.getElementById("publicationYear").value =
      book.publicationYear ?? "";
  }

  formPanel.hidden = false;
  formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.getElementById("addBookBtn").addEventListener("click", () => {
  openForm();
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  formPanel.hidden = true;
});

searchInput.addEventListener("input", renderBooks);

bookForm.addEventListener("submit", async event => {
  event.preventDefault();
  showMessage(formMessage, "Saving...");

  const id = document.getElementById("bookId").value;
  const yearValue = document.getElementById("publicationYear").value;

  const payload = {
    title: document.getElementById("title").value.trim(),
    author: document.getElementById("author").value.trim(),
    isbn: document.getElementById("isbn").value.trim(),
    category: document.getElementById("category").value,
    quantity: Number(document.getElementById("quantity").value),
    publicationYear: yearValue ? Number(yearValue) : undefined
  };

  try {
    await request(id ? `${API}/${encodeURIComponent(id)}` : API, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });

    showMessage(formMessage, id ? "Book updated successfully." :
      "Book added successfully.", "success");

    formPanel.hidden = true;
    await loadBooks();
  } catch (error) {
    showMessage(formMessage, error.message, "error");
  }
});

booksTable.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const book = books.find(item => item._id === button.dataset.id);
  if (!book) return;

  if (button.dataset.action === "edit") {
    openForm(book);
    return;
  }

  if (button.dataset.action === "delete") {
    if (!confirm(`Delete "${book.title}" from the inventory?`)) return;

    try {
      await request(`${API}/${encodeURIComponent(book._id)}`, {
        method: "DELETE"
      });

      showMessage(listMessage, "Book deleted successfully.", "success");
      await loadBooks();
    } catch (error) {
      showMessage(listMessage, error.message, "error");
    }
  }
});

loadBooks();
