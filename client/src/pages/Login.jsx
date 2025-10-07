import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../api/apiClient';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('로그인 중...');

        try {
            const data = await post('/api/auth/login', { email, password });
            if (data?.user) {
                setStatus(`✅ ${data.user.email} 로그인 성공`);
                navigate('/study');
            } else {
                setStatus('❌ 로그인 실패');
            }
        } catch (err) {
            console.error(err);
            setStatus('❌ 서버 오류');
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            <h2>로그인</h2>
            <form onSubmit={handleSubmit}>
                <input
                    placeholder="이메일"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ display: 'block', marginBottom: '0.5rem' }}
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ display: 'block', marginBottom: '0.5rem' }}
                />
                <button type="submit">로그인</button>
            </form>
            <p>{status}</p>
        </div>
    );
}
