import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

/* ── helpers ── */
function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}
function fmtShort(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}
function lateLabel(submittedAt, dueDate) {
  if (!dueDate || !submittedAt) return null;
  const diff = new Date(submittedAt) - new Date(dueDate);
  if (diff <= 0) return null;
  const days  = Math.floor(diff / 86400000);
  const years = Math.floor(days / 365);
  const rem   = days % 365;
  const parts = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (rem  > 0)  parts.push(`${rem} day${rem > 1 ? 's' : ''}`);
  return `Assignment was submitted ${parts.join(' ')} late`;
}

/* ── shared StatusRow ── */
function StatusRow({ label, value, highlight }) {
  return (
    <tr style={{ background: highlight ? '#fce8e8' : 'transparent' }}>
      <td style={{
        padding: '10px 16px', fontWeight: 700, fontSize: '13px', color: '#333',
        width: '180px', borderBottom: '1px solid #dee2e6', verticalAlign: 'top',
        background: '#f8f8f8',
      }}>{label}</td>
      <td style={{
        padding: '10px 16px', fontSize: '13px', color: '#333',
        borderBottom: '1px solid #dee2e6',
      }}>{value}</td>
    </tr>
  );
}

/* ════════════════════════════════════════════════
   FACULTY VIEW
   ════════════════════════════════════════════════ */
function FacultyView({ assignment, onSaved }) {
  const [editOpen,    setEditOpen]    = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [gradingId,   setGradingId]   = useState(null);   // submission._id being graded
  const [gradeInput,  setGradeInput]  = useState('');
  const [gradeError,  setGradeError]  = useState('');
  const [saveError,   setSaveError]   = useState('');
  const [saving,      setSaving]      = useState(false);

  /* form fields for editing the assignment */
  const [title,       setTitle]       = useState(assignment.title);
  const [description, setDescription] = useState(assignment.description || '');
  const [dueDate,     setDueDate]     = useState(
    assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : ''
  );
  const [maxScore,    setMaxScore]    = useState(assignment.maxScore ?? 100);

  /* load all submissions */
  useEffect(() => {
    api.get(`/submissions/assignment/${assignment._id}/all`)
      .then(r => setSubmissions(r.data))
      .catch(console.error)
      .finally(() => setLoadingSubs(false));
  }, [assignment._id]);

  /* save assignment edits */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      const { data } = await api.put(`/assignments/${assignment._id}`, {
        title, description, dueDate: dueDate || null, maxScore: Number(maxScore),
      });
      onSaved(data);
      setEditOpen(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  /* grade a submission */
  const handleGrade = async (subId) => {
    setGradeError('');
    const g = Number(gradeInput);
    if (isNaN(g) || g < 0 || g > assignment.maxScore) {
      setGradeError(`Enter a number between 0 and ${assignment.maxScore}`);
      return;
    }
    try {
      const { data } = await api.patch(`/submissions/${subId}/grade`, { grade: g });
      setSubmissions(prev => prev.map(s => s._id === subId ? { ...s, grade: data.grade, gradedAt: data.gradedAt } : s));
      setGradingId(null);
      setGradeInput('');
    } catch (err) {
      setGradeError(err.response?.data?.message || 'Grading failed.');
    }
  };

  const submitted  = submissions.length;
  const graded     = submissions.filter(s => s.grade != null).length;

  return (
    <>
      {/* ── Assignment detail + Edit button ── */}
      <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: '4px',
        padding: '24px 28px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ff6600', margin: '0 0 10px' }}>
              {assignment.title}
            </h1>
            {assignment.description && (
              <p style={{ fontSize: '13px', color: '#555', margin: 0, lineHeight: 1.7 }}>
                {assignment.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setEditOpen(o => !o)}
            style={{ background: '#ff6600', color: '#fff', border: 'none', borderRadius: '3px',
              padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
            {editOpen ? 'Cancel' : '✏ Edit Assignment'}
          </button>
        </div>

        {/* inline edit form */}
        {editOpen && (
          <form onSubmit={handleSave} style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#333' }}>Edit Assignment</h3>
            {saveError && (
              <div style={{ background: '#fdf0f0', border: '1px solid #f5c0c0', color: '#c0392b',
                padding: '8px 12px', borderRadius: '3px', fontSize: '13px' }}>⚠ {saveError}</div>
            )}
            <div>
              <label style={labelSt}>Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                style={{ ...inputSt, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <label style={labelSt}>Due Date</label>
                <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputSt} />
              </div>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <label style={labelSt}>Max Score</label>
                <input type="number" min={1} value={maxScore} onChange={e => setMaxScore(e.target.value)} required style={inputSt} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={saving}
                style={{ background: '#ff6600', color: '#fff', border: 'none', borderRadius: '3px',
                  padding: '8px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button type="button" onClick={() => setEditOpen(false)}
                style={{ background: '#fff', border: '1px solid #aaa', borderRadius: '3px',
                  padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Summary row ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { label: 'Submissions', value: submitted, color: '#1e4f8a' },
          { label: 'Graded',      value: graded,    color: '#49a52b' },
          { label: 'Pending',     value: submitted - graded, color: '#e07b00' },
          { label: 'Max Score',   value: assignment.maxScore, color: '#7b2d8e' },
          { label: 'Due',         value: assignment.dueDate ? fmtShort(assignment.dueDate) : '—', color: '#c0392b' },
        ].map(card => (
          <div key={card.label} style={{ flex: 1, minWidth: '110px', background: '#fff',
            border: `2px solid ${card.color}20`, borderLeft: `4px solid ${card.color}`,
            borderRadius: '4px', padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* ── Submissions table ── */}
      <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: '4px',
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#ff6600' }}>
            Student Submissions
          </h2>
          <span style={{ fontSize: '12px', color: '#888' }}>
            {submitted} submitted · {graded} graded
          </span>
        </div>

        {loadingSubs ? (
          <p style={{ padding: '20px', color: '#888', fontSize: '13px' }}>Loading submissions…</p>
        ) : submissions.length === 0 ? (
          <p style={{ padding: '20px', color: '#888', fontSize: '13px' }}>No submissions yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8f8f8' }}>
                  {['Student', 'Student ID', 'Submitted At', 'Files', 'Comments', 'Grade', 'Action'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700,
                      color: '#555', borderBottom: '2px solid #dee2e6', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => {
                  const isLate = sub.updatedAt && assignment.dueDate &&
                    new Date(sub.updatedAt) > new Date(assignment.dueDate);
                  return (
                    <tr key={sub._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa',
                      borderBottom: '1px solid #f0f0f0' }}>
                      {/* student */}
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#333' }}>
                        {sub.student?.name || '—'}
                        <div style={{ fontSize: '11px', color: '#888', fontWeight: 400 }}>
                          @{sub.student?.username}
                        </div>
                      </td>
                      {/* student id */}
                      <td style={{ padding: '10px 14px', color: '#555' }}>
                        {sub.student?.studentId || '—'}
                      </td>
                      {/* submitted at */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{ color: isLate ? '#c0392b' : '#49a52b', fontWeight: 600 }}>
                          {isLate ? '⚠ Late' : '✓ On time'}
                        </span>
                        <div style={{ fontSize: '11px', color: '#888' }}>{fmtShort(sub.updatedAt)}</div>
                      </td>
                      {/* files */}
                      <td style={{ padding: '10px 14px' }}>
                        {sub.files?.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {sub.files.map((f, fi) => (
                              <button key={fi}
                                onClick={() => {
                                  const a = document.createElement('a');
                                  a.href = `data:${f.mimeType};base64,${f.data}`;
                                  a.download = f.originalName;
                                  a.click();
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer',
                                  color: '#1177d1', fontSize: '12px', padding: 0, textAlign: 'left',
                                  textDecoration: 'underline' }}>
                                📄 {f.originalName}
                              </button>
                            ))}
                          </div>
                        ) : <span style={{ color: '#aaa' }}>—</span>}
                      </td>
                      {/* comments */}
                      <td style={{ padding: '10px 14px', color: '#555', maxWidth: '180px' }}>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {sub.comments || <span style={{ color: '#aaa' }}>—</span>}
                        </span>
                      </td>
                      {/* grade */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        {sub.grade != null ? (
                          <span style={{ fontWeight: 700, color: '#49a52b' }}>
                            {sub.grade} / {assignment.maxScore}
                          </span>
                        ) : (
                          <span style={{ color: '#aaa', fontSize: '12px' }}>Not graded</span>
                        )}
                      </td>
                      {/* action */}
                      <td style={{ padding: '10px 14px' }}>
                        {gradingId === sub._id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '140px' }}>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              <input
                                type="number" min={0} max={assignment.maxScore}
                                value={gradeInput}
                                onChange={e => { setGradeInput(e.target.value); setGradeError(''); }}
                                placeholder={`0–${assignment.maxScore}`}
                                style={{ width: '70px', border: '1px solid #ccc', borderRadius: '3px',
                                  padding: '4px 6px', fontSize: '13px' }}
                              />
                              <button onClick={() => handleGrade(sub._id)}
                                style={{ background: '#49a52b', color: '#fff', border: 'none',
                                  borderRadius: '3px', padding: '5px 10px', fontSize: '12px',
                                  cursor: 'pointer', fontWeight: 600 }}>
                                Save
                              </button>
                              <button onClick={() => { setGradingId(null); setGradeInput(''); setGradeError(''); }}
                                style={{ background: '#fff', border: '1px solid #aaa', borderRadius: '3px',
                                  padding: '5px 8px', fontSize: '12px', cursor: 'pointer' }}>
                                ✕
                              </button>
                            </div>
                            {gradeError && (
                              <span style={{ fontSize: '11px', color: '#c0392b' }}>{gradeError}</span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => { setGradingId(sub._id); setGradeInput(sub.grade ?? ''); setGradeError(''); }}
                            style={{ background: '#fff', border: '1px solid #ff6600', color: '#ff6600',
                              borderRadius: '3px', padding: '5px 12px', fontSize: '12px',
                              cursor: 'pointer', fontWeight: 600 }}>
                            {sub.grade != null ? '✏ Re-grade' : '✏ Grade'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════
   STUDENT VIEW  (unchanged behaviour)
   ════════════════════════════════════════════════ */
function StudentView({ assignment, course }) {
  const [submission,    setSubmission]    = useState(null);
  const [loadingSub,    setLoadingSub]    = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [removing,      setRemoving]      = useState(false);
  const [editMode,      setEditMode]      = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [comments,      setComments]      = useState('');
  const [error,         setError]         = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get(`/submissions/assignment/${assignment._id}/me`)
      .then(r => { setSubmission(r.data); if (r.data) setComments(r.data.comments || ''); })
      .catch(() => {})
      .finally(() => setLoadingSub(false));
  }, [assignment._id]);

  const readFilesAsBase64 = (files) =>
    Promise.all(Array.from(files).map(f =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve({ originalName: f.name, mimeType: f.type || 'application/octet-stream', size: f.size, data: reader.result.split(',')[1] });
        reader.onerror = reject;
        reader.readAsDataURL(f);
      })
    ));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedFiles.length) { setError('Please select at least one file.'); return; }
    setSubmitting(true);
    try {
      const files = await readFilesAsBase64(selectedFiles);
      const res   = await api.post('/submissions', { assignmentId: assignment._id, files, comments });
      setSubmission(res.data);
      setEditMode(false);
      setSelectedFiles([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!submission?._id) return;
    if (!window.confirm('Remove your submission? This cannot be undone.')) return;
    setRemoving(true);
    try {
      await api.delete(`/submissions/${submission._id}`);
      setSubmission(null); setEditMode(false); setSelectedFiles([]); setComments('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove submission.');
    } finally { setRemoving(false); }
  };

  const handleDownload = (file) => {
    const a = document.createElement('a');
    a.href = `data:${file.mimeType};base64,${file.data}`;
    a.download = file.originalName;
    a.click();
  };

  if (loadingSub) return <p style={{ padding: '20px 0', color: '#888', fontSize: '13px' }}>Loading…</p>;

  const submitted = !!submission;
  const lateMsg   = submitted ? lateLabel(submission.updatedAt, assignment.dueDate) : null;
  const isGraded  = submission?.grade != null;

  return (
    <>
      {/* Assignment title + description */}
      <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: '4px', padding: '24px 28px', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ff6600', margin: '0 0 10px' }}>{assignment.title}</h1>
        {assignment.description && (
          <p style={{ fontSize: '13px', color: '#555', margin: 0, lineHeight: 1.7 }}>{assignment.description}</p>
        )}
      </div>

      {/* Submission status table */}
      <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #dee2e6' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#ff6600' }}>Submission status</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <StatusRow label="Submission status" value={submitted ? 'Submitted for grading' : 'No attempt'} />
            <StatusRow label="Grading status" value={isGraded ? `Graded: ${submission.grade} / ${assignment.maxScore}` : 'Not graded'} />
            <StatusRow label="Due date" value={fmt(assignment.dueDate)} />
            {lateMsg && <StatusRow label="Time remaining" value={lateMsg} highlight />}
            {!lateMsg && assignment.dueDate && !submitted && (
              <StatusRow
                label="Time remaining"
                value={new Date(assignment.dueDate) > new Date()
                  ? `${Math.ceil((new Date(assignment.dueDate) - new Date()) / 86400000)} days left`
                  : 'Past due'}
                highlight={new Date(assignment.dueDate) < new Date()}
              />
            )}
            {submitted && <StatusRow label="Last modified" value={fmtShort(submission.updatedAt)} />}
            <StatusRow
              label="File submissions"
              value={
                submitted && submission.files?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {submission.files.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#c0392b', fontSize: '16px' }}>📄</span>
                        <button onClick={() => handleDownload(f)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer',
                            color: '#1177d1', fontSize: '13px', padding: 0, textDecoration: 'underline' }}>
                          {f.originalName}
                        </button>
                        <span style={{ fontSize: '12px', color: '#888' }}>{fmtShort(submission.updatedAt)}</span>
                      </div>
                    ))}
                  </div>
                ) : <span style={{ color: '#888', fontSize: '13px' }}>No files submitted</span>
              }
            />
            <StatusRow
              label="Submission comments"
              value={<span style={{ color: '#ff6600', fontSize: '13px', cursor: 'pointer' }}>▶ Comments ({submission?.comments ? 1 : 0})</span>}
            />
          </tbody>
        </table>
      </div>

      {/* Upload form */}
      {(editMode || !submitted) && (
        <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: '4px', padding: '24px 28px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#333', marginBottom: '16px' }}>
            {submitted ? 'Edit submission' : 'Add submission'}
          </h2>
          {error && (
            <div style={{ background: '#fdf0f0', border: '1px solid #f5c0c0', color: '#c0392b',
              padding: '8px 12px', borderRadius: '3px', fontSize: '13px', marginBottom: '14px' }}>
              ⚠ {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed #ccc', borderRadius: '4px', padding: '32px',
                textAlign: 'center', cursor: 'pointer', marginBottom: '14px',
                background: selectedFiles.length ? '#f0f8f0' : '#fafafa', transition: 'background .2s' }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); setSelectedFiles(Array.from(e.dataTransfer.files)); }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
              <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                {selectedFiles.length
                  ? `${selectedFiles.length} file(s) selected: ${Array.from(selectedFiles).map(f => f.name).join(', ')}`
                  : 'Click or drag & drop files here'}
              </p>
              <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }}
                onChange={e => setSelectedFiles(Array.from(e.target.files))} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                Submission comments (optional)
              </label>
              <textarea value={comments} onChange={e => setComments(e.target.value)} rows={3}
                style={{ width: '100%', border: '1px solid #ccc', borderRadius: '3px', padding: '8px 10px',
                  fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                placeholder="Add a comment…" />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={submitting}
                style={{ background: '#fff', border: '1px solid #aaa', borderRadius: '3px',
                  padding: '7px 18px', fontSize: '13px', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Saving…' : 'Save changes'}
              </button>
              <button type="button" onClick={() => { setEditMode(false); setSelectedFiles([]); setError(''); }}
                style={{ background: '#fff', border: '1px solid #aaa', borderRadius: '3px',
                  padding: '7px 18px', fontSize: '13px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action buttons */}
      {submitted && !editMode && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px 0' }}>
          <button onClick={() => { setEditMode(true); setSelectedFiles([]); setError(''); }}
            style={{ background: '#fff', border: '1px solid #aaa', borderRadius: '3px',
              padding: '7px 20px', fontSize: '13px', cursor: 'pointer' }}>
            Edit submission
          </button>
          <button onClick={handleRemove} disabled={removing}
            style={{ background: '#fff', border: '1px solid #aaa', borderRadius: '3px',
              padding: '7px 20px', fontSize: '13px', cursor: 'pointer', opacity: removing ? 0.7 : 1 }}>
            {removing ? 'Removing…' : 'Remove submission'}
          </button>
        </div>
      )}
      {!submitted && !editMode && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
          <button onClick={() => setEditMode(true)}
            style={{ background: '#ff6600', color: '#fff', border: 'none', borderRadius: '3px',
              padding: '9px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Add submission
          </button>
        </div>
      )}
    </>
  );
}

/* ── shared style helpers ── */
const labelSt = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '4px' };
const inputSt = { width: '100%', border: '1px solid #ccc', borderRadius: '3px', padding: '7px 10px',
  fontSize: '13px', boxSizing: 'border-box' };

/* ════════════════════════════════════════════════
   ROOT — loads assignment, picks Faculty or Student view
   ════════════════════════════════════════════════ */
export default function Assignment() {
  const { id, courseId }   = useParams();
  const [searchParams]     = useSearchParams();
  const title              = searchParams.get('title');
  const { user }           = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    const url = (id === 'by-name' && courseId && title)
      ? `/assignments/by-name/${courseId}?title=${encodeURIComponent(title)}`
      : `/assignments/${id}`;
    api.get(url)
      .then(r => setAssignment(r.data))
      .catch(err => { console.error(err); setError('Could not load assignment.'); })
      .finally(() => setLoading(false));
  }, [id, courseId, title]);

  if (loading) return <Layout><p style={{ padding: '20px 0', color: '#888', fontSize: '13px' }}>Loading…</p></Layout>;
  if (!assignment) return <Layout><p style={{ padding: '20px 0', color: '#c0392b' }}>{error || 'Assignment not found.'}</p></Layout>;

  const course     = assignment.course;
  const isFaculty  = user?.role === 'faculty' || user?.role === 'admin';

  return (
    <Layout>
      {/* Breadcrumb */}
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px',
        display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link to="/dashboard" style={{ color: '#ff6600', textDecoration: 'none' }} className="hover:underline">Dashboard</Link>
        <span style={{ color: '#bbb' }}>/</span>
        <Link to="/courses"   style={{ color: '#ff6600', textDecoration: 'none' }} className="hover:underline">My courses</Link>
        {course && <>
          <span style={{ color: '#bbb' }}>/</span>
          <Link to={`/course/${course.slug}`} style={{ color: '#ff6600', textDecoration: 'none' }} className="hover:underline">{course.title}</Link>
        </>}
        <span style={{ color: '#bbb' }}>/</span>
        <span style={{ color: '#333' }}>{assignment.title}</span>
        {isFaculty && (
          <span style={{ marginLeft: '8px', background: '#ff6600', color: '#fff',
            fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>
            Faculty View
          </span>
        )}
      </div>

      {isFaculty
        ? <FacultyView assignment={assignment} onSaved={setAssignment} />
        : <StudentView assignment={assignment} course={course} />
      }
    </Layout>
  );
}
