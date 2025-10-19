package main

import (
	"database/sql"
	"fmt"

	"log"
	"os"
	"time"
	"strconv"
	"net/http"
	"io/ioutil"
    "path/filepath"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"github.com/gin-contrib/cors"
)

type ErrorResponse struct {
	Message string `json:"message"`
}

 type Book struct {
      ID            int       `json:"id"`
      Title         string    `json:"title"`
      Author        string    `json:"author"`
      ISBN          string    `json:"isbn"`
      Year          int       `json:"year"`
      Price         float64   `json:"price"`

      // ฟิลด์ใหม่
      Category      string    `json:"category"`
      OriginalPrice *float64  `json:"original_price,omitempty"`
      Discount      int       `json:"discount"`
      CoverImage    string    `json:"cover_image"`
      Rating        float64   `json:"rating"`
      ReviewsCount  int       `json:"reviews_count"`
      IsNew         bool      `json:"is_new"`
      Pages         *int      `json:"pages,omitempty"`
      Language      string    `json:"language"`
      Publisher     string    `json:"publisher"`
      Description   string    `json:"description"`

      CreatedAt     time.Time `json:"created_at"`
      UpdatedAt     time.Time `json:"updated_at"`
  }



func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

var db *sql.DB

func runSQLFile(filePath string) error {
    content, err := ioutil.ReadFile(filePath)
    if err != nil {
        return err
    }

    _, err = db.Exec(string(content))
    if err != nil {
        return err
    }
    return nil
}

func runMigrations() {
    files := []string{
        "migrations/001_create_books_table.sql",
        "migrations/002_add_book_fields_up.sql",
        "migrations/003_insert_sample_books.sql",
    }

    for _, file := range files {
        log.Println("Running migration:", filepath.Base(file))
        if err := runSQLFile(file); err != nil {
            log.Printf("Migration %s failed: %v\n", file, err)
        } else {
            log.Println("Migration successful:", filepath.Base(file))
        }
    }
}

func initDB() {
	var err error

    host := getEnv("DB_HOST", "localhost")
    name := getEnv("DB_NAME", "bookstore")
    user := getEnv("DB_USER", "bookstore_user")
    password := getEnv("DB_PASSWORD", "your_strong_password")
    port := getEnv("DB_PORT", "5432")

	conSt := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, name)
	//fmt.Println(conSt)
	db, err = sql.Open("postgres", conSt)
	if err != nil {
		log.Fatal("failed to open")
	}
	// กำหนดจำนวน Connection สูงสุด
	db.SetMaxOpenConns(25)

	// กำหนดจำนวน Idle connection สูงสุด
	db.SetMaxIdleConns(20)

	// กำหนดอายุของ Connection
	db.SetConnMaxLifetime(5 * time.Minute)
	err = db.Ping()
	if err != nil {
		log.Fatal("failed to connect to database")
	}
	log.Println("successfully connected to database")
	
}

// @Summary Get all books
// @Description Get all books
// @Tags Books
// @Produce  json
// @Success 200  {array}  Book
// @Failure 500  {object}  ErrorResponse
// @Router  /books [get]

func getAllBooks(c *gin.Context) {
	category := c.Query("category") // อ่านค่า ?category=fiction

	var rows *sql.Rows
	var err error

	// เลือก query ตามว่ามี category หรือไม่
	if category != "" {
		rows, err = db.Query(`
			SELECT id, title, author, isbn, year, price,
			       COALESCE(category, '') AS category,
			       COALESCE(original_price, 0) AS original_price,
			       discount,
			       COALESCE(cover_image, '') AS cover_image,
			       rating, reviews_count, is_new,
			       COALESCE(pages, 0) AS pages,
			       COALESCE(language, '') AS language,
			       COALESCE(publisher, '') AS publisher,
			       COALESCE(description, '') AS description,
			       created_at, updated_at
			FROM books
			WHERE category = $1
		`, category)
	} else {
		rows, err = db.Query(`
			SELECT id, title, author, isbn, year, price,
			       COALESCE(category, '') AS category,
			       COALESCE(original_price, 0) AS original_price,
			       discount,
			       COALESCE(cover_image, '') AS cover_image,
			       rating, reviews_count, is_new,
			       COALESCE(pages, 0) AS pages,
			       COALESCE(language, '') AS language,
			       COALESCE(publisher, '') AS publisher,
			       COALESCE(description, '') AS description,
			       created_at, updated_at
			FROM books
		`)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var books []Book
	for rows.Next() {
		var book Book
		err := rows.Scan(
			&book.ID,
			&book.Title,
			&book.Author,
			&book.ISBN,
			&book.Year,
			&book.Price,
			&book.Category,
			&book.OriginalPrice,
			&book.Discount,
			&book.CoverImage,
			&book.Rating,
			&book.ReviewsCount,
			&book.IsNew,
			&book.Pages,
			&book.Language,
			&book.Publisher,
			&book.Description,
			&book.CreatedAt,
			&book.UpdatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		books = append(books, book)
	}

	if books == nil {
		books = []Book{}
	}

	c.JSON(http.StatusOK, books)
}

// @Summary Get Book by Id
// @Description Get detail of book
// @Tags Books
// @Produce  json
// @Param   id   path      int     true  "Book ID"
// @Success 200 {object} Book
// @Failure 500  {object}  ErrorResponse
// @Router /books/{id} [get]
func getBook(c *gin.Context) {
	id := c.Param("id")
	var book Book

	err := db.QueryRow(`
		SELECT 
			id, title, author, isbn, year, price,
			COALESCE(category, '') AS category,
			COALESCE(original_price, 0) AS original_price,
			discount,
			COALESCE(cover_image, '') AS cover_image,
			rating, reviews_count, is_new,
			COALESCE(pages, 0) AS pages,
			COALESCE(language, '') AS language,
			COALESCE(publisher, '') AS publisher,
			COALESCE(description, '') AS description,
			created_at, updated_at
		FROM books
		WHERE id = $1
	`, id).Scan(
		&book.ID, &book.Title, &book.Author, &book.ISBN, &book.Year, &book.Price,
		&book.Category, &book.OriginalPrice, &book.Discount, &book.CoverImage,
		&book.Rating, &book.ReviewsCount, &book.IsNew, &book.Pages,
		&book.Language, &book.Publisher, &book.Description,
		&book.CreatedAt, &book.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "book not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, book)
}
// @Summary Create a new book
// @Description Add a new book to the database
// @Tags Books
// @Accept json
// @Produce json
// @Param book body Book true "Book details"
// @Success 201 {object} Book
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /books [post]
func createBook(c *gin.Context) {
	var newBook Book

	// อ่าน JSON body
	if err := c.ShouldBindJSON(&newBook); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ใช้ RETURNING เพื่อดึงค่าที่ database generate
	var id int
	var createdAt, updatedAt time.Time

	err := db.QueryRow(
		`INSERT INTO books (
			title, author, isbn, year, price,
			category, original_price, discount, cover_image,
			rating, reviews_count, is_new, pages, language,
			publisher, description
		) VALUES (
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
		) RETURNING id, created_at, updated_at`,
		newBook.Title,
		newBook.Author,
		newBook.ISBN,
		newBook.Year,
		newBook.Price,
		newBook.Category,
		newBook.OriginalPrice,
		newBook.Discount,
		newBook.CoverImage,
		newBook.Rating,
		newBook.ReviewsCount,
		newBook.IsNew,
		newBook.Pages,
		newBook.Language,
		newBook.Publisher,
		newBook.Description,
	).Scan(&id, &createdAt, &updatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	newBook.ID = id
	newBook.CreatedAt = createdAt
	newBook.UpdatedAt = updatedAt

	c.JSON(http.StatusCreated, newBook)
}

// @Summary Update an existing book
// @Description Update a book’s details using its ID
// @Tags Books
// @Accept json
// @Produce json
// @Param id path int true "Book ID"
// @Param book body Book true "Updated book details"
// @Success 200 {object} Book
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /books/{id} [put]
func updateBook(c *gin.Context) {
	id := c.Param("id")
	var updateBook Book

	// อ่าน JSON body
	if err := c.ShouldBindJSON(&updateBook); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var updatedAt time.Time
	err := db.QueryRow(
		`UPDATE books
		 SET title = $1,
		     author = $2,
		     isbn = $3,
		     year = $4,
		     price = $5,
		     category = $6,
		     original_price = $7,
		     discount = $8,
		     cover_image = $9,
		     rating = $10,
		     reviews_count = $11,
		     is_new = $12,
		     pages = $13,
		     language = $14,
		     publisher = $15,
		     description = $16
		 WHERE id = $17
		 RETURNING updated_at`,
		updateBook.Title,
		updateBook.Author,
		updateBook.ISBN,
		updateBook.Year,
		updateBook.Price,
		updateBook.Category,
		updateBook.OriginalPrice,
		updateBook.Discount,
		updateBook.CoverImage,
		updateBook.Rating,
		updateBook.ReviewsCount,
		updateBook.IsNew,
		updateBook.Pages,
		updateBook.Language,
		updateBook.Publisher,
		updateBook.Description,
		id,
	).Scan(&updatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "book not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	updateBook.ID, _ = strconv.Atoi(id) // แปลง id เป็น int
	updateBook.UpdatedAt = updatedAt

	c.JSON(http.StatusOK, updateBook)
}

// @Summary Delete a book
// @Description Remove a book from the database by ID
// @Tags Books
// @Produce json
// @Param id path int true "Book ID"
// @Success 200 {object} map[string]string
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /books/{id} [delete]
func deleteBook(c *gin.Context) {
	id := c.Param("id")

	result, err := db.Exec("DELETE FROM books WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "book not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "book deleted successfully"})
}

// @Summary Get all categories
// @Description Get distinct book categories
// @Tags Books
// @Produce json
// @Success 200 {array} string
// @Failure 500 {object} ErrorResponse
// @Router /categories [get]
func getAllCategories(c *gin.Context) {
	rows, err := db.Query("SELECT DISTINCT category FROM books ORDER BY category")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var categories []string
	for rows.Next() {
		var category string
		err := rows.Scan(&category)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		categories = append(categories, category)
	}

	c.JSON(http.StatusOK, categories)
}
// @Summary Search books by keyword
// @Description Search books by title or author
// @Tags Books
// @Produce json
// @Param q query string true "Search keyword"
// @Success 200 {array} Book
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /books/search [get]
func searchBooks(c *gin.Context) {
	keyword := c.Query("q")
	if keyword == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "keyword is required"})
		return
	}

	// ใช้ ILIKE สำหรับ PostgreSQL เพื่อค้นหาแบบไม่ case-sensitive
	query := `
		SELECT id, title, author, isbn, year, price,
		       category, original_price, discount, cover_image,
		       rating, reviews_count, is_new, pages,
		       language, publisher, description,
		       created_at, updated_at
		FROM books
		WHERE title ILIKE '%' || $1 || '%' 
		   OR author ILIKE '%' || $1 || '%'
	`

	rows, err := db.Query(query, keyword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var books []Book
	for rows.Next() {
		var book Book
		err := rows.Scan(
			&book.ID,
			&book.Title,
			&book.Author,
			&book.ISBN,
			&book.Year,
			&book.Price,
			&book.Category,
			&book.OriginalPrice,
			&book.Discount,
			&book.CoverImage,
			&book.Rating,
			&book.ReviewsCount,
			&book.IsNew,
			&book.Pages,
			&book.Language,
			&book.Publisher,
			&book.Description,
			&book.CreatedAt,
			&book.UpdatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		books = append(books, book)
	}

	c.JSON(http.StatusOK, books)
}
// @Summary Get featured books
// @Description Get featured or recommended books
// @Tags Books
// @Produce json
// @Success 200 {array} Book
// @Failure 500 {object} ErrorResponse
// @Router /books/featured [get]
func getFeaturedBooks(c *gin.Context) {
	query := `
		SELECT id, title, author, isbn, year, price,
		       category, original_price, discount, cover_image,
		       rating, reviews_count, is_new, pages,
		       language, publisher, description,
		       created_at, updated_at
		FROM books
		WHERE is_new = true OR rating >= 4.5
		ORDER BY rating DESC, created_at DESC
		LIMIT 10
	`

	rows, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var books []Book
	for rows.Next() {
		var book Book
		err := rows.Scan(
			&book.ID,
			&book.Title,
			&book.Author,
			&book.ISBN,
			&book.Year,
			&book.Price,
			&book.Category,
			&book.OriginalPrice,
			&book.Discount,
			&book.CoverImage,
			&book.Rating,
			&book.ReviewsCount,
			&book.IsNew,
			&book.Pages,
			&book.Language,
			&book.Publisher,
			&book.Description,
			&book.CreatedAt,
			&book.UpdatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		books = append(books, book)
	}

	c.JSON(http.StatusOK, books)
}
// @Summary Get new books
// @Description Get the latest books
// @Tags Books
// @Produce json
// @Success 200 {array} Book
// @Failure 500 {object} ErrorResponse
// @Router /books/new [get]
func getNewBooks(c *gin.Context) {
	query := `
		SELECT id, title, author, isbn, year, price,
		       category, original_price, discount, cover_image,
		       rating, reviews_count, is_new, pages,
		       language, publisher, description,
		       created_at, updated_at
		FROM books
		WHERE is_new = true
		ORDER BY created_at DESC
		LIMIT 10
	`

	rows, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var books []Book
	for rows.Next() {
		var book Book
		err := rows.Scan(
			&book.ID,
			&book.Title,
			&book.Author,
			&book.ISBN,
			&book.Year,
			&book.Price,
			&book.Category,
			&book.OriginalPrice,
			&book.Discount,
			&book.CoverImage,
			&book.Rating,
			&book.ReviewsCount,
			&book.IsNew,
			&book.Pages,
			&book.Language,
			&book.Publisher,
			&book.Description,
			&book.CreatedAt,
			&book.UpdatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		books = append(books, book)
	}

	c.JSON(http.StatusOK, books)
}
// @Summary Get discounted books
// @Description Get books with discount
// @Tags Books
// @Produce json
// @Success 200 {array} Book
// @Failure 500 {object} ErrorResponse
// @Router /books/discounted [get]
func getDiscountedBooks(c *gin.Context) {
	query := `
		SELECT id, title, author, isbn, year, price,
		       category, original_price, discount, cover_image,
		       rating, reviews_count, is_new, pages,
		       language, publisher, description,
		       created_at, updated_at
		FROM books
		WHERE discount > 0
		ORDER BY discount DESC, created_at DESC
		LIMIT 10
	`

	rows, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var books []Book
	for rows.Next() {
		var book Book
		err := rows.Scan(
			&book.ID,
			&book.Title,
			&book.Author,
			&book.ISBN,
			&book.Year,
			&book.Price,
			&book.Category,
			&book.OriginalPrice,
			&book.Discount,
			&book.CoverImage,
			&book.Rating,
			&book.ReviewsCount,
			&book.IsNew,
			&book.Pages,
			&book.Language,
			&book.Publisher,
			&book.Description,
			&book.CreatedAt,
			&book.UpdatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		books = append(books, book)
	}

	c.JSON(http.StatusOK, books)
}

// @title           Simple API Example
// @version         1.0
// @description     This is a simple example of using Gin with Swagger.
// @host            localhost:8080
// @BasePath        /api/v1
func main() {
	initDB()
	defer db.Close()
	r := gin.Default()
	r.Use(cors.Default())
	runMigrations()
	// Swagger endpoint
	r.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	r.GET("/health", func(c *gin.Context) {
		err := db.Ping()
		if err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"message": "unhealthy", "error": err})
			return
		}
		c.JSON(200, gin.H{"message": "healthy"})
	})

	api := r.Group("/api/v1")
	{
		api.GET("/books", getAllBooks)
		api.GET("/books/:id", getBook)
		api.POST("/books", createBook)
		api.PUT("/books/:id", updateBook)
		api.DELETE("/books/:id", deleteBook)
		api.GET("/categories", getAllCategories)
		api.GET("/books/search", searchBooks)
		api.GET("/books/featured", getFeaturedBooks)
		api.GET("/books/new", getNewBooks)
		api.GET("/books/discounted", getDiscountedBooks)
		
	}

	r.Run(":8080")
}
