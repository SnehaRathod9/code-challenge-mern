import React, { useEffect, useState } from "react";
import moment from "moment";
import { Table, Input, message, Image, Select } from "antd";
import axios from "axios";

const { Search } = Input;
const columns = [
  {
    title: "#",
    dataIndex: "id",
    width: "40px",
  },
  {
    title: "Title",
    dataIndex: "title",
    width: "200px",
  },
  {
    title: "Price",
    dataIndex: "price",
    render: (price) => parseFloat(price).toFixed(2),
    width: "80px",
  },
  {
    title: "Description",
    dataIndex: "description",
  },
  {
    title: "Category",
    dataIndex: "category",
    width: "120px",
  },
  {
    title: "Sold",
    dataIndex: "sold",
    render: (sold) => (sold ? "Yes" : "No"),
    width: "50px",
  },
  {
    title: "Date",
    dataIndex: "dateOfSale",
    render: (date) => moment(date).format("DD MMM YYYY"),
    width: "100px",
  },
  {
    title: "Image",
    dataIndex: "image",
    render: (url) => <Image src={url} alt="Product Image" />,
    width: "80px",
  },
];

const options = [
  "All Months",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
function Transactions({ month, monthText }) {
  let [month1, setMonth1] = useState(3);
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const getData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `https://roxiler-pvpf.onrender.com/transactions`,
        {
          params: {
            month,
            page: tableParams.pagination.current,
            limit: tableParams.pagination.pageSize,
            search: tableParams.search,
          },
        }
      );

      setData(data.transactions);
      setLoading(false);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: data.totalCount,
        },
      });
      message.success("Data loaded successfully");
    } catch (error) {
      console.log(error);
      message.error("Error loading data");
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      ...tableParams,
      pagination,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const handleSearch = (value) => {
    setTableParams({
      ...tableParams,
      search: value,
    });
  };

  useEffect(() => {
    getData();
  }, [JSON.stringify(tableParams), month]);

  const handleMonthChange = (value) => {
    setMonth1(parseInt(value));
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Search
          placeholder="Search"
          allowClear
          onSearch={handleSearch}
          style={{
            width: 300,
            padding: "12px 0px",
          }}
        />
        <Select
          size="large"
          defaultValue={options[month1]}
          onChange={handleMonthChange}
          style={{
            width: 200,
            marginTop: "10px",
         
          }}
          options={options.map((text, i) => {
            return {
              value: i,
              label: text,
            };
          })}
        />
      </div>

      <Table
        style={{ marginTop: "20px"}}
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={data}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
        size="small"
        bordered
        title={() => <strong>Transactions for {monthText}</strong>}
        scroll={{ y: 540 }}
      />
    </>
  );
}

export default Transactions;
