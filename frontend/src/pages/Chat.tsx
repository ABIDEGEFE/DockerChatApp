import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listGroupMembers, joinGroup, listMessages, wsUrlForGroup, type User } from '../api';

type Member = { id: number; username: string; bio?: string | null; avatar?: string | null };
type Message = { id: string | number; sender: string; text: string; ts: number };

export default function Chat() {
  const { groupId } = useParams();
  const [joined, setJoined] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [isMember, setIsMember] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!groupId) return;
    listGroupMembers(Number(groupId)).then(res => {
      const mapped = res.members.map(m => ({ id: m.id, username: m.username, bio: m.bio, avatar: m.avatar }));
      setMembers(mapped);
      const current = localStorage.getItem('username');
      setIsMember(!!mapped.find(m => m.username === current));
    }).catch(() => {});
    listMessages(Number(groupId)).then(res => {
      const mapped = res.map(r => ({
        id: r.id,
        sender: r.sender?.username || 'anon',
        text: r.content,
        ts: new Date(r.timestamp).getTime(),
      }));
      setMessages(mapped);
    }).catch(() => {});
  }, [groupId]);

  useEffect(() => {
    if (isMember) {
      connect();
    }
  }, [isMember]);

  const filteredMembers = useMemo(() =>
    members.filter(m => m.username.toLowerCase().includes(query.toLowerCase())),
    [members, query]
  );

  const connect = () => {
    if (wsRef.current || !groupId) return;
    const url = wsUrlForGroup(groupId);
    const ws = new WebSocket(url);
    ws.onopen = () => setJoined(true);
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === 'message') {
          const p = data.payload;
          setMessages(prev => [...prev, { id: p.id, sender: p.sender, text: p.text, ts: p.ts }]);
        }
      } catch {
        setMessages(prev => [...prev, { id: String(Date.now()), sender: 'server', text: ev.data, ts: Date.now() }]);
      }
    };
    ws.onclose = () => { setJoined(false); wsRef.current = null; };
    ws.onerror = () => { /* surface toast if needed */ };
    wsRef.current = ws;
  };

  const send = () => {
    const ws = wsRef.current;
    const sender = localStorage.getItem('username') || 'guest';
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const msg: Message = { id: String(Date.now()), sender, text, ts: Date.now() };
    ws.send(JSON.stringify({ type: 'message', payload: msg }));
    setText('');
  };

  const join = async () => {
    const username = localStorage.getItem('username') || prompt('Enter a name to join') || 'guest';
    if (!groupId) return;
    const res = await joinGroup(Number(groupId), username);
    const user: User = res.user;
    setMembers(prev => prev.find(m => m.id === user.id) ? prev : [...prev, { id: user.id, username: user.username, bio: user.bio ?? null, avatar: user.avatar ?? null }]);
    setIsMember(true);
    connect();
  };

  return (
    <div className="chat-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <input placeholder="Search members" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <ul className="members">
          {filteredMembers.map(m => (
            <li key={m.id}>
              <div className="avatar" />
              <div className="meta">
                <div className="name">{m.username}</div>
                {m.bio && <div className="bio">{m.bio}</div>}
              </div>
            </li>
          ))}
        </ul>
      </aside>
      <main className="chat">
        {!joined && !isMember && (
          <div className="join-banner">
            <button onClick={join}>Join</button>
          </div>
        )}
        <div className="messages">
          {messages.map(m => (
            <div key={m.id} className={`msg ${m.sender === 'me' ? 'mine' : ''}`}>
              <span className="sender">{m.sender}</span>
              <span className="text">{m.text}</span>
            </div>
          ))}
        </div>
        <div className="composer">
          <input
            placeholder="Type a message"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
            // disabled={!joined}
          />
          <button onClick={send}>Send</button>
        </div>
      </main>
    </div>
  );
}
