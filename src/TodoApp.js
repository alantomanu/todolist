import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';

function TodoApp() {
  const [toDos, setTodos] = useState([]);
  const [toDo, setTodo] = useState('');

  // Load to-dos from Firestore when the component mounts
  useEffect(() => {
    const fetchTodos = async () => {
      const q = query(collection(db, 'todos'));
      const querySnapshot = await getDocs(q);
      const todos = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setTodos(todos);
    };

    fetchTodos();
  }, []);

  // Function to add a new task
  const addTodo = async () => {
    const docRef = await addDoc(collection(db, 'todos'), {
      text: toDo,
      status: false,
      addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setTodos([...toDos, { id: docRef.id, text: toDo, status: false, addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setTodo('');
  };

  // Function to remove a task
  const removeTodo = async (id) => {
    await deleteDoc(doc(db, 'todos', id));
    setTodos(toDos.filter((todo) => todo.id !== id));
  };

  // Function to update a task status
  const updateTodoStatus = async (id, status) => {
    const todoRef = doc(db, 'todos', id);
    await updateDoc(todoRef, { status });
    setTodos(toDos.map(todo => (todo.id === id ? { ...todo, status } : todo)));
  };

  return (
    <div className="todo-app">
      <div className="input">
        <input
          value={toDo}
          onChange={(e) => setTodo(e.target.value)}
          type="text"
          placeholder="🖊️ Add item..."
        />
        <i onClick={addTodo} className="fas fa-plus"></i>
      </div>
      <div className="todos-container">
        {toDos.map((obj) => (
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
              <small>Added at: {obj.addedAt}</small>
              {obj.status && <small>Completed at: {obj.completedAt}</small>}
            </div>
            <div className="right">
              <i onClick={() => removeTodo(obj.id)} className="fas fa-times remove"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TodoApp;
