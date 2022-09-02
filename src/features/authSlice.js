import axios from "axios";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get("http://localhost:3030/users", {
        headers: {
          Authorization: `Bearer ${thunkAPI.getState().auth.token}`,
        },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/registerUser",
  async ({ email, password, name }, thunkAPI) => {
    try {
      const response = await axios.post("http://localhost:3030/register", {
        email,
        password,
        name,
      });
      if (response.data.error) {
        return thunkAPI.rejectWithValue(response.data.error);
      }
      return response.data;
    } catch (error) {
      console.log(1, error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const signIn = createAsyncThunk(
  "user/signIn",
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await axios.post("http://localhost:3030/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.tokens.accesToken);
      return res.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// export const logout = createAsyncThunk("user/logout", async (_, thunkAPI) => {
//   try {
//     const response = await axios.post("http://localhost:3030/logout");
//     console.log(response.data);
//     //   const { user, accesToken } = res.data;
//     // localStorage.setItem("token", res.data.accesToken);
//     return response.data;
//   } catch (error) {
//     console.log(error);
//     return thunkAPI.rejectWithValue(error.response.data.message);
//   }
// });

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: [],
    error: null,
    loading: false,
    token: localStorage.getItem("token"),
  },
  reducers: {
    deleteToken: (state, action) => {
      state.token = null;
    },
    deleteError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      // ===== Авторизация =====
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        // console.log(action.payload);
        state.token = action.payload.tokens.accesToken;
        state.myData = action.payload.user;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      });
  },
});

export const { deleteToken, deleteError } = userSlice.actions;
export default userSlice.reducer;
