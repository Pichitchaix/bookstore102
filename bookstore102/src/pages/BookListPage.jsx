import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBooks } from "../api";

const BookListPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const data = await fetchBooks(); // ดึงหนังสือทั้งหมด
        setBooks(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ปุ่มย้อนกลับไปหน้า Home */}
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Books</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => {
          const discountedPrice = book.originalPrice 
            ? book.originalPrice * (1 - book.discount / 100) 
            : book.price;

          return (
            <div key={book.id} className="bg-white shadow rounded-lg p-4 relative">
              {/* Badge ใหม่ */}
              {book.isNew && (
                <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs rounded">
                  New
                </span>
              )}

              {/* Cover Image เป็นลิงก์ไปหน้า Detail */}
              {book.coverImage && (
                <Link to={`/books/${book.id}`}>
                  <img 
                    src={book.coverImage} 
                    alt={book.title} 
                    className="h-48 w-full object-cover rounded cursor-pointer hover:opacity-90 transition-opacity" 
                  />
                </Link>
              )}

              <h2 className="mt-2 font-semibold text-lg">{book.title}</h2>
              <p className="text-gray-600">{book.author}</p>

              {/* แสดงราคาปกติและราคาลด */}
              {book.discount > 0 && book.originalPrice ? (
                <p className="mt-1">
                  <span className="line-through text-gray-400 mr-2">฿{book.originalPrice}</span>
                  <span className="font-bold text-red-600">฿{discountedPrice.toFixed(2)}</span>
                </p>
              ) : (
                <p className="mt-1 font-bold text-viridian-600">฿{book.price}</p>
              )}

              {/* เอาปุ่ม View Details ออกแล้ว */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookListPage;
