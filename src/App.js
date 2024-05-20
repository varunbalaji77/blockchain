import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css'; // Import CSS file for styling

const LibraryABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_uid",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      }
    ],
    "name": "addBook",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "uid",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      }
    ],
    "name": "BookBorrowed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "uid",
        "type": "uint256"
      }
    ],
    "name": "BookReturned",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_uid",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_borrower",
        "type": "address"
      }
    ],
    "name": "borrowBook",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_uid",
        "type": "uint256"
      }
    ],
    "name": "returnBook",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "bookCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "books",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "uid",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isAvailable",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBookCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const contractAddress = '0x5237b78c44e113cb77515e5c3d678b4d52ef98f4';

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [bookUid, setBookUid] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [availableBooks, setAvailableBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.enable();
          setWeb3(web3Instance);
          const contractInstance = new web3Instance.eth.Contract(LibraryABI, contractAddress);
          setContract(contractInstance);
          const accounts = await web3Instance.eth.getAccounts();
          setAccounts(accounts);
        } else {
          console.log('Please install MetaMask extension!');
        }
      } catch (error) {
        console.error('Error initializing Web3:', error);
      }
    };
    initWeb3();
  }, []);

  const fetchAvailableBooks = async () => {
    try {
      const count = await contract.methods.getBookCount().call();
      const available = [];
      const borrowed = [];
      for (let i = 1; i <= count; i++) {
        const book = await contract.methods.books(i).call();
        if (typeof book.uid !== 'undefined' && book.title !== '' && book.uid !== '0') {
          if (book.borrower === '0x0000000000000000000000000000000000000000') {
            available.push(book);
          } else {
            borrowed.push(book);
          }
        } else {
          console.error("Book", i, "has invalid properties");
        }
      }
      setAvailableBooks(available);
      setBorrowedBooks(borrowed);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchAvailableBooks();
    }
  }, [contract]);

  const addBook = async () => {
    try {
      await contract.methods.addBook(parseInt(bookUid), bookTitle).send({ from: accounts[0] });
      console.log('Book added successfully!');
      setTimeout(() => {
        fetchAvailableBooks();
      }, 1000);
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const borrowBook = async (uid) => {
    try {
      await contract.methods.borrowBook(uid, accounts[0]).send({ from: accounts[0] });
      console.log('Book borrowed successfully!');
      setTimeout(() => {
        fetchAvailableBooks();
      }, 1000);
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
  };

  const returnBook = async (uid) => {
    try {
      await contract.methods.returnBook(uid).send({ from: accounts[0] });
      console.log('Book returned successfully!');
      setTimeout(() => {
        fetchAvailableBooks();
      }, 1000);
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  return (
    <div className="App">
      <h1 className="app-title">Library Management</h1>
      <div className="add-book">
        <h2>Add Book</h2>
        <input
          type="text"
          placeholder="Enter UID"
          value={bookUid}
          onChange={(e) => setBookUid(e.target.value)}
          className="add-book__input"
        />
        <input
          type="text"
          placeholder="Enter Title"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          className="add-book__input"
        />
        <button onClick={addBook} className="add-book__button">
          Add Book
        </button>
      </div>
      <div className="book-list">
        <h2>Borrowed Books</h2>
        <table className="book-list__table">
          <thead>
            <tr>
              <th>Title</th>
              <th>UID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {borrowedBooks.map((book, index) => (
              <tr key={index}>
                <td>{book.title}</td>
                <td>{book.uid.toString()}</td>
                <td>
                  <button onClick={() => returnBook(book.uid)} className="book-list__button">
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="book-list">
        <h2>Books Available for Borrowing</h2>
        <table className="book-list__table">
          <thead>
            <tr>
              <th>Title</th>
              <th>UID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {availableBooks.map((book, index) => (
              <tr key={index}>
                <td>{book.title}</td>
                <td>{book.uid.toString()}</td>
                <td>
                  <button onClick={() => borrowBook(book.uid)} className="book-list__button">
                    Borrow
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
