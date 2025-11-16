
import React from 'react';

const ChatrollChat: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-yellow-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Chat da Rádio</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="relative">
        <iframe 
          width="450px" 
          height="350px" 
          frameBorder="0" 
          scrolling="no" 
          marginHeight={0} 
          marginWidth={0} 
          allowTransparency={true} 
          src="https://chatroll.com/embed/chat/chatrasreggae?id=ukTmEbbUQET&platform=html"
          className="w-full"
          title="Chat da Rádio"
        />
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 text-center">
        Chat moderado • Seja respeitoso com todos
      </div>
    </div>
  );
};

export default ChatrollChat;
