import React from 'react';
import { MessageState } from '../types';

interface MessageProps {
  message: MessageState | null;
  onClose: () => void;
}

const Message: React.FC<MessageProps> = ({ message, onClose }) => {
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const className = message.type === 'error' ? 'error-message' : 'success-message';

  return <div className={className}>{message.text}</div>;
};

export default Message;
