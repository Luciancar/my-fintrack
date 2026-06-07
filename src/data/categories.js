export const CATEGORIES = [
  {
    id: 'food',
    label: 'Ăn & Ở',
    icon: '🍜',
    color: '#f97316',
    type: 'expense',
    description: 'Ăn uống, thuê nhà, điện nước'
  },
  {
    id: 'cafe',
    label: 'Cafe & Giải trí',
    icon: '☕',
    color: '#ec4899',
    type: 'expense',
    description: 'Cafe, trà sữa, xem phim, vui chơi'
  },
  {
    id: 'transport',
    label: 'Di chuyển',
    icon: '🚗',
    color: '#06b6d4',
    type: 'expense',
    description: 'Xăng xe, grab, xe buýt, taxi'
  },
  {
    id: 'personal',
    label: 'Cá nhân',
    icon: '🛍️',
    color: '#8b5cf6',
    type: 'expense',
    description: 'Quần áo, mỹ phẩm, sức khỏe, học tập'
  },
  {
    id: 'other_expense',
    label: 'Chi tiêu khác',
    icon: '📦',
    color: '#f59e0b',
    type: 'expense',
    description: 'Các khoản chi khác'
  },
  {
    id: 'salary',
    label: 'Lương',
    icon: '💼',
    color: '#10b981',
    type: 'income',
    description: 'Lương tháng, thưởng'
  },
  {
    id: 'freelance',
    label: 'Freelance',
    icon: '💻',
    color: '#06b6d4',
    type: 'income',
    description: 'Thu nhập từ công việc tự do'
  },
  {
    id: 'other_income',
    label: 'Thu nhập khác',
    icon: '💰',
    color: '#84cc16',
    type: 'income',
    description: 'Tiền thưởng, quà tặng, đầu tư'
  },
]

export const getCategoryById = (id) => CATEGORIES.find(c => c.id === id)
export const getExpenseCategories = () => CATEGORIES.filter(c => c.type === 'expense')
export const getIncomeCategories = () => CATEGORIES.filter(c => c.type === 'income')