/* NOTES (notes.html + js/notes.js): card grid, Add/Edit/Delete modal,
   live search from the topbar search box. */

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { addNote, deleteNote, selectNotes, updateNote } from "../store/notesSlice";
import { useApp } from "../layouts/AppLayout";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/usePageSetup";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NoteModal({ note, onClose, onSave, onDelete }) {
  const isEdit = Boolean(note);
  const [title, setTitle] = useState(note ? note.title : "");
  const [content, setContent] = useState(note ? note.content : "");
  const titleRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => titleRef.current?.focus(), 50);
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); document.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <div className="modal-backdrop" ref={backdropRef} onClick={e => { if (e.target === backdropRef.current) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="noteModalTitle">
        <div className="modal-head">
          <h3 id="noteModalTitle">{isEdit ? "Edit Note" : "Add Note"}</h3>
          <button className="icon-btn-ghost" style={{ background: "var(--surface-alt)", color: "var(--text-secondary)" }} onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
        <form noValidate onSubmit={e => { e.preventDefault(); onSave({ title: title.trim(), content: content.trim() }); }}>
          <div className="modal-field">
            <label htmlFor="noteTitle">Title</label>
            <input type="text" id="noteTitle" ref={titleRef} className="auth-input" placeholder="e.g. Office hours, study group ideas…" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="modal-field">
            <label htmlFor="noteContent">Note</label>
            <textarea id="noteContent" className="auth-input" rows="6" placeholder="Write anything…" value={content} onChange={e => setContent(e.target.value)}></textarea>
          </div>
          <div className="modal-actions">
            {isEdit && <button type="button" className="btn btn-outline" onClick={onDelete}>Delete note</button>}
            <button type="submit" className="btn btn-primary">{isEdit ? "Save changes" : "Add note"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Notes() {
  useDocumentTitle("Notes — Cadence");
  const { search } = useApp();
  const dispatch = useDispatch();
  const notes = useSelector(selectNotes);
  const showToast = useToast();
  const [modal, setModal] = useState(null); // { note } | null
  const closeModal = useCallback(() => setModal(null), []);

  const q = search.trim().toLowerCase();
  const visible = q ? notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) : notes;

  function confirmDelete(noteId) {
    if (!window.confirm("Delete this note? This can't be undone.")) return;
    dispatch(deleteNote(noteId));
    showToast("Note deleted.");
  }

  function handleSave(payload) {
    if (modal.note) {
      dispatch(updateNote(modal.note.id, payload));
      showToast("Note updated.");
    } else {
      dispatch(addNote(payload));
      showToast("Note added.");
    }
    closeModal();
  }

  return (
    <>
      <div className="task-toolbar">
        <h1 className="dashboard-title" style={{ marginBottom: 0 }}>Notes</h1>
        <button className="btn btn-primary" onClick={() => setModal({ note: null })}>
          <Plus /> Add note
        </button>
      </div>

      <div className="notes-grid">
        {visible.length === 0 ? (
          <p className="empty-state" style={{ gridColumn: "1 / -1" }}>
            {search ? "No notes match your search." : "No notes yet — add your first one above."}
          </p>
        ) : visible.map(note => (
          <article className="note-card" key={note.id} onClick={() => setModal({ note })}>
            <div className="note-card-actions">
              <button type="button" aria-label="Edit note" onClick={e => { e.stopPropagation(); setModal({ note }); }}><Pencil width={13} height={13} /></button>
              <button type="button" className="delete-btn" aria-label="Delete note" onClick={e => { e.stopPropagation(); confirmDelete(note.id); }}><Trash2 width={13} height={13} /></button>
            </div>
            <h4>{note.title}</h4>
            <p>{note.content ? note.content : <em style={{ color: "var(--text-muted)" }}>No content</em>}</p>
            <p className="note-card-date">Updated {formatDate(note.updatedAt)}</p>
          </article>
        ))}
      </div>

      {modal && (
        <NoteModal
          note={modal.note}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={() => { confirmDelete(modal.note.id); closeModal(); }}
        />
      )}
    </>
  );
}
