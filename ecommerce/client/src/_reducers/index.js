import { combineReducers } from "redux";
import customerReducer from "./customerReducer";
import productReducer from "./productReducers";
import cartReducer from "./cartReducer";
import orderReducer from "./orderReducer";

const rootReducer = combineReducers({
  customer: customerReducer,
  product: productReducer,
  cart: cartReducer,
  order: orderReducer,
});

export default rootReducer;
