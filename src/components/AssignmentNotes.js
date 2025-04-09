import React, { useState } from 'react';

const AssignmentNotes = ({ notes, onSave }) => {
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    date: '',
    grade: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = () => {
    if (!newNote.title || !newNote.content) return;

    const noteData = {
      id: Date.now().toString(),
      ...newNote,
      date: newNote.date || new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };

    onSave([...notes, noteData]);
    setNewNote({ title: '', content: '', date: '', grade: '' });
    setIsAdding(false);
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setNewNote(note);
  };

  const handleUpdate = () => {
    const updatedNotes = notes.map(note =>
      note.id === editingId ? { ...note, ...newNote } : note
    );
    onSave(updatedNotes);
    setEditingId(null);
    setNewNote({ title: '', content: '', date: '', grade: '' });
  };

  const handleDelete = (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    onSave(updatedNotes);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Assignment Notes</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          style={styles.addButton}
        >
          {isAdding ? '- Cancel' : '+ Add Note'}
        </button>
      </div>

      {(isAdding || editingId) && (
        <div style={styles.noteForm}>
          <div style={styles.formRow}>
            <input
              type="text"
              placeholder="Assignment Title"
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              style={styles.input}
            />
            <input
              type="date"
              value={newNote.date}
              onChange={(e) => setNewNote(prev => ({ ...prev, date: e.target.value }))}
              style={styles.dateInput}
            />
            <input
              type="text"
              placeholder="Grade (optional)"
              value={newNote.grade}
              onChange={(e) => setNewNote(prev => ({ ...prev, grade: e.target.value }))}
              style={styles.gradeInput}
            />
          </div>
          <textarea
            placeholder="Note content..."
            value={newNote.content}
            onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
            style={styles.textarea}
          />
          <button
            onClick={editingId ? handleUpdate : handleSubmit}
            style={styles.submitButton}
          >
            {editingId ? 'Update Note' : 'Add Note'}
          </button>
        </div>
      )}

      <div style={styles.notesList}>
        {notes.sort((a, b) => new Date(b.date) - new Date(a.date)).map(note => (
          <div key={note.id} style={styles.noteCard}>
            <div style={styles.noteHeader}>
              <div style={styles.noteInfo}>
                <h4 style={styles.noteTitle}>{note.title}</h4>
                <span style={styles.noteDate}>
                  {new Date(note.date).toLocaleDateString()}
                </span>
                {note.grade && (
                  <span style={styles.noteGrade}>Grade: {note.grade}</span>
                )}
              </div>
              <div style={styles.noteActions}>
                <button
                  onClick={() => handleEdit(note)}
                  style={styles.editButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
            <p style={styles.noteContent}>{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#333',
  },
  addButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  noteForm: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  input: {
    flex: 2,
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  dateInput: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  gradeInput: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    marginBottom: '1rem',
    resize: 'vertical',
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  notesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  noteCard: {
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    border: '1px solid #eee',
  },
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  noteInfo: {
    flex: 1,
  },
  noteTitle: {
    margin: '0 0 0.25rem 0',
    fontSize: '1.1rem',
    color: '#333',
  },
  noteDate: {
    fontSize: '0.875rem',
    color: '#666',
    marginRight: '1rem',
  },
  noteGrade: {
    fontSize: '0.875rem',
    color: '#28a745',
    fontWeight: 'bold',
  },
  noteContent: {
    margin: 0,
    color: '#666',
    fontSize: '0.875rem',
    whiteSpace: 'pre-wrap',
  },
  noteActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },
};

export default AssignmentNotes; 