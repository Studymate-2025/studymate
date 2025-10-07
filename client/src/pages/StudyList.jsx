import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../api/apiClient';

export default function StudyList() {
    const [studies, setStudies] = useState([]);

    useEffect(() => {
        get('/api/study/list')
            .then(data => setStudies(data || []))
            .catch(() => setStudies([]));
    }, []);

    return (
        <div style={{ padding: '1rem' }}>
            <h2>스터디 목록</h2>
            {studies.length === 0 ? (
                <p>등록된 스터디가 없습니다.</p>
            ) : (
                <ul>
                    {studies.map(study => (
                        <li key={study.id}>
                            <Link to={`/chat/${study.id}`}>{study.title}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
