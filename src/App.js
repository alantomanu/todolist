import './App.css';
import { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { addDoc, collection, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import Login from './Login';
import Signup from './signup'; // Ensure correct file name and case
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  const [toDos, setTodos] = useState([]);
  const [toDo, setTodo] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [isSignup, setIsSignup] = useState(false); // Initialize state for signup

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Fetch todos when currentUser changes
  useEffect(() => {
    const fetchTodos = async () => {
      if (currentUser) {
        const toDosCollectionRef = collection(db, "users", currentUser.uid, "todos");
        const data = await getDocs(toDosCollectionRef);
        setTodos(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      }
    };

    fetchTodos();
  }, [currentUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTodo = async () => {
    if (toDo.trim() !== '' && currentUser) {
      const newTodo = {
        text: toDo,
        status: false,
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completedAt: null,
      };

      const toDosCollectionRef = collection(db, "users", currentUser.uid, "todos");
      const docRef = await addDoc(toDosCollectionRef, newTodo);
      setTodos([...toDos, { ...newTodo, id: docRef.id }]);
      setTodo('');
    }
  };

  const updateTodoStatus = async (id, status) => {
    if (currentUser) {
      const todoDoc = doc(db, "users", currentUser.uid, "todos", id);
      const updatedFields = {
        status: status,
        completedAt: status ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
      };

      await updateDoc(todoDoc, updatedFields);

      setTodos(toDos.map((obj) => {
        if (obj.id === id) {
          return { ...obj, ...updatedFields };
        }
        return obj;
      }));
    }
  };

  const removeTodo = async (id) => {
    if (currentUser) {
      const todoDoc = doc(db, "users", currentUser.uid, "todos", id);
      await deleteDoc(todoDoc);
      setTodos(toDos.filter((todo) => todo.id !== id));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!currentUser) {
    return (
      <div className="auth-container">
        {isSignup ? (
          <>
            <Signup setUser={setCurrentUser} setIsSignup={setIsSignup} />
            <p>Already have an account? <button onClick={() => setIsSignup(false)}>Login</button></p>
          </>
        ) : (
          <>
            <Login setUser={setCurrentUser} setIsSignup={setIsSignup} />
            <p>Don't have an account? <button onClick={() => setIsSignup(true)}>Sign Up</button></p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <div className="mainHeading">
        <h1>ToDo List</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      <div className="subHeading">
        <br />
        <h2>Whoop, it's {new Date().toDateString()} 🌝 ☕</h2>
        <h3 className="space">Current Time: {currentTime}</h3>
      </div>
      <div className="input">
        <input
          value={toDo}
          onChange={(e) => setTodo(e.target.value)}
          type="text"
          placeholder="🖊️ Add item..."
        />
        <i
          onClick={addTodo}
          className="fas fa-plus"
        ></i>
      </div>
      <div className="todos-container">
      <div className="todos-section">
  <h3>In Progress</h3>
  {toDos.filter((obj) => !obj.status).length === 0 ? (
    <h3 className="nil-text">nil</h3>
  ) : (
    toDos
      .filter((obj) => !obj.status)
      .map((obj) => (
        <div className="todo" key={obj.id}>
          <div className="left">
            <input
              onChange={(e) => updateTodoStatus(obj.id, e.target.checked)}
              checked={obj.status}
              type="checkbox"
              className="checkbox"
            />
            <p>{obj.text}</p>
          </div>
          <div >
            <div className="timestamps">
              <small>Added at: {obj.addedAt}</small>
            </div>
          </div>
          <div className="right">
            <i onClick={() => removeTodo(obj.id)} className="fas fa-times remove"></i>
          </div>
        </div>
      ))
  )}
</div>

<div className="todos-section">
  <h3>Completed</h3>
  {toDos.filter((obj) => obj.status).length === 0 ? (
    <h3 className="nil-text">nil</h3>
  ) : (
    toDos
      .filter((obj) => obj.status)
      .map((obj) => (
        <div className="todo" key={obj.id}>
          <div className="left">
            <input
              onChange={(e) => updateTodoStatus(obj.id, e.target.checked)}
              checked={obj.status}
              type="checkbox"
              className="checkbox"
            />
            <p>{obj.text}</p>
          </div>
          <div className="timestamps">
            <small>Added at: {obj.addedAt}  |  </small>
            {obj.status && <small>Completed at: {obj.completedAt}</small>}
          </div>
          <div className="right">
            <i onClick={() => removeTodo(obj.id)} className="fas fa-times remove"></i>
          </div>
        </div>
      ))
  )}
</div>

      </div>
      <div className="tasks-table">
        <h3>All Tasks</h3>
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Added At</th>
              <th>Completed At</th>
              
            </tr>
          </thead>
          <tbody>
            {toDos.map((obj) => (
              <tr key={obj.id}>
                <td>{obj.text}</td>
                <td>{obj.status ? 'Completed' : 'In Progress'}</td>
                <td>{obj.addedAt}</td>
                <td>{obj.status ? obj.completedAt : 'N/A'}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
