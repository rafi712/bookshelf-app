let books = []
const RENDER_EVENT = 'render-books'
const STORAGE_KEY = 'bookshelf-app'
let searching = false
let searchQuery = ''

const checkBox = document.getElementById('inputBookIsComplete')

checkBox.addEventListener("click", () => {
  const spanText = document.querySelector('#bookSubmit span')
  
  if (checkBox.checked) {
    spanText.innerText = 'Selesai dibaca'
  } else {
    spanText.innerText = 'Belum selesai dibaca'
  }
})

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage')
    return false
  }
  return true
}

function generateId() {
  return +new Date()
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  }
}

function findBook(bookId) {
  return books.find(book => book.id === bookId) ?? null
}

function findBookIndex(bookId) {
  return books.findIndex(book => book.id === bookId)
}

function makeBook(bookObject) {
  const {id, title, author, year, isCompleted} = bookObject
  
  const bookItemContainer = document.createElement('article')
  bookItemContainer.classList.add('book_item')
  
  const textTitle = document.createElement('h3')
  textTitle.innerText = `${title} (${year})`
  
  const textAuthor = document.createElement('p')
  textAuthor.classList.add('text-author')
  textAuthor.innerText = author
  
  const actionContainer = document.createElement('div')
  actionContainer.classList.add('action')
  
  const greenButton = document.createElement('button')
  greenButton.classList.add('green')
  greenButton.innerText = isCompleted ? 'Belum selesai di Baca' : 'Selesai dibaca'
  greenButton.addEventListener("click", () => {
    isCompleted ? undoBookFromCompleted(id)  : addBookToCompleted(id)
  })
  
  const redButton = document.createElement('button')
  redButton.classList.add('red')
  redButton.innerText = 'Hapus buku'
  redButton.addEventListener("click", () => {
    removeBook(id)
  })
  
  actionContainer.append(greenButton, redButton)
  bookItemContainer.append(textTitle, textAuthor, actionContainer)
  
  return bookItemContainer
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook')
  const searchForm = document.getElementById('searchBook')

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault()
    searchQuery = ''
    searchForm.reset()
    addBook()
    submitForm.reset()
    document.querySelector('#bookSubmit span').innerText = 'Belum selesai dibaca'
  })
  
  if (isStorageExist()) {
    loadDataFromStorage()
  }
  
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault()
    // searching = true
    searchQuery = document.getElementById('searchBookTitle').value
    document.dispatchEvent(new Event(RENDER_EVENT))
  })
})

function addBook() {
  const textTitle = document.getElementById('inputBookTitle').value
  const textAuthor = document.getElementById('inputBookAuthor').value
  const year = document.getElementById('inputBookYear').value
  const isBookCompleted = document.getElementById('inputBookIsComplete').checked
  
  const generatedID = generateId()
  const bookObject = generateBookObject(generatedID, textTitle, textAuthor, year, isBookCompleted)
  books.push(bookObject)
  console.log(books)
  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookShelf = document.getElementById('incompleteBookshelfList')
  const completedBookShelf = document.getElementById('completeBookshelfList')

  uncompletedBookShelf.innerHTML = ''
  completedBookShelf.innerHTML = ''
  if (searchQuery) {
    const searchedBooks = books.filter(book => book.title.includes(searchQuery))
    
    for (const book of searchedBooks) {
      const bookElement = makeBook(book)
      if (book.isCompleted) {
        completedBookShelf.append(bookElement)
      } else {
        uncompletedBookShelf.append(bookElement)
      }
    }
    
  } else {
    for (const book of books) {
      const bookElement = makeBook(book)
      if (book.isCompleted) {
        completedBookShelf.append(bookElement)
      } else {
        uncompletedBookShelf.append(bookElement)
      }
    }
  }
})

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId)
  if (bookTarget == null) return

  bookTarget.isCompleted = true
  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId)

  if (bookTarget == null) return

  bookTarget.isCompleted = false
  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId)

  if (bookTarget === -1) return

  books.splice(bookTarget, 1)
  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books)
    localStorage.setItem(STORAGE_KEY, parsed)
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY)
  let data = JSON.parse(serializedData)
 
  if (data !== null) {
    for (const book of data) {
      books.push(book)
    }
  }
 
  document.dispatchEvent(new Event(RENDER_EVENT))
}