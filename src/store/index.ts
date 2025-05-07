import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { baseApi } from '../services/api'
import { rtkQueryErrorLogger } from './middleware'
import { ENVIRONMENT } from '@/lib/constants'
import { notificationApi } from './services/notificationService'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    // Add other reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(notificationApi.middleware)
      .concat(rtkQueryErrorLogger),
  devTools: ENVIRONMENT !== 'production',
})

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 