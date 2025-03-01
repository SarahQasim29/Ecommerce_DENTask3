import axios from "axios";
import { useDispatch } from "react-redux";
import { PRODUCT_LIST, PRODUCT_LIST_MORE, CATEGORY_LIST } from "./types";

export default function useProducts() {
  const dispatch = useDispatch();
  const getProductList = (query) => {
    const result = axios
      .post("/products", query)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.response.data;
      });

    if (query.loadMore) {
      dispatch({
        type: PRODUCT_LIST_MORE,
        payload: result,
      });
    } else {
      dispatch({
        type: PRODUCT_LIST,
        payload: result,
      });
    }
  };

  const getCategoryList = (query) => {
    const result = axios
      .get("/categories", query)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.response.data;
      });

    dispatch({
      type: CATEGORY_LIST,
      payload: result,
    });
  };

  return {
    getProductList,
    getCategoryList,
  };
}
