import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Mail, Unlink, RotateCw } from 'lucide-react';
import { useState } from 'react';

export function GoogleCalendarConnect() {
  const { isConnected, isLoading, connect, disconnect, isDisconnecting, syncAll, isSyncingAll } = useGoogleCalendar();
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        background: '#f3f4f6',
        borderRadius: 8,
      }}>
        <div style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: '2px solid #2563eb',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: 13, color: '#6b7280' }}>Chargement...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          background: 'linear-gradient(135deg, #1f2937, #374151)',
          color: '#fff',
          border: '1px solid #4b5563',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          transition: 'all 0.2s ease',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, #374151, #4b5563)';
          (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
          (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, #1f2937, #374151)';
          (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
          (e.target as HTMLButtonElement).style.boxShadow = 'none';
        }}
      >
        <Mail size={16} />
        Connecter Google Calendar
      </button>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        background: '#ecfdf5',
        border: '1px solid #86efac',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        color: '#15803d',
      }}>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#10b981',
        }} />
        ✓ Google Calendar connecté
      </div>

      <button
        onClick={() => syncAll()}
        disabled={isSyncingAll}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 12px',
          background: '#dbeafe',
          color: '#1e40af',
          border: '1px solid #93c5fd',
          borderRadius: 8,
          cursor: isSyncingAll ? 'not-allowed' : 'pointer',
          fontSize: 12,
          fontWeight: 600,
          transition: 'all 0.2s ease',
          opacity: isSyncingAll ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isSyncingAll) {
            (e.target as HTMLButtonElement).style.background = '#bfdbfe';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.background = '#dbeafe';
          (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
        }}
      >
        <RotateCw size={14} style={{
          animation: isSyncingAll ? 'spin 1s linear infinite' : 'none',
        }} />
        {isSyncingAll ? 'Synchronisation...' : 'Tout synchroniser'}
      </button>

      {!showDisconnectConfirm ? (
        <button
          onClick={() => setShowDisconnectConfirm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            background: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #fca5a5',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = '#fecaca';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = '#fee2e2';
            (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          <Unlink size={14} />
          Déconnecter
        </button>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 12px',
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: 8,
          fontSize: 12,
          gap: 4,
        }}>
          <span>Confirmer ?</span>
          <button
            onClick={() => disconnect()}
            disabled={isDisconnecting}
            style={{
              padding: '4px 8px',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: isDisconnecting ? 'not-allowed' : 'pointer',
              fontSize: 11,
              fontWeight: 600,
              opacity: isDisconnecting ? 0.7 : 1,
            }}
          >
            {isDisconnecting ? 'Suppression...' : 'Oui'}
          </button>
          <button
            onClick={() => setShowDisconnectConfirm(false)}
            style={{
              padding: '4px 8px',
              background: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Non
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
