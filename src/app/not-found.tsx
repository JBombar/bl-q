export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '3.75rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '1rem',
        }}>
          404
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: '#4b5563',
          marginBottom: '2rem',
        }}>
          Page not found
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#2563eb',
            color: 'white',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
