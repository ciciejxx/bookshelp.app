// Fungsi untuk menampilkan toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Array untuk menyimpan data buku
let books = [];

// Fungsi untuk mengecek apakah browser support Web Storage
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

// Fungsi untuk menyimpan data ke localStorage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// Fungsi untuk memuat data dari localStorage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    books = data;
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

// Fungsi untuk membuat objek buku
function createBookObject(title, author, year, isComplete) {
  return {
    id: +new Date(),
    title,
    author,
    year: parseInt(year),
    isComplete
  };
}

// Fungsi untuk menambahkan buku
function addBook() {
  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = document.getElementById('bookFormYear').value;
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const bookObject = createBookObject(title, author, year, isComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  showToast(`Buku "${title}" berhasil ditambahkan!`, 'success');
}

// Fungsi untuk mencari buku berdasarkan ID
function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

// Fungsi untuk mencari index buku berdasarkan ID
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

// Fungsi untuk menghapus buku
function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  const book = books[bookTarget];
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  showToast(`Buku "${book.title}" berhasil dihapus!`, 'error');
}

// Fungsi untuk memindahkan buku antar rak
function toggleBookComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = !bookTarget.isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  const status = bookTarget.isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
  showToast(`Buku "${bookTarget.title}" dipindahkan ke "${status}"`, 'info');
}

// Fungsi untuk mengedit buku
function editBook(bookId) {
  const book = findBook(bookId);
  if (book == null) return;

  // Isi form dengan data buku yang akan diedit
  document.getElementById('bookFormTitle').value = book.title;
  document.getElementById('bookFormAuthor').value = book.author;
  document.getElementById('bookFormYear').value = book.year;
  document.getElementById('bookFormIsComplete').checked = book.isComplete;

  // Hapus buku lama
  removeBook(bookId);

  // Scroll ke form
  document.getElementById('bookForm').scrollIntoView({ behavior: 'smooth' });
}

// Fungsi untuk membuat elemen buku
function makeBook(bookObject) {
  const bookItem = document.createElement('div');
  bookItem.setAttribute('data-bookid', bookObject.id);
  bookItem.setAttribute('data-testid', 'bookItem');
  bookItem.classList.add('fade-in'); // Tambahkan animasi fade-in

  const bookTitle = document.createElement('h3');
  bookTitle.setAttribute('data-testid', 'bookItemTitle');
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement('p');
  bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
  bookAuthor.innerText = `Penulis: ${bookObject.author}`;

  const bookYear = document.createElement('p');
  bookYear.setAttribute('data-testid', 'bookItemYear');
  bookYear.innerText = `Tahun: ${bookObject.year}`;

  const buttonContainer = document.createElement('div');

  const toggleButton = document.createElement('button');
  toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
  toggleButton.innerText = bookObject.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  toggleButton.addEventListener('click', function () {
    toggleBookComplete(bookObject.id);
  });

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.innerText = 'Hapus Buku';
  deleteButton.addEventListener('click', function () {
    if (confirm(`Apakah Anda yakin ingin menghapus buku "${bookObject.title}"?`)) {
      removeBook(bookObject.id);
    }
  });

  const editButton = document.createElement('button');
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.innerText = 'Edit Buku';
  editButton.addEventListener('click', function () {
    editBook(bookObject.id);
  });

  buttonContainer.append(toggleButton, deleteButton, editButton);
  bookItem.append(bookTitle, bookAuthor, bookYear, buttonContainer);

  return bookItem;
}

// Event listener untuk form submit
document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('bookForm');
  const searchForm = document.getElementById('searchBook');
  const checkboxIsComplete = document.getElementById('bookFormIsComplete');

  // Update teks tombol submit berdasarkan checkbox
  checkboxIsComplete.addEventListener('change', function () {
    const submitButton = document.getElementById('bookFormSubmit');
    const span = submitButton.querySelector('span');
    
    if (this.checked) {
      span.innerText = 'Selesai dibaca';
    } else {
      span.innerText = 'Belum selesai dibaca';
    }
  });

  submitForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const submitButton = document.getElementById('bookFormSubmit');
    const originalText = submitButton.innerHTML;
    
    // Show loading state
    submitButton.innerHTML = 'Menambahkan...';
    submitButton.disabled = true;
    
    // Simulate async operation (in real app, this might be an API call)
    setTimeout(() => {
      addBook();
      
      // Reset form setelah submit
      submitForm.reset();
      
      // Reset text tombol
      const span = document.getElementById('bookFormSubmit').querySelector('span');
      span.innerText = 'Belum selesai dibaca';
      
      // Reset button
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }, 500);
  });

  // Event listener untuk pencarian buku
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();
    const allBooks = document.querySelectorAll('[data-testid="bookItem"]');

    allBooks.forEach(book => {
      const title = book.querySelector('[data-testid="bookItemTitle"]').innerText.toLowerCase();
      
      if (title.includes(searchTitle)) {
        book.style.display = 'block';
      } else {
        book.style.display = 'none';
      }
    });
  });

  // Reset pencarian ketika input kosong
  document.getElementById('searchBookTitle').addEventListener('input', function () {
    if (this.value === '') {
      const allBooks = document.querySelectorAll('[data-testid="bookItem"]');
      allBooks.forEach(book => {
        book.style.display = 'block';
      });
    }
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// Event listener untuk render buku
document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  // Kosongkan list
  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    
    if (bookItem.isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  }
});

// Event listener untuk memberikan notifikasi ketika data tersimpan
document.addEventListener(SAVED_EVENT, function () {
  console.log('Data berhasil disimpan.');
});