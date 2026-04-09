import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Auth state
  user: JSON.parse(localStorage.getItem('wechat_user') || 'null'),
  token: localStorage.getItem('wechat_token') || null,

  // Chat state
  conversations: [],
  activeConversation: null,
  messages: {},

  // Contacts state
  contacts: [],
  friendRequests: [],

  // Moments state
  moments: [],

  // Notifications
  notifications: [],
  unreadTotal: 0,

  // Auth actions
  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem('wechat_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('wechat_user');
    }
  },

  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem('wechat_token', token);
    } else {
      localStorage.removeItem('wechat_token');
    }
  },

  logout: () => {
    localStorage.removeItem('wechat_token');
    localStorage.removeItem('wechat_user');
    set({
      user: null,
      token: null,
      conversations: [],
      activeConversation: null,
      messages: {},
      contacts: [],
      friendRequests: [],
      moments: [],
      notifications: [],
      unreadTotal: 0
    });
  },

  // Conversation actions
  setConversations: (conversations) => {
    const unreadTotal = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
    set({ conversations, unreadTotal });
  },

  updateConversation: (convData) => {
    set((state) => {
      const existing = state.conversations.find(c => c.id === convData.id);
      let newConvs;
      if (existing) {
        newConvs = state.conversations.map(c =>
          c.id === convData.id ? { ...c, ...convData } : c
        );
      } else {
        newConvs = [convData, ...state.conversations];
      }
      // Sort by last_message_time
      newConvs.sort((a, b) => {
        const ta = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
        const tb = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
        return tb - ta;
      });
      const unreadTotal = newConvs.reduce((sum, c) => sum + (c.unread_count || 0), 0);
      return { conversations: newConvs, unreadTotal };
    });
  },

  setActiveConversation: (conv) => set({ activeConversation: conv }),

  // Message actions
  setMessages: (userId, messages) => {
    set((state) => ({
      messages: { ...state.messages, [userId]: messages }
    }));
  },

  addMessage: (userId, message) => {
    set((state) => {
      const existing = state.messages[userId] || [];
      // Avoid exact ID duplicates (skip temp IDs from dedup check)
      const isTemp = String(message.id).startsWith('temp_');
      if (!isTemp && existing.find(m => m.id === message.id)) {
        return state;
      }
      // If this is a real message from server, remove any matching optimistic temp message
      let filtered = existing;
      if (!isTemp) {
        filtered = existing.filter(m =>
          !(String(m.id).startsWith('temp_') &&
            m.sender_id === message.sender_id &&
            m.content === message.content)
        );
      }
      return {
        messages: {
          ...state.messages,
          [userId]: [...filtered, message]
        }
      };
    });

    // Update conversation preview
    const { conversations } = get();
    const user = get().user;
    if (!user) return;

    const convKey = [user.id, parseInt(userId)].sort((a, b) => a - b);
    const existingConv = conversations.find(c =>
      (c.user1_id === convKey[0] && c.user2_id === convKey[1]) ||
      (c.other_user_id === parseInt(userId))
    );

    if (existingConv) {
      set((state) => ({
        conversations: state.conversations.map(c =>
          c.id === existingConv.id
            ? {
                ...c,
                last_message: message.content,
                last_message_time: message.created_at,
                unread_count: message.sender_id !== user.id
                  ? (c.unread_count || 0) + 1
                  : c.unread_count
              }
            : c
        ).sort((a, b) => {
          const ta = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
          const tb = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
          return tb - ta;
        })
      }));
    }
  },

  clearUnread: (convId) => {
    set((state) => ({
      conversations: state.conversations.map(c =>
        c.id === convId ? { ...c, unread_count: 0 } : c
      ),
      unreadTotal: Math.max(
        0,
        state.conversations.reduce((sum, c) => sum + (c.id === convId ? 0 : (c.unread_count || 0)), 0)
      )
    }));
  },

  // Contact actions
  setContacts: (contacts) => set({ contacts }),

  addContact: (contact) => {
    set((state) => ({
      contacts: [...state.contacts, contact]
    }));
  },

  setFriendRequests: (requests) => set({ friendRequests: requests }),

  removeFriendRequest: (id) => {
    set((state) => ({
      friendRequests: state.friendRequests.filter(r => r.id !== id)
    }));
  },

  // Moments actions
  setMoments: (moments) => set({ moments }),

  addMoment: (moment) => {
    set((state) => ({
      moments: [moment, ...state.moments]
    }));
  },

  updateMoment: (updatedMoment) => {
    set((state) => ({
      moments: state.moments.map(m =>
        m.id === updatedMoment.id ? updatedMoment : m
      )
    }));
  },

  removeMoment: (momentId) => {
    set((state) => ({
      moments: state.moments.filter(m => m.id !== momentId)
    }));
  },

  // Notifications
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50)
    }));
  }
}));

export default useStore;
