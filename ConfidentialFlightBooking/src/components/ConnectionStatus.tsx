import React from 'react';

interface ConnectionStatusProps {
  connected: boolean;
  userAccount: string | null;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connected, userAccount }) => {
  return (
    <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
      <span id="connectionText">
        {connected && userAccount
          ? `Connected: ${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`
          : 'Disconnected'}
      </span>
    </div>
  );
};

export default ConnectionStatus;
