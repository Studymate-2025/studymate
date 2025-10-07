import React, { useEffect, useState } from 'react';

export default function Home() {
    const [status, setStatus] = useState("확인 중...");

    useEffect(() => {
        fetch('/api/auth/ping')
            .then(res => {
                if (res.ok) return "✅ API 서버 연결 성공";
                throw new Error(res.status);
            })
            .then(setStatus)
            .catch(() => setStatus("❌ API 서버 연결 실패"));
    }, []);

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Studymate 홈</h2>
            <p>React + Vite + Express 백엔드 통합 테스트</p>
            <p><b>API 상태:</b> {status}</p>
        </div>
    );
}
