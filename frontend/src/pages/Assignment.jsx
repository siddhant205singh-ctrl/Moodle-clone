import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
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
    day: 'numeric', month: 'long', year: 'numeric',
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

/* ── status row ── */
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

export default function Assignment() {
  const { id, courseId } = useParams();          // id OR courseId for by-name route
  const [searchParams]   = useSearchParams();
  const title            = searchParams.get('title'); // used with by-name route

  const [assignment,  setAssignment]  = useState(null);
  const [submission,  setSubmission]  = useState(null);  // existing submission or null
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [removing,    setRemoving]    = useState(false);
  const [editMode,    setEditMode]    = useState(false);  // show upload form
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [comments,    setComments]    = useState('');
  const [error,       setError]       = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Support both /assignment/:id and /assignment/by-name/:courseId?title=...
    const assignmentUrl = (id === 'by-name' && courseId && title)
      ? `/assignments/by-name/${courseId}?title=${encodeURIComponent(title)}`
      : `/assignments/${id}`;

    // Load assignment first
    api.get(assignmentUrl)
      .then(aRes => {
        setAssignment(aRes.data);
        // Load submission separately — failure here is non-fatal (no submission yet)
        api.get(`/submissions/assignment/${aRes.data._id}/me`)
          .then(sRes => {
            setSubmission(sRes.data);
            if (sRes.data) setComments(sRes.data.comments || '');
          })
          .catch(() => { /* no submission yet — silently ignore */ })
          .finally(() => setLoading(false));
      })
      .catch(err => {
        console.error('Assignment load failed:', err);
        setError('Could not load assignment. Please try again.');
        setLoading(false);
      });
  }, [id, courseId, title]);

  /* ── read files as base64 ── */
  const readFilesAsBase64 = (files) =>
    Promise.all(
      Array.from(files).map(
        (f) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = () => resolve({
              originalName: f.name,
              mimeType:     f.type || 'application/octet-stream',
              size:         f.size,
              data:         reader.result.split(',')[1], // strip data:...;base64,
            });
            reader.onerror = reject;
            reader.readAsDataURL(f);
          })
      )
    );

  /* ── submit handler ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedFiles.length) { setError('Please select at least one file.'); return; }
    setSubmitting(true);
    try {
      const files = await readFilesAsBase64(selectedFiles);
      const res   = await api.post('/submissions', { assignmentId: id, files, comments });
      setSubmission(res.data);
      setEditMode(false);
      setSelectedFiles([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── remove submission ── */
  const handleRemove = async () => {
    if (!submission?._id) return;
    if (!window.confirm('Remove your submission? This cannot be undone.')) return;
    setRemoving(true);
    try {
      await api.delete(`/submissions/${submission._id}`);
      setSubmission(null);
      setEditMode(false);
      setSelectedFiles([]);
      setComments('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove submission.');
    } finally {
      setRemoving(false);
    }
  };

  /* ── download a submitted file ── */
  const handleDownload = (file) => {
    const a = document.createElement('a');
    a.href     = `data:${file.mimeType};base64,${file.data}`;
    a.download = file.originalName;
    a.click();
  };

  if (loading) return <Layout><p style={{ padding: '20px 0', color: '#888', fontSize: '13px' }}>Loading…</p></Layout>;
  if (!assignment) return (
    <Layout>
      <p style={{ padding: '20px 0', color: '#c0392b' }}>
        {error || 'Assignment not found.'}
      </p>
    </Layout>
  );

  const course     = assignment.course;
  const submitted  = !!submission;
  const lateMsg    = submitted ? lateLabel(submission.updatedAt, assignment.dueDate) : null;
  const isGraded   = submission?.grade != null;

  return (
    <Layout>
      {/* Breadcrumb */}
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px', display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link to="/dashboard" style={{ color: '#ff6600', textDecoration: 'none' }} className="hover:underline">Dashboard</Link>
        <span style={{ color: '#bbb' }}>/</span>
        <Link to="/courses"   style={{ color: '#ff6600', textDecoration: 'none' }} className="hover:underline">My courses</Link>
        {course && <>
          <span style={{ color: '#bbb' }}>/</span>
          <Link to={`/course/${course.slug}`} style={{ color: '#ff6600', textDecoration: 'none' }} className="hover:underline">{course.title}</Link>
        </>}
        <span style={{ color: '#bbb' }}>/</span>
        <span style={{ color: '#333' }}>{assignment.title}</span>
      </div>

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
            <StatusRow
              label="Submission status"
              value={submitted ? 'Submitted for grading' : 'No attempt'}
            />
            <StatusRow
              label="Grading status"
              value={isGraded ? `Graded: ${submission.grade} / ${assignment.maxScore}` : 'Not graded'}
            />
            <StatusRow
              label="Due date"
              value={fmt(assignment.dueDate)}
            />
            {lateMsg && (
              <StatusRow label="Time remaining" value={lateMsg} highlight />
            )}
            {!lateMsg && assignment.dueDate && !submitted && (
              <StatusRow
                label="Time remaining"
                value={new Date(assignment.dueDate) > new Date()
                  ? `${Math.ceil((new Date(assignment.dueDate) - new Date()) / 86400000)} days left`
                  : 'Past due'}
                highlight={new Date(assignment.dueDate) < new Date()}
              />
            )}
            {submitted && (
              <StatusRow
                label="Last modified"
                value={fmtShort(submission.updatedAt)}
              />
            )}
            <StatusRow
              label="File submissions"
              value={
                submitted && submission.files?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {submission.files.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#c0392b', fontSize: '16px' }}>📄</span>
                        <button
                          onClick={() => handleDownload(f)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer',
                            color: '#1177d1', fontSize: '13px', padding: 0, textDecoration: 'underline' }}>
                          {f.originalName}
                        </button>
                        <span style={{ fontSize: '12px', color: '#888' }}>{fmtShort(submission.updatedAt)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#888', fontSize: '13px' }}>No files submitted</span>
                )
              }
            />
            <StatusRow
              label="Submission comments"
              value={
                <span style={{ color: '#ff6600', fontSize: '13px', cursor: 'pointer' }}>
                  ▶ Comments ({submission?.comments ? 1 : 0})
                </span>
              }
            />
          </tbody>
        </table>
      </div>

      {/* Upload form (shown when editMode or no submission yet) */}
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
            {/* File drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #ccc', borderRadius: '4px', padding: '32px',
                textAlign: 'center', cursor: 'pointer', marginBottom: '14px',
                background: selectedFiles.length ? '#f0f8f0' : '#fafafa',
                transition: 'background .2s',
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); setSelectedFiles(Array.from(e.dataTransfer.files)); }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
              <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                {selectedFiles.length
                  ? `${selectedFiles.length} file(s) selected: ${Array.from(selectedFiles).map(f => f.name).join(', ')}`
                  : 'Click or drag & drop files here'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={e => setSelectedFiles(Array.from(e.target.files))}
              />
            </div>

            {/* Comments */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                Submission comments (optional)
              </label>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                rows={3}
                style={{ width: '100%', border: '1px solid #ccc', borderRadius: '3px', padding: '8px 10px',
                  fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                placeholder="Add a comment…"
              />
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

      {/* Action buttons — Edit submission / Remove submission */}
      {submitted && !editMode && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px 0' }}>
          <button
            onClick={() => { setEditMode(true); setSelectedFiles([]); setError(''); }}
            style={{ background: '#fff', border: '1px solid #aaa', borderRadius: '3px',
              padding: '7px 20px', fontSize: '13px', cursor: 'pointer' }}>
            Edit submission
          </button>
          <button
            onClick={handleRemove}
            disabled={removing}
            style={{ background: '#fff', border: '1px solid #aaa', borderRadius: '3px',
              padding: '7px 20px', fontSize: '13px', cursor: 'pointer', opacity: removing ? 0.7 : 1 }}>
            {removing ? 'Removing…' : 'Remove submission'}
          </button>
        </div>
      )}

      {/* First-time submit button (no submission yet, form hidden) */}
      {!submitted && !editMode && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
          <button
            onClick={() => setEditMode(true)}
            style={{ background: '#ff6600', color: '#fff', border: 'none', borderRadius: '3px',
              padding: '9px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Add submission
          </button>
        </div>
      )}
    </Layout>
  );
}
