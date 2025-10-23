import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Lưu vào localStorage
import projectSlice from './slices/projectSlice';
import objectSlice from './slices/objectSlice';
import uiSlice from './slices/uiSlice';
import assetSlice from './slices/assetSlice';
import { useSelector, useDispatch } from 'react-redux';
import { combineReducers } from 'redux';

// Gộp reducer lại
const rootReducer = combineReducers({
  projects: projectSlice,
  objects: objectSlice,
  ui: uiSlice,
  assets: assetSlice,
});

// Cấu hình persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['projects', 'objects', 'assets'], 
  // chỉ lưu 3 slice này, ui thường chứa state tạm thời (hover, select) nên bỏ qua
};

// Tạo persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Tạo store
export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'ui/setHoveredMesh',
          'ui/setSelectedMesh',
          'persist/PERSIST', // ignore redux-persist actions
        ],
        ignoredPaths: ['ui.hoveredMesh', 'ui.selectedMesh'],
      },
    }),
});

// Tạo persistor (dùng để khởi động redux-persist)
export const persistor = persistStore(store);

// Custom hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
