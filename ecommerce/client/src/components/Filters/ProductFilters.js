import React, { useState, useEffect } from "react";
import {
  Button,
  Row,
  Col,
  Input,
  InputNumber,
  Slider,
  Typography,
  Select,
} from "antd";
import { CloseCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import useProducts from "../../_actions/productActions.js";

const { Text } = Typography;

function ProductFilters(props) {
  const { initialFilters, onSearch, onClear } = props;
  const [filters, setFilters] = useState(initialFilters);
  const [keyword, setKeyword] = useState(null);
  const { getCategoryList } = useProducts();
  const categoryList = useSelector((state) => state.product.categoryList);

  const handleKeywordChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    setFilters({
      ...filters,
      name: { $regex: value, $options: "i" },
    });
  };

  const handleSelectCategory = (value) => {
    setFilters({
      ...filters,
      _category: value,
    });
  };

  const handlePriceFromChange = (value) => {
    const price = { ...filters.price };
    price.$gte = value;
    setFilters({
      ...filters,
      price,
    });
  };

  const handlePriceToChange = (value) => {
    const price = { ...filters.price };
    price.$lte = value;
    setFilters({
      ...filters,
      price,
    });
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClearSearch = () => {
    setKeyword(null);
    setFilters(initialFilters);
    onClear();
  };

  useEffect(() => {
    getCategoryList();
  }, []);

  return (
    <Row
      gutter={[16, 16]}
      style={{
        padding: 20,
        background: "#f7f7f7",
        borderRadius: 8,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Col xs={24} sm={12} md={12} lg={6} xl={3} xxl={3}>
        <Input
          placeholder="Enter keyword"
          value={keyword}
          onChange={handleKeywordChange}
          style={{
            borderRadius: 5,
            borderColor: "#d9d9d9",
            transition: "all 0.3s ease",
          }}
        />
      </Col>
      <Col xs={24} sm={12} md={12} lg={6} xl={5} xxl={5}>
        <Select
          placeholder="Select Category"
          style={{ width: "70%", borderRadius: 5 }}
          value={filters._category}
          onChange={handleSelectCategory}
        >
          {categoryList?.map((category) => (
            <Select.Option key={category._id} value={category._id}>
              {category.name}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col
        xs={24}
        sm={12}
        md={12}
        lg={6}
        xl={6}
        xxl={6}
        style={{ marginLeft: "-35px" }}
      >
        <Row gutter={4} align="middle">
          <Col span={5}>
            <Text style={{ fontSize: 14, color: "#666" }}>Price From</Text>
          </Col>
          <Col span={13}>
            <Slider
              min={1}
              max={20}
              value={filters.price?.$gte}
              onChange={handlePriceFromChange}
              style={{ margin: "0 10px" }}
            />
          </Col>
          <Col span={6}>
            <InputNumber
              min={1}
              max={20}
              value={filters.price?.$gte}
              onChange={handlePriceFromChange}
              style={{ width: "100%", borderRadius: 5 }}
            />
          </Col>
        </Row>
      </Col>
      <Col xs={24} sm={12} md={12} lg={6} xl={6} xxl={6}>
        <Row gutter={4} align="middle">
          <Col span={5}>
            <Text style={{ fontSize: 14, color: "#666" }}>Price To</Text>
          </Col>
          <Col span={13}>
            <Slider
              min={1}
              max={20}
              value={filters.price?.$lte}
              onChange={handlePriceToChange}
              style={{ margin: "0 10px" }}
            />
          </Col>
          <Col span={6}>
            <InputNumber
              min={1}
              max={20}
              value={filters.price?.$lte}
              onChange={handlePriceToChange}
              style={{ width: "100%", borderRadius: 5 }}
            />
          </Col>
        </Row>
      </Col>
      <Col xs={24} sm={12} md={12} lg={6} xl={4} xxl={4}>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
          style={{ width: "100%", marginRight: 10, borderRadius: 5 }}
        >
          Search
        </Button>
        <Button
          type="default"
          icon={<CloseCircleOutlined />}
          onClick={handleClearSearch}
          style={{ width: "100%", borderRadius: 5 }}
        >
          Clear
        </Button>
      </Col>
    </Row>
  );
}

export default ProductFilters;
