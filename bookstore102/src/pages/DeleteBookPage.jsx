// src/pages/DeleteBookPage.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrashIcon, BookOpenIcon, ArrowLeftIcon } from "@heroicons/react/outline";

const DeleteBookPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ตรวจสอบการล็อกอิน Admin
  useEffect(() => {
    if (localStorage.getItem("isAdminAuthenticated") !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch หนังสือจาก backend
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/v1/books");
        if (!res.ok) throw new Error("โหลดหนังสือล้มเหลว");
        const data = await res.json();
        setBooks(data);
      } catch (error) {
        console.error(error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // ฟังก์ชันลบหนังสือ
  const handleDelete = async (bookId) => {
    const book = books.find((b) => b.id === bookId);
    if (window.confirm(`คุณต้องการลบหนังสือ "${book.title}" จริงหรือไม่?`)) {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/books/${bookId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("ลบหนังสือล้มเหลว");
        // อัปเดตรายการหนังสือบนหน้า
        setBooks((prev) => prev.filter((b) => b.id !== bookId));
        alert(`ลบหนังสือ "${book.title}" เรียบร้อยแล้ว`);
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    }
  };

  if (loading) return <p className="text-center py-10">กำลังโหลด...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-viridian-600 to-green-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6 flex items-center space-x-3">
          <BookOpenIcon className="h-8 w-8" />
          <h1 className="text-2xl font-bold">ลบหนังสือ</h1>
        </div>
      </header>

      {/* ปุ่มย้อนกลับ */}
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={() => navigate("/store-manager/dashboard")}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>ย้อนกลับ</span>
        </button>
      </div>

      {/* Book List */}
      <div className="container mx-auto px-4 py-4">
        {books.length === 0 ? (
          <p className="text-center text-gray-500">ไม่มีหนังสือให้ลบ</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white p-6 rounded-xl shadow flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-semibold mb-2">{book.title}</h3>
                  <p className="text-gray-500 mb-4">ผู้แต่ง: {book.author}</p>
                </div>
                <button
                  onClick={() => handleDelete(book.id)}
                  className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  ลบหนังสือ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteBookPage;
