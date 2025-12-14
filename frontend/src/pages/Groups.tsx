import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createGroup, listGroups, type Group } from '../api';

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    const load = async () => {
      const data = await listGroups(query || undefined);
      setGroups(data);
    };
    load().catch(() => {});
  }, [query]);

  const filtered = useMemo(() =>
    groups.filter(g => g.name.toLowerCase().includes(query.toLowerCase())),
    [groups, query]
  );

  const createGroupHandler = async () => {
    if (!newGroupName.trim()) return;
    const created = await createGroup(newGroupName.trim());
    setGroups(prev => [created, ...prev]);
    setNewGroupName('');
    setShowModal(false);
  };

  return (
    <div className="container">
      <div className="toolbar">
        <input
          placeholder="Search groups"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button onClick={() => setShowModal(true)}>＋ Create</button>
      </div>
      <ul className="list">
        {filtered.map(g => ( 
          <li key={g.id}><Link to={`/chat/${g.id}`}>{g.name}</Link></li>
        ))} 
      </ul>

      {showModal && (
        <div className="modal">
          <div className="modal-card">
            <h3>Create Group</h3>
            <input
              placeholder="Group name"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={createGroupHandler}>Create</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
