import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const CategoryPage = () => {
  const { category } = useParams(); // อ่าน category จาก URL
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/v1/books");
        if (!res.ok) throw new Error("โหลดหนังสือล้มเหลว");
        const data = await res.json();
        setBooks(data);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  if (loading) return <p className="text-center py-10">กำลังโหลดหนังสือ...</p>;

  // Filter ตาม category ถ้ามี
  const filteredBooks = category
    ? books.filter((b) => b.category?.toLowerCase() === category.toLowerCase())
    : books;

  // สร้าง list หมวดหมู่สำหรับเมนู
  const categoriesList = [...new Set(books.map((b) => b.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-yellow-50 py-16 px-4">
      <div className="container mx-auto max-w-6xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6">Book Categories</h1>

        {/* เมนูหมวดหมู่ */}
        <div className="flex flex-wrap gap-4 mb-8">
          {categoriesList.map((cat) => (
            <Link
              key={cat}
              to={`/categories/${cat}`}
              className="px-4 py-2 bg-yellow-200 rounded-lg hover:bg-yellow-300 font-semibold"
            >
              {cat}
            </Link>
          ))}
          <Link
            to="/categories"
            className="px-4 py-2 bg-yellow-400 rounded-lg hover:bg-yellow-500 font-semibold"
          >
            All
          </Link>
        </div>

        {/* แสดงหนังสือ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Link
              key={book.id}
              to={`/books/${book.id}`}
              className="bg-yellow-100 hover:bg-yellow-200 rounded-lg shadow p-4 flex flex-col items-center transition-colors"
            >
              {book.cover_image && (
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              )}
              <h3 className="font-semibold text-lg text-center">{book.title}</h3>
              <p className="text-gray-600 text-sm text-center mt-1">{book.author}</p>
              <p className="text-gray-800 font-bold mt-2">{book.price} ฿</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
