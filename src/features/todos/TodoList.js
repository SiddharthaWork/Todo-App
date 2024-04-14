import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getTodos, addTodo, updateTodo, deleteTodo } from "../../api/todosApi";
import './styles.css';
import { MdDelete } from "react-icons/md";

const TodoList = () => {
    const [newTodo, setNewTodo] = useState('');
    const [editTodoId, setEditTodoId] = useState(null);
    const [editedTodoTitle, setEditedTodoTitle] = useState('');
    const queryClient = useQueryClient();

    const {
        isLoading,
        isError,
        error,
        data: todos,
    } = useQuery('todos', getTodos, {
        select: data => data.sort((a, b) => b.id - a.id)
    });

    const addTodoMutation = useMutation(addTodo, {
        onSuccess: () => {
            queryClient.invalidateQueries("todos");
        }
    });

    const updateTodoMutation = useMutation(updateTodo, {
        onSuccess: () => {
            //yele chai inviadates cache and refetch
            queryClient.invalidateQueries("todos");
            setEditTodoId(null); // Clear the edit state after successful update
        }
    });

    const deleteTodoMutation = useMutation(deleteTodo, {
        onSuccess: () => {
            queryClient.invalidateQueries("todos");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addTodoMutation.mutate({ userId: 1, title: newTodo, completed: false });
        setNewTodo('');
    }

    const handleEdit = (todoId, todoTitle) => {
        setEditTodoId(todoId);
        setEditedTodoTitle(todoTitle);
    }

    const handleUpdate = (todoId) => {
        updateTodoMutation.mutate({ id: todoId, title: editedTodoTitle });
    }

    const newItemSection = (
        <form onSubmit={handleSubmit}>
            <label htmlFor="new-todo">Enter a new todo list</label>
            <div className="new-todo">
                <input type="text"
                    id="new-todo"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Enter new todo"
                />
            </div>
            <button >Add</button>
        </form>
    )

    let content;
    if (isLoading) {
        content = <p>Loading...</p>;
    } else if (isError) {
        content = <p>{error.message}</p>;
    } else {
        content = todos.map((todo) => {
            return (
                <article key={todo.id}>
                    <div className="todo">
                        {editTodoId === todo.id ? (
                            <>
                                <input type="text" value={editedTodoTitle} onChange={(e) => setEditedTodoTitle(e.target.value)} />
                                <div style={{paddingRight:'10px',paddingInlineStart:'20px'}}>
                                <button onClick={() => handleUpdate(todo.id)}  style={{
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        padding: '10px 5px', // Increased padding for larger size
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '16px',
        transition: 'background-color 0.3s ease',
    }}>Save</button>
    </div>
                            </>
                        ) : (
                            <>
                                <input type="checkbox"
                                    checked={todo.completed}
                                    id={todo.id}
                                    onChange={() => updateTodoMutation.mutate({ ...todo, completed: !todo.completed })}
                                />
                                <label htmlFor={todo.id}>{todo.title}</label>
                                {/* <button className="edit" onClick={() => handleEdit(todo.id, todo.title)}>Edit</button> */}
                                <div style={{paddingRight:'10px',paddingInlineStart:'20px'}}>
                                <button 
    className="edit" 
    onClick={() => handleEdit(todo.id, todo.title)}
    style={{
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        padding: '10px 5px', // Increased padding for larger size
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '16px',
        transition: 'background-color 0.3s ease',
    }}
>
    Edit
</button>
</div>
                            </>
                        )}
                    </div>
                    <button className="trash" onClick={() => deleteTodoMutation.mutate({ id: todo.id })}><MdDelete /></button>
                </article>
            )
        });
    }

    return (
        <main>
            <h1>TodoList</h1>
            {newItemSection}
            {content}
        </main>
    )
}

export default TodoList;
