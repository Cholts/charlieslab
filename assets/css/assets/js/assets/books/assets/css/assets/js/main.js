/**
 * main.js
 * 
 * 1) loadAndRenderBookList(): used on index.html
 * 2) loadAndRenderBookDetail(): used on book.html
 */

const BOOKS_JSON = "books.json";

/** Fetches books.json and returns an array of book objects. */
async function fetchBooksData() {
  try {
    const res = await fetch(BOOKS_JSON);
    if (!res.ok) throw new Error("Could not load books.json");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

/** Renders the grid of books on index.html */
async function loadAndRenderBookList() {
  const books = await fetchBooksData();
  const container = document.getElementById("books-container");
  if (!container) return;

  if (books.length === 0) {
    container.innerHTML = "<p>No books found. Go to admin.html to add some!</p>";
    return;
  }

  container.innerHTML = ""; // clear existing

  books.forEach((book) => {
    const card = document.createElement("div");
    card.className = "book-card";

    // Cover image
    const img = document.createElement("img");
    img.className = "cover-thumb";
    img.alt = `Cover of ${book.title}`;
    img.src = book.cover ? `assets/books/${book.cover}` : "";
    card.appendChild(img);

    // Card body
    const body = document.createElement("div");
    body.className = "card-body";
    const h3 = document.createElement("h3");
    h3.textContent = book.title;
    body.appendChild(h3);

    if (book.isbn) {
      const pIsbn = document.createElement("p");
      pIsbn.textContent = `ISBN: ${book.isbn}`;
      body.appendChild(pIsbn);
    }

    card.appendChild(body);
    card.addEventListener("click", () => {
      window.location.href = `book.html?id=${encodeURIComponent(book.slug)}`;
    });

    container.appendChild(card);
  });
}

/** Renders a single book’s detail on book.html based on ?id=slug */
async function loadAndRenderBookDetail() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("id");
  if (!slug) {
    document.getElementById("book-detail-container").innerHTML =
      "<p>Invalid book ID.</p>";
    return;
  }

  const books = await fetchBooksData();
  const book = books.find((b) => b.slug === slug);
  if (!book) {
    document.getElementById("book-detail-container").innerHTML =
      "<p>Book not found.</p>";
    return;
  }

  const container = document.getElementById("book-detail-container");
  container.innerHTML = "";

  // Title
  const h1 = document.createElement("h1");
  h1.textContent = book.title;
  container.appendChild(h1);

  // ISBN
  if (book.isbn) {
    const pIsbn = document.createElement("p");
    pIsbn.className = "isbn";
    pIsbn.textContent = `ISBN: ${book.isbn}`;
    container.appendChild(pIsbn);
  }

  // Cover image
  if (book.cover) {
    const img = document.createElement("img");
    img.className = "book-cover";
    img.alt = `Cover of ${book.title}`;
    img.src = `assets/books/${book.cover}`;
    container.appendChild(img);
  }

  // Description (simple Markdown → paragraphs)
  if (book.description) {
    const descEl = document.createElement("div");
    descEl.className = "book-description";
    const paragraphs = book.description.split(/\n{2,}/g);
    paragraphs.forEach((para) => {
      const p = document.createElement("p");
      p.innerHTML = para.replace(/\n/g, "<br/>");
      descEl.appendChild(p);
    });
    container.appendChild(descEl);
  }

  // Download PDF
  if (book.pdf) {
    const a = document.createElement("a");
    a.className = "download-button";
    a.href = `assets/books/${book.pdf}`;
    a.textContent = "Download PDF";
    a.target = "_blank";
    container.appendChild(a);
  }
}
