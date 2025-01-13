// public/js/orders.js
async function fetchOrders(page = 1, status = null) {
  try {
    const response = await axios.get("/api/orders", {
      params: { page, status },
    });

    const ordersData = response.data.data;

    // Xử lý dữ liệu từ API gốc
    const formattedOrders = ordersData.docs.map((order) => ({
      id: order.order_id,
      customer: order.user_id.username,
      totalAmount: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(order.total_amount),
      status: order.status,
      products: order.order_details
        .map(
          (detail) =>
            `${detail.product_id.product_name} (${detail.variant_id.color})`
        )
        .join(", "),
    }));

    renderOrderTable(formattedOrders);
    updatePagination({
      currentPage: ordersData.page,
      totalPages: ordersData.totalPages,
      totalOrders: ordersData.total,
    });
  } catch (error) {
    console.error("Lỗi tải đơn hàng:", error);
  }
}

function renderOrderTable(orders) {
  const tableBody = document.querySelector("#order-table tbody");
  tableBody.innerHTML = orders
    .map(
      (order) => `
    <tr>
      <td>${order.id}</td>
      <td>${order.customer}</td>
      <td>${order.products}</td>
      <td>${order.totalAmount}</td>
      <td>
        <span class="badge ${getStatusClass(order.status)}">
          ${order.status}
        </span>
      </td>
      <td>
        <a href="/orders/${order.id}" class="btn btn-sm btn-info">
          Chi Tiết
        </a>
      </td>
    </tr>
  `
    )
    .join("");
}

function getStatusClass(status) {
  const statusClasses = {
    Pending: "badge-warning",
    Processing: "badge-info",
    Shipped: "badge-primary",
    Delivered: "badge-success",
    Cancelled: "badge-danger",
  };
  return statusClasses[status] || "badge-secondary";
}

function updatePagination(pagination) {
  const paginationEl = document.querySelector(".pagination");
  paginationEl.innerHTML = `
    <span>Trang ${pagination.currentPage}/${pagination.totalPages}</span>
    <span>Tổng số đơn: ${pagination.totalOrders}</span>
  `;
}

// Sự kiện ban đầu
document.addEventListener("DOMContentLoaded", () => {
  const statusFilter = document.getElementById("status-filter");

  if (statusFilter) {
    statusFilter.addEventListener("change", (e) => {
      fetchOrders(1, e.target.value);
    });

    fetchOrders();
  }
});
