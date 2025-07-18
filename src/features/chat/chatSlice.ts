import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { startConversationApi, fetchChatHistoryApi, sendChatMessageApi, listConversationsApi } from './chatApi';

interface ChatMessage {
  model: string;
  prompt: string;
  response: string;
  conversation_number: number;
  timestamp: string;
}

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  conversation_number: number | null;
  conversations: number[]; // list of conversation_numbers
  messagesLoaded: boolean;
  justStartedConversation: boolean;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
  conversation_number: null,
  conversations: [],
  messagesLoaded: false,
  justStartedConversation: false,
};

export const startConversation = createAsyncThunk(
  'chat/startConversation',
  async ({ access_token, preserveUserMessage }: { access_token: string; preserveUserMessage?: boolean }, { rejectWithValue }) => {
    try {
      const response = await startConversationApi(access_token);
      return { ...response, preserveUserMessage }; // pass through
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to start conversation');
    }
  }
);

export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async (data: { access_token: string; conversation_number: number }, { rejectWithValue }) => {
    try {
      const response = await fetchChatHistoryApi(data.access_token, data.conversation_number);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch chat history');
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    data: { model: string; prompt: string; conversation_number: number; access_token: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await sendChatMessageApi(data);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send message');
    }
  }
);

export const listConversations = createAsyncThunk(
  'chat/listConversations',
  async (access_token: string, { rejectWithValue }) => {
    try {
      const response = await listConversationsApi(access_token);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to list conversations');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    selectConversation: (state, action) => {
      state.conversation_number = action.payload;
      state.messages = [];
      state.error = null;
    },
    clearChat: (state) => {
      state.messages = [];
      state.conversation_number = null;
      state.error = null;
    },
    addUserMessage: (state, action) => {
      state.messages.push({
        model: action.payload.model,
        prompt: action.payload.prompt,
        response: '',
        conversation_number: state.conversation_number || -1,
        timestamp: new Date().toISOString(),
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.conversation_number = action.payload.conversation_number;

        if (!action.payload.preserveUserMessage) {
          state.messages = [];
        }

        state.messagesLoaded = true;
        state.justStartedConversation = true;
        state.error = null;
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.messagesLoaded = false;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
        state.messagesLoaded = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.messages.findIndex(
          (msg) =>
            msg.prompt === action.payload.prompt &&
            msg.response === '' &&
            msg.model === action.payload.model
        );

        if (index !== -1) {
          state.messages[index].response = action.payload.response;
          state.messages[index].timestamp = action.payload.timestamp;
          state.messages[index].conversation_number = action.payload.conversation_number;
        } else {
          // fallback if no match found — just append
          state.messages.push({
            model: action.payload.model,
            prompt: action.payload.prompt,
            response: action.payload.response,
            conversation_number: action.payload.conversation_number,
            timestamp: action.payload.timestamp,
          });
        }

        state.conversation_number = action.payload.conversation_number;
        state.error = null;
        state.justStartedConversation = false;
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(listConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
        state.error = null;
      })
      .addCase(listConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectConversation, clearChat, addUserMessage } = chatSlice.actions;
export default chatSlice.reducer;
