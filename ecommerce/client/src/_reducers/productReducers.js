import {
  PRODUCT_LIST,
  PRODUCT_LIST_MORE,
  CATEGORY_LIST,
} from "../_actions/types";

const initialState = {
  productList: null,
  categoryList: null,
};

const productReducer = (state = initialState, action) => {
  switch (
    action.type // Corrected this line
  ) {
    case CATEGORY_LIST:
      return {
        ...state,
        categoryList: action.payload.data, // Ensure action.payload.data is properly structured
      };

    case PRODUCT_LIST:
      return {
        ...state,
        productList: action.payload.data, // Ensure action.payload.data is properly structured
      };

    case PRODUCT_LIST_MORE:
      return {
        ...state,
        productList: [...state.productList, ...action.payload.data], // Ensure action.payload.data is properly structured
      };

    default:
      return state;
  }
};

export default productReducer;
