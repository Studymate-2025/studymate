import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

export default function ChatRoom() {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');

    useEffect(() => {
        const socket = io('/socket.io', { query: { roomId } });

        socket.on('connect', () => console.log('소켓 연결됨'));
        socket.on('message', (msg) => setMessages(prev => [...prev, msg]));

        return () => socket.disconnect();
    }, [roomId]);

    const sendMessage = () => {
        fetch(`/api/chat/${roomId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });
        setText('');
    };

    return (
        <div style={{ padding: '1rem' }}>
            <h2>채팅방 #{roomId}</h2>
            <div style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '0.5rem',
                minHeight: '200px',
                background: '#fafafa',
            }}>
                {messages.map((m, i) => <div key={i}>{m}</div>)}
            </div>
            <div style={{ marginTop: '1rem' }}>
                <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="메시지 입력"
                />
                <button onClick={sendMessage}>보내기</button>
            </div>
        </div>
    );
}
