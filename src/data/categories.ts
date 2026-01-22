
export const INCOME_CATEGORIES = [
  'Lương cứng (Chồng)',
  'Lương cứng (Vợ)',
  'Thưởng / Hoa hồng (Chồng)',
  'Thưởng / Hoa hồng (Vợ)',
  'Làm thêm / Freelance',
  'Lãi tiết kiệm / Đầu tư',
  'Thu nhập khác'
];

export const EXPENSE_CATEGORIES = [
  'Phí QL Chung cư / Điện / Nước / Net',
  'Đi chợ & Ăn uống gia đình',
  'Học phí & Học thêm (Bé 9t, 6t)',
  'Học phí Mầm non / Trông trẻ (Bé 1t)',
  'Bỉm sữa & Đồ dùng em bé',
  'Sức khỏe & Tiêm chủng',
  'Di chuyển & Gửi xe (Ô tô/Xe máy)',
  'Mua sắm vật dụng gia đình',
  'Vui chơi giải trí cuối tuần',
  'Hiếu hỉ & Quan hệ xã hội',
  'Bảo hiểm (Nhân thọ/Sức khỏe)',
  'Trả nợ vay',
  'Đầu tư / Tích lũy',
  'Chi tiêu cá nhân (Chồng)',
  'Chi tiêu cá nhân (Vợ)',
  'Khác'
];

export const INVESTMENT_CATEGORIES = [
  'Vàng Nhẫn Tròn (9999)',
  'Vàng Miếng (SJC)',
  'Quỹ mở (VCBF-MGF/TBF)',
  'Quỹ mở (Dragon Capital)',
  'Tiết kiệm Ngân hàng (Ngắn hạn)',
  'Tiết kiệm Ngân hàng (Dài hạn)',
  'Cổ phiếu (Tự doanh)',
  'Bất động sản',
  'Bảo hiểm liên kết đầu tư',
  'Khác'
];

export const OWNERS = [
  { id: 'shared', label: 'Chung', color: '#64748b' }, // Slate-500
  { id: 'husband', label: 'Chồng', color: '#3b82f6' }, // Blue-500
  { id: 'wife', label: 'Vợ', color: '#ec4899' }    // Pink-500
];

export const SAMPLE_DATA = {
  thoi_gian: new Date().toISOString().slice(0, 7),
  muc_tieu_tiet_kiem: 'Mua xe ô tô mới & Tích lũy quỹ học vấn (ĐH)',
  nguon_thu: [
    { category: 'Lương cứng (Chồng)', amount: 40000000 },
    { category: 'Lương cứng (Vợ)', amount: 28000000 },
    { category: 'Làm thêm / Freelance', amount: 5000000 }
  ],
  chi_tiet: [
    { category: 'Phí QL Chung cư / Điện / Nước / Net', amount: 3800000, owner: 'shared' },
    { category: 'Đi chợ & Ăn uống gia đình', amount: 13000000, owner: 'wife' },
    { category: 'Học phí & Học thêm (Bé 9t, 6t)', amount: 11000000, owner: 'shared' },
    { category: 'Học phí Mầm non / Trông trẻ (Bé 1t)', amount: 7000000, owner: 'shared' },
    { category: 'Bỉm sữa & Đồ dùng em bé', amount: 3500000, owner: 'wife' },
    { category: 'Di chuyển & Gửi xe (Ô tô/Xe máy)', amount: 3500000, owner: 'husband' },
    { category: 'Vui chơi giải trí cuối tuần', amount: 4000000, owner: 'husband' },
    { category: 'Sức khỏe & Tiêm chủng', amount: 2000000, owner: 'wife' },
    { category: 'Hiếu hỉ & Quan hệ xã hội', amount: 2500000, owner: 'shared' },
    { category: 'Chi tiêu cá nhân (Chồng)', amount: 4000000, owner: 'husband' },
    { category: 'Chi tiêu cá nhân (Vợ)', amount: 3000000, owner: 'wife' }
  ],
  danh_muc_dau_tu: [
    { category: 'Vàng Nhẫn Tròn (9999)', amount: 85000000, note: '10 chỉ, mua tích lũy dần' },
    { category: 'Quỹ mở (VCBF-MGF/TBF)', amount: 50000000, note: 'Tích lũy 3 năm nay' },
    { category: 'Tiết kiệm Ngân hàng (Dài hạn)', amount: 200000000, note: 'Dự phòng khẩn cấp' }
  ]
};
