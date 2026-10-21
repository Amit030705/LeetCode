import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient'

// Helper function to extract serializable error data
const getSerializableError = (error) => {
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return {
      message: 'The server is taking too long to respond. Please try again shortly.',
      status: null,
      data: null
    };
  }

  if (error.response) {
    // Axios error with response
    return {
      message: error.response.data?.message || error.response.data || error.message || 'Something went wrong',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.message) {
    // Other errors with message
    return {
      message: error.message,
      status: null,
      data: null
    };
  }
  return {
    message: 'Something went wrong',
    status: null,
    data: null
  };
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
    const response =  await axiosClient.post('/user/register', userData, { timeout: 60000 });
    return response.data.user;
    } catch (error) {
      return rejectWithValue(getSerializableError(error));
    }
  }
);


export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials, { timeout: 60000 });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(getSerializableError(error));
    }
  }
);

export const googleAuthUser = createAsyncThunk(
  'auth/google',
  async (credential, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/google', { credential }, { timeout: 60000 });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(getSerializableError(error));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (emailId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/forgot-password', { emailId }, { timeout: 45000 });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(getSerializableError(error));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/user/reset-password/${token}`, { password });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(getSerializableError(error));
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/user/check');
      return data.user;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue(null); // Special case for no session
      }
      return rejectWithValue(getSerializableError(error));
    }
  },
  {
    // React StrictMode can run the startup effect twice in development.
    condition: (_, { getState }) => getState().auth.sessionStatus !== 'checking'
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      return null;
    } catch (error) {
      return rejectWithValue(getSerializableError(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    sessionStatus: 'unknown',
    loading: false,
    error: null
  },
  reducers: {
    updateUserImage: (state, action) => {
      if (state.user) {
        state.user.profileImage = action.payload;
      }
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register User Cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.sessionStatus = action.payload ? 'authenticated' : 'anonymous';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
        state.sessionStatus = 'anonymous';
      })
  
      // Login User Cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.sessionStatus = action.payload ? 'authenticated' : 'anonymous';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
        state.sessionStatus = 'anonymous';
      })

      // Google Auth Cases
      .addCase(googleAuthUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuthUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.sessionStatus = action.payload ? 'authenticated' : 'anonymous';
      })
      .addCase(googleAuthUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Google sign-in failed';
        state.isAuthenticated = false;
        state.user = null;
        state.sessionStatus = 'anonymous';
      })
  
      // Check Auth Cases
      .addCase(checkAuth.pending, (state) => {
        state.sessionStatus = 'checking';
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.sessionStatus = action.payload ? 'authenticated' : 'anonymous';
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.sessionStatus = 'anonymous';
      })
  
      // Logout User Cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.sessionStatus = 'anonymous';
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.sessionStatus = 'anonymous';
        state.user = null;
      });
  }
});

export const { updateUserImage, updateUserProfile } = authSlice.actions;

export default authSlice.reducer;
