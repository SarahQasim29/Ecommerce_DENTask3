import React, { useEffect, useState } from "react";
import { Carousel, Row, Col, Card, Space, Typography, message } from "antd";
import {
  EyeOutlined,
  ShoppingCartOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux"; // Removed dispatch import
import useProducts from "../_actions/productActions";
import banner1 from "../assets/images/banner1.jpg";
import banner2 from "../assets/images/banner2.jpg";
import banner3 from "../assets/images/banner3.jpg";
import ProductDetailsModal from "../components/Modals/ProductDetailsModal";
import ProductFilters from "../components/Filters/ProductFilters";
import useCarts from "../_actions/cartActions";
import { useDispatch } from "react-redux";

const contentStyle = {
  width: "100%",
  color: "#fff",
  lineHeight: "160px",
  textAlign: "center",
  background: "#364d79",
};

const { Text } = Typography;

const initialQuery = {
  skip: 0,
  filters: { price: { $gte: 4, $lte: 20 } },
};

function Home() {
  // Removed dispatch as it was not being used
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.product.productList);
  const { getProductList } = useProducts();
  const { addToCart } = useCarts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState(initialQuery);

  const handleShowProductDetails = (item) => {
    setSelectedProduct(item);
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const handleLoadMore = () => {
    const newQuery = {
      ...query,
      skip: query.skip + 8,
      loadMore: true,
    };
    setQuery(newQuery);
    getProductList(newQuery);
  };

  const handleSearchProduct = (filters) => {
    const newQuery = {
      skip: 0,
      filters,
    };
    setQuery(newQuery);
    getProductList(newQuery);
  };

  const handleClearSearchProduct = () => {
    setQuery(initialQuery);
    getProductList(initialQuery);
  };

  const handleAddToCart = (item) => {
    const data = {
      _productId: item._id,
      quantity: 1,
    };
    dispatch(addToCart(data)).then((res) => {
      if (res.payload.status) {
        message.success(res.payload.message);
      } else {
        message.error(res.payload.message);
      }
    });
  };

  useEffect(() => {
    getProductList(query);
  }, [getProductList, query]);

  const renderFilters = () => {
    return (
      <ProductFilters
        onSearch={handleSearchProduct}
        onClear={handleClearSearchProduct}
        initialFilters={initialQuery.filters}
      />
    );
  };

  const renderSlider = () => {
    return (
      <Carousel autoplay>
        <div>
          <img src={banner1} alt="" style={contentStyle} />
        </div>
        <div>
          <img src={banner2} alt="" style={contentStyle} />
        </div>
        <div>
          <img src={banner3} alt="" style={contentStyle} />
        </div>
      </Carousel>
    );
  };

  const renderProductList = () => {
    return (
      <Row gutter={[12, 12]} style={{ padding: 10 }}>
        {productList?.map((item, index) => (
          <Col key={index}>
            <Card
              hoverable
              cover={
                <img
                  alt="example"
                  src={item.image}
                  style={{
                    width: "100%",
                    height: "200px", // Adjust the height as needed
                    objectFit: "cover",
                  }}
                />
              }
              actions={[
                <EyeOutlined
                  key="view"
                  style={{ color: "orange", fontSize: 18 }}
                  onClick={() => handleShowProductDetails(item)}
                />,
                <ShoppingCartOutlined
                  key="cart"
                  style={{ color: "#b82837", fontSize: 18 }}
                  onClick={() => handleAddToCart(item)}
                />,
              ]}
            >
              <Space direction="vertical">
                <Text strong onClick={() => handleShowProductDetails(item)}>
                  {item?.name}
                </Text>
                <Text type="secondary">{item?._category?.name}</Text>
                <Text type="success">{item?.price}</Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div>
      {renderFilters()}
      {renderSlider()}
      {renderProductList()}
      <div className="product-load-more">
        {query?.skip <= productList?.length ? (
          <>
            <DownOutlined onClick={handleLoadMore} />
            <p>Load More</p>
          </>
        ) : (
          <p>No more product</p>
        )}
      </div>
      <ProductDetailsModal
        visible={showModal}
        product={selectedProduct}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default Home;
