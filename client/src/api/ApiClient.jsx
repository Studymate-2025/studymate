export async function get(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    return res.json();
}

export async function post(url, body) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(res.status);
    return res.json();
}
