const API_BASE = "http://localhost:8080/api/v1";

function mapBook(book) {
  return {
    ...book,
    coverImage: book.cover_image,
    originalPrice: book.original_price,
    reviewsCount: book.reviews_count,
    isNew: book.is_new,
  };
}

export async function fetchBooks(category = "") {
  const url = category ? `${API_BASE}/books?category=${category}` : `${API_BASE}/books`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch books");
  const data = await res.json();
  return data.map(mapBook); // map ทั้ง array
}

export async function fetchBookById(id) {
  const res = await fetch(`${API_BASE}/books/${id}`);
  if (!res.ok) throw new Error("Failed to fetch book");
  const data = await res.json();
  return mapBook(data); // map ตัวเดียว
}

// ส่วนอื่น ๆ ของ API ก็ไม่ต้อง map เพราะเป็น array ของ string หรือไม่ใช่ book object
export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function searchBooks(keyword) {
  const res = await fetch(`${API_BASE}/books/search?q=${encodeURIComponent(keyword)}`);
  if (!res.ok) throw new Error("Failed to search books");
  const data = await res.json();
  return data.map(mapBook);
}

export async function fetchFeaturedBooks() {
  const res = await fetch(`${API_BASE}/books/featured`);
  if (!res.ok) throw new Error("Failed to fetch featured books");
  const data = await res.json();
  return data.map(mapBook);
}

export async function fetchNewBooks() {
  const res = await fetch(`${API_BASE}/books/new`);
  if (!res.ok) throw new Error("Failed to fetch new books");
  const data = await res.json();
  return data.map(mapBook);
}

export async function fetchDiscountedBooks() {
  const res = await fetch(`${API_BASE}/books/discounted`);
  if (!res.ok) throw new Error("Failed to fetch discounted books");
  const data = await res.json();
  return data.map(mapBook);
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Invalid username or password");

  return res.json();
}
