import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function TreeNode({ node, level = 0, forceOpen = false }) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isOpen = forceOpen || open;

  return (
    <li style={{ listStyle: 'none' }}>
      <div
        className="cat-item"
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={() => hasChildren && setOpen(o => !o)}
      >
        {/* Toggle arrow */}
        <span style={{
          display: 'inline-block', width: '14px', marginRight: '4px',
          fontSize: '10px', color: '#999', flexShrink: 0,
          transform: isOpen ? 'rotate(90deg)' : 'none',
          transition: 'transform 0.15s',
          visibility: hasChildren ? 'visible' : 'hidden',
          cursor: hasChildren ? 'pointer' : 'default',
        }}>▶</span>

        {/* Category icon */}
        <span style={{ marginRight: '6px', fontSize: '13px', flexShrink: 0 }}>
          {level === 0 ? '📁' : hasChildren ? '📂' : '📄'}
        </span>

        {/* Category name link */}
        <Link
          to={`/category/${node._id}`}
          onClick={e => e.stopPropagation()}
          style={{ color: '#1177d1', fontSize: '13px', flex: 1 }}
          className="hover:underline"
        >
          {node.name}
        </Link>

        {/* Course count badge */}
        {node.courseCount > 0 && (
          <span style={{
            background: '#e8e8e8', color: '#666', fontSize: '11px',
            padding: '1px 6px', borderRadius: '10px', marginLeft: '6px', flexShrink: 0,
          }}>
            {node.courseCount}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && isOpen && (
        <ul style={{ margin: 0, padding: 0, borderLeft: '1px solid #e0e0e0', marginLeft: `${16 + level * 16}px` }}>
          {node.children.map(child => (
            <TreeNode key={child._id} node={child} level={level + 1} forceOpen={forceOpen} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function CategoryTree() {
  const [tree,      setTree]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    api.get('/categories')
      .then(r => setTree(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <p style={{ fontSize: '13px', color: '#888', padding: '12px 0' }}>Loading categories…</p>
  );

  return (
    <div className="course_category_tree clearfix frontpage-category-names">
      {/* Expand all / Collapse all — matches live site */}
      <div style={{ textAlign: 'right', marginBottom: '8px' }}>
        <a
          href="#"
          onClick={e => { e.preventDefault(); setExpandAll(v => !v); }}
          style={{ fontSize: '13px', color: '#1177d1', textDecoration: 'none' }}
          className="hover:underline"
        >
          {expandAll ? 'Collapse all' : 'Expand all'}
        </a>
      </div>
      <ul style={{ margin: 0, padding: 0 }}>
        {tree.map(node => <TreeNode key={node._id} node={node} level={0} forceOpen={expandAll} />)}
      </ul>
    </div>
  );
}
