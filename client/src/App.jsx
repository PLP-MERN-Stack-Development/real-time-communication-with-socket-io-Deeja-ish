// In client/src/App.jsx

import { useState } from 'react';
import { useSocket } from './socket/socket';
import './App.css'; // Make sure this is imported (or index.css)

function App() {
  const [username, setUsername] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const {
    connect,
    sendPrivateMessage,
    sendMessage,
    messages,
    users,
    typingUsers,
    setTyping,
    socket,
  } = useSocket();

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      connect(username);
      setHasJoined(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      if (selectedUser) {
        sendPrivateMessage(selectedUser.id, currentMessage);
      } else {
        sendMessage(currentMessage);
      }
      setCurrentMessage('');
      setTyping(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleTyping = (e) => {
    setCurrentMessage(e.target.value);
    setTyping(true);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const newTimeout = setTimeout(() => {
      setTyping(false);
    }, 2000);
    setTypingTimeout(newTimeout);
  };

  return (
    // This wrapper will control the app's position
    <div className="app-wrapper">
      {!hasJoined ? (
        // NEW: Enhanced Landing/Login Page
        <div className="login-container">
          <div className="login-content">
            <h1>Welcome to Chat.io</h1>
            <p>
              Connect with people in real-time. Just pick a username and start
              chatting.
            </p>
            <form onSubmit={handleJoin} className="login-form">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                aria-label="Username"
              />
              <button type="submit">Join Chat</button>
            </form>
          </div>
        </div>
      ) : (
        // This is your existing chat interface
        <div className="chat-container">
          <div className="sidebar">
            <h3>Online Users ({users.length})</h3>
            <ul>
              <li
                className={`user-list-item ${!selectedUser ? 'active' : ''}`}
                onClick={() => setSelectedUser(null)}
              >
                💬 **Global Chat**
              </li>
              {users.map(
                (user) =>
                  user.id !== socket.id && (
                    <li
                      key={user.id}
                      className={`user-list-item ${
                        selectedUser?.id === user.id ? 'active' : ''
                      }`}
                      onClick={() => handleUserSelect(user)}
                    >
                      🟢 {user.username}
                    </li>
                  )
              )}
            </ul>
          </div>

          <div className="chat-main">
            <div className="message-list">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${
                    msg.system ? 'system' : msg.isPrivate ? 'private' : ''
                  }`}
                >
                  {msg.system ? (
                    <em>{msg.message}</em>
                  ) : (
                    <>
                      <strong>
                        {msg.sender}
                        {msg.isPrivate ? ' (private)' : ''}:{' '}
                      </strong>
                      <span>{msg.message}</span>
                      <small>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </small>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="typing-indicator">
              {typingUsers.length > 0
                ? `${typingUsers.join(', ')} ${
                    typingUsers.length > 1 ? 'are' : 'is'
                  } typing...`
                : ' '}
            </div>

            <form className="message-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={currentMessage}
                onChange={handleTyping}
                placeholder={
                  selectedUser
                    ? `Private message to ${selectedUser.username}`
                    : 'Type a message...'
                }
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;