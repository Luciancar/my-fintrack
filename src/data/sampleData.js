import { format, subDays, subMonths } from 'date-fns'

const today = new Date()

export const generateSampleData = () => {
  const transactions = []
  let id = 1

  // Helper to create a transaction
  const tx = (daysAgo, categoryId, amount, note) => ({
    id: String(id++),
    date: format(subDays(today, daysAgo), 'yyyy-MM-dd'),
    categoryId,
    amount,
    note,
    type: ['food','cafe','transport','personal','other_expense'].includes(categoryId) ? 'expense' : 'income',
  })

  // This month
  transactions.push(
    tx(0, 'salary', 15000000, 'Lương tháng 6'),
    tx(1, 'food', 85000, 'Ăn trưa công ty'),
    tx(1, 'cafe', 55000, 'Cafe sáng với bạn'),
    tx(2, 'transport', 45000, 'Grab đi làm'),
    tx(2, 'food', 120000, 'Ăn tối cả nhà'),
    tx(3, 'personal', 350000, 'Mua sách'),
    tx(4, 'cafe', 75000, 'Trà sữa'),
    tx(4, 'food', 90000, 'Ăn sáng + trưa'),
    tx(5, 'transport', 200000, 'Đổ xăng'),
    tx(6, 'food', 250000, 'Đi ăn nhà hàng'),
    tx(7, 'personal', 180000, 'Mua mỹ phẩm'),
    tx(7, 'freelance', 3500000, 'Dự án thiết kế web'),
    tx(8, 'cafe', 45000, 'Cafe buổi chiều'),
    tx(9, 'transport', 60000, 'Grab cuối tuần'),
    tx(10, 'food', 110000, 'Đi chợ'),
    tx(11, 'other_expense', 500000, 'Hóa đơn điện'),
    tx(12, 'personal', 620000, 'Mua quần áo'),
    tx(13, 'cafe', 95000, 'Đi cafe làm việc'),
    tx(14, 'food', 75000, 'Ăn sáng cả tuần'),
    tx(15, 'transport', 150000, 'Vé xe bus tháng'),
  )

  // Last month
  transactions.push(
    tx(32, 'salary', 15000000, 'Lương tháng 5'),
    tx(33, 'food', 95000, 'Ăn trưa'),
    tx(33, 'cafe', 65000, 'Cafe với khách hàng'),
    tx(34, 'transport', 55000, 'Grab'),
    tx(35, 'food', 180000, 'Đi ăn cuối tuần'),
    tx(36, 'personal', 450000, 'Khám sức khỏe'),
    tx(37, 'freelance', 5000000, 'Dự án app mobile'),
    tx(38, 'cafe', 85000, 'Trà sữa & bánh'),
    tx(40, 'food', 300000, 'Mua thức ăn cả tuần'),
    tx(42, 'transport', 220000, 'Đổ xăng'),
    tx(44, 'other_expense', 350000, 'Hóa đơn nước'),
    tx(45, 'personal', 800000, 'Mua giày'),
    tx(47, 'food', 125000, 'Ăn trưa + cafe'),
    tx(50, 'other_income', 2000000, 'Tiền thưởng dự án'),
    tx(55, 'cafe', 55000, 'Cafe buổi sáng'),
    tx(58, 'transport', 80000, 'Taxi sân bay'),
  )

  // 2 months ago
  transactions.push(
    tx(62, 'salary', 14000000, 'Lương tháng 4'),
    tx(63, 'food', 85000, 'Ăn trưa'),
    tx(65, 'transport', 45000, 'Grab đi làm'),
    tx(67, 'personal', 1200000, 'Mua laptop phụ kiện'),
    tx(70, 'cafe', 75000, 'Cafe buổi sáng'),
    tx(72, 'food', 200000, 'Ăn tối gia đình'),
    tx(75, 'freelance', 4200000, 'Thiết kế logo'),
    tx(78, 'transport', 170000, 'Đổ xăng'),
    tx(80, 'other_expense', 600000, 'Tiền internet + điện thoại'),
    tx(82, 'personal', 350000, 'Mua sách học'),
    tx(85, 'food', 145000, 'Đi chợ'),
    tx(87, 'cafe', 60000, 'Trà sữa'),
  )

  return transactions.sort((a, b) => b.date.localeCompare(a.date))
}
