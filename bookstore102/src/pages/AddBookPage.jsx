import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenIcon, LogoutIcon } from '@heroicons/react/outline';

const AddBookPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    year: '',
    price: '',
    category: '',
    original_price: '',
    discount: '',
    cover_image: '',
    rating: '',
    reviews_count: '',
    is_new: false,
    pages: '',
    language: '',
    publisher: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'กรุณากรอกชื่อหนังสือ';
    if (!formData.author.trim()) newErrors.author = 'กรุณากรอกชื่อผู้แต่ง';
    if (!formData.isbn.trim()) newErrors.isbn = 'กรุณากรอก ISBN';
    if (!formData.year || isNaN(parseInt(formData.year))) newErrors.year = 'กรุณากรอกปีที่ถูกต้อง';
    if (!formData.price || isNaN(parseFloat(formData.price))) newErrors.price = 'กรุณากรอกราคาที่ถูกต้อง';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8080/api/v1/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          author: formData.author.trim(),
          isbn: formData.isbn.trim(),
          year: parseInt(formData.year),
          price: parseFloat(formData.price),
          category: formData.category || '',
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          discount: formData.discount ? parseInt(formData.discount) : 0,
          cover_image: formData.cover_image || '',
          rating: formData.rating ? parseFloat(formData.rating) : 0,
          reviews_count: formData.reviews_count ? parseInt(formData.reviews_count) : 0,
          is_new: formData.is_new,
          pages: formData.pages ? parseInt(formData.pages) : null,
          language: formData.language || '',
          publisher: formData.publisher || '',
          description: formData.description || ''
        })
      });

      if (!response.ok) throw new Error('Failed to add book');

      const data = await response.json();
      setSuccessMessage(`เพิ่มหนังสือ "${data.title}" สำเร็จ!`);
      setFormData({
        title: '', author: '', isbn: '', year: '', price: '',
        category: '', original_price: '', discount: '', cover_image: '',
        rating: '', reviews_count: '', is_new: false, pages: '',
        language: '', publisher: '', description: ''
      });

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrors({ submit: 'เกิดข้อผิดพลาด: ' + error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-viridian-600 to-green-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BookOpenIcon className="h-8 w-8" />
            <h1 className="text-2xl font-bold">BookStore - BackOffice</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg">
            <LogoutIcon className="h-5 w-5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6">เพิ่มหนังสือใหม่</h2>

          {successMessage && <div className="mb-6 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded-lg">{successMessage}</div>}
          {errors.submit && <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{errors.submit}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title, Author, ISBN, Year, Price */}
            {['title','author','isbn','year','price'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{field === 'title' ? 'ชื่อหนังสือ' : field === 'author' ? 'ชื่อผู้แต่ง' : field.toUpperCase()} <span className="text-red-500">*</span></label>
                <input type={field==='year' || field==='price' ? 'number' : 'text'} name={field} value={formData[field]} onChange={handleChange} className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors[field] ? 'border-red-500 focus:ring-red-500':'border-gray-300 focus:ring-viridian-500'}`} placeholder={`กรอก${field}`} />
                {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
              </div>
            ))}

            {/* Additional Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price</label>
              <input type="number" name="original_price" value={formData.original_price} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" step="0.01"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
              <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL</label>
              <input type="text" name="cover_image" value={formData.cover_image} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <input type="number" name="rating" value={formData.rating} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" step="0.1"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reviews Count</label>
                <input type="number" name="reviews_count" value={formData.reviews_count} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg"/>
              </div>
            </div>
            <div>
              <label className="inline-flex items-center">
                <input type="checkbox" name="is_new" checked={formData.is_new} onChange={handleChange} className="mr-2"/>
                <span>New Book</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pages</label>
              <input type="number" name="pages" value={formData.pages} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <input type="text" name="language" value={formData.language} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Publisher</label>
              <input type="text" name="publisher" value={formData.publisher} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" rows="4"/>
            </div>

            <div className="flex gap-4">
              <button
  type="submit"
  disabled={isSubmitting}
  className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white ${
    isSubmitting
      ? 'bg-gray-400'
      : 'bg-yellow-500 hover:bg-yellow-600'
  }`}
>
  {isSubmitting ? 'กำลังบันทึก...' : 'เพิ่มหนังสือ'}
</button>
             <button
  type="button"
  onClick={() => {
    navigate('/store-manager/dashboard');
    window.scrollTo(0, 0);
  }}
  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
>
  ยกเลิก
</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookPage;
