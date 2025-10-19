import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpenIcon, PencilIcon, ArrowLeftIcon } from "@heroicons/react/outline";

const EditBookPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ตรวจสอบสิทธิ์ admin
  useEffect(() => {
    if (localStorage.getItem("isAdminAuthenticated") !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  // โหลดรายชื่อหนังสือ
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/v1/books");
        if (!res.ok) throw new Error("โหลดรายชื่อหนังสือล้มเหลว");
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

  // เมื่อเลือกหนังสือ
  const handleSelectBook = async (bookId) => {
    setSuccessMessage("");
    try {
      const res = await fetch(`http://localhost:8080/api/v1/books/${bookId}`);
      if (!res.ok) throw new Error("โหลดข้อมูลหนังสือล้มเหลว");
      const data = await res.json();
      setSelectedBook(data);
      setFormData(data);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const res = await fetch(`http://localhost:8080/api/v1/books/${selectedBook.id}`, {
      method: "POST", // 👈 เปลี่ยนจาก PUT เป็น POST
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn.trim(),
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        category: formData.category || "",
        original_price: formData.original_price
          ? parseFloat(formData.original_price)
          : null,
        discount: formData.discount ? parseInt(formData.discount) : 0,
        cover_image: formData.cover_image || "",
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        reviews_count: formData.reviews_count
          ? parseInt(formData.reviews_count)
          : 0,
        is_new: formData.is_new || false,
        pages: formData.pages ? parseInt(formData.pages) : null,
        language: formData.language || "",
        publisher: formData.publisher || "",
        description: formData.description || "",
      }),
    });

    if (!res.ok) throw new Error("อัปเดตข้อมูลหนังสือล้มเหลว");

    const updated = await res.json();
    alert(`แก้ไขหนังสือ "${updated.title}" สำเร็จแล้ว!`);
    setSelectedBook(null); // กลับไปหน้า list หลังแก้ไขเสร็จ
    setBooks((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
  } catch (error) {
    alert(error.message);
  } finally {
    setIsSubmitting(false);
  }
};


  if (loading) return <p className="text-center py-10">กำลังโหลด...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-viridian-600 to-green-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6 flex items-center space-x-3">
          <BookOpenIcon className="h-8 w-8" />
          <h1 className="text-2xl font-bold">แก้ไขหนังสือ</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* ปุ่มย้อนกลับ */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-gray-700 hover:text-viridian-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          ย้อนกลับ
        </button>

        {/* ถ้ายังไม่ได้เลือกหนังสือ */}
        {!selectedBook ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">เลือกรายการหนังสือที่ต้องการแก้ไข</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white p-6 rounded-xl shadow flex flex-col justify-between"
                >
                  <div>
                    {book.cover_image && (
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-lg font-semibold mb-1">{book.title}</h3>
                    <p className="text-gray-500 mb-4">ผู้แต่ง: {book.author}</p>
                  </div>
                  <button
  onClick={() => handleSelectBook(book.id)}
  className="flex items-center justify-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
>
  <PencilIcon className="h-5 w-5 mr-2" />
  แก้ไข
</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // แบบฟอร์มแก้ไขหนังสือ
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-4">แก้ไขหนังสือ: {selectedBook.title}</h2>

            {successMessage && (
              <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {["title", "author", "isbn", "year", "price"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field === "title"
                      ? "ชื่อหนังสือ"
                      : field === "author"
                      ? "ชื่อผู้แต่ง"
                      : field.toUpperCase()}
                  </label>
                  <input
                    type={field === "year" || field === "price" ? "number" : "text"}
                    name={field}
                    value={formData[field] || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-viridian-500"
                  />
                </div>
              ))}

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white ${
                    isSubmitting
                      ? "bg-gray-400"
                      : "bg-viridian-600 hover:bg-viridian-700"
                  }`}
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditBookPage;
