import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchBookById } from '../api'; // ใช้ api.js

const BookDetailPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        const data = await fetchBookById(id); // เรียก API ผ่าน api.js

        // Mapping snake_case → camelCase
        setBook({
          ...data,
          coverImage: data.cover_image,
          originalPrice: data.original_price,
          reviewsCount: data.reviews_count,
          isNew: data.is_new,
        });

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadBook();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-yellow-50">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-yellow-50">
        <div className="text-xl text-red-600 mb-4">Error: {error}</div>
        <Link to="/books" className="text-yellow-600 hover:text-orange-600">
          ← Back to Book List
        </Link>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-yellow-50">
        <div className="text-xl mb-4">Book not found</div>
        <Link to="/books" className="text-yellow-600 hover:text-orange-600">
          ← Back to Book List
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 py-16 px-4">
      <div className="container mx-auto max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        <Link to="/books" className="text-yellow-600 hover:text-orange-600 mb-4 inline-block">
          ← Back to Book List
        </Link>

        <h1 className="text-3xl font-bold mb-6">{book.title}</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover Image */}
          {book.coverImage && (
            <div className="md:w-1/3 relative">
              {book.isNew && (
                <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-semibold">
                  New
                </span>
              )}
              <img src={book.coverImage} alt={book.title} className="rounded-xl shadow-lg" />
            </div>
          )}

          {/* Book Info */}
          <div className="md:w-2/3 space-y-2">
            <p><span className="font-semibold">Author:</span> {book.author}</p>
            <p><span className="font-semibold">ISBN:</span> {book.isbn}</p>
            <p><span className="font-semibold">Year:</span> {book.year}</p>
            <p>
              <span className="font-semibold">Price:</span>{' '}
              {book.originalPrice && book.originalPrice > book.price ? (
                <>
                  <span className="line-through text-gray-400">฿{book.originalPrice}</span>{' '}
                  <span className="text-red-600 font-bold">฿{book.price}</span>
                </>
              ) : (
                <>฿{book.price}</>
              )}
            </p>
            <p><span className="font-semibold">Category:</span> {book.category}</p>
            <p><span className="font-semibold">Discount:</span> {book.discount}%</p>
            <p><span className="font-semibold">Pages:</span> {book.pages}</p>
            <p><span className="font-semibold">Language:</span> {book.language}</p>
            <p><span className="font-semibold">Publisher:</span> {book.publisher}</p>
            <p><span className="font-semibold">Rating:</span> {book.rating} ({book.reviewsCount} reviews)</p>
            {book.description && (
              <p><span className="font-semibold">Description:</span> {book.description}</p>
            )}

            <button className="mt-4 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
              เพิ่มลงตะกร้า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
