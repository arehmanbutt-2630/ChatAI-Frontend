import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../app/store';
import { fetchChatHistory, sendChatMessage, startConversation, listConversations, selectConversation, clearChat, addUserMessage } from './chatSlice';
import {
  Send, Bot, User, MessageSquare, Sparkles, Brain,
  LogOut, Menu, X
} from 'lucide-react';

type AIModel = 'gpt' | 'claude' | 'gemini'

interface ChatPageProps {
  onLogout: () => void
}

const modelConfig = {
  gpt: { name: 'GPT-4', icon: Bot, color: 'bg-green-500', gradient: 'from-green-500 to-emerald-500' },
  claude: { name: 'Claude', icon: Brain, color: 'bg-orange-500', gradient: 'from-orange-500 to-amber-500' },
  gemini: { name: 'Gemini', icon: Sparkles, color: 'bg-blue-500', gradient: 'from-blue-500 to-indigo-500' },
}


const ChatPage = (props: ChatPageProps) => {
  const dispatch: AppDispatch = useDispatch()
  const chat = useSelector((state: RootState) => state.chat)
  const [inputText, setInputText] = useState('')
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)
  const modelDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      dispatch(listConversations(localStorage.getItem('access_token') || ''))
    }
  }, [dispatch])

  useEffect(() => {
    if (chat.conversation_number && localStorage.getItem('access_token')) {
      dispatch(fetchChatHistory({ access_token: localStorage.getItem('access_token') || '', conversation_number: chat.conversation_number }))
    }
  }, [chat.conversation_number, dispatch])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.messages])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelDropdownOpen(false)
      }
    }
    if (isModelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isModelDropdownOpen])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [chat.conversation_number, chat.messages.length])

  const handleSendMessage = async () => {
    const trimmedText = inputText.trim()
    const accessToken = localStorage.getItem('access_token')
    if (!trimmedText || chat.loading || !accessToken) return

    // Optimistically show the user message
    dispatch(addUserMessage({
      model: selectedModel,
      prompt: trimmedText,
    }))

    if (!chat.conversation_number) {
      // No conversation: create one, then send message
      const result = await dispatch(startConversation({ access_token: accessToken, preserveUserMessage: true }))
      if (startConversation.fulfilled.match(result)) {
        const newNumber = result.payload.conversation_number

        await dispatch(sendChatMessage({
          model: selectedModel,
          prompt: trimmedText,
          conversation_number: newNumber,
          access_token: accessToken,
        }))
      }
    } else {
      // Conversation exists, send message
      dispatch(sendChatMessage({
        model: selectedModel,
        prompt: trimmedText,
        conversation_number: chat.conversation_number,
        access_token: accessToken,
      }))
    }

    setInputText('')
  }


  const handleStartConversation = () => {
    dispatch(clearChat())
    if (isSidebarOpen) setIsSidebarOpen(false)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const handleSelectConversation = (number: number) => {
    dispatch(selectConversation(number))
    if (isSidebarOpen) setIsSidebarOpen(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }


  return (
    <div className="h-screen w-full flex flex-col lg:flex-row relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed z-50 top-0 left-0 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:translate-x-0 lg:w-80 lg:block`}>
        <div className="flex flex-col h-full relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4  border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-800">CHAT A.I+</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">


            {/* Conversations List */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm text-gray-500 font-medium">Recent Conversations</h3>
                <button onClick={handleStartConversation} className="text-xs text-indigo-600 hover:underline font-medium">+ New</button>
              </div>
              <div className="space-y-2 max-h-[80%] overflow-y-auto">
                {chat.conversations.length > 0 ? (
                  chat.conversations.map((number: number) => (
                    <div key={number} onClick={() => handleSelectConversation(number)} className={`group p-3 rounded-lg cursor-pointer ${chat.conversation_number === number ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-100'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className={`truncate text-sm font-medium ${chat.conversation_number === number ? 'text-indigo-700' : 'text-gray-800'}`}>Conversation {number}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center">No conversations yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-1 border-t border-gray-200">
            <button
              onClick={props.onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Content */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="bg-white px-4 py-3  border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-md hover:bg-gray-100">
              <Menu className="w-5 h-5 text-gray-500" />
            </button>
            <div className="relative group" ref={modelDropdownRef}>
              <button
                className="flex items-center space-x-3"
                type="button"
                onClick={() => setIsModelDropdownOpen((open) => !open)}
              >
                <div className={`w-8 h-8 rounded-full ${modelConfig[selectedModel].color} flex items-center justify-center`}>
                  {React.createElement(modelConfig[selectedModel].icon, { className: 'w-4 h-4 text-white' })}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800">{modelConfig[selectedModel].name}</h1>
                  <p className="text-sm text-gray-500">AI Assistant</p>
                </div>
              </button>
              {isModelDropdownOpen && (
                <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-48">
                  {Object.entries(modelConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedModel(key as AIModel)
                        setIsModelDropdownOpen(false)
                      }}
                      className="w-full px-4 py-2 flex items-center space-x-2 text-sm hover:bg-gray-100"
                    >
                      <div className={`w-5 h-5 rounded-full ${config.color} flex items-center justify-center`}>
                        {React.createElement(config.icon, { className: 'w-3 h-3 text-white' })}
                      </div>
                      <span>{config.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-right flex items-center space-x-2">

            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center ml-2">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-2 md:px-6 py-2 md:py-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {chat.messagesLoaded && chat.messages.length === 0 && !chat.justStartedConversation ?(
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${modelConfig[selectedModel].gradient} flex items-center justify-center mx-auto mb-4`}>
                  {React.createElement(modelConfig[selectedModel].icon, {
                    className: 'w-8 h-8 text-white'
                  })}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {chat.conversation_number ? 'Continue your conversation' : `Start a conversation with ${modelConfig[selectedModel].name}`}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Ask me anything! I'm here to help you with questions, creative tasks, analysis, and much more.
                </p>
              </div>
            ) : (
              chat.messages.map((message: any, idx: any) => (
                <div key={idx} className="space-y-2">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="flex items-start space-x-3 max-w-2xl flex-row-reverse space-x-reverse">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl max-w-[80%] sm:max-w-[65%] whitespace-pre-wrap break-all bg-indigo-600 text-white">
                        <p className="text-sm leading-relaxed ">{message.prompt}</p>
                        <div className="text-xs mt-2 text-indigo-200">{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                      </div>
                    </div>
                  </div>
                  {/* AI message */}
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3 max-w-2xl">
                      <div className={`w-8 h-8 rounded-full ${message.model === 'gpt' ? 'bg-green-500' : message.model === 'claude' ? 'bg-orange-500' : 'bg-blue-500'} flex items-center justify-center flex-shrink-0`}>
                        {message.model === 'gpt' ? <Bot className="w-4 h-4 text-white" /> : message.model === 'claude' ? <Brain className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                      </div>
                      <div className="px-4 py-3 rounded-2xl bg-white text-gray-800 shadow-sm border border-gray-200 max-w-[80%] sm:max-w-[65%]">
                        {message.response ? (
                          <p className="text-sm leading-relaxed ">{message.response}</p>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-gray-500">{modelConfig[message.model as AIModel].name} is thinking...</span>
                          </div>
                        )}
                        <div className="text-xs mt-2 text-gray-500">{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white  border-gray-200 px-2 md:px-6 py-2 md:py-3">
          <div className="max-w-4xl mx-auto">
            {/* Show rate limit error if present */}
            {chat.error && chat.error.includes('Rate limit reached') && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                <span className="text-sm text-red-700 font-medium">Daily message limit reached</span>
                <p className="text-xs text-red-600 mt-1">You have reached your daily message limit. Please try again tomorrow.</p>
              </div>
            )}
            <div className="flex flex-row justify-center items-center gap-2 relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value)
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto'
                    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
                    if (textareaRef.current.scrollHeight > 120) {
                      textareaRef.current.style.overflowY = 'auto'
                    } else {
                      textareaRef.current.style.overflowY = 'hidden'
                    }
                  }
                }}
                onKeyPress={handleKeyPress}
                placeholder={chat.error && chat.error.includes('Rate limit reached') ? 'Daily message limit reached' : `Message ${modelConfig[selectedModel].name}...`}
                disabled={chat.loading || !!(chat.error && chat.error.includes('Rate limit reached'))}
                className="w-full px-4 py-3 pr-12 border border-black-900 rounded-2xl min-h-[44px] max-h-[120px] resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb #fff', WebkitAppearance: 'none', msOverflowStyle: 'none' }}
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || chat.loading || !!(chat.error && chat.error.includes('Rate limit reached'))}
                className={`p-3 rounded-full transition-all duration-200 ${!inputText.trim() || chat.loading || !!(chat.error && chat.error.includes('Rate limit reached'))
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                  }`}
              >
                <Send className="w-7 h-7 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
